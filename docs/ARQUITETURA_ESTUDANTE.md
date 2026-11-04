# Arquitetura da área do estudante

Última conferência documental no código: 04/11/2026.

## Proteção e navegação

Todas as rotas `/estudante/*` passam pelo proxy Supabase e pelo layout
autenticado. O layout verifica sessão, não `role`. Um usuário autenticado pode
alternar entre as experiências de estudante e colaborador.

`SiteFrame` e `portalNavigation` separam a apresentação comercial do espaço de
estudo/trabalho; não concedem acesso. O proxy falha fechado quando a sessão não
pode ser validada. `authNavigation` valida o retorno interno do login e preserva
query/âncora nos fluxos do cliente. Policies RLS continuam necessárias nas APIs e
tabelas. Esta revisão não percorreu login real nem inspecionou configuração local.

`/dashboard` mantém um redirecionamento inicial baseado em `role`:

- `STUDENT` -> `/estudante`
- `FREELANCER` -> `/colaborador`
- outro valor -> `/estudante`

## Navegação e rotas implementadas

O menu principal tem Início, Trilhas, Praticar, Progresso e Comunidade. Conta,
troca de área, site e saída ficam no rodapé. Praticar oferece Código, Jogos,
Inglês e Revisão; esses formatos não acrescentam destinos à sidebar. No capítulo
da Entrega do Orbi, os controles próprios têm prioridade sobre as abas de formato.

| Rota | Responsabilidade |
| --- | --- |
| `/estudante` | Próximo passo da trilha escolhida, retomada e aulas |
| `/estudante/trilhas` | Catálogo de Primeiros passos, C#, SQL e apoio em vídeo |
| `/estudante/trilhas/csharp` | Piloto C#; `module=variables\|conditions\|loops` preserva o módulo |
| `/estudante/trilhas/sql` | Aventura SQL; `mode=workshop` abre e preserva a oficina |
| `/estudante/orbita` | Mapa de carreira; inclui etapas futuras, não um curso integral disponível |
| `/estudante/aulas` | Biblioteca de cursos em vídeo |
| `/estudante/cursos/[slug]` | Curso anterior, módulos, aulas e materiais; histórico próprio |
| `/estudante/pratica` | Catálogo de desafios |
| `/estudante/pratica/[slug]` | Guia e modo livre; quatro entregas de Primeiros passos incluem alteração e aplicação independente |
| `/estudante/jogos` | Central de seis experiências e pontes para prática |
| `/estudante/jogos/[slug]` | Fase autoral de Monte o Código, não um slug genérico para qualquer jogo |
| `/estudante/jogos/orbi` | Entrada do Guia o Orbi |
| `/estudante/jogos/orbi/[nivel]` | Nível do Guia o Orbi |
| `/estudante/jogos/entregas-do-orbi` | Capítulo A última luz do bairro, save v2 |
| `/estudante/jogos/ingles-em-cena` | Oito cenas de inglês aplicado |
| `/estudante/jogos/vila-dos-blocos` | Dez fases de sintaxe e indentação |
| `/estudante/jogos/revisao` | Revisão de bolso sobre experiências concluídas |
| `/estudante/mentorias` | Experiência de mentorias |
| `/estudante/progresso` | Evidências locais e métricas de aulas com unidades separadas |
| `/estudante/comunidade` | Entrada da comunidade |
| `/estudante/conta` | Perfil e configurações |
| `/mensagens?area=student` | Conversas autenticadas compartilhadas com colaboradores; contexto de retorno do estudante |
| `/forum` | Fórum público; ações de publicação/edição dependem de autenticação e permissões |

### Limites do conteúdo

Primeiros passos organiza quatro pequenos programas JavaScript de console. C#
oferece variáveis, condições e laços; métodos e as etapas seguintes do mapa estão
em preparação. SQL oferece dez etapas na aventura e cinco missões na oficina
(`CREATE TABLE`, `INSERT`, consulta, filtro e `UPDATE`). Esses percursos e as seis
experiências da central não equivalem a uma formação profissional completa.

## Dados

- Catálogo-base: `src/lib/cursos.ts`.
- Experiência de aprendizado: `src/lib/learningExperience.ts`.
- Catálogo de trilhas e escolha local: `academyCatalog.ts` e `academyStudyPath.ts`.
- Desafios: `desafios.ts`; percurso inicial: `practiceExperience.ts` e
  `beginnerPractice.ts`; guia e transporte ao modo livre: `guidedPractice.ts` e
  `practiceHandoff.ts`.
