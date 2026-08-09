"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gold/25 bg-surface",
        className
      )}
    >
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logo/molinalogo.png"
          alt="Molina Transações Imobiliárias"
          width={36}
          height={36}
          className="object-contain p-0.5"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-brand text-[11px] tracking-widest text-gold">M</span>
      )}
    </div>
  );
}
