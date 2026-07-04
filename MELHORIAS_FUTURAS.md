# Melhorias futuras - Orbitamos

## Sistema de contato

### Estado atual

- Formulario de contato no site publico.
- Persistencia principal pelo backend atual da aplicacao web/Supabase.
- EmailJS pode ser usado como notificacao complementar, nunca como unico registro da demanda.

### Proximos passos

- [ ] Garantir que todo contato seja salvo em `v3_contacts`.
- [ ] Adicionar campo de WhatsApp/telefone ao formulario.
- [ ] Configurar notificacao por EmailJS ou provedor equivalente.
- [ ] Criar visualizacao simples de contatos na area de colaborador/admin.
- [ ] Medir origem do lead: home, projetos, servicos ou contato.

## Plataforma e dados

- [ ] Manter frontend em Vercel.
- [ ] Manter Supabase Auth/Postgres/Storage como backend principal da area logada.
- [ ] Validar cron externo diario anti-pausa do Supabase free tier.
- [ ] Evoluir chat para Supabase Realtime quando houver uso real.
- [ ] Criar painel administrativo para cursos, aulas, materiais e quizzes.

## Backend proprio

O backend Spring em `apps/api` e legado/fallback.

Nao tratar EC2, CloudFront, Render ou Railway como infraestrutura ativa. Uma API propria so deve voltar se houver demanda real de regra de negocio, integracoes ou escala que justifique custo e operacao.

Se uma API dedicada voltar, criar um novo plano de deploy antes de publicar e manter secrets apenas nos dashboards/variaveis do provedor.

## Checklist de seguranca

- [ ] Nunca commitar `.env`, `.env.local`, chaves `.pem`, tokens ou senhas reais.
- [ ] Manter `CLAUDE.local.md` e `docs/local/` fora do Git.
- [ ] Usar apenas placeholders em arquivos `*.example`.
- [ ] Rotacionar imediatamente qualquer credencial real que apareca em commit publico.
