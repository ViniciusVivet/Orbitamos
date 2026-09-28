import type { Desafio } from "./desafios";

export const practicePaths = [
  { id: "first", label: "Primeiros passos", description: "Dar nomes aos dados, mostrar valores e fazer contas." },
  { id: "logic", label: "Lógica e decisões", description: "Comparar, repetir e raciocinar sobre um problema." },
  { id: "building", label: "Funções e dados", description: "Reutilizar tarefas, organizar coleções e tratar erros." },
] as const;
export type PracticePath = typeof practicePaths[number]["id"];
export function practicePath(challenge: Desafio): PracticePath {
  if (["Fundamentos", "Operadores"].includes(challenge.categoria ?? "")) return "first";
  if (["Condicionais", "Laços", "Algoritmos"].includes(challenge.categoria ?? "")) return "logic";
  return "building";
}

type Story = { scene: string; goal: string; input: string; action: string; outcome: string };
const story = (scene: string, goal: string, input: string, action: string, outcome: string): Story => ({ scene, goal, input, action, outcome });
// Realistic practice scenarios, not claims that these small programs are full products.
export const practiceStories: Record<string, Story> = {
  "variaveis-js": story("Uma comunidade precisa apresentar quem acabou de chegar. Você vai montar os primeiros dados de um perfil.", "Apresentar um perfil no console", "Nome, idade e estado ativo", "Guardar e mostrar", "Um perfil com três informações"),
  "funcoes-js": story("Você repete algumas tarefas no programa: cumprimentar alguém, somar valores e dobrar uma quantidade. Vamos dar um nome a cada tarefa.", "Criar tarefas que podem ser chamadas", "Uma mensagem e números", "Criar e chamar funções", "Saudação, soma e dobro"),
  "arrays-js": story("Uma pequena feira tem três frutas no catálogo. Você vai reunir os nomes, percorrer a lista e preparar uma versão em maiúsculas.", "Organizar uma lista de produtos", "Três frutas", "Listar e transformar", "Frutas no console"),
  "operadores-js": story("Uma loja quer saber quanto cobrar por um produto de R$ 200 com 15% de desconto. Você vai ensinar essa conta ao programa para reutilizá-la com outros preços.", "Calcular o preço com desconto", "R$ 200 · desconto de 15%", "Subtrair a porcentagem", "R$ 170"),
  "condicionais-js": story("Uma escola precisa transformar notas em resultados. A regra deste exercício é: 7 ou mais aprova; de 5 até menos de 7 fica em recuperação; abaixo de 5 reprova.", "Transformar uma nota em situação escolar", "Notas 8, 6 e 3", "Aplicar as faixas", "Aprovado · Recuperação · Reprovado"),
  "lacos-js": story("Neste jogo de lógica, alguns números viram palavras. Seu trabalho é descobrir a ordem certa das regras antes de repetir a decisão de 1 a 15.", "Aplicar regras a uma sequência", "Números de 1 a 15", "Comparar os múltiplos", "Números, Fizz, Buzz e FizzBuzz"),
  "objetos-js": story("Uma ficha tem nome e idade. Você vai ler essas propriedades e produzir uma frase de apresentação.", "Gerar um resumo de perfil", "Nome e idade", "Ler propriedades", "Uma frase de apresentação"),
  "strings-js": story("Um jogo de palavras precisa reconhecer textos que ficam iguais quando lidos ao contrário. Você vai criar essa verificação.", "Reconhecer um palíndromo", "arara e casa", "Comparar o texto invertido", "Verdadeiro ou falso"),
  "metodos-array-js": story("Uma loja tem pedidos pagos e pendentes. Para calcular o total recebido, você precisa selecionar somente os pagos e somar seus valores.", "Somar somente os pedidos pagos", "Lista de pedidos", "Filtrar e acumular", "Total recebido"),
  "assincrono-js": story("Uma tela espera um nome chegar. Vamos simular essa espera com uma promessa, sem acessar um servidor real.", "Esperar um resultado antes de mostrar", "Uma promessa simulada", "Aguardar o retorno", "Nome no console"),
  "variaveis-python": story("Você está montando a ficha de um aluno. Antes de criar uma tela ou um banco, precisa guardar e mostrar os dados no programa.", "Montar uma ficha de aluno", "Nome, idade e se está estudando", "Guardar em variáveis", "Ficha no console"),
  "condicionais-python": story("Vamos simular uma regra simples de idade: a partir de 18, a função responde sim; abaixo disso, não. Isso é um exercício de comparação, não uma verificação real de habilitação.", "Comparar uma idade com um limite", "Idades 20 e 16", "Verificar idade >= 18", "sim e não"),
  "lacos-python": story("Você recebeu a tarefa de somar os números de 1 até 100. Em vez de escrever cem somas, vai repetir uma instrução e guardar o total.", "Somar de 1 até 100 sem copiar linhas", "Números de 1 a 100", "Repetir e acumular", "5050"),
  "listas-python": story("Uma escola usa 7 como nota mínima. Você vai selecionar notas iguais ou maiores que 7, sem alterar a lista original. Aqui não calculamos a média da turma: o limite já foi definido.", "Selecionar notas que atingiram a meta", "Notas 5, 8, 6, 9 e 7", "Filtrar pelo limite 7", "[8, 9, 7]"),
  "dicionarios-python": story("Uma loja recebeu mais unidades de um produto. Você vai encontrar esse produto pelo nome e atualizar seu estoque.", "Atualizar uma quantidade no estoque", "Produtos e quantidades", "Buscar pela chave", "Estoque atualizado"),
  "funcoes-python": story("Um painel usa Fahrenheit, mas você recebe a temperatura em Celsius. Vamos escrever uma conversão que possa ser reutilizada.", "Converter Celsius para Fahrenheit", "25 °C", "Aplicar a fórmula", "77 °F"),
  "strings-python": story("Uma ferramenta de texto precisa contar vogais, incluindo maiúsculas. Você vai percorrer uma palavra e acumular as ocorrências.", "Contar vogais em um texto", "Orbitamos", "Examinar cada letra", "Quantidade de vogais"),
  "comprehensions-python": story("Você quer uma lista apenas com os quadrados dos números pares. Vamos selecionar e transformar os valores em uma expressão.", "Selecionar e transformar números", "Números de 1 a 10", "Filtrar pares e elevar ao quadrado", "Lista de quadrados pares"),
  "erros-python": story("Uma calculadora recebe uma divisão por zero. Em vez de encerrar com um erro sem explicação, ela precisa devolver uma resposta compreensível.", "Tratar uma divisão inválida", "Divisões com 2 e com 0", "Calcular ou tratar o erro", "Resultado ou mensagem"),
  "classes-python": story("Você vai simular uma conta com saldo e uma ação de depósito. É um modelo de estudo, sem dinheiro ou conexão com banco real.", "Reunir dados e ações em uma classe", "Saldo de 100 e depósito de 50", "Atualizar o saldo", "150"),
  "desestruturacao-js": story("Uma ficha tem vários campos, mas a tela só precisa de alguns. Você vai extrair os dados pelo nome.", "Separar campos de um perfil", "Um objeto pessoa", "Desestruturar os campos", "Dados selecionados"),
  "sets-js": story("Uma lista contém números repetidos. Você precisa gerar uma coleção sem duplicatas.", "Remover valores repetidos", "1, 2, 2, 3, 3, 4", "Criar um Set", "Valores únicos"),
  "validacao-js": story("Um formulário precisa de uma checagem inicial do texto do e-mail. Esta regra simplificada não confirma que a caixa existe.", "Fazer uma validação inicial", "Textos com e sem formato de e-mail", "Comparar o formato", "Verdadeiro ou falso"),
  "recursao-js": story("Você vai resolver o fatorial dividindo a tarefa em uma versão menor dela mesma. O caso base é o que impede chamadas sem fim.", "Entender uma chamada recursiva", "Número 5", "Multiplicar até o caso base", "120"),
  "tuplas-python": story("Um mapa representa uma posição por dois valores. Você vai ler cada coordenada sem alterar a tupla original.", "Ler um par de coordenadas", "Posição (10, 25)", "Desempacotar", "Coordenadas separadas"),
  "sets-python": story("Duas turmas têm alunos em comum. Você precisa descobrir quem participa das duas, sem listar duplicatas.", "Encontrar participantes em comum", "Duas turmas", "Calcular a interseção", "Alunos das duas turmas"),
  "ordenacao-python": story("Um jogo precisa mostrar a classificação por pontos sem perder os dados originais. Você vai produzir uma nova lista ordenada.", "Montar um ranking", "Pontuações do jogo", "Ordenar do maior para o menor", "Ranking de pontuações"),
  "recursao-python": story("Uma função vai calcular o fatorial chamando uma versão menor da mesma tarefa. Você precisa definir quando parar.", "Praticar recursão e caso base", "Número 6", "Multiplicar até o caso base", "720"),
  "variaveis-csharp": story("Uma ficha começa com nome e idade. Em C#, você também informa que tipo de valor cada variável guarda.", "Mostrar um perfil com tipos explícitos", "Ana · 20 anos", "Declarar e mostrar", "Perfil no console"),
  "operadores-csharp": story("Uma duração chegou em minutos, mas você quer apresentá-la como horas e minutos restantes.", "Converter uma duração", "135 minutos", "Dividir e calcular o resto", "2 horas e 15 minutos"),
  "condicionais-csharp": story("Um cadastro precisa separar duas faixas de idade. Você vai expressar a regra deste exercício com if e else.", "Escolher uma mensagem pela idade", "Idade 17", "Comparar com o limite", "Mensagem da faixa etária"),
  "lacos-csharp": story("Você precisa acumular os números de 1 a 5. Um contador visita cada número e uma variável mantém a soma entre as voltas.", "Acumular valores com for", "1, 2, 3, 4 e 5", "Percorrer e somar", "15"),
};

