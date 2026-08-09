import type {
  Comissao,
  ComissaoDetalhada,
  Despesa,
  Empreendimento,
  Lead,
  MensagemWhatsapp,
  ParcelaComissao,
  Unidade,
} from "@/lib/types";

/** Demo leads for local preview when Supabase is not configured */
export const DEMO_LEADS: Lead[] = [
  {
    id: "demo-1",
    nome: "Ana Beatriz Carvalho",
    contato: "(21) 98877-1100",
    origem: "instagram",
    orcamento: 4500000,
    regiao_interesse: "Península",
    status_funil: "captacao",
    notas: "Viu stories do Artencena. Quer 3 suítes.",
    is_vip: true,
    bot_ativo: true,
    external_source: null,
    external_id: null,
    created_by: null,
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-01T10:00:00Z",
  },
  {
    id: "demo-2",
    nome: "Ricardo Mendes",
    contato: "(21) 97111-2233",
    origem: "whatsapp",
    orcamento: 2800000,
    regiao_interesse: "Jardim Oceânico",
    status_funil: "captacao",
    notas: "Lead via chatbot WhatsApp (placeholder).",
    is_vip: false,
    bot_ativo: false,
    external_source: "whatsapp_chatbot",
    external_id: "wa-8821",
    created_by: null,
    created_at: "2026-08-02T14:20:00Z",
    updated_at: "2026-08-02T14:20:00Z",
  },
  {
    id: "demo-3",
    nome: "Família Albuquerque",
    contato: "(21) 99900-4455",
    origem: "indicacao",
    orcamento: 12000000,
    regiao_interesse: "Golf Club",
    status_funil: "qualificacao",
    notas: "Indicação do cliente Silva. Interesse em mansão.",
    is_vip: true,
    bot_ativo: true,
    external_source: null,
    external_id: null,
    created_by: null,
    created_at: "2026-07-28T09:00:00Z",
    updated_at: "2026-08-03T11:00:00Z",
  },
  {
    id: "demo-4",
    nome: "Camila Torres",
    contato: "(21) 98222-6677",
    origem: "site",
    orcamento: 1900000,
    regiao_interesse: "Parque das Rosas",
    status_funil: "qualificacao",
    notas: "Formulário do site — lançamento na planta.",
    is_vip: false,
    bot_ativo: true,
    external_source: null,
    external_id: null,
    created_by: null,
    created_at: "2026-08-04T16:00:00Z",
    updated_at: "2026-08-04T16:00:00Z",
  },
  {
    id: "demo-5",
    nome: "Eduardo Prado",
    contato: "(21) 97766-8899",
    origem: "whatsapp",
    orcamento: 6200000,
    regiao_interesse: "Lúcio Costa",
    status_funil: "apresentacao",
    notas: "Apresentar tabela do CEO Corporate + cobertura.",
    is_vip: false,
    bot_ativo: true,
    external_source: null,
    external_id: null,
    created_by: null,
    created_at: "2026-07-20T12:00:00Z",
    updated_at: "2026-08-05T09:30:00Z",
  },
  {
    id: "demo-6",
    nome: "Sofia Hartmann",
    contato: "(21) 96655-1212",
    origem: "instagram",
    orcamento: 8500000,
    regiao_interesse: "Frente Mar",
    status_funil: "visita_plantao",
    notas: "Plantão sábado 10h — Artencena.",
    is_vip: true,
    bot_ativo: true,
    external_source: null,
    external_id: null,
    created_by: null,
    created_at: "2026-07-15T08:00:00Z",
    updated_at: "2026-08-06T10:00:00Z",
  },
  {
    id: "demo-7",
    nome: "Bruno Oliveira",
    contato: "(21) 95544-3344",
    origem: "indicacao",
    orcamento: 3200000,
    regiao_interesse: "Barra da Tijuca",
    status_funil: "visita_plantao",
    notas: null,
    is_vip: false,
    bot_ativo: true,
    external_source: null,
    external_id: null,
    created_by: null,
    created_at: "2026-07-25T15:00:00Z",
    updated_at: "2026-08-06T15:00:00Z",
  },
  {
    id: "demo-8",
    nome: "Patricia & João Lima",
    contato: "(21) 94433-5566",
    origem: "whatsapp",
    orcamento: 5100000,
    regiao_interesse: "Alphaville",
    status_funil: "proposta_reserva",
    notas: "Proposta unidade 1204 — aguardando sinal.",
    is_vip: true,
    bot_ativo: true,
    external_source: null,
    external_id: null,
    created_by: null,
    created_at: "2026-07-10T11:00:00Z",
    updated_at: "2026-08-07T08:00:00Z",
  },
  {
    id: "demo-9",
    nome: "Investidor HK Partners",
    contato: "(21) 93322-7788",
    origem: "outro",
    orcamento: 15000000,
    regiao_interesse: "Av. Ayrton Senna",
    status_funil: "proposta_reserva",
    notas: "Interesse em lajes corporativas — 2 unidades.",
    is_vip: true,
    bot_ativo: true,
    external_source: null,
    external_id: null,
    created_by: null,
    created_at: "2026-06-30T10:00:00Z",
    updated_at: "2026-08-05T17:00:00Z",
  },
  {
    id: "demo-10",
    nome: "Marina Costa",
    contato: "(21) 92211-9900",
    origem: "site",
    orcamento: 2400000,
    regiao_interesse: "Recreio",
    status_funil: "assinatura",
    notas: "Cartório agendado para dia 12.",
    is_vip: false,
    bot_ativo: true,
    external_source: null,
    external_id: null,
    created_by: null,
    created_at: "2026-06-01T09:00:00Z",
    updated_at: "2026-08-01T12:00:00Z",
  },
  {
    id: "demo-11",
    nome: "Carlos Eugênio",
    contato: "(21) 91100-1122",
    origem: "indicacao",
    orcamento: 7800000,
    regiao_interesse: "São Conrado",
    status_funil: "pos_venda",
    notas: "Entrega de chaves OK. Follow-up NPS.",
    is_vip: true,
    bot_ativo: true,
    external_source: null,
    external_id: null,
    created_by: null,
    created_at: "2026-05-01T09:00:00Z",
    updated_at: "2026-07-20T09:00:00Z",
  },
  {
    id: "demo-12",
    nome: "Helena Duarte",
    contato: "(21) 98800-3344",
    origem: "whatsapp",
    orcamento: 1600000,
    regiao_interesse: "Parque das Rosas",
    status_funil: "captacao",
    notas: "Primeiro contato — orçamento flexível.",
    is_vip: false,
    bot_ativo: false,
    external_source: "whatsapp_chatbot",
    external_id: "wa-9102",
    created_by: null,
    created_at: "2026-08-07T18:00:00Z",
    updated_at: "2026-08-07T18:00:00Z",
  },
];

