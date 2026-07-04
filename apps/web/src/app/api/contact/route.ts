import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MAX_FIELD_LENGTHS = {
  name: 120,
  email: 180,
  service: 80,
  message: 3000,
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const current = rateLimit.get(key);

  if (!current || current.resetAt <= now) {
    rateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX) return true;
  current.count += 1;
  return false;
}

function clean(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
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

  const name = clean(body?.name, MAX_FIELD_LENGTHS.name);
  const email = clean(body?.email, MAX_FIELD_LENGTHS.email);
  const service = clean(body?.service, MAX_FIELD_LENGTHS.service);
  const message = clean(body?.message, MAX_FIELD_LENGTHS.message);

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
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

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
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

  if (!res.ok) {
    return NextResponse.json({ error: "Falha ao enviar email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
