export const INCIDENT_CASE_IDS = Object.freeze(["release-regression", "independent-recovery"] as const);
export type IncidentCaseId = typeof INCIDENT_CASE_IDS[number];
export const INCIDENT_REASONS = Object.freeze(["home-opened", "highest-version", "verified-orders"] as const);
export type IncidentReason = typeof INCIDENT_REASONS[number];
export type IncidentArtifactId = "loja-019" | "loja-020" | "loja-021" | "loja-030" | "loja-031" | "loja-032";
export type IncidentPlan = { environment: "staging"; targetArtifact: IncidentArtifactId };
export type IncidentArtifact = {
  readonly id: IncidentArtifactId;
  readonly releasedAt: string;
  readonly environment: "staging";
  readonly ordersBaseUrl: "http://orders:3000";
  readonly homeStatus: 200;
  readonly checkoutStatus: 201 | 500;
  readonly errorsPer10: number;
  readonly latencyMs: number;
};
export type IncidentCase = {
  readonly id: IncidentCaseId;
  readonly title: string;
  readonly objective: string;
  readonly brief: string;
  readonly initialArtifact: IncidentArtifactId;
  readonly healthyArtifact: IncidentArtifactId;
  readonly artifacts: readonly IncidentArtifact[];
  readonly history: readonly { readonly at: string; readonly artifactId: IncidentArtifactId; readonly message: string }[];
  readonly starterCode: string;
  readonly hints: readonly string[];
};

const starter = (targetArtifact: IncidentArtifactId) => JSON.stringify({ environment: "staging", targetArtifact }, null, 2);
const snapshot = (id: IncidentArtifactId, releasedAt: string, checkoutStatus: 201 | 500, errorsPer10: number, latencyMs: number): IncidentArtifact => Object.freeze({
  id, releasedAt, environment: "staging", ordersBaseUrl: "http://orders:3000", homeStatus: 200, checkoutStatus, errorsPer10, latencyMs,
});
function freezeCase(value: IncidentCase): IncidentCase {
  return Object.freeze({
    ...value,
    artifacts: Object.freeze([...value.artifacts]),
    history: Object.freeze(value.history.map(event => Object.freeze({ ...event }))),
    hints: Object.freeze([...value.hints]),
  });
}

/** Fictional release history and illustrative metrics, fixed independently of the real clock. */
export const incidentCases: readonly IncidentCase[] = Object.freeze([
  freezeCase({
    id: "release-regression", title: "O pedido falhou depois da versão", objective: "Recuperar os pedidos e conferir a versão instalada em homologação.",
    brief: "Depois da publicação de loja-021, apareceram erros nos pedidos. A home segue abrindo e todas as versões usam orders:3000. Investigue o histórico e escolha uma recuperação verificável. Neste ensaio não houve migração de banco; voltar à versão anterior é uma opção segura do cenário. A sequência temporal é uma pista, não uma prova universal de causa raiz.",
    initialArtifact: "loja-021", healthyArtifact: "loja-020",
    artifacts: [snapshot("loja-019", "08:30", 500, 3, 640), snapshot("loja-020", "09:10", 201, 0, 210), snapshot("loja-021", "09:40", 500, 7, 980)],
    history: [
      { at: "08:30", artifactId: "loja-019", message: "Versão antiga: home abre, mas pedidos têm erros. Ser mais antiga não garante saúde." },
      { at: "09:10", artifactId: "loja-020", message: "Versão anterior conferida: pedido 201 e 0 erros em 10 pedidos de exemplo." },
      { at: "09:40", artifactId: "loja-021", message: "Publicação em homologação. O endereço de pedidos continuou orders:3000." },
      { at: "09:42", artifactId: "loja-021", message: "Após a publicação: home 200, pedido 500 e 7 erros em 10 pedidos de exemplo. Investigue a mudança de versão." },
    ],
    starterCode: starter("loja-021"),
    hints: [
      "A página inicial pode abrir enquanto o pedido falha. Compare os pedidos e os erros de cada versão no histórico; a porta é a mesma em todas.",
      "Voltar a qualquer versão antiga não basta. Procure a versão anterior com pedido 201 e sem erros neste cenário.",
      'A loja-020 foi conferida antes do incidente. Use "targetArtifact": "loja-020", aplique em staging e verifique os pedidos antes de registrar a evidência.',
    ],
  }),
  freezeCase({
    id: "independent-recovery", title: "Recuperar outra instalação", objective: "Escolher uma versão saudável pelas novas evidências e conferir os pedidos.",
    brief: "Em outra instalação de homologação, os pedidos começaram a falhar após loja-032. Todas as versões continuam em orders:3000. Use o novo histórico; o número do caso anterior não se aplica aqui. Também não houve migração de banco neste ensaio. Recuperar o serviço não substitui investigar a causa raiz depois.",
    initialArtifact: "loja-032", healthyArtifact: "loja-031",
    artifacts: [snapshot("loja-030", "13:00", 500, 4, 720), snapshot("loja-031", "13:30", 201, 0, 240), snapshot("loja-032", "14:00", 500, 6, 1100)],
    history: [
      { at: "13:00", artifactId: "loja-030", message: "Versão antiga com erros no pedido. A home abre, mas isso não comprova a compra." },
      { at: "13:30", artifactId: "loja-031", message: "Verificação anterior: home 200, pedido 201 e 0 erros em 10 pedidos de exemplo." },
      { at: "14:00", artifactId: "loja-032", message: "Nova publicação em homologação; pedidos permaneceu em orders:3000." },
      { at: "14:03", artifactId: "loja-032", message: "Depois da publicação, pedido 500 e 6 erros em 10 pedidos de exemplo. A porta não mudou." },
    ],
    starterCode: starter("loja-032"),
    hints: [
      "Compare os horários da publicação com os sinais do pedido. Procure evidência de funcionamento, não só um número maior ou menor.",
      "Escolha uma versão deste histórico, aplique o plano em homologação e confira pedido e erros na versão instalada.",
    ],
  }),
]);

