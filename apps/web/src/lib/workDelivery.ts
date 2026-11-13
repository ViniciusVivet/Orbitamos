export const WORK_ARTIFACT_IDS = Object.freeze(["loja-014", "loja-015"] as const);
export type WorkArtifactId = typeof WORK_ARTIFACT_IDS[number];
export const WORK_DELIVERY_CHECKS = Object.freeze(["home", "checkout"] as const);
export type WorkDeliveryCheck = typeof WORK_DELIVERY_CHECKS[number];
export type WorkDeliveryConfig = { environment: "staging"; checks: WorkDeliveryCheck[] };
export type WorkArtifact = {
  readonly id: WorkArtifactId;
  readonly title: string;
  readonly environment: "staging";
  readonly ordersBaseUrl: string;
  readonly homeStatus: 200;
  readonly checkoutStatus: 201 | 502;
};

/** Authored immutable snapshots. None of these addresses is requested or executed. */
export const workArtifacts: readonly WorkArtifact[] = Object.freeze([
  Object.freeze({ id: "loja-014", title: "Loja 014 · configuração anterior", environment: "staging", ordersBaseUrl: "http://orders:3001", homeStatus: 200, checkoutStatus: 502 } as const),
  Object.freeze({ id: "loja-015", title: "Loja 015 · conexão corrigida", environment: "staging", ordersBaseUrl: "http://orders:3000", homeStatus: 200, checkoutStatus: 201 } as const),
]);
export const isWorkArtifactId = (value: unknown): value is WorkArtifactId => WORK_ARTIFACT_IDS.includes(value as WorkArtifactId);
export const getWorkArtifact = (id: WorkArtifactId): WorkArtifact => workArtifacts.find(artifact => artifact.id === id)!;
export const WORK_DELIVERY_CONFIG_LIMIT = 2400;
// One bounded draft can expand sixfold when JSON escapes its characters.
export const WORK_DELIVERY_SAVE_LIMIT = 20000;
export const WORK_DELIVERY_STARTER_CODE = '{\n  "environment": "staging",\n  "checks": ["home"]\n}';
const ATTEMPT_LIMIT = 10000;

export type WorkDeliveryConfigResult =
  | { ok: true; config: WorkDeliveryConfig; message: string }
  | { ok: false; message: string };

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeConfig(value: unknown): WorkDeliveryConfigResult {
  if (!record(value)) return { ok: false, message: "Use um objeto JSON com environment e checks." };
  const keys = Object.keys(value);
  if (keys.length !== 2 || !keys.includes("environment") || !keys.includes("checks")) {
    return { ok: false, message: "O arquivo aceita somente environment e checks. Preserve os dois campos." };
  }
  if (value.environment !== "staging") return { ok: false, message: 'Esta esteira publica somente em homologação. Preserve environment como "staging".' };
  if (!Array.isArray(value.checks) || value.checks.length < 1 || value.checks.length > WORK_DELIVERY_CHECKS.length) {
    return { ok: false, message: "checks precisa ser uma lista com home, checkout ou os dois, sem repetição." };
  }
  const requested = value.checks;
  if ([...requested].some(check => !WORK_DELIVERY_CHECKS.includes(check)) || new Set(requested).size !== requested.length) {
    return { ok: false, message: 'Use apenas "home" e "checkout", uma vez cada. Não escreva URLs ou comandos.' };
  }
  return {
    ok: true,
    config: { environment: "staging", checks: WORK_DELIVERY_CHECKS.filter(check => requested.includes(check)) },
    message: "Arquivo válido. Rode a esteira para observar o que estas verificações cobrem.",
  };
}

/** Only bounded JSON data is read; learner text never becomes code, a shell command or a URL. */
export function parseWorkDeliveryConfig(source: string): WorkDeliveryConfigResult {
  if (typeof source !== "string") return { ok: false, message: "Escreva o arquivo smoke.config.json." };
  if (source.length > WORK_DELIVERY_CONFIG_LIMIT) return { ok: false, message: `Este arquivo aceita até ${WORK_DELIVERY_CONFIG_LIMIT} caracteres.` };
  if (!source.trim()) return { ok: false, message: "Escreva o arquivo smoke.config.json ou recupere o exemplo inicial." };
  try { return normalizeConfig(JSON.parse(source)); }
  catch { return { ok: false, message: "O JSON não pôde ser lido. Confira aspas duplas, vírgulas, colchetes e chaves." }; }
}

export type WorkDeliveryCheckResult = { id: WorkDeliveryCheck; ok: boolean; status: 200 | 201 | 502 };
export type WorkDeliveryPipeline = {
  phase: "pipeline";
  environment: "staging";
  artifactId: WorkArtifactId;
  fingerprint: string;
  checks: WorkDeliveryCheckResult[];
  allChecksPassed: boolean;
  coverageComplete: boolean;
  canPublish: boolean;
  lines: string[];
};

