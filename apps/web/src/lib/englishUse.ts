import { englishSpeakingLessons, type SpeakingScene } from "./spokenEnglish";

export type EnglishUseChoice = {
  readonly id: string;
  readonly text: string;
  readonly feedback: string;
};

export type EnglishUseQuestion = {
  readonly lessonId: string;
  readonly target: string;
  readonly scene: SpeakingScene;
  readonly context: string;
  readonly prompt: string;
  readonly choices: readonly EnglishUseChoice[];
  readonly correctChoiceId: string;
};

/** One optional contextual check for each existing speaking item; no new vocabulary. */
export const englishUseQuestions: readonly EnglishUseQuestion[] = [
  {
    lessonId: "word-file", target: "file", scene: "file",
    context: "No painel do projeto, você vê src, assets e main.js.",
    prompt: "O tutorial pede um “file”. Qual item atende ao pedido?",
    choices: [
      { id: "main-js", text: "main.js, que contém as instruções do programa.", feedback: "Isso. main.js é um file: um arquivo do projeto." },
      { id: "src", text: "A pasta src, que reúne vários itens do projeto.", feedback: "src representa uma pasta nessa cena. File é um arquivo, como main.js." },
      { id: "run-button", text: "O botão que inicia o programa.", feedback: "Esse botão executa o programa. File é o arquivo com conteúdo, como main.js." },
    ],
    correctChoiceId: "main-js",
  },
  {
    lessonId: "word-folder", target: "folder", scene: "folder",
    context: "Você está organizando os componentes, as imagens e os estilos de um projeto.",
    prompt: "Qual elemento corresponde a “folder” nesse trabalho?",
    choices: [
      { id: "image-file", text: "logo.png, uma imagem usada na página.", feedback: "logo.png é um arquivo. Folder é a pasta que pode reunir arquivos como essa imagem." },
      { id: "output", text: "A mensagem que apareceu depois de executar o programa.", feedback: "Essa mensagem é um resultado da execução. Folder é uma pasta que organiza itens do projeto." },
      { id: "images-directory", text: "images, onde ficam agrupadas as imagens do projeto.", feedback: "Isso. images é uma folder: uma pasta para organizar os arquivos." },
    ],
    correctChoiceId: "images-directory",
  },
  {
    lessonId: "word-code", target: "code", scene: "code",
    context: "Seu programa calcula uma soma e mostra o resultado na tela.",
    prompt: "Qual parte desse trabalho você mostraria a alguém que pediu para ver o “code”?",
    choices: [
      { id: "result", text: "Somente o número que apareceu na tela.", feedback: "O número é o resultado. Code são as instruções que fizeram o computador calcular e mostrar esse número." },
      { id: "instructions", text: "As linhas com as instruções da soma e da exibição do resultado.", feedback: "Isso. Essas instruções são o code: o código que o computador executa." },
      { id: "directory", text: "Somente o lugar onde os arquivos estão agrupados.", feedback: "Esse lugar é uma pasta. Code são as instruções escritas no programa." },
    ],
    correctChoiceId: "instructions",
  },
  {
    lessonId: "word-save", target: "save", scene: "save",
    context: "Você mudou uma linha em main.js e vai fazer uma pausa.",
    prompt: "Ao escolher “save” no editor, o que você espera que aconteça?",
    choices: [
      { id: "execute", text: "O programa começa a executar para mostrar um resultado.", feedback: "Executar é a ação de run. Save guarda as alterações do arquivo." },
      { id: "delete", text: "O arquivo sai do projeto e suas alterações são descartadas.", feedback: "Save faz o contrário de descartar: guarda as alterações no arquivo." },
      { id: "store-changes", text: "As alterações ficam guardadas no arquivo para continuar depois.", feedback: "Isso. Save guarda as alterações no arquivo. O programa ainda pode ser executado em outro momento." },
    ],
    correctChoiceId: "store-changes",
  },
  {
    lessonId: "word-run", target: "run", scene: "run",
    context: "O código de uma soma está pronto no editor.",
    prompt: "Você escolhe “run”. O que espera ver em seguida?",
    choices: [
      { id: "execute", text: "O programa executando as instruções e mostrando o resultado da soma.", feedback: "Isso. Run coloca o código em execução para observar o que ele faz." },
      { id: "rename", text: "Uma caixa para dar outro nome à pasta do projeto.", feedback: "Renomear a pasta é outra ação. Run executa o código para você observar o resultado." },
      { id: "store-only", text: "Somente as alterações guardadas, sem executar o programa.", feedback: "Guardar alterações é a ação de save. Run executa as instruções do programa." },
    ],
    correctChoiceId: "execute",
  },
  {
    lessonId: "word-error", target: "error", scene: "error",
    context: "Você tentou executar main.js e um aviso apareceu no terminal.",
    prompt: "O aviso começa com “error”. Qual é o próximo passo adequado?",
    choices: [
      { id: "celebrate", text: "Concluir que a execução terminou com o resultado esperado.", feedback: "Error sinaliza um problema. Leia a mensagem para investigar o que precisa ser corrigido." },
      { id: "investigate", text: "Ler o aviso e investigar a causa indicada por ele.", feedback: "Isso. Error indica um erro; a mensagem ajuda a descobrir o que ajustar antes de tentar novamente." },
      { id: "publish", text: "Publicar o projeto sem olhar o aviso.", feedback: "O aviso de error precisa ser investigado. A mensagem ajuda a entender a causa do problema." },
    ],
    correctChoiceId: "investigate",
  },
  {
    lessonId: "phrase-open-the-file", target: "Open the file", scene: "file",
    context: "Você acompanha um tutorial e vê main.js no painel do projeto.",
    prompt: "Ao ler “Open the file”, qual ação você faria?",
    choices: [
      { id: "show-contents", text: "Selecionar main.js para ver seu conteúdo no editor.", feedback: "Isso. Open the file pede para abrir o arquivo e acessar seu conteúdo." },
      { id: "new-directory", text: "Criar uma pasta vazia ao lado de main.js.", feedback: "Criar uma pasta é outra tarefa. Open the file pede para abrir o arquivo existente." },
      { id: "execute", text: "Iniciar o programa para observar sua saída.", feedback: "Essa ação executa o código. Open the file pede para abrir o arquivo no editor." },
    ],
    correctChoiceId: "show-contents",
  },
  {
    lessonId: "phrase-save-the-file", target: "Save the file", scene: "save",
    context: "Você alterou uma linha de main.js no editor.",
    prompt: "O tutorial diz “Save the file”. O que fazer agora?",
    choices: [
      { id: "show-directory", text: "Exibir a lista de pastas do projeto.", feedback: "A lista de pastas não guarda sua mudança. Save the file pede para salvar as alterações do arquivo." },
      { id: "store-changes", text: "Guardar no arquivo as alterações que acabou de fazer.", feedback: "Isso. Save the file pede para salvar o arquivo com suas alterações." },
      { id: "execute", text: "Executar o programa para observar sua saída.", feedback: "Executar o programa é outra ação. Save the file pede para guardar as alterações no arquivo." },
    ],
    correctChoiceId: "store-changes",
  },
  {
    lessonId: "phrase-run-the-code", target: "Run the code", scene: "run",
    context: "Você terminou de escrever um pequeno programa no editor.",
    prompt: "O próximo passo do tutorial é “Run the code”. Qual ação corresponde a ele?",
    choices: [
      { id: "new-file", text: "Criar outro arquivo vazio no projeto.", feedback: "Criar outro arquivo não executa o programa. Run the code pede para colocar as instruções em execução." },
      { id: "store-only", text: "Apenas guardar as alterações, sem iniciar o programa.", feedback: "Guardar as alterações corresponde a save. Run the code pede para executar o código e observar o que acontece." },
      { id: "execute", text: "Colocar o programa em execução para observar o resultado.", feedback: "Isso. Run the code pede para executar o código e observar o que ele faz." },
    ],
    correctChoiceId: "execute",
  },
  {
    lessonId: "phrase-fix-the-error", target: "Fix the error", scene: "error",
    context: "Depois de uma tentativa, o terminal destaca uma linha do programa.",
    prompt: "O tutorial orienta: “Fix the error”. Como continuar?",
    choices: [
      { id: "ignore", text: "Fechar a mensagem e manter o código como está.", feedback: "Fechar a mensagem não corrige o problema. Fix the error pede um ajuste no erro indicado." },
      { id: "inspect-and-adjust", text: "Ler a mensagem e ajustar o problema indicado antes de tentar novamente.", feedback: "Isso. Fix the error pede para corrigir o erro. A mensagem ajuda a orientar o ajuste." },
      { id: "rename-directory", text: "Mudar o nome da pasta sem investigar a mensagem.", feedback: "Mudar o nome da pasta não atende ao pedido por si só. Fix the error pede para investigar e corrigir o erro." },
    ],
    correctChoiceId: "inspect-and-adjust",
  },
  {
    lessonId: "phrase-the-test-passed", target: "The test passed", scene: "test",
    context: "Você acabou de rodar uma verificação da função que soma dois números.",
    prompt: "O terminal mostra “The test passed”. O que esse resultado permite afirmar?",
    choices: [
      { id: "whole-project-perfect", text: "Todo o projeto está livre de qualquer erro.", feedback: "A mensagem fala desta verificação. The test passed indica que este teste passou, sem garantir que todo o projeto esteja sem erros." },
      { id: "this-check-failed", text: "Esta verificação apontou uma falha que precisa ser investigada.", feedback: "The test passed informa um resultado de sucesso deste teste. Uma falha seria um resultado diferente." },
      { id: "this-check-succeeded", text: "Esta verificação terminou com o resultado esperado.", feedback: "Isso. The test passed informa que este teste passou. Outros comportamentos do projeto ainda podem precisar de verificação." },
    ],
    correctChoiceId: "this-check-succeeded",
  },
  {
    lessonId: "phrase-the-build-failed", target: "The build failed", scene: "build",
    context: "Você pediu para preparar o projeto para publicação.",
    prompt: "O terminal mostrou “The build failed”. Qual situação combina com essa mensagem?",
    choices: [
      { id: "preparation-failed", text: "A preparação parou com um problema; é preciso investigar a mensagem.", feedback: "Isso. The build failed informa que a geração do projeto falhou. A mensagem ajuda a investigar a causa." },
      { id: "ready-to-publish", text: "A preparação terminou com sucesso e o pacote está pronto.", feedback: "The build failed indica que essa preparação falhou. Leia a mensagem para investigar a causa antes de tentar novamente." },
      { id: "test-succeeded", text: "Um teste da soma terminou com o resultado esperado.", feedback: "A mensagem fala da geração do projeto, não do resultado de um teste. The build failed informa que essa geração falhou." },
    ],
    correctChoiceId: "preparation-failed",
  },
];