export const isIncidentCaseId = (value: unknown): value is IncidentCaseId => INCIDENT_CASE_IDS.includes(value as IncidentCaseId);
export const getIncidentCase = (id: IncidentCaseId): IncidentCase => incidentCases.find(item => item.id === id)!;
export function getIncidentArtifact(caseId: IncidentCaseId, artifactId: IncidentArtifactId): IncidentArtifact | null {
  return isIncidentCaseId(caseId) ? getIncidentCase(caseId).artifacts.find(artifact => artifact.id === artifactId) ?? null : null;
}
export const INCIDENT_PLAN_LIMIT = 2400;
export const INCIDENT_SAVE_LIMIT = 40000;
const ATTEMPT_LIMIT = 10000;

export type IncidentPlanResult = { ok: true; config: IncidentPlan; message: string } | { ok: false; message: string };
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);

function normalizePlan(value: unknown, caseId: IncidentCaseId): IncidentPlanResult {
  if (!isIncidentCaseId(caseId)) return { ok: false, message: "Escolha um caso de incidente conhecido." };
  if (!record(value)) return { ok: false, message: "Use um objeto JSON com environment e targetArtifact." };
  const keys = Object.keys(value);
  if (keys.length !== 2 || !keys.includes("environment") || !keys.includes("targetArtifact")) {
    return { ok: false, message: "O plano aceita somente environment e targetArtifact. Preserve os dois campos." };
  }
  if (value.environment !== "staging") return { ok: false, message: 'A recuperação deste ensaio acontece somente em homologação. Preserve environment como "staging".' };
  if (typeof value.targetArtifact !== "string" || !getIncidentCase(caseId).artifacts.some(artifact => artifact.id === value.targetArtifact)) {
    return { ok: false, message: "Escolha uma versão conhecida no histórico deste caso. O plano não aceita URLs ou comandos." };
  }
  return {
    ok: true,
    config: { environment: "staging", targetArtifact: value.targetArtifact as IncidentArtifactId },
    message: "Plano válido. Digitar não instala a versão: aplique e confira o pedido no ambiente.",
  };
}

