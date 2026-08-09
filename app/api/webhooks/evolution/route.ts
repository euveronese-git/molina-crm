import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * Evolution API webhook → grava mensagens e atualiza leads.
 *
 * Configure na Evolution:
 *   URL: https://<seu-dominio>/api/webhooks/evolution
 *   Header: x-webhook-secret: <EVOLUTION_WEBHOOK_SECRET>
 *
 * Payload esperado (flexível — aceita formatos comuns da Evolution):
 * {
 *   "event": "messages.upsert" | "MESSAGES_UPSERT" | ...,
 *   "data": {
 *     "key": { "id": "...", "fromMe": false, "remoteJid": "5521999...@s.whatsapp.net" },
 *     "message": { "conversation": "texto" } | { "extendedTextMessage": { "text": "..." } },
 *     "pushName": "Nome",
 *     "messageTimestamp": 1710000000
 *   },
 *   "bot_ativo": false,          // opcional — fim de triagem
 *   "triagem_completa": true     // alias
 * }
 */

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function normalizePhone(jidOrPhone: string): string {
  const digits = jidOrPhone.replace(/\D/g, "");
  return digits;
}

function extractText(message: Record<string, unknown> | undefined): string | null {
  if (!message) return null;
  if (typeof message.conversation === "string") return message.conversation;
  const ext = message.extendedTextMessage as { text?: string } | undefined;
  if (ext?.text) return ext.text;
  const img = message.imageMessage as { caption?: string } | undefined;
  if (img?.caption) return img.caption;
  return null;
}

export async function POST(request: NextRequest) {
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET;
  const header =
    request.headers.get("x-webhook-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (secret && header !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role not configured" },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Allow flat or nested Evolution payloads
  const data = (body.data as Record<string, unknown>) || body;
  const key = (data.key as Record<string, unknown>) || {};
  const remoteJid = String(key.remoteJid || data.remoteJid || body.phone || "");
  const fromMe = Boolean(key.fromMe ?? data.fromMe ?? false);
  const messageId =
    (key.id as string) ||
    (data.id as string) ||
    (body.external_message_id as string) ||
    null;
  const pushName =
    (data.pushName as string) ||
    (body.pushName as string) ||
    (body.nome as string) ||
    null;
  const messageObj =
    (data.message as Record<string, unknown>) ||
    (body.message as Record<string, unknown>);
  const text =
    extractText(messageObj) ||
    (typeof body.conteudo === "string" ? body.conteudo : null) ||
    (typeof data.text === "string" ? data.text : null);

  const phone = normalizePhone(remoteJid);
  if (!phone || !text) {
    return NextResponse.json(
      { ok: true, skipped: true, reason: "missing phone or text" },
      { status: 200 }
    );
  }

  const externalId = phone;
  const direcao = fromMe ? "enviada" : "recebida";

  // Find or create lead
  let leadId: string | null = null;
  const { data: existing } = await supabase
    .from("leads")
    .select("id, bot_ativo")
    .eq("external_source", "whatsapp_chatbot")
    .eq("external_id", externalId)
    .maybeSingle();

  if (existing?.id) {
    leadId = existing.id;
  } else {
    const { data: byContact } = await supabase
      .from("leads")
      .select("id")
      .ilike("contato", `%${phone.slice(-8)}%`)
      .limit(1)
      .maybeSingle();

    if (byContact?.id) {
      leadId = byContact.id;
      await supabase
        .from("leads")
        .update({
          external_source: "whatsapp_chatbot",
          external_id: externalId,
        })
        .eq("id", leadId);
    } else {
      const { data: created, error: createErr } = await supabase
        .from("leads")
        .insert({
          nome: pushName || `WhatsApp ${phone.slice(-4)}`,
          contato: phone,
          origem: "whatsapp",
          status_funil: "captacao",
          external_source: "whatsapp_chatbot",
          external_id: externalId,
          bot_ativo: true,
          is_vip: false,
        })
        .select("id")
        .single();
      if (createErr) {
        return NextResponse.json(
          { error: createErr.message },
          { status: 500 }
        );
      }
      leadId = created.id;
    }
  }

  // Insert message (idempotent on external_message_id)
  if (messageId) {
    const { data: dup } = await supabase
      .from("mensagens_whatsapp")
      .select("id")
      .eq("external_message_id", messageId)
      .maybeSingle();
    if (!dup) {
      await supabase.from("mensagens_whatsapp").insert({
        lead_id: leadId,
        direcao,
        conteudo: text,
        remetente: fromMe ? "Bot Molina" : pushName,
        external_message_id: messageId,
      });
    }
  } else {
    await supabase.from("mensagens_whatsapp").insert({
      lead_id: leadId,
      direcao,
      conteudo: text,
      remetente: fromMe ? "Bot Molina" : pushName,
    });
  }

  // End of triage → human takeover
  const triageDone =
    body.bot_ativo === false ||
    body.triagem_completa === true ||
    data.bot_ativo === false ||
    data.triagem_completa === true ||
    (typeof text === "string" &&
      /triagem conclu[ií]da|especialista .*contato/i.test(text) &&
      fromMe);

  if (triageDone && leadId) {
    await supabase.from("leads").update({ bot_ativo: false }).eq("id", leadId);
  }

  return NextResponse.json({ ok: true, lead_id: leadId });
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/webhooks/evolution",
    auth: "x-webhook-secret header",
  });
}
