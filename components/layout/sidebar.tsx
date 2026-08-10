"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/brand-logo";
import { useShell } from "@/components/layout/app-shell";
import { NAV_ITEMS } from "@/components/layout/nav-items";

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-border/50 px-5">
        <BrandLogo />
        <div className="min-w-0 flex-1">
          <p className="truncate font-brand text-sm tracking-[0.12em] text-gold-light">
            MOLINA
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            CRM · Lançamentos
          </p>
        </div>
        {onNavigate ? (
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-md px-2.5 py-2.5 text-sm transition-colors",
                active
                  ? "bg-gold/10 text-gold-light"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-gold")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/50 p-3">
        <p className="text-[10px] leading-relaxed text-muted-foreground/80">
          Molina Transações Imobiliárias
          <br />
          Barra da Tijuca · RJ
        </p>
      </div>
    </>
  );
}

export function Sidebar() {
  const { mobileNavOpen, closeMobileNav } = useShell();

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden h-full w-56 shrink-0 flex-col border-r border-border/50 bg-surface-deep lg:flex">
        <NavContent />
      </aside>

      {/* Mobile / tablet drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileNavOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileNavOpen}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity",
            mobileNavOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={closeMobileNav}
          aria-label="Fechar menu"
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col border-r border-border/50 bg-surface-deep shadow-xl transition-transform duration-200 ease-out",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <NavContent onNavigate={closeMobileNav} />
        </aside>
      </div>
    </>
  );
}
