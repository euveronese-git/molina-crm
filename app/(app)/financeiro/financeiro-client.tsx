"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { ChartCard, KpiCard } from "@/components/dashboard/kpi-card";
import {
  DespesasCategoriaChart,
  FluxoCaixaChart,
} from "@/components/charts/finance-charts";
import type {
  Comissao,
  ComissaoDetalhada,
  ComissaoTipo,
  Despesa,
  DespesaCategoria,
  DespesaStatus,
  Empreendimento,
  Lead,
  ParcelaComissao,
  Unidade,
} from "@/lib/types";
import { DESPESA_CATEGORIAS } from "@/lib/types";
import {
  addMonthsISO,
  comissaoAReceber,
  comissaoRecebida,
  despesasPagas,
  despesasPorCategoria,
  despesasPrevistas,
  fluxoCaixaSeisMeses,
  formatCurrency,
  splitParcelas,
} from "@/lib/metrics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  createComissaoWithParcelas,
  deleteComissao,
  deleteDespesa,
  upsertDespesa,
} from "@/lib/actions/financeiro";
import { ArrowDownLeft, ArrowUpRight, Plus, Trash2, Wallet } from "lucide-react";

type Tab = "visao" | "comissoes" | "despesas";

type FinanceiroProps = {
  initialComissoes: Comissao[];
  initialParcelas: ParcelaComissao[];
  initialDespesas: Despesa[];
  initialLeads: Lead[];
  initialUnidades: Unidade[];
  initialEmpreendimentos: Empreendimento[];
  demoMode: boolean;
};

function enrichComissoes(
  list: Comissao[],
  parcelas: ParcelaComissao[],
  unidades: Unidade[],
  empreendimentos: Empreendimento[],
  leads: Lead[]
): ComissaoDetalhada[] {
  return list.map((c) => {
    const unidade = c.unidade_id
      ? unidades.find((u) => u.id === c.unidade_id) ?? null
      : null;
    const empreendimento = unidade
      ? empreendimentos.find((e) => e.id === unidade.empreendimento_id) ?? null
      : null;
    const lead = c.lead_id
      ? leads.find((l) => l.id === c.lead_id) ?? null
      : null;
    return {
      ...c,
      unidade,
      empreendimento,
      lead,
      parcelas: parcelas
        .filter((p) => p.comissao_id === c.id)
        .sort((a, b) => a.data_prevista.localeCompare(b.data_prevista)),
    };
  });
}

function categoriaLabel(cat: string) {
  return DESPESA_CATEGORIAS.find((c) => c.id === cat)?.label ?? cat;
}

export function FinanceiroClient(props: FinanceiroProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Carregando financeiro…
        </div>
      }
    >
      <FinanceiroContent {...props} />
    </Suspense>
  );
}

