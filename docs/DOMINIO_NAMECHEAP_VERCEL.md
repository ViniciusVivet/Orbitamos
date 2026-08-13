# Domínio orbitamosbr.com

Última verificação: 2026-07-28

## Estado conhecido

| Uso | Valor |
| --- | --- |
| Site principal | `https://www.orbitamosbr.com` |
| Apex | `https://orbitamosbr.com` |
| Hospedagem | Vercel, app em `apps/web` |
| A record de `@` | `216.198.79.1` |
| CNAME de `www` | `f271d0eb0fbd35c4.vercel-dns-017.com` |

Os dois registros DNS acima foram confirmados com consulta DNS em 2026-07-28.
O site em `www` também respondeu com a home da Orbitamos.

Os valores são específicos da configuração atual da Vercel. Se o dashboard
mostrar valores diferentes no futuro, use os valores apresentados pelo
dashboard e atualize este documento.

## Configuração na Vercel

1. Abra o projeto da Orbitamos.
2. Em `Settings -> Domains`, mantenha `orbitamosbr.com` e
   `www.orbitamosbr.com`.
3. Defina `www.orbitamosbr.com` como domínio principal.
4. Configure o apex para redirecionar ao domínio principal.
5. Se recriar o projeto, use `apps/web` como Root Directory.

## Configuração na Namecheap

Em `Domain List -> Manage -> Advanced DNS`, a configuração verificada é:

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| A Record | `@` | `216.198.79.1` | Automatic |
| CNAME Record | `www` | `f271d0eb0fbd35c4.vercel-dns-017.com` | Automatic |

Não mantenha registros conflitantes para `@` ou `www`.

## Variáveis do aplicativo

Na Vercel, configure no mínimo:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Consulte
[VARIAVEIS_AMBIENTE.md](VARIAVEIS_AMBIENTE.md).

## Validação após mudança

```powershell
Resolve-DnsName orbitamosbr.com -Type A
Resolve-DnsName www.orbitamosbr.com -Type CNAME
```

Depois valide em navegador:

- `www` abre o site com HTTPS;
- o apex redireciona para `www`;
- não há aviso de certificado;
- login e formulário continuam funcionando.

DNS pode levar algum tempo para propagar. Não altere novamente os registros
durante a propagação sem comparar o dashboard da Vercel.
