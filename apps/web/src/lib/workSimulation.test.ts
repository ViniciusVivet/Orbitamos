import { describe, expect, it, vi } from "vitest";
import {
  WORK_CASE_IDS, WORK_CONFIG_LIMIT, WORK_SAVE_LIMIT, completeWorkCase, emptyWorkSave,
  getWorkCase, mergeWorkSave, parseWorkConfig, readWorkSave, testWorkCheckout, workCases,
  workSimulationKey, type WorkCaseId, type WorkConfig, type WorkTestResult,
} from "./workSimulation";

const config = (port: number): WorkConfig => ({ environment: "staging", ordersBaseUrl: `http://orders:${port}` });
const source = (url: unknown, environment: unknown = "staging") => JSON.stringify({ environment, ordersBaseUrl: url });

function completeFirst() {
  return completeWorkCase(emptyWorkSave(), "checkout-staging", config(3000), testWorkCheckout(config(3000), "checkout-staging")).save;
}

describe("Simulação de trabalho: arquivo de homologação", () => {
  it("interpreta propriedades reais com ordem, espaços e endereço de raiz equivalentes", () => {
    for (const input of [
      source("http://orders:3000"),
      source("http://orders:3000/"),
      source("HTTP://ORDERS:03000/"),
      ' \n { "ordersBaseUrl" : "http://orders:3000",\n "environment" : "staging" } \t',
      '{"environ\\u006dent":"staging","ordersBaseUrl":"http://orders:3000"}',
    ]) {
      expect(parseWorkConfig(input), input).toMatchObject({ ok: true, config: config(3000) });
    }
    expect(parseWorkConfig(source("http://orders/"))).toMatchObject({ ok: true, config: config(80) });
    expect(parseWorkConfig(source("http://orders:00080"))).toMatchObject({ ok: true, config: config(80) });
  });

  it("aceita portas válidas que ainda não resolvem o problema", () => {
    for (const port of [1, 80, 3001, 4100, 65535]) {
      expect(parseWorkConfig(source(`http://orders:${port}`))).toMatchObject({ ok: true, config: config(port) });
    }
    for (const scenario of workCases) {
      expect(parseWorkConfig(scenario.starterCode)).toMatchObject({ ok: true, config: scenario.initialConfig });
      expect(testWorkCheckout(scenario.initialConfig, scenario.id)).toMatchObject({ ok: false, homeStatus: 200, checkoutStatus: 502 });
    }
  });

  it("rejeita sintaxe inválida, campos extras, coerção e outros ambientes", () => {
    for (const input of [
      "", " ", "{", "null", "[]", "true", "42", '"config"', "fetch('/api')",
      '{environment:"staging",ordersBaseUrl:"http://orders:3000"}',
      '{"environment":"staging","ordersBaseUrl":"http://orders:3000",}',
      '{"environment":"staging"}', '{"ordersBaseUrl":"http://orders:3000"}',
      '{"environment":"staging","ordersBaseUrl":"http://orders:3000","command":"rm"}',
      '{"environment":"staging","ordersBaseUrl":"http://orders:3000","__proto__":{"polluted":true}}',
      source("http://orders:3000", "production"), source("http://orders:3000", "Staging"),
      source("http://orders:3000", null), source(3000), source({ url: "http://orders:3000" }),
    ]) expect(parseWorkConfig(input), input).toMatchObject({ ok: false });
    expect(parseWorkConfig(" ".repeat(WORK_CONFIG_LIMIT + 1))).toMatchObject({ ok: false });
    expect(parseWorkConfig(source(`http://orders:${"0".repeat(200)}3000`))).toMatchObject({ ok: false });
    expect(parseWorkConfig(null as unknown as string)).toMatchObject({ ok: false });
  });

  it("mantém o endereço dentro do serviço virtual sem credenciais nem desvios", () => {
    for (const url of [
      "https://orders:3000", "ftp://orders:3000", "javascript:alert(1)", "//orders:3000",
      "http://example.com:3000", "http://localhost:3000", "http://127.0.0.1:3000",
      "http://orders.example.com:3000", "http://orders.:3000", "http://orders@evil:3000",
      "http://alice:secret@orders:3000", "http://@orders:3000", "http://orders:3000@evil",
      "http://orders:3000/orders", "http://orders:3000/?token=secret", "http://orders:3000?",
      "http://orders:3000/#section", "http://orders:3000#", "http://orders:3000\\",
      "http://orders:3000\n", " http://orders:3000", "http://ord\ters:3000",
      "http://orders:0", "http://orders:65536", "http://orders:-1", "http://orders:3.0",
      "http://orders:3e3", "http://orders:NaN", "http://orders:Infinity", "http://orders:",
    ]) expect(parseWorkConfig(source(url)), url).toMatchObject({ ok: false });
  });

  it("não faz requisições ao interpretar, testar ou concluir um ticket", () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(() => { throw new Error("Uma simulação local não deve chamar a rede"); });
    try {
      const parsed = parseWorkConfig(source("http://orders:3000"));
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) throw new Error("Configuração de teste inválida");
      const result = testWorkCheckout(parsed.config, "checkout-staging");
      expect(completeWorkCase(emptyWorkSave(), "checkout-staging", parsed.config, result).ok).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    } finally { fetch.mockRestore(); }
  });
});

