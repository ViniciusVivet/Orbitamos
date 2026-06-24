# Testes automatizados

Ultima atualizacao: 2026-06-24

## Estado atual

O app principal e `apps/web`. O backend Spring em `apps/api` e legado/fallback, entao os testes Java ajudam a preservar historico tecnico, mas nao sao o principal criterio para publicar a versao atual.

## Comandos principais

Frontend:

```bash
cd apps/web
npm run lint
npm run build
```

Backend legado:

```bash
cd apps/api
mvn test
```

## Onde adicionar testes novos

| Parte | Local sugerido | Observacao |
| --- | --- | --- |
| Web/React | `apps/web/src/**/*.test.tsx` | Configurar Vitest ou Jest antes de criar suite nova |
| Rotas auxiliares do Next | perto da rota testada | Priorizar contato, materiais e auth helpers |
| Spring legado | `apps/api/src/test/java` | Manter se o Java voltar a ser usado |

## Prioridade real

Como o produto esta em migracao para Supabase, a validacao mais importante hoje e:

- Build do Next sem erro.
- Login/cadastro com Supabase Auth.
- Leitura e escrita em tabelas `v3_*` respeitando RLS.
- Acesso a aulas e materiais.
- Contato salvo em `v3_contacts`.
- Navegacao entre area de estudante e colaborador.

## Quando ampliar cobertura

Adicionar testes automatizados primeiro nos fluxos que quebram dinheiro ou login:

- Formulario de contato.
- Login/cadastro/perfil.
- Listagem e preview de materiais de aula.
- Permissoes de colaborador/admin.
- Funcoes de progresso do aluno.
