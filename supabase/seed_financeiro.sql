-- Extended seed: empreendimentos, unidades, comissoes, parcelas, despesas
-- Requires 001_initial.sql + 002_financeiro.sql + seed.sql (leads)

insert into public.empreendimentos (id, nome, construtora, endereco) values
  ('22222222-2222-2222-2222-222222222201', 'Artencena Design Residences', 'Artencena', 'Parque das Rosas · Barra da Tijuca'),
  ('22222222-2222-2222-2222-222222222202', 'CEO Corporate Executive Offices', 'CEO Incorporações', 'Av. Ayrton Senna · Barra da Tijuca'),
  ('22222222-2222-2222-2222-222222222203', 'Ocean Club Residences', 'Cyrela', 'Jardim Oceânico · Barra da Tijuca')
on conflict (id) do nothing;

-- Sample unidades (subset)
insert into public.unidades (id, empreendimento_id, andar, numero, metragem, valor, status, comprador_lead_id) values
  ('33333333-3333-3333-3333-333333333001', '22222222-2222-2222-2222-222222222201', 10, '1002', 136, 2100000, 'vendido', '11111111-1111-1111-1111-111111111111'),
  ('33333333-3333-3333-3333-333333333002', '22222222-2222-2222-2222-222222222201', 9, '901', 128, 1950000, 'vendido', '11111111-1111-1111-1111-111111111110'),
  ('33333333-3333-3333-3333-333333333003', '22222222-2222-2222-2222-222222222201', 12, '1204', 152, 2450000, 'reservado', '11111111-1111-1111-1111-111111111108'),
  ('33333333-3333-3333-3333-333333333004', '22222222-2222-2222-2222-222222222202', 3, '301', 300, null, 'vendido', '11111111-1111-1111-1111-111111111109'),
  ('33333333-3333-3333-3333-333333333005', '22222222-2222-2222-2222-222222222203', 12, '1201', 110, 3800000, 'vendido', '11111111-1111-1111-1111-111111111103')
on conflict (id) do nothing;

insert into public.comissoes (id, unidade_id, valor_total) values
  ('44444444-4444-4444-4444-444444444001', '33333333-3333-3333-3333-333333333001', 156000),
  ('44444444-4444-4444-4444-444444444002', '33333333-3333-3333-3333-333333333002', 48000),
  ('44444444-4444-4444-4444-444444444003', '33333333-3333-3333-3333-333333333004', 92000),
  ('44444444-4444-4444-4444-444444444004', '33333333-3333-3333-3333-333333333005', 210000)
on conflict (id) do nothing;

insert into public.parcelas_comissao (id, comissao_id, valor, data_prevista, status) values
  ('55555555-5555-5555-5555-555555555001', '44444444-4444-4444-4444-444444444001', 52000, '2026-06-15', 'recebido'),
  ('55555555-5555-5555-5555-555555555002', '44444444-4444-4444-4444-444444444001', 52000, '2026-07-15', 'recebido'),
  ('55555555-5555-5555-5555-555555555003', '44444444-4444-4444-4444-444444444001', 52000, '2026-08-15', 'previsto'),
  ('55555555-5555-5555-5555-555555555004', '44444444-4444-4444-4444-444444444002', 24000, '2026-08-05', 'recebido'),
  ('55555555-5555-5555-5555-555555555005', '44444444-4444-4444-4444-444444444002', 24000, '2026-09-05', 'previsto')
on conflict (id) do nothing;

insert into public.despesas (id, descricao, categoria, valor, data_vencimento, status, fornecedor) values
  ('66666666-6666-6666-6666-666666666001', 'Meta Ads — campanha lançamentos agosto', 'marketing', 4500, '2026-08-05', 'pago', 'Meta'),
  ('66666666-6666-6666-6666-666666666002', 'Plantão Artencena — sábado', 'plantao', 800, '2026-08-09', 'previsto', null),
  ('66666666-6666-6666-6666-666666666003', 'Coworking Av. Ayrton Senna', 'escritorio', 1800, '2026-08-10', 'previsto', 'Office Premium'),
  ('66666666-6666-6666-6666-666666666004', 'DAS / estimativa tributária', 'impostos', 3200, '2026-08-20', 'previsto', 'Contador'),
  ('66666666-6666-6666-6666-666666666005', 'Assistente comercial — pró-labore parcial', 'pessoal', 2500, '2026-08-05', 'pago', null)
on conflict (id) do nothing;
