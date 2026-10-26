import { beforeAll, describe, expect, it } from "vitest";
import initSqlJs, { type SqlJsStatic } from "sql.js";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { emptyQuest, matchesQuestWriting, questCode, questSteps, readQuest, shopSeed, verifyQuestResult } from "./sqlQuest";
import type { SqlSnapshot } from "./sqlJourney";

let SQL: SqlJsStatic;
const workerSource = readFileSync(new URL("../../public/workers/sql-studio.js", import.meta.url), "utf8");

async function execute(code: string): Promise<SqlSnapshot> {
  let result: SqlSnapshot | undefined;
  const self = {
    initSqlJs: () => Promise.resolve(SQL),
    postMessage: (message: { type: string; snapshot?: SqlSnapshot }) => {
      if (message.type === "result") result = message.snapshot;
    },
    onmessage: async (_event: unknown) => {},
  };
  vm.runInContext(workerSource, vm.createContext({ self, importScripts: () => {}, Uint8Array }));
  await self.onmessage({ data: { history: [shopSeed], code } });
  if (!result) throw new Error("The SQLite worker did not return a result");
  return result;
}

beforeAll(async () => { SQL = await initSqlJs(); });

describe("SQL quest / real SQLite validation", () => {
  it.each([
    [5, questCode(5, "<"), [["Caneta", 3]]],
    [6, "SELECT nome, estoque FROM produtos WHERE estoque < 10 ORDER BY id;", [["Caneta", 3], ["Mochila", 7]]],
    [8, "SELECT nome, estoque FROM produtos WHERE estoque >= 7 ORDER BY id;", [["Caderno", 12], ["Mochila", 7]]],
  ] as const)("validates step %i against the actual result while preserving the three products", async (step, code, rows) => {
    const result = await execute(code);
    expect(result.error).toBeUndefined();
    expect(result.query?.values).toEqual(rows);
    expect(result.table?.values).toHaveLength(3);
    expect(verifyQuestResult(step, result)).toBe(true);
  });

  it("accepts equivalent comparisons, case and spacing instead of requiring a copied sentence", async () => {
    const first = await execute(" select nome , estoque from produtos where 10 > estoque order by id ; ");
    const final = await execute("SELECT nome, estoque FROM produtos WHERE 7 <= estoque ORDER BY id;");
    expect(verifyQuestResult(6, first)).toBe(true);
    expect(verifyQuestResult(8, final)).toBe(true);
    expect(matchesQuestWriting(" from   produtos ; ")).toBe(true);
    expect(matchesQuestWriting("FROM produto;")).toBe(false);
  });

  it("accepts the requested products without ORDER BY and in reverse order", async () => {
    const withoutOrder = await execute("SELECT nome, estoque FROM produtos WHERE estoque < 10;");
    const reverseOrder = await execute("SELECT nome, estoque FROM produtos WHERE estoque >= 7 ORDER BY id DESC;");
    expect(verifyQuestResult(6, withoutOrder)).toBe(true);
    expect(reverseOrder.query?.values).toEqual([["Mochila", 7], ["Caderno", 12]]);
    expect(verifyQuestResult(8, reverseOrder)).toBe(true);
  });

  it("rejects duplicated result rows even when each requested product is present", async () => {
    const result = await execute("SELECT nome, estoque FROM produtos WHERE estoque < 10 UNION ALL SELECT nome, estoque FROM produtos WHERE estoque < 10;");
    expect(result.error).toBeUndefined();
    expect(result.query?.values).toHaveLength(4);
    expect(result.table?.values).toHaveLength(3);
    expect(verifyQuestResult(6, result)).toBe(false);
  });

  it.each([
    [5, questCode(5, ">")],
    [6, "SELECT nome, estoque FROM produtos WHERE estoque > 10 ORDER BY id;"],
    [8, "SELECT nome, estoque FROM produtos WHERE estoque <= 7 ORDER BY id;"],
  ] as const)("does not approve an inverted comparison in step %i", async (step, code) => {
    const result = await execute(code);
    expect(result.error).toBeUndefined();
    expect(verifyQuestResult(step, result)).toBe(false);
  });

  it("rejects a deletion even when the query produces the expected filtered rows", async () => {
    const result = await execute("DELETE FROM produtos WHERE id = 1; SELECT nome, estoque FROM produtos WHERE estoque < 10 ORDER BY id;");
    expect(result.query?.values).toEqual([["Caneta", 3], ["Mochila", 7]]);
    expect(verifyQuestResult(6, result)).toBe(false);
  });

  it("rejects changes to a product hidden by the filter", async () => {
    const result = await execute("UPDATE produtos SET estoque = 99 WHERE id = 1; SELECT nome, estoque FROM produtos WHERE estoque < 10 ORDER BY id;");
    expect(result.query?.values).toEqual([["Caneta", 3], ["Mochila", 7]]);
    expect(verifyQuestResult(6, result)).toBe(false);
  });

  it("rejects a changed schema even if visible source data and query results are identical", async () => {
    const result = await execute("DROP TABLE produtos; CREATE TABLE produtos (id INTEGER, nome TEXT, estoque INTEGER) STRICT; INSERT INTO produtos VALUES (1, 'Caderno', 12), (2, 'Caneta', 3), (3, 'Mochila', 7); SELECT nome, estoque FROM produtos WHERE estoque < 10 ORDER BY id;");
    expect(result.error).toBeUndefined();
    expect(result.table?.values).toHaveLength(3);
    expect(result.query?.values).toEqual([["Caneta", 3], ["Mochila", 7]]);
    expect(verifyQuestResult(6, result)).toBe(false);
  });

  it("rejects incorrect selected columns and syntax errors with real SQLite feedback", async () => {
    const wrongColumn = await execute("SELECT nome AS produto, estoque FROM produtos WHERE estoque < 5 ORDER BY id;");
    expect(verifyQuestResult(5, wrongColumn)).toBe(false);
    const syntaxError = await execute("SELECT nome, estoque FROM produtos WHERE estoque <;");
    expect(syntaxError.error).toBeTruthy();
    expect(verifyQuestResult(5, syntaxError)).toBe(false);
  });

  it("does not approve a valid-looking snapshot marked as truncated or from a non-executable step", async () => {
    const result = await execute(questCode(5, "<"));
    expect(verifyQuestResult(5, { ...result, truncated: true })).toBe(false);
    expect(verifyQuestResult(4, result)).toBe(false);
  });
});

