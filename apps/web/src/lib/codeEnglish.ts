export type EnglishScene = "folder" | "file" | "button" | "server" | "error" | "return" | "output";
type EnglishChoice = { value: string; label: string; feedback: string };
type EnglishBase = { id: string; chapter: string; title: string; scene: EnglishScene; story: string; prompt: string; hint: string; explanation: string; takeaway: string };
type ChoiceLesson = EnglishBase & { kind: "choice"; choices: EnglishChoice[]; answer: string };
type WriteLesson = EnglishBase & { kind: "write"; before: string; after: string; answer: string };
export type EnglishLesson = ChoiceLesson | WriteLesson;

export const englishLessons: EnglishLesson[] = [
  { id: "folder", chapter: "Encontre seu caminho", title: "Cada coisa em seu lugar", scene: "folder", kind: "choice", story: "A oficina do Orbi ganhou três arquivos. Vamos guardá-los juntos para não perder nada.", prompt: "Como essa pasta aparece em um editor em inglês?", hint: "É o recipiente que organiza arquivos. File é um arquivo sozinho.", answer: "folder", choices: [
    { value: "file", label: "file", feedback: "File é um arquivo, como uma foto ou um código. Aqui vemos uma pasta reunindo vários arquivos." },
    { value: "folder", label: "folder", feedback: "" },
    { value: "button", label: "button", feedback: "Button é um botão que você pode acionar. Este objeto organiza arquivos." },
  ], explanation: "Folder significa pasta. Quando um tutorial pedir “open the folder”, procure a pasta do projeto.", takeaway: "folder → pasta" },
  { id: "file", chapter: "Encontre seu caminho", title: "Uma peça da oficina", scene: "file", kind: "choice", story: "Dentro da pasta, o Orbi encontrou script.js. Esse arquivo guarda o código de uma página.", prompt: "O tutorial pede “open the file”. Qual palavra nomeia script.js?", hint: "A pasta reúne vários itens. Agora estamos olhando apenas para um deles.", answer: "file", choices: [
    { value: "server", label: "server", feedback: "Server é servidor: recebe pedidos e fornece respostas. script.js é um arquivo." },
    { value: "folder", label: "folder", feedback: "Folder é a pasta. script.js fica dentro dela e tem seu próprio nome e extensão." },
    { value: "file", label: "file", feedback: "" },
  ], explanation: "File significa arquivo. A extensão .js indica um arquivo JavaScript; uma pasta pode guardar vários files.", takeaway: "file → arquivo" },
  { id: "button", chapter: "Use a interface", title: "O comando de salvar", scene: "button", kind: "choice", story: "O código mudou. Orbi aponta para um controle da tela: ao acioná-lo, o projeto será salvo.", prompt: "Em “click the Save button”, o que button identifica?", hint: "Save é a ação de salvar. Button é o tipo de controle em que você clica ou toca.", answer: "button", choices: [
    { value: "button", label: "button", feedback: "" },
    { value: "file", label: "file", feedback: "O file é o arquivo que será salvo. O controle que dispara essa ação é um button." },
    { value: "folder", label: "folder", feedback: "Folder é uma pasta. O elemento acionável na tela é um button." },
  ], explanation: "Button significa botão. A frase pede para clicar no botão Save; não para procurar um arquivo com esse nome.", takeaway: "button → botão · Save → salvar" },
  { id: "server", chapter: "Siga o pedido", title: "Quem responde à página?", scene: "server", kind: "choice", story: "A página da oficina pede a lista de produtos. Um serviço recebe o pedido e envia os dados de volta.", prompt: "Qual palavra nomeia quem atende esse pedido?", hint: "Em uma aplicação web, o navegador pode pedir dados a um servidor pela rede.", answer: "server", choices: [
    { value: "button", label: "button", feedback: "Um button pode iniciar o pedido, mas quem recebe o pedido e responde é o servidor." },
    { value: "server", label: "server", feedback: "" },
    { value: "file", label: "file", feedback: "Um file guarda conteúdo. O serviço que atende pedidos é chamado de server." },
  ], explanation: "Server significa servidor. Ele pode fornecer dados e arquivos para a aplicação; não precisa ser uma máquina com esse formato.", takeaway: "server → servidor" },
  { id: "missing-file", chapter: "Entenda um erro", title: "O arquivo sumiu?", scene: "error", kind: "choice", story: "Ao abrir a imagem do Orbi, surgiu uma mensagem. Ler três palavras já ajuda a escolher uma investigação.", prompt: "Você lê “File not found”. O que faz primeiro?", hint: "File = arquivo. Not found = não encontrado. A mensagem não prova que o servidor caiu.", answer: "path", choices: [
    { value: "delete", label: "Apagar a pasta inteira", feedback: "Apagar tudo não resolve a busca e pode perder trabalho. A mensagem indica que um arquivo não foi encontrado." },
    { value: "server", label: "Concluir que o servidor caiu", feedback: "A mensagem não diz isso. O arquivo pode ter outro nome, outro caminho ou não existir onde foi procurado." },
    { value: "path", label: "Conferir o nome e o caminho do arquivo", feedback: "" },
  ], explanation: "File not found = arquivo não encontrado. Comece conferindo nome, extensão e caminho. Há outras causas possíveis, mas essa é uma investigação útil.", takeaway: "not found → não encontrado" },
  { id: "complete-error", chapter: "Lembre sem copiar", title: "Reconheça a mensagem", scene: "error", kind: "write", story: "A mesma mensagem apareceu em outro projeto. Agora recupere uma palavra sem depender de alternativas.", prompt: "Complete a mensagem que significa “arquivo não encontrado”.", before: "File not ", after: "", answer: "found", hint: "A palavra que falta é found: encontrado. Você pode consultar esta pista e depois tentar lembrar sem ela.", explanation: "Isso: File not found. Você reconheceu uma mensagem completa e já tem uma hipótese para investigar.", takeaway: "File not found → arquivo não encontrado" },
  { id: "return", chapter: "Acompanhe o código", title: "Uma entrega, dentro do código", scene: "return", kind: "choice", story: "Orbi criou uma função JavaScript. Ela dobra um número e entrega o resultado a quem fez a chamada.", prompt: "O que return faz neste exemplo?", hint: "Return devolve um valor ao código que chamou a função. Só isso não imprime no console.", answer: "value", choices: [
    { value: "print", label: "Mostra 6 no console automaticamente", feedback: "Return não imprime sozinho. Para mostrar o valor no console, este exemplo precisaria de console.log(...)." },
    { value: "value", label: "Devolve 6 para a chamada dobro(3)", feedback: "" },
    { value: "repeat", label: "Repete a função três vezes", feedback: "O 3 é o argumento recebido pela função. Não é uma quantidade de repetições." },
  ], explanation: "Return devolve um valor e encerra esta chamada da função. Aqui, resultado recebe 6. Nenhuma saída aparece no console porque não houve console.log.", takeaway: "return → devolver um valor" },
  { id: "transfer", chapter: "Resolva uma situação nova", title: "O que chega à saída?", scene: "output", kind: "choice", story: "Mudamos a chamada e acrescentamos console.log. Acompanhe o caminho do valor para prever a saída, chamada de output.", prompt: "Qual output este novo exemplo mostra no console?", hint: "dobro(4) devolve 4 × 2. console.log mostra o valor devolvido.", answer: "8", choices: [
    { value: "4", label: "4", feedback: "4 é o valor de entrada. A função dobra esse valor antes de devolvê-lo." },
    { value: "none", label: "Nenhuma saída", feedback: "Agora existe console.log(...). Ele mostra o valor que dobro(4) devolve." },
    { value: "8", label: "8", feedback: "" },
  ], explanation: "O argumento 4 entra na função, return devolve 8 e console.log mostra 8. Output é a saída produzida; return e mostrar essa saída têm papéis diferentes.", takeaway: "output → saída · entrada 4 → retorno 8 → console 8" },
];

