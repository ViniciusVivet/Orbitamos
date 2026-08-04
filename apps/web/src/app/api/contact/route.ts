import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import {
  CONTACT_FIELD_LIMITS,
  CONTACT_RATE_LIMIT_MAX,
  CONTACT_RATE_LIMIT_WINDOW_MS,
  InMemoryRateLimiter,
  cleanContactField,
  getContactClientIp,
  isValidContactEmail,
} from "@/lib/contact";

const rateLimiter = new InMemoryRateLimiter();

/**
 * Rate limit persistente no Supabase (compartilhado entre instancias serverless).
 * Retorna true=permitido, false=bloqueado, null=indisponivel (cai pro in-memory).
 * Envia apenas um hash do IP, nunca o IP em texto puro.
 */
async function checkRateLimitDb(ip: string): Promise<boolean | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const ipHash = createHash("sha256").update(ip).digest("hex");
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.rpc("v3_contact_rate_check", {
    p_ip_hash: ipHash,
    p_max: CONTACT_RATE_LIMIT_MAX,
    p_window_secs: CONTACT_RATE_LIMIT_WINDOW_MS / 1000,
  });
  if (error) return null;
  return data === true;
}

async function saveContact(params: {
  name: string;
  email: string;
  service: string;
  message: string;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = serviceRoleKey || anonKey;

  if (!supabaseUrl || !key) return;

  const client = createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const message = params.service
    ? `[${params.service}] ${params.message}`
    : params.message;

  const { error } = await client.from("v3_contacts").insert({
    name: params.name,
    email: params.email,
    message,
  });

  if (error) throw error;
}

export async function POST(req: NextRequest) {
  const ip = getContactClientIp(req.headers);
  const dbAllowed = await checkRateLimitDb(ip);
  const limited = dbAllowed === null ? rateLimiter.isLimited(ip) : !dbAllowed;
  if (limited) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em alguns minutos." },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => null)) as {
    name?: unknown;
    email?: unknown;
    service?: unknown;
    message?: unknown;
  } | null;

  const name = cleanContactField(body?.name, CONTACT_FIELD_LIMITS.name);
  const email = cleanContactField(body?.email, CONTACT_FIELD_LIMITS.email);
  const service = cleanContactField(body?.service, CONTACT_FIELD_LIMITS.service);
  const message = cleanContactField(body?.message, CONTACT_FIELD_LIMITS.message);

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
  }

  if (!isValidContactEmail(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  try {
    await saveContact({ name, email, service, message });
  } catch {
    return NextResponse.json({ error: "Falha ao salvar contato." }, { status: 500 });
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    return NextResponse.json({ ok: true });
  }

  let res: Response;
  try {
    res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          from_name: name,
          from_email: email,
          message: service ? `[${service}] ${message}` : message,
          to_email: "contato@orbitamos.com",
        },
      }),
    });
  } catch {
    return NextResponse.json({ error: "Falha ao enviar email." }, { status: 500 });
  }

  if (!res.ok) {
    return NextResponse.json({ error: "Falha ao enviar email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
