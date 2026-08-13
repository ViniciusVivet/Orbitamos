# Roadmap de produto e engenharia

Última revisão: 2026-07-28

Este arquivo contém somente trabalho futuro ou incompleto. Funcionalidades já
presentes ficam documentadas em [ARCHITECTURE.md](ARCHITECTURE.md).

## Prioridade imediata

- Fazer lint, typecheck, testes e build passarem de forma reproduzível.
- Adicionar CI para essas quatro verificações.
- Criar testes de integração para RLS e funções Supabase.
- Criar E2E dos fluxos de autenticação, contato, curso e candidatura.
- Confirmar no Supabase remoto a aplicação das migrations `005` a `018`.
- Confirmar e registrar o cron anti-pausa citado na documentação anterior.

## Consolidação

- Dividir `src/lib/api.ts` por domínio.
- Reduzir páginas/componentes muito grandes de fórum, mensagens e cursos.
- Definir uma única fonte de verdade para catálogo acadêmico.
- Otimizar vídeos, imagens e cenas 3D com métricas de dispositivos reais.
- Medir erros e disponibilidade dos fluxos críticos em produção.

## Evolução de produto

- Certificados quando houver regra verificável de conclusão.
- Supabase Realtime no chat quando o uso justificar presença e sincronização.
- CMS do portfólio somente se a edição no código virar gargalo.
- Automações de email/WhatsApp com consentimento e rotina operacional.
- API dedicada apenas quando regras, integrações ou escala justificarem seu
  custo e operação.

## Critério de entrada

Antes de iniciar uma funcionalidade:

1. Qual problema observado ela resolve?
2. Qual métrica ou teste comprova sucesso?
3. Supabase e Next.js atuais já resolvem?
4. Quem opera e mantém isso depois do deploy?
5. Quais dados pessoais e permissões estão envolvidos?
