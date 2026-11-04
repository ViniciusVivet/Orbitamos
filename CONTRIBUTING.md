# Contribuindo com a Orbitamos

Revisão documental: **04/11/2026**.

## Preparação

Leia [README.md](README.md), [docs/README.md](docs/README.md) e
[apps/web/AGENTS.md](apps/web/AGENTS.md). Use Node.js 22.12+ na linha 22 ou 24+, npm e
as dependências do lockfile:

```powershell
git clone https://github.com/ViniciusVivet/Orbitamos.git
cd Orbitamos/apps/web
npm ci
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev -- --port 3015
```

Configure somente as variáveis necessárias segundo
[VARIAVEIS_AMBIENTE.md](docs/VARIAVEIS_AMBIENTE.md).
Preserve o arquivo local existente e não copie secrets de produção para testes.

## Escopo, branch e publicação

A branch `main` aciona publicação na Vercel. Para trabalhos delegados,
experimentos e contribuições, use uma branch de trabalho identificável, por exemplo:

```powershell
git switch -c feat/melhorar-laboratorio
```

Mantenha o pedido e os critérios de aceitação claros. Ao entregar, informe o que
mudou, como testar e quais limitações continuam. Publicação em `main` segue o
escopo autorizado pelo responsável; não confundir testar em localhost com deploy.

## Organização e mudanças de banco

- Siga [ORGANIZACAO_REPOSITORIO.md](docs/ORGANIZACAO_REPOSITORIO.md).
- Novos acessos a dados devem ficar no módulo do domínio; evite ampliar
  indefinidamente `src/lib/api.ts`.
- Preserve rotas públicas, chaves de progresso e arquivos de criação.
- Para banco, leia também as migrations posteriores à tabela/policy alterada.
  Use uma migration timestampada nova; não reescreva histórico já aplicado.
- Teste mudanças de banco no ambiente descartável de
  [SUPABASE_LOCAL.md](docs/SUPABASE_LOCAL.md).
- Não presuma aplicação no Supabase remoto a partir de um arquivo no Git.

## Validação proporcional

Para documentação, confira caminhos, links e comandos. Para lógica, execute os
testes do domínio e amplie quando necessário. Para interface, teste o fluxo e
inspecione screenshots reais, incluindo mobile e estados vazios/erro.

Comandos disponíveis em `apps/web`:

```powershell
npm test
npm run lint
npm run test:contracts
```

O guia de [testes](docs/TESTES_AUTOMATIZADOS.md) distingue contratos, cobertura,
navegador e pgTAP. Para build de produção, pare o dev antes de
`npm run build`. Não execute dev e build simultaneamente na mesma pasta.

Não marque uma verificação como aprovada sem execução. Registre resultado, erro
ou limitação. Não reutilize contagens históricas como se fossem da alteração atual.

## Segurança e interface

- Não commitar `.env*` reais, tokens, service role ou dados pessoais em fixtures.
- RLS e autorização de backend continuam necessárias, mesmo com proteção de tela.
- Mudanças de PII, admin e storage precisam de verificação negativa de permissões.
- Academia e jogos seguem a referência visual e pedagógica aprovada em AGENTS.md.
- Controles, foco, teclado, toque e mensagens de erro fazem parte da entrega.
- Não prometer prazo, certificação ou resultado profissional sem base operacional.

## Commit e revisão

Use commits por assunto e títulos claros, por exemplo
`fix(auth): preserva sessão após refresh` ou
`docs: atualiza guia das migrations`.

No PR/relatório, explique o problema resolvido, comportamento resultante,
verificações realizadas e riscos materiais. Inclua screenshots quando a mudança
for visual e detalhes de migração/rollback quando houver alteração de banco.
