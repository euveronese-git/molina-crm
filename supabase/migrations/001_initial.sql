-- Molina CRM — initial schema + RLS
-- Run in Supabase SQL Editor or via `supabase db push`

create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type funnel_status as enum (
    'captacao',
    'qualificacao',
    'apresentacao',
    'visita_plantao',
    'proposta_reserva',
    'assinatura',
    'pos_venda'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type lead_origem as enum (
    'whatsapp',
    'site',
    'instagram',
    'indicacao',
    'outro'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type unidade_status as enum (
    'disponivel',
    'reservado',
    'vendido'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type parcela_status as enum (
    'previsto',
    'recebido'
  );
exception when duplicate_object then null;
end $$;

-- Profiles (mirrors auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  role text not null default 'corretor' check (role in ('admin', 'corretor', 'assistente')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  contato text not null,
  origem lead_origem not null default 'outro',
  orcamento numeric(14, 2),
  regiao_interesse text,
  status_funil funnel_status not null default 'captacao',
  notas text,
  is_vip boolean not null default false,
  -- Placeholder for future WhatsApp chatbot integration
  external_source text,
  external_id text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_status_funil_idx on public.leads (status_funil);
create index if not exists leads_origem_idx on public.leads (origem);
create unique index if not exists leads_external_unique
  on public.leads (external_source, external_id)
  where external_source is not null and external_id is not null;

-- Empreendimentos
create table if not exists public.empreendimentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  construtora text not null,
  endereco text,
  created_at timestamptz not null default now()
);

-- Unidades
create table if not exists public.unidades (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references public.empreendimentos (id) on delete cascade,
  andar int,
  numero text not null,
  metragem numeric(10, 2),
  valor numeric(14, 2),
  status unidade_status not null default 'disponivel',
  comprador_lead_id uuid references public.leads (id) on delete set null,
  planta_url text,
  created_at timestamptz not null default now()
);

create index if not exists unidades_empreendimento_idx on public.unidades (empreendimento_id);
create index if not exists unidades_status_idx on public.unidades (status);

-- Comissões
create table if not exists public.comissoes (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid not null unique references public.unidades (id) on delete cascade,
  valor_total numeric(14, 2) not null,
  created_at timestamptz not null default now()
);

-- Parcelas de comissão
create table if not exists public.parcelas_comissao (
  id uuid primary key default gen_random_uuid(),
  comissao_id uuid not null references public.comissoes (id) on delete cascade,
  valor numeric(14, 2) not null,
  data_prevista date not null,
  status parcela_status not null default 'previsto',
  created_at timestamptz not null default now()
);

create index if not exists parcelas_comissao_idx on public.parcelas_comissao (comissao_id);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- =====================
-- RLS — authenticated only (no anon access)
-- =====================
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.empreendimentos enable row level security;
alter table public.unidades enable row level security;
alter table public.comissoes enable row level security;
alter table public.parcelas_comissao enable row level security;

-- Drop existing policies if re-running
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles','leads','empreendimentos','unidades','comissoes','parcelas_comissao')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- Profiles
create policy "profiles_select_authenticated"
  on public.profiles for select to authenticated using (true);
create policy "profiles_update_own"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Leads
create policy "leads_select_authenticated"
  on public.leads for select to authenticated using (true);
create policy "leads_insert_authenticated"
  on public.leads for insert to authenticated with check (true);
create policy "leads_update_authenticated"
  on public.leads for update to authenticated using (true);
create policy "leads_delete_authenticated"
  on public.leads for delete to authenticated using (true);

-- Empreendimentos
create policy "empreendimentos_select_authenticated"
  on public.empreendimentos for select to authenticated using (true);
create policy "empreendimentos_insert_authenticated"
  on public.empreendimentos for insert to authenticated with check (true);
create policy "empreendimentos_update_authenticated"
  on public.empreendimentos for update to authenticated using (true);
create policy "empreendimentos_delete_authenticated"
  on public.empreendimentos for delete to authenticated using (true);

-- Unidades
create policy "unidades_select_authenticated"
  on public.unidades for select to authenticated using (true);
create policy "unidades_insert_authenticated"
  on public.unidades for insert to authenticated with check (true);
create policy "unidades_update_authenticated"
  on public.unidades for update to authenticated using (true);
create policy "unidades_delete_authenticated"
  on public.unidades for delete to authenticated using (true);

-- Comissões
create policy "comissoes_select_authenticated"
  on public.comissoes for select to authenticated using (true);
create policy "comissoes_insert_authenticated"
  on public.comissoes for insert to authenticated with check (true);
create policy "comissoes_update_authenticated"
  on public.comissoes for update to authenticated using (true);
create policy "comissoes_delete_authenticated"
  on public.comissoes for delete to authenticated using (true);

-- Parcelas
create policy "parcelas_select_authenticated"
  on public.parcelas_comissao for select to authenticated using (true);
create policy "parcelas_insert_authenticated"
  on public.parcelas_comissao for insert to authenticated with check (true);
create policy "parcelas_update_authenticated"
  on public.parcelas_comissao for update to authenticated using (true);
create policy "parcelas_delete_authenticated"
  on public.parcelas_comissao for delete to authenticated using (true);

-- Storage buckets (run after enabling Storage)
-- insert into storage.buckets (id, name, public) values
--   ('plantas', 'plantas', false),
--   ('fotos-unidades', 'fotos-unidades', false),
--   ('branding', 'branding', false)
-- on conflict do nothing;
