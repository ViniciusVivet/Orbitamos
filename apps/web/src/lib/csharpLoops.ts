import type { Desafio } from "./desafios";
import { readVariablesProgress, type VariableActivity } from "./csharpVariables";

export const loopsPilot: Desafio = {
  slug: "trilha-csharp-lacos-v1", titulo: "Numere os serviços", descricao: "Repita uma instrução sem copiar três vezes.", linguagem: "csharp", dificuldade: "iniciante", categoria: "Laços", minutos: 10, codigoInicial: "", exemplo: "1\n2\n3",
  testCode: "Console.WriteLine(quantidade == 3);",
  steps: [{ instrucao: "Declare quantidade igual a 3. Use for para mostrar os números de 1 até quantidade, um por linha.", codigoExemplo: "int quantidade = 3;\nfor (int numero = 1; numero <= quantidade; numero++) {\n    Console.WriteLine(numero);\n}", dica: "O for tem três partes: começa em 1; continua enquanto numero <= quantidade; soma 1 com numero++ ao terminar cada volta.", acerto: "Você escreveu uma instrução que executou três vezes. Agora pratique mudando o limite e a forma de repetir.", erro: "Confira o início em 1, o limite <= quantidade e numero++.", validacao: (_, output, proof) => output.trim() === "1\n2\n3" && proof?.trim() === "true" }],
};

