# Variaveis de ambiente do frontend

Crie `apps/web/.env.local` somente para desenvolvimento local.

```bash
# Supabase: backend principal da area logada
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY

# API Spring legada: deixe ausente/vazio no modo atual
# NEXT_PUBLIC_API_URL=http://localhost:8080/api

# EmailJS opcional para notificacao de contato via rota /api/contact
EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_PUBLIC_KEY=
```

## Vercel

No dashboard da Vercel:

1. Abra `Settings -> Environment Variables`.
2. Configure `NEXT_PUBLIC_SUPABASE_URL`.
3. Configure `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Nao configure `NEXT_PUBLIC_API_URL` enquanto Supabase for o backend principal.

Variaveis `NEXT_PUBLIC_*` ficam visiveis no navegador. Nunca coloque senha, service role key ou JWT secret nelas.
