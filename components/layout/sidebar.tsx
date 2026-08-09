"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  Building2,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/brand-logo";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/empreendimentos", label: "Empreendimentos", icon: Building2 },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[68px] flex-col border-r border-border/50 bg-surface-deep lg:w-56">
      <div className="flex h-16 items-center gap-3 border-b border-border/50 px-3 lg:px-5">
        <BrandLogo />
        <div className="hidden min-w-0 lg:block">
          <p className="truncate font-brand text-sm tracking-[0.12em] text-gold-light">
            MOLINA
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            CRM · Lançamentos
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2 lg:p-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-gold/10 text-gold-light"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-gold")} />
              <span className="hidden truncate lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-border/50 p-3 lg:block">
        <p className="text-[10px] leading-relaxed text-muted-foreground/80">
          Molina Transações Imobiliárias
          <br />
          Barra da Tijuca · RJ
        </p>
      </div>
    </aside>
  );
}