/** Bounded JSON only: a target is an authored snapshot ID, never executable learner text. */
export function parseIncidentPlan(source: string, caseId: IncidentCaseId): IncidentPlanResult {
  if (typeof source !== "string") return { ok: false, message: "Escreva o arquivo de recuperação em JSON." };
  if (source.length > INCIDENT_PLAN_LIMIT) return { ok: false, message: `Este plano aceita até ${INCIDENT_PLAN_LIMIT} caracteres.` };
  if (!source.trim()) return { ok: false, message: "Escreva o plano ou recupere o arquivo inicial." };
  try { return normalizePlan(JSON.parse(source), caseId); }
  catch { return { ok: false, message: "O JSON não pôde ser lido. Confira aspas duplas, vírgulas e chaves." }; }
}

export type IncidentSignals = {
  artifactId: IncidentArtifactId;
  ordersBaseUrl: "http://orders:3000";
  homeStatus: 200;
  checkoutStatus: 201 | 500;
  errorsPer10: number;
  latencyMs: number;
};
const signalsFor = (artifact: IncidentArtifact): IncidentSignals => ({
  artifactId: artifact.id, ordersBaseUrl: artifact.ordersBaseUrl, homeStatus: artifact.homeStatus,
  checkoutStatus: artifact.checkoutStatus, errorsPer10: artifact.errorsPer10, latencyMs: artifact.latencyMs,
});
const fingerprint = (caseId: IncidentCaseId, config: IncidentPlan) => `work-incident-v1|${caseId}|staging|${config.targetArtifact}`;
const signalsLine = (signals: IncidentSignals) => `${signals.artifactId}: home ${signals.homeStatus} · pedido ${signals.checkoutStatus} · ${signals.errorsPer10}/10 erros · latência ilustrativa ${signals.latencyMs} ms`;

export type IncidentRecovery = {
  phase: "recovery";
  ok: boolean;
  environment: "staging";
  caseId: IncidentCaseId;
  artifactId: IncidentArtifactId;
  fingerprint: string;
  /** Fixed snapshot from the initial alert, not the preceding application. */
  before: IncidentSignals;
  after: IncidentSignals;
  message: string;
  lines: string[];
};

/** Every valid known version can be installed, including an old or current faulty version. */
export function applyIncidentRecovery(config: IncidentPlan, caseId: IncidentCaseId): IncidentRecovery {
  const scenario = isIncidentCaseId(caseId) ? getIncidentCase(caseId) : incidentCases[0];
  const before = signalsFor(getIncidentArtifact(scenario.id, scenario.initialArtifact)!);
  const parsed = normalizePlan(config, caseId);
  const artifact = parsed.ok ? getIncidentArtifact(caseId, parsed.config.targetArtifact) : null;
  const after = artifact ? signalsFor(artifact) : { ...before };
  return {
    phase: "recovery", ok: parsed.ok, environment: "staging", caseId, artifactId: after.artifactId,
    fingerprint: parsed.ok ? fingerprint(caseId, parsed.config) : "work-incident-v1|invalid",
    before, after,
    message: parsed.ok ? `${after.artifactId} instalada em homologação. Confira o pedido e os erros antes de registrar a recuperação.` : parsed.message,
    lines: [
      "RECUPERAÇÃO SIMULADA · homologação · sem requisições ou comandos externos",
      `No alerta inicial · ${signalsLine(before)}`,
      parsed.ok ? `Agora · ${signalsLine(after)}` : "Plano recusado: a instalação inicial permanece sem alterações.",
      "Neste ensaio não há migração de banco. A recuperação não comprova a causa raiz do incidente.",
      "Produção: sem alterações.",
    ],
  };
}

function sameSignals(actual: IncidentSignals | null, expected: IncidentSignals): boolean {
  return !!actual && actual.artifactId === expected.artifactId && actual.ordersBaseUrl === expected.ordersBaseUrl
    && actual.homeStatus === expected.homeStatus && actual.checkoutStatus === expected.checkoutStatus
    && actual.errorsPer10 === expected.errorsPer10 && actual.latencyMs === expected.latencyMs;
}
function sameRecovery(actual: IncidentRecovery | null, expected: IncidentRecovery): boolean {
  return !!actual && actual.phase === "recovery" && actual.ok === true && expected.ok
    && actual.environment === "staging" && actual.caseId === expected.caseId && actual.artifactId === expected.artifactId
    && actual.fingerprint === expected.fingerprint && sameSignals(actual.before, expected.before) && sameSignals(actual.after, expected.after);
}

