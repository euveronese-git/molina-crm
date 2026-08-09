"use client";

import { useMemo, useState } from "react";
import type { Empreendimento, Lead, Unidade, UnidadeStatus } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Topbar } from "@/components/layout/topbar";
import {
  createEmpreendimento,
  createUnidade,
  deleteEmpreendimento,
  deleteUnidade,
  updateEmpreendimento,
  updateUnidade,
} from "@/lib/actions/empreendimentos";
import { Pencil, Plus, Trash2 } from "lucide-react";

const STATUS_STYLE: Record<
  Unidade["status"],
  { label: string; cell: string; badge: "success" | "warning" | "gold" }
> = {
  disponivel: {
    label: "Disponível",
    cell: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25",
    badge: "success",
  },
  reservado: {
    label: "Reservado",
    cell: "border-amber-500/40 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25",
    badge: "warning",
  },
  vendido: {
    label: "Vendido",
    cell: "border-gold/40 bg-gold/10 text-gold-light hover:bg-gold/20",
    badge: "gold",
  },
};

type Props = {
  initialEmpreendimentos: Empreendimento[];
  initialUnidades: Unidade[];
  initialLeads: Lead[];
  demoMode: boolean;
};

export function EmpreendimentosClient({
  initialEmpreendimentos,
  initialUnidades,
  initialLeads,
  demoMode,
}: Props) {
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>(
    initialEmpreendimentos
  );
  const [unidades, setUnidades] = useState<Unidade[]>(initialUnidades);
  const [leads] = useState<Lead[]>(initialLeads);

  const [selectedEmpId, setSelectedEmpId] = useState(
    initialEmpreendimentos[0]?.id ?? ""
  );
  const selectedEmp =
    empreendimentos.find((e) => e.id === selectedEmpId) ?? empreendimentos[0];

  const [selectedUnit, setSelectedUnit] = useState<Unidade | null>(null);
  const [unitMode, setUnitMode] = useState<"create" | "edit">("edit");
  const [unitOpen, setUnitOpen] = useState(false);

  const [empDialog, setEmpDialog] = useState(false);
  const [empMode, setEmpMode] = useState<"create" | "edit">("create");
  const [empNome, setEmpNome] = useState("");
  const [empConstrutora, setEmpConstrutora] = useState("");
  const [empEndereco, setEmpEndereco] = useState("");

  // unit form
  const [uAndar, setUAndar] = useState("");
  const [uNumero, setUNumero] = useState("");
  const [uMetragem, setUMetragem] = useState("");
  const [uValor, setUValor] = useState("");
  const [uStatus, setUStatus] = useState<UnidadeStatus>("disponivel");
  const [uComprador, setUComprador] = useState("");

  const units = useMemo(() => {
    if (!selectedEmp) return [];
    return unidades
      .filter((u) => u.empreendimento_id === selectedEmp.id)
      .sort((a, b) => b.andar - a.andar || a.numero.localeCompare(b.numero));
  }, [unidades, selectedEmp]);

  const andares = useMemo(() => {
    const map = new Map<number, Unidade[]>();
    units.forEach((u) => {
      const list = map.get(u.andar) ?? [];
      list.push(u);
      map.set(u.andar, list);
    });
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [units]);

  const counts = {
    disponivel: units.filter((u) => u.status === "disponivel").length,
    reservado: units.filter((u) => u.status === "reservado").length,
    vendido: units.filter((u) => u.status === "vendido").length,
  };

  function openCreateEmp() {
    setEmpMode("create");
    setEmpNome("");
    setEmpConstrutora("");
    setEmpEndereco("");
    setEmpDialog(true);
  }

  function openEditEmp() {
    if (!selectedEmp) return;
    setEmpMode("edit");
    setEmpNome(selectedEmp.nome);
    setEmpConstrutora(selectedEmp.construtora);
    setEmpEndereco(selectedEmp.endereco ?? "");
    setEmpDialog(true);
  }

  async function saveEmp() {
    if (!empNome.trim() || !empConstrutora.trim()) return;
    if (empMode === "create") {
      const id = `emp-${Date.now()}`;
      const emp: Empreendimento = {
        id,
        nome: empNome.trim(),
        construtora: empConstrutora.trim(),
        endereco: empEndereco.trim() || null,
        created_at: new Date().toISOString(),
      };
      setEmpreendimentos((prev) => [...prev, emp]);
      setSelectedEmpId(id);
      await createEmpreendimento({
        nome: emp.nome,
        construtora: emp.construtora,
        endereco: emp.endereco,
      });
    } else if (selectedEmp) {
      setEmpreendimentos((prev) =>
        prev.map((e) =>
          e.id === selectedEmp.id
            ? {
                ...e,
                nome: empNome.trim(),
                construtora: empConstrutora.trim(),
                endereco: empEndereco.trim() || null,
              }
            : e
        )
      );
      await updateEmpreendimento(selectedEmp.id, {
        nome: empNome.trim(),
        construtora: empConstrutora.trim(),
        endereco: empEndereco.trim() || null,
      });
    }
    setEmpDialog(false);
  }

  async function removeEmp() {
    if (!selectedEmp) return;
    if (
      !window.confirm(
        `Excluir "${selectedEmp.nome}" e todas as unidades?`
      )
    )
      return;
    const id = selectedEmp.id;
    setEmpreendimentos((prev) => prev.filter((e) => e.id !== id));
    setUnidades((prev) => prev.filter((u) => u.empreendimento_id !== id));
    const next = empreendimentos.find((e) => e.id !== id);
    setSelectedEmpId(next?.id ?? "");
    await deleteEmpreendimento(id);
  }

  function openCreateUnit() {
    setUnitMode("create");
    setSelectedUnit(null);
    setUAndar("");
    setUNumero("");
    setUMetragem("");
    setUValor("");
    setUStatus("disponivel");
    setUComprador("");
    setUnitOpen(true);
  }

  function openEditUnit(u: Unidade) {
    setUnitMode("edit");
    setSelectedUnit(u);
    setUAndar(String(u.andar));
    setUNumero(u.numero);
    setUMetragem(u.metragem != null ? String(u.metragem) : "");
    setUValor(u.valor != null ? String(u.valor) : "");
    setUStatus(u.status);
    setUComprador(u.comprador_lead_id ?? "");
    setUnitOpen(true);
  }

  async function saveUnit() {
    if (!selectedEmp || !uNumero.trim()) return;
    const payload = {
      andar: Number(uAndar) || 0,
      numero: uNumero.trim(),
      metragem: uMetragem ? Number(uMetragem) : null,
      valor: uValor ? Number(uValor) : null,
      status: uStatus,
      comprador_lead_id: uComprador || null,
    };

    if (unitMode === "create") {
      const id = `uni-${Date.now()}`;
      const unit: Unidade = {
        id,
        empreendimento_id: selectedEmp.id,
        ...payload,
        planta_url: null,
        created_at: new Date().toISOString(),
      };
      setUnidades((prev) => [...prev, unit]);
      await createUnidade({
        empreendimento_id: selectedEmp.id,
        ...payload,
      });
    } else if (selectedUnit) {
      setUnidades((prev) =>
        prev.map((u) => (u.id === selectedUnit.id ? { ...u, ...payload } : u))
      );
      await updateUnidade(selectedUnit.id, payload);
    }
    setUnitOpen(false);
  }

  async function removeUnit() {
    if (!selectedUnit) return;
    if (!window.confirm(`Excluir unidade ${selectedUnit.numero}?`)) return;
    const id = selectedUnit.id;
    setUnidades((prev) => prev.filter((u) => u.id !== id));
    setUnitOpen(false);
    await deleteUnidade(id);
  }

  if (!selectedEmp) {
    return (
      <>
        <Topbar title="Empreendimentos" subtitle="Nenhum lançamento cadastrado" />
        <main className="flex flex-1 items-center justify-center p-6">
          <Button variant="gold" onClick={openCreateEmp}>
            <Plus className="h-4 w-4" />
            Novo empreendimento
          </Button>
        </main>
        <EmpDialog
          open={empDialog}
          onOpenChange={setEmpDialog}
          mode={empMode}
          nome={empNome}
          construtora={empConstrutora}
          endereco={empEndereco}
          setNome={setEmpNome}
          setConstrutora={setEmpConstrutora}
          setEndereco={setEmpEndereco}
          onSave={saveEmp}
        />
      </>
    );
  }

  return (
    <>
      <Topbar
        title="Empreendimentos"
        subtitle={
          demoMode
            ? "Mapa de unidades · modo demo"
            : "Mapa de unidades · múltiplas construtoras"
        }
      />
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 overflow-y-auto border-r border-border/50 p-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Lançamentos
            </p>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={openCreateEmp}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-1">
            {empreendimentos.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => setSelectedEmpId(emp.id)}
                className={cn(
                  "w-full rounded-md border px-3 py-2.5 text-left transition-colors",
                  selectedEmp.id === emp.id
                    ? "border-gold/35 bg-gold/10"
                    : "border-transparent hover:bg-accent"
                )}
              >
                <p className="font-serif text-sm italic text-foreground">
                  {emp.nome}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {emp.construtora}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl italic text-gold-light">
                {selectedEmp.nome}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedEmp.construtora}
                {selectedEmp.endereco ? ` · ${selectedEmp.endereco}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success">{counts.disponivel} disponíveis</Badge>
              <Badge variant="warning">{counts.reservado} reservadas</Badge>
              <Badge variant="gold">{counts.vendido} vendidas</Badge>
              <Button size="sm" variant="outline" onClick={openEditEmp}>
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
              <Button size="sm" variant="outline" onClick={removeEmp}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="gold" onClick={openCreateUnit}>
                <Plus className="h-3.5 w-3.5" />
                Unidade
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {andares.length === 0 ? (
              <div className="rounded-md border border-dashed border-border/50 px-4 py-12 text-center text-sm text-muted-foreground">
                Nenhuma unidade — clique em + Unidade para cadastrar.
              </div>
            ) : (
              andares.map(([andar, list]) => (
                <div key={andar} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                    {andar}º
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {list.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => openEditUnit(u)}
                        className={cn(
                          "flex h-14 w-16 flex-col items-center justify-center rounded-md border text-xs transition-all",
                          STATUS_STYLE[u.status].cell
                        )}
                      >
                        <span className="font-medium">{u.numero}</span>
                        <span className="text-[9px] opacity-70">
                          {u.metragem ? `${u.metragem}m²` : "—"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/60" /> Disponível
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500/60" /> Reservado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-gold/60" /> Vendido
            </span>
          </div>
        </div>
      </main>

      <EmpDialog
        open={empDialog}
        onOpenChange={setEmpDialog}
        mode={empMode}
        nome={empNome}
        construtora={empConstrutora}
        endereco={empEndereco}
        setNome={setEmpNome}
        setConstrutora={setEmpConstrutora}
        setEndereco={setEmpEndereco}
        onSave={saveEmp}
      />

      <Sheet open={unitOpen} onOpenChange={setUnitOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {unitMode === "create"
                ? "Nova unidade"
                : `Unidade ${selectedUnit?.numero ?? ""}`}
            </SheetTitle>
            <SheetDescription>
              {selectedEmp.nome} · {selectedEmp.construtora}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Andar</Label>
                <Input
                  type="number"
                  value={uAndar}
                  onChange={(e) => setUAndar(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Número</Label>
                <Input value={uNumero} onChange={(e) => setUNumero(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Metragem (m²)</Label>
                <Input
                  type="number"
                  value={uMetragem}
                  onChange={(e) => setUMetragem(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  value={uValor}
                  onChange={(e) => setUValor(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={uStatus}
                onChange={(e) => setUStatus(e.target.value as UnidadeStatus)}
                className="flex h-9 w-full rounded-md border border-input bg-surface-deep/40 px-3 text-sm"
              >
                <option value="disponivel">Disponível</option>
                <option value="reservado">Reservado</option>
                <option value="vendido">Vendido</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Comprador (lead)</Label>
              <select
                value={uComprador}
                onChange={(e) => setUComprador(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-surface-deep/40 px-3 text-sm"
              >
                <option value="">— Nenhum —</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome}
                  </option>
                ))}
              </select>
            </div>
            {unitMode === "edit" && selectedUnit ? (
              <p className="text-lg text-gold">
                {formatCurrency(
                  uValor ? Number(uValor) : selectedUnit.valor
                )}
              </p>
            ) : null}
            <div className="rounded-md border border-dashed border-border/60 bg-surface-deep/40 px-3 py-4 text-xs text-muted-foreground">
              Planta — placeholder para upload no Supabase Storage
            </div>
            <Button variant="gold" className="w-full" onClick={saveUnit}>
              {unitMode === "create" ? "Criar unidade" : "Salvar alterações"}
            </Button>
            {unitMode === "edit" ? (
              <Button
                variant="outline"
                className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10"
                onClick={removeUnit}
              >
                Excluir unidade
              </Button>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function EmpDialog({
  open,
  onOpenChange,
  mode,
  nome,
  construtora,
  endereco,
  setNome,
  setConstrutora,
  setEndereco,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: "create" | "edit";
  nome: string;
  construtora: string;
  endereco: string;
  setNome: (v: string) => void;
  setConstrutora: (v: string) => void;
  setEndereco: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Novo empreendimento" : "Editar empreendimento"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Construtora</Label>
            <Input
              value={construtora}
              onChange={(e) => setConstrutora(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
          </div>
          <Button variant="gold" className="w-full" onClick={onSave}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