function FinanceiroContent({
  initialComissoes,
  initialParcelas,
  initialDespesas,
  initialLeads,
  initialUnidades,
  initialEmpreendimentos,
  demoMode,
}: FinanceiroProps) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("visao");

  const [comissoesBase, setComissoesBase] =
    useState<Comissao[]>(initialComissoes);
  const [parcelas, setParcelas] = useState<ParcelaComissao[]>(initialParcelas);
  const [despesas, setDespesas] = useState<Despesa[]>(initialDespesas);
  const [leads] = useState<Lead[]>(initialLeads);
  const [unidades] = useState<Unidade[]>(initialUnidades);
  const [empreendimentos] = useState<Empreendimento[]>(
    initialEmpreendimentos
  );
  const [customCats, setCustomCats] = useState<string[]>([]);

  // despesa form
  const [despesaDialog, setDespesaDialog] = useState(false);
  const [editing, setEditing] = useState<Despesa | null>(null);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<DespesaStatus | "all">("all");
  const [fDesc, setFDesc] = useState("");
  const [fCat, setFCat] = useState<string>("marketing");
  const [fCatCustom, setFCatCustom] = useState("");
  const [fValor, setFValor] = useState("");
  const [fData, setFData] = useState("");
  const [fStatus, setFStatus] = useState<DespesaStatus>("previsto");
  const [fForn, setFForn] = useState("");
  const [fNotas, setFNotas] = useState("");
  const [fRecorrente, setFRecorrente] = useState(false);

  // comissao form
  const [comissaoDialog, setComissaoDialog] = useState(false);
  const [cTipo, setCTipo] = useState<ComissaoTipo>("venda");
  const [cLeadId, setCLeadId] = useState("");
  const [cUnidadeId, setCUnidadeId] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cValor, setCValor] = useState("");
  const [cNParcelas, setCNParcelas] = useState("3");
  const [cPrimeiraData, setCPrimeiraData] = useState(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "comissoes" || t === "despesas" || t === "visao") setTab(t);
    const lead = searchParams.get("lead");
    if (lead) {
      setTab("comissoes");
      setCTipo("venda");
      setCLeadId(lead);
      setComissaoDialog(true);
    }
  }, [searchParams]);

  const comissoes = useMemo(
    () =>
      enrichComissoes(
        comissoesBase,
        parcelas,
        unidades,
        empreendimentos,
        leads
      ),
    [comissoesBase, parcelas, unidades, empreendimentos, leads]
  );

  const posVendaLeads = useMemo(
    () => leads.filter((l) => l.status_funil === "pos_venda"),
    [leads]
  );

  const unidadesVendidas = useMemo(
    () => unidades.filter((u) => u.status === "vendido"),
    [unidades]
  );

  const allCategories = useMemo(() => {
    const fromData = Array.from(new Set(despesas.map((d) => d.categoria)));
    const presets = DESPESA_CATEGORIAS.map((c) => c.id);
    return Array.from(new Set([...presets, ...customCats, ...fromData]));
  }, [despesas, customCats]);

  const filteredDespesas = useMemo(() => {
    return despesas.filter((d) => {
      if (filterCat !== "all" && d.categoria !== filterCat) return false;
      if (filterStatus !== "all" && d.status !== filterStatus) return false;
      return true;
    });
  }, [despesas, filterCat, filterStatus]);

  function ensureNextRecurring(source: Despesa, list: Despesa[]): Despesa[] {
    if (!source.recorrente) return list;
    const nextDate = addMonthsISO(source.data_vencimento, 1);
    const exists = list.some(
      (d) =>
        d.descricao === source.descricao &&
        d.categoria === source.categoria &&
        d.valor === source.valor &&
        d.data_vencimento === nextDate
    );
    if (exists) return list;
    const clone: Despesa = {
      ...source,
      id: `des-${Date.now()}-r`,
      data_vencimento: nextDate,
      status: "previsto",
      created_at: new Date().toISOString(),
    };
    return [clone, ...list];
  }

  function openNewDespesa() {
    setEditing(null);
    setFDesc("");
    setFCat("marketing");
    setFCatCustom("");
    setFValor("");
    setFData(new Date().toISOString().slice(0, 10));
    setFStatus("previsto");
    setFForn("");
    setFNotas("");
    setFRecorrente(false);
    setDespesaDialog(true);
  }

  function openEditDespesa(d: Despesa) {
    setEditing(d);
    setFDesc(d.descricao);
    const isPreset = DESPESA_CATEGORIAS.some((c) => c.id === d.categoria);
    setFCat(isPreset ? d.categoria : "__custom__");
    setFCatCustom(isPreset ? "" : d.categoria);
    setFValor(String(d.valor));
    setFData(d.data_vencimento);
    setFStatus(d.status);
    setFForn(d.fornecedor ?? "");
    setFNotas(d.notas ?? "");
    setFRecorrente(d.recorrente);
    setDespesaDialog(true);
  }

  async function saveDespesa() {
    const categoria =
      fCat === "__custom__" ? fCatCustom.trim() || "outros" : fCat;
    if (fCat === "__custom__" && fCatCustom.trim()) {
      setCustomCats((prev) =>
        prev.includes(fCatCustom.trim()) ? prev : [...prev, fCatCustom.trim()]
      );
    }
    const payload: Despesa = {
      id: editing?.id ?? `des-${Date.now()}`,
      descricao: fDesc,
      categoria: categoria as DespesaCategoria,
      valor: Number(fValor) || 0,
      data_vencimento: fData,
      status: fStatus,
      fornecedor: fForn || null,
      notas: fNotas || null,
      recorrente: fRecorrente,
      created_by: null,
      created_at: editing?.created_at ?? new Date().toISOString(),
    };
    setDespesas((prev) => {
      let next = editing
        ? prev.map((d) => (d.id === editing.id ? payload : d))
        : [payload, ...prev];
      if (payload.status === "pago" && payload.recorrente) {
        next = ensureNextRecurring(payload, next);
      }
      return next;
    });
    await upsertDespesa(payload);
    setDespesaDialog(false);
  }

  async function removeDespesa(id: string) {
    if (!window.confirm("Excluir esta despesa?")) return;
    setDespesas((prev) => prev.filter((d) => d.id !== id));
    await deleteDespesa(id);
  }

  function markDespesaPaga(id: string) {
    setDespesas((prev) => {
      const target = prev.find((d) => d.id === id);
      if (!target) return prev;
      const updated = { ...target, status: "pago" as const };
      let next = prev.map((d) => (d.id === id ? updated : d));
      if (updated.recorrente) next = ensureNextRecurring(updated, next);
      return next;
    });
  }

  function markParcelaRecebida(id: string) {
    setParcelas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "recebido" } : p))
    );
  }

  function openNewComissao(prefillLead?: string) {
    setCTipo("venda");
    setCLeadId(prefillLead ?? "");
    setCUnidadeId("");
    setCDesc("");
    setCValor("");
    setCNParcelas("3");
    setCPrimeiraData(new Date().toISOString().slice(0, 10));
    setComissaoDialog(true);
  }

  async function saveComissao() {
    const valorTotal = Number(cValor) || 0;
    const n = Math.max(1, Number(cNParcelas) || 1);
    const id = `com-${Date.now()}`;
    const nova: Comissao = {
      id,
      tipo: cTipo,
      valor_total: valorTotal,
      num_parcelas: n,
      lead_id: cTipo === "venda" ? cLeadId || null : null,
      unidade_id: cTipo === "venda" ? cUnidadeId || null : null,
      descricao: cTipo === "avulsa" ? cDesc || "Receita avulsa" : null,
      created_at: new Date().toISOString(),
    };
    const parts = splitParcelas(valorTotal, n, cPrimeiraData, id).map((p, i) => ({
      ...p,
      id: `${id}-p${i + 1}`,
    }));
    setComissoesBase((prev) => [nova, ...prev]);
    setParcelas((prev) => [...parts, ...prev]);
    await createComissaoWithParcelas({
      tipo: nova.tipo,
      valor_total: nova.valor_total,
      num_parcelas: nova.num_parcelas,
      lead_id: nova.lead_id,
      unidade_id: nova.unidade_id,
      descricao: nova.descricao,
      parcelas: parts.map(({ valor, data_prevista, status }) => ({
        valor,
        data_prevista,
        status,
      })),
    });
    setComissaoDialog(false);
  }

  async function removeComissao(id: string) {
    if (!window.confirm("Excluir esta comissão e suas parcelas?")) return;
    setComissoesBase((prev) => prev.filter((c) => c.id !== id));
    setParcelas((prev) => prev.filter((p) => p.comissao_id !== id));
    await deleteComissao(id);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "visao", label: "Visão geral" },
    { id: "comissoes", label: "Comissões" },
    { id: "despesas", label: "Despesas" },
  ];

  return (
    <>
      <Topbar
        title="Financeiro"
        subtitle={
          demoMode
            ? "Comissões · despesas · modo demo"
            : "Comissões · despesas · fluxo de caixa"
        }
      />
      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6">
        <div className="mb-6 flex gap-1 rounded-lg border border-border/50 bg-surface/40 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm transition-colors",
                tab === t.id
                  ? "bg-gold/15 text-gold-light"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "visao" ? (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="A receber"
                value={formatCurrency(comissaoAReceber(parcelas))}
                icon={ArrowDownLeft}
                gold
              />
              <KpiCard
                label="Recebido"
                value={formatCurrency(comissaoRecebida(parcelas))}
                icon={Wallet}
                gold
              />
              <KpiCard
                label="A pagar"
                value={formatCurrency(despesasPrevistas(despesas))}
                icon={ArrowUpRight}
              />
              <KpiCard
                label="Pago"
                value={formatCurrency(despesasPagas(despesas))}
                icon={ArrowUpRight}
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartCard title="Fluxo de caixa (6 meses)">
                <FluxoCaixaChart
                  data={fluxoCaixaSeisMeses(parcelas, despesas)}
                />
              </ChartCard>
              <ChartCard title="Despesas por categoria">
                <DespesasCategoriaChart data={despesasPorCategoria(despesas)} />
              </ChartCard>
            </div>
          </div>
        ) : null}

        {tab === "comissoes" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Vendas do pipeline e receitas avulsas
              </p>
              <Button variant="gold" onClick={() => openNewComissao()}>
                <Plus className="h-4 w-4" />
                Nova comissão / receita
              </Button>
            </div>

            {posVendaLeads.length > 0 ? (
              <div className="rounded-lg border border-gold/25 bg-gold/5 px-4 py-3">
                <p className="mb-2 text-xs font-medium text-gold-light">
                  Leads em pós-venda — gerar comissão
                </p>
                <div className="flex flex-wrap gap-2">
                  {posVendaLeads.map((l) => (
                    <Button
                      key={l.id}
                      size="sm"
                      variant="outline"
                      onClick={() => openNewComissao(l.id)}
                    >
                      {l.nome}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            {comissoes.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-border/50 bg-card p-5"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="mb-1 flex flex-wrap gap-2">
                      <Badge variant={c.tipo === "venda" ? "gold" : "outline"}>
                        {c.tipo === "venda" ? "Venda" : "Receita avulsa"}
                      </Badge>
                    </div>
                    <p className="font-serif text-base italic text-gold-light">
                      {c.tipo === "avulsa"
                        ? c.descricao || "Receita avulsa"
                        : c.empreendimento?.nome || "Comissão de venda"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {c.unidade ? `Unidade ${c.unidade.numero}` : null}
                      {c.lead ? `${c.unidade ? " · " : ""}${c.lead.nome}` : null}
                      {!c.unidade && !c.lead && c.tipo === "venda"
                        ? "Sem unidade vinculada"
                        : null}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-gold">
                      {formatCurrency(c.valor_total)}
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeComissao(c.id)}
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {c.parcelas.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/40 bg-surface-deep/30 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          Parcela {idx + 1}
                        </span>
                        <span className="tabular-nums text-gold">
                          {formatCurrency(p.valor)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(
                            p.data_prevista + "T12:00:00"
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={p.status === "recebido" ? "gold" : "outline"}
                        >
                          {p.status === "recebido" ? "Recebido" : "Previsto"}
                        </Badge>
                        {p.status === "previsto" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markParcelaRecebida(p.id)}
                          >
                            Marcar recebido
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {comissoes.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nenhuma comissão — lance uma venda ou receita avulsa.
              </p>
            ) : null}
          </div>
        ) : null}

        {tab === "despesas" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="h-9 max-w-full min-w-0 rounded-md border border-input bg-surface-deep/40 px-3 text-sm"
              >
                <option value="all">Todas categorias</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>
                    {categoriaLabel(c)}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as DespesaStatus | "all")
                }
                className="h-9 max-w-full min-w-0 rounded-md border border-input bg-surface-deep/40 px-3 text-sm"
              >
                <option value="all">Todos status</option>
                <option value="previsto">A pagar</option>
                <option value="pago">Pago</option>
              </select>
              <Button
                variant="gold"
                className="w-full sm:ml-auto sm:w-auto"
                onClick={openNewDespesa}
              >
                <Plus className="h-4 w-4" />
                Nova despesa
              </Button>
            </div>

            {/* Mobile cards */}
            <div className="space-y-2 md:hidden">
              {filteredDespesas.map((d) => (
                <div
                  key={d.id}
                  className="rounded-lg border border-border/50 bg-card/40 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{d.descricao}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline">
                          {categoriaLabel(d.categoria)}
                        </Badge>
                        {d.recorrente ? (
                          <Badge variant="outline">Recorrente</Badge>
                        ) : null}
                        {d.fornecedor ? (
                          <span className="text-[11px] text-muted-foreground">
                            {d.fornecedor}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <Badge
                      variant={d.status === "pago" ? "gold" : "warning"}
                      className="shrink-0"
                    >
                      {d.status === "pago" ? "Pago" : "A pagar"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="tabular-nums text-gold">
                      {formatCurrency(d.valor)}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(
                        d.data_vencimento + "T12:00:00"
                      ).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {d.status === "previsto" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markDespesaPaga(d.id)}
                      >
                        Pagar
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDespesa(d)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400"
                      onClick={() => removeDespesa(d.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
              {filteredDespesas.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma despesa encontrada
                </p>
              ) : null}
            </div>

            {/* Desktop table */}
            <div className="hidden min-w-0 overflow-x-auto rounded-lg border border-border/50 md:block">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-surface/50 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Descrição</th>
                    <th className="px-4 py-3 font-medium">Categoria</th>
                    <th className="px-4 py-3 font-medium">Valor</th>
                    <th className="px-4 py-3 font-medium">Vencimento</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {filteredDespesas.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-border/30 hover:bg-accent/40"
                    >
                      <td className="px-4 py-3">
                        <p>{d.descricao}</p>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {d.recorrente ? (
                            <Badge variant="outline">Recorrente</Badge>
                          ) : null}
                          {d.fornecedor ? (
                            <span className="text-[11px] text-muted-foreground">
                              {d.fornecedor}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {categoriaLabel(d.categoria)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatCurrency(d.valor)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(
                          d.data_vencimento + "T12:00:00"
                        ).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={d.status === "pago" ? "gold" : "warning"}
                        >
                          {d.status === "pago" ? "Pago" : "A pagar"}
                        </Badge>
                      </td>
                      <td className="space-x-1 px-4 py-3 text-right">
                        {d.status === "previsto" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markDespesaPaga(d.id)}
                          >
                            Pagar
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDespesa(d)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400"
                          onClick={() => removeDespesa(d.id)}
                        >
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </main>

      {/* Despesa dialog */}
      <Dialog open={despesaDialog} onOpenChange={setDespesaDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar despesa" : "Nova despesa"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={fDesc} onChange={(e) => setFDesc(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <select
                  value={fCat}
                  onChange={(e) => setFCat(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-surface-deep/40 px-3 text-sm"
                >
                  {DESPESA_CATEGORIAS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                  {customCats.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__custom__">Outra…</option>
                </select>
                {fCat === "__custom__" ? (
                  <Input
                    className="mt-2"
                    placeholder="Nome da categoria"
                    value={fCatCustom}
                    onChange={(e) => setFCatCustom(e.target.value)}
                  />
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  value={fValor}
                  onChange={(e) => setFValor(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={fData}
                  onChange={(e) => setFData(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={fStatus}
                  onChange={(e) => setFStatus(e.target.value as DespesaStatus)}
                  className="flex h-9 w-full rounded-md border border-input bg-surface-deep/40 px-3 text-sm"
                >
                  <option value="previsto">A pagar</option>
                  <option value="pago">Pago</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Input value={fForn} onChange={(e) => setFForn(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={fNotas}
                onChange={(e) => setFNotas(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fRecorrente}
                onChange={(e) => setFRecorrente(e.target.checked)}
                className="h-4 w-4 accent-[#d4af37]"
              />
              Recorrente (gera lançamento do mês seguinte ao pagar)
            </label>
            <Button variant="gold" className="w-full" onClick={saveDespesa}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comissão dialog */}
      <Dialog open={comissaoDialog} onOpenChange={setComissaoDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova comissão / receita</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <select
                value={cTipo}
                onChange={(e) => setCTipo(e.target.value as ComissaoTipo)}
                className="flex h-9 w-full rounded-md border border-input bg-surface-deep/40 px-3 text-sm"
              >
                <option value="venda">Venda (Pipeline / pós-venda)</option>
                <option value="avulsa">Receita avulsa</option>
              </select>
            </div>

            {cTipo === "venda" ? (
              <>
                <div className="space-y-2">
                  <Label>Lead (pós-venda)</Label>
                  <select
                    value={cLeadId}
                    onChange={(e) => setCLeadId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-surface-deep/40 px-3 text-sm"
                  >
                    <option value="">— Selecione —</option>
                    {leads
                      .filter(
                        (l) =>
                          l.status_funil === "pos_venda" ||
                          l.status_funil === "assinatura"
                      )
                      .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nome} ({l.status_funil})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Unidade vendida (opcional)</Label>
                  <select
                    value={cUnidadeId}
                    onChange={(e) => setCUnidadeId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-surface-deep/40 px-3 text-sm"
                  >
                    <option value="">— Nenhuma —</option>
                    {unidadesVendidas.map((u) => {
                      const emp = empreendimentos.find(
                        (e) => e.id === u.empreendimento_id
                      );
                      return (
                        <option key={u.id} value={u.id}>
                          {emp?.nome} · {u.numero}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  placeholder="Ex: Consultoria de avaliação"
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Valor total</Label>
                <Input
                  type="number"
                  value={cValor}
                  onChange={(e) => setCValor(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Nº de parcelas</Label>
                <Input
                  type="number"
                  min={1}
                  value={cNParcelas}
                  onChange={(e) => setCNParcelas(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Data 1ª parcela</Label>
              <Input
                type="date"
                value={cPrimeiraData}
                onChange={(e) => setCPrimeiraData(e.target.value)}
              />
            </div>
            <Button variant="gold" className="w-full" onClick={saveComissao}>
              Criar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