export function getEnglishUseQuestion(lessonId: string): EnglishUseQuestion | undefined {
  return englishUseQuestions.find(question => question.lessonId === lessonId);
}

export function evaluateEnglishUse(question: EnglishUseQuestion, choiceId: string): { ok: boolean; message: string } {
  const choice = question.choices.find(item => item.id === choiceId);
  return choice
    ? { ok: choice.id === question.correctChoiceId, message: choice.feedback }
    : { ok: false, message: "Escolha uma das opções desta situação para conferir." };
}

/** Correct contextual selections only; this is neither speech grading nor mastery. */
export type EnglishUseSave = {
  version: 1;
  active: boolean;
  current: string;
  completed: string[];
  attempts: Record<string, number>;
};

const MAX_SAVE_LENGTH = 32_768;
const MAX_ATTEMPTS = 999;
const hasOwn = (data: object, key: PropertyKey): boolean => Object.prototype.hasOwnProperty.call(data, key);

export const emptyEnglishUseSave = (): EnglishUseSave => ({
  version: 1,
  active: false,
  current: englishSpeakingLessons[0].id,
  completed: [],
  attempts: {},
});

/** Keep this optional check separate from both speaking participation and reading saves. */
export function englishUseKey(userId: string | number): string {
  if (typeof userId !== "string" && (typeof userId !== "number" || !Number.isFinite(userId))) {
    throw new TypeError("An English use save requires a string or finite number account identifier.");
  }
  return `orbitamos-english-use-v1-${typeof userId === "string" ? "s" : "n"}-${encodeURIComponent(JSON.stringify(userId))}`;
}