describe("Simulação de trabalho: consequência, transferência e evidência", () => {
  it("mantém a home acessível e muda o pedido conforme a porta aplicada", () => {
    const initial = getWorkCase("checkout-staging").initialConfig;
    const before = JSON.stringify(initial);
    const failed = testWorkCheckout(initial, "checkout-staging");
    expect(failed).toMatchObject({ ok: false, homeStatus: 200, checkoutStatus: 502, caseId: "checkout-staging" });
    expect(failed.lines.join("\n")).toContain("conexão recusada");
    const passed = testWorkCheckout(config(3000), "checkout-staging");
    expect(passed).toMatchObject({ ok: true, homeStatus: 200, checkoutStatus: 201 });
    expect(passed.lines.join("\n")).toContain("pedido de teste concluído");
    expect(passed.lines.at(-1)).toBe("Produção: sem alterações.");
    expect(testWorkCheckout(config(3000), "checkout-staging")).toEqual(passed);
    expect(JSON.stringify(initial)).toBe(before);
  });

  it("faz a segunda instalação exigir investigação em vez de decorar 3000", () => {
    expect(WORK_CASE_IDS).toEqual(["checkout-staging", "checkout-transfer"]);
    expect(workCases).toHaveLength(2);
    expect(getWorkCase("checkout-transfer").servicePort).toBe(4100);
    expect(testWorkCheckout(config(3000), "checkout-transfer")).toMatchObject({ ok: false, checkoutStatus: 502 });
    expect(testWorkCheckout(config(4100), "checkout-transfer")).toMatchObject({ ok: true, checkoutStatus: 201 });
    expect(testWorkCheckout(config(4100), "checkout-staging").ok).toBe(false);
    expect(getWorkCase("checkout-transfer").hints.length).toBeLessThan(getWorkCase("checkout-staging").hints.length);
  });

  it("exige o teste correto do caso e da configuração aplicada atualmente", () => {
    const start = emptyWorkSave();
    const valid = testWorkCheckout(config(3000), "checkout-staging");
    const failed = testWorkCheckout(config(3001), "checkout-staging");
    for (const [applied, evidence] of [
      [config(3000), null], [config(3000), failed], [config(3001), valid],
      [config(3000), testWorkCheckout(config(4100), "checkout-transfer")],
      [config(3001), { ...failed, ok: true, checkoutStatus: 201 }],
      [config(3000), { ...valid, checkoutStatus: 502 }],
      [config(3000), { ...valid, fingerprint: "outro artefato" }],
    ] as [WorkConfig, WorkTestResult | null][]) {
      const result = completeWorkCase(start, "checkout-staging", applied, evidence);
      expect(result.ok).toBe(false); expect(result.save).toBe(start);
    }
    expect(start.completed).toEqual([]);
    const equivalent = { environment: "staging", ordersBaseUrl: "HTTP://ORDERS:03000/" } as WorkConfig;
    expect(completeWorkCase(start, "checkout-staging", equivalent, valid).ok).toBe(true);
  });

  it("não aceita evidência inventada para configurações fora do escopo", () => {
    const valid = testWorkCheckout(config(3000), "checkout-staging");
    for (const invalid of [
      { ...config(3000), environment: "production" },
      { ...config(3000), ordersBaseUrl: "http://localhost:3000" },
      { ...config(3000), extra: true },
    ]) {
      expect(testWorkCheckout(invalid as WorkConfig, "checkout-staging").ok).toBe(false);
      expect(completeWorkCase(emptyWorkSave(), "checkout-staging", invalid as WorkConfig, valid).ok).toBe(false);
    }
    expect(completeWorkCase(emptyWorkSave(), "unknown" as WorkCaseId, config(3000), valid).ok).toBe(false);
  });

  it("registra cada ticket na ordem e preserva conquistas em novas tentativas", () => {
    const start = emptyWorkSave();
    const transfer = testWorkCheckout(config(4100), "checkout-transfer");
    expect(completeWorkCase(start, "checkout-transfer", config(4100), transfer).ok).toBe(false);
    const first = completeFirst();
    expect(first).toMatchObject({ current: "checkout-transfer", completed: ["checkout-staging"] });
    expect(start.completed).toEqual([]);
    const second = completeWorkCase(first, "checkout-transfer", config(4100), transfer);
    expect(second.ok).toBe(true); expect(second.save.completed).toEqual([...WORK_CASE_IDS]);
    expect(completeWorkCase(second.save, "checkout-transfer", config(4100), transfer).save).toEqual(second.save);
    expect(completeWorkCase(second.save, "checkout-staging", config(3001), null).save.completed).toEqual([...WORK_CASE_IDS]);
  });
});

