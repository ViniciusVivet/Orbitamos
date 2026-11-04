import { describe, expect, it, vi } from "vitest";
import { activityCompletion, activityIds, bridgeTarget, emptyJournal, journalKey, persistPractice, practiceActivities, practiceDestination, readJournal, recommendActivity, recordPractice, reviewQueue, reviewQuestions } from "./practiceStation";
import { desafios } from "./desafios";
import { fasesMonteCodigo } from "./jogoMonteCodigo";
import { villageLevels } from "./vilaDosBlocos";
import { niveisGuiaOrbi } from "./jogoGuiaOrbi";
import { chapterMissionIds, emptyChapterSave, orbiChapterKey } from "./orbiChapter";
import { deliveryMissions, deliveryStorageKey } from "./orbiDelivery";

const incomplete = () => ({ sql: false, delivery: false, english: false, village: false, orbi: false, assembly: false });
describe("Connected practice", () => {
  it("requires the chapter v2 missions instead of a legacy completion or journal marker", () => {
    const legacy = { version: 1, current: 2, completed: deliveryMissions.map(mission => mission.id) };
    const journal = { version: 1, activities: { delivery: { completedAt: 1000, reviews: 2 } } };
    const saves = new Map([[deliveryStorageKey("u"), JSON.stringify(legacy)], [journalKey("u"), JSON.stringify(journal)]]);
    const before = [...saves];
    const read = (key: string) => saves.get(key) ?? null;
    expect(activityCompletion("u", read).delivery).toBe(false);
    expect([...saves]).toEqual(before);
    saves.set(orbiChapterKey("u"), JSON.stringify({ ...emptyChapterSave(), completed: ["ponte", "elevador"] }));
    expect(activityCompletion("u", read).delivery).toBe(false);
    saves.set(orbiChapterKey("u"), JSON.stringify({ ...emptyChapterSave(), completed: chapterMissionIds }));
    expect(activityCompletion("u", read).delivery).toBe(true);
    expect(activityCompletion("another", read).delivery).toBe(false);
  });
  it("versions the new completion while keeping the earlier achievement and reviews as history", () => {
    const old = { version: 1 as const, activities: { delivery: { completedAt: 1000, reviewedAt: 2000, dueAt: 3000, reviews: 2 } } };
    const next = recordPractice(old, "delivery", "complete", 4000);
    expect(next.activities.delivery).toMatchObject({ contentVersion: 2, completedAt: 4000, dueAt: 4000 + 86400000, reviews: 0, legacyCompletedAt: 1000, legacyReviewedAt: 2000, legacyReviews: 2 });
    expect(next.activities.delivery?.reviewedAt).toBeUndefined();
    expect(old.activities.delivery.completedAt).toBe(1000);
    expect(readJournal(JSON.stringify(next))).toEqual(next);
    const reviewed = recordPractice(next, "delivery", "review", 5000);
    expect(recordPractice(reviewed, "delivery", "complete", 6000).activities.delivery).toMatchObject({ completedAt: 4000, reviews: 1, legacyCompletedAt: 1000, legacyReviews: 2 });
  });
  it("reviews the bridge and dependent energy expression without importing old review counts", () => {
    const old = { version: 1 as const, activities: { delivery: { completedAt: 1000, reviews: 1 } } };
    const completed = { ...incomplete(), delivery: true };
    expect(reviewQueue(incomplete(), old)).toEqual([]);
    expect(reviewQueue(completed, old)[0].id).toBe("delivery-variable");
    const next = recordPractice(old, "delivery", "review", 5000);
    expect(next.activities.delivery).toMatchObject({ contentVersion: 2, reviews: 1, reviewedAt: 5000, legacyCompletedAt: 1000, legacyReviews: 1 });
    expect(next.activities.delivery?.completedAt).toBeUndefined();
    expect(reviewQueue(completed, next)[0].id).toBe("delivery-expression");
    expect(reviewQuestions.find(question => question.id === "delivery-variable")?.answer).toBe("A ponte fica mais comprida");
    expect(reviewQuestions.find(question => question.id === "delivery-expression")?.answer).toBe("9");
  });
  it("persists a delivery completion or review only after all chapter missions are recorded", () => {
    const saves = new Map<string, string>();
    const write = vi.fn((key: string, value: string) => saves.set(key, value));
    vi.stubGlobal("localStorage", { getItem: (key: string) => saves.get(key) ?? null, setItem: write });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    try {
      expect(persistPractice("u", "delivery", "complete")).toBe(false);
      expect(persistPractice("u", "delivery", "review")).toBe(false);
      expect(write).not.toHaveBeenCalled();
      saves.set(orbiChapterKey("u"), JSON.stringify({ ...emptyChapterSave(), completed: chapterMissionIds }));
      expect(persistPractice("u", "delivery", "complete")).toBe(true);
      expect(readJournal(saves.get(journalKey("u")) ?? null).activities.delivery).toMatchObject({ contentVersion: 2, reviews: 0 });
      expect(persistPractice("u", "delivery", "review")).toBe(true);
      expect(readJournal(saves.get(journalKey("u")) ?? null).activities.delivery?.reviews).toBe(1);
    } finally { vi.unstubAllGlobals(); }
  });
  it("offers a beginning and resumes a real visit without calling it completion", () => {
    const journal = recordPractice(emptyJournal(), "english", "open", 1000);
    expect(recommendActivity(emptyJournal(), incomplete())).toBe("sql");
    expect(recommendActivity(journal, incomplete())).toBe("english");
    expect(activityCompletion("u", key => key === journalKey("u") ? JSON.stringify(journal) : null).english).toBe(false);
    expect(reviewQueue(incomplete(), journal, 2000)).toEqual([]);
  });
  it("keeps completion while reviewing and proposes another retrieval interval", () => {
    const completed = recordPractice(emptyJournal(), "english", "complete", 1000);
    const twice = recordPractice(completed, "english", "complete", 2000);
    expect(twice.activities.english?.completedAt).toBe(1000);
    const reviewed = recordPractice(twice, "english", "review", 100000);
    expect(reviewed.activities.english?.completedAt).toBe(1000);
    expect(reviewed.activities.english?.dueAt).toBe(100000 + 3 * 86400000);
    expect(reviewed.activities.english?.reviews).toBe(1);
    const sqlCompleted = recordPractice(emptyJournal(), "sql", "complete", 1000);
    // Starting the SQL story again must not erase a previously earned completion.
    expect(activityCompletion("u", key => key === journalKey("u") ? JSON.stringify(sqlCompleted) : null).sql).toBe(true);
  });
  it("rejects malformed records, unknown ids and nonfinite dates", () => {
    expect(readJournal("broken")).toEqual(emptyJournal());
    const result = readJournal(JSON.stringify({ version: 1, activities: { evil: { reviews: 0 }, english: { reviews: -1 }, sql: { reviews: 2, completedAt: "yes", dueAt: null } } }));
    expect(Object.keys(result.activities)).toEqual(["sql"]);
    expect(result.activities.sql).toEqual({ reviews: 2 });
  });
  it("keeps another user's records out of this account", () => {
    const journal = recordPractice(emptyJournal(), "delivery", "complete", 1000);
    expect(activityCompletion("other", key => key === journalKey("u") ? JSON.stringify(journal) : null).delivery).toBe(false);
  });
  it("chooses review only from practiced experiences and varies the question", () => {
    const completed = { ...incomplete(), english: true };
    expect(reviewQueue(completed, emptyJournal())[0].activity).toBe("english");
    const once = recordPractice(emptyJournal(), "english", "review", 1000);
    expect(reviewQueue(completed, once)[0].id).not.toBe(reviewQueue(completed, emptyJournal())[0].id);
    expect(reviewQueue(completed, once)).toHaveLength(1);
  });
  it("all code bridges resolve to existing challenges and preserve language", () => {
    for (const phase of fasesMonteCodigo) {
      const target = bridgeTarget("assembly", phase.slug).split("?")[0].split("/").at(-1);
      const challenge = desafios.find(d => d.slug === target);
      expect(challenge, phase.slug).toBeDefined();
      expect(challenge?.linguagem).toBe(phase.linguagem === "python" ? "python" : "javascript");
    }
    for (const level of villageLevels) expect(desafios.some(d => bridgeTarget("village", level.id).includes(`/${d.slug}?`))).toBe(true);
    for (const activity of practiceActivities) expect(desafios.some(d => d.slug === activity.codeSlug)).toBe(true);
    expect(bridgeTarget("sql", undefined, true)).toContain("mode=workshop");
    expect(activityIds).toHaveLength(6);
  });

  it("resumes each game's first unfinished phase without mixing accounts or adding saves", () => {
    const saves = new Map<string, string>();
    const read = (key: string) => saves.get(key) ?? null;
    expect(practiceDestination("assembly", "a", read, true)).toBe("/dev/monte-codigo-preview/ola-orbi-js?from=academy");
    expect(practiceDestination("orbi", "a", read)).toBe("/estudante/jogos/orbi/decolagem");
    saves.set(`orbitamos-jogo-monte-a-${fasesMonteCodigo[0].slug}`, JSON.stringify({ concluido: true }));
    saves.set(`orbitamos-jogo-orbi-a-${niveisGuiaOrbi[0].slug}`, JSON.stringify({ concluido: true }));
    expect(practiceDestination("assembly", "a", read, true)).toBe(`/dev/monte-codigo-preview/${fasesMonteCodigo[1].slug}?from=academy`);
    expect(practiceDestination("orbi", "a", read, true)).toBe(`/dev/orbi-preview/${niveisGuiaOrbi[1].slug}?from=academy`);
    expect(practiceDestination("orbi", "b", read, true)).toBe("/dev/orbi-preview/decolagem?from=academy");
    saves.set(`orbitamos-jogo-orbi-a-${niveisGuiaOrbi[1].slug}`, "broken");
    expect(practiceDestination("orbi", "a", read)).toBe(`/estudante/jogos/orbi/${niveisGuiaOrbi[1].slug}`);
    expect(saves.size).toBe(3);
  });

  it("offers the beginning for a full replay and preserves every non-phase destination", () => {
    const completed = () => JSON.stringify({ concluido: true });
    expect(practiceDestination("assembly", "u", completed)).toBe("/estudante/jogos/ola-orbi-js");
    expect(practiceDestination("orbi", "u", completed, true)).toBe("/dev/orbi-preview/decolagem?from=academy");
    for (const activity of practiceActivities.filter(item => !["assembly", "orbi"].includes(item.id))) {
      expect(practiceDestination(activity.id, "u", completed)).toBe(activity.route);
      expect(practiceDestination(activity.id, "u", completed, true)).toBe(activity.preview);
    }
  });
});
