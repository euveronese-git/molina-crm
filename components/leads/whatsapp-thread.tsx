"use client";

import type { MensagemWhatsapp } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WhatsappThread({ messages }: { messages: MensagemWhatsapp[] }) {
  if (messages.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border/60 bg-surface-deep/40 px-4 py-10 text-center text-xs text-muted-foreground">
        Nenhuma mensagem registrada para este lead.
      </div>
    );
  }

  return (
    <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto rounded-md border border-border/40 bg-surface-deep/50 p-3">
      {messages.map((m) => {
        const received = m.direcao === "recebida";
        return (
          <div
            key={m.id}
            className={cn("flex", received ? "justify-start" : "justify-end")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                received
                  ? "rounded-bl-md bg-secondary text-foreground"
                  : "rounded-br-md bg-gold/20 text-gold-light"
              )}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{m.conteudo}</p>
              <p
                className={cn(
                  "mt-1 text-[10px]",
                  received ? "text-muted-foreground" : "text-gold/70"
                )}
              >
                {new Date(m.created_at).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {m.remetente ? ` · ${m.remetente}` : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