export const DEMO_EMPREENDIMENTOS: Empreendimento[] = [
  {
    id: "emp-1",
    nome: "Artencena Design Residences",
    construtora: "Artencena",
    endereco: "Parque das Rosas · Barra da Tijuca",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "emp-2",
    nome: "CEO Corporate Executive Offices",
    construtora: "CEO Incorporações",
    endereco: "Av. Ayrton Senna · Barra da Tijuca",
    created_at: "2026-02-01T10:00:00Z",
  },
  {
    id: "emp-3",
    nome: "Ocean Club Residences",
    construtora: "Cyrela",
    endereco: "Jardim Oceânico · Barra da Tijuca",
    created_at: "2026-03-15T10:00:00Z",
  },
];

function buildUnidades(): Unidade[] {
  const units: Unidade[] = [];
  // Artencena — andares 8-12, unidades 01-04
  for (let andar = 8; andar <= 12; andar++) {
    for (let n = 1; n <= 4; n++) {
      const numero = `${andar}0${n}`;
      const id = `uni-art-${numero}`;
      let status: Unidade["status"] = "disponivel";
      let comprador: string | null = null;
      if (numero === "1002") {
        status = "vendido";
        comprador = "demo-11";
      } else if (numero === "1204") {
        status = "reservado";
        comprador = "demo-8";
      } else if (numero === "901") {
        status = "vendido";
        comprador = "demo-10";
      } else if (numero === "1103") {
        status = "reservado";
        comprador = "demo-6";
      }
      units.push({
        id,
        empreendimento_id: "emp-1",
        andar,
        numero,
        metragem: 120 + n * 8,
        valor: 1800000 + andar * 50000 + n * 25000,
        status,
        comprador_lead_id: comprador,
        planta_url: null,
        created_at: "2026-01-15T10:00:00Z",
      });
    }
  }
  // CEO — andares 2-5, lajes 01-02
  for (let andar = 2; andar <= 5; andar++) {
    for (let n = 1; n <= 2; n++) {
      const numero = `${andar}0${n}`;
      const id = `uni-ceo-${numero}`;
      let status: Unidade["status"] = "disponivel";
      let comprador: string | null = null;
      if (numero === "301") {
        status = "vendido";
        comprador = "demo-9";
      } else if (numero === "402") {
        status = "reservado";
        comprador = "demo-5";
      }
      units.push({
        id,
        empreendimento_id: "emp-2",
        andar,
        numero,
        metragem: 280 + n * 20,
        valor: null,
        status,
        comprador_lead_id: comprador,
        planta_url: null,
        created_at: "2026-02-10T10:00:00Z",
      });
    }
  }
  // Ocean Club — andares 10-14, 01-03
  for (let andar = 10; andar <= 14; andar++) {
    for (let n = 1; n <= 3; n++) {
      const numero = `${andar}0${n}`;
      const id = `uni-oc-${numero}`;
      let status: Unidade["status"] = "disponivel";
      let comprador: string | null = null;
      if (numero === "1201") {
        status = "vendido";
        comprador = "demo-3";
      }
      units.push({
        id,
        empreendimento_id: "emp-3",
        andar,
        numero,
        metragem: 95 + n * 15,
        valor: 3200000 + andar * 40000,
        status,
        comprador_lead_id: comprador,
        planta_url: null,
        created_at: "2026-03-20T10:00:00Z",
      });
    }
  }
  return units;
}

