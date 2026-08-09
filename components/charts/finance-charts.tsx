"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const GOLD = "#d4af37";
const GOLD_LIGHT = "#e6c687";
const MUTED = "#6b7280";
const GRID = "rgba(255,255,255,0.06)";
const PIE_COLORS = [
  "#d4af37",
  "#e6c687",
  "#c5a059",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#94a3b8",
];

const tooltipStyle = {
  backgroundColor: "#121824",
  border: "1px solid rgba(212,175,55,0.25)",
  borderRadius: 8,
  fontSize: 12,
};

export function VendasPorEmpreendimentoChart({
  data,
}: {
  data: { nome: string; vendidas: number; reservadas: number; disponiveis: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="nome" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(212,175,55,0.06)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="vendidas" name="Vendidas" fill={GOLD} radius={[4, 4, 0, 0]} />
        <Bar dataKey="reservadas" name="Reservadas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="disponiveis" name="Disponíveis" fill="#334155" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FluxoCaixaChart({
  data,
}: {
  data: { label: string; receitas: number; despesas: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: MUTED, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${Math.round(v / 1000)}k`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => formatCurrency(Number(value ?? 0))}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="receitas"
          name="Comissões recebidas"
          stroke={GOLD}
          strokeWidth={2}
          dot={{ fill: GOLD, r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="despesas"
          name="Despesas pagas"
          stroke="#94a3b8"
          strokeWidth={2}
          dot={{ fill: "#94a3b8", r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DespesasCategoriaChart({
  data,
}: {
  data: { label: string; valor: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="valor"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={58}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => formatCurrency(Number(value ?? 0))}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export { GOLD, GOLD_LIGHT };