export const loopsActivities: VariableActivity[] = [
  { id: "guided", kind: "guided", title: "Seu primeiro laço, uma linha por vez", topic: "for: início, condição e atualização", goal: "Mostrar os serviços de 1 a 3 com uma única instrução de saída." },
  { id: "quiz-limit", kind: "quiz", title: "Quantas voltas ele dá?", topic: "Limite exclusivo", goal: "Prever a execução antes de rodar.", code: "for (int numero = 1; numero < 3; numero++) {\n    Console.WriteLine(numero);\n}", prompt: "Quais números aparecem, nessa ordem?", options: ["1, 2 e 3", "1 e 2", "0, 1 e 2"], answer: 1, feedback: ["< 3 exclui o 3. Para incluí-lo, use <= 3.", "Certo. Começa em 1, passa pelo 2 e para quando numero chega a 3.", "O início é 1, não 0. O laço mostra 1 e 2."] },
  {
    id: "count", kind: "code", title: "Numere uma fila de serviços", topic: "Contador e limite variável", goal: "Usar a quantidade como limite, sem repetir saídas manualmente.",
    lesson: "for (int numero = 1; numero <= quantidade; numero++) separa início, condição e atualização por ;. A condição é verificada antes de cada volta. Se quantidade for zero, o corpo não executa nem uma vez.",
    brief: "Declare int quantidade = 4. Use for para mostrar numero de 1 até quantidade, inclusive, um por linha. A mesma regra precisa funcionar com zero, um e cinco serviços.", hint: "Reaproveite as três partes do primeiro for. O limite é a variável quantidade, não o número fixo 4.", starter: "", expected: "1\n2\n3\n4", verification: "Console.WriteLine(quantidade == 4);",
    required: [/\bint\s+quantidade\s*=/, /\bfor\s*\(/, /Console\.WriteLine\s*\(\s*numero\s*\)/],
    solution: "int quantidade = 4;\nfor (int numero = 1; numero <= quantidade; numero++) {\n    Console.WriteLine(numero);\n}",
    cases: [{ label: "Fila vazia", values: { quantidade: "0" }, expected: "" }, { label: "Um serviço", values: { quantidade: "1" }, expected: "1" }, { label: "Cinco serviços", values: { quantidade: "5" }, expected: "1\n2\n3\n4\n5" }],
  },
  {
    id: "countdown", kind: "code", title: "Esvazie a fila com while", topic: "while e condição de parada", goal: "Atualizar o estado para que a repetição termine.",
    lesson: "while (pendentes > 0) repete enquanto a condição for verdadeira. Dentro das chaves, pendentes-- diminui o valor em 1. Sem essa mudança, a condição pode continuar verdadeira para sempre. O botão Parar execução interrompe a tentativa sem apagar seu código.",
    brief: 'Declare int pendentes = 3. Enquanto pendentes > 0, mostre pendentes e depois diminua em 1. Fora do laço, mostre "Fila concluída". Quando começar em zero, mostre apenas a mensagem final.', hint: "Use while (pendentes > 0) { ... }. Escreva Console.WriteLine(pendentes); antes de pendentes--; e deixe a mensagem final depois da chave }.", starter: "", expected: "3\n2\n1\nFila concluída", verification: "Console.WriteLine(pendentes == 0);",
    required: [/\bint\s+pendentes\s*=/, /\bwhile\s*\(/, /Console\.WriteLine\s*\(\s*pendentes\s*\)/],
    solution: 'int pendentes = 3;\nwhile (pendentes > 0) {\n    Console.WriteLine(pendentes);\n    pendentes--;\n}\nConsole.WriteLine("Fila concluída");',
    cases: [{ label: "Fila já vazia", values: { pendentes: "0" }, expected: "Fila concluída" }, { label: "Último serviço", values: { pendentes: "1" }, expected: "1\nFila concluída" }, { label: "Dois serviços", values: { pendentes: "2" }, expected: "2\n1\nFila concluída" }],
  },
  { id: "quiz-stop", kind: "quiz", title: "Por que esse programa não para?", topic: "Laço infinito", goal: "Identificar a atualização que falta.", code: "int pendentes = 2;\nwhile (pendentes > 0) {\n    Console.WriteLine(pendentes);\n}", prompt: "Qual mudança faz a fila chegar a zero?", options: ["Adicionar pendentes--; dentro do while", "Adicionar pendentes++; dentro do while", "Adicionar pendentes--; depois do while"], answer: 0, feedback: ["Isso. Diminuir dentro do laço faz 2 → 1 → 0. A próxima condição é falsa e ele termina.", "Aumentar mantém pendentes > 0. Aqui precisamos diminuir o valor.", "O programa não chega depois do while enquanto a condição continuar verdadeira. Atualize dentro dele."] },
  {
    id: "accumulate", kind: "code", title: "Some o valor das entregas", topic: "Acumulador", goal: "Manter um total entre as voltas do laço.",
    lesson: "Um contador registra voltas; um acumulador reúne valores. Declare total = 0 antes do laço. Dentro, total += valorServico soma ao valor anterior. Com três serviços de 20: 0 → 20 → 40 → 60. Mostre total depois do laço para ter uma única saída.",
    brief: "Declare int quantidade = 3, int valorServico = 20 e int total = 0. Use for de 1 até quantidade e some valorServico a total em cada volta. Mostre total somente no final.", hint: "Declare total fora do for para não zerá-lo em cada volta. Dentro use total += valorServico; (ou total = total + valorServico;).", starter: "", expected: "60", verification: "Console.WriteLine(quantidade == 3);\nConsole.WriteLine(valorServico == 20);\nConsole.WriteLine(total == 60);",
    required: [/\bint\s+quantidade\s*=/, /\bint\s+valorServico\s*=/, /\bint\s+total\s*=/, /\bfor\s*\(/, /\btotal\s*(?:\+=|=\s*total\s*\+)\s*valorServico/, /Console\.WriteLine\s*\(\s*total\s*\)/],
    solution: "int quantidade = 3;\nint valorServico = 20;\nint total = 0;\nfor (int numero = 1; numero <= quantidade; numero++) {\n    total += valorServico;\n}\nConsole.WriteLine(total);",
    cases: [{ label: "Nenhuma entrega", values: { quantidade: "0" }, expected: "0" }, { label: "Uma entrega de 7", values: { quantidade: "1", valorServico: "7" }, expected: "7" }, { label: "Quatro entregas de 15", values: { quantidade: "4", valorServico: "15" }, expected: "60" }],
  },
  {
    id: "select", kind: "code", title: "Separe o que ainda precisa ser feito", topic: "if dentro do for", goal: "Repetir uma decisão para cada serviço.",
    lesson: "O for visita cada número. O if dentro dele decide se aquele serviço deve aparecer. Os serviços de 1 até concluidos já foram entregues; os números maiores que concluidos ainda estão pendentes.",
    brief: "Declare int quantidade = 5 e int concluidos = 2. Use for para percorrer numero de 1 até quantidade. Dentro, use if (numero > concluidos) para mostrar somente os pendentes. Se todos estiverem concluídos, não mostre nada.", hint: "Você precisa de dois pares de chaves: o do for e o do if. Console.WriteLine(numero) fica dentro dos dois.", starter: "", expected: "3\n4\n5", verification: "Console.WriteLine(quantidade == 5);\nConsole.WriteLine(concluidos == 2);",
    required: [/\bint\s+quantidade\s*=/, /\bint\s+concluidos\s*=/, /\bfor\s*\(/, /\bif\s*\(/, /Console\.WriteLine\s*\(\s*numero\s*\)/],
    solution: "int quantidade = 5;\nint concluidos = 2;\nfor (int numero = 1; numero <= quantidade; numero++) {\n    if (numero > concluidos) {\n        Console.WriteLine(numero);\n    }\n}",
    cases: [{ label: "Tudo entregue", values: { concluidos: "5" }, expected: "" }, { label: "Nada entregue, dois serviços", values: { quantidade: "2", concluidos: "0" }, expected: "1\n2" }, { label: "Fila vazia", values: { quantidade: "0", concluidos: "0" }, expected: "" }],
  },
  {
    id: "debug-last", kind: "code", title: "Encontre o serviço que ficou de fora", topic: "Depuração de limite", goal: "Detectar um erro de uma volta a menos.",
    lesson: "Um laço pode terminar sem erro e ainda produzir o resultado errado. Teste especialmente zero, um e o último item. Compare < (exclui) com <= (inclui), sem mudar os dados para esconder o bug.",
    brief: "A fila tem 3 serviços, mas o programa só mostra 1 e 2. Execute o código, observe o console e corrija o limite para incluir o último serviço.", hint: "O início em 1 está certo. A comparação atual para antes do número igual a quantidade.",
    starter: "int quantidade = 3;\nfor (int numero = 1; numero < quantidade; numero++) {\n    Console.WriteLine(numero);\n}", expected: "1\n2\n3", verification: "Console.WriteLine(quantidade == 3);",
    required: [/\bint\s+quantidade\s*=/, /\bfor\s*\(/, /Console\.WriteLine\s*\(\s*numero\s*\)/],
    solution: "int quantidade = 3;\nfor (int numero = 1; numero <= quantidade; numero++) {\n    Console.WriteLine(numero);\n}",
    cases: [{ label: "Um único serviço", values: { quantidade: "1" }, expected: "1" }, { label: "Fila vazia", values: { quantidade: "0" }, expected: "" }, { label: "Quatro serviços", values: { quantidade: "4" }, expected: "1\n2\n3\n4" }],
  },
  { id: "quiz-total", kind: "quiz", title: "Onde começa o acumulador?", topic: "Estado entre as voltas", goal: "Distinguir acumular de reiniciar o total.", prompt: "Você quer somar o valor de vários serviços. Onde inicializar int total = 0 para preservar a soma?", options: ["Dentro do for, antes de cada soma", "Antes do for; somar dentro e mostrar depois", "Depois do for, antes de mostrar"], answer: 1, feedback: ["Dentro, você começa do zero em toda volta e perde a soma anterior.", "Certo. Começa uma vez em zero, cresce durante o laço e é mostrado ao final.", "Depois do for é tarde: o acumulador precisa existir enquanto você soma."] },
  {
    id: "delivery", kind: "code", title: "Entregue o resumo da fila", topic: "Variáveis + condições + laços", goal: "Construir uma regra que funciona para filas vazias, parciais e concluídas.",
    lesson: "Agora junte as peças sem um modelo pronto. O contador visita os serviços; a condição seleciona os pendentes; o acumulador guarda o valor restante. Os testes mudam a quantidade, os concluídos, o valor e o pagamento. Nesta prática, as entradas são válidas: 0 ≤ concluidos ≤ quantidade.",
    brief: 'Declare string cliente = "Nina", int quantidade = 4, int concluidos = 1, int valorServico = 25, bool pago = true e int total = 0. Mostre cliente. Use for de 1 até quantidade; dentro, se numero > concluidos E pago, some valorServico a total. Depois do laço, mostre total. Se pago for falso, o total deve ser zero.',
    hint: "Comece pelas seis variáveis. Mostre cliente. Dentro do for, use if (numero > concluidos && pago) e atualize total. Console.WriteLine(total) fica depois de fechar os dois blocos.", starter: "", expected: "Nina\n75",
    verification: 'Console.WriteLine(cliente == "Nina");\nConsole.WriteLine(quantidade == 4);\nConsole.WriteLine(concluidos == 1);\nConsole.WriteLine(valorServico == 25);\nConsole.WriteLine(pago == true);\nConsole.WriteLine(total == 75);',
    required: [/\bstring\s+cliente\s*=/, /\bint\s+quantidade\s*=/, /\bint\s+concluidos\s*=/, /\bint\s+valorServico\s*=/, /\bbool\s+pago\s*=/, /\bint\s+total\s*=/, /\bfor\s*\(/, /\bif\s*\(/, /\btotal\s*(?:\+=|=\s*total\s*\+)\s*valorServico/, /Console\.WriteLine\s*\(\s*cliente\s*\)/, /Console\.WriteLine\s*\(\s*total\s*\)/],
    solution: 'string cliente = "Nina";\nint quantidade = 4;\nint concluidos = 1;\nint valorServico = 25;\nbool pago = true;\nint total = 0;\nConsole.WriteLine(cliente);\nfor (int numero = 1; numero <= quantidade; numero++) {\n    if (numero > concluidos && pago) {\n        total += valorServico;\n    }\n}\nConsole.WriteLine(total);',
    cases: [{ label: "Fila vazia", values: { quantidade: "0", concluidos: "0" }, expected: "Nina\n0" }, { label: "Todos concluídos", values: { concluidos: "4" }, expected: "Nina\n0" }, { label: "Pagamento pendente", values: { pago: "false" }, expected: "Nina\n0" }, { label: "Dois pendentes de 10", values: { quantidade: "3", concluidos: "1", valorServico: "10" }, expected: "Nina\n20" }, { label: "Um serviço ainda não iniciado", values: { quantidade: "1", concluidos: "0", valorServico: "7" }, expected: "Nina\n7" }],
  },
];
export const loopsKey = (id: string | number) => `orbitamos-csharp-loops-v1-${id}`;
export const readLoopsProgress = (raw: string | null) => readVariablesProgress(raw, null, loopsActivities, false);
