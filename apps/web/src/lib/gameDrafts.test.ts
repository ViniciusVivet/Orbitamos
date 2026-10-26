import { describe, expect, it } from "vitest";
import { fasesMonteCodigo } from "./jogoMonteCodigo";
import { initialAttempt, villageLevels } from "./vilaDosBlocos";
import { assemblyDraftKey, assemblySignature, orbiDraftKey, orbiSignature, readAssemblyDraft, readOrbiDraft, readVillageDraft, villageDraftKey, villageSignature } from "./gameDrafts";
import { niveisGuiaOrbi } from "./jogoGuiaOrbi";

describe("unfinished game drafts", () => {
  const phase = fasesMonteCodigo[0];
  const assembly = { version: 1, signature: assemblySignature(phase), pool: [2, 1], placed: [0], attempts: 2, assembled: false, selectedOutput: null, traceIndex: 0 };

  it("restores a partial assembly and rejects duplicate, missing or foreign blocks", () => {
    expect(readAssemblyDraft(JSON.stringify(assembly), phase)).toEqual(assembly);
    for (const ids of [[0, 1], [0, 1, 2], [2, 9]]) expect(readAssemblyDraft(JSON.stringify({ ...assembly, pool: ids }), phase)).toBeNull();
    expect(readAssemblyDraft(JSON.stringify({ ...assembly, signature: "previous content" }), phase)).toBeNull();
    expect(readAssemblyDraft("broken", phase)).toBeNull();
  });

  it("restores prediction only after a valid assembly, never a victory flag", () => {
    const wrong = `${phase.saidaEsperada}!`;
    const draft = readAssemblyDraft(JSON.stringify({ ...assembly, pool: [], placed: [0, 1, 2], assembled: true, selectedOutput: wrong }), phase);
    expect(draft?.selectedOutput).toBe(wrong);
    expect(draft).not.toHaveProperty("won");
    expect(readAssemblyDraft(JSON.stringify({ ...assembly, assembled: true }), phase)?.assembled).toBe(false);
    expect(readAssemblyDraft(JSON.stringify({ ...assembly, selectedOutput: "unknown answer" }), phase)).toBeNull();
  });

  it("restores a selected character and an actual socket independently", () => {
    const level = villageLevels[0];
    const value = { version: 1, signature: villageSignature(level), attempt: { pair: "colchetes", indents: [] }, selected: "parenteses" };
    expect(readVillageDraft(JSON.stringify(value), level)).toEqual(value);
    expect(readVillageDraft(JSON.stringify({ ...value, selected: "unknown" }), level)).toBeNull();
    expect(readVillageDraft(JSON.stringify({ ...value, attempt: { pair: "espacos", indents: [] } }), level)).toBeNull();
  });

  it("restores movable indentation but rejects changes to fixed lines or unsupported depths", () => {
    const level = villageLevels.find(item => item.id === "quatro-passos")!;
    const value = { version: 1, signature: villageSignature(level), attempt: { ...initialAttempt(level), indents: [0, 0, 1] }, selected: null };
    expect(readVillageDraft(JSON.stringify(value), level)).toEqual(value);
    for (const indents of [[1, 0, 1], [0, 0, 3], [0, 1], [0, 0, "1"]]) expect(readVillageDraft(JSON.stringify({ ...value, attempt: { pair: null, indents } }), level)).toBeNull();
    expect(readVillageDraft(JSON.stringify(value), villageLevels[0])).toBeNull();
  });

  it("keeps accounts and phases in separate draft keys, independent of achievements", () => {
    expect(assemblyDraftKey("a", phase.slug)).not.toBe(assemblyDraftKey("b", phase.slug));
    expect(assemblyDraftKey("a", phase.slug)).not.toBe(assemblyDraftKey("a", "other"));
    expect(villageDraftKey("a", "correio")).not.toBe(villageDraftKey("b", "correio"));
    expect(villageDraftKey("a", "correio")).not.toBe(villageDraftKey("a", "mochila"));
    expect(orbiDraftKey("a", "decolagem")).not.toBe(orbiDraftKey("b", "decolagem"));
    expect(orbiDraftKey("a", "decolagem")).not.toBe(orbiDraftKey("a", "funcao-f"));
  });

  it("restores an Orbi program without claiming an executed portal result", () => {
    const level = niveisGuiaOrbi.find(item => item.slotsFuncao)!;
    const value = { version: 1, signature: orbiSignature(level), principal: ["funcao"], funcao: ["avancar", "direita"], activeTrack: "funcao", tentativas: 2 };
    expect(readOrbiDraft(JSON.stringify(value), level)).toEqual(value);
    expect(readOrbiDraft(JSON.stringify({ ...value, resultado: "portal", concluido: true }), level)).not.toHaveProperty("resultado");
    expect(readOrbiDraft(JSON.stringify({ ...value, principal: Array(level.slotsPrincipal + 1).fill("avancar") }), level)).toBeNull();
    expect(readOrbiDraft(JSON.stringify({ ...value, funcao: ["unknown"] }), level)).toBeNull();
    expect(readOrbiDraft(JSON.stringify({ ...value, signature: "old" }), level)).toBeNull();
  });

  it("rejects function instructions and function track before that mechanic exists", () => {
    const level = niveisGuiaOrbi[0];
    const value = { version: 1, signature: orbiSignature(level), principal: ["avancar"], funcao: [], activeTrack: "principal", tentativas: 0 };
    expect(readOrbiDraft(JSON.stringify(value), level)).toEqual(value);
    for (const fields of [{ principal: ["funcao"] }, { funcao: ["avancar"] }, { activeTrack: "funcao" }, { tentativas: -1 }]) expect(readOrbiDraft(JSON.stringify({ ...value, ...fields }), level)).toBeNull();
  });
});
