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
import type { FunnelStatus, Lead } from "@/lib/types";
import { FUNNEL_STAGES } from "@/lib/types";
import { PipelineColumn } from "@/components/pipeline/pipeline-column";
import { LeadCard } from "@/components/pipeline/lead-card";
import { LeadSheet } from "@/components/pipeline/lead-sheet";
import { updateLeadStatus, updateLead } from "@/lib/actions/leads";

interface PipelineBoardProps {
  initialLeads: Lead[];
  demoMode?: boolean;
}

export function PipelineBoard({ initialLeads, demoMode = false }: PipelineBoardProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const activeLead = useMemo(
    () => leads.find((l) => l.id === activeId) ?? null,
    [leads, activeId]
  );

  function leadsByStage(stage: FunnelStatus) {
    return leads.filter((l) => l.status_funil === stage);
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

  async function handleSave(values: {
    nome: string;
    contato: string;
    origem: Lead["origem"];
    orcamento: number | null;
    regiao_interesse: string | null;
    status_funil: FunnelStatus;
    notas: string | null;
    is_vip: boolean;
  }) {
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex h-full gap-3 overflow-x-auto pb-4 pr-2">
          {FUNNEL_STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              leads={leadsByStage(stage.id)}
              onOpenLead={setSelected}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} dragging /> : null}
        </DragOverlay>
      </DndContext>

      <LeadSheet
        lead={selected}
        mode="edit"
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        onSave={handleSave}
        demoMode={demoMode}
      />
    </>
  );
}
