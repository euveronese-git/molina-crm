/**
 * Edge Function: whatsapp-webhook
 *
 * Recebe POST do chatbot WhatsApp (projeto separado / Evolution) com JSON
 * simplificado e grava leads + mensagens_whatsapp no Supabase.
 *
 * URL:
 *   https://<PROJECT_REF>.supabase.co/functions/v1/whatsapp-webhook
 *
 * Headers obrigatórios:
 *   Authorization: Bearer <ANON_KEY>   (gateway Supabase)
 *   X-Webhook-Secret: <WEBHOOK_SECRET> (secret da function)
 *   Content-Type: application/json
 *
 * Secret: configure WEBHOOK_SECRET no painel Supabase
 *   (Project Settings → Edge Functions → Secrets)
 *   ou: npx supabase secrets set WEBHOOK_SECRET="..." --project-ref <REF>
 *
 * Payload:
 * {
 *   "telefone": string,
 *   "nome": string (opcional),
 *   "mensagem": {
 *     "conteudo": string,
 *     "direcao": "recebida" | "enviada",
 *     "timestamp": string
 *   },
 *   "triagem_completa": boolean (opcional),
 *   "dados_triagem": {
 *     "orcamento": string,
 *     "regiao_interesse": string
 *   } (opcional, quando triagem_completa = true)
 * }
 */

import { createClient } from "@supabase/supabase-js";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type MensagemDirecao = "recebida" | "enviada";

interface WebhookBody {
  telefone?: string;
  nome?: string;
  mensagem?: {
    conteudo?: string;
    direcao?: string;
    timestamp?: string;
  };
  triagem_completa?: boolean;
  dados_triagem?: {
    orcamento?: string;
    regiao_interesse?: string;
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

/** Parse "R$ 1.200.000" / "1200000" / "1.200.000,50" → number or null */
function parseOrcamento(raw: string | undefined): number | null {
  if (!raw || !raw.trim()) return null;
  const cleaned = raw
    .trim()
    .replace(/[R$\s]/gi, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function isValidTimestamp(value: string | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
  if (!webhookSecret) {
    return jsonResponse(
      { error: "WEBHOOK_SECRET not configured" },
      503,
    );
  }

  // Prefer X-Webhook-Secret. Bearer fallback only when that header is absent
  // (local calls). With the Supabase gateway, always send X-Webhook-Secret —
  // Authorization will be the anon key and must not be treated as the secret.
  const xSecret = req.headers.get("x-webhook-secret");
  if (xSecret !== null) {
    if (xSecret !== webhookSecret) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
  } else {
    const bearer = req.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "");
    if (!bearer || bearer !== webhookSecret) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(
      { error: "Supabase service role not configured" },
      503,
    );
  }

  let body: WebhookBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const telefone = normalizePhone(String(body.telefone ?? ""));
  const conteudo = body.mensagem?.conteudo?.trim() ?? "";
  const direcao = body.mensagem?.direcao as MensagemDirecao | undefined;

  if (!telefone) {
    return jsonResponse({ error: "telefone is required" }, 400);
  }
  if (!conteudo) {
    return jsonResponse({ error: "mensagem.conteudo is required" }, 400);
  }
  if (direcao !== "recebida" && direcao !== "enviada") {
    return jsonResponse(
      { error: 'mensagem.direcao must be "recebida" or "enviada"' },
      400,
    );
  }

  const nome =
    (typeof body.nome === "string" && body.nome.trim()) || telefone;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Find lead by WhatsApp identity
  const { data: existing, error: findErr } = await supabase
    .from("leads")
    .select("id")
    .eq("external_source", "whatsapp_chatbot")
    .eq("external_id", telefone)
    .maybeSingle();

  if (findErr) {
    return jsonResponse({ error: findErr.message }, 500);
  }

  let leadId: string;

  if (existing?.id) {
    leadId = existing.id;
  } else {
    const { data: created, error: createErr } = await supabase
      .from("leads")
      .insert({
        nome,
        contato: telefone,
        origem: "whatsapp",
        status_funil: "captacao",
        external_source: "whatsapp_chatbot",
        external_id: telefone,
        bot_ativo: true,
        is_vip: false,
      })
      .select("id")
      .single();

    if (createErr || !created?.id) {
      return jsonResponse(
        { error: createErr?.message ?? "Failed to create lead" },
        500,
      );
    }
    leadId = created.id;
  }

  const createdAt = isValidTimestamp(body.mensagem?.timestamp);
  const messageRow: Record<string, unknown> = {
    lead_id: leadId,
    direcao,
    conteudo,
  };
  if (createdAt) {
    messageRow.created_at = createdAt;
  }

  const { error: msgErr } = await supabase
    .from("mensagens_whatsapp")
    .insert(messageRow);

  if (msgErr) {
    return jsonResponse({ error: msgErr.message }, 500);
  }

  if (body.triagem_completa === true) {
    const triage = body.dados_triagem ?? {};
    const update: Record<string, unknown> = {
      bot_ativo: false,
    };
    if (typeof triage.regiao_interesse === "string") {
      update.regiao_interesse = triage.regiao_interesse;
    }
    if (typeof triage.orcamento === "string") {
      update.orcamento = parseOrcamento(triage.orcamento);
    }

    const { error: updErr } = await supabase
      .from("leads")
      .update(update)
      .eq("id", leadId);

    if (updErr) {
      return jsonResponse({ error: updErr.message }, 500);
    }
  }

  return jsonResponse({ lead_id: leadId }, 200);
});
