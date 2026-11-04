import { describe, expect, it, vi } from "vitest";
vi.mock("./api", () => ({ prepareAvatarUpload: vi.fn() }));
vi.mock("./supabase", () => ({ requireSupabase: vi.fn() }));
import { PORTFOLIO_MAX_FILE_BYTES, portfolioCoverPath, portfolioDraftKey, portfolioFileError, portfolioItemError, portfolioUrl, readPortfolioDraft } from "./portfolioMedia";

const item = { title: "Meu case", description: "O que fiz", projectUrl: "", imageUrl: "", skills: ["C#"], featured: false, sortOrder: 0 };
describe("portfolio media and recovery", () => {
  it("accepts supported image files within bounds and rejects misleading or empty input", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) expect(portfolioFileError({ type, size: PORTFOLIO_MAX_FILE_BYTES })).toBeNull();
    for (const file of [{ type: "image/svg+xml", size: 100 }, { type: "image/gif", size: 100 }, { type: "image/png", size: 0 }, { type: "image/jpeg", size: PORTFOLIO_MAX_FILE_BYTES + 1 }]) expect(portfolioFileError(file)).not.toBeNull();
  });
  it("accepts safe project URLs and only allows relative fixture imagery when explicitly requested", () => {
    expect(portfolioUrl(" https://example.com/case#demo ")).toBe("https://example.com/case#demo");
    expect(portfolioUrl("/images/photo.webp", true)).toBe("/images/photo.webp");
    for (const url of ["/images/photo.webp", "javascript:alert(1)", "data:image/png;base64,x", "//example.com", "https://name:secret@example.com", "foo"]) expect(portfolioUrl(url)).toBeNull();
    expect(portfolioItemError({ ...item, projectUrl: "javascript:alert(1)" })).not.toBeNull();
    expect(portfolioItemError({ ...item, title: "  " })).not.toBeNull();
  });
  it("uses unique files inside the existing owner prefix without overwriting the profile avatar", () => {
    expect(portfolioCoverPath("user-42", "unique-1", "webp")).toBe("user-42/portfolio/unique-1.webp");
    expect(() => portfolioCoverPath("../other", "unique-1", "png")).toThrow();
    expect(() => portfolioCoverPath("user-42", "../avatar", "png")).toThrow();
    expect(() => portfolioCoverPath("user-42", "unique-1", "svg")).toThrow();
  });
  it("restores only scoped versioned drafts while preserving unfinished text without awarding completion", () => {
    expect(portfolioDraftKey("one")).not.toBe(portfolioDraftKey("two"));
    const raw = JSON.stringify({ version: 1, item: { ...item, title: "" }, coverName: "meu-print.png", updatedAt: 1000 });
    expect(readPortfolioDraft(raw, 2000)?.item.title).toBe("");
    expect(readPortfolioDraft(raw, 2000)?.coverName).toBe("meu-print.png");
    for (const raw of ["{", "[]", JSON.stringify({ version: 2, item, updatedAt: 1000 }), JSON.stringify({ version: 1, item: { ...item, id: -1 }, updatedAt: 1000 }), JSON.stringify({ version: 1, item, updatedAt: 999999 })]) expect(readPortfolioDraft(raw, 2000)).toBeNull();
  });
});
