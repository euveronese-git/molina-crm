"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { FunnelStatus, Lead } from "@/lib/types";

function revalidateLeads() {
  revalidatePath("/pipeline");
  revalidatePath("/leads");
  revalidatePath("/");
}

export async function updateLeadStatus(id: string, status: FunnelStatus) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };

  const supabase = createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status_funil: status })
    .eq("id", id);

  if (error) return { ok: false as const, error: error.message };
  revalidateLeads();
  return { ok: true as const };
}

export async function createLead(input: {
  nome: string;
  contato: string;
  origem: Lead["origem"];
  orcamento: number | null;
  regiao_interesse: string | null;
  status_funil: FunnelStatus;
  notas: string | null;
  is_vip: boolean;
  bot_ativo?: boolean;
}) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      nome: input.nome,
      contato: input.contato,
      origem: input.origem,
      orcamento: input.orcamento,
      regiao_interesse: input.regiao_interesse,
      status_funil: input.status_funil,
      notas: input.notas,
      is_vip: input.is_vip,
      bot_ativo: input.bot_ativo ?? true,
    })
    .select("id")
    .single();

  if (error) return { ok: false as const, error: error.message };
  revalidateLeads();
  return { ok: true as const, id: data?.id as string };
}

export async function updateLead(id: string, patch: Partial<Lead>) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };

  const supabase = createClient();
  const payload: Record<string, unknown> = {};
  if (patch.nome !== undefined) payload.nome = patch.nome;
  if (patch.contato !== undefined) payload.contato = patch.contato;
  if (patch.origem !== undefined) payload.origem = patch.origem;
  if (patch.orcamento !== undefined) payload.orcamento = patch.orcamento;
  if (patch.regiao_interesse !== undefined)
    payload.regiao_interesse = patch.regiao_interesse;
  if (patch.status_funil !== undefined) payload.status_funil = patch.status_funil;
  if (patch.notas !== undefined) payload.notas = patch.notas;
  if (patch.is_vip !== undefined) payload.is_vip = patch.is_vip;
  if (patch.bot_ativo !== undefined) payload.bot_ativo = patch.bot_ativo;

  const { error } = await supabase.from("leads").update(payload).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidateLeads();
  return { ok: true as const };
}

export async function deleteLead(id: string) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };

  const supabase = createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidateLeads();
  return { ok: true as const };
}
