# 📧 Configuração do EmailJS - Orbitamos

## 🔧 **Configuração de Variáveis de Ambiente**

### **1. Copiar arquivo de exemplo:**
```bash
# Copie o arquivo de exemplo
cp apps/web/.env.example apps/web/.env.local
```

### **2. Editar arquivo `.env.local` em `apps/web/`:**

```bash
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=seu_service_id_aqui
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=seu_template_id_aqui
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=sua_public_key_aqui

# Email Configuration
NEXT_PUBLIC_CONTACT_EMAIL=seu_email_aqui
```

### **3. Configuração no Vercel (Produção):**

1. **Acesse o dashboard do Vercel**
2. **Vá para Settings → Environment Variables**
3. **Adicione as variáveis:**
   - `NEXT_PUBLIC_EMAILJS_SERVICE_ID` = `seu_service_id_aqui`
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` = `seu_template_id_aqui`
   - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` = `sua_public_key_aqui`
   - `NEXT_PUBLIC_CONTACT_EMAIL` = `seu_email_aqui`

## 🔐 **Segurança**

- ✅ **Chaves protegidas** por variáveis de ambiente
- ✅ **Fallback** para desenvolvimento local
- ✅ **Não expostas** no código fonte
- ✅ **Configuração** separada por ambiente
- ⚠️ **IMPORTANTE:** Nunca commite chaves reais no repositório
- ⚠️ **IMPORTANTE:** Use placeholders na documentação
- ⚠️ **IMPORTANTE:** Configure as chaves reais apenas no Vercel

## 🚀 **Como Funciona**

1. **Desenvolvimento:** Usa variáveis do `.env.local`
2. **Produção:** Usa variáveis do Vercel
3. **Fallback:** Usa valores padrão se não configurado

## 📋 **Checklist de Deploy**

- [ ] Criar `.env.local` com as variáveis
- [ ] Configurar variáveis no Vercel
- [ ] Testar envio de email em produção
- [ ] Verificar logs de erro
- [ ] Confirmar recebimento de emails

## 🎯 **Próximos Passos**

1. **Criar o arquivo `.env.local`** manualmente
2. **Configurar no Vercel** antes do deploy
3. **Testar** o envio de emails
4. **Monitorar** logs de produção
