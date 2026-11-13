export const WORK_CASE_IDS = ["checkout-staging", "checkout-transfer"] as const;
export type WorkCaseId = typeof WORK_CASE_IDS[number];
export type WorkConfig = { environment: "staging"; ordersBaseUrl: string };
export type WorkCase = {
  id: WorkCaseId;
  title: string;
  objective: string;
  brief: string;
  servicePort: number;
  initialConfig: WorkConfig;
  starterCode: string;
  hints: string[];
};

export const WORK_CONFIG_LIMIT = 2400;
// Two bounded drafts can each expand sixfold when JSON escapes control characters.
export const WORK_SAVE_LIMIT = 40000;
const ATTEMPT_LIMIT = 10000;

export const workCases: WorkCase[] = [
  {
    id: "checkout-staging",
    title: "O pedido que não chega",
    objective: "Fazer o pedido de teste funcionar em homologação.",
    brief: "A loja abre em homologação, mas o checkout não consegue falar com pedidos. Investigue o mapa e o log, ajuste checkout.config.json e registre o teste no ticket. Produção continua funcionando.",
    servicePort: 3000,
    initialConfig: { environment: "staging", ordersBaseUrl: "http://orders:3001" },
    starterCode: '{\n  "environment": "staging",\n  "ordersBaseUrl": "http://orders:3001"\n}',
    hints: [
      "orders é o serviço de pedidos deste cenário. O número depois dos dois-pontos é a porta: ela precisa coincidir com a porta do serviço no mapa.",
      "A home não depende do serviço de pedidos. No log, compare a porta procurada pelo checkout com a porta em que pedidos atende.",
      "No mapa, pedidos atende em 3000. Ajuste ordersBaseUrl para http://orders:3000, preserve staging, aplique e execute um pedido de teste.",
    ],
  },
  {
    id: "checkout-transfer",
    title: "Uma nova porta",
    objective: "Investigar a nova porta e verificar outro pedido em homologação.",
    brief: "Em outra instalação de homologação, pedidos mudou de porta. A configuração anterior deixou de funcionar. Use as novas evidências para preparar e testar a correção; produção permanece fora desta mudança.",
    servicePort: 4100,
    initialConfig: { environment: "staging", ordersBaseUrl: "http://orders:3000" },
    starterCode: '{\n  "environment": "staging",\n  "ordersBaseUrl": "http://orders:3000"\n}',
    hints: [
      "O endereço certo depende desta instalação. Confira o mapa e o log atuais antes de reaproveitar a configuração anterior.",
      "Compare a porta de pedidos no mapa com ordersBaseUrl e valide sua hipótese com um pedido de teste.",
    ],
  },
];

export const getWorkCase = (id: WorkCaseId): WorkCase => workCases.find(item => item.id === id)!;
export const isWorkCaseId = (value: unknown): value is WorkCaseId => WORK_CASE_IDS.includes(value as WorkCaseId);

export type WorkConfigResult =
  | { ok: true; config: WorkConfig; message: string }
  | { ok: false; message: string };

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeConfig(value: unknown): WorkConfigResult {
  if (!record(value)) return { ok: false, message: "Use um objeto JSON com environment e ordersBaseUrl." };
  const keys = Object.keys(value);
  if (keys.length !== 2 || !keys.includes("environment") || !keys.includes("ordersBaseUrl")) {
    return { ok: false, message: "O arquivo aceita somente environment e ordersBaseUrl. Preserve os dois campos." };
  }
  if (value.environment !== "staging") return { ok: false, message: 'Este computador altera somente homologação. Mantenha environment como "staging".' };
  if (typeof value.ordersBaseUrl !== "string" || value.ordersBaseUrl.length > 160) {
    return { ok: false, message: "ordersBaseUrl precisa ser um endereço curto do serviço orders." };
  }
  // A deliberately small address grammar prevents URL normalization from hiding
  // credentials, alternate hosts, paths, queries, control characters or backslashes.
  const match = /^http:\/\/orders(?::([0-9]+))?\/?$/i.exec(value.ordersBaseUrl);
  if (!match || match[0] !== value.ordersBaseUrl) return { ok: false, message: "Use http://orders:PORTA, sem usuário, senha, caminho, consulta ou fragmento." };
  const port = match[1] === undefined ? 80 : Number(match[1]);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    return { ok: false, message: "A porta precisa ser um número inteiro entre 1 e 65535." };
  }
  return {
    ok: true,
    config: { environment: "staging", ordersBaseUrl: `http://orders:${port}` },
    message: "Configuração válida para homologação. Aplique e teste o pedido para verificar o resultado.",
  };
}