/** A green subset is visible, but only the complete useful checks authorize publishing. */
export function runWorkDelivery(config: WorkDeliveryConfig, artifactId: WorkArtifactId): WorkDeliveryPipeline {
  const parsed = normalizeConfig(config);
  const artifact = isWorkArtifactId(artifactId) ? getWorkArtifact(artifactId) : null;
  const checks: WorkDeliveryCheckResult[] = parsed.ok && artifact ? parsed.config.checks.map(id => {
    const status = id === "home" ? artifact.homeStatus : artifact.checkoutStatus;
    return { id, ok: status === (id === "home" ? 200 : 201), status };
  }) : [];
  const allChecksPassed = checks.length > 0 && checks.every(check => check.ok);
  const coverageComplete = checks.length === WORK_DELIVERY_CHECKS.length;
  const canPublish = artifactId === "loja-015" && allChecksPassed && coverageComplete;
  const fingerprint = parsed.ok && artifact
    ? `work-delivery-v1|${artifact.id}|staging|${parsed.config.checks.join(",")}`
    : "work-delivery-v1|invalid";
  return {
    phase: "pipeline", environment: "staging", artifactId, fingerprint, checks,
    allChecksPassed, coverageComplete, canPublish,
    lines: [
      "ESTEIRA SIMULADA · homologação · nenhuma execução ou requisição externa",
      ...(artifact ? [`Artefato imutável: ${artifact.id} · pedidos em ${artifact.ordersBaseUrl}`] : ["Artefato desconhecido: execução recusada."]),
      ...checks.map(check => `${check.id === "home" ? "GET /" : "POST /checkout"} → ${check.status} · ${check.ok ? "passou" : "falhou"}`),
      ...(!parsed.ok ? [parsed.message] : !coverageComplete ? ["Cobertura incompleta: confira home e checkout. Uma home verde não confirma o pedido."] : []),
      canPublish ? "Verificações completas e aprovadas. Este artefato pode seguir para homologação." : "Publicação bloqueada: complete a cobertura e corrija as falhas.",
      "Produção: sem alterações.",
    ],
  };
}

function samePipeline(actual: WorkDeliveryPipeline | null, expected: WorkDeliveryPipeline): boolean {
  return !!actual && actual.phase === "pipeline" && actual.environment === "staging"
    && actual.artifactId === expected.artifactId && actual.fingerprint === expected.fingerprint
    && actual.allChecksPassed === expected.allChecksPassed && actual.coverageComplete === expected.coverageComplete
    && actual.canPublish === expected.canPublish && Array.isArray(actual.checks)
    && actual.checks.length === expected.checks.length
    && expected.checks.every((check, index) => actual.checks[index]?.id === check.id
      && actual.checks[index]?.ok === check.ok && actual.checks[index]?.status === check.status);
}

export type WorkDeploymentResult = {
  phase: "deployment";
  ok: boolean;
  environment: "staging";
  artifactId: WorkArtifactId;
  fingerprint: string;
  message: string;
};

/** Publishing revalidates the exact immutable artifact/configuration that was tested. */
export function publishWorkDelivery(
  config: WorkDeliveryConfig,
  artifactId: WorkArtifactId,
  pipeline: WorkDeliveryPipeline | null,
): WorkDeploymentResult {
  const expected = runWorkDelivery(config, artifactId);
  const ok = expected.canPublish && samePipeline(pipeline, expected);
  return {
    phase: "deployment", ok, environment: "staging", artifactId, fingerprint: expected.fingerprint,
    message: ok
      ? `${artifactId} publicado em homologação. Confira o pedido no ambiente publicado antes de enviar a entrega.`
      : "Publicação bloqueada. Rode home e checkout com sucesso para este artefato e esta configuração em homologação.",
  };
}

function sameDeployment(actual: WorkDeploymentResult | null, expected: WorkDeploymentResult): boolean {
  return !!actual && actual.phase === "deployment" && actual.ok === true && expected.ok
    && actual.environment === "staging" && actual.artifactId === expected.artifactId && actual.fingerprint === expected.fingerprint;
}

export type WorkDeploymentVerification = {
  phase: "verification";
  ok: boolean;
  environment: "staging";
  artifactId: WorkArtifactId;
  fingerprint: string;
  homeStatus: 200 | 503;
  checkoutStatus: 201 | 502 | 503;
  lines: string[];
};

