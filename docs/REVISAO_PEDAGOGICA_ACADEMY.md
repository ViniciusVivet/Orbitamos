# Academy — revisão pedagógica e continuidade

Data: 24/10/2026. Foco: prática, jogos, código e experiência mobile/desktop. Não inclui páginas comerciais, vídeos ou biblioteca de leitura.

## Diagnóstico

A Academy já tinha variedade, mas o aluno precisava descobrir sozinho qual atividade escolher, o que ela ensina e o que fazer depois. Mais jogos isolados não resolveriam isso. Os principais problemas encontrados foram:

1. Catálogo orientado por nomes de jogos/fases, não pelo objetivo de aprendizagem.
2. Pouca ligação explícita entre manipular peças, compreender uma regra e escrever código.
3. Tentativas em andamento perdidas ao sair de Monte o Código, Vila e Guia o Orbi.
4. Progresso de prática guiada não considerado de forma consistente na página de progresso.
5. Falta de atividades visuais de inglês aplicado e de um jogo com movimento contínuo.
6. Poucas oportunidades de voltar a uma ideia em outro contexto.
7. Cabeçalho comercial disputando espaço com a atividade em telas pequenas.

Não tratamos pessoas como tipos fixos de “aprendiz visual” ou “aprendiz de código”. Os formatos são alternativas para a tarefa e para o momento; o mesmo aluno pode explorar, ler, jogar e escrever.

## Ciclo adotado

**Contexto → experimentar → prever/explicar → aplicar em código → revisitar.**

- Um objetivo pequeno e concreto por missão.
- Pistas opcionais, erros explicados e nova tentativa sem perder conquistas.
- Acertar um clique não equivale a dominar programação.
- A conclusão depende da checagem da atividade, nunca de apenas abrir a página.
- O laboratório continua disponível diretamente para quem já sabe o que quer fazer.
- Novas atividades devem terminar com uma aplicação relacionada, não com um botão genérico sem contexto.

