"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const demo = !isSupabaseConfigured();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur">
      <div>
        <h1 className="text-lg font-medium tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        {demo ? (
          <Badge variant="gold">Modo demo</Badge>
        ) : null}
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">Victor Molina</p>
          <p className="text-[11px] text-muted-foreground">Corretor · Lançamentos</p>
        </div>
        <Avatar className="h-9 w-9 border border-gold/30">
          <AvatarFallback>VM</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
