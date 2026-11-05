# Escalabilidade com a infraestrutura atual

Rodada iniciada em **04/11/2026**, revisão documental em **05/11/2026**,
implementada no repositório e verificada em testes focais, integração unitária,
navegadores com dados fictícios e banco local descartável. Não foram adicionados serviços, dependências
ou planos pagos. O objetivo é reduzir consultas e dados transferidos usando
Next.js, Supabase e armazenamento local já existentes; não há medição nova de
custo, capacidade máxima ou tráfego de produção.

**O usuário decidiu aplicar o SQL depois. Nenhuma migration remota foi aplicada
nesta rodada.** A migration 019 está pronta e testada localmente; o cliente
expõe sincronização pendente enquanto a RPC não estiver disponível.

## Catálogo e progresso de aulas

`listarCursosAcademy()` retorna `CursoResumo[]`: informações do curso e IDs,
slugs e títulos de módulos/aulas necessários para navegação, busca e contagem.
A consulta não carrega conteúdo, quiz, vídeo ou materiais de todas as aulas.
A busca da biblioteca usa títulos e descrições dos cursos, não o texto integral
das aulas.

`buscarCursoAcademyPorSlug()` filtra o slug solicitado e usa `maybeSingle()`.
Conteúdo, quiz e materiais completos são consultados ao abrir esse curso. A
compatibilidade com bancos sem a coluna `quiz` permanece no detalhe, sem repetir
a consulta leve do catálogo. Resumo e detalhe preservam a seleção da estrutura
canônica e o fallback local quando o seed publicado está incompleto.

O fallback tem uma única fonte em `cursos.ts`; `cursosResumo` deriva dela sem
duplicar manualmente o catálogo. Essa rodada não separou o catálogo local
completo em um bundle sob demanda.

`academyLessonProgress.ts` gera referências `{ id, slug?, courseSlug }` e lê
conclusões em lotes de até 100 referências. UUIDs usam identidade exata; IDs
locais usam o par curso/slug e retornam o ID local esperado pelo consumidor.
Início, Progresso, biblioteca e mapa de carreira compartilham essa leitura, sem
uma consulta por curso. O usuário esperado é validado antes e depois da rede;
os filtros de leitura usam essa mesma conta.

## Mensagens e sessão

A listagem de conversas usa uma consulta REST com participantes, perfis e a
última mensagem embutidos, limitada a uma mensagem por conversa. Isso elimina
as consultas adicionais por conversa; RLS e índices existentes são preservados.

O histórico usa cursor exclusivo `(created_at, id)`, com **50 mensagens por
página e máximo de 100**. A consulta lê uma linha adicional para identificar a
próxima página e devolve as mensagens em ordem cronológica. O cursor preserva
microssegundos e desempata horários iguais por ID. `getChatMessages()` mantém
seu retorno em array, limitado à primeira página.

`useChatHistory` mantém estado em memória por conta e conversa, combina mensagens
por ID e preserva envios/rascunhos quando uma resposta anterior chega atrasada.
“Carregar anteriores” mantém a mensagem visível como âncora de scroll. O chat
flutuante fechado ou minimizado não carrega histórico; ao abrir ou selecionar
uma conversa, busca a página recente. Não foram adicionados polling ou Realtime.

`AuthContext` observa `onAuthStateChange` do cliente Supabase existente. O perfil
é carregado fora do callback do SDK; refresh da mesma conta atualiza o token
sem recarregar um perfil já pronto. Logout, troca de conta e revisões de pedido
invalidam respostas anteriores. Envios de chat conferem a conta esperada;
RLS continua sendo a fronteira de autorização no servidor.

O provider do progresso também vincula cada leitura à conta, sessão e última
requisição: respostas antigas não substituem o XP da conta atual. A tela de
mensagens encaminha ao login ao perder a sessão. O chat flutuante se ajusta ao
viewport, preservando a posição salva dentro dos limites da tela.

## Conclusão e XP: migration 019 e fila local

A RPC `public.v3_complete_lesson(text,text,uuid)` registra conclusão e XP em uma
transação. O servidor usa `auth.uid()`, confere a conta esperada e exige curso e
aula publicados. Aceita UUID ou slug legado no contexto do curso; slugs ambíguos
são rejeitados. Somente a primeira conclusão concede **10 XP**; repetir a mesma
operação é idempotente. Conclusões anteriores são preservadas, sem recalcular
XP ou conceder prêmios retroativos.

O cliente não soma XP nem tenta `upsert` direto como alternativa. A migration
revoga escritas diretas do cliente em `lesson_progress` e `v3_user_progress`,
concede leitura nessas duas tabelas e mantém o isolamento por RLS.

`courseProgress.ts` preserva a chave `orbitacademy-progress-<conta>-<curso>` e
acrescenta journal com uma chave por aula. Esse registro evita que um snapshot
agregado antigo de outra aba apague conclusões recentes. Aliases legados são
conciliados com UUIDs sem descartar IDs históricos desconhecidos.

A fila de saída local, ou outbox, só confirma a sincronização após resposta da
RPC. Sem RPC ou rede, a conclusão durável continua pendente no aparelho e o XP
fica aguardando confirmação do servidor. Há retry ao abrir o curso, voltar
online ou tocar em sincronizar. Se o armazenamento local falhar, o cliente tenta
a gravação remota; se ambas falharem, informa que a conclusão não foi salva.
Resultados antigos não são aplicados a outra conta ou curso.

