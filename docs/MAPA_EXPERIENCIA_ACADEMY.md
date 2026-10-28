# Mapa da experiência da Academy

Auditoria de jornada em 26/10/2026. Produto mantido como está nesta rodada.

## Escopo e evidências

Percurso de iniciante na prévia local, usando Chromium e WebKit com perfil de
iPhone 13, junto com leitura dos componentes e dos contratos de progresso.
Não houve pesquisa com alunos nem teste de teclado físico do iPhone. O login
real não foi percorrido: a configuração local de Supabase continua pendente.

Capturas e dados de reprodução: `apps/web/test-results/academy-journey/`.
Os scripts e relatórios dessa pasta são artefatos de auditoria, não código do
produto. Hipóteses de confusão e abandono devem ser verificadas com iniciantes.

## Percurso atual

1. **Entrar e escolher:** a Home propõe a primeira linha de JavaScript. Oferece
   também catálogo de trilhas, laboratório, jogos e biblioteca de aulas. Não há
   objetivo/trilha pessoal persistente que governe essas recomendações.
2. **Começar código:** o aluno lê uma história com entrada, ação e resultado;
   inicia o guia, escreve linhas, recebe conferência de escrita, executa e vê
   a validação da missão. Missões e etapas têm denominadores diferentes.
3. **Continuar código:** há próxima missão/desafio, pergunta extra e modo livre.
   O modo livre tem rascunho separado e pode abrir código inicial diferente do
   programa que o aluno acabou de montar.
4. **Escolher trilha:** C# tem apresentação, profissão, mapa e módulos com guia,
   perguntas, diagnóstico e código independente. Variáveis, condições e laços
   estão disponíveis; a formação até APIs e trabalho profissional está incompleta.
   SQL oferece aventura introdutória e oficina de cinco missões.
5. **Mudar de formato:** Jogos reúne seis experiências com pontes para código.
   Sem histórico, a recomendação inicial é SQL. Os formatos não são selecionados
   por uma habilidade ou objetivo de formação escolhido anteriormente.
6. **Avaliar e voltar:** a Home exibe métricas de aulas/XP e retoma atividade local.
   Progresso distingue visita, prática e conclusão, mas o aluno ainda combina
   registros separados. A recomendação de retomada considera a visita recente;
   ela não equivale ao próximo passo de uma trilha pessoal.

## Gargalos priorizados

| Prioridade | Evidência atual | Consequência provável | Direção de correção |
| --- | --- | --- | --- |
| P1 | A primeira missão pede o próprio nome; `let nome = "João"; console.log(nome);` continua com execução guiada desabilitada. O literal `"Seu Nome"` é aceito. Reproduzido na interface. | O aluno pode cumprir a instrução e interpretar o bloqueio como incapacidade própria. | Alinhar enunciado, conferência da linha e validação semântica. Aceitar personalizações válidas. |
| P1 | Após a introdução, no WebKit/iPhone, o início do editor está a 1.077 px do topo, com viewport de 664 px e scroll zero. | É necessário atravessar títulos, mapa e opções para achar onde digitar. | Priorizar uma instrução curta, editor e uma ação principal durante a prática; recolher contexto e opções. |
| P1 | A sequência JS passa de variáveis para calculadora de descontos que exige função, parâmetros, retorno e chamada. Python também introduz funções em um desafio inicial de condicionais. | A transcrição pode avançar mais rápido que a compreensão. | Reordenar por pré-requisitos; introduzir uma novidade por atividade. |
| P2 | Home inicia JS; Jogos inicia SQL; catálogo, mapas de carreira e mapa C# são destinos distintos. | O aluno precisa decidir sozinho qual caminho organiza sua formação. | Escolher objetivo e trilha principal; usar jogos, vídeo e código como formatos dentro de uma sequência. |
| P2 | Última atividade visitada pode substituir a retomada principal, mesmo ao abrir algo por curiosidade. | A formação perde a prioridade para o histórico de navegação. | Separar continuar minha trilha de retomar última atividade. |
| P2 | Prática local, aulas, XP e sequência têm origens diferentes; C# avulso e C# da trilha usam atividades e saves diferentes. | Um aluno ativo pode continuar vendo métricas zeradas ou tópicos repetidos. | Mostrar habilidades e evidências da jornada escolhida; explicar/alinhar os registros e conectar desafios equivalentes. |
| P2 | Oficina SQL aberta pela aventura não muda a URL; reload volta à introdução da aventura. Reproduzido na interface. | Rascunhos existem, mas o aluno retorna à subárea errada. | Persistir o destino atual e preservar a subárea no link e na retomada. |
| P2 | Conclusão do guia permite seguir após reproduzir o exemplo. Em vários desafios a variação é opcional ou inexistente. | Concluído ainda não comprova aplicação independente. | Incorporar uma variação curta e depuração antes de encerrar o conceito. |
| P2 | Revisão tem banco pequeno por experiência e pode ser repetida imediatamente; vencimento apenas ordena a fila. | O formato ainda oferece pouco planejamento de retenção ao longo dos dias. | Vincular revisão às habilidades/erros, mostrar o motivo e a data da próxima revisão. |
| P2 | Rascunhos e progresso prático ficam por conta/navegador, sem sincronização entre aparelhos. | O cenário de estudar na rua e continuar no PC não tem continuidade completa. | Sincronizar preservando rascunhos locais, data e conflitos; tornar o estado de salvamento claro. |

## O que preservar

- Cinco destinos principais e separação visual entre área comercial e estudo.
- Histórias antes do código e explicações por linha.
- Execução por ação explícita, desfazer, reiniciar e recuperação de rascunhos.
- Orbi e cenas SQL que tornam linhas, colunas e filtros visíveis.
- A estrutura C# que alterna guia, aplicação independente, erro e perguntas.
- Distinção honesta entre uma visita, participar e concluir uma atividade.
- Informação transparente sobre o conteúdo que ainda está em preparação.

