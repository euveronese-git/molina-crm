import { Topbar } from "@/components/layout/topbar";
import { KpiCard, ChartCard } from "@/components/dashboard/kpi-card";
import {
  VendasPorEmpreendimentoChart,
  FluxoCaixaChart,
  DespesasCategoriaChart,
} from "@/components/charts/finance-charts";
import { loadCrmSnapshot } from "@/lib/data/crm";
import {
  activeFunnelLeads,
  comissaoAReceber,
  despesasPorCategoria,
  fluxoCaixaSeisMeses,
  formatCurrency,
  saldoMes,
  vendasMesOuTotal,
  vendasPorEmpreendimento,
  visitasNaSemana,
} from "@/lib/metrics";
import {
  Users,
  CalendarCheck,
  Home,
  Wallet,
  TrendingUp,
} from "lucide-react";

export default async function DashboardPage() {
  const {
    leads,
    unidades,
    parcelas,
    despesas,
    empreendimentos,
    demoMode,
  } = await loadCrmSnapshot();

  const kpis = {
    funil: activeFunnelLeads(leads),
    visitas: visitasNaSemana(leads),
    vendas: vendasMesOuTotal(unidades),
    aReceber: comissaoAReceber(parcelas),
    saldo: saldoMes(parcelas, despesas),
  };

  const vendasEmp = vendasPorEmpreendimento(unidades, empreendimentos);
  const fluxo = fluxoCaixaSeisMeses(parcelas, despesas);
  const porCat = despesasPorCategoria(despesas);

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle={
          demoMode
            ? "Visão geral · modo demo"
            : "Visão geral · Molina Transações Imobiliárias"
        }
      />
      <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard
            label="Leads no funil"
            value={String(kpis.funil)}
            hint="Exceto pós-venda"
            icon={Users}
          />
          <KpiCard
            label="Visitas / plantão"
            value={String(kpis.visitas)}
            hint="Etapa atual no pipeline"
            icon={CalendarCheck}
          />
          <KpiCard
            label="Vendas no período"
            value={String(kpis.vendas)}
            hint="Unidades vendidas"
            icon={Home}
            gold
          />
          <KpiCard
            label="Comissão a receber"
            value={formatCurrency(kpis.aReceber)}
            hint="Parcelas previstas"
            icon={Wallet}
            gold
          />
          <KpiCard
            label="Saldo do mês"
            value={formatCurrency(kpis.saldo)}
            hint="Recebido − despesas pagas"
            icon={TrendingUp}
            gold
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Vendas por empreendimento"
            subtitle="Unidades vendidas, reservadas e disponíveis"
          >
            <VendasPorEmpreendimentoChart data={vendasEmp} />
          </ChartCard>
          <ChartCard
            title="Fluxo de caixa (6 meses)"
            subtitle="Comissões recebidas vs despesas pagas"
          >
            <FluxoCaixaChart data={fluxo} />
          </ChartCard>
          <ChartCard
            title="Despesas por categoria"
            subtitle="Distribuição operacional"
            className="lg:col-span-2"
          >
            <div className="mx-auto max-w-md">
              <DespesasCategoriaChart data={porCat} />
            </div>
          </ChartCard>
        </div>
      </main>
    </>
  );
}
