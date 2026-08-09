-- Financeiro completo: despesas recorrentes + comissões venda/avulsa
-- Run after 002_financeiro.sql

alter table public.despesas
  add column if not exists recorrente boolean not null default false;

-- Allow custom category labels (keep existing enum values as text)
do $$ begin
  alter table public.despesas
    alter column categoria type text using categoria::text;
exception when others then
  -- already text or cannot cast — ignore
  null;
end $$;

alter table public.comissoes
  alter column unidade_id drop not null;

alter table public.comissoes
  add column if not exists lead_id uuid references public.leads (id) on delete set null;

alter table public.comissoes
  add column if not exists tipo text not null default 'venda'
    check (tipo in ('venda', 'avulsa'));

alter table public.comissoes
  add column if not exists descricao text;

alter table public.comissoes
  add column if not exists num_parcelas int not null default 1;

create index if not exists comissoes_lead_idx on public.comissoes (lead_id);
create index if not exists comissoes_tipo_idx on public.comissoes (tipo);