/** Parses bounded data only. Learner text never becomes a request or executable code. */
export function parseWorkConfig(source: string): WorkConfigResult {
  if (typeof source !== "string") return { ok: false, message: "Escreva o JSON da configuração ou recupere o arquivo inicial." };
  if (source.length > WORK_CONFIG_LIMIT) return { ok: false, message: `Este arquivo aceita até ${WORK_CONFIG_LIMIT} caracteres.` };
  if (!source.trim()) return { ok: false, message: "Escreva o JSON da configuração ou recupere o arquivo inicial." };
  try {
    return normalizeConfig(JSON.parse(source));
  } catch {
    return { ok: false, message: "O JSON não pôde ser lido. Confira aspas duplas, vírgulas e chaves antes de aplicar." };
  }
}

export type WorkTestResult = {
  ok: boolean;
  fingerprint: string;
  lines: string[];
  homeStatus: 200;
  checkoutStatus: 201 | 502;
  caseId: WorkCaseId;
};

/** Deterministic, local model of the two services; it never fetches ordersBaseUrl. */
export function testWorkCheckout(config: WorkConfig, caseId: WorkCaseId): WorkTestResult {
  const parsed = normalizeConfig(config);
  const scenario = isWorkCaseId(caseId) ? getWorkCase(caseId) : null;
  const ok = !!scenario && parsed.ok && parsed.config.ordersBaseUrl === `http://orders:${scenario.servicePort}`;
  const fingerprint = parsed.ok ? `work-v1|${caseId}|staging|${parsed.config.ordersBaseUrl}` : "invalid";
  return {
    ok,
    fingerprint,
    caseId,
    homeStatus: 200,
    checkoutStatus: ok ? 201 : 502,
    lines: [
      "SIMULAÇÃO LOCAL · homologação · nenhuma requisição externa",
      "GET / → 200 · a loja abre",
      ...(parsed.ok && scenario ? [
        `checkout → ${parsed.config.ordersBaseUrl} · pedidos atende em ${scenario.servicePort}`,
        ok ? "POST /checkout → 201 · pedido de teste concluído" : "POST /checkout → 502 · conexão recusada pelo serviço de pedidos",
      ] : ["POST /checkout → 502 · configuração fora do escopo desta simulação"]),
      "Produção: sem alterações.",
    ],
  };
}

export type WorkSave = {
  version: 1;
  current: WorkCaseId;
  completed: WorkCaseId[];
  drafts: Record<WorkCaseId, string>;
  attempts: Record<WorkCaseId, number>;
};

/** Account identity is preserved exactly; numeric IDs cannot collide with string IDs. */
export function workSimulationKey(userId: string | number): string {
  if ((typeof userId === "string" && (!userId.trim() || userId.length > 256))
    || (typeof userId === "number" && !Number.isSafeInteger(userId))
    || (typeof userId !== "string" && typeof userId !== "number")) {
    throw new TypeError("A simulação precisa de uma identificação de conta válida.");
  }
  return `orbitamos-work-simulation-v1-${typeof userId === "string" ? "s" : "n"}-${encodeURIComponent(JSON.stringify(userId))}`;
}

export const emptyWorkSave = (): WorkSave => ({
  version: 1,
  current: "checkout-staging",
  completed: [],
  drafts: {
    "checkout-staging": getWorkCase("checkout-staging").starterCode,
    "checkout-transfer": getWorkCase("checkout-transfer").starterCode,
  },
  attempts: { "checkout-staging": 0, "checkout-transfer": 0 },
});

