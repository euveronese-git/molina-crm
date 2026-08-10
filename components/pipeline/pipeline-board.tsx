"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import type { FunnelStatus, Lead } from "@/lib/types";
import { FUNNEL_STAGES } from "@/lib/types";
import { PipelineColumn } from "@/components/pipeline/pipeline-column";
import { LeadCard } from "@/components/pipeline/lead-card";
import { LeadSheet, type LeadFormValues } from "@/components/pipeline/lead-sheet";
import { createLead, updateLeadStatus, updateLead } from "@/lib/actions/leads";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";

interface PipelineBoardProps {
  initialLeads: Lead[];
  demoMode?: boolean;
}

export function PipelineBoard({
  initialLeads,
  demoMode = false,
}: PipelineBoardProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("edit");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mobileStage, setMobileStage] = useState<FunnelStatus>("captacao");
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const activeLead = useMemo(
    () => leads.find((l) => l.id === activeId) ?? null,
    [leads, activeId]
  );

  const mobileStageMeta = FUNNEL_STAGES.find((s) => s.id === mobileStage)!;
  const mobileLeads = useMemo(
    () => leads.filter((l) => l.status_funil === mobileStage),
    [leads, mobileStage]
  );
  const mobileBudget = useMemo(
    () => mobileLeads.reduce((sum, l) => sum + (l.orcamento ?? 0), 0),
    [mobileLeads]
  );

  function leadsByStage(stage: FunnelStatus) {
    return leads.filter((l) => l.status_funil === stage);
  }

  function openCreate() {
    setSheetMode("create");
    setSelected(null);
    setSheetOpen(true);
  }

  function openEdit(lead: Lead) {
    setSheetMode("edit");
    setSelected(lead);
    setSheetOpen(true);
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    const overId = String(over.id);

    let nextStatus: FunnelStatus | null = null;
    if (FUNNEL_STAGES.some((s) => s.id === overId)) {
      nextStatus = overId as FunnelStatus;
    } else {
      const overLead = leads.find((l) => l.id === overId);
      if (overLead) nextStatus = overLead.status_funil;
    }

    if (!nextStatus) return;

    const current = leads.find((l) => l.id === leadId);
    if (!current || current.status_funil === nextStatus) return;

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, status_funil: nextStatus!, updated_at: new Date().toISOString() }
          : l
      )
    );

    if (!demoMode) {
      startTransition(async () => {
        await updateLeadStatus(leadId, nextStatus!);
      });
    }
  }

  async function handleSave(values: LeadFormValues) {
    if (sheetMode === "create") {
      const result = await createLead(values);
      const id =
        result && "id" in result && result.id
          ? result.id
          : `demo-${Date.now()}`;
      const now = new Date().toISOString();
      const lead: Lead = {
        id,
        ...values,
        bot_ativo: true,
        external_source: null,
        external_id: null,
        created_by: null,
        created_at: now,
        updated_at: now,
      };
      setLeads((prev) => [lead, ...prev]);
      setMobileStage(values.status_funil);
      return;
    }

    if (!selected) return;
    const id = selected.id;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, ...values, updated_at: new Date().toISOString() } : l
      )
    );
    setSelected((prev) => (prev ? { ...prev, ...values } : prev));

    if (!demoMode) {
      await updateLead(id, values);
    }
  }

  return (
    <>
      {/* Mobile: one stage at a time */}
      <div className="flex h-full min-w-0 flex-col gap-3 lg:hidden">
        <Button variant="gold" className="h-11 w-full shrink-0" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Novo lead
        </Button>

        <div className="-mx-1 flex min-w-0 shrink-0 gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FUNNEL_STAGES.map((stage) => {
            const count = leadsByStage(stage.id).length;
            const active = stage.id === mobileStage;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setMobileStage(stage.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors",
                  active
                    ? "border-gold/40 bg-gold/15 text-gold-light"
                    : "border-border/50 bg-surface/40 text-muted-foreground"
                )}
              >
                {stage.label}
                <span className="ml-1.5 tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border border-border/40 bg-surface/40">
          <div className="flex items-center justify-between border-b border-border/40 px-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {mobileStageMeta.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {mobileLeads.length}{" "}
                {mobileLeads.length === 1 ? "lead" : "leads"}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-background/60 px-2.5 py-1 text-xs tabular-nums text-gold-light">
              {formatCurrency(mobileBudget || null)}
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-2 overflow-y-auto p-3">
            {mobileLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                staticCard
                onClick={() => openEdit(lead)}
              />
            ))}
            {mobileLeads.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nenhum lead nesta etapa
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Desktop: horizontal kanban */}
      <div className="hidden h-full lg:block">
        <div className="mb-3 flex justify-end">
          <Button variant="gold" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo lead
          </Button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex h-[calc(100%-2.5rem)] gap-3 overflow-x-auto pb-4 pr-2">
            {FUNNEL_STAGES.map((stage) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                leads={leadsByStage(stage.id)}
                onOpenLead={openEdit}
              />
            ))}
          </div>
          <DragOverlay>
            {activeLead ? <LeadCard lead={activeLead} dragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <LeadSheet
        lead={selected}
        mode={sheetMode}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setSelected(null);
        }}
        onSave={handleSave}
        demoMode={demoMode}
      />
    </>
  );
}
