# Molina CRM

CRM interno da **Molina Transações Imobiliárias** (Victor Molina) — pipeline de lançamentos com múltiplas construtoras na Barra da Tijuca e região.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (tema dark Molina)
- Supabase (Postgres + Auth + Storage)
- Deploy: **Netlify** (`netlify.toml` + `@netlify/plugin-nextjs`)

## Setup rápido

```bash
cp .env.example .env.local
# Preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

Sem keys do Supabase, o app sobe em **modo demo** (dados fictícios). Com keys, Dashboard / Pipeline / Leads / Empreendimentos / Financeiro leem o banco.

### Banco (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com)
2. SQL Editor → rode migrations `001` → `004` (+ seeds opcionais)
3. Auth → Providers → **Email** ligado (e-mail/senha)
4. Authentication → Users → **Add user** (conta do Victor)
5. Cole URL + anon key no `.env.local`

### Logo

```
public/logo/molinalogo.png
```

## Deploy (Netlify)

1. Conecte o repositório em [app.netlify.com](https://app.netlify.com)
2. Build: detectado via `netlify.toml` (`npm run build` + plugin Next)
3. Environment variables (Site settings → Environment variables):

| Variável | Obrigatória |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Só se usar `/api/webhooks/evolution` |
| `EVOLUTION_WEBHOOK_SECRET` | Só se usar `/api/webhooks/evolution` |

4. No Supabase Auth → URL Configuration:
   - **Site URL:** `https://<seu-site>.netlify.app`
   - **Redirect URLs:** incluir a mesma origem

5. Redeploy após salvar as env vars

### Confirmar login em produção

1. Abra `https://<seu-site>.netlify.app/login`
2. Entre com e-mail/senha do Victor
3. Deve redirecionar para `/pipeline` (sem banner “modo demo”)
4. Em `/leads`, leads do chatbot aparecem quando a Edge Function gravar no banco

### Chatbot (Edge Function — Supabase, não Netlify)

```bash
npx supabase functions deploy whatsapp-webhook --project-ref <PROJECT_REF>
npx supabase secrets set WEBHOOK_SECRET="um-segredo-forte" --project-ref <PROJECT_REF>
```

URL: `https://<PROJECT_REF>.supabase.co/functions/v1/whatsapp-webhook`  
Headers: `Authorization: Bearer <ANON_KEY>` + `X-Webhook-Secret: <WEBHOOK_SECRET>`

### Webhook Evolution (rota Next, opcional)

`POST /api/webhooks/evolution` com `x-webhook-secret` — requer service role + `EVOLUTION_WEBHOOK_SECRET` na Netlify.
