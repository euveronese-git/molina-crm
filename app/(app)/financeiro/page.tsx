import { loadCrmSnapshot } from "@/lib/data/crm";
import { FinanceiroClient } from "./financeiro-client";

export default async function FinanceiroPage() {
  const {
    comissoes,
    parcelas,
    despesas,
    leads,
    unidades,
    empreendimentos,
    demoMode,
  } = await loadCrmSnapshot();

  return (
    <FinanceiroClient
      initialComissoes={comissoes}
      initialParcelas={parcelas}
      initialDespesas={despesas}
      initialLeads={leads}
      initialUnidades={unidades}
      initialEmpreendimentos={empreendimentos}
      demoMode={demoMode}
    />
  );
}
