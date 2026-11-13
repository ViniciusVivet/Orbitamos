import { describe, expect, it, vi } from "vitest";
import {
  WORK_ARTIFACT_IDS, WORK_DELIVERY_CHECKS, WORK_DELIVERY_CONFIG_LIMIT, WORK_DELIVERY_SAVE_LIMIT, WORK_DELIVERY_STARTER_CODE,
  completeWorkDelivery, emptyWorkDeliverySave, getWorkArtifact, mergeWorkDeliverySave, parseWorkDeliveryConfig,
  publishWorkDelivery, readWorkDeliverySave, runWorkDelivery, verifyWorkDeployment, workArtifacts, workDeliveryKey,
  type WorkArtifactId, type WorkDeliveryConfig, type WorkDeliveryContext,
  type WorkDeploymentResult, type WorkDeploymentVerification,
} from "./workDelivery";

const fullConfig = (): WorkDeliveryConfig => ({ environment: "staging", checks: ["home", "checkout"] });
const homeConfig = (): WorkDeliveryConfig => ({ environment: "staging", checks: ["home"] });
const source = (checks: unknown, environment: unknown = "staging") => JSON.stringify({ environment, checks });
const validContext = (): WorkDeliveryContext => {
  const config = fullConfig(), artifactId = "loja-015";
  const pipeline = runWorkDelivery(config, artifactId);
  const deployment = publishWorkDelivery(config, artifactId, pipeline);
  return { config, artifactId, pipeline, deployment, verification: verifyWorkDeployment(deployment, config, artifactId) };
};

describe("A esteira de homologação: arquivo e artefatos", () => {
  it("mantém dois artefatos imutáveis com o defeito e a correção observáveis", () => {
    expect(WORK_ARTIFACT_IDS).toEqual(["loja-014", "loja-015"]);
    expect(WORK_DELIVERY_CHECKS).toEqual(["home", "checkout"]);
    expect(workArtifacts).toHaveLength(2);
    expect(getWorkArtifact("loja-014")).toMatchObject({ environment: "staging", ordersBaseUrl: "http://orders:3001", homeStatus: 200, checkoutStatus: 502 });
    expect(getWorkArtifact("loja-015")).toMatchObject({ environment: "staging", ordersBaseUrl: "http://orders:3000", homeStatus: 200, checkoutStatus: 201 });
    expect(Object.isFrozen(workArtifacts)).toBe(true);
    for (const artifact of workArtifacts) {
      expect(Object.isFrozen(artifact)).toBe(true);
      expect(() => Object.assign(artifact, { checkoutStatus: 201 })).toThrow(TypeError);
    }
    expect(getWorkArtifact("loja-014").checkoutStatus).toBe(502);
  });

  it("lê campos reais e ordena verificações equivalentes sem comparar texto", () => {
    expect(parseWorkDeliveryConfig(WORK_DELIVERY_STARTER_CODE)).toMatchObject({ ok: true, config: homeConfig() });
    for (const text of [
      source(["home", "checkout"]), source(["checkout", "home"]),
      ' \n { "checks" : [ "checkout", "home" ], "environment" : "staging" } \t',
      '{"environ\\u006dent":"staging","checks":["ho\\u006de","checkout"]}',
    ]) expect(parseWorkDeliveryConfig(text), text).toMatchObject({ ok: true, config: fullConfig() });
    expect(parseWorkDeliveryConfig(source(["checkout"]))).toMatchObject({ ok: true, config: { environment: "staging", checks: ["checkout"] } });
    const padded = source(["home"]).padEnd(WORK_DELIVERY_CONFIG_LIMIT, " ");
    expect(parseWorkDeliveryConfig(padded).ok).toBe(true);
    expect(parseWorkDeliveryConfig(padded + " ").ok).toBe(false);
  });

  it("rejeita ambientes, checks, coerções, comandos, URLs e propriedades fora do contrato", () => {
    for (const text of [
      "", " ", "{", "null", "[]", "42", "false", '"home"', "fetch('/api')", "eval('home')", "ls && deploy",
      '{environment:"staging",checks:["home"]}', '{"environment":"staging","checks":["home"],}',
      '{"environment":"staging"}', '{"checks":["home"]}',
      '{"environment":"staging","checks":["home"],"ordersBaseUrl":"http://orders:3000"}',
      '{"environment":"staging","checks":["home"],"command":"npm test"}',
      '{"environment":"staging","checks":["home"],"__proto__":{"polluted":true}}',
      source(["home"], "production"), source(["home"], "Staging"), source(["home"], null),
      source("home"), source({ home: true }), source(null), source([]), source(["home", "home"]),
      source(["home", "checkout", "home"]), source(["Home"]), source(["HOME"]), source(["checkout", "Checkout"]),
      source(["http://orders:3000"]), source(["https://outside.invalid"]), source(["fetch('/api')"]),
      source(["rm -rf /"]), source([1]), source([true]), source([null]), source([["home"]]),
    ]) expect(parseWorkDeliveryConfig(text), text).toMatchObject({ ok: false });
    expect(parseWorkDeliveryConfig(" ".repeat(WORK_DELIVERY_CONFIG_LIMIT + 1))).toMatchObject({ ok: false });
    expect(parseWorkDeliveryConfig(undefined as unknown as string)).toMatchObject({ ok: false });
  });

  it("não solicita endereços nem executa texto ao testar, publicar, conferir e entregar", () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(() => { throw new Error("A esteira deve permanecer local"); });
    try {
      expect(parseWorkDeliveryConfig(source(["http://orders:3000"])).ok).toBe(false);
      const context = validContext();
      expect(completeWorkDelivery(emptyWorkDeliverySave(), context).ok).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    } finally { fetch.mockRestore(); }
  });
});