function completedPrefix(value: unknown): WorkCaseId[] {
  if (!Array.isArray(value)) return [];
  const firstMissing = WORK_CASE_IDS.findIndex(id => !value.includes(id));
  return WORK_CASE_IDS.slice(0, firstMissing < 0 ? WORK_CASE_IDS.length : firstMissing);
}

function decodeWorkSave(value: unknown): WorkSave {
  const save = emptyWorkSave();
  if (!record(value) || value.version !== 1) return save;
  save.completed = completedPrefix(value.completed);
  const current = isWorkCaseId(value.current) ? value.current : save.current;
  const unlockedIndex = Math.min(save.completed.length, WORK_CASE_IDS.length - 1);
  save.current = WORK_CASE_IDS.indexOf(current) <= unlockedIndex ? current : WORK_CASE_IDS[unlockedIndex];
  for (const id of WORK_CASE_IDS) {
    const draft = record(value.drafts) ? value.drafts[id] : undefined;
    // A draft is text, including invalid JSON; restoring it does not apply it.
    if (typeof draft === "string") save.drafts[id] = draft.slice(0, WORK_CONFIG_LIMIT);
    const attempts = record(value.attempts) ? value.attempts[id] : undefined;
    if (typeof attempts === "number" && Number.isSafeInteger(attempts)) {
      save.attempts[id] = Math.max(0, Math.min(attempts, ATTEMPT_LIMIT));
    }
  }
  return save;
}

/** Only checkpoints survive a reload: no active config, test result, credentials or XP. */
export function readWorkSave(raw: string | null): WorkSave {
  if (typeof raw !== "string" || raw.length > WORK_SAVE_LIMIT) return emptyWorkSave();
  try { return decodeWorkSave(JSON.parse(raw)); } catch { return emptyWorkSave(); }
}

/** A stale tab preserves achievements/counters while keeping its own draft and selection. */
export function mergeWorkSave(next: WorkSave, previous: WorkSave): WorkSave {
  const active = decodeWorkSave(next);
  const stored = decodeWorkSave(previous);
  const completed = WORK_CASE_IDS.slice(0, Math.max(active.completed.length, stored.completed.length));
  return {
    ...active,
    completed,
    attempts: {
      "checkout-staging": Math.max(active.attempts["checkout-staging"], stored.attempts["checkout-staging"]),
      "checkout-transfer": Math.max(active.attempts["checkout-transfer"], stored.attempts["checkout-transfer"]),
    },
  };
}

export type WorkCompletionResult = { ok: boolean; save: WorkSave; message: string };

/** Ticket evidence must describe a passing test of this case's currently applied config. */
export function completeWorkCase(
  save: WorkSave,
  caseId: WorkCaseId,
  config: WorkConfig,
  testResult: WorkTestResult | null,
): WorkCompletionResult {
  const fail = (message: string): WorkCompletionResult => ({ ok: false, save, message });
  if (!isWorkCaseId(caseId)) return fail("Escolha uma tarefa conhecida antes de registrar evidência.");
  const checkpoint = decodeWorkSave(save);
  const index = WORK_CASE_IDS.indexOf(caseId);
  if (index > checkpoint.completed.length) return fail("Conclua o primeiro ticket antes da nova instalação.");
  const expected = testWorkCheckout(config, caseId);
  if (!testResult || !expected.ok || !testResult.ok || testResult.caseId !== caseId
    || testResult.fingerprint !== expected.fingerprint || testResult.homeStatus !== 200 || testResult.checkoutStatus !== 201) {
    return fail("Execute um pedido de teste com a configuração aplicada agora antes de registrar a evidência.");
  }
  if (checkpoint.completed.includes(caseId)) return { ok: true, save: checkpoint, message: "A evidência deste ticket já está registrada." };
  return {
    ok: true,
    save: {
      ...checkpoint,
      completed: [...checkpoint.completed, caseId],
      current: WORK_CASE_IDS[Math.min(index + 1, WORK_CASE_IDS.length - 1)],
    },
    message: "Evidência registrada: pedido concluído em homologação. Produção permanece sem alterações.",
  };
}
