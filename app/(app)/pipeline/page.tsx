import { Topbar } from "@/components/layout/topbar";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { DEMO_LEADS } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/types";

async function getLeads(): Promise<{ leads: Lead[]; demoMode: boolean }> {
  if (!isSupabaseConfigured()) {
    return { leads: DEMO_LEADS, demoMode: true };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { leads: DEMO_LEADS, demoMode: true };
  }

  return { leads: data as Lead[], demoMode: false };
}

export default async function PipelinePage() {
  const { leads, demoMode } = await getLeads();

  return (
    <>
      <Topbar
        title="Pipeline"
        subtitle="Funil de lançamentos · Captação → Pós-venda"
      />
      <main className="min-w-0 flex-1 overflow-hidden p-3 sm:p-4 lg:p-6">
        <PipelineBoard initialLeads={leads} demoMode={demoMode} />
      </main>
    </>
  );
}
