# 🔧 Variáveis de Ambiente - Frontend

Crie um arquivo `.env.local` na pasta `apps/web/` com as seguintes variáveis:

```bash
# URL da API do Backend
# Local: http://localhost:8080/api
# Produção: https://seu-backend.onrender.com/api (ou Railway, etc)
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# EmailJS (opcional - para notificações por email)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_iq6m9yr
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_tq3qtzp
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=r-ZyAFqKXXBrfMNHd
```

## 📝 No Vercel

No dashboard do Vercel, vá em:
1. **Settings** → **Environment Variables**
2. Adicione `NEXT_PUBLIC_API_URL` com a URL do seu backend hospedado
3. Exemplo: `https://orbitamos-backend.onrender.com/api`

**Importante:** Variáveis que começam com `NEXT_PUBLIC_` ficam visíveis no navegador.