## Ordem recomendada para a próxima implementação

1. Corrigir bloqueios de escrita válida e reduzir a distância até o editor mobile.
2. Definir a sequência de pré-requisitos e uma trilha principal escolhida pelo aluno.
3. Construir uma sessão curta completa: contexto → guia → previsão → variação
   independente → feedback → próximo passo.
4. Conectar a essa sessão os jogos, a revisão e os vídeos correspondentes ao conceito.
5. Alinhar continuidade, registros de progresso e sincronização entre dispositivos.
6. Expandir o conteúdo mantendo esse ciclo, com testes de uso por iniciantes reais.

A avaliação central desta auditoria é que a organização visual avançou mais que
a continuidade pedagógica. O próximo ganho depende de conectar as experiências
em uma jornada pessoal com começo, evidência de aprendizado e próximo passo claro.

## Rodada seguinte: primeiras correções aplicadas

A versão reorganizada foi publicada primeiro no commit `e4f191a`. A rodada
seguinte tratou estes pontos do mapa:

- **Escrita personalizada:** as três missões de variáveis JS agora aceitam nome,
  idade e booleano próprios, com regras explícitas de nome e tipo. Outras
  atividades mantêm a conferência anterior; execução e testes ainda validam a missão.
- **Editor mobile:** iniciar/retomar leva à área de escrita sem abrir o teclado
  automaticamente. Mapa e opções ficam recolhidos, orientação curta e posição
  na missão permanecem junto ao campo. Seis símbolos essenciais ficam visíveis;
  os demais continuam disponíveis em “Mais símbolos”.
- **Trilha principal:** escolha opcional de C# ou SQL por conta/navegador na Home
  e em Trilhas. Essa escolha organiza o próximo passo; visitas a outras atividades
  aparecem como retomada secundária e não trocam a formação selecionada.
- **SQL:** aventura/oficina seguem a URL; reload, voltar/avançar e retomada
  preservam o modo, a query e a âncora sem reiniciar rascunhos.

Auditorias específicas: `audit-guided-onboarding.mjs`, `audit-study-path.mjs` e
`audit-sql-resume.mjs`. Os relatórios ficam em `apps/web/test-results/`.

Continuam no backlog: sequência de pré-requisitos, transporte explícito do código
ao modo livre, variações independentes em todos os desafios, progresso/XP coerente
com habilidades, ampliação de conteúdo e revisão, e sincronização entre aparelhos.
Escolher uma trilha não significa que esses pontos já estejam resolvidos.

## Rodada de 28/10/2026: primeiro percurso com aplicação

O caminho opcional **Primeiros passos** passa a organizar quatro entregas reais
em JavaScript: perfil → conta de um serviço → decisão → primeiro orçamento.
As primeiras atividades não exigem funções antes de ensiná-las. O mapa completo
continua consultável e não bloqueia quem já sabe e quer explorar outro tema.

Cada entrega tem três momentos: construir no guia, alterar o próprio programa e
escrever uma nova versão sem código preenchido. Os dois últimos momentos executam
JavaScript de verdade e conferem outras entradas, inclusive os limites das
condições. Imprimir uma resposta fixa não basta para passar.

Concluir o programa inicial continua preservado como evidência parcial. Para essas
quatro atividades, a entrega completa exige também alteração e aplicação
independente validadas. Editar o código invalida a prova daquela versão. A Home
recomenda a primeira entrega incompleta, mesmo depois de uma visita por curiosidade
a uma atividade posterior. O próximo tema após o orçamento é funções.

O modo livre recebe explicitamente o código que o aluno construiu. Se já houver
outro rascunho, ele escolhe qual abrir; substituir guarda a versão anterior para
recuperação. Recuperar também preserva as edições atuais, e a importação não
concede uma conclusão sem executar. Os registros permanecem separados por conta,
atividade e navegador.

Scripts desta rodada: `audit-first-delivery-path.mjs` (percurso real completo),
`audit-beginner-application.mjs` (aplicações nos três perfis) e
`audit-practice-handoff.mjs` (transporte, conflito e recuperação de código).
Os dois últimos usam fixtures em partes anteriores do fluxo para isolar o que
estão verificando; não representam alunos reais nem um teste de autenticação.

Continuam pendentes: observar iniciantes reais no celular, ampliar esse ciclo às
demais linguagens e atividades, aprofundar depuração/revisão cumulativa e
sincronizar rascunhos entre aparelhos. O primeiro orçamento é um programa de
console; CRUD, API e projetos profissionais não passam a estar disponíveis por
causa desta rodada.

Validação local desta rodada: 425 testes unitários em 45 arquivos; lint dos
arquivos alterados; percurso completo sem fixture do guia nas quatro entregas;
12 aplicações (quatro entregas em desktop, WebKit/iPhone 13 e Chromium de 320px);
três cenários de recuperação durante execução pendente; três cenários de
transporte/conflito/recuperação no modo livre; e três perfis de escrita guiada
personalizada. Os cenários cobertos passaram sem erros de página ou violações
axe. Foi corrigido um problema mobile em que o histórico e os avisos comprimiam
o editor a zero: o painel passa a rolar e mantém área para escrever. WebKit
simula Safari; a bateria não substitui a verificação no iPhone físico com teclado
virtual nem a observação de alunos reais.

Build de produção e TypeScript aprovados. Permanecem os avisos anteriores de
Browserslist desatualizado e rastreamento amplo em
`api/course-materials/[...path]`; esta rodada não alterou esse endpoint.
