# Orbitamos Web

Última atualização: 2026-07-28

Aplicativo principal da Orbitamos em Next.js 16, React 18, TypeScript e
Tailwind CSS.

## Responsabilidades

- site comercial e portfólio;
- autenticação Supabase;
- áreas de estudante, colaborador e administração;
- academia, prática, jogos e progresso;
- fórum e mensagens;
- vagas, candidaturas, projetos e squads;
- rotas auxiliares de contato e materiais.

## Executar localmente

```powershell
cd apps/web
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

No macOS/Linux, substitua `Copy-Item` por:

```bash
cp .env.example .env.local
```

O exemplo local deve conter:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

Veja a lista completa e as regras de segurança em
[docs/VARIAVEIS_AMBIENTE.md](../../docs/VARIAVEIS_AMBIENTE.md).

## Scripts existentes

```powershell
npm run dev
npm run lint
npm test
npm run test:coverage
npm run test:contracts
npx tsc --noEmit
npm run build
npm run start
```

Consulte os resultados conhecidos e limites da suíte em
[docs/TESTES_AUTOMATIZADOS.md](../../docs/TESTES_AUTOMATIZADOS.md).

## Deploy

Na Vercel:

- Root Directory: `apps/web`;
- configure URL e anon key do Supabase;
- faça novo deploy após mudar variáveis.

Documentação: [docs/README.md](../../docs/README.md).
