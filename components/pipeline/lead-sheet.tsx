"use client";

import { useEffect, useMemo, useState } from "react";
import type { FunnelStatus, Lead, LeadOrigem, MensagemWhatsapp } from "@/lib/types";
import { FUNNEL_STAGES, ORIGEM_LABELS } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { WhatsappThread } from "@/components/leads/whatsapp-thread";
import Link from "next/link";
import { Wallet } from "lucide-react";

export type LeadFormValues = {
  nome: string;
  contato: string;
  origem: LeadOrigem;
  orcamento: number | null;
  regiao_interesse: string | null;
  status_funil: FunnelStatus;
  notas: string | null;
  is_vip: boolean;
};

interface LeadSheetProps {
  lead: Lead | null;
  open: boolean;
  mode: "create" | "edit";
  onOpenChange: (open: boolean) => void;
  onSave: (values: LeadFormValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  messages?: MensagemWhatsapp[];
  demoMode?: boolean;
}

export function LeadSheet({
  lead,
  open,
  mode,
  onOpenChange,
  onSave,
  onDelete,
  messages = [],
  demoMode,
}: LeadSheetProps) {
  const [tab, setTab] = useState<"dados" | "whatsapp">("dados");
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [orcamento, setOrcamento] = useState("");
  const [regiao, setRegiao] = useState("");
  const [notas, setNotas] = useState("");
  const [status, setStatus] = useState<FunnelStatus>("captacao");
  const [origem, setOrigem] = useState<LeadOrigem>("outro");
  const [isVip, setIsVip] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isCreate = mode === "create";

  useEffect(() => {
    if (!open) return;
    setTab("dados");
    if (isCreate || !lead) {
      setNome("");
      setContato("");
      setOrcamento("");
      setRegiao("");
      setNotas("");
      setStatus("captacao");
      setOrigem("outro");
      setIsVip(false);
      return;
    }
    setNome(lead.nome);
    setContato(lead.contato);
    setOrcamento(lead.orcamento != null ? String(lead.orcamento) : "");
    setRegiao(lead.regiao_interesse ?? "");
    setNotas(lead.notas ?? "");
    setStatus(lead.status_funil);
    setOrigem(lead.origem);
    setIsVip(lead.is_vip);
  }, [lead, open, isCreate]);

  const showWhatsappTab = !isCreate && Boolean(lead);

  async function handleSave() {
    if (!nome.trim() || !contato.trim()) return;
    setSaving(true);
    try {
      await onSave({
        nome: nome.trim(),
        contato: contato.trim(),
        orcamento: orcamento ? Number(orcamento) : null,
        regiao_interesse: regiao || null,
        notas: notas || null,
        status_funil: status,
        origem,
        is_vip: isVip,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!window.confirm(`Excluir o lead "${lead?.nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setDeleting(true);
    try {
      await onDelete();
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  }

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [messages]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {isCreate ? "Novo lead" : lead?.nome ?? "Lead"}
          </SheetTitle>
          <SheetDescription>
            {isCreate
              ? "Cadastro manual no funil"
              : "Qualificação e anotações do funil"}
            {demoMode ? " · alterações só nesta sessão" : ""}
          </SheetDescription>
        </SheetHeader>

        {showWhatsappTab ? (
          <div className="mt-4 flex gap-1 rounded-lg border border-border/50 bg-surface/40 p-1">
            <button
              type="button"
              onClick={() => setTab("dados")}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm transition-colors",
                tab === "dados"
                  ? "bg-gold/15 text-gold-light"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Dados
            </button>
            <button
              type="button"
              onClick={() => setTab("whatsapp")}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm transition-colors",
                tab === "whatsapp"
                  ? "bg-gold/15 text-gold-light"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Conversa WhatsApp
            </button>
          </div>
        ) : null}

        <div className="mt-4 flex-1 overflow-y-auto pb-4">
          {tab === "dados" || isCreate ? (
            <div className="space-y-5">
              {!isCreate && lead ? (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="gold">{ORIGEM_LABELS[lead.origem]}</Badge>
                  {lead.is_vip ? <Badge variant="default">VIP</Badge> : null}
                  {lead.external_source === "whatsapp_chatbot" ? (
                    <Badge variant="success">Chatbot WhatsApp</Badge>
                  ) : null}
                  {lead.external_source === "whatsapp_chatbot" &&
                  !lead.bot_ativo ? (
                    <Badge variant="warning">Pronto para contato humano</Badge>
                  ) : null}
                </div>
              ) : null}

              {!isCreate && lead?.external_source ? (
                <div className="rounded-md border border-dashed border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-muted-foreground">
                  source:{" "}
                  <span className="text-emerald-400">{lead.external_source}</span>
                  {lead.external_id ? (
                    <>
                      {" "}
                      · id:{" "}
                      <span className="text-emerald-400">{lead.external_id}</span>
                    </>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contato">Contato</Label>
                <Input
                  id="contato"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="orcamento">Orçamento (R$)</Label>
                  <Input
                    id="orcamento"
                    type="number"
                    value={orcamento}
                    onChange={(e) => setOrcamento(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regiao">Região</Label>
                  <Input
                    id="regiao"
                    value={regiao}
                    onChange={(e) => setRegiao(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Etapa do funil</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FunnelStatus)}
                  className="flex h-9 w-full rounded-md border border-input bg-surface-deep/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/50"
                >
                  {FUNNEL_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origem">Origem</Label>
                <select
                  id="origem"
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value as LeadOrigem)}
                  className="flex h-9 w-full rounded-md border border-input bg-surface-deep/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/50"
                >
                  {(Object.keys(ORIGEM_LABELS) as LeadOrigem[]).map((key) => (
                    <option key={key} value={key}>
                      {ORIGEM_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isVip}
                  onChange={(e) => setIsVip(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-[#d4af37]"
                />
                Lead VIP
              </label>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="notas">Anotações de qualificação</Label>
                <Textarea
                  id="notas"
                  rows={5}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Perfil, preferências, objeções..."
                />
              </div>

              <Button
                variant="gold"
                className="w-full"
                onClick={handleSave}
                disabled={saving || !nome.trim() || !contato.trim()}
              >
                {saving
                  ? "Salvando..."
                  : isCreate
                    ? "Criar lead"
                    : "Salvar alterações"}
              </Button>

              {!isCreate &&
              (status === "pos_venda" || lead?.status_funil === "pos_venda") ? (
                <Button variant="outline" className="w-full" asChild>
                  <Link
                    href={`/financeiro?tab=comissoes&lead=${lead?.id ?? ""}`}
                    onClick={() => onOpenChange(false)}
                  >
                    <Wallet className="h-4 w-4" />
                    Gerar comissão no Financeiro
                  </Link>
                </Button>
              ) : null}

              {!isCreate && onDelete ? (
                <Button
                  variant="outline"
                  className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Excluindo..." : "Excluir lead"}
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Somente leitura — continue a conversa no WhatsApp do corretor.
                Use a aba Dados para qualificar o lead no CRM.
              </p>
              <WhatsappThread messages={sortedMessages} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