describe("A esteira de homologação: verde, cobertura e publicação", () => {
  it("mostra o falso verde da home sem autorizar publicação de nenhum artefato", () => {
    for (const artifactId of WORK_ARTIFACT_IDS) {
      const config = homeConfig();
      const pipeline = runWorkDelivery(config, artifactId);
      expect(pipeline).toMatchObject({ allChecksPassed: true, coverageComplete: false, canPublish: false, checks: [{ id: "home", ok: true, status: 200 }] });
      expect(pipeline.lines.join("\n")).toContain("Uma home verde não confirma o pedido");
      const deployment = publishWorkDelivery(config, artifactId, pipeline);
      expect(deployment.ok).toBe(false);
      const verification = verifyWorkDeployment(deployment, config, artifactId);
      expect(verification).toMatchObject({ ok: false, homeStatus: 503, checkoutStatus: 503 });
      expect(completeWorkDelivery(emptyWorkDeliverySave(), { config, artifactId, pipeline, deployment, verification }).ok).toBe(false);
    }
  });

  it("incluir checkout revela o defeito do artefato 014; apagar o teste não resolve o defeito", () => {
    const failed = runWorkDelivery(fullConfig(), "loja-014");
    expect(failed).toMatchObject({ allChecksPassed: false, coverageComplete: true, canPublish: false, checks: [
      { id: "home", ok: true, status: 200 }, { id: "checkout", ok: false, status: 502 },
    ] });
    expect(failed.lines.join("\n")).toContain("POST /checkout → 502");
    expect(publishWorkDelivery(fullConfig(), "loja-014", failed).ok).toBe(false);
    const removed = runWorkDelivery(homeConfig(), "loja-014");
    expect(removed.allChecksPassed).toBe(true); expect(removed.canPublish).toBe(false);
    expect(getWorkArtifact("loja-014").checkoutStatus).toBe(502);
  });

  it("exige também a home e libera somente o artefato corrigido com ambos os checks", () => {
    const onlyCheckout: WorkDeliveryConfig = { environment: "staging", checks: ["checkout"] };
    expect(runWorkDelivery(onlyCheckout, "loja-015")).toMatchObject({ allChecksPassed: true, coverageComplete: false, canPublish: false });
    const config = fullConfig(), before = JSON.stringify(config);
    const pipeline = runWorkDelivery(config, "loja-015");
    expect(pipeline).toMatchObject({ phase: "pipeline", environment: "staging", allChecksPassed: true, coverageComplete: true, canPublish: true, checks: [
      { id: "home", ok: true, status: 200 }, { id: "checkout", ok: true, status: 201 },
    ] });
    expect(runWorkDelivery(config, "loja-015")).toEqual(pipeline);
    expect(pipeline.lines.at(-1)).toBe("Produção: sem alterações.");
    expect(JSON.stringify(config)).toBe(before);
    const reversed: WorkDeliveryConfig = { environment: "staging", checks: ["checkout", "home"] };
    expect(runWorkDelivery(reversed, "loja-015")).toEqual(pipeline);
  });

  it("vincula a evidência ao artefato e à configuração e rejeita resultados antigos ou incompletos", () => {
    const config = fullConfig();
    const pipeline = runWorkDelivery(config, "loja-015");
    const homeOnly = runWorkDelivery(homeConfig(), "loja-015");
    const broken = runWorkDelivery(config, "loja-014");
    expect(pipeline.fingerprint).not.toBe(homeOnly.fingerprint);
    expect(pipeline.fingerprint).not.toBe(broken.fingerprint);
    for (const evidence of [null, homeOnly, broken, { ...pipeline, fingerprint: "antigo" }, { ...pipeline, checks: pipeline.checks.slice(0, 1) }, { ...pipeline, coverageComplete: false }]) {
      expect(publishWorkDelivery(config, "loja-015", evidence).ok).toBe(false);
    }
    expect(publishWorkDelivery(config, "loja-014", pipeline).ok).toBe(false);
    expect(publishWorkDelivery(homeConfig(), "loja-015", pipeline).ok).toBe(false);
    const forged = { ...broken, allChecksPassed: true, canPublish: true };
    expect(publishWorkDelivery(config, "loja-014", forged).ok).toBe(false);
    expect(publishWorkDelivery(config, "loja-015", pipeline)).toMatchObject({ phase: "deployment", ok: true, environment: "staging", artifactId: "loja-015", fingerprint: pipeline.fingerprint });
  });

  it("recusa configurações inválidas também nas chamadas diretas do runtime", () => {
    const valid = runWorkDelivery(fullConfig(), "loja-015");
    for (const config of [
      { ...fullConfig(), environment: "production" }, { ...fullConfig(), command: "deploy" },
      { environment: "staging", checks: [] }, { environment: "staging", checks: ["home", "home"] },
      { environment: "staging", checks: ["HOME", "checkout"] }, { environment: "staging", checks: ["http://orders:3000"] },
      { environment: "staging", checks: Array(1) }, null,
    ]) {
      const current = config as WorkDeliveryConfig;
      expect(runWorkDelivery(current, "loja-015")).toMatchObject({ allChecksPassed: false, coverageComplete: false, canPublish: false });
      expect(publishWorkDelivery(current, "loja-015", valid).ok).toBe(false);
    }
    expect(runWorkDelivery(fullConfig(), "unknown" as WorkArtifactId).canPublish).toBe(false);
  });
});

