/**
 * Cliente Supabase para upload de avatar (Storage).
 * Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local / Vercel.
 * No Supabase: crie o bucket "avatars" (público para leitura) e política de upload.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(url, anonKey);
  }
  return client;
}

const BUCKET = "avatars";

/**
 * Faz upload de um arquivo de imagem para o bucket avatars e retorna a URL pública.
 * Retorna null se Supabase não estiver configurado ou o upload falhar.
 */
export async function uploadAvatar(
  file: File,
  userId: number
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    return null;
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return urlData?.publicUrl ?? null;
}
