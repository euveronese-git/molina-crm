"use client";

import { useMemo, useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import type {
  FunnelStatus,
  Lead,
  LeadOrigem,
  MensagemWhatsapp,
} from "@/lib/types";
import { FUNNEL_STAGES, ORIGEM_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LeadSheet, type LeadFormValues } from "@/components/pipeline/lead-sheet";
import { cn, formatCurrency } from "@/lib/utils";
import { createLead, deleteLead, updateLead } from "@/lib/actions/leads";
import { Bot, Plus, Search } from "lucide-react";

type Props = {
  initialLeads: Lead[];
  initialMessages: MensagemWhatsapp[];
  demoMode: boolean;
};

export function LeadsClient({
  initialLeads,
  initialMessages,
  demoMode,
}: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [messages] = useState<MensagemWhatsapp[]>(initialMessages);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FunnelStatus | "all">("all");
  const [origemFilter, setOrigemFilter] = useState<LeadOrigem | "all">("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("edit");

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status_funil !== statusFilter) return false;
      if (origemFilter !== "all" && l.origem !== origemFilter) return false;
      if (
        search &&
        !l.nome.toLowerCase().includes(search.toLowerCase()) &&
        !l.contato.includes(search)
      )
        return false;
      return true;
    });
  }, [leads, search, statusFilter, origemFilter]);

  const chatbotCount = leads.filter(
    (l) => l.external_source === "whatsapp_chatbot"
  ).length;

  const readyForHuman = leads.filter(
    (l) => l.external_source === "whatsapp_chatbot" && !l.bot_ativo
  ).length;

  function openCreate() {
    setMode("create");
    setSelected(null);
    setSheetOpen(true);
  }

  function openEdit(lead: Lead) {
    setMode("edit");
    setSelected(lead);
    setSheetOpen(true);
  }

  async function handleSave(values: LeadFormValues) {
    if (mode === "create") {
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
    await updateLead(id, values);
  }

  async function handleDelete() {
    if (!selected) return;
    const id = selected.id;
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setSelected(null);
    await deleteLead(id);
  }

  const selectedMessages = selected
    ? messages.filter((m) => m.lead_id === selected.id)
    : [];

  return (
    <>
      <Topbar
        title="Leads"
        subtitle={
          demoMode
            ? "Base de contatos · modo demo"
            : "Base de contatos · qualificação"
        }
      />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mb-4 rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Bot className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <div>
              <p className="font-medium text-foreground">
                Integração chatbot WhatsApp
              </p>
              <p className="text-xs">
                {chatbotCount} leads do chatbot ·{" "}
                <span className="text-amber-300">{readyForHuman}</span> prontos
                para contato humano (bot_ativo = false).
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Buscar nome ou contato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as FunnelStatus | "all")
            }
            className="h-9 rounded-md border border-input bg-surface-deep/40 px-3 text-sm"
          >
            <option value="all">Todas as etapas</option>
            {FUNNEL_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={origemFilter}
            onChange={(e) =>
              setOrigemFilter(e.target.value as LeadOrigem | "all")
            }
            className="h-9 rounded-md border border-input bg-surface-deep/40 px-3 text-sm"
          >
            <option value="all">Todas as origens</option>
            {(Object.keys(ORIGEM_LABELS) as LeadOrigem[]).map((k) => (
              <option key={k} value={k}>
                {ORIGEM_LABELS[k]}
              </option>
            ))}
          </select>
          <Button variant="gold" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo Lead
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-surface/50 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Origem</th>
                <th className="px-4 py-3 font-medium">Orçamento</th>
                <th className="px-4 py-3 font-medium">Região</th>
                <th className="px-4 py-3 font-medium">Funil</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => {
                const stage = FUNNEL_STAGES.find(
                  (s) => s.id === lead.status_funil
                );
                const ready =
                  lead.external_source === "whatsapp_chatbot" && !lead.bot_ativo;
                return (
                  <tr
                    key={lead.id}
                    className="border-b border-border/30 transition-colors hover:bg-accent/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            lead.is_vip && "font-serif italic text-gold-light"
                          )}
                        >
                          {lead.nome}
                        </span>
                        {lead.is_vip ? (
                          <Badge variant="gold">VIP</Badge>
                        ) : null}
                        {lead.external_source === "whatsapp_chatbot" ? (
                          <Bot className="h-3 w-3 text-emerald-400" />
                        ) : null}
                        {ready ? (
                          <Badge variant="warning">Pronto para contato humano</Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.contato}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {ORIGEM_LABELS[lead.origem]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gold">
                      {formatCurrency(lead.orcamento)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.regiao_interesse ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">{stage?.label}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(lead)}
                      >
                        Abrir
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Nenhum lead encontrado
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </main>

      <LeadSheet
        lead={selected}
        mode={mode}
        open={sheetOpen}
        onOpenChange={(o) => {
          setSheetOpen(o);
          if (!o) setSelected(null);
        }}
        onSave={handleSave}
        onDelete={mode === "edit" ? handleDelete : undefined}
        messages={selectedMessages}
        demoMode={demoMode}
      />
    </>
  );
}
