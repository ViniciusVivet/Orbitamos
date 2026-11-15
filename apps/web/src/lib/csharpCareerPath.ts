import type { csharpStages } from "./csharpTrack";

export type CSharpCareerStageId = (typeof csharpStages)[number]["id"];
type CSharpCareerModule = "variables" | "conditions" | "loops";
type CareerPattern = { name: string; file: string; purpose: string; status: "available" | "planned" };
export type CSharpCareerStagePlan = {
  id: CSharpCareerStageId;
  competence: string;
  status: "available" | "partial" | "planned";
  ticket: { title: string; request: string; why: string };
  patterns: readonly CareerPattern[];
  delivery: { title: string; task: string; artifact: string };
  acceptance: readonly string[];
  environment: { phone: string; computer: string; requiresSdk: boolean };
  prerequisites: readonly CSharpCareerStageId[];
  availableModules: readonly CSharpCareerModule[];
  availableUnits?: readonly "methods"[];
  artifact: { file: string; language: "csharp" | "sql" | "yaml" | "markdown"; code: string; note: string };
};

/** Descriptive curriculum, not an additional list of published lessons.
 * availableModules identifies browser exercises; availableUnits identifies
 * preparation units whose real execution uses the environment stated below. */
export const csharpCareerPath = {
  start: {
    id: "start", status: "available", competence: "Guardar dados, calcular uma quantidade e explicar o que aparece no console.",
    ticket: { title: "Quanto trabalho falta entregar?", request: "A OrbiServiços atende Nina. São 12 serviços e 4 já terminaram. Mostre o nome da cliente e quantos ainda faltam.", why: "Um time precisa representar dados antes de construir telas, instalar pacotes ou pedir uma aplicação inteira à IA." },
    patterns: [
      { name: "Declaração tipada: string, int e bool", file: "Program.cs", purpose: "Distinguir texto, quantidade e condição; usar o nome da variável em vez de repetir um valor fixo.", status: "available" },
      { name: "Cálculo com variáveis e saída no console", file: "Program.cs", purpose: "Fazer a resposta acompanhar os dados quando a quantidade muda.", status: "available" },
    ],
    delivery: { title: "Resumo de serviços", task: "Escreva o programa, execute, corrija um erro de nome e adapte os dados para outra cliente.", artifact: "Program.cs com dados e saldo calculado" },
    acceptance: ["Mostra o nome e a quantidade pendente na ordem solicitada.", "Calcula usando as variáveis e funciona quando as quantidades mudam.", "Explica a diferença entre o texto entre aspas e o nome de uma variável."],
    environment: { phone: "Já pode escrever e executar no laboratório, inclusive pelo celular; o rascunho fica neste navegador.", computer: "O mesmo laboratório funciona no computador. O SDK .NET ainda não é necessário para estas atividades.", requiresSdk: false },
    prerequisites: [], availableModules: ["variables"],
    artifact: { file: "Program.cs", language: "csharp", code: 'string cliente = "Nina";\nint pendentes = 12 - 4;\nConsole.WriteLine(cliente);\nConsole.WriteLine(pendentes);', note: "Exemplo curto dos fundamentos já disponíveis; a atividade pede que você escreva e valide seu próprio programa." },
  },
  logic: {
    id: "logic", status: "partial", competence: "Escolher um caminho e percorrer vários serviços sem repetir o mesmo código manualmente.",
    ticket: { title: "Qual serviço pode seguir?", request: "Mostre quando tudo foi entregue, quando há trabalho pago para fazer e quando é preciso aguardar pagamento. Depois processe uma fila, inclusive vazia.", why: "Regras de negócio combinam dados, decisões e repetições. Um programa pode executar sem erro e ainda tomar a decisão errada." },
    patterns: [
      { name: "if / else if / else e condições booleanas", file: "Program.cs", purpose: "Separar situações e respeitar a ordem dos caminhos.", status: "available" },
      { name: "for / while: contador e acumulador", file: "Program.cs", purpose: "Repetir com início, condição de parada e atualização explícitos.", status: "available" },
      { name: "Array e foreach", file: "Program.cs", purpose: "Percorrer os itens da fila sem fixar a resposta em uma quantidade específica.", status: "available" },
    ],
    delivery: { title: "Processador de pendências", task: "Crie regras e contagens para a fila e investigue um erro de limite. Depois, continue na unidade de métodos e projeto .NET para dar nome e reutilizar uma regra.", artifact: "Program.cs com decisões e repetições verificadas" },
    acceptance: ["A regra distingue pendência zero, trabalho liberado e pagamento ausente.", "O laço termina e trata fila vazia, parcial e concluída.", "Consegue prever um caso de limite e corrigir uma comparação que exclui esse caso."],
    environment: { phone: "Condições e laços já podem ser praticados no subconjunto C# do navegador.", computer: "Estas práticas usam o laboratório. A unidade seguinte prepara métodos para executar num projeto com SDK .NET 10.", requiresSdk: false },
    prerequisites: ["start"], availableModules: ["conditions", "loops"],
    artifact: { file: "Program.cs", language: "csharp", code: 'int[] fila = { 0, 2, 5 };\nforeach (int pendentes in fila) {\n    if (pendentes > 0) Console.WriteLine("Há trabalho");\n}', note: "Exemplo de repetição já suportada; métodos e pacotes não fazem parte deste trecho." },
  },
  objects: {
    id: "objects", status: "partial", competence: "Dar nome a uma regra, reutilizá-la com outros dados e iniciar um projeto .NET. Classes e coleções vêm depois.",
    ticket: { title: "O programa cresceu. Como manter a regra?", request: "A equipe quer usar a conta de pendências para clientes diferentes e decidir se o trabalho pode começar quando há pagamento e serviço pendente.", why: "Na empresa, outra pessoa vai ler e alterar o código. Métodos e modelos claros vêm antes de adicionar frameworks." },
    patterns: [
      { name: "Método com parâmetros e retorno", file: "Program.cs", purpose: "Dar nome à regra com uma função local, receber dados e devolver o resultado antes de estudar classes.", status: "available" },
      { name: "Classe, propriedade e construtor", file: "Servico.cs", purpose: "Representar um serviço válido e proteger suas regras; apresentar null e erros previstos no contexto certo.", status: "planned" },
      { name: "List<T> e consulta LINQ", file: "CatalogoServicos.cs", purpose: "Guardar vários objetos e filtrar o que o atendimento precisa, depois de entender laços e métodos.", status: "planned" },
    ],
    delivery: { title: "Regras do OrbiServiços no seu projeto", task: "Prepare o SDK .NET 10, encontre Program.cs e execute as quatro tarefas de métodos. Investigue o retorno fixo, escreva uma nova decisão e registre um commit local. Classes e coleções continuam em preparação.", artifact: "Program.cs com funções, conferência local e primeiro commit" },
    acceptance: ["Consegue chamar a mesma função com outros dados e explicar seu retorno.", "Distingue retorno de saída no console e corrige uma regra que compila, mas responde errado.", "Salva, executa no SDK, lê seu diff e registra um commit no repositório de estudo."],
    environment: { phone: "Pode prever o retorno, preparar e guardar um rascunho. Os métodos desta unidade não são executados pelo laboratório do navegador.", computer: "Use o pacote da unidade com SDK .NET 10: arquivos, terminal, build/run e Git têm orientação passo a passo. Declarar que executou não é uma verificação automática da Orbitamos.", requiresSdk: true },
    prerequisites: ["logic"], availableModules: [], availableUnits: ["methods"],
    artifact: { file: "Program.cs", language: "csharp", code: 'Console.WriteLine(CalcularPendentes(8, 3));\nint CalcularPendentes(int total, int concluidos) {\n    return total - concluidos;\n}', note: "Exemplo de função local para executar no projeto com SDK .NET 10. O laboratório do navegador não executa este trecho. Classes e coleções terão unidades próprias." },
  },
  data: {
    id: "data", status: "planned", competence: "Modelar dados relacionados, consultar com SQL e persistir pelo EF Core entendendo o que ele faz.",
    ticket: { title: "Fechou o sistema. Os serviços sumiram.", request: "O atendimento precisa reabrir o programa e encontrar clientes, serviços e a relação entre eles. Também precisa consultar só o que ainda está pendente.", why: "Uma lista em memória desaparece ao encerrar o processo. Persistência exige esquema, identidade, relações e consultas com critérios." },
    patterns: [
      { name: "Tabela, chave primária e chave estrangeira", file: "database/001-inicial.sql", purpose: "Modelar cliente e serviço e entender relações antes de deixar um ORM gerar o esquema.", status: "planned" },
      { name: "SELECT com WHERE e JOIN", file: "database/consultas.sql", purpose: "Responder perguntas do atendimento sem confundir consulta com alteração dos dados.", status: "planned" },
      { name: "DbContext, DbSet e migration do EF Core", file: "ServicoDb.cs", purpose: "Persistir e evoluir o esquema com um provider por vez; conferir a consulta e a migração produzidas.", status: "planned" },
    ],
    delivery: { title: "Cadastro que sobrevive ao reinício", task: "Modele, crie o banco local e implemente cadastro e consulta. Comece com SQLite para a oficina de baixa exigência; SQL Server ou PostgreSQL entram quando o contexto pedir, um de cada vez.", artifact: "Esquema, consultas SQL e projeto com persistência" },
    acceptance: ["Os registros continuam disponíveis ao reabrir o programa.", "Uma consulta relaciona cliente e seus serviços sem misturar registros de outra pessoa.", "Explica e revisa uma migration antes de aplicá-la no banco local de treino."],
    environment: { phone: "As oficinas SQL atuais ajudam com consultas, mas não equivalem a este futuro módulo C#/EF Core.", computer: "Projeto .NET e banco local de treino. O roteiro usará um provider por vez e explicará as diferenças de dialeto; não exige conta de nuvem.", requiresSdk: true },
    prerequisites: ["objects"], availableModules: [],
    artifact: { file: "database/001-inicial.sql", language: "sql", code: "CREATE TABLE servicos (id INTEGER PRIMARY KEY, descricao TEXT NOT NULL);\nINSERT INTO servicos VALUES (1, 'Revisão');\nSELECT id, descricao FROM servicos ORDER BY id;", note: "Exemplo inicial de SQLite para o produto futuro; relacionamentos, tipos e uso com EF Core terão explicação e exercícios próprios." },
  },
  api: {
    id: "api", status: "planned", competence: "Entender HTTP e JSON, construir uma API e usar async/await antes de integrar outras aplicações.",
    ticket: { title: "O atendimento precisa consultar pelo navegador.", request: "Publique endpoints para cadastrar, listar e consultar serviços por identificador. Um pedido inválido ou um serviço inexistente deve ter resposta clara.", why: "O backend oferece um contrato para telas e outros sistemas. Conhecer verbo, rota, corpo e status vem antes de instalar uma integração pronta." },
    patterns: [
      { name: "Endpoint HTTP em ASP.NET Core", file: "Program.cs", purpose: "Aprender GET/POST/PUT/DELETE, JSON e respostas 201/400/404 em uma API pequena antes de discutir arquiteturas.", status: "planned" },
      { name: "DTO de entrada e validação", file: "CriarServico.cs", purpose: "Separar o que a pessoa pode enviar do modelo interno e validar o contrato na entrada.", status: "planned" },
      { name: "async/await e CancellationToken", file: "ServicosEndpoints.cs", purpose: "Entender espera de I/O, propagação de erro e cancelamento antes de conectar banco ou API externa no endpoint.", status: "planned" },
    ],
    delivery: { title: "API de clientes e serviços", task: "Faça requisições manualmente, implemente e documente o contrato e só então conecte a persistência. Cada verbo e cada resposta terão uma tarefa guiada e outra aplicação por conta própria.", artifact: "API .NET com rotas, contrato OpenAPI e exemplos de requisição" },
    acceptance: ["É possível criar e consultar um serviço usando o contrato documentado.", "Dado inválido e identificador inexistente recebem respostas adequadas e reproduzíveis.", "Consegue explicar o await e testar uma variante da entrada sem copiar outra API inteira."],
    environment: { phone: "Pode estudar contratos e revisar exemplos; o projeto completo não roda no subconjunto do laboratório atual.", computer: "ASP.NET Core no SDK .NET 10 LTS, cliente HTTP e o banco local do projeto. Integrações externas são exercícios posteriores, não ponto de partida.", requiresSdk: true },
    prerequisites: ["data"], availableModules: [],
    artifact: { file: "ServicosEndpoints.cs", language: "csharp", code: 'app.MapGet("/servicos", async (ServicoDb db, CancellationToken ct) =>\n    Results.Ok(await db.Servicos.AsNoTracking().ToListAsync(ct)));', note: "Trecho de endpoint futuro; app, ServicoDb, EF Core e usings serão preparados no projeto. Não é um programa completo para colar no laboratório atual." },
  },
  quality: {
    id: "quality", status: "planned", competence: "Reproduzir bugs, testar regras e proteger dados e operações de cada usuário.",
    ticket: { title: "Um usuário está vendo o serviço de outro.", request: "Reproduza a falha, proteja a consulta e comprove que uma pessoa só consegue operar os serviços permitidos. Preserve o comportamento para quem tem autorização.", why: "Um endpoint que responde não basta: validação, autenticação e autorização resolvem problemas diferentes. A correção precisa continuar funcionando depois de outra mudança." },
    patterns: [
      { name: "Teste xUnit: cenário, ação e resultado", file: "ServicosTests.cs", purpose: "Criar primeiro um teste que reproduz o problema e cobrir o limite e o caso negado.", status: "planned" },
      { name: "Autorização por recurso", file: "ServicosEndpoints.cs", purpose: "Distinguir identidade de permissão e negar leitura/alteração de um recurso de outro usuário.", status: "planned" },
      { name: "Log estruturado sem segredos", file: "ServicosEndpoints.cs", purpose: "Investigar uma falha sem registrar senha, token ou dados pessoais desnecessários.", status: "planned" },
    ],
    delivery: { title: "Correção revisável", task: "Abra uma branch, registre o bug e seu teste, implemente a correção e apresente o diff em um PR. Testes e depuração começam antes; aqui você os reúne com segurança.", artifact: "PR com reprodução, testes, correção e decisão de autorização" },
    acceptance: ["Um teste falha com o bug e passa depois da correção.", "Sem autenticação e sem permissão são cenários distintos e ambos são testados.", "O PR explica o risco e os logs não expõem credenciais nem informação desnecessária."],
    environment: { phone: "Pode ler o ticket, revisar o diff e discutir os cenários; a execução completa será ensinada no projeto .NET.", computer: "SDK .NET, projeto de testes e repositório próprio com Git. Não requer serviço de IA ou monitoramento pago.", requiresSdk: true },
    prerequisites: ["api"], availableModules: [],
    artifact: { file: "ServicosTests.cs", language: "csharp", code: '[Fact]\npublic async Task Retorna404QuandoNaoExiste() =>\n    Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/servicos/999")).StatusCode);', note: "Trecho ilustrativo de teste futuro; a aula preparará o cliente de teste, os dados e o ambiente isolado antes de pedir esta verificação." },
  },
  delivery: {
    id: "delivery", status: "planned", competence: "Entregar uma mudança reproduzível e conferir o que acontece fora da própria máquina.",
    ticket: { title: "Na sua máquina funciona. E no time?", request: "Outra pessoa precisa baixar o projeto, configurar o ambiente e executar a API e os testes sem depender de instruções enviadas por mensagem.", why: "Uma entrega de equipe precisa de configuração clara, tratamento de segredos, verificação automatizada e um caminho de investigação quando falha." },
    patterns: [
      { name: "README e configuração por ambiente", file: "README.md", purpose: "Documentar como iniciar, testar e configurar sem versionar credenciais.", status: "planned" },
      { name: "Pipeline de build e teste", file: ".github/workflows/ci.yml", purpose: "Conferir a mudança em ambiente limpo e impedir que uma falha evidente seja ignorada no PR.", status: "planned" },
      { name: "Dockerfile e verificação da aplicação", file: "Dockerfile", purpose: "Aprender empacotamento quando houver uma aplicação funcionando; usar publicação como prática posterior, sem exigir nuvem paga.", status: "planned" },
    ],
    delivery: { title: "Entrega reproduzível do OrbiServiços", task: "Escreva o guia, automatize os testes e reproduza a execução em ambiente limpo. Container e publicação entram com os limites do equipamento e da oferta gratuita explicados.", artifact: "Repositório com instruções, CI e demonstração reproduzível" },
    acceptance: ["Outra pessoa consegue iniciar e testar seguindo o README.", "Uma mudança que quebra um teste deixa a verificação do PR vermelha.", "Segredos ficam fora do repositório e o aluno sabe localizar uma falha de configuração."],
    environment: { phone: "Pode acompanhar o resultado do pipeline e ler os logs; preparar a entrega ainda requer o projeto real.", computer: "SDK e Git. Docker depende dos recursos do equipamento; publicação na nuvem é opcional; custos e limites serão conferidos antes de usar um serviço.", requiresSdk: true },
    prerequisites: ["quality"], availableModules: [],
    artifact: { file: ".github/workflows/ci.yml", language: "yaml", code: '- run: dotnet restore\n- run: dotnet build --no-restore\n- run: dotnet test --no-build', note: "Somente os passos ilustrativos do pipeline futuro. Checkout, SDK, runner e configuração serão ensinados; isto não é o workflow completo." },
  },
  career: {
    id: "career", status: "planned", competence: "Apresentar uma solução que você entende, receber uma tarefa nova e explicar suas decisões.",
    ticket: { title: "A cliente pediu uma regra que ainda não existe.", request: "Em um pequeno projeto próprio, permita cancelar um serviço sem apagar seu histórico. Explique o impacto no cadastro, na consulta e nas permissões.", why: "Uma tarefa de seleção ou de uma equipe avalia leitura de requisito, investigação, mudança, teste e comunicação; não só repetir a aplicação do curso." },
    patterns: [
      { name: "Ticket com critérios de aceitação", file: "docs/tarefa.md", purpose: "Transformar um pedido ambíguo em exemplos verificáveis antes de editar código.", status: "planned" },
      { name: "PR com explicação e evidências", file: "docs/entrega.md", purpose: "Mostrar o que mudou, como foi testado, limites e resposta à revisão.", status: "planned" },
      { name: "README de portfólio e demonstração", file: "README.md", purpose: "Permitir que outra pessoa entenda, execute e questione a solução sem depender de um vídeo promocional.", status: "planned" },
    ],
    delivery: { title: "Projeto autoral e tarefa nova", task: "Resolva uma variação que não foi montada no guia, demonstre o projeto e responda a uma revisão. Compare vagas de entrada com competências comprovadas e identifique o que ainda falta praticar.", artifact: "Projeto próprio, histórico de decisões e demonstração comentada" },
    acceptance: ["Implementa e testa uma regra nova, inclusive cenários inválidos, explicando a alteração.", "Outra pessoa entende pelo README como executar e conferir os resultados.", "Consegue discutir uma decisão e modificar o código durante uma revisão, com ajuda identificada quando utilizada."],
    environment: { phone: "Pode preparar apresentação, revisar conceitos e ler anúncios; a implementação e a demonstração usam o projeto no ambiente real.", computer: "SDK, editor e Git. A trilha prepara evidências de competências; não garante vaga e não exige dominar toda ferramenta citada em anúncios.", requiresSdk: true },
    prerequisites: ["quality"], availableModules: [],
    artifact: { file: "README.md", language: "markdown", code: '## Executar\ndotnet run --project src/OrbiServicos.Api\n## Testar\ndotnet test', note: "Organização ilustrativa do projeto futuro, não um caminho existente neste repositório. O README final incluirá pré-requisitos, configuração, decisões e limites reais." },
  },
} as const satisfies Record<CSharpCareerStageId, CSharpCareerStagePlan>;