export type IncidentVerification = IncidentSignals & {
  phase: "verification";
  ok: boolean;
  healthy: boolean;
  applied: boolean;
  matchesPlan: boolean;
  environment: "staging";
  caseId: IncidentCaseId;
  fingerprint: string;
  lines: string[];
};

/** Observes the installed snapshot. An edited plan alone cannot change any signals. */
export function verifyIncidentRecovery(recovery: IncidentRecovery | null, config: IncidentPlan, caseId: IncidentCaseId): IncidentVerification {
  const scenario = isIncidentCaseId(caseId) ? getIncidentCase(caseId) : incidentCases[0];
  const initial = signalsFor(getIncidentArtifact(scenario.id, scenario.initialArtifact)!);
  const recoveryPlan: IncidentPlan | null = recovery && getIncidentArtifact(caseId, recovery.artifactId)
    ? { environment: "staging", targetArtifact: recovery.artifactId } : null;
  const applied = !!recoveryPlan && sameRecovery(recovery, applyIncidentRecovery(recoveryPlan, caseId));
  const signals = applied && recovery ? { ...recovery.after } : initial;
  const parsed = normalizePlan(config, caseId);
  const currentFingerprint = applied && recovery ? recovery.fingerprint : `work-incident-v1|${caseId}|initial|${scenario.initialArtifact}`;
  const matchesPlan = applied && parsed.ok && currentFingerprint === fingerprint(caseId, parsed.config);
  const healthy = isIncidentCaseId(caseId) && signals.artifactId === scenario.healthyArtifact && signals.checkoutStatus === 201 && signals.errorsPer10 === 0;
  return {
    ...signals, phase: "verification", ok: applied && matchesPlan && healthy, healthy, applied, matchesPlan,
    environment: "staging", caseId, fingerprint: currentFingerprint,
    lines: [
      "VERIFICAÇÃO APÓS APLICAÇÃO · homologação · simulação local",
      signalsLine(signals),
      ...(!applied ? ["Nenhuma recuperação aplicada nesta sessão. O plano editado não instalou uma versão."] : []),
      ...(applied && !matchesPlan ? ["O plano informado é diferente da versão aplicada. Editar não muda a instalação nem comprova este novo plano."] : []),
      healthy ? "O pedido passou e os erros caíram a zero nesta amostra do cenário." : "A home abre, mas o pedido ainda falha. A versão instalada não recuperou os pedidos.",
      "Latência e erros são métricas ilustrativas deste ensaio; a causa raiz continua em investigação.",
      "Produção: sem alterações.",
    ],
  };
}

