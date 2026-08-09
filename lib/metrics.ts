import type {
  Despesa,
  DespesaCategoria,
  Lead,
  ParcelaComissao,
  Unidade,
} from "@/lib/types";
import { DESPESA_CATEGORIAS } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function activeFunnelLeads(leads: Lead[]) {
  return leads.filter((l) => l.status_funil !== "pos_venda").length;
}

export function visitasNaSemana(leads: Lead[]) {
  return leads.filter((l) => l.status_funil === "visita_plantao").length;
}

export function vendasNoMes(unidades: Unidade[], ref = new Date()) {
  const y = ref.getFullYear();
  const m = ref.getMonth();
  return unidades.filter((u) => {
    if (u.status !== "vendido") return false;
    const d = new Date(u.created_at);
    // demo: treat sold units linked in Aug as "this month" via updated heuristic —
    // use created_at of sold units that fall in current month OR hardcode count of sold
    return d.getFullYear() === y && d.getMonth() === m;
  }).length;
}

/** For demo UX: count all sold if month filter yields 0 but we have sold units */
export function vendasMesOuTotal(unidades: Unidade[]) {
  const noMes = vendasNoMes(unidades);
  if (noMes > 0) return noMes;
  return unidades.filter((u) => u.status === "vendido").length;
}

export function comissaoAReceber(parcelas: ParcelaComissao[]) {
  return parcelas
    .filter((p) => p.status === "previsto")
    .reduce((s, p) => s + p.valor, 0);
}

export function comissaoRecebida(parcelas: ParcelaComissao[]) {
  return parcelas
    .filter((p) => p.status === "recebido")
    .reduce((s, p) => s + p.valor, 0);
}

export function despesasPagas(despesas: Despesa[]) {
  return despesas
    .filter((d) => d.status === "pago")
    .reduce((s, d) => s + d.valor, 0);
}

export function despesasPrevistas(despesas: Despesa[]) {
  return despesas
    .filter((d) => d.status === "previsto")
    .reduce((s, d) => s + d.valor, 0);
}

export function saldoMes(
  parcelas: ParcelaComissao[],
  despesas: Despesa[],
  ref = new Date()
) {
  const y = ref.getFullYear();
  const m = ref.getMonth();
  const recebido = parcelas
    .filter((p) => {
      if (p.status !== "recebido") return false;
      const d = new Date(p.data_prevista + "T12:00:00");
      return d.getFullYear() === y && d.getMonth() === m;
    })
    .reduce((s, p) => s + p.valor, 0);
  const gasto = despesas
    .filter((d) => {
      if (d.status !== "pago") return false;
      const dt = new Date(d.data_vencimento + "T12:00:00");
      return dt.getFullYear() === y && dt.getMonth() === m;
    })
    .reduce((s, d) => s + d.valor, 0);
  return recebido - gasto;
}

export function vendasPorEmpreendimento(
  unidades: Unidade[],
  empreendimentos: { id: string; nome: string }[]
) {
  return empreendimentos.map((e) => ({
    nome: e.nome.split(" ").slice(0, 2).join(" "),
    nomeCompleto: e.nome,
    vendidas: unidades.filter(
      (u) => u.empreendimento_id === e.id && u.status === "vendido"
    ).length,
    reservadas: unidades.filter(
      (u) => u.empreendimento_id === e.id && u.status === "reservado"
    ).length,
    disponiveis: unidades.filter(
      (u) => u.empreendimento_id === e.id && u.status === "disponivel"
    ).length,
  }));
}

export function fluxoCaixaSeisMeses(
  parcelas: ParcelaComissao[],
  despesas: Despesa[],
  ref = new Date()
) {
  const months: { key: string; label: string; receitas: number; despesas: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short" });
    const receitas = parcelas
      .filter((p) => p.status === "recebido" && p.data_prevista.startsWith(key))
      .reduce((s, p) => s + p.valor, 0);
    const desp = despesas
      .filter((x) => x.status === "pago" && x.data_vencimento.startsWith(key))
      .reduce((s, x) => s + x.valor, 0);
    months.push({ key, label: label.replace(".", ""), receitas, despesas: desp });
  }
  return months;
}

export function despesasPorCategoria(despesas: Despesa[]) {
  const map = new Map<string, number>();
  for (const d of despesas) {
    map.set(d.categoria, (map.get(d.categoria) ?? 0) + d.valor);
  }
  return Array.from(map.entries())
    .map(([categoria, valor]) => {
      const preset = DESPESA_CATEGORIAS.find((c) => c.id === categoria);
      return {
        categoria: categoria as DespesaCategoria,
        label: preset?.label ?? categoria,
        valor,
      };
    })
    .filter((x) => x.valor > 0)
    .sort((a, b) => b.valor - a.valor);
}

/** Add N months to YYYY-MM-DD */
export function addMonthsISO(dateStr: string, months: number) {
  const d = new Date(dateStr + "T12:00:00");
  d.setMonth(d.getMonth() + months);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function splitParcelas(
  valorTotal: number,
  numParcelas: number,
  primeiraData: string,
  comissaoId: string
): Omit<ParcelaComissao, "id">[] {
  const n = Math.max(1, numParcelas);
  const base = Math.floor((valorTotal / n) * 100) / 100;
  const parts: Omit<ParcelaComissao, "id">[] = [];
  let allocated = 0;
  for (let i = 0; i < n; i++) {
    const valor = i === n - 1 ? Math.round((valorTotal - allocated) * 100) / 100 : base;
    allocated += valor;
    parts.push({
      comissao_id: comissaoId,
      valor,
      data_prevista: addMonthsISO(primeiraData, i),
      status: "previsto",
      created_at: new Date().toISOString(),
    });
  }
  return parts;
}

export { formatCurrency };
