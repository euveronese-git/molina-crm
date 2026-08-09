-- WhatsApp messages + bot_ativo on leads
-- Run after 001_initial.sql (+ optionally 002)

alter table public.leads
  add column if not exists bot_ativo boolean not null default true;

create table if not exists public.mensagens_whatsapp (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  direcao text not null check (direcao in ('recebida', 'enviada')),
  conteudo text not null,
  remetente text,
  external_message_id text,
  created_at timestamptz not null default now()
);

create index if not exists mensagens_whatsapp_lead_idx
  on public.mensagens_whatsapp (lead_id, created_at);

create unique index if not exists mensagens_whatsapp_external_unique
  on public.mensagens_whatsapp (external_message_id)
  where external_message_id is not null;

alter table public.mensagens_whatsapp enable row level security;

drop policy if exists "mensagens_select_authenticated" on public.mensagens_whatsapp;
create policy "mensagens_select_authenticated"
  on public.mensagens_whatsapp for select to authenticated using (true);

-- Inserts/updates only via service role (webhook) — no authenticated insert policy
