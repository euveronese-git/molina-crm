"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const demo = !isSupabaseConfigured();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (demo) {
      router.push("/pipeline");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      router.push("/pipeline");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface-deep px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,175,55,0.12), transparent)",
        }}
      />
      <Card className="relative w-full max-w-md border-border/60 bg-card/90 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto">
            <BrandLogo className="h-12 w-12" />
          </div>
          <div>
            <CardTitle className="font-brand text-xl tracking-[0.15em] text-gold-light">
              MOLINA
            </CardTitle>
            <CardDescription className="mt-1">
              CRM interno · Transações Imobiliárias
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {demo ? (
              <div className="rounded-md border border-gold/25 bg-gold/5 px-3 py-2 text-xs text-muted-foreground">
                Modo demo ativo — configure o{" "}
                <code className="text-gold-light">.env.local</code> com as keys
                do Supabase para autenticação real.
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="victor@molina.com"
                required={!demo}
                disabled={demo}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!demo}
                disabled={demo}
              />
            </div>

            {error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : null}

            <Button type="submit" variant="gold" className="w-full" disabled={loading}>
              {demo ? "Entrar no pipeline (demo)" : loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
