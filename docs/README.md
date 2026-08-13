# Documentação da Orbitamos

Última atualização: 2026-07-28

Este diretório separa documentação operacional atual, arquitetura por domínio,
migrations e guias de operação.

## Documentos atuais

| Documento | Finalidade |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitetura executada pelo código atual |
| [INFRA_ATUAL.md](INFRA_ATUAL.md) | Infraestrutura e serviços de produção conhecidos |
| [VARIAVEIS_AMBIENTE.md](VARIAVEIS_AMBIENTE.md) | Variáveis efetivamente lidas pelo código |
| [SUPABASE_NATIVE_MIGRATION.md](SUPABASE_NATIVE_MIGRATION.md) | Ordem e validação das migrations Supabase |
| [SUPABASE_LOCAL.md](SUPABASE_LOCAL.md) | Banco descartável e testes locais de RLS |
| [TESTES_AUTOMATIZADOS.md](TESTES_AUTOMATIZADOS.md) | Comandos existentes e limites da cobertura |
| [DOMINIO_NAMECHEAP_VERCEL.md](DOMINIO_NAMECHEAP_VERCEL.md) | DNS e domínio da Vercel |
| [ARQUITETURA_ESTUDANTE.md](ARQUITETURA_ESTUDANTE.md) | Rotas e dados da área do estudante |
| [ARQUITETURA_COLABORADOR.md](ARQUITETURA_COLABORADOR.md) | Rotas e dados das áreas de colaborador e admin |
| [FUNCIONALIDADES_FUTURO.md](FUNCIONALIDADES_FUTURO.md) | Backlog; não descreve funcionalidade entregue |

## Convenções

- Um recurso presente no código ou em uma migration é descrito como
  **implementado no repositório**.
- Uma migration só pode ser descrita como **aplicada em produção** depois de
  verificação no projeto Supabase.
- Um fluxo só pode ser descrito como **validado em produção** depois de teste
  no ambiente publicado.
- `docs/local/` contém runbooks locais ignorados pelo Git e nunca deve guardar
  credenciais sem proteção adequada.

## Migrations

As migrations atuais ficam em [`supabase/migrations`](../supabase/migrations).
Os arquivos `001` a `004` em [migrations](migrations) pertencem ao modelo de
dados anterior. A plataforma Supabase atual começa na `005`; a ordem completa está em
[SUPABASE_NATIVE_MIGRATION.md](SUPABASE_NATIVE_MIGRATION.md).