describe("A esteira de homologação: verificação depois da publicação e revisão", () => {
  it("separa publicar, conferir no destino e enviar para Nina", () => {
    const save = emptyWorkDeliverySave(), context = validContext();
    expect(context.deployment?.ok).toBe(true); expect(save.completed).toBe(false);
    expect(context.verification).toMatchObject({ phase: "verification", ok: true, homeStatus: 200, checkoutStatus: 201, environment: "staging" });
    expect(context.verification?.lines.at(-1)).toBe("Produção: sem alterações.");
    for (const missing of ["pipeline", "deployment", "verification"] as const) {
      const result = completeWorkDelivery(save, { ...context, [missing]: null });
      expect(result.ok).toBe(false); expect(result.save).toBe(save);
    }
    const accepted = completeWorkDelivery(save, context);
    expect(accepted.ok).toBe(true); expect(accepted.save.completed).toBe(true); expect(save.completed).toBe(false);
    expect(accepted.save.selectedArtifact).toBe("loja-015"); expect(save.selectedArtifact).toBe("loja-014");
    expect(completeWorkDelivery(accepted.save, context).save).toEqual(accepted.save);
  });

  it("não confunde o resultado da esteira com uma publicação ou um smoke posterior", () => {
    const context = validContext();
    expect(verifyWorkDeployment(null, context.config, context.artifactId).ok).toBe(false);
    expect(verifyWorkDeployment(context.pipeline as unknown as WorkDeploymentResult, context.config, context.artifactId).ok).toBe(false);
    expect(completeWorkDelivery(emptyWorkDeliverySave(), {
      ...context, verification: context.pipeline as unknown as WorkDeploymentVerification,
    }).ok).toBe(false);
    expect(completeWorkDelivery(emptyWorkDeliverySave(), {
      ...context, deployment: context.verification as unknown as WorkDeploymentResult,
    }).ok).toBe(false);
  });

  it("uma troca de artefato ou checks invalida publicação e smoke antigos", () => {
    const context = validContext();
    expect(verifyWorkDeployment(context.deployment, context.config, "loja-014")).toMatchObject({ ok: false, homeStatus: 503, checkoutStatus: 503 });
    expect(verifyWorkDeployment(context.deployment, homeConfig(), context.artifactId).ok).toBe(false);
    expect(completeWorkDelivery(emptyWorkDeliverySave(), { ...context, artifactId: "loja-014" }).ok).toBe(false);
    expect(completeWorkDelivery(emptyWorkDeliverySave(), { ...context, config: homeConfig() }).ok).toBe(false);
    const equivalent: WorkDeliveryConfig = { environment: "staging", checks: ["checkout", "home"] };
    expect(verifyWorkDeployment(context.deployment, equivalent, context.artifactId).ok).toBe(true);
    expect(completeWorkDelivery(emptyWorkDeliverySave(), { ...context, config: equivalent }).ok).toBe(true);
  });

  it("revalida os fatos e fingerprints sem aceitar status ou ambiente adulterados", () => {
    const context = validContext();
    const pipeline = context.pipeline!, deployment = context.deployment!, verification = context.verification!;
    const mutations: Partial<WorkDeliveryContext>[] = [
      { pipeline: { ...pipeline, checks: [{ id: "home", ok: true, status: 200 }, { id: "checkout", ok: false, status: 502 }] } },
      { pipeline: { ...pipeline, canPublish: false } },
      { deployment: { ...deployment, ok: false } },
      { deployment: { ...deployment, fingerprint: "outra publicação" } },
      { deployment: { ...deployment, environment: "production" } as unknown as WorkDeploymentResult },
      { verification: { ...verification, ok: false } },
      { verification: { ...verification, fingerprint: "outro smoke" } },
      { verification: { ...verification, homeStatus: 503 } },
      { verification: { ...verification, checkoutStatus: 502 } },
      { verification: { ...verification, artifactId: "loja-014" } },
      { verification: { ...verification, environment: "production" } as unknown as WorkDeploymentVerification },
      { config: { ...context.config, environment: "production" } as unknown as WorkDeliveryConfig },
    ];
    for (const mutation of mutations) expect(completeWorkDelivery(emptyWorkDeliverySave(), { ...context, ...mutation }).ok).toBe(false);
  });
});

