# Organização do repositório

Revisão: **04/11/2026**.

## Mapa

| Local | Responsabilidade |
| --- | --- |
| `apps/web/src/app/` | Rotas App Router, layouts e endpoints auxiliares |
| `apps/web/src/components/` | Componentes por domínio |
| `apps/web/src/lib/` | Regras, dados, adaptadores e projeções |
| `apps/web/src/contexts/` | Estados compartilhados de sessão/curso |
| `apps/web/public/` | Assets consumidos pelo aplicativo, Workers e materiais |
| `apps/web/scripts/` | Auditorias, contratos e utilitários locais |
| `apps/web/examples/` | Experimentos isolados, sem rota de produto |
| `supabase/migrations/` | Migrations atuais timestampadas |
| `supabase/tests/database/` | Testes SQL/pgTAP locais |
| `docs/` | Guias indexados por assunto em README.md |
| `docs/migrations/` | Migrations históricas 001–004 |
| `.github/workflows/` | Integração contínua |

`apps/api/` não é o backend ativo da plataforma atual. Vestígios ou diretórios
locais nessa posição não devem motivar reintrodução de um servidor antigo.
O runtime atual está descrito em [ARCHITECTURE.md](ARCHITECTURE.md).

## Assets de produção e arquivos de criação

A mídia usada pelo site fica em `apps/web/public/`. Dentro dela:

- `images/orbitamos/`: cenas editoriais da marca;
- `images/academy/` e `images/laboratorio/`: estudo e catálogo de práticas;
- `images/jogos/`: capas com capturas das experiências reais;
- `images/games/orbi-chapter/`: cenário, personagem e objetos do capítulo 01;
- `course-materials/`: arquivos oferecidos pelas aulas, sujeitos ao fluxo atual
  de materiais e ao estado das permissões documentadas.

Essa separação é funcional. Assets existentes referenciados por URL, imports
ou documentos foram preservados. Novas mídias devem usar nomes descritivos e
versões quando uma substituição exigir rastreabilidade.

Originais de criação, exports e referências não devem ser publicados por
engano em `public/`.

## Organização local feita nesta revisão

As mídias soltas da raiz e as pastas `cards novos`, `fotos do orbi` e
`fotos para o claude ver` foram reunidas em:

```text
docs/local/media/originais-raiz-2026-11-04/
```

Foram preservados **28 arquivos**, aproximadamente **85 MB**, distribuídos em
15 entradas de origem. Nomes e conteúdo foram mantidos, inclusive arquivos
idênticos com nomes diferentes. SHA-256 de cada arquivo foi comparado antes e
depois do movimento.

O arquivo local `manifesto-organizacao.json` registra origens, destinos e hashes
para localização e eventual reversão. Ele e as mídias ficam ignorados pelo Git;
essa pasta não é requisito para executar um clone novo do aplicativo.

Configurações pessoais, `.env*`, instruções locais, logs, caches e arquivos
sincronizados de outros projetos não foram reorganizados.

## Gerados e histórico

- `node_modules/`, `.next/`, `coverage/`, `test-results/` e
  `*.tsbuildinfo` são gerados, não documentação de referência.
- Python e SQLite copiados para `public/vendor/` são preparados em
  `predev/prebuild`; consulte o script de sincronização.
- SQL 001–004 permanece em `docs/migrations/`; SQL atual 005–018 permanece
  em `supabase/migrations/`, com nomes timestampados intactos.
- Auditorias antigas permanecem datadas dentro dos guias. Não existe uma pasta
  `docs/legacy/` nesta organização.
- Alguns arquivos históricos já rastreados, como
  `IDE_ESTUDANTE_TRABALHO_LOCAL.md`, continuam versionados apesar do nome e de
  regras de ignore posteriores. A entrada oficial é o README, não esse registro.

## Próximas alterações

Coloque novos componentes e helpers no domínio correspondente. Evite
renomeações amplas apenas para uniformizar português/inglês: rotas públicas,
links, materiais e saves dependem dos caminhos atuais. Antes de mover um arquivo
referenciado, confira imports, URLs, scripts e links Markdown.
