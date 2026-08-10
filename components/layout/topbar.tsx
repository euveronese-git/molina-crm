"use client";

import { Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useShell } from "@/components/layout/app-shell";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const demo = !isSupabaseConfigured();
  const { toggleMobileNav } = useShell();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/50 bg-background/80 px-3 backdrop-blur sm:h-16 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={toggleMobileNav}
          className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-medium tracking-tight text-foreground sm:text-lg">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {demo ? <Badge variant="gold">Modo demo</Badge> : null}
        <p className="hidden text-xs text-muted-foreground sm:block">
          Molina CRM
        </p>
      </div>
    </header>
  );
}