export const DEMO_UNIDADES = buildUnidades();

export const DEMO_COMISSOES: Comissao[] = [
  {
    id: "com-1",
    unidade_id: "uni-art-1002",
    lead_id: "demo-11",
    tipo: "venda",
    descricao: null,
    valor_total: 156000,
    num_parcelas: 3,
    created_at: "2026-07-20T10:00:00Z",
  },
  {
    id: "com-2",
    unidade_id: "uni-art-901",
    lead_id: "demo-10",
    tipo: "venda",
    descricao: null,
    valor_total: 48000,
    num_parcelas: 2,
    created_at: "2026-08-01T10:00:00Z",
  },
  {
    id: "com-3",
    unidade_id: "uni-ceo-301",
    lead_id: "demo-9",
    tipo: "venda",
    descricao: null,
    valor_total: 92000,
    num_parcelas: 4,
    created_at: "2026-06-15T10:00:00Z",
  },
  {
    id: "com-4",
    unidade_id: "uni-oc-1201",
    lead_id: "demo-3",
    tipo: "venda",
    descricao: null,
    valor_total: 210000,
    num_parcelas: 3,
    created_at: "2026-05-10T10:00:00Z",
  },
];

export const DEMO_PARCELAS: ParcelaComissao[] = [
  // com-1 Carlos — 3x
  { id: "par-1a", comissao_id: "com-1", valor: 52000, data_prevista: "2026-06-15", status: "recebido", created_at: "2026-07-20T10:00:00Z" },
  { id: "par-1b", comissao_id: "com-1", valor: 52000, data_prevista: "2026-07-15", status: "recebido", created_at: "2026-07-20T10:00:00Z" },
  { id: "par-1c", comissao_id: "com-1", valor: 52000, data_prevista: "2026-08-15", status: "previsto", created_at: "2026-07-20T10:00:00Z" },
  // com-2 Marina — 2x
  { id: "par-2a", comissao_id: "com-2", valor: 24000, data_prevista: "2026-08-05", status: "recebido", created_at: "2026-08-01T10:00:00Z" },
  { id: "par-2b", comissao_id: "com-2", valor: 24000, data_prevista: "2026-09-05", status: "previsto", created_at: "2026-08-01T10:00:00Z" },
  // com-3 HK — 4x
  { id: "par-3a", comissao_id: "com-3", valor: 23000, data_prevista: "2026-04-01", status: "recebido", created_at: "2026-06-15T10:00:00Z" },
  { id: "par-3b", comissao_id: "com-3", valor: 23000, data_prevista: "2026-05-01", status: "recebido", created_at: "2026-06-15T10:00:00Z" },
  { id: "par-3c", comissao_id: "com-3", valor: 23000, data_prevista: "2026-06-01", status: "recebido", created_at: "2026-06-15T10:00:00Z" },
  { id: "par-3d", comissao_id: "com-3", valor: 23000, data_prevista: "2026-09-01", status: "previsto", created_at: "2026-06-15T10:00:00Z" },
  // com-4 Albuquerque — 3x
  { id: "par-4a", comissao_id: "com-4", valor: 70000, data_prevista: "2026-03-20", status: "recebido", created_at: "2026-05-10T10:00:00Z" },
  { id: "par-4b", comissao_id: "com-4", valor: 70000, data_prevista: "2026-05-20", status: "recebido", created_at: "2026-05-10T10:00:00Z" },
  { id: "par-4c", comissao_id: "com-4", valor: 70000, data_prevista: "2026-08-20", status: "previsto", created_at: "2026-05-10T10:00:00Z" },
];