export function evaluateEnglish(lesson: EnglishLesson, answer: string): { ok: boolean; message: string } {
  const normalized = answer.trim().toLowerCase();
  if (!normalized) return { ok: false, message: lesson.kind === "write" ? "Escreva a palavra que falta. A pista pode ajudar." : "Escolha uma resposta para testar sua ideia." };
  if (normalized === lesson.answer) return { ok: true, message: lesson.explanation };
  if (lesson.kind === "choice") return { ok: false, message: lesson.choices.find(choice => choice.value === normalized)?.feedback ?? "Escolha uma das respostas desta cena." };
  if (normalized.includes(" ")) return { ok: false, message: "As palavras File not já estão na mensagem. Escreva somente a palavra que falta." };
  return { ok: false, message: "Ainda falta a palavra que significa encontrado. Abra a pista se precisar; depois tente de novo." };
}

export type EnglishSave = { version: 1; current: number; completed: string[]; finished: boolean; draft: string };
export const emptyEnglishSave = (): EnglishSave => ({ version: 1, current: 0, completed: [], finished: false, draft: "" });
export const englishStorageKey = (userId: string) => `orbitamos-english-v1-${userId}`;
export function readEnglishSave(raw: string | null): EnglishSave {
  const empty = emptyEnglishSave();
  try {
    const data: unknown = JSON.parse(raw ?? "null");
    if (!data || typeof data !== "object" || !("version" in data) || data.version !== 1 || !("completed" in data) || !Array.isArray(data.completed)) return empty;
    const completed: string[] = [];
    for (const lesson of englishLessons) {
      if (!data.completed.includes(lesson.id)) break;
      completed.push(lesson.id);
    }
    const maxCurrent = Math.min(completed.length, englishLessons.length - 1);
    const current = "current" in data && typeof data.current === "number" && Number.isInteger(data.current) && data.current >= 0 ? Math.min(data.current, maxCurrent) : maxCurrent;
    const draft = englishLessons[current].kind === "write" && "draft" in data && typeof data.draft === "string" ? data.draft.slice(0, 40) : "";
    return { version: 1, current, completed, finished: "finished" in data && data.finished === true && completed.length === englishLessons.length, draft };
  } catch { return empty; }
}
