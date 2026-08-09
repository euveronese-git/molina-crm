# Handoff — Molina CRM

## O que é o projeto

CRM **interno** (não site público) para **Molina Transações Imobiliárias** — corretor **Victor Molina**, agente de **lançamentos** na Barra da Tijuca/RJ que vende unidades de **várias construtoras** ao mesmo tempo.

Diferencial vs corretor de revenda: funil de leads + **mapa de unidades por empreendimento** + **comissões parceladas** + caixa operacional (despesas).

**Pasta:** `C:\Users\gabri\Projects\molina-crm`  
**Identidade:** tema dark `#0b0f17` + accent dourado `#d4af37`; fontes Plus Jakarta Sans / Playfair Display / Cinzel (extraídas de https://molinaimoveis.netlify.app). Logo: `public/logo/molinalogo.png`.

## Stack

| Camada | Tecnologia |
|--------|------------|
| App | Next.js **14.2.35** App Router + TypeScript |
| UI | Tailwind + shadcn-like + Recharts |
| Backend alvo | Supabase (Postgres + Auth + Storage) |
| Deploy alvo | **Netlify** (`netlify.toml` + `@netlify/plugin-nextjs`) |
| WhatsApp | Edge Function `whatsapp-webhook` (chatbot) + rota Next `/api/webhooks/evolution` (Evolution cru) |

**Modo demo:** sem `.env.local` com Supabase, o app roda com dados em memória (`lib/demo-data.ts`). Mutations somem no refresh até o banco estar ligado.

## Rotas entregues

| Rota | Função |
|------|--------|
| `/` | Dashboard (KPIs + gráficos) |
| `/pipeline` | Kanban 7 etapas (drag-and-drop) |
| `/empreendimentos` | Lista + grade de unidades + CRUD |
| `/leads` | Tabela + CRUD + conversa WA read-only |
| `/financeiro` | Visão / Comissões / Despesas (CRUD completo) |
| `/login` | Auth (ou bypass demo) |
| `POST /api/webhooks/evolution` | Payload Evolution cru (legado / direto) |
| `POST …/functions/v1/whatsapp-webhook` | Chatbot → lead + mensagens (Edge Function) |

## O que já fizemos (histórico desta conversa)

1. **Bootstrap** — Next 14, design system Molina, shell sidebar/topbar, placeholder→logo real  
2. **Schema + RLS** — migrations `001`–`004` + seeds  
3. **Pipeline** — Kanban Captação→Pós-venda  
4. **Dashboard / Empreendimentos / Leads / Financeiro** — telas principais  
5. **CRUD nas telas** — leads, empreendimentos, unidades (sem `/admin` operacional)  
6. **WhatsApp leitura** — `bot_ativo`, `mensagens_whatsapp`, webhook Evolution, aba no LeadSheet, badge “Pronto para contato humano”  
6b. **Edge Function `whatsapp-webhook`** — JSON do chatbot separado → upsert lead (`external_source=whatsapp_chatbot`) + mensagem + triagem (`bot_ativo=false`)  
7. **Financeiro completo** — despesas (recorrente, categoria custom, delete), comissões venda/avulsa + parcelas, CTA pós-venda → Financeiro  
8. **Ops** — limpeza de `.next` / multi-port (tela branca por cache corrompido); usar **um** `npm run dev` em `http://localhost:3000`
9. **Go-live Netlify** — `netlify.toml`, leituras Supabase em Dashboard/Leads/Empreendimentos/Financeiro, docs de Auth + env

## Arquivos-chave

- App: `app/(app)/*`, `app/(auth)/login`, `middleware.ts`  
- Dados: `lib/types.ts`, `lib/demo-data.ts`, `lib/data/crm.ts`, `lib/metrics.ts`  
- Actions: `lib/actions/{leads,empreendimentos,financeiro}.ts`  
- SQL: `supabase/migrations/001_initial.sql` … `004_financeiro_completo.sql`  
- Edge Function: `supabase/functions/whatsapp-webhook/` (secret `WEBHOOK_SECRET`)  
- Deploy: `netlify.toml`  
- Env: `.env.example` (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `EVOLUTION_WEBHOOK_SECRET`, `WEBHOOK_SECRET`)

## Como subir

```bash
cd C:\Users\gabri\Projects\molina-crm
cp .env.example .env.local   # opcional até ter Supabase
npm install
npm run dev                  # http://localhost:3000
```

Supabase: rodar migrations em ordem `001→004`, depois `seed.sql` + `seed_financeiro.sql`; criar usuário Auth; colar keys.

**Atenção:** não rodar `npm run build` com `next dev` ligado (corrompe `.next` → tela branca / `Cannot find module './NNN.js'`).

### Edge Function whatsapp-webhook

```bash
npx supabase functions deploy whatsapp-webhook --project-ref <PROJECT_REF>
npx supabase secrets set WEBHOOK_SECRET="um-segredo-forte" --project-ref <PROJECT_REF>
```

**URL:** `https://<PROJECT_REF>.supabase.co/functions/v1/whatsapp-webhook`

**Secret no painel:** Project Settings → Edge Functions → Secrets → `WEBHOOK_SECRET`.

Headers do chatbot: `Authorization: Bearer <ANON_KEY>` + `X-Webhook-Secret: <WEBHOOK_SECRET>`.

```bash
curl -X POST "https://<PROJECT_REF>.supabase.co/functions/v1/whatsapp-webhook" \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "X-Webhook-Secret: um-segredo-forte" \
  -H "Content-Type: application/json" \
  -d '{"telefone":"5521999999999","nome":"","mensagem":{"conteudo":"Oi","direcao":"recebida","timestamp":"2026-08-07T20:00:00Z"},"triagem_completa":false}'
```

### Deploy Netlify + Auth (Victor)

1. **Supabase Auth:** Providers → Email (password) ON.  
2. **URL Configuration:** Site URL = `https://<site>.netlify.app`; Redirect URLs com a mesma origem.  
3. **Usuário:** Authentication → Users → Add user (e-mail/senha do Victor). Profile criado pelo trigger `handle_new_user` (RLS: role `authenticated` já tem CRUD).  
4. **Netlify:** conectar o repo; env vars `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.  
5. **Teste:** `/login` → credenciais do Victor → `/pipeline` sem modo demo; `/leads` mostra dados reais.

## Ainda não feito / próximo

- Upload plantas/fotos no Storage  
- Deploy da Edge Function `whatsapp-webhook` + secret no projeto Supabase (produção)  
- Integração real do chatbot → URL da function em produção  
- Domínio custom na Netlify (se necessário)  
- Admin só para usuários/config (se necessário)

## Contato produto

Victor Molina — Molina Transações Imobiliárias — Barra da Tijuca, RJ. Site institucional: https://molinaimoveis.netlify.app
