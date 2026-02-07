-- Migração: coluna neighborhood (bairro) na tabela users (Supabase/PostgreSQL)
-- Usado no perfil e exibido no fórum (cidade e bairro vêm do formulário do perfil).
-- Com ddl-auto: update a API já cria/atualiza; use esta migração se for usar ddl-auto: validate em produção.
-- Como rodar: Supabase Dashboard → SQL Editor → colar e executar

ALTER TABLE users
ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100);

COMMENT ON COLUMN users.neighborhood IS 'Bairro do usuario (preenchido no perfil; exibido no forum)';
