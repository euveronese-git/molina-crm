import { loadLeads } from "@/lib/data/crm";
import { LeadsClient } from "./leads-client";

export default async function LeadsPage() {
  const { leads, mensagens, demoMode } = await loadLeads();

  return (
    <LeadsClient
      initialLeads={leads}
      initialMessages={mensagens}
      demoMode={demoMode}
    />
  );
}
