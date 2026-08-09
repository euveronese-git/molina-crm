export const FUNNEL_STAGES = [
  { id: "captacao", label: "Captação" },
  { id: "qualificacao", label: "Qualificação" },
  { id: "apresentacao", label: "Apresentação" },
  { id: "visita_plantao", label: "Visita / Plantão" },
  { id: "proposta_reserva", label: "Proposta / Reserva" },
  { id: "assinatura", label: "Assinatura" },
  { id: "pos_venda", label: "Pós-venda" },
] as const;

export type FunnelStatus = (typeof FUNNEL_STAGES)[number]["id"];

export type LeadOrigem =
  | "whatsapp"
  | "site"
  | "instagram"
  | "indicacao"
  | "outro";

export interface Lead {
  id: string;
  nome: string;
  contato: string;
  origem: LeadOrigem;
  orcamento: number | null;
  regiao_interesse: string | null;
  status_funil: FunnelStatus;
  notas: string | null;
  is_vip: boolean;
  /** false = triagem do bot concluída, pronto para contato humano */
  bot_ativo: boolean;
  external_source: string | null;
  external_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const ORIGEM_LABELS: Record<LeadOrigem, string> = {
  whatsapp: "WhatsApp",
  site: "Site",
  instagram: "Instagram",
  indicacao: "Indicação",
  outro: "Outro",
};

export type UnidadeStatus = "disponivel" | "reservado" | "vendido";
export type ParcelaStatus = "previsto" | "recebido";
export type DespesaStatus = "previsto" | "pago";
export type ComissaoTipo = "venda" | "avulsa";

export const DESPESA_CATEGORIAS = [
  { id: "marketing", label: "Marketing" },
  { id: "plantao", label: "Plantão / Stand" },
  { id: "deslocamento", label: "Deslocamento" },
  { id: "ferramentas", label: "Ferramentas / SaaS" },
  { id: "escritorio", label: "Escritório" },
  { id: "impostos", label: "Impostos / Taxas" },
  { id: "pessoal", label: "Pessoal" },
  { id: "outros", label: "Outros" },
] as const;

/** Preset ids + custom free-text categories */
export type DespesaCategoria =
  | (typeof DESPESA_CATEGORIAS)[number]["id"]
  | (string & {});

export interface Empreendimento {
  id: string;
  nome: string;
  construtora: string;
  endereco: string | null;
  created_at: string;
}

export interface Unidade {
  id: string;
  empreendimento_id: string;
  andar: number;
  numero: string;
  metragem: number | null;
  valor: number | null;
  status: UnidadeStatus;
  comprador_lead_id: string | null;
  planta_url: string | null;
  created_at: string;
}

export interface Comissao {
  id: string;
  unidade_id: string | null;
  lead_id: string | null;
  tipo: ComissaoTipo;
  descricao: string | null;
  valor_total: number;
  num_parcelas: number;
  created_at: string;
}

export interface ParcelaComissao {
  id: string;
  comissao_id: string;
  valor: number;
  data_prevista: string;
  status: ParcelaStatus;
  created_at: string;
}

export interface Despesa {
  id: string;
  descricao: string;
  categoria: DespesaCategoria;
  valor: number;
  data_vencimento: string;
  status: DespesaStatus;
  fornecedor: string | null;
  notas: string | null;
  recorrente: boolean;
  created_by: string | null;
  created_at: string;
}

export interface ComissaoDetalhada extends Comissao {
  unidade: Unidade | null;
  empreendimento: Empreendimento | null;
  lead: Lead | null;
  parcelas: ParcelaComissao[];
}

export type MensagemDirecao = "recebida" | "enviada";

export interface MensagemWhatsapp {
  id: string;
  lead_id: string;
  direcao: MensagemDirecao;
  conteudo: string;
  remetente: string | null;
  external_message_id: string | null;
  created_at: string;
}
