"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Empreendimento, Unidade, UnidadeStatus } from "@/lib/types";

function revalidateEmp() {
  revalidatePath("/empreendimentos");
  revalidatePath("/");
}

export async function createEmpreendimento(
  input: Pick<Empreendimento, "nome" | "construtora" | "endereco">
) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };
  const supabase = createClient();
  const { data, error } = await supabase
    .from("empreendimentos")
    .insert(input)
    .select("id")
    .single();
  if (error) return { ok: false as const, error: error.message };
  revalidateEmp();
  return { ok: true as const, id: data?.id as string };
}

export async function updateEmpreendimento(
  id: string,
  patch: Partial<Pick<Empreendimento, "nome" | "construtora" | "endereco">>
) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };
  const supabase = createClient();
  const { error } = await supabase.from("empreendimentos").update(patch).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidateEmp();
  return { ok: true as const };
}

export async function deleteEmpreendimento(id: string) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };
  const supabase = createClient();
  const { error } = await supabase.from("empreendimentos").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidateEmp();
  return { ok: true as const };
}

export async function createUnidade(
  input: Omit<Unidade, "id" | "created_at" | "planta_url"> & { planta_url?: string | null }
) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };
  const supabase = createClient();
  const { data, error } = await supabase
    .from("unidades")
    .insert({
      empreendimento_id: input.empreendimento_id,
      andar: input.andar,
      numero: input.numero,
      metragem: input.metragem,
      valor: input.valor,
      status: input.status,
      comprador_lead_id: input.comprador_lead_id,
      planta_url: input.planta_url ?? null,
    })
    .select("id")
    .single();
  if (error) return { ok: false as const, error: error.message };
  revalidateEmp();
  return { ok: true as const, id: data?.id as string };
}

export async function updateUnidade(
  id: string,
  patch: Partial<{
    andar: number;
    numero: string;
    metragem: number | null;
    valor: number | null;
    status: UnidadeStatus;
    comprador_lead_id: string | null;
  }>
) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };
  const supabase = createClient();
  const { error } = await supabase.from("unidades").update(patch).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidateEmp();
  return { ok: true as const };
}

export async function deleteUnidade(id: string) {
  if (!isSupabaseConfigured()) return { ok: true as const, demo: true };
  const supabase = createClient();
  const { error } = await supabase.from("unidades").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidateEmp();
  return { ok: true as const };
}