export const DEMO_DESPESAS: Despesa[] = [
  { id: "des-1", descricao: "Meta Ads — campanha lançamentos agosto", categoria: "marketing", valor: 4500, data_vencimento: "2026-08-05", status: "pago", fornecedor: "Meta", notas: null, created_by: null, created_at: "2026-08-01T10:00:00Z", recorrente: false },
  { id: "des-2", descricao: "Plantão Artencena — sábado", categoria: "plantao", valor: 800, data_vencimento: "2026-08-09", status: "previsto", fornecedor: null, notas: "Stand + coffee", created_by: null, created_at: "2026-08-02T10:00:00Z", recorrente: false },
  { id: "des-3", descricao: "Combustível / Uber plantões", categoria: "deslocamento", valor: 620, data_vencimento: "2026-08-07", status: "pago", fornecedor: null, notas: null, created_by: null, created_at: "2026-08-03T10:00:00Z", recorrente: false },
  { id: "des-4", descricao: "WhatsApp Business + CRM tools", categoria: "ferramentas", valor: 289, data_vencimento: "2026-08-01", status: "pago", fornecedor: "Meta / Supabase", notas: null, created_by: null, created_at: "2026-07-28T10:00:00Z", recorrente: true },
  { id: "des-5", descricao: "Coworking Av. Ayrton Senna", categoria: "escritorio", valor: 1800, data_vencimento: "2026-08-10", status: "previsto", fornecedor: "Office Premium", notas: "Mensalidade", created_by: null, created_at: "2026-08-01T10:00:00Z", recorrente: true },
  { id: "des-6", descricao: "DAS / estimativa tributária", categoria: "impostos", valor: 3200, data_vencimento: "2026-08-20", status: "previsto", fornecedor: "Contador", notas: null, created_by: null, created_at: "2026-08-01T10:00:00Z", recorrente: false },
  { id: "des-7", descricao: "Assistente comercial — pró-labore parcial", categoria: "pessoal", valor: 2500, data_vencimento: "2026-08-05", status: "pago", fornecedor: null, notas: null, created_by: null, created_at: "2026-08-01T10:00:00Z", recorrente: false },
  { id: "des-8", descricao: "Material impresso tabelas", categoria: "outros", valor: 340, data_vencimento: "2026-07-15", status: "pago", fornecedor: "Gráfica BT", notas: null, created_by: null, created_at: "2026-07-10T10:00:00Z", recorrente: false },
  { id: "des-9", descricao: "Instagram boost — Ocean Club", categoria: "marketing", valor: 2100, data_vencimento: "2026-07-20", status: "pago", fornecedor: "Meta", notas: null, created_by: null, created_at: "2026-07-18T10:00:00Z", recorrente: false },
  { id: "des-10", descricao: "Plantão CEO Corporate", categoria: "plantao", valor: 650, data_vencimento: "2026-07-12", status: "pago", fornecedor: null, notas: null, created_by: null, created_at: "2026-07-10T10:00:00Z", recorrente: false },
  { id: "des-11", descricao: "Assinatura Canva Pro + Notion", categoria: "ferramentas", valor: 120, data_vencimento: "2026-06-01", status: "pago", fornecedor: null, notas: null, created_by: null, created_at: "2026-06-01T10:00:00Z", recorrente: true },
  { id: "des-12", descricao: "Fotógrafo tour lançamento", categoria: "marketing", valor: 1500, data_vencimento: "2026-06-18", status: "pago", fornecedor: "Studio Lux", notas: null, created_by: null, created_at: "2026-06-15T10:00:00Z", recorrente: false },
];