Esse mecanismo sincroniza conclusões de aulas. Saves de jogos, código, C# e SQL
continuam locais; não ganharam sincronização entre dispositivos nesta rodada.

## Aplicar depois: somente a 019 no projeto existente

Pré-requisitos: migrations 005–018 já aplicadas, tabelas e funções esperadas
presentes, perfil da conta provisionado e curso/aulas correspondentes publicados.
A sequência e as verificações gerais estão em
[SUPABASE_NATIVE_MIGRATION.md](SUPABASE_NATIVE_MIGRATION.md).

Quando o usuário for aplicar a mudança no SQL Editor do projeto correto:

1. Preservar o backup do banco existente.
2. Executar somente o conteúdo integral de
   [20260619001900_atomic_lesson_completion.sql](../supabase/migrations/20260619001900_atomic_lesson_completion.sql).
   O arquivo já contém `BEGIN`, `COMMIT` e recarga do schema do PostgREST.
3. Não executar reset, seed nem reaplicar 005–018 em produção para instalar essa
   função. Os comandos de banco descartável deste repositório são locais.
4. Verificar a assinatura e a permissão de execução, sem concluir aulas reais:

```sql
select to_regprocedure('public.v3_complete_lesson(text,text,uuid)') as completion_rpc;

select
  has_function_privilege(
    'authenticated', 'public.v3_complete_lesson(text,text,uuid)', 'EXECUTE'
  ) as authenticated_can_execute,
  has_function_privilege(
    'anon', 'public.v3_complete_lesson(text,text,uuid)', 'EXECUTE'
  ) as anon_can_execute;
```

O primeiro resultado deve ser não nulo; as permissões esperadas são `true` e
`false`, respectivamente. Isso verifica presença e grants, não substitui o teste
funcional autenticado após a aplicação. Não houve essa verificação remota nesta
rodada.

## Evidência local e limites

As execuções focais se sobrepõem e não representam uma nova contagem global:

| Escopo executado | Resultado |
| --- | --- |
| Catálogo e regressões de conteúdo/trilhas | 61 testes em 6 arquivos |
| Leitura bulk de progresso e cliente de conclusão | 15 testes em 2 arquivos |
| Fila local e cliente RPC, após ajustes de resiliência | 16 testes em 2 arquivos |
| Auth e chat | 26 testes em 3 arquivos |
| Contratos do ambiente Supabase local | 4 testes |
| `lesson_completion.test.sql` | 32 asserções pgTAP aprovadas |
| `rls.test.sql` | 14 asserções pgTAP aprovadas |
| Concorrência real de conclusão | runner aprovado, com bloqueios observados |

Na integração final de **05/11/2026**, `npm run test:coverage -- --maxWorkers=1`
passou com **517 testes em 56 arquivos**, incluindo o guard de respostas do
progresso. Esse resultado é uma execução separada dos números focais.

`audit-scaling.mjs` passou em Chromium desktop e WebKit/iPhone 13: login,
conclusão com RPC ausente, recarga/retentativa, XP único, histórico 50→100,
âncora de scroll, falha/retentativa, envio, logout entre abas e restauração da
conta B com seu próprio XP. O chat flutuante também foi conferido em 320 px;
minimizado, não buscou histórico. As telas de chat testadas não tiveram overflow.
O relatório preserva dois avisos WebKit sobre requisições HTTP locais
interrompidas na navegação, separados das exceções JS que reprovam o roteiro.
Os dados são fictícios, origens externas ficam bloqueadas e a CSP é contornada
apenas no browser de teste. Isso não comprova auth/dados remotos, CSP de produção
nem funcionamento num iPhone físico. Capturas e relatório estão em
`apps/web/test-results/scaling/`, ignorados pelo Git.

TypeScript, build de produção (71 páginas) e 9 contratos estáticos foram
aprovados na integração final. O build manteve os avisos anteriores de
Browserslist e tracing amplo na rota de materiais. O lint
completo terminou sem erros, com 31 avisos, incluindo arquivos de QA locais
ignorados pelo Git. Os avisos de imagens/variáveis existentes foram preservados.
Lint focal e verificação de whitespace dos escopos alterados foram aprovados.
Os dois testes SQL usam identidades fictícias e terminam com `rollback`. A suíte
RLS de 14 casos modela grants legados mínimos de contatos, vagas, solicitações e
colunas públicas de perfil dentro da fixture transacional, pois o CLI recente
não os criou implicitamente. Esses grants são revertidos e não foram incluídos
em migrations de produção; a suíte de 32 casos usa os grants de progresso da 019.

O runner de concorrência abriu três sessões Postgres, observou duas esperando
locks e confirmou prêmios `[10, 0, 10]` para primeira conclusão, replay e aula
distinta. Confirmou duas conclusões, passagem de XP `90 -> 10` com nível `3 -> 4`
e outra conta inalterada. As fixtures foram removidas no `finally`.

A inicialização da stack local completa teve timeout no pg-delta e não foi
contada como sucesso. A validação foi concluída com Postgres local isolado,
migrations 005–019 e reaplicação da versão final de 019 somente nesse banco
descartável. O ambiente local foi encerrado com volumes preservados.

Ver [SUPABASE_LOCAL.md](SUPABASE_LOCAL.md) para operação local e
[TESTES_AUTOMATIZADOS.md](TESTES_AUTOMATIZADOS.md) para comandos e histórico.
Este registro não comprova aplicação do SQL nem configuração do banco remoto.
