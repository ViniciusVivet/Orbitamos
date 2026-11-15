# Formação Orbitamos: diagnóstico e plano de execução

**Data:** 14/11/2026. **Base examinada:** `9f77510`.
**Estado na data da auditoria:** proposta. A execução iniciada em 15/11/2026,
as correções implementadas, seus limites e o próximo ponto de continuidade
estão em [Evolução da formação](EVOLUCAO_FORMACAO_ACADEMY.md). Os lotes completos
abaixo continuam sendo o roteiro, não uma declaração de entrega integral.

Este é o plano proposto para a continuidade da formação do estudante. Os registros
anteriores em [Revisão pedagógica](REVISAO_PEDAGOGICA_ACADEMY.md) e
[Fluxo unificado](ACADEMY_FLUXO_UNIFICADO.md) permanecem históricos.

## 1. Diagnóstico

A Orbitamos já tem identidade visual, bons mecanismos de prática e uma variedade
considerável de experiências. A formação ainda depende demais de o aluno
escolher, conectar e interpretar essas experiências por conta própria.

A prioridade é dar continuidade ao aprendizado: conteúdo correto, objetivo
claro, prática correspondente, ajuda progressivamente menor, aplicação nova e
um projeto que o estudante realmente consegue levar para fora da plataforma.
Adicionar jogos e vídeos sem essa ligação ampliaria o trabalho de manutenção.

### O que foi conferido

- Código de navegação, trilhas, biblioteca, exercícios, validação, execução,
  revisão, progresso e persistência.
- Navegação visual em desktop: Início, Trilhas, Laboratório, introdução e editor
  dos Primeiros passos, Jogos, Progresso e Comunidade.
- Inspeção isolada em WebKit com perfil iPhone 13: 11 entradas e o editor da
  primeira missão, com capturas. Home, trilhas, laboratório, C#, SQL, jogos,
  simulador, progresso, comunidade e biblioteca foram abertos. As 11 entradas
  tinham largura de documento igual à viewport de 390 px; não houve erro de
  página nesse percurso. Isso não é uma auditoria WCAG nem teste de teclado físico.
- Um contraexemplo executado no runner C# real da aplicação, em Web Worker
  real dentro de Chromium isolado; regras da atividade extraídas da fonte.
- Metadados oficiais de dois vídeos, referências primárias de ensino e
  documentação oficial do sistema de tipos C#.

**Limites:** não houve login de produção, inspeção do catálogo remoto Supabase,
leitura integral dos 27 materiais, reprodução integral dos vídeos, teste com
alunos, avaliação de retenção ou medição de desempenho em telefone físico.
Os 78 registros abaixo são do catálogo local usado pela prévia; não comprovam
78 aulas curadas ou publicadas no banco. Os 731 testes da entrega anterior são
histórico técnico, não uma validação pedagógica nova desta auditoria.

Evidências locais, ignoradas pelo Git: `docs/local/academy-review-20261114/`.
Incluem `ui/report.json`, capturas e `csharp-counterexample.json`. O código da
aplicação, o banco e o deploy não foram alterados nesta revisão.

## 2. Inventário do que existe

| Área | Conteúdo observado no repositório | Limite atual |
| --- | --- | --- |
| Navegação | Início, Trilhas, Praticar, Progresso e Comunidade; formatos dentro de Praticar | Boa base a preservar; o aluno ainda recebe muitas decisões antes de uma sessão definida |
| Biblioteca local | 9 cursos, 29 módulos, 78 entradas, 65 IDs de vídeo e 27 referências a materiais locais existentes | Curadoria e vínculo aula/prática precisam de revisão; banco remoto não conferido |
| Laboratório | 35 desafios: 17 JavaScript, 14 Python, 4 C# | Padrão pedagógico e verificações variam entre desafios |
| Primeiros passos | 4 entregas JS: perfil, conta de serviço, decisão e orçamento | Já distingue guia, alteração e aplicação independente; melhor referência para padronizar unidades |
| C# | 3 módulos, 21 práticas e 9 questões: variáveis, condições e laços | Mapa com 8 estações, 2 disponíveis; executor educacional parcial, sem .NET |
| SQL | Aventura de 10 etapas e oficina de 5 missões, com SQLite real na oficina | Ainda faltam relacionamentos, joins, modelagem, transações, índices e integração com aplicação |
| Monte o Código | 12 fases, JS/Python | Ordenação e previsão; precisa terminar em escrita independente |
| Guia o Orbi | 8 níveis | Interpretador próprio de comandos; não é executor geral de linguagem |
| Vila dos Blocos | 10 fases de símbolos e indentação | Respostas autoradas; precisa de transferência para código real |
| Entrega do Orbi | 3 missões e oficina do pulso com 2 rotas | Forte ligação código/efeito; parser restrito e poucos conceitos |
| Simulador | 2 casos de conexão, uma tarefa de esteira e 2 casos de recuperação | Simula snapshots/configuração; não executa infraestrutura real |
| Inglês | 8 cenas, 12 itens falados, 12 situações e revisão escrita; 31 apoios de pronúncia | Fala autodeclarada; 31 apoios não são 31 aulas faladas nem avaliação de voz |
| Revisão de jogos | 12 perguntas, duas por experiência, até três por sessão | Já há datas de revisão; ainda pouco orientada a habilidade, erro e aplicação nova |