/** Threads demo — leads demo-2 e demo-12 (chatbot, prontos para humano) */
export const DEMO_MENSAGENS_WHATSAPP: MensagemWhatsapp[] = [
  {
    id: "msg-2-1",
    lead_id: "demo-2",
    direcao: "recebida",
    conteudo: "Olá, vi o anúncio do Artencena. Queria saber valores de 3 suítes.",
    remetente: "Ricardo Mendes",
    external_message_id: "evo-1001",
    created_at: "2026-08-02T14:21:00Z",
  },
  {
    id: "msg-2-2",
    lead_id: "demo-2",
    direcao: "enviada",
    conteudo:
      "Olá Ricardo! Sou o assistente da Molina. As unidades de 3 suítes partem de R$ 1,89M. Qual região da Barra te interessa mais?",
    remetente: "Bot Molina",
    external_message_id: "evo-1002",
    created_at: "2026-08-02T14:21:30Z",
  },
  {
    id: "msg-2-3",
    lead_id: "demo-2",
    direcao: "recebida",
    conteudo: "Jardim Oceânico. Orçamento até uns 3 milhões.",
    remetente: "Ricardo Mendes",
    external_message_id: "evo-1003",
    created_at: "2026-08-02T14:23:00Z",
  },
  {
    id: "msg-2-4",
    lead_id: "demo-2",
    direcao: "enviada",
    conteudo:
      "Perfeito — triagem concluída. O especialista Victor Molina vai entrar em contato em breve pelo WhatsApp.",
    remetente: "Bot Molina",
    external_message_id: "evo-1004",
    created_at: "2026-08-02T14:24:00Z",
  },
  {
    id: "msg-12-1",
    lead_id: "demo-12",
    direcao: "recebida",
    conteudo: "Boa noite, quero lançamento na planta no Parque das Rosas.",
    remetente: "Helena Duarte",
    external_message_id: "evo-2001",
    created_at: "2026-08-07T18:01:00Z",
  },
  {
    id: "msg-12-2",
    lead_id: "demo-12",
    direcao: "enviada",
    conteudo:
      "Olá Helena! Temos o Artencena Design Residences na região. Qual faixa de investimento?",
    remetente: "Bot Molina",
    external_message_id: "evo-2002",
    created_at: "2026-08-07T18:01:40Z",
  },
  {
    id: "msg-12-3",
    lead_id: "demo-12",
    direcao: "recebida",
    conteudo: "Até 1,6 milhão, flexível.",
    remetente: "Helena Duarte",
    external_message_id: "evo-2003",
    created_at: "2026-08-07T18:05:00Z",
  },
  {
    id: "msg-12-4",
    lead_id: "demo-12",
    direcao: "enviada",
    conteudo:
      "Obrigado! Encaminhei seu perfil ao Victor. Ele assume a conversa daqui a pouco.",
    remetente: "Bot Molina",
    external_message_id: "evo-2004",
    created_at: "2026-08-07T18:06:00Z",
  },
];

export function getDemoComissoesDetalhadas(): ComissaoDetalhada[] {
  return DEMO_COMISSOES.map((c) => {
    const unidade = c.unidade_id
      ? DEMO_UNIDADES.find((u) => u.id === c.unidade_id) ?? null
      : null;
    const empreendimento = unidade
      ? DEMO_EMPREENDIMENTOS.find((e) => e.id === unidade.empreendimento_id) ??
        null
      : null;
    const lead = c.lead_id
      ? DEMO_LEADS.find((l) => l.id === c.lead_id) ?? null
      : unidade?.comprador_lead_id
        ? DEMO_LEADS.find((l) => l.id === unidade.comprador_lead_id) ?? null
        : null;
    const parcelas = DEMO_PARCELAS.filter((p) => p.comissao_id === c.id).sort(
      (a, b) => a.data_prevista.localeCompare(b.data_prevista)
    );
    return { ...c, unidade, empreendimento, lead, parcelas };
  });
}