- Central, diário, pontes e revisão: `practiceStation.ts`; seis experiências
  identificadas por `sql`, `delivery`, `english`, `village`, `orbi` e `assembly`.
- Projeção de evidências/retomada: `academyActivity.ts`. É uma leitura dos saves
  existentes, não uma regravação ou um percentual agregado de domínio.
- Capítulo atual da Entrega: `orbiChapter.ts`, `OrbiChapterExperience.tsx` e engine
  em `src/components/games/orbi-chapter/`. `OrbiDelivery.tsx` é a entrada atual;
  `orbiDelivery.ts` permanece para leitura do histórico v1.
- Cursos persistidos: tabelas `courses`, `course_modules`, `lessons` e
  `lesson_materials`.
- Progresso de aulas e métricas da conta: `lesson_progress` e `v3_user_progress`.
  Essas tabelas não sincronizam os saves dos jogos e do laboratório.
- Notificações: `v3_notifications`.

O upload administrativo usa o bucket público `academy`, definido na migration
`supabase/migrations/20260619001700_academy_storage.sql`, com escrita para staff.
Não há bucket `academy-materials` definido no código/migrations atuais. A leitura
dessa migration não comprova que ela foi aplicada em produção.

Materiais também podem usar URLs externas ou os arquivos versionados em
`public/course-materials`. `cursos.ts` normaliza esses caminhos locais para
`/api/course-materials/[...path]`, que exige autenticação em produção; isso não
torna as URLs públicas do bucket `academy` privadas.

### Persistência e continuidade local

Rascunhos de código, jogos, C#, SQL, revisão e escolha de trilha usam
`localStorage` por conta/navegador. O índice
`orbitamos-academy-resume-v1-<userId>` guarda apenas uma rota autoral permitida,
com parâmetros restritos e data; não aceita URLs externas nem concede conclusão.
A escolha em `orbitamos-academy-study-path-v1-<userId>` tem prioridade na Home,
sem apagar a atividade recente fora da trilha. Saves antigos sem horário são
apresentados sem inventar cronologia.

O capítulo atual usa `orbitamos-orbi-chapter-v2-<userId>`; conclusão exige três
entregas com código adequado e chegada física. O save v1 fica intacto como
histórico. O diário `orbitamos-practice-journal-v1-<userId>` identifica novos
registros da Entrega com `contentVersion=2` e preserva datas/revisões anteriores
em `legacy*`. Nem abrir o capítulo nem importar conclusão antiga o finalizam.

Eventos de atualização e `storage` permitem reler estado entre componentes/abas
do mesmo navegador. Não existe sincronização desses registros entre celular e
computador nesta versão. Uma futura sincronização precisa de contrato servidor,
migração e tratamento de conflitos sem apagar o que já está local.

### Prévias de desenvolvimento

As páginas `/dev/*` retornam 404 em produção. A central e suas visões usam
`/dev/academy-preview`; `view=home|tracks|progress|community` seleciona uma visão
e `activity=delivery|english|village|review|sql` seleciona uma atividade (um valor
por vez). SQL aceita também `mode=workshop`.
Laboratório: `/dev/lab-preview?academy=1`; desafio:
`/dev/ide-preview/[slug]?academy=1`; C#:
`/dev/csharp-preview?academy=1&module=conditions`. Monte e Guia o Orbi usam
`/dev/monte-codigo-preview/[slug]?from=academy` e
`/dev/orbi-preview/[nivel]?from=academy`. As prévias integradas compartilham o
identificador local `academy-preview`; não concedem acesso aos dados privados.

## Pontos de atenção

- A proteção de página não substitui as policies RLS.
- O catálogo TypeScript e o catálogo do banco precisam permanecer coerentes.
- Alterações no modelo acadêmico devem vir acompanhadas de migration
  idempotente e validação com usuário autenticado.
- Física e renderização da Entrega ficam no cliente, com carregamento sob demanda.
  Sincronizações futuras devem gravar marcos úteis, sem chamadas ao banco por
  quadro/tecla. A referência aprovada e as verificações históricas estão em
  [STUDIO_E_ORBI_CAPITULO_01.md](STUDIO_E_ORBI_CAPITULO_01.md).
- [Fluxo unificado](ACADEMY_FLUXO_UNIFICADO.md),
  [mapa da experiência](MAPA_EXPERIENCIA_ACADEMY.md) e
  [revisão pedagógica](REVISAO_PEDAGOGICA_ACADEMY.md) distinguem estado atual,
  auditorias anteriores e próximas etapas. Nenhuma verificação foi reexecutada
  nesta atualização documental.
