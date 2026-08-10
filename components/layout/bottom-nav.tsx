"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-surface-deep/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Navegação principal"
    >
      <ul className="mx-auto flex h-16 max-w-lg items-stretch justify-between px-1">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex min-w-0 flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-0.5 px-1 text-[10px] transition-colors",
                  active
                    ? "text-gold-light"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn("h-5 w-5 shrink-0", active && "text-gold")}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
