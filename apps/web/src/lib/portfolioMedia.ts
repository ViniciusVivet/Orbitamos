import { prepareAvatarUpload } from "./api";
import { requireSupabase } from "./supabase";
import type { PortfolioItem } from "./workspace";

export const PORTFOLIO_MAX_FILE_BYTES = 25 * 1024 * 1024;
const supportedImages = ["image/jpeg", "image/png", "image/webp"];

export function portfolioFileError(file: Pick<File, "type" | "size">): string | null {
  if (!supportedImages.includes(file.type)) return "Escolha uma imagem JPG, PNG ou WebP.";
  if (!Number.isFinite(file.size) || file.size <= 0) return "A imagem está vazia. Escolha outro arquivo.";
  if (file.size > PORTFOLIO_MAX_FILE_BYTES) return "A imagem deve ter até 25 MB. Vamos reduzir o tamanho antes de enviar.";
  return null;
}

export function portfolioUrl(value: string, allowLocal = false): string | null {
  const source = value.trim();
  if (!source) return "";
  if (allowLocal && source.startsWith("/") && !source.startsWith("//") && !source.includes("\\")) return source;
  try {
    const url = new URL(source);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}

export function portfolioCoverPath(userId: string, nonce: string, extension: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(userId) || !/^[a-zA-Z0-9_-]+$/.test(nonce) || !["jpg", "png", "webp"].includes(extension)) throw new Error("Não foi possível preparar o caminho da imagem.");
  return `${userId}/portfolio/${nonce}.${extension}`;
}

export type PreparedPortfolioCover = Awaited<ReturnType<typeof prepareAvatarUpload>>;

/** Validate decoding before using the existing browser resize/conversion pipeline. */
export async function preparePortfolioCover(file: File): Promise<PreparedPortfolioCover> {
  const error = portfolioFileError(file);
  if (error) throw new Error(error);
  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 60_000_000) throw new Error("dimensions");
  } catch { throw new Error("Não conseguimos abrir essa imagem. Tente um JPG, PNG ou WebP diferente."); }
  finally { URL.revokeObjectURL(source); }
  return prepareAvatarUpload(file);
}

/** Existing avatars policy permits writes under auth.uid(); no new bucket or permission. */
export async function uploadPortfolioCover(cover: PreparedPortfolioCover): Promise<string> {
  const client = requireSupabase();
  const { data, error: authError } = await client.auth.getUser();
  if (authError || !data.user) throw new Error("Sua sessão expirou. Entre novamente antes de enviar a capa.");
  const nonce = crypto.randomUUID();
  const path = portfolioCoverPath(data.user.id, nonce, cover.extension);
  const { error } = await client.storage.from("avatars").upload(path, cover.blob, { upsert: false, contentType: cover.contentType });
  if (error) throw new Error("Não conseguimos enviar a capa. Sua edição está guardada; tente novamente.");
  return client.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}

export const portfolioDraftKey = (userId: string | number) => `orbitamos-portfolio-draft-v1-${userId}`;
export type PortfolioDraft = { version: 1; item: PortfolioItem; coverName: string | null; updatedAt: number };

export function readPortfolioDraft(raw: string | null, now = Date.now()): PortfolioDraft | null {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || value.version !== 1 || !value.item || typeof value.item !== "object" || !Number.isFinite(value.updatedAt) || value.updatedAt <= 0 || value.updatedAt > now + 300000) return null;
    const item = value.item;
    if (typeof item.title !== "string" || typeof item.description !== "string" || typeof item.projectUrl !== "string" || typeof item.imageUrl !== "string" || !Array.isArray(item.skills) || item.skills.some((skill: unknown) => typeof skill !== "string")) return null;
    if (item.id !== undefined && (!Number.isSafeInteger(item.id) || item.id <= 0)) return null;
    return { version: 1, updatedAt: value.updatedAt, coverName: typeof value.coverName === "string" ? value.coverName.slice(0, 200) : null,
      item: { id: item.id, title: item.title.slice(0, 120), description: item.description.slice(0, 4000), projectUrl: item.projectUrl.slice(0, 2048), imageUrl: item.imageUrl.slice(0, 2_000_000), skills: item.skills.slice(0, 20).map((skill: string) => skill.slice(0, 50)), featured: item.featured === true, sortOrder: Number.isSafeInteger(item.sortOrder) && item.sortOrder >= 0 ? item.sortOrder : 0 } };
  } catch { return null; }
}

export function portfolioItemError(item: PortfolioItem, allowPreviewImages = false): string | null {
  if (!item.title.trim()) return "Dê um título ao seu trabalho.";
  if (item.projectUrl.trim() && portfolioUrl(item.projectUrl) === null) return "Use um link do projeto começando com https:// ou http://.";
  const localPreview = allowPreviewImages && (/^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(item.imageUrl) || portfolioUrl(item.imageUrl, true) !== null);
  if (item.imageUrl.trim() && portfolioUrl(item.imageUrl) === null && !localPreview) return "Use um link de capa começando com https:// ou http://, ou escolha um arquivo.";
  return null;
}
