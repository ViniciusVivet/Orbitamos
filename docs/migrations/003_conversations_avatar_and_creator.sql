-- Migração: colunas de avatar e criador na tabela conversations (Supabase/PostgreSQL)
-- Usado para grupos: foto do grupo e quem pode editar (criador).
-- Com ddl-auto: update a API já cria/atualiza; use esta migração se for usar ddl-auto: validate em produção.
-- Como rodar: Supabase Dashboard → SQL Editor → colar e executar

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512);

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;

COMMENT ON COLUMN conversations.avatar_url IS 'URL da foto do grupo (apenas type = GROUP)';
COMMENT ON COLUMN conversations.created_by_user_id IS 'ID do usuario que criou o grupo; apenas ele pode editar nome/avatar e participantes';