## 3. Problemas que precisam entrar antes da expansão

### P0 — confiança no que se ensina

**F01. Vídeos de Python associados também a aulas de VBA.**
O fallback associa `VdLen3MV-GM` a Python e a “Banco de dados em planilha”, em VBA;
`EV7Idm_mkxo` aparece em Python e em “Formulário que grava no banco de dados”, em VBA.
Os metadados oficiais identificam ambos como cursos de Python. Fontes:
[vídeo da Asimov Academy](https://www.youtube.com/watch?v=VdLen3MV-GM) e
[vídeo de Brenno Sullivan](https://www.youtube.com/watch?v=EV7Idm_mkxo).
Isso confirma duas associações inadequadas; não permite declarar todos os
outros vídeos corretos ou incorretos sem revisão.

**F02. O treino de C# aceita um caso incompatível com a linguagem.**

```csharp
int servicosPendentes = 3;
servicosPendentes = "5";
Console.WriteLine(servicosPendentes);
```

O runner da aplicação produziu `5`; a verificação da atividade devolveu `true`
e `variableCodePassed` aceitou a entrega. O controle válido com um inteiro
também passou. Não houve compilação .NET nesse ensaio. A documentação da
[Microsoft sobre tipos](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/)
explica a incompatibilidade de atribuir valores de outro tipo à variável.
O executor atual transforma um subconjunto de C# em JavaScript; isso requer
um contrato de semântica e testes negativos, além de acertar a saída final.

**F03. Fonte de conteúdo pode ser trocada silenciosamente.**
`courseSourceModules`, em `cursos.ts`, pode preferir a sequência local quando
o número de aulas dos módulos gerados é inferior ao fallback. Essa proteção
histórica contra um seed incompleto precisa evoluir para estado explícito de
fonte/versão/publicação. Quantidade menor também pode ser uma decisão editorial.
Conferir o banco antes de retirar a compatibilidade; preservar IDs e progresso.

**F04. Há uma chamada de comunidade com destino provisório.**
O botão Discord aponta para `https://discord.gg/SEU-GRUPO`, definido em
`src/lib/social.ts`. Um destino não configurado deve ficar indisponível de forma
clara ou ser substituído por um convite real fornecido pelo responsável.

### P1 — continuidade e autonomia

**F05. Quiz e prática podem ser escolhidos por rotação de índice.**
`getLessonGuide`, em `learningExperience.ts`, deriva objetivo/quiz/prática pela
área e posição da aula. Há uma recomendação web com descrição de construir tela
e um slug JS escolhido por rotação. O aluno precisa receber uma tarefa que
verifica especificamente o conceito daquela aula. Tempo estimado também merece
revisão editorial, em vez de depender apenas de haver material anexado.

**F06. O melhor ciclo só cobre quatro dos 35 desafios.**
Os Primeiros passos já exigem alteração e aplicação independente. Isso é uma
fundação real. O próximo trabalho é expandir esse contrato com critérios por
habilidade, testes de fronteira e aceitação de soluções válidas diferentes.

**F07. Há perda de área útil e decisões redundantes.**
No perfil mobile inspecionado, a Home coloca foto e quatro atalhos antes da
missão e empurra “Escrever minha primeira linha” para baixo da primeira tela.
C# e SQL também dão bastante espaço à apresentação antes de começar. No editor
desktop, instrução, trecho de modelo e controles de próxima etapa aparecem em
mais de um lugar. No celular, o editor de seis linhas ocupa bastante espaço
numa tarefa de uma linha; teclado físico/virtual ainda precisa ser observado.

Preservar a direção de arte. Integrar imagem, objetivo e ação na mesma
composição e adaptar a tela à tarefa. A primeira dobra deve ser medida pelo
que o aluno consegue fazer, além de conter mídia.

**F08. A retomada tem portas inconsistentes.**
No estado inspecionado, a Home retomava o inglês falado em `#falar`, enquanto
“Retomar: Inglês em cena”, em Jogos, abria o modo de imagens sem essa âncora.
Progresso mostrava o registro antigo de oito cenas, sem representar ali a
prática oral retomada pela Home. Unificar identidade de atividade/subatividade
e apresentar cada evidência sem somar unidades incompatíveis.

**F09. Celular e computador não compartilham os rascunhos dos jogos/laboratório.**
A separação local é bem informada, mas limita uma proposta de estudar nas pausas
e continuar no PC. Primeiro oferecer transporte/backup com recuperação; depois
sincronizar marcos e versões selecionadas, com fila offline, RLS e conflitos.
Não substituir silenciosamente um rascunho por outro.

**F10. Conclusão e XP não demonstram autonomia.**
Concluir a aula pode ser declarado sem concluir o quiz ou a prática. Isso pode
continuar como histórico de participação. A evidência curricular deve distinguir
consulta, prática com apoio, solução independente e aplicação em outra situação.
Não apagar conquistas anteriores nem bloquear arbitrariamente vídeos por quiz.

**F11. A formação acaba antes de um projeto profissional utilizável.**
C# termina no piloto de fundamentos; SQL, em operações iniciais. Falta a cadeia
de arquivos, ferramentas, dados, testes, versionamento, leitura de código alheio
e entrega. O projeto OrbiServiços já é apresentado pela trilha; precisa virar
um artefato construído ao longo dela.

**F12. Ajuda e revisão ainda não usam um contexto comum de aprendizagem.**
Já existem comunidade, mentorias, pontes jogo/editor, tentativas e revisão com
datas. Falta transformar um bloqueio concreto numa dúvida útil, revisar o erro
por habilidade e recomendar uma variante. A disponibilidade de orientação humana
não foi verificada e não deve ser prometida automaticamente.

## 4. A experiência desejada

### Uma sessão começa com um objetivo e termina com algo que o aluno fez

```text
Escolho meu objetivo e o tempo disponível
  → vejo a missão de hoje e sua posição no caminho
  → prevejo uma consequência
  → experimento uma cena ou exemplo curto
  → investigo o que aconteceu
  → altero uma regra
  → resolvo outra situação com menos apoio
  → guardo uma entrega do meu projeto
  → volto depois para uma variante e para o próximo passo
```

Exploração livre permanece disponível. A navegação principal continua com os
cinco destinos atuais. Os formatos são ferramentas dentro da jornada; não
precisam virar novos menus para cada ideia.

“Tenho uma pausa curta” pode abrir previsão, leitura de erro ou revisão;
“quero construir” retoma uma entrega maior. As durações são escolhas de produto
a testar, sem dividir pessoas em estilos fixos de aprendizagem.

### Exemplo concreto: uma unidade sobre condições

1. Orbi recebe um serviço; é necessário saber se o saldo atingiu a meta.
2. O aluno prevê o resultado com valores visíveis, incluindo o valor exato da meta.
3. Um exemplo executa e mostra a condição e o caminho tomado.
4. O aluno altera a regra e explica uma decisão curta.
5. Um caso com `>` no lugar de `>=` apresenta o erro na fronteira.
6. Outra situação, como desconto ou comissão, é resolvida sem copiar o exemplo.
7. A regra entra no OrbiServiços e recebe testes com entradas diferentes.
8. Em outra sessão, uma variante verifica se a ideia voltou sem o modelo.

Jogo e demonstração devem declarar a linguagem usada. Um comando de um
interpretador do jogo não deve ser apresentado como se fosse C# completo.

## 5. Projeto que atravessa a formação: OrbiServiços

O aluno constrói uma ferramenta para um pequeno negócio: serviços/entregas,
custos, saldo, clientes e pedidos. O contexto pode ser escolhido e ganhar dados
próprios. A entrega final precisa de uma funcionalidade autoral, evitando uma
turma inteira com o mesmo projeto apenas copiado.

| Estação | O que passa a existir no projeto | Evidência principal |
| --- | --- | --- |
| Fundamentos | Dados, cálculos e regras de um serviço | Solução independente e entradas de fronteira |
| Métodos e coleções | Regras separadas e lista de serviços | Ler, alterar, testar lista vazia e vários itens |
| Ambiente real | Projeto .NET em arquivos no computador | Executar, reconhecer erro e registrar uma mudança |
| Persistência | Guardar e recuperar dados; depois relacionar clientes e pedidos | Dados continuam após reabrir; consultas explicadas |
| API | Receber e consultar pedidos com HTTP | Validação, erros coerentes e testes de aceitação |
| Colaboração | Issue, leitura de diff, teste que falha e correção | Mudança pequena justificada e revisada |
| Entrega autoral | Uma nova regra de negócio escolhida pelo aluno | Código, README, instruções, demonstração e explicação de um defeito corrigido |

Inglês aparece quando necessário para ler botão, erro, teste ou documentação,
mantendo a metodologia de pronúncia da Orbitamos. SQL usa dados do mesmo
projeto. O simulador ensina os efeitos de configuração e entrega sobre esse
trabalho; cenários simulados e execução real continuam identificados.

### Decisão técnica para C#

Recomendação inicial: fundamentos no navegador com limites honestos e
checagens corretas; transição guiada para o SDK .NET no computador antes de
prometer classes, arquivos e APIs executáveis. A plataforma .NET é gratuita
e aberta; há [orientação oficial para criar e executar um projeto](https://learn.microsoft.com/en-us/dotnet/core/tutorials/create-console-app?pivots=vscode).

Execução completa dentro do celular exige um estudo técnico separado. Uma
solução cliente/WASM precisa ser medida em download, memória, tempo inicial,
segurança e Safari. Não colocar execução arbitrária de código no backend atual
nem assumir que um serviço externo será gratuito e ilimitado. O aluno precisa
saber de antemão em que estação será necessário outro ambiente.

## 6. Formatos que vale evoluir ou acrescentar

| Formato | Situação atual | Próxima evolução útil |
| --- | --- | --- |
| Mesa de execução | Há previsões e estados em jogos/questões | Visualizar variáveis, linha atual, condição e saída, com previsão antes de avançar |
| Plantão de bugs | Há depuração em atividades C# e incidentes no simulador | Uma sequência transversal: sintoma → hipótese → teste → correção mínima → regressão |
| Exemplo com ajuda que diminui | Já existe nos quatro Primeiros passos | Aplicar ao currículo; retirar partes e exigir uma variante nova |
| Código em peças | Monte o Código já entrega esse formato | Usar como ajuda opcional e retornar ao editor vazio; toque/setas além de arrastar |
| Leitura de PR/diff | Não identifiquei uma prática curricular dedicada | Comparar duas mudanças, escolher testes e justificar uma revisão |
| Ensine o Orbi | Há perguntas e explicações, sem contrato de autoexplicação transversal | Explicar uma decisão ou corrigir uma explicação do personagem; critérios claros, sem falsa nota por IA |
| Revisão por erro e habilidade | Já há fila de jogos com datas e revisão escrita de inglês | Variar contexto/dados, cruzar evidências e mostrar o que vale revisar hoje |
| Missão aberta | Há aplicação independente em quatro desafios | Requisito novo, testes de aceitação e soluções diferentes; incorporar ao projeto |

A ordem é integrar o ciclo existente e acrescentar apenas o formato necessário
para fechar uma lacuna observada. Não há motivo para lançar oito ferramentas
novas ao mesmo tempo.

Nos jogos, manter a qualidade visual da Entrega e fazer o código gerar uma
consequência compreensível. Novos inimigos/poderes devem servir a um conceito.
Oferecer ajuda motora ou modo de estudo: dificuldade de pular não deve impedir
reconhecer uma evidência correta de programação. A conquista de gameplay pode
continuar tendo seus próprios requisitos.

## 7. Estrutura comum para manter e ampliar

Evolução incremental sobre os módulos e saves atuais, sem reescrever o site:

```text
Competência: identificador, resultado observável e critérios
Unidade: id/versão, competências, pré-requisitos, fonte revisada,
         dispositivo, formato, avaliador e artefato esperado
Evidência: id único, conta proprietária, unidade/versão, participação ou tarefa verificada,
           ajuda usada, resultado, avaliador/versão, data e referência do artefato
Plano do aluno: objetivo, caminho, ponto atual e próximo passo
Adaptadores: conteúdo e saves atuais → esse contrato comum
```

Uma aula declara seu exercício e avaliação, sem escolher por módulo aritmético
do índice. O progresso mostra evidências por conceito e projetos; o histórico de
aulas e badges permanece consultável, sem um percentual universal de domínio.

O catálogo publicado precisa declarar fonte canônica e revisão. Separar
rascunho, revisado, publicado e desatualizado; quantidade de entradas não decide
automaticamente qual fonte vence. Material de apoio tem autoria/fonte,
objetivo, pré-requisito, alternativa legível no celular e data de conferência.

Para continuidade, manter execução no cliente e conteúdo sob demanda. Fazer
backup/importação com validação e prévia de conflitos. Depois, sincronizar
marcos e versões selecionadas no Supabase existente, com RLS, idempotência,
limite de payload e fila offline. Evitar escrita por tecla/quadro e envio de
código pessoal para analytics por padrão. Capacidade e consumo precisam de
medição; este plano não promete hospedagem gratuita ilimitada.

## 8. Lotes de execução e critérios de saída

Estimativas abaixo são de complexidade relativa, não prazo prometido.
Cada lote deve terminar utilizável e verificável antes de ampliar o escopo.

| Lote | Entrega | Dependência | Critério para considerar pronto | Porte |
| --- | --- | --- | --- | --- |
| 0A — Correções de confiança | Corrigir os dois vínculos confirmados; validar tipagem do subconjunto C# ensinado e seus limites; resolver destino provisório | Conferir fonte remota antes de mudar conteúdo publicado | Contraexemplos conhecidos rejeitados sem invalidar soluções corretas; unidade escolhida revisada; IDs e conquistas preservados; link sem placeholder | Médio |
| 0B — Curadoria progressiva | Inventariar 78 entradas/27 materiais e suas fontes; definir fonte canônica e revisar unidades por prioridade | Pode avançar em paralelo a 1–2 | Cada unidade publicada no percurso tem objetivo, fonte e revisão explícitos; comparação com banco documentada; sem substituição silenciosa por quantidade | Médio, contínuo |
| 1 — Primeira sessão | Uma missão prioritária na Home; ação inicial visível no celular; entrada/edição com uma orientação principal; retomada exata entre portas | 0A e curadoria da unidade escolhida, sem esperar toda a biblioteca | Iniciante encontra, escreve, executa e retoma sem alguém apontar onde tocar; testar teclado, interrupção, erro e estado vazio | Médio |
| 2 — Unidade de referência | Condições no OrbiServiços, com previsão, alteração, depuração e situação independente | 0A–1 | Casos de fronteira e soluções válidas alternativas; ajuda registrada; desafio novo sem modelo; dúvida ligada ao contexto | Médio |
| 3 — Prova e continuidade | Contrato mínimo de evidência; adaptadores; backup e transporte de rascunhos; desenho de sincronização | Unidade de referência | Exportar/importar entre contextos; rejeitar arquivo inválido; tratar storage e conflito sem apagar trabalho; sem misturar XP com autonomia | Médio/alto |
| 4 — Projeto executável | OrbiServiços em .NET real, arquivos, métodos, coleções, testes e README | 0A, 2–3; decisão do ambiente | Aluno abre, executa, corrige e entrega um projeto; execução local relatada e verificação confiável identificadas de forma diferente | Alto |
| 5 — Formação aplicada | Persistência, SQL relacional, API, validação, erros, Git e colaboração, em unidades publicadas gradualmente | 4 | Cada etapa acrescenta comportamento ao projeto e termina em evidência; mapa distingue disponível e preparação | Alto, dividido em unidades |
| 6 — Reforço e mundos | Evoluir revisão por conceito, clínica de bugs, leitura de diff e capítulos dos jogos | Contrato de evidência e necessidade demonstrada | Variante posterior, consequência do código e ponte ao projeto; alternativas de acessibilidade; orçamento de mídia medido | Médio por formato |
| 7 — Piloto com estudantes | Observar sessões e aplicação independente; ajustar currículo e interação | Começa após 1–2 e se repete | Registro dos bloqueios e ajudas, variante nova e revisão posterior; decisões sustentadas por observação, sem inventar taxa de eficácia | Contínuo |

O Lote 0A não promete um compilador C# completo. Se uma verificação coerente
do subconjunto não couber no recorte, retirar a aprovação automática dos casos
não sustentados e explicitar a limitação até definir o ambiente real. Não
transformar o contraexemplo em uma exceção textual isolada que apenas mascara o erro.

No Lote 3, rede e fila offline só entram nos testes quando um piloto de
sincronização for implementado; backup/transporte não serão anunciados como
sincronização automática entre dispositivos.

**Primeira rodada recomendada:** Lote 0A e o recorte de Home/editor do Lote 1;
em seguida, uma única unidade completa do Lote 2. Não começar gravando dezenas
de novas aulas ou construindo uma infraestrutura 3D antes de validar esse percurso.

### Backlog inicial, em ordem

1. Criar casos negativos de tipos C# a partir do contraexemplo e definir limites do runner.
2. Auditar os dois vínculos de vídeo confirmados e a publicação/fallback dos cursos afetados.
3. Iniciar classificação das 78 entradas e 27 materiais; revisar primeiro a unidade piloto e expandir sem bloquear a primeira sessão pela biblioteca inteira.
4. Exigir metadados autorados de objetivo, atividade e avaliação para novas unidades.
5. Remover destino provisório do fluxo de ajuda ou configurar convite aprovado pelo responsável.
6. Reordenar Home mobile e introduções para preservar mídia e ação na área útil.
7. Simplificar duplicações no editor e observar o teclado real do iPhone.
8. Corrigir identidade de retomada/progresso das subatividades, incluindo inglês falado.
9. Fechar a unidade de condições com testes, variante independente e registro de ajuda.
10. Fazer o primeiro ensaio com iniciantes antes de expandir para todas as matérias.

### Responsabilidades e revisão de cada unidade

IA/desenvolvimento implementam e apresentam código, testes e evidências. O
responsável pedagógico da Orbitamos confere objetivo, explicação, exemplos,
fontes e solução esperada; revisão técnica automatizada não substitui essa
curadoria. Alunos voluntários testam compreensão e uso sem receber instruções
sobre onde clicar. Disponibilidade de mentor/revisor precisa ser combinada,
sem deixar o estudo obrigatório dependente de uma resposta humana imediata.

Uma unidade só entra no percurso principal com objetivo observável, pré-requisitos,
atividade correspondente, exemplos corretos/incorretos, casos de teste,
tratamento de ajuda, alternativa independente, dispositivo necessário e critério
de conclusão. Novas expressões inglesas seguem o catálogo e a metodologia de
pronúncia já estabelecidos. Preservar versões anteriores permite corrigir conteúdo
sem apagar o trabalho do aluno.

## 9. Como saber se melhorou

**Usabilidade:** observar inicialmente cinco voluntários, entre celular e PC,
sem explicar onde clicar. Pedir que encontrem a missão, executem, entendam um
erro, peçam ajuda e retomem após interrupção. Registrar cada bloqueio e o espaço
com teclado aberto. Cinco observações são um começo prático, não uma amostra
estatística da população.

**Aprendizagem:** tarefa equivalente antes/depois, uma situação nova sem modelo
e outra variante aproximadamente uma semana depois. Registrar pistas, tentativas,
correção de fronteiras e uma explicação curta. Um antes/depois isolado não prova
causalidade; comparar versões/ordem dos casos quando viável.

**Métricas principais:** primeira execução válida, solução independente,
quantidade/tipo de ajuda, bloqueios recorrentes, preservação do trabalho e
desempenho numa variante posterior. Visitas, XP, sequência diária e tempo aberto
são indicadores de participação. Não há taxas atuais medidas nesta auditoria.

**Guardas técnicos:** não aprovar contraexemplos conhecidos; preservar saves;
não confundir simulação com runtime real; não mostrar resposta antes da tarefa
de recuperação; não depender de arrasto, som ou reflexo como único acesso;
testar desktop, toque, movimento reduzido, rede intermitente e leitor de tela.

Para eventos, começar com poucos marcos: iniciou, tentou, pediu pista, validou,
concluiu variante e retomou. Medir com finalidade explícita e mínima coleta.

## 10. Referências e grau de confiança

Consulta em 14/11/2026. A aplicação destas ideias na Orbitamos ainda deve ser
validada com seu público; animação ou referência de concorrente não prova ensino.

- [PRIMM — Sentance, Waite e Kallia, 2019](https://primmportal.com/wp-content/uploads/2020/10/teaching-computer-programming-with-primm-a-sociocultural-perspective.pdf):
  estudo com 493 estudantes de 11–14 anos em 13 escolas, com professores.
  Fundamenta o ciclo prever/executar/investigar/modificar/criar; não é prova de
  eficácia de um aplicativo autônomo para adultos no celular.
- [Atkinson, Renkl e Merrill, 2003](https://experts.azregents.edu/en/publications/transitioning-from-studying-examples-to-solving-problems-effects-/):
  retirada gradual de passos e autoexplicação em dois experimentos; orienta a
  passagem de exemplo para problema independente.
- [Ericson, 2018 — Parsons](https://repository.gatech.edu/items/7cb3420a-73fd-49a2-a4fb-3c2fe2a4c0a0):
  investiga eficiência de problemas de ordenar código; não autoriza substituir
  escrita livre por montagem de peças em toda a formação.
- [Butler, 2010](https://pubmed.ncbi.nlm.nih.gov/20804289/) e
  [Cepeda et al., 2008](https://pubmed.ncbi.nlm.nih.gov/19076480/):
  recuperação e espaçamento em outros contextos de conteúdo. Intervalos exatos
  como 1/3/7 dias são hipóteses de produto para programação, não calendário ótimo comprovado.
- [Exercism: exercícios de conceito](https://exercism.org/docs/building/product/concept-exercises)
  e [de prática](https://exercism.org/docs/building/product/practice-exercises):
  benchmark de objetivos, pré-requisitos e aplicação.
- [CS50x 2026: projeto final](https://cs50.harvard.edu/x/project/) e
  [Odin Foundations](https://www.theodinproject.com/paths/foundations/courses/foundations):
  benchmarks de projetos, ferramentas e entregas; não estudos causais de eficácia.
- [WCAG 2.2: alternativa ao arrasto](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
  e [tamanho mínimo de alvo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html):
  referência de acessibilidade. 44–48 px para ações centrais é escolha de conforto
  da Orbitamos; o critério AA de alvo estabelece 24 CSS px sujeito às suas condições.
- [Microsoft: tipos C#](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/),
  [.NET aberto e gratuito](https://dotnet.microsoft.com/en-us/learn/dotnet/what-is-dotnet)
  e [projeto de console](https://learn.microsoft.com/en-us/dotnet/core/tutorials/create-console-app?pivots=vscode):
  referências do comportamento da linguagem e da transição para ambiente real.

### Fontes internas para executar o plano

`src/lib/cursos.ts`, `learningExperience.ts`, `academyStudyPath.ts`,
`academyActivity.ts`, `practiceExperience.ts`, `beginnerPractice.ts`,
`browserCodeRunner.ts`, `csharpVariables.ts`, `csharpTrack.ts`, `desafios.ts`,
`practiceStation.ts` e `social.ts`, todos dentro de `apps/web/`.
Componentes: `AcademyContinue`, `GuidedPractice`, `PracticeStation`,
`AcademyActivityProgress`, `CSharpTrack` e a página `estudante/cursos/[slug]`.

Antes de implementar um lote, reler este plano, os contratos dos saves afetados
e o padrão visual. Registrar decisões, evidências e o próximo ponto de retomada
no fechamento de cada entrega. Uma etapa planejada não deve ser apresentada
como implementada nem como aprendizagem comprovada.
