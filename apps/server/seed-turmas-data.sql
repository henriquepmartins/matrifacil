-- Inserir turmas padrão para a creche

-- Berçário (bebês de 4 a 12 meses)
INSERT INTO turma (id, nome, etapa, turno, capacidade, vagas_disponiveis, ano_letivo, ativa, created_at, updated_at) VALUES
  (gen_random_uuid()::text, 'Berçário I - Manhã', 'bercario', 'manha', 8, 8, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Berçário II - Manhã', 'bercario', 'manha', 8, 8, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Berçário I - Tarde', 'bercario', 'tarde', 8, 8, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Berçário II - Tarde', 'bercario', 'tarde', 8, 8, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Berçário - Integral', 'bercario', 'integral', 8, 8, '2025', true, NOW(), NOW());

-- Maternal I (1 a 2 anos)
INSERT INTO turma (id, nome, etapa, turno, capacidade, vagas_disponiveis, ano_letivo, ativa, created_at, updated_at) VALUES
  (gen_random_uuid()::text, 'Maternal I A - Manhã', 'maternal', 'manha', 12, 12, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Maternal I B - Manhã', 'maternal', 'manha', 12, 12, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Maternal I A - Tarde', 'maternal', 'tarde', 12, 12, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Maternal I B - Tarde', 'maternal', 'tarde', 12, 12, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Maternal I - Integral', 'maternal', 'integral', 12, 12, '2025', true, NOW(), NOW());

-- Maternal II (2 a 3 anos)
INSERT INTO turma (id, nome, etapa, turno, capacidade, vagas_disponiveis, ano_letivo, ativa, created_at, updated_at) VALUES
  (gen_random_uuid()::text, 'Maternal II A - Manhã', 'maternal', 'manha', 15, 15, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Maternal II B - Manhã', 'maternal', 'manha', 15, 15, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Maternal II A - Tarde', 'maternal', 'tarde', 15, 15, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Maternal II B - Tarde', 'maternal', 'tarde', 15, 15, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Maternal II - Integral', 'maternal', 'integral', 15, 15, '2025', true, NOW(), NOW());

-- Pré-escola (4 a 5 anos)
INSERT INTO turma (id, nome, etapa, turno, capacidade, vagas_disponiveis, ano_letivo, ativa, created_at, updated_at) VALUES
  (gen_random_uuid()::text, 'Pré-Escola I A - Manhã', 'pre_escola', 'manha', 20, 20, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Pré-Escola I B - Manhã', 'pre_escola', 'manha', 20, 20, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Pré-Escola II A - Manhã', 'pre_escola', 'manha', 20, 20, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Pré-Escola II B - Manhã', 'pre_escola', 'manha', 20, 20, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Pré-Escola I A - Tarde', 'pre_escola', 'tarde', 20, 20, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Pré-Escola I B - Tarde', 'pre_escola', 'tarde', 20, 20, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Pré-Escola II A - Tarde', 'pre_escola', 'tarde', 20, 20, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Pré-Escola II B - Tarde', 'pre_escola', 'tarde', 20, 20, '2025', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Pré-Escola - Integral', 'pre_escola', 'integral', 20, 20, '2025', true, NOW(), NOW());
