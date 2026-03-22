import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json() as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    // EmailJS não configurado — silenciosamente ok (contato salvo no backend)
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
        from_name: name.trim(),
        from_email: email.trim(),
        message: message.trim(),
        to_email: "contato@orbitamos.com",
      },
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Falha ao enviar email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
