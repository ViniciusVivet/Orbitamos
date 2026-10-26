import { beforeAll, describe, expect, it } from "vitest";
import initSqlJs, { type SqlJsStatic } from "sql.js";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { editSqlLine, emptySqlDraft, readSqlDraft, sqlLessons, sqlLineMatches, verifySqlLesson, type SqlSnapshot } from "./sqlJourney";

let SQL: SqlJsStatic;
const workerSource = readFileSync(new URL("../../public/workers/sql-studio.js", import.meta.url), "utf8");
const reference = sqlLessons.map(lesson => lesson.lines.map(line => line.code).join("\n"));
async function execute(history: string[], code: string): Promise<SqlSnapshot> {
  let snapshot: SqlSnapshot | undefined;
  const self = { initSqlJs: () => Promise.resolve(SQL), postMessage: (data: { type: string; snapshot?: SqlSnapshot }) => { if (data.type === "result") snapshot = data.snapshot; }, onmessage: async (_event: unknown) => {} };
  const context = vm.createContext({ self, importScripts: () => {}, Uint8Array });
  vm.runInContext(workerSource, context);
  await self.onmessage({ data: { history, code } });
  return snapshot!;
}
beforeAll(async () => { SQL = await initSqlJs(); });
describe("SQL com Orbi / real SQLite worker", () => {
  for (let stage = 0; stage < reference.length; stage++) it(`executes and validates mission ${stage + 1}`, async () => {
    const result = await execute(reference.slice(0, stage), reference[stage]);
    expect(result.error).toBeUndefined();
    expect(verifySqlLesson(stage, result)).toBe(true);
    if (stage === 0) expect(result.table?.values).toEqual([]);
    if (stage === 3) expect(result.table?.values).toHaveLength(2);
  });
  it("rejects an update without WHERE even though SQL executes", async () => {
    const result = await execute(reference.slice(0, 4), "UPDATE produtos SET estoque = 8;");
    expect(result.error).toBeUndefined();
    expect(result.table?.values[0][2]).toBe(8);
    expect(verifySqlLesson(4, result)).toBe(false);
  });
  it("allows equivalent spacing/case while respecting quoted text", async () => {
    const result = await execute([], reference[0].toLowerCase());
    expect(verifySqlLesson(0, result)).toBe(true);
    expect(sqlLineMatches(" create  table produtos( ", "CREATE TABLE produtos (")).toBe(true);
    expect(sqlLineMatches("(1, 'caderno', 12)", "(1, 'Caderno', 12)")).toBe(false);
  });
  it("surfaces SQLite syntax and strict type errors, not fake green feedback", async () => {
    expect((await execute([], "CREATE TABLE produtos (")).error).toBeTruthy();
    expect((await execute([reference[0]], "INSERT INTO produtos VALUES (1, 'Caderno', 'muito');")).error).toMatch(/cannot store TEXT/);
    expect((await execute(reference.slice(0, 2), "INSERT INTO produtos VALUES (1, 'Duplicado', 1);")).error).toMatch(/UNIQUE/);
  });
  it("does not mutate history when running the same insert again", async () => {
    const first = await execute([reference[0]], reference[1]);
    const second = await execute([reference[0]], reference[1]);
    expect(first.table).toEqual(second.table);
    expect(second.table?.values).toHaveLength(2);
  });
  it("bounds result sets and rejects oversized code", async () => {
    const result = await execute([], "WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<300) SELECT x FROM n;");
    expect(result.truncated).toBe(true);
    expect(result.query?.values).toHaveLength(200);
    expect((await execute([], "a".repeat(8001))).error).toBeTruthy();
  });
  it("restores safe drafts and invalidates downstream validation on edit", () => {
    for (const raw of [null, "oops", "null", "{}", '{"version":1,"drafts":[]}']) expect(readSqlDraft(raw)).toEqual(emptySqlDraft());
    const draft = { ...emptySqlDraft(), stage: 2, passed: [0, 1, 2, 3, 4], drafts: sqlLessons.map(lesson => lesson.lines.map(line => line.code)) };
    expect(readSqlDraft(JSON.stringify(draft))).toEqual(draft);
    const edited = editSqlLine(draft, 0, "SELECT nome");
    expect(edited.passed).toEqual([0, 1]);
    expect(edited.drafts[1]).toEqual(draft.drafts[1]);
    expect(edited.drafts[2][0]).toBe("SELECT nome");
  });
});
