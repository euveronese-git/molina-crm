"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Lead } from "@/lib/types";
import { ORIGEM_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { Bot, GripVertical, MapPin } from "lucide-react";

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
  dragging?: boolean;
}

export function LeadCard({ lead, onClick, dragging }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-md border border-border/50 bg-card p-3 shadow-sm transition-all hover:border-gold/30",
        (isDragging || dragging) && "opacity-60 shadow-gold",
        dragging && "cursor-grabbing"
      )}
    >
      <div className="flex items-start gap-1">
        <button
          type="button"
          className="mt-0.5 cursor-grab touch-none text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          aria-label="Arrastar"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onClick}
          className="min-w-0 flex-1 text-left"
        >
          <div className="mb-1.5 flex items-center gap-1.5">
            <p
              className={cn(
                "truncate text-sm text-foreground",
                lead.is_vip ? "font-serif italic text-gold-light" : "font-medium"
              )}
            >
              {lead.nome}
            </p>
            {lead.external_source === "whatsapp_chatbot" ? (
              <Bot className="h-3 w-3 shrink-0 text-emerald-400/80" aria-label="Chatbot" />
            ) : null}
          </div>

          <p className="mb-2 truncate text-[11px] text-muted-foreground">
            {lead.contato}
          </p>

          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="outline">{ORIGEM_LABELS[lead.origem]}</Badge>
            {lead.is_vip ? <Badge variant="gold">VIP</Badge> : null}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium tabular-nums text-gold">
              {formatCurrency(lead.orcamento)}
            </span>
            {lead.regiao_interesse ? (
              <span className="flex min-w-0 items-center gap-0.5 text-[10px] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{lead.regiao_interesse}</span>
              </span>
            ) : null}
          </div>
        </button>
      </div>
    </div>
  );
}
