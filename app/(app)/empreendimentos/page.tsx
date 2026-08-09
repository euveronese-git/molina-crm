import { loadCrmSnapshot } from "@/lib/data/crm";
import { EmpreendimentosClient } from "./empreendimentos-client";

export default async function EmpreendimentosPage() {
  const { empreendimentos, unidades, leads, demoMode } =
    await loadCrmSnapshot();

  return (
    <EmpreendimentosClient
      initialEmpreendimentos={empreendimentos}
      initialUnidades={unidades}
      initialLeads={leads}
      demoMode={demoMode}
    />
  );
}
