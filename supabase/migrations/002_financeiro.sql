-- Molina CRM — financial module (despesas) + RLS
-- Run after 001_initial.sql

do $$ begin
  create type despesa_categoria as enum (
    'marketing',
    'plantao',
    'deslocamento',
    'ferramentas',
    'escritorio',
    'impostos',
    'pessoal',
    'outros'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type despesa_status as enum (
    'previsto',
    'pago'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.despesas (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  categoria despesa_categoria not null default 'outros',
  valor numeric(14, 2) not null,
  data_vencimento date not null,
  status despesa_status not null default 'previsto',
  fornecedor text,
  notas text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists despesas_data_idx on public.despesas (data_vencimento);
create index if not exists despesas_categoria_idx on public.despesas (categoria);
create index if not exists despesas_status_idx on public.despesas (status);

alter table public.despesas enable row level security;

drop policy if exists "despesas_select_authenticated" on public.despesas;
drop policy if exists "despesas_insert_authenticated" on public.despesas;
drop policy if exists "despesas_update_authenticated" on public.despesas;
drop policy if exists "despesas_delete_authenticated" on public.despesas;

create policy "despesas_select_authenticated"
  on public.despesas for select to authenticated using (true);
create policy "despesas_insert_authenticated"
  on public.despesas for insert to authenticated with check (true);
create policy "despesas_update_authenticated"
  on public.despesas for update to authenticated using (true);
create policy "despesas_delete_authenticated"
  on public.despesas for delete to authenticated using (true);