describe("A esteira de homologação: histórico independente por conta", () => {
  it("isola contas, tipos e caracteres sem reutilizar chaves das missões anteriores", () => {
    expect(workDeliveryKey("alice")).toBe("orbitamos-work-delivery-v1-s-%22alice%22");
    expect(workDeliveryKey("alice")).not.toBe(workDeliveryKey("bob"));
    expect(workDeliveryKey(1)).not.toBe(workDeliveryKey("1"));
    expect(workDeliveryKey("a/b")).not.toBe(workDeliveryKey("a%2Fb"));
    expect(workDeliveryKey(" alice ")).not.toBe(workDeliveryKey("alice"));
    expect(workDeliveryKey("\ud800")).not.toBe(workDeliveryKey("\\ud800"));
    expect(workDeliveryKey("alice")).not.toContain("work-simulation-v1");
    for (const invalid of ["", " ", "x".repeat(257), NaN, Infinity, .5, null, undefined]) {
      expect(() => workDeliveryKey(invalid as string)).toThrow(TypeError);
    }
  });

  it("recupera armazenamento inválido ou grande sem importar conquistas anteriores", () => {
    for (const raw of [null, "", "{", "null", "[]", "42", '{"version":2}', " ".repeat(WORK_DELIVERY_SAVE_LIMIT + 1)]) {
      expect(readWorkDeliverySave(raw)).toEqual(emptyWorkDeliverySave());
    }
    expect(readWorkDeliverySave(JSON.stringify({ version: 1, current: "checkout-transfer", completed: ["checkout-staging", "checkout-transfer"], drafts: {}, attempts: {} }))).toEqual(emptyWorkDeliverySave());
    const first = emptyWorkDeliverySave(); first.draft = "alteração"; first.completed = true;
    expect(emptyWorkDeliverySave()).not.toEqual(first);
  });

  it("recupera o draft e a seleção, mas descarta toda evidência e publicação em runtime", () => {
    const context = validContext();
    const save = readWorkDeliverySave(JSON.stringify({
      version: 1, draft: "{ arquivo incompleto", selectedArtifact: "loja-015", attempts: 3, completed: false,
      config: context.config, pipeline: context.pipeline, deployment: context.deployment, verification: context.verification,
      published: true, xp: 999, secret: "não restaurar",
    }));
    expect(save).toEqual({ version: 1, draft: "{ arquivo incompleto", selectedArtifact: "loja-015", attempts: 3, completed: false });
    expect(Object.keys(save).sort()).toEqual(["attempts", "completed", "draft", "selectedArtifact", "version"]);
    expect(completeWorkDelivery(save, { config: fullConfig(), artifactId: save.selectedArtifact, pipeline: null, deployment: null, verification: null }).ok).toBe(false);
    expect(readWorkDeliverySave(JSON.stringify(save))).toEqual(save);
    const history = completeWorkDelivery(save, context).save;
    expect(readWorkDeliverySave(JSON.stringify(history)).completed).toBe(true);
    expect(completeWorkDelivery(history, { ...context, verification: null }).ok).toBe(false);
  });

  it("limita rascunhos e contadores e mantém roundtrip mesmo com caracteres escapados", () => {
    expect(readWorkDeliverySave(JSON.stringify({ version: 1, draft: "x".repeat(WORK_DELIVERY_CONFIG_LIMIT + 50), selectedArtifact: "unknown", attempts: 20000, completed: "true" }))).toEqual({
      version: 1, draft: "x".repeat(WORK_DELIVERY_CONFIG_LIMIT), selectedArtifact: "loja-014", attempts: 10000, completed: false,
    });
    for (const attempts of [-2, .5, "3", null]) {
      expect(readWorkDeliverySave(JSON.stringify({ version: 1, attempts })).attempts).toBe(0);
    }
    const escaped = { ...emptyWorkDeliverySave(), draft: "\u0000".repeat(WORK_DELIVERY_CONFIG_LIMIT), completed: true };
    expect(readWorkDeliverySave(JSON.stringify(escaped))).toEqual(escaped);
  });

  it("uma aba antiga preserva conquista e tentativas sem apagar o draft e a seleção ativos", () => {
    const active = { ...emptyWorkDeliverySave(), draft: "{ rascunho ativo", selectedArtifact: "loja-014" as const, attempts: 2 };
    const previous = { ...completeWorkDelivery(emptyWorkDeliverySave(), validContext()).save, selectedArtifact: "loja-015" as const, attempts: 5 };
    const beforeActive = JSON.stringify(active), beforePrevious = JSON.stringify(previous);
    const merged = mergeWorkDeliverySave(active, previous);
    expect(merged).toEqual({ ...active, attempts: 5, completed: true });
    expect(JSON.stringify(active)).toBe(beforeActive); expect(JSON.stringify(previous)).toBe(beforePrevious);
    expect(mergeWorkDeliverySave({ ...active, attempts: 9 }, previous).attempts).toBe(9);
    expect(mergeWorkDeliverySave(previous, active).completed).toBe(true);
  });
});