export type IncidentSave = {
  version: 1;
  current: IncidentCaseId;
  completed: IncidentCaseId[];
  drafts: Record<IncidentCaseId, string>;
  attempts: Record<IncidentCaseId, number>;
};
export function incidentSaveKey(userId: string | number): string {
  if ((typeof userId === "string" && (userId.length > 256 || !userId.trim()))
    || (typeof userId === "number" && !Number.isSafeInteger(userId))
    || (typeof userId !== "string" && typeof userId !== "number")) throw new TypeError("A recuperação precisa de uma identificação de conta válida.");
  return `orbitamos-work-incident-v1-${typeof userId === "string" ? "s" : "n"}-${encodeURIComponent(JSON.stringify(userId))}`;
}
export const emptyIncidentSave = (): IncidentSave => ({
  version: 1, current: "release-regression", completed: [],
  drafts: { "release-regression": getIncidentCase("release-regression").starterCode, "independent-recovery": getIncidentCase("independent-recovery").starterCode },
  attempts: { "release-regression": 0, "independent-recovery": 0 },
});
function completedPrefix(value: unknown): IncidentCaseId[] {
  if (!Array.isArray(value)) return [];
  const missing = INCIDENT_CASE_IDS.findIndex(id => !value.includes(id));
  return INCIDENT_CASE_IDS.slice(0, missing < 0 ? INCIDENT_CASE_IDS.length : missing);
}
function decodeSave(value: unknown): IncidentSave {
  const save = emptyIncidentSave();
  if (!record(value) || value.version !== 1) return save;
  save.completed = completedPrefix(value.completed);
  const current = isIncidentCaseId(value.current) ? value.current : save.current;
  const unlockedIndex = Math.min(save.completed.length, INCIDENT_CASE_IDS.length - 1);
  save.current = INCIDENT_CASE_IDS.indexOf(current) <= unlockedIndex ? current : INCIDENT_CASE_IDS[unlockedIndex];
  for (const id of INCIDENT_CASE_IDS) {
    const draft = record(value.drafts) ? value.drafts[id] : undefined;
    if (typeof draft === "string") save.drafts[id] = draft.slice(0, INCIDENT_PLAN_LIMIT);
    const attempts = record(value.attempts) ? value.attempts[id] : undefined;
    if (typeof attempts === "number" && Number.isSafeInteger(attempts)) save.attempts[id] = Math.max(0, Math.min(attempts, ATTEMPT_LIMIT));
  }
  return save;
}
/** Restore drafts/history only. No applied installation, verification or selected reason survives. */
export function readIncidentSave(raw: string | null): IncidentSave {
  if (typeof raw !== "string" || raw.length > INCIDENT_SAVE_LIMIT) return emptyIncidentSave();
  try { return decodeSave(JSON.parse(raw)); } catch { return emptyIncidentSave(); }
}
export function mergeIncidentSave(next: IncidentSave, previous: IncidentSave): IncidentSave {
  const active = decodeSave(next), stored = decodeSave(previous);
  return {
    ...active,
    completed: INCIDENT_CASE_IDS.slice(0, Math.max(active.completed.length, stored.completed.length)),
    attempts: {
      "release-regression": Math.max(active.attempts["release-regression"], stored.attempts["release-regression"]),
      "independent-recovery": Math.max(active.attempts["independent-recovery"], stored.attempts["independent-recovery"]),
    },
  };
}

export type IncidentContext = {
  caseId: IncidentCaseId;
  config: IncidentPlan;
  recovery: IncidentRecovery | null;
  verification: IncidentVerification | null;
  reason: IncidentReason | null;
};
export type IncidentCompletionResult = { ok: boolean; save: IncidentSave; message: string };

/** Both a healthy current installation and its post-application evidence are required. */
export function completeIncidentCase(save: IncidentSave, context: IncidentContext): IncidentCompletionResult {
  const { caseId, config, recovery, verification, reason } = context;
  const fail = (message: string): IncidentCompletionResult => ({ ok: false, save, message });
  if (!isIncidentCaseId(caseId)) return fail("Escolha um caso conhecido antes de registrar a recuperação.");
  const checkpoint = decodeSave(save), index = INCIDENT_CASE_IDS.indexOf(caseId);
  if (index > checkpoint.completed.length) return fail("Conclua a primeira recuperação antes da nova instalação.");
  const expectedRecovery = applyIncidentRecovery(config, caseId);
  const expectedVerification = verifyIncidentRecovery(recovery, config, caseId);
  if (!sameRecovery(recovery, expectedRecovery) || !expectedVerification.ok
    || !verification || verification.phase !== "verification" || !verification.ok || !verification.healthy
    || !verification.applied || !verification.matchesPlan || verification.environment !== "staging" || verification.caseId !== caseId
    || verification.fingerprint !== expectedVerification.fingerprint || !sameSignals(verification, expectedVerification)) {
    return fail("Aplique uma versão saudável deste caso e confira o pedido e os erros dessa instalação antes de registrar a evidência.");
  }
  if (reason !== "verified-orders") return fail("Escolha a evidência que mostra a recuperação: o pedido verificado e os erros da versão instalada.");
  if (checkpoint.completed.includes(caseId)) return { ok: true, save: checkpoint, message: "A evidência deste caso já está registrada." };
  return {
    ok: true,
    save: { ...checkpoint, completed: [...checkpoint.completed, caseId], current: INCIDENT_CASE_IDS[Math.min(index + 1, INCIDENT_CASE_IDS.length - 1)] },
    message: "Recuperação registrada: pedido conferido em homologação e erros zerados nesta amostra. A causa raiz segue em investigação; produção permanece sem alterações.",
  };
}
