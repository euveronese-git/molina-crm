import {
  DEMO_COMISSOES,
  DEMO_DESPESAS,
  DEMO_EMPREENDIMENTOS,
  DEMO_LEADS,
  DEMO_MENSAGENS_WHATSAPP,
  DEMO_PARCELAS,
  DEMO_UNIDADES,
} from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type {
  Comissao,
  Despesa,
  Empreendimento,
  Lead,
  MensagemWhatsapp,
  ParcelaComissao,
  Unidade,
} from "@/lib/types";

export type CrmSnapshot = {
  demoMode: boolean;
  leads: Lead[];
  empreendimentos: Empreendimento[];
  unidades: Unidade[];
  comissoes: Comissao[];
  parcelas: ParcelaComissao[];
  despesas: Despesa[];
  mensagens: MensagemWhatsapp[];
};

const DEMO_SNAPSHOT: CrmSnapshot = {
  demoMode: true,
  leads: DEMO_LEADS,
  empreendimentos: DEMO_EMPREENDIMENTOS,
  unidades: DEMO_UNIDADES,
  comissoes: DEMO_COMISSOES,
  parcelas: DEMO_PARCELAS,
  despesas: DEMO_DESPESAS,
  mensagens: DEMO_MENSAGENS_WHATSAPP,
};

export async function loadCrmSnapshot(): Promise<CrmSnapshot> {
  if (!isSupabaseConfigured()) {
    return DEMO_SNAPSHOT;
  }

  const supabase = createClient();

  const [
    leadsRes,
    empRes,
    unidadesRes,
    comissoesRes,
    parcelasRes,
    despesasRes,
    mensagensRes,
  ] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase
      .from("empreendimentos")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("unidades")
      .select("*")
      .order("andar", { ascending: true }),
    supabase
      .from("comissoes")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("parcelas_comissao")
      .select("*")
      .order("data_prevista", { ascending: true }),
    supabase
      .from("despesas")
      .select("*")
      .order("data_vencimento", { ascending: false }),
    supabase
      .from("mensagens_whatsapp")
      .select("*")
      .order("created_at", { ascending: true }),
  ]);

  if (
    leadsRes.error ||
    empRes.error ||
    unidadesRes.error ||
    comissoesRes.error ||
    parcelasRes.error ||
    despesasRes.error ||
    mensagensRes.error
  ) {
    console.error("loadCrmSnapshot errors", {
      leads: leadsRes.error?.message,
      empreendimentos: empRes.error?.message,
      unidades: unidadesRes.error?.message,
      comissoes: comissoesRes.error?.message,
      parcelas: parcelasRes.error?.message,
      despesas: despesasRes.error?.message,
      mensagens: mensagensRes.error?.message,
    });
    return DEMO_SNAPSHOT;
  }

  return {
    demoMode: false,
    leads: (leadsRes.data ?? []) as Lead[],
    empreendimentos: (empRes.data ?? []) as Empreendimento[],
    unidades: (unidadesRes.data ?? []) as Unidade[],
    comissoes: (comissoesRes.data ?? []) as Comissao[],
    parcelas: (parcelasRes.data ?? []) as ParcelaComissao[],
    despesas: (despesasRes.data ?? []) as Despesa[],
    mensagens: (mensagensRes.data ?? []) as MensagemWhatsapp[],
  };
}

export async function loadLeads(): Promise<{
  leads: Lead[];
  mensagens: MensagemWhatsapp[];
  demoMode: boolean;
}> {
  const snap = await loadCrmSnapshot();
  return {
    leads: snap.leads,
    mensagens: snap.mensagens,
    demoMode: snap.demoMode,
  };
}