/** A separate post-publication smoke check; stale or absent deployments are unavailable. */
export function verifyWorkDeployment(
  deployment: WorkDeploymentResult | null,
  config: WorkDeliveryConfig,
  artifactId: WorkArtifactId,
): WorkDeploymentVerification {
  const pipeline = runWorkDelivery(config, artifactId);
  const expected = publishWorkDelivery(config, artifactId, pipeline);
  const ok = sameDeployment(deployment, expected);
  return {
    phase: "verification", ok, environment: "staging", artifactId, fingerprint: expected.fingerprint,
    homeStatus: ok ? 200 : 503,
    checkoutStatus: ok ? 201 : 503,
    lines: [
      "SMOKE PÓS-PUBLICAÇÃO · homologação · simulação local",
      ...(ok ? [`Artefato conferido: ${artifactId}`, "GET / → 200 · a loja abriu", "POST /checkout → 201 · pedido publicado conferido"]
        : ["503 · nenhuma publicação válida para o artefato e a configuração atuais. Publique novamente antes de conferir."]),
      "Produção: sem alterações.",
    ],
  };
}

export type WorkDeliverySave = {
  version: 1;
  draft: string;
  selectedArtifact: WorkArtifactId;
  attempts: number;
  /** Historical achievement, never a restored live publication or test result. */
  completed: boolean;
};

export function workDeliveryKey(userId: string | number): string {
  if ((typeof userId === "string" && (userId.length > 256 || !userId.trim()))
    || (typeof userId === "number" && !Number.isSafeInteger(userId))
    || (typeof userId !== "string" && typeof userId !== "number")) {
    throw new TypeError("A esteira precisa de uma identificação de conta válida.");
  }
  return `orbitamos-work-delivery-v1-${typeof userId === "string" ? "s" : "n"}-${encodeURIComponent(JSON.stringify(userId))}`;
}

export const emptyWorkDeliverySave = (): WorkDeliverySave => ({
  version: 1, draft: WORK_DELIVERY_STARTER_CODE, selectedArtifact: "loja-014", attempts: 0, completed: false,
});

function decodeSave(value: unknown): WorkDeliverySave {
  const save = emptyWorkDeliverySave();
  if (!record(value) || value.version !== 1) return save;
  if (typeof value.draft === "string") save.draft = value.draft.slice(0, WORK_DELIVERY_CONFIG_LIMIT);
  if (isWorkArtifactId(value.selectedArtifact)) save.selectedArtifact = value.selectedArtifact;
  if (typeof value.attempts === "number" && Number.isSafeInteger(value.attempts)) save.attempts = Math.max(0, Math.min(value.attempts, ATTEMPT_LIMIT));
  save.completed = value.completed === true;
  return save;
}

/** Draft/selection/history only. Pipeline, deployment and verification are deliberately discarded. */
export function readWorkDeliverySave(raw: string | null): WorkDeliverySave {
  if (typeof raw !== "string" || raw.length > WORK_DELIVERY_SAVE_LIMIT) return emptyWorkDeliverySave();
  try { return decodeSave(JSON.parse(raw)); } catch { return emptyWorkDeliverySave(); }
}

/** Keep the active editor/selection, while historical achievement and attempt maxima survive. */
export function mergeWorkDeliverySave(next: WorkDeliverySave, previous: WorkDeliverySave): WorkDeliverySave {
  const active = decodeSave(next), stored = decodeSave(previous);
  return { ...active, completed: active.completed || stored.completed, attempts: Math.max(active.attempts, stored.attempts) };
}

export type WorkDeliveryContext = {
  artifactId: WorkArtifactId;
  config: WorkDeliveryConfig;
  pipeline: WorkDeliveryPipeline | null;
  deployment: WorkDeploymentResult | null;
  verification: WorkDeploymentVerification | null;
};
export type WorkDeliveryCompletionResult = { ok: boolean; save: WorkDeliverySave; message: string };

/** Nina accepts only current evidence from all three distinct stages. Publishing alone never completes the task. */
export function completeWorkDelivery(save: WorkDeliverySave, context: WorkDeliveryContext): WorkDeliveryCompletionResult {
  const { config, artifactId, pipeline, deployment, verification } = context;
  const expectedPipeline = runWorkDelivery(config, artifactId);
  const expectedDeployment = publishWorkDelivery(config, artifactId, pipeline);
  const expectedVerification = verifyWorkDeployment(deployment, config, artifactId);
  if (!expectedPipeline.canPublish || !samePipeline(pipeline, expectedPipeline)
    || !sameDeployment(deployment, expectedDeployment) || !expectedVerification.ok
    || !verification || verification.phase !== "verification" || !verification.ok || verification.environment !== "staging"
    || verification.artifactId !== artifactId || verification.fingerprint !== expectedVerification.fingerprint
    || verification.homeStatus !== 200 || verification.checkoutStatus !== 201) {
    return { ok: false, save, message: "Confira a sequência para o artefato atual: verificações completas, publicação em homologação e pedido conferido depois da publicação." };
  }
  return {
    ok: true,
    save: { ...decodeSave(save), selectedArtifact: artifactId, completed: true },
    message: "Nina recebeu a entrega: artefato verificado, publicado e conferido em homologação. Produção permanece sem alterações.",
  };
}