describe("Simulação de trabalho: progresso próprio por conta", () => {
  it("separa contas, tipos e caracteres sem colidir com saves de outros jogos", () => {
    expect(workSimulationKey("alice")).not.toBe(workSimulationKey("bob"));
    expect(workSimulationKey(1)).not.toBe(workSimulationKey("1"));
    expect(workSimulationKey("a/b")).not.toBe(workSimulationKey("a%2Fb"));
    expect(workSimulationKey(" alice ")).not.toBe(workSimulationKey("alice"));
    expect(workSimulationKey("\ud800")).not.toBe(workSimulationKey("\\ud800"));
    expect(workSimulationKey("alice")).toMatch(/^orbitamos-work-simulation-v1-/);
    expect(workSimulationKey("alice")).not.toMatch(/orbi-pulse|chapter|journal/);
    for (const invalid of ["", "  ", "x".repeat(257), NaN, Infinity, .5, undefined, null]) {
      expect(() => workSimulationKey(invalid as string)).toThrow(TypeError);
    }
  });

  it("recupera falhas de armazenamento e limita o JSON antes de interpretá-lo", () => {
    for (const raw of [null, "", "{", "null", "[]", "42", '{"version":2}', " ".repeat(WORK_SAVE_LIMIT + 1)]) {
      expect(readWorkSave(raw)).toEqual(emptyWorkSave());
    }
    expect(readWorkSave(JSON.stringify({ version: 1, current: "ritmo", completed: ["alcance", "ritmo"] }))).toEqual(emptyWorkSave());
    const first = emptyWorkSave(); first.drafts["checkout-staging"] = "alteração"; first.completed.push("checkout-staging");
    expect(emptyWorkSave()).not.toEqual(first);
  });

  it("preserva rascunhos inválidos sem reaplicar nem restaurar testes", () => {
    const raw = JSON.stringify({
      version: 1, current: "checkout-transfer", completed: ["checkout-staging"],
      drafts: { "checkout-staging": "{ arquivo incompleto", "checkout-transfer": source("http://orders:4100") },
      attempts: { "checkout-staging": 3, "checkout-transfer": 1 },
      applied: config(4100), testResult: testWorkCheckout(config(4100), "checkout-transfer"),
      xp: 999, secret: "não restaurar",
    });
    const save = readWorkSave(raw);
    expect(save.drafts["checkout-staging"]).toBe("{ arquivo incompleto");
    expect(save.drafts["checkout-transfer"]).toBe(source("http://orders:4100"));
    expect(Object.keys(save).sort()).toEqual(["attempts", "completed", "current", "drafts", "version"]);
    expect(completeWorkCase(save, "checkout-transfer", config(4100), null).ok).toBe(false);
    expect(readWorkSave(JSON.stringify(save))).toEqual(save);
    const escaped = completeFirst();
    for (const id of WORK_CASE_IDS) escaped.drafts[id] = "\u0000".repeat(WORK_CONFIG_LIMIT);
    expect(readWorkSave(JSON.stringify(escaped))).toEqual(escaped);
  });

  it("filtra conquistas, bloqueia saltos e limita rascunhos e contadores", () => {
    const decoded = readWorkSave(JSON.stringify({
      version: 1, current: "checkout-transfer", completed: ["checkout-transfer", "unknown"],
      drafts: { "checkout-staging": "x".repeat(WORK_CONFIG_LIMIT + 10), "checkout-transfer": 42 },
      attempts: { "checkout-staging": -2, "checkout-transfer": 20000 },
    }));
    expect(decoded.current).toBe("checkout-staging"); expect(decoded.completed).toEqual([]);
    expect(decoded.drafts["checkout-staging"]).toHaveLength(WORK_CONFIG_LIMIT);
    expect(decoded.drafts["checkout-transfer"]).toBe(getWorkCase("checkout-transfer").starterCode);
    expect(decoded.attempts).toEqual({ "checkout-staging": 0, "checkout-transfer": 10000 });
    const all = readWorkSave(JSON.stringify({ version: 1, current: "checkout-transfer", completed: [...WORK_CASE_IDS, ...WORK_CASE_IDS, "unknown"], drafts: [], attempts: { "checkout-staging": .5, "checkout-transfer": "3" } }));
    expect(all.completed).toEqual([...WORK_CASE_IDS]); expect(all.current).toBe("checkout-transfer");
    expect(all.attempts).toEqual(emptyWorkSave().attempts);
  });

  it("mescla conquistas e máximos sem apagar a edição da aba ativa", () => {
    const active = emptyWorkSave(); active.drafts["checkout-staging"] = "{ rascunho ativo"; active.attempts["checkout-staging"] = 2;
    const previous = completeFirst(); previous.attempts["checkout-staging"] = 5; previous.attempts["checkout-transfer"] = 1;
    const beforeActive = JSON.stringify(active); const beforePrevious = JSON.stringify(previous);
    const merged = mergeWorkSave(active, previous);
    expect(merged).toMatchObject({ current: "checkout-staging", completed: ["checkout-staging"], attempts: { "checkout-staging": 5, "checkout-transfer": 1 } });
    expect(merged.drafts).toEqual(active.drafts); expect(merged.drafts).not.toBe(active.drafts);
    expect(JSON.stringify(active)).toBe(beforeActive); expect(JSON.stringify(previous)).toBe(beforePrevious);
    const all = completeWorkCase(previous, "checkout-transfer", config(4100), testWorkCheckout(config(4100), "checkout-transfer")).save;
    active.attempts["checkout-transfer"] = 9;
    expect(mergeWorkSave(active, all)).toMatchObject({ completed: [...WORK_CASE_IDS], attempts: { "checkout-staging": 5, "checkout-transfer": 9 } });
    expect(mergeWorkSave(all, active).completed).toEqual([...WORK_CASE_IDS]);
  });
});
