-- Migração: adicionar coluna "role" na tabela users (Supabase/PostgreSQL)
-- Use este script se aparecer: column "role" of relation "users" does not exist
-- Como rodar: Supabase Dashboard → SQL Editor → colar e executar

ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'STUDENT';

-- Comentário na coluna (opcional)
COMMENT ON COLUMN users.role IS 'Papel: STUDENT (estudante) ou FREELANCER (colaborador)';