Essa direção se apoia nas recomendações de compreensão de programas, exemplos concretos, suporte gradual e PRIMM da [Raspberry Pi Foundation](https://www.raspberrypi.org/teach/pedagogy). A revisão usa recuperação ativa, feedback e novas situações, conforme o guia da [Australian Education Research Organisation](https://www.edresearch.edu.au/guides-resources/practice-guides/spacing-and-retrieval-practice-guide-full-publication).

Essas fontes sustentam os princípios, não provam que nosso jogo específico já melhora aprendizagem ou retenção. Isso exige observar alunos reais e avaliar transferência.

## Entregas desta rodada

### Central “Jogar e praticar”

Rota autenticada: `/estudante/jogos`. Prévia somente em desenvolvimento: `/dev/academy-preview`.

- Seis experiências organizadas por objetivo, com filtros.
- Uma recomendação inicial ou retomada da última experiência aberta e ainda não concluída.
- Monte e Guia o Orbi abrem a primeira fase ainda não concluída; ao terminar toda a aventura, é possível revisitar o início.
- Objetivo, formato e habilidade visíveis em cada card.
- Entrada direta para laboratório e trilha C#.
- Biblioteca das fases antigas mantida em uma seção expansível.
- O item existente do menu foi renomeado, sem acrescentar mais opções à sidebar.

| Experiência | Formato | Ideia praticada |
| --- | --- | --- |
| A loja do Orbi | Aventura SQL guiada | Linhas, colunas e filtros |
| Entrega do Orbi | Plataforma com física e controles | Variáveis, impulso e condições |
| Inglês em cena | Ilustração, escolha e palavra digitada | Vocabulário, erro, retorno e saída |
| Vila dos Blocos | Quebra-cabeça com história | Símbolos e indentação |
| Guia o Orbi | Planejamento e execução de comandos | Sequência, função e repetição |
| Monte o Código | Programa em peças e previsão | Leitura, ordem e resultado |

### Entrega do Orbi

- Jogo com movimento contínuo, gravidade, plataformas, pulo e queda.
- Três missões: velocidade horizontal, impulso do pulo e condição de energia.
- Primeiro o aluno altera um parâmetro e observa o mundo responder.
- Assistência de movimento por padrão; teclado e botões de toque para jogar manualmente.
- Chegar ao destino não basta: há uma pergunta de compreensão antes da conclusão.
- Pausa, reinício da tentativa, redução de movimento e pausa ao perder foco.
- Usa o mascote existente com imagem otimizada, sem baixar o PNG completo para cada sprite.

É um primeiro capítulo jogável, não um jogo completo com dezenas de mundos.

### Inglês em cena

- Oito cenas na oficina do Orbi, com desenhos SVG próprios.
- `folder`, `file`, `button`, `server`, interpretação de `file not found`, recuperação digitada de uma palavra, `return` e `output`.
- Alterna reconhecimento visual, interpretação contextual e recuperação sem copiar a resposta da própria imagem.
- O exemplo de função distingue devolver um valor de mostrá-lo no console.
- Feedback explica o motivo, pistas são opcionais e há glossário final.
- Rascunho digitado e cenas concluídas sobrevivem à recarga.

### Continuidade e transferência

- Monte, Vila e Guia o Orbi preservam rascunhos por usuário e fase, com validação do conteúdo salvo.
- Reset de tentativa não apaga conquistas anteriores.
- Após uma checagem validada, aparece “Leve a descoberta para o código”. O destino varia com a fase: função leva a função; lista leva a lista; condição leva a condição.
- O editor identifica de qual experiência o aluno veio. Não insere uma solução nem substitui seu código salvo.
- Ao recarregar as experiências novas já concluídas, a ponte continua disponível.
- A prática guiada e o modo livre usam o mesmo critério de conclusão na contagem de progresso. Visita, etapa parcial ou save inválido não contam.

### Revisão de bolso

- Banco inicial de 12 perguntas, com até três por sessão e apenas sobre experiências concluídas.
- Alterna perguntas da mesma habilidade entre revisões.
- Resposta incorreta recebe explicação e pode ser tentada novamente.
- A primeira sugestão é registrada para outro dia; revisões seguintes usam intervalos de 3, 7, 14 e 30 dias para priorizar a fila. É uma regra inicial do produto, não um intervalo cientificamente “perfeito”.
- O aluno pode revisar antes. Não há bloqueio, notificação automática, perda de sequência ou punição por ausência.

## Estado e limitações

- Os jogos e o diário de práticas usam **localStorage por conta e navegador**. Não há sincronização desses novos registros entre celular e computador.
- Visitar a experiência registra apenas abertura. “Já praticou” significa conclusão das checagens daquela experiência, não certificação de domínio.
- A revisão é uma fila simples, não um sistema adaptativo de proficiência.
- As prévias `/dev/*` são bloqueadas em produção; usuários reais acessam pelas rotas autenticadas.
- Não foram alterados vídeos, conteúdo de leitura ou páginas comerciais.
- A reorganização completa da sidebar ficou para uma próxima etapa, conforme a conversa. Esta rodada reduz a desorganização dentro da área de prática.
- Não foram adicionados rastreadores ou telemetria de alunos.
- Testes WebKit simulam Safari/iPhone, mas não substituem teclado virtual, desempenho e toque em um aparelho físico.

## Validação reproduzível

Na pasta `apps/web`:

```text
npm test -- --maxWorkers=2
node scripts/audit-practice-station.mjs
node scripts/audit-orbi-delivery.mjs
node scripts/audit-code-english.mjs
node scripts/audit-game-continuity.mjs
node scripts/audit-game-preview-handoff.mjs
npm run build
```

Os scripts de navegador usam o servidor de desenvolvimento em `http://localhost:3015`. Não executar build e servidor dev simultaneamente, para evitar conflito nos arquivos gerados pelo Next.

- Suíte unitária: **321 testes, 37 arquivos, todos aprovados** nesta rodada.
- Build de produção e checagem TypeScript aprovados. Permanecem os avisos já existentes de Browserslist desatualizado e rastreamento amplo de arquivos em `api/course-materials/[...path]`; o lint direcionado não teve erros, apenas o aviso anterior de `<img>` no Guia o Orbi.
- Smoke HTTP no servidor de produção local: central e prévias Monte/Orbi retornaram 404; as rotas reais de jogos responderam 200 e mantêm o fluxo de autenticação do portal. O servidor temporário de produção foi encerrado após essa checagem.
- Plataforma: três missões, perguntas, persistência, pausa, teclado e movimento/pulo simultâneos por toque.
- Inglês: oito cenas, resposta incorreta, palavra digitada, recarga, retomada e conclusão.
- Continuidade: Monte/Vila/Orbi, rascunhos, troca de fase e reinício sem apagar conquistas.
- Integração: hub e prévias Monte/Orbi compartilham a conta de teste quando abertos pela central; prévias independentes e seus rascunhos antigos permanecem intactos.
- Perfis: Chromium desktop, WebKit/iPhone 13 e Chromium estreito de 320px; continuidade legada também em Chromium 390px.
- Verificações de acessibilidade automatizada, overflow e erros de página nos cenários cobertos. Isso não equivale a uma auditoria WCAG completa.
- Evidências locais em `apps/web/test-results/`, ignoradas pelo Git. Os relatórios distinguem conclusões realmente jogadas de fixtures usadas para testar integração.

## Próximas etapas, em ordem

1. **Observar três a cinco iniciantes no celular**, sem ensinar onde tocar. Perguntar: “O que você está tentando fazer? Por que essa resposta? Consegue fazer uma variação sem a dica?”. Corrigir primeiro os pontos de abandono.
2. **Aprofundar transferência**: uma pequena tarefa inédita após a atividade, com critérios observáveis, em vez de apenas repetir o exemplo. Acrescentar desafios de depuração e previsão antes de mais conteúdo.
3. **Sequência de fundamentos**: conectar as habilidades já existentes numa jornada curta — valor, variável, condição, repetição, função e coleção — com revisão cumulativa. Os formatos continuam alternativos dentro da jornada.
4. **Sincronização de progresso**: definir e migrar o contrato servidor/conta sem apagar saves locais, com testes de troca de aparelho e modo offline.
5. **Capítulos novos, não minijogos soltos**: expandir a Entrega do Orbi e o inglês a partir de objetivos curriculares e das dificuldades observadas.
6. **Infraestrutura contextual**: navegador → requisição → servidor → banco; depois HTTP, ambiente, Git, deploy e Docker, no ponto em que o projeto realmente precisar. Não apresentar uma lista de siglas antes de uma necessidade concreta.
7. **Arquitetura da sala de aula**: reduzir caminhos concorrentes e dar destaque a continuar, praticar e pedir ajuda, com pesquisa de navegação antes de copiar o menu de outra plataforma.

### Critérios para avaliar a próxima rodada

Não otimizar apenas tempo de tela ou quantidade de cliques. Avaliar se o aluno começa sem ajuda, retoma sem se perder, explica uma previsão, resolve uma variação e lembra a ideia dias depois. Medidas de abandono, pedidos de pista e retorno só devem ser coletadas com um contrato de privacidade claro.

Nada nesta revisão promete emprego, domínio ou retenção garantida. O próximo ganho de qualidade depende tanto de observar alunos quanto de escrever mais código.
