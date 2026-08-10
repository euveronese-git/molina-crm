"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Lead } from "@/lib/types";
import { FUNNEL_STAGES } from "@/lib/types";
import { LeadCard } from "@/components/pipeline/lead-card";
import { cn } from "@/lib/utils";

type Stage = (typeof FUNNEL_STAGES)[number];

interface PipelineColumnProps {
  stage: Stage;
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
}

export function PipelineColumn({ stage, leads, onOpenLead }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      className={cn(
        "flex w-[240px] shrink-0 flex-col rounded-lg border border-border/40 bg-surface/40 transition-colors sm:w-[260px]",
        isOver && "border-gold/35 bg-gold/[0.03]"
      )}
    >
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-3">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {stage.label}
          </h2>
        </div>
        <span className="rounded-md bg-background/60 px-1.5 py-0.5 text-[11px] tabular-nums text-gold-light">
          {leads.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto p-2"
      >
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border/40 px-3 py-8 text-center text-[11px] text-muted-foreground/70">
              Arraste um lead aqui
            </div>
          ) : (
            leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onClick={() => onOpenLead(lead)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
