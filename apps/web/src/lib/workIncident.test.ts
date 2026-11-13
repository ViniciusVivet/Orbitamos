import { describe, expect, it, vi } from "vitest";
import { applyIncidentRecovery, completeIncidentCase, emptyIncidentSave, getIncidentCase, incidentCases, incidentSaveKey, INCIDENT_PLAN_LIMIT, INCIDENT_SAVE_LIMIT, mergeIncidentSave, parseIncidentPlan, readIncidentSave, verifyIncidentRecovery, type IncidentCaseId, type IncidentPlan } from "./workIncident";

const plan = (targetArtifact: string, caseId: IncidentCaseId = "release-regression"): IncidentPlan => {
  const result = parseIncidentPlan(JSON.stringify({ environment: "staging", targetArtifact }), caseId);
  if (!result.ok) throw Error(result.message);
  return result.config;
};
const evidence = (caseId: IncidentCaseId = "release-regression") => {
  const config = plan(getIncidentCase(caseId).healthyArtifact, caseId);
  const recovery = applyIncidentRecovery(config, caseId);
  return { caseId, config, recovery, verification: verifyIncidentRecovery(recovery, config, caseId), reason: "verified-orders" as const };
};

describe("simulação de recuperação por evidências", () => {
  it("mantém histórico e versões imutáveis, com endereço igual e sinais diferentes", () => {
    for (const scenario of incidentCases) {
      expect(Object.isFrozen(scenario)).toBe(true);
      expect(Object.isFrozen(scenario.artifacts)).toBe(true);
      expect(scenario.artifacts.every(item => Object.isFrozen(item) && item.ordersBaseUrl === "http://orders:3000" && item.homeStatus === 200)).toBe(true);
      expect(scenario.artifacts.filter(item => item.checkoutStatus === 201).map(item => item.id)).toEqual([scenario.healthyArtifact]);
    }
  });
  it("aceita JSON equivalente e apenas versões conhecidas do caso", () => {
    expect(parseIncidentPlan(' { "targetArtifact":"loja-020", "environment":"staging" } ', "release-regression")).toMatchObject({ ok: true, config: plan("loja-020") });
    expect(parseIncidentPlan(JSON.stringify(plan("loja-020")), "independent-recovery").ok).toBe(false);
  });
  it("rejeita produção, chaves extras, URLs, coerção, JSON inválido e limite excedido", () => {
    const invalid = ["", "[]", "{", '{"environment":"production","targetArtifact":"loja-020"}', '{"environment":"staging","targetArtifact":"http://orders:3000"}', '{"environment":"staging","targetArtifact":20}', '{"environment":"staging","targetArtifact":"loja-020","command":"echo ok"}', " ".repeat(INCIDENT_PLAN_LIMIT + 1)];
    for (const value of invalid) expect(parseIncidentPlan(value, "release-regression").ok).toBe(false);
  });
  it("permite instalar versão válida defeituosa, sem declarar recuperação", () => {
    for (const target of ["loja-019", "loja-021"]) {
      const config = plan(target), recovery = applyIncidentRecovery(config, "release-regression");
      expect(recovery.ok).toBe(true);
      const result = verifyIncidentRecovery(recovery, config, "release-regression");
      expect(result).toMatchObject({ applied: true, homeStatus: 200, checkoutStatus: 500, healthy: false, ok: false });
      expect(completeIncidentCase(emptyIncidentSave(), { caseId: "release-regression", config, recovery, verification: result, reason: "verified-orders" }).ok).toBe(false);
    }
  });
  it("editar plano não instala e o alerta inicial permanece sem aplicação", () => {
    const result = verifyIncidentRecovery(null, plan("loja-020"), "release-regression");
    expect(result).toMatchObject({ artifactId: "loja-021", applied: false, healthy: false, ok: false, checkoutStatus: 500 });
  });
  it("conserva sinais da instalação real quando o plano informado mudou", () => {
    const context = evidence();
    const result = verifyIncidentRecovery(context.recovery, plan("loja-021"), "release-regression");
    expect(result).toMatchObject({ artifactId: "loja-020", checkoutStatus: 201, healthy: true, matchesPlan: false, ok: false });
    expect(completeIncidentCase(emptyIncidentSave(), { ...context, config: plan("loja-021") }).ok).toBe(false);
  });
  it("exige conferência posterior e justificativa útil, não apenas aplicar ou abrir a home", () => {
    const context = evidence();
    expect(completeIncidentCase(emptyIncidentSave(), { ...context, verification: null }).ok).toBe(false);
    for (const reason of [null, "home-opened", "highest-version"] as const) expect(completeIncidentCase(emptyIncidentSave(), { ...context, reason }).ok).toBe(false);
    const result = completeIncidentCase(emptyIncidentSave(), context);
    expect(result).toMatchObject({ ok: true, save: { completed: ["release-regression"], current: "independent-recovery" } });
    expect(completeIncidentCase(result.save, context).save.completed).toEqual(["release-regression"]);
  });
  it("não reutiliza evidência de outra instalação ou snapshot adulterado", () => {
    const context = evidence(), transfer = evidence("independent-recovery");
    const save = completeIncidentCase(emptyIncidentSave(), context).save;
    expect(completeIncidentCase(save, { ...transfer, verification: context.verification }).ok).toBe(false);
    expect(completeIncidentCase(save, { ...transfer, recovery: context.recovery }).ok).toBe(false);
    expect(completeIncidentCase(emptyIncidentSave(), { ...context, recovery: { ...context.recovery, after: { ...context.recovery.after, errorsPer10: 3 } } }).ok).toBe(false);
    expect(completeIncidentCase(emptyIncidentSave(), { ...context, verification: { ...context.verification, checkoutStatus: 500 } }).ok).toBe(false);
  });
  it("bloqueia pular a primeira ocorrência e aceita nova versão saudável na transferência", () => {
    expect(completeIncidentCase(emptyIncidentSave(), evidence("independent-recovery")).ok).toBe(false);
    const first = completeIncidentCase(emptyIncidentSave(), evidence());
    const second = completeIncidentCase(first.save, evidence("independent-recovery"));
    expect(second).toMatchObject({ ok: true, save: { completed: ["release-regression", "independent-recovery"] } });
  });
  it("isola contas e tipos de identidade sem colidir com saves anteriores", () => {
    expect(incidentSaveKey(123)).not.toBe(incidentSaveKey("123"));
    expect(incidentSaveKey("a/b")).not.toBe(incidentSaveKey("a_b"));
    expect(incidentSaveKey("a")).toMatch(/^orbitamos-work-incident-v1-/);
    for (const value of ["", " ", "a".repeat(257), Number.NaN]) expect(() => incidentSaveKey(value)).toThrow();
  });
  it("restaura rascunho e conquistas sem evidências ou instalação ativa", () => {
    const context = evidence(), completed = completeIncidentCase(emptyIncidentSave(), context).save;
    completed.drafts["release-regression"] = "{rascunho inválido";
    const saved = readIncidentSave(JSON.stringify({ ...completed, recovery: context.recovery, verification: context.verification, reason: context.reason }));
    expect(saved).toEqual(completed);
    expect(Object.keys(saved).sort()).toEqual(["version", "current", "completed", "drafts", "attempts"].sort());
    expect(verifyIncidentRecovery(null, context.config, context.caseId).ok).toBe(false);
  });
  it("limita dados, bloqueia prefixo falso e preserva conquistas em aba antiga", () => {
    expect(readIncidentSave("x".repeat(INCIDENT_SAVE_LIMIT + 1))).toEqual(emptyIncidentSave());
    expect(readIncidentSave('{"version":2}')).toEqual(emptyIncidentSave());
    expect(readIncidentSave(JSON.stringify({ ...emptyIncidentSave(), completed: ["independent-recovery"], current: "independent-recovery" })).completed).toEqual([]);
    const next = emptyIncidentSave(); next.drafts["release-regression"] = "meu texto";
    const prior = completeIncidentCase(emptyIncidentSave(), evidence()).save; prior.attempts["release-regression"] = 12;
    const merged = mergeIncidentSave(next, prior);
    expect(merged.completed).toEqual(["release-regression"]); expect(merged.drafts["release-regression"]).toBe("meu texto"); expect(merged.attempts["release-regression"]).toBe(12);
  });
  it("não faz requisições nem executa texto durante o ciclo", () => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    try { completeIncidentCase(emptyIncidentSave(), evidence()); expect(fetch).not.toHaveBeenCalled(); }
    finally { vi.unstubAllGlobals(); }
  });
});