export function practiceStory(challenge: Desafio): Story {
  return practiceStories[challenge.slug] ?? story(challenge.descricao, challenge.titulo, "Dados do enunciado", challenge.categoria ?? "Aplicar o conceito", "Resultado da missão");
}

export function contextualLine(challenge: Desafio, code: string): { title: string; why: string } | null {
  const line = code.trim();
  if (["variaveis-js", "variaveis-python", "variaveis-csharp"].includes(challenge.slug)) {
    const assignment = line.match(/^(?:(let|const|string|int|bool)\s+)?(\w+)\s*=\s*(.+?);?$/);
    if (assignment) {
      const [, type, name, value] = assignment;
      const meaning: Record<string, string> = { nome: "quem é a pessoa", idade: "quantos anos ela tem", ativo: "se o perfil está ativo", estudando: "se a pessoa está estudando" };
      return { title: `Guarde ${name} na ficha`, why: `${name} representa ${meaning[name] ?? "um dado do perfil"}. O sinal = atribui ${value} a esse nome. ${/^(string|int|bool)$/.test(type ?? "") ? `${type} indica o tipo: ${type === "string" ? "texto" : type === "int" ? "número inteiro" : "verdadeiro ou falso"}.` : /^['"]/.test(value) ? "As aspas delimitam um texto." : /^(true|false|True|False)$/.test(value) ? "Esse valor é booleano: representa sim/não, não uma palavra entre aspas." : "Aqui o número não usa aspas, porque queremos tratá-lo como valor numérico."} Guardar não mostra nada ainda; isso acontece nas instruções de saída.` };
    }
    const output = line.match(/^(?:console\.log|print|Console\.WriteLine)\((\w+)\)/);
    if (output) return { title: `Mostre ${output[1]} para conferir`, why: `O programa lê o valor guardado em ${output[1]} e o mostra no console. ${output[1]} está sem aspas: queremos o conteúdo da variável, não imprimir o nome dela como texto. Isso permite conferir a ficha que você está construindo.` };
  }
  if (challenge.slug === "listas-python") {
    if (line.startsWith("notas =")) return { title: "Reúna as notas da turma", why: "Os colchetes criam uma lista. Cada número é uma nota; as vírgulas separam os itens. Vamos consultar essa lista sem alterar os valores originais." };
    if (line.startsWith("aprovadas =")) return { title: "Selecione quem atingiu a meta 7", why: "Leia de dentro para fora: for nota in notas visita cada nota; if nota >= 7 mantém somente quem atingiu o limite, incluindo 7. A primeira palavra nota diz o que entra na nova lista aprovadas. Essa forma compacta se chama list comprehension." };
  }
  if (challenge.slug === "operadores-js") {
    if (line.startsWith("function precoFinal")) return { title: "Dê um nome à conta da loja", why: "precoFinal é a função. preco e desconto são parâmetros: recebem os valores de cada chamada, como 200 e 15. Aqui você define a tarefa; a conta só acontece quando a função é chamada." };
    if (line.startsWith("return")) return { title: "Calcule o desconto e devolva o preço", why: "desconto / 100 transforma 15 em 0,15. Multiplicando por 200, o desconto vale 30. Subtraindo do preço, sobra 170. return entrega esse resultado a quem chamou a função; não o mostra na tela sozinho." };
    if (line.startsWith("console.log")) return { title: "Faça o pedido: produto de 200, desconto de 15%", why: "precoFinal(200, 15) chama a tarefa: 200 entra em preco e 15 em desconto. console.log mostra o valor devolvido. Antes de executar, tente prever o preço final." };
  }
  if (challenge.slug === "condicionais-js") {
    if (line.startsWith("function classificar")) return { title: "Crie a tarefa que recebe uma nota", why: "classificar é o nome da função; nota é um parâmetro que recebe a nota informada em cada chamada. Por exemplo, classificar(8) faz nota valer 8 nessa chamada. Definir a função ainda não a executa." };
    if (line.includes("nota >= 7")) return { title: "Verifique primeiro a aprovação", why: "Nesta escola fictícia, 7 ou mais significa Aprovado. >= inclui exatamente 7. Quando a condição é verdadeira, return devolve a mensagem e encerra a função: as próximas regras não são avaliadas nessa chamada." };
    if (line.includes("nota >= 5")) return { title: "Cuide de quem não passou na primeira regra", why: "Esta linha só é alcançada se a nota ficou abaixo de 7. Se ela for pelo menos 5, a função devolve Recuperação. Essa ordem separa as faixas sem misturá-las." };
    if (line.startsWith("return")) return { title: "Trate a faixa que sobrou", why: "Se a execução chegou aqui, a nota não era >= 7 nem >= 5. Então ela ficou abaixo de 5 e a função devolve Reprovado." };
    const call = line.match(/classificar\((\d+)\)/);
    if (call) return { title: `Teste a regra com a nota ${call[1]}`, why: `Esta chamada entrega ${call[1]} ao parâmetro nota. console.log mostra a situação devolvida. A mesma função será usada para notas diferentes; você não está escrevendo três classificadores.` };
  }
  if (challenge.slug === "condicionais-python") {
    if (line.startsWith("def ")) return { title: "Crie uma regra que recebe uma idade", why: "def define a função pode_dirigir. idade é o parâmetro: recebe um valor a cada chamada. Os dois-pontos abrem o bloco, e a próxima linha precisa de quatro espaços de recuo." };
    if (line.startsWith("if")) return { title: "Compare a idade com o limite", why: "idade >= 18 testa se a pessoa tem pelo menos 18 anos, incluindo exatamente 18. Use quatro espaços antes do if, pois ele pertence à função. Os dois-pontos abrem outro bloco para o caso verdadeiro." };
    if (line === "return 'sim'") return { title: "Responda sim quando a condição for verdadeira", why: "Use oito espaços: esta linha está dentro do if, que está dentro da função. return entrega o texto sim e encerra a chamada. Para 20, este é o caminho escolhido; o texto não ainda não é alcançado." };
    if (line === "return 'não'") return { title: "Responda não no caminho que sobrou", why: "Volte a quatro espaços, saindo do if mas permanecendo na função. Se a idade era menor que 18, a execução chega aqui. return entrega o texto não para quem chamou a função." };
    if (line.startsWith("print")) return { title: "Experimente a regra com uma idade", why: "Sem recuo, fora da função: o número dentro de pode_dirigir(...) entra no parâmetro idade. A função compara e devolve o texto sim ou não; print mostra essa resposta no console." };
  }
  const fn = line.match(/^(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)|^def\s+(\w+)\s*\(([^)]*)\)/);
  if (fn) {
    const name = fn[1] || fn[3]; const params = fn[2] || fn[4];
    return { title: `Defina a tarefa ${name}`, why: `${name} é o nome da função. ${params ? `Dentro dos parênteses, ${params} indica ${params.includes(",") ? "os parâmetros recebidos" : "o parâmetro recebido"} em cada chamada.` : "Os parênteses vazios indicam que esta função não recebe parâmetros."} Você está definindo a tarefa de ${practiceStory(challenge).goal.toLowerCase()}, não executando-a ainda.` };
  }
  if (line === "}") return { title: "Feche o bloco que você abriu", why: `A chave } encerra um bloco de instruções. Ela não executa a tarefa sozinha. Confira o par com { para manter organizada a regra de ${practiceStory(challenge).goal.toLowerCase()}.` };
  return null;
}
