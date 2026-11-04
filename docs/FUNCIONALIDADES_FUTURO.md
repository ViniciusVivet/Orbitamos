# Roadmap de produto e engenharia

Última revisão do código: 2026-11-04

Este arquivo contém somente trabalho futuro ou incompleto. Funcionalidades já
presentes ficam documentadas em [ARCHITECTURE.md](ARCHITECTURE.md).

## Prioridade imediata

- Manter reproduzíveis lint, typecheck, cobertura, contratos e build na CI já
  existente em `.github/workflows/web-tests.yml`.
- Incluir a execução do Supabase descartável e da suíte RLS na CI. O ambiente
  local e `supabase/tests/database/rls.test.sql` já existem; ampliar os cenários
  de integração de policies e funções conforme os fluxos evoluírem.
- Completar E2E integrados de autenticação, contato, curso e candidatura contra
  um backend descartável. Já há auditorias de navegador; os cenários de auth
  usam respostas interceptadas e os previews não comprovam gravações reais.
- Confirmar no Supabase remoto a aplicação das migrations `005` a `018`.
- Confirmar e registrar o cron anti-pausa citado na documentação anterior.

## Consolidação

- Dividir `src/lib/api.ts` por domínio.
- Reduzir páginas/componentes muito grandes de fórum, mensagens e cursos.
- Consolidar os dados editoriais locais e remotos do catálogo acadêmico.
  A composição das entradas já passa por `src/lib/academyCatalog.ts`, que reúne
  os vídeos de apoio às trilhas C# e SQL sem duplicar sua entrada principal.
- Otimizar vídeos, imagens e cenas 3D com métricas de dispositivos reais.
- Medir erros e disponibilidade dos fluxos críticos em produção.

## Evolução de produto

- Certificados quando houver regra verificável de conclusão.
- Supabase Realtime no chat quando o uso justificar presença e sincronização.
- CMS dos cases do site comercial se a edição no código virar gargalo. O
  portfólio do colaborador já possui editor e upload; é outro domínio.
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
