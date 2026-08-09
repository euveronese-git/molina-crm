-- Seed demo leads (run after 001_initial.sql, with an authenticated session or as service role)
-- Safe to re-run: uses fixed UUIDs

insert into public.leads (id, nome, contato, origem, orcamento, regiao_interesse, status_funil, notas, is_vip, external_source, external_id)
values
  ('11111111-1111-1111-1111-111111111101', 'Ana Beatriz Carvalho', '(21) 98877-1100', 'instagram', 4500000, 'Península', 'captacao', 'Viu stories do Artencena. Quer 3 suítes.', true, null, null),
  ('11111111-1111-1111-1111-111111111102', 'Ricardo Mendes', '(21) 97111-2233', 'whatsapp', 2800000, 'Jardim Oceânico', 'captacao', 'Lead via chatbot WhatsApp (placeholder).', false, 'whatsapp_chatbot', 'wa-8821'),
  ('11111111-1111-1111-1111-111111111103', 'Família Albuquerque', '(21) 99900-4455', 'indicacao', 12000000, 'Golf Club', 'qualificacao', 'Indicação do cliente Silva. Interesse em mansão.', true, null, null),
  ('11111111-1111-1111-1111-111111111104', 'Camila Torres', '(21) 98222-6677', 'site', 1900000, 'Parque das Rosas', 'qualificacao', 'Formulário do site — lançamento na planta.', false, null, null),
  ('11111111-1111-1111-1111-111111111105', 'Eduardo Prado', '(21) 97766-8899', 'whatsapp', 6200000, 'Lúcio Costa', 'apresentacao', 'Apresentar tabela do CEO Corporate + cobertura.', false, null, null),
  ('11111111-1111-1111-1111-111111111106', 'Sofia Hartmann', '(21) 96655-1212', 'instagram', 8500000, 'Frente Mar', 'visita_plantao', 'Plantão sábado 10h — Artencena.', true, null, null),
  ('11111111-1111-1111-1111-111111111107', 'Bruno Oliveira', '(21) 95544-3344', 'indicacao', 3200000, 'Barra da Tijuca', 'visita_plantao', null, false, null, null),
  ('11111111-1111-1111-1111-111111111108', 'Patricia & João Lima', '(21) 94433-5566', 'whatsapp', 5100000, 'Alphaville', 'proposta_reserva', 'Proposta unidade 1204 — aguardando sinal.', true, null, null),
  ('11111111-1111-1111-1111-111111111109', 'Investidor HK Partners', '(21) 93322-7788', 'outro', 15000000, 'Av. Ayrton Senna', 'proposta_reserva', 'Interesse em lajes corporativas — 2 unidades.', true, null, null),
  ('11111111-1111-1111-1111-111111111110', 'Marina Costa', '(21) 92211-9900', 'site', 2400000, 'Recreio', 'assinatura', 'Cartório agendado para dia 12.', false, null, null),
  ('11111111-1111-1111-1111-111111111111', 'Carlos Eugênio', '(21) 91100-1122', 'indicacao', 7800000, 'São Conrado', 'pos_venda', 'Entrega de chaves OK. Follow-up NPS.', true, null, null),
  ('11111111-1111-1111-1111-111111111112', 'Helena Duarte', '(21) 98800-3344', 'whatsapp', 1600000, 'Parque das Rosas', 'captacao', 'Primeiro contato — orçamento flexível.', false, 'whatsapp_chatbot', 'wa-9102')
on conflict (id) do nothing;
