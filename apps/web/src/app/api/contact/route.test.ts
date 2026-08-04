import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const supabaseMock = vi.hoisted(() => {
  const insert = vi.fn();
  const from = vi.fn(() => ({ insert }));
  const rpc = vi.fn();
  const createClient = vi.fn(() => ({ from, rpc }));
  return { createClient, from, insert, rpc };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: supabaseMock.createClient,
}));

import { POST } from "./route";

function request(
  body: unknown,
  ip: string,
  rawBody?: string
): NextRequest {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: rawBody ?? JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    supabaseMock.insert.mockResolvedValue({ error: null });
    supabaseMock.rpc.mockResolvedValue({ data: true, error: null });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(request(null, "203.0.113.1", "{"));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Campos obrigatórios ausentes.",
    });
  });

  it("rejects missing required fields", async () => {
    const response = await POST(
      request({ name: "Orbitamos", email: "oi@example.com" }, "203.0.113.2")
    );
    expect(response.status).toBe(400);
  });

  it("rejects invalid email", async () => {
    const response = await POST(
      request(
        { name: "Orbitamos", email: "email-invalido", message: "Olá" },
        "203.0.113.3"
      )
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "E-mail inválido." });
  });

  it("accepts a valid contact without optional integrations", async () => {
    const response = await POST(
      request(
        { name: " Orbitamos ", email: "oi@example.com", message: " Projeto " },
        "203.0.113.4"
      )
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(supabaseMock.createClient).not.toHaveBeenCalled();
  });

  it("persists sanitized contact data when Supabase is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "server-secret");

    const response = await POST(
      request(
        {
          name: "  Pessoa  ",
          email: " pessoa@example.com ",
          service: " Site ",
          message: " Quero orçamento ",
        },
        "203.0.113.5"
      )
    );

    expect(response.status).toBe(200);
    expect(supabaseMock.rpc).toHaveBeenCalledWith("v3_contact_rate_check", {
      p_ip_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      p_max: 5,
      p_window_secs: 600,
    });
    expect(supabaseMock.from).toHaveBeenCalledWith("v3_contacts");
    expect(supabaseMock.insert).toHaveBeenCalledWith({
      name: "Pessoa",
      email: "pessoa@example.com",
      message: "[Site] Quero orçamento",
    });
  });

  it("returns 500 when persistence fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "server-secret");
    supabaseMock.insert.mockResolvedValueOnce({ error: new Error("db down") });

    const response = await POST(
      request(
        { name: "Pessoa", email: "pessoa@example.com", message: "Projeto" },
        "203.0.113.6"
      )
    );
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Falha ao salvar contato.",
    });
  });

  it("sends the optional EmailJS notification", async () => {
    vi.stubEnv("EMAILJS_SERVICE_ID", "service");
    vi.stubEnv("EMAILJS_TEMPLATE_ID", "template");
    vi.stubEnv("EMAILJS_PUBLIC_KEY", "public");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      request(
        {
          name: "Pessoa",
          email: "pessoa@example.com",
          service: "Automação",
          message: "Projeto",
        },
        "203.0.113.7"
      )
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(options?.body))).toMatchObject({
      service_id: "service",
      template_id: "template",
      user_id: "public",
      template_params: {
        from_name: "Pessoa",
        from_email: "pessoa@example.com",
        message: "[Automação] Projeto",
      },
    });
  });

  it("returns 500 when EmailJS rejects the request", async () => {
    vi.stubEnv("EMAILJS_SERVICE_ID", "service");
    vi.stubEnv("EMAILJS_TEMPLATE_ID", "template");
    vi.stubEnv("EMAILJS_PUBLIC_KEY", "public");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 }))
    );

    const response = await POST(
      request(
        { name: "Pessoa", email: "pessoa@example.com", message: "Projeto" },
        "203.0.113.8"
      )
    );
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Falha ao enviar email.",
    });
  });

  it("returns a controlled 500 when EmailJS is unreachable", async () => {
    vi.stubEnv("EMAILJS_SERVICE_ID", "service");
    vi.stubEnv("EMAILJS_TEMPLATE_ID", "template");
    vi.stubEnv("EMAILJS_PUBLIC_KEY", "public");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const response = await POST(
      request(
        { name: "Pessoa", email: "pessoa@example.com", message: "Projeto" },
        "203.0.113.81"
      )
    );
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Falha ao enviar email." });
  });

  it("never persists fields beyond their configured limits", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "server-secret");
    const response = await POST(
      request(
        { name: `  ${"n".repeat(200)}`, email: "pessoa@example.com", service: "s".repeat(120), message: "m".repeat(4000) },
        "203.0.113.82"
      )
    );
    expect(response.status).toBe(200);
    const payload = supabaseMock.insert.mock.calls.at(-1)?.[0];
    expect(payload.name).toHaveLength(120);
    expect(payload.message).toHaveLength(80 + 3 + 3000);
  });

  it("blocks the sixth request from the same IP when DB limiter is unavailable", async () => {
    const ip = "203.0.113.9";
    for (let index = 0; index < 5; index += 1) {
      const response = await POST(
        request(
          { name: "Pessoa", email: "pessoa@example.com", message: "Projeto" },
          ip
        )
      );
      expect(response.status).toBe(200);
    }

    const blocked = await POST(
      request(
        { name: "Pessoa", email: "pessoa@example.com", message: "Projeto" },
        ip
      )
    );
    expect(blocked.status).toBe(429);
  });
});
