-- Script para inserir turmas no banco de dados MatriFácil
-- Execute este script no Supabase SQL Editor

-- Limpar turmas existentes (opcional - remova o comentário se quiser resetar)
-- DELETE FROM turma;

-- Inserir Berçário (0 a 1 ano)
INSERT INTO turma (id, id_global, nome, etapa, turno, capacidade, vagas_disponiveis, ano_letivo, ativa, created_at, updated_at)
VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'Berçário A - Manhã', 'bercario', 'manha', 12, 12, '2025', true, NOW(), NOW()),
  (gen_random_uuid(), gen_random_uuid(), 'Berçário B - Tarde', 'bercario', 'tarde', 12, 12, '2025', true, NOW(), NOW()),
  (gen_random_uuid(), gen_random_uuid(), 'Berçário - Integral', 'bercario', 'integral', 10, 10, '2025', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir Maternal I (1 a 2 anos)
INSERT INTO turma (id, id_global, nome, etapa, turno, capacidade, vagas_disponiveis, ano_letivo, ativa, created_at, updated_at)
VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'Maternal I A - Manhã', 'maternal', 'manha', 15, 15, '2025', true, NOW(), NOW()),
  (gen_random_uuid(), gen_random_uuid(), 'Maternal I B - Tarde', 'maternal', 'tarde', 15, 15, '2025', true, NOW(), NOW()),
  (gen_random_uuid(), gen_random_uuid(), 'Maternal I - Integral', 'maternal', 'integral', 12, 12, '2025', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir Maternal II (2 a 3 anos)
INSERT INTO turma (id, id_global, nome, etapa, turno, capacidade, vagas_disponiveis, ano_letivo, ativa, created_at, updated_at)
VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'Maternal II A - Manhã', 'maternal', 'manha', 18, 18, '2025', true, NOW(), NOW()),
  (gen_random_uuid(), gen_random_uuid(), 'Maternal II B - Tarde', 'maternal', 'tarde', 18, 18, '2025', true, NOW(), NOW()),
  (gen_random_uuid(), gen_random_uuid(), 'Maternal II - Integral', 'maternal', 'integral', 15, 15, '2025', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir Pré I (ou Jardim I - 3 a 4 anos)
INSERT INTO turma (id, id_global, nome, etapa, turno, capacidade, vagas_disponiveis, ano_letivo, ativa, created_at, updated_at)
VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'Pré I (Jardim I) A - Manhã', 'pre_escola', 'manha', 20, 20, '2025', true, NOW(), NOW()),
  (gen_random_uuid(), gen_random_uuid(), 'Pré I (Jardim I) B - Tarde', 'pre_escola', 'tarde', 20, 20, '2025', true, NOW(), NOW()),
  (gen_random_uuid(), gen_random_uuid(), 'Pré I (Jardim I) - Integral', 'pre_escola', 'integral', 18, 18, '2025', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir Pré II (ou Jardim II - 4 a 5 anos)
INSERT INTO turma (id, id_global, nome, etapa, turno, capacidade, vagas_disponiveis, ano_letivo, ativa, created_at, updated_at)
VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'Pré II (Jardim II) A - Manhã', 'pre_escola', 'manha', 22, 22, '2025', true, NOW(), NOW()),
  (gen_random_uuid(), gen_random_uuid(), 'Pré II (Jardim II) B - Tarde', 'pre_escola', 'tarde', 22, 22, '2025', true, NOW(), NOW()),
  (gen_random_uuid(), gen_random_uuid(), 'Pré II (Jardim II) - Integral', 'pre_escola', 'integral', 20, 20, '2025', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir Fundamental (Transição)
INSERT INTO turma (id, id_global, nome, etapa, turno, capacidade, vagas_disponiveis, ano_letivo, ativa, created_at, updated_at)
VALUES 
  (gen_random_uuid(), gen_random_uuid(), '1º Ano - Manhã', 'fundamental', 'manha', 25, 25, '2025', true, NOW(), NOW()),
  (gen_random_uuid(), gen_random_uuid(), '1º Ano - Tarde', 'fundamental', 'tarde', 25, 25, '2025', true, NOW(), NOW()),
  (gen_random_uuid(), gen_random_uuid(), '1º Ano - Integral', 'fundamental', 'integral', 20, 20, '2025', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Verificar turmas inseridas
SELECT 
  nome,
  etapa,
  turno,
  capacidade,
  vagas_disponiveis,
  ativa
FROM turma
ORDER BY 
  CASE 
    WHEN etapa = 'bercario' THEN 1
    WHEN etapa = 'maternal' THEN 2
    WHEN etapa = 'pre_escola' THEN 3
    WHEN etapa = 'fundamental' THEN 4
  END,
  nome;