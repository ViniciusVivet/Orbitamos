# Variáveis de ambiente

Última atualização: 2026-07-28

Esta lista foi cruzada com os acessos `process.env` em `apps/web/src`.

## Web atual

| Variável | Obrigatória | Exposição | Uso |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | Navegador | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Navegador | Cliente Supabase sujeito a RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Não | Somente servidor | Contato e rate limit; nunca usar com `NEXT_PUBLIC_` |
| `EMAILJS_SERVICE_ID` | Não | Somente rota do servidor | Envio complementar do contato |
| `EMAILJS_TEMPLATE_ID` | Não | Somente rota do servidor | Template do EmailJS |
| `EMAILJS_PUBLIC_KEY` | Não | Somente rota do servidor | Identificador público usado pela API EmailJS |

Exemplo para `apps/web/.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY

# Opcional: melhora a confiabilidade da gravação/rate limit do contato.
# SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY

# Opcionais: notificação complementar por EmailJS.
# EMAILJS_SERVICE_ID=
# EMAILJS_TEMPLATE_ID=
# EMAILJS_PUBLIC_KEY=
```

Sem as três variáveis EmailJS, a rota ainda pode salvar o contato e retorna
sucesso sem enviar email. Sem `SUPABASE_SERVICE_ROLE_KEY`, ela tenta usar a anon
key; o resultado depende das policies e functions aplicadas.

Os nomes antigos `NEXT_PUBLIC_EMAILJS_*` e `NEXT_PUBLIC_CONTACT_EMAIL` não são
lidos pelo código atual.

## Segurança

- A anon key é pública por desenho; RLS deve proteger os dados.
- A service role ignora RLS e só pode existir em ambiente de servidor.
- Nunca commite `.env`, `.env.local`, tokens, senhas ou chaves reais.
- Após alterar variáveis na Vercel, faça novo deploy.