describe("SQL quest / saved progress", () => {
  it("restores valid drafts, support use and the completion screen", () => {
    const draft = emptyQuest();
    draft.step = questSteps.length;
    draft.drafts[3] = "FROM produtos;";
    draft.drafts[6] = "SELECT nome, estoque FROM produtos WHERE estoque < 10 ORDER BY id;";
    draft.hints[6] = true;
    expect(readQuest(JSON.stringify(draft))).toEqual(draft);
  });

  it("falls back to an empty quest for malformed, oversized and incompatible storage", () => {
    const draft = emptyQuest();
    const malformed = [
      null, "not json", "null", "{}", "[]",
      JSON.stringify({ ...draft, version: 2 }),
      JSON.stringify({ ...draft, step: -1 }),
      JSON.stringify({ ...draft, step: 0.5 }),
      JSON.stringify({ ...draft, step: questSteps.length + 1 }),
      JSON.stringify({ ...draft, drafts: [] }),
      JSON.stringify({ ...draft, drafts: draft.drafts.map((line, index) => index === 0 ? 7 : line) }),
      JSON.stringify({ ...draft, drafts: draft.drafts.map((line, index) => index === 0 ? "a".repeat(1001) : line) }),
      JSON.stringify({ ...draft, hints: [] }),
      JSON.stringify({ ...draft, hints: draft.hints.map((hint, index) => index === 0 ? "true" : hint) }),
    ];
    for (const raw of malformed) expect(readQuest(raw)).toEqual(emptyQuest());
  });
});
