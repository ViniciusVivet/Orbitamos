-- Migração: adicionar coluna last_lesson na tabela user_progress (Supabase/PostgreSQL)
-- Para "Continuar: [titulo da ultima aula]" e progresso real por usuario
-- Como rodar: Supabase Dashboard → SQL Editor → colar e executar

ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS last_lesson VARCHAR(255);

COMMENT ON COLUMN user_progress.last_lesson IS 'Titulo da ultima aula vista (Continuar de onde parou)';
