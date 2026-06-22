# 🔧 Variáveis de Ambiente - Frontend

Crie um arquivo `.env.local` na pasta `apps/web/` com as seguintes variáveis:

```bash
# Supabase (novo backend principal da area logada)
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY

# API legada Spring Boot (fallback; deixe vazio/remova quando Supabase estiver ativo)
# NEXT_PUBLIC_API_URL=http://localhost:8080/api

# EmailJS (opcional - para notificações por email)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_iq6m9yr
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_tq3qtzp
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=r-ZyAFqKXXBrfMNHd
```

## 📝 No Vercel

No dashboard do Vercel, vá em:
1. **Settings** → **Environment Variables**
2. Adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Remova/ignore `NEXT_PUBLIC_API_URL` quando a area logada estiver usando Supabase

**Importante:** Variáveis que começam com `NEXT_PUBLIC_` ficam visíveis no navegador.

