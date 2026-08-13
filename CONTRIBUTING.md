# Contribuindo com a Orbitamos

Última atualização: 2026-07-28

## Ambiente principal

Pré-requisitos:

- Node.js compatível com Next.js 16;
- npm;
- acesso a um projeto Supabase de desenvolvimento para fluxos persistentes.

```powershell
git clone https://github.com/ViniciusVivet/orbitamos.git
cd orbitamos/apps/web
npm install
Copy-Item .env.example .env.local
npm run dev
```

Edite `apps/web/.env.local` usando
[docs/VARIAVEIS_AMBIENTE.md](docs/VARIAVEIS_AMBIENTE.md). Não use secrets de
produção no desenvolvimento.

## Antes de alterar

1. Leia [docs/README.md](docs/README.md).
2. Identifique quais tabelas, policies e buckets Supabase o fluxo utiliza.
3. Para mudanças de banco, leia as migrations posteriores à tabela alterada:
   uma policy antiga pode ter sido endurecida em arquivo posterior.
4. Não edite migrations já aplicadas para esconder uma correção. Crie a próxima
   migration cumulativa e idempotente.
5. Valide migrations e RLS no Supabase local conforme
   [docs/SUPABASE_LOCAL.md](docs/SUPABASE_LOCAL.md).

## Validação

Execute no diretório `apps/web`:

```powershell
npm run lint
npx tsc --noEmit
npm run test:coverage
npm run test:contracts
npm run build
```

O estado conhecido e as limitações da suíte estão em
[docs/TESTES_AUTOMATIZADOS.md](docs/TESTES_AUTOMATIZADOS.md).

Não documente um comando como aprovado se ele não foi executado. No PR,
registre resultado, erro ou bloqueio de ambiente.

## Segurança

- Nunca commite `.env`, service role, senha, token ou chave privada.
- Toda tabela acessível pela anon key deve ter RLS revisada.
- Proteção de tela não substitui autorização no banco.
- Dados pessoais não devem ser incluídos em logs, fixtures ou screenshots.
- Mudanças em PII, admin, contato ou storage exigem teste negativo com usuário
  sem permissão.

## Padrões

- TypeScript estrito; evite `any` sem justificativa local.
- Componentes devem ter responsabilidade limitada.
- Acesso a dados novo deve ficar no módulo do domínio, não ampliar
  indefinidamente `src/lib/api.ts`.
- Use Conventional Commits, por exemplo:

```text
feat(cursos): adiciona ordenação de módulos
fix(auth): preserva sessão após refresh
docs: atualiza ordem das migrations
```

## Pull request

Inclua:

- problema e resultado esperado;
- arquivos/domínios afetados;
- migrations e impacto de rollback, se houver;
- comandos executados e resultados;
- validação manual;
- screenshots para mudança visual;
- riscos ou pontos ainda não testados.

Não prometa prazo de review, certificado, acesso especial ou canal comunitário
sem uma política operacional existente.