function isRecord(data: unknown): data is Record<string, unknown> {
  return data !== null && typeof data === "object" && !Array.isArray(data);
}

function normalizeEnglishUseSave(data: unknown): EnglishUseSave {
  const empty = emptyEnglishUseSave();
  if (!isRecord(data) || !hasOwn(data, "version") || data.version !== 1) return empty;

  const declaredCompleted: unknown[] = hasOwn(data, "completed") && Array.isArray(data.completed) ? data.completed : [];
  const completed = englishUseQuestions
    .filter(question => declaredCompleted.includes(question.lessonId))
    .map(question => question.lessonId);
  const attempts: Record<string, number> = {};
  if (hasOwn(data, "attempts") && isRecord(data.attempts)) {
    for (const { lessonId } of englishUseQuestions) {
      if (!hasOwn(data.attempts, lessonId)) continue;
      const count = data.attempts[lessonId];
      if (typeof count === "number" && Number.isInteger(count) && count > 0) {
        attempts[lessonId] = Math.min(count, MAX_ATTEMPTS);
      }
    }
  }

  return {
    version: 1,
    active: hasOwn(data, "active") && data.active === true,
    current: hasOwn(data, "current") && typeof data.current === "string" && getEnglishUseQuestion(data.current) ? data.current : empty.current,
    completed,
    attempts,
  };
}

