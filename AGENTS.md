# Orbitamos — orientação para agentes

## Entrada do projeto

- O aplicativo principal fica em `apps/web`. Leia
  [apps/web/AGENTS.md](apps/web/AGENTS.md) antes de alterar essa área.
- Comece por [README.md](README.md) e [docs/README.md](docs/README.md).
- Organização de arquivos: [docs/ORGANIZACAO_REPOSITORIO.md](docs/ORGANIZACAO_REPOSITORIO.md).
- Stack, comandos e versões devem ser conferidos no código, package.json e
  lockfile; documentos históricos não substituem essa conferência.

## Documentação e preservação

- Atualize os guias afetados junto com alterações de código.
- Distinga estado implementado, plano futuro, teste local e verificação remota.
- Preserve datas de auditorias e pesquisas; registre uma nova data apenas para
  o que foi efetivamente conferido.
- Preserve rotas, imports, migrations, chaves de save e originais de mídia.
  Organização não justifica quebrar esses contratos.
- Migrations históricas não devem ser renomeadas para combinar com abreviações
  antigas da documentação.
- `docs/local/`, arquivos de ambiente, resultados gerados e instruções pessoais
  locais ficam fora dos commits. Alguns arquivos antigos já versionados podem
  continuar rastreados apesar das regras de ignore; confira o status.
- Não incluir credenciais, dados pessoais de contas reais ou dumps privados em
  fixtures, documentação ou screenshots públicos.

## Verificação

Faça verificações adequadas ao que mudou. Para documentação, confira links,
caminhos, scripts e consistência com o código; não alegue build/testes novos sem
executá-los. Para interface, siga os critérios visuais/mobile e as referências
aprovadas em `apps/web/AGENTS.md`.
