"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  Comissao,
  ComissaoTipo,
  Despesa,
  DespesaStatus,
  ParcelaComissao,
  ParcelaStatus,
} from "@/lib/types";

function revalidateFin() {
  revalidatePath("/financeiro");
  revalidatePath("/");
}

export async function markParcelaStatus(id: string, status: ParcelaStatus) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };
  const supabase = createClient();
  const { error } = await supabase
    .from("parcelas_comissao")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidateFin();
  return { ok: true as const };
}

export async function upsertDespesa(
  despesa: Omit<Despesa, "created_at" | "created_by"> & {
    id?: string;
    created_at?: string;
  }
) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };
  const supabase = createClient();
  const payload = {
    descricao: despesa.descricao,
    categoria: despesa.categoria,
    valor: despesa.valor,
    data_vencimento: despesa.data_vencimento,
    status: despesa.status,
    fornecedor: despesa.fornecedor,
    notas: despesa.notas,
    recorrente: despesa.recorrente,
  };
  const { error } = despesa.id
    ? await supabase.from("despesas").update(payload).eq("id", despesa.id)
    : await supabase.from("despesas").insert(payload);
  if (error) return { ok: false as const, error: error.message };
  revalidateFin();
  return { ok: true as const };
}

export async function deleteDespesa(id: string) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };
  const supabase = createClient();
  const { error } = await supabase.from("despesas").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidateFin();
  return { ok: true as const };
}

export async function markDespesaStatus(id: string, status: DespesaStatus) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };
  const supabase = createClient();
  const { error } = await supabase
    .from("despesas")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidateFin();
  return { ok: true as const };
}

export async function createComissaoWithParcelas(input: {
  tipo: ComissaoTipo;
  valor_total: number;
  num_parcelas: number;
  lead_id?: string | null;
  unidade_id?: string | null;
  descricao?: string | null;
  parcelas: Omit<ParcelaComissao, "id" | "comissao_id" | "created_at">[];
}) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };
  const supabase = createClient();
  const { data, error } = await supabase
    .from("comissoes")
    .insert({
      tipo: input.tipo,
      valor_total: input.valor_total,
      num_parcelas: input.num_parcelas,
      lead_id: input.lead_id ?? null,
      unidade_id: input.unidade_id ?? null,
      descricao: input.descricao ?? null,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false as const, error: error?.message };
  const rows = input.parcelas.map((p) => ({
    comissao_id: data.id,
    valor: p.valor,
    data_prevista: p.data_prevista,
    status: p.status,
  }));
  const { error: pErr } = await supabase.from("parcelas_comissao").insert(rows);
  if (pErr) return { ok: false as const, error: pErr.message };
  revalidateFin();
  return { ok: true as const, id: data.id as string };
}

export async function deleteComissao(id: string) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };
  const supabase = createClient();
  const { error } = await supabase.from("comissoes").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidateFin();
  return { ok: true as const };
}

export type { Comissao, Despesa };