export function readEnglishUseSave(raw: string | null): EnglishUseSave {
  if (!raw || raw.length > MAX_SAVE_LENGTH) return emptyEnglishUseSave();
  try {
    return normalizeEnglishUseSave(JSON.parse(raw));
  } catch {
    return emptyEnglishUseSave();
  }
}

/** Keep the active cursor, preserving known correct selections from a stored save. */
export function mergeEnglishUseSave(next: EnglishUseSave, previous: EnglishUseSave): EnglishUseSave {
  const active = normalizeEnglishUseSave(next);
  const stored = normalizeEnglishUseSave(previous);
  const completed = englishUseQuestions
    .filter(question => active.completed.includes(question.lessonId) || stored.completed.includes(question.lessonId))
    .map(question => question.lessonId);
  const attempts: Record<string, number> = {};
  for (const { lessonId } of englishUseQuestions) {
    // Max keeps an already persisted attempt from being counted again on merge.
    const count = Math.max(active.attempts[lessonId] ?? 0, stored.attempts[lessonId] ?? 0);
    if (count > 0) attempts[lessonId] = count;
  }
  return { version: 1, active: active.active, current: active.current, completed, attempts };
}

/** Only a known choice counts as an attempt; errors never revoke earlier completion. */
export function recordEnglishUseAttempt(save: EnglishUseSave, lessonId: string, choiceId: string): EnglishUseSave {
  const safe = normalizeEnglishUseSave(save);
  const question = getEnglishUseQuestion(lessonId);
  if (!question || !question.choices.some(choice => choice.id === choiceId)) return safe;
  const result = evaluateEnglishUse(question, choiceId);
  return {
    version: 1,
    active: safe.active,
    current: lessonId,
    completed: englishUseQuestions
      .filter(item => safe.completed.includes(item.lessonId) || (result.ok && item.lessonId === lessonId))
      .map(item => item.lessonId),
    attempts: { ...safe.attempts, [lessonId]: Math.min((safe.attempts[lessonId] ?? 0) + 1, MAX_ATTEMPTS) },
  };
}