/** These are habits throughout the course, not extra tools to master up front. */
export const csharpWorkHabits = [
  { id: "git", title: "Guardar e revisar mudanças", detail: "Git começa no primeiro projeto com SDK: status, diff e commit pequeno; depois branch, PR e revisão. No celular, comece pelo código e entenda por que o histórico será importante." },
  { id: "debug", title: "Prever, executar e investigar", detail: "Antes de rodar, diga o resultado esperado. Compare com o que aconteceu, use uma mensagem de erro ou teste para localizar o problema e confira outro caso depois da correção." },
  { id: "english", title: "Inglês no contexto do código", detail: "Leia mensagens e documentação ligadas à tarefa e pratique nas experiências de inglês da Orbitamos, com tradução, áudio e apoio de pronúncia em português. Não precisa esperar ter fluência para começar a programar." },
  { id: "ai", title: "Usar IA com critério", detail: "Uma IA pode explicar ou revisar sua tentativa. Você precisa entender o pedido, testar as sugestões e explicar a alteração. Nenhuma API paga ou integração de IA é necessária para estudar esta trilha." },
] as const;

export const csharpCareerHabits = csharpWorkHabits;

export const csharpAiRoutineSteps = [
  { id: "understand", title: "Entenda o pedido", detail: "Reescreva com suas palavras o que precisa mudar e o que deve continuar funcionando." },
  { id: "predict", title: "Pense em exemplos", detail: "Anote uma entrada comum, uma de limite e o resultado esperado antes de aceitar uma solução." },
  { id: "attempt", title: "Faça uma tentativa", detail: "Escreva a parte que consegue, execute e guarde a mensagem de erro ou a diferença no resultado." },
  { id: "ask", title: "Peça uma pista ou revisão", detail: "Mostre o objetivo e um exemplo mínimo sem dados reais; peça que explique o motivo em vez de gerar a aplicação inteira." },
  { id: "verify", title: "Teste uma variante", detail: "Leia a sugestão, confira o diff e rode os casos. Mude uma entrada para verificar se a regra continua funcionando." },
  { id: "explain", title: "Explique a mudança", detail: "Diga o que alterou, por que resolve o pedido, como conferiu e onde ainda precisa de ajuda." },
] as const;

export const csharpAiRoutine: readonly string[] = csharpAiRoutineSteps.map(step => `${step.title}. ${step.detail}`);

export const csharpAiSafetyRule = "Não envie senha, token, chave, dados de clientes ou código privado de terceiros a uma IA. Use exemplos fictícios e mínimos. É possível estudar e concluir as tarefas sem IA.";

export const csharpLaterTopics = [
  { title: "Integrações e processamento em segundo plano", why: "Depois de HTTP, async/await, erros, testes e segurança: praticar timeout, repetição segura e idempotência quando o problema realmente pedir." },
  { title: "IA e RAG", why: "Aprofundamento opcional após APIs, dados e segurança. Precisa ensinar fontes, permissões, avaliação das respostas e custo; não é requisito geral para começar como backend júnior." },
  { title: "Arquiteturas e infraestrutura maiores", why: "Mensageria, microsserviços, Kubernetes, DDD, CQRS ou MediatR entram conforme a empresa e o problema. Não são um pacote obrigatório antes do primeiro projeto." },
] as const;
