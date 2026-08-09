import { cn, formatCurrency } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  gold,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  gold?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 transition-colors hover:border-gold/25">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className={cn("h-4 w-4", gold ? "text-gold" : "text-muted-foreground")} />
      </div>
      <p className={cn("text-2xl font-semibold tracking-tight", gold && "text-gold")}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-card p-5",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium">{title}</h3>
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export { formatCurrency };
