# Portal Orbitamos — Academy e Studio

Revisão documental: **04/11/2026**.

Esta camada atende às entradas `/estudante` e `/colaborador` e à navegação
compartilhada. Os editores, jogos, formulários e páginas de domínio têm seus
componentes próprios.

## Direção atual

- Academy: continuidade e escolha de trilha com mídia contextual na primeira
  dobra; catálogo visível cedo e instruções necessárias durante a tarefa.
- Studio: projeto real em destaque, contexto de trabalho, oportunidades,
  candidaturas e apresentação profissional.
- Uma ação principal na entrada. Métricas, explicações e filtros auxiliares
  não devem empurrar o conteúdo útil para baixo.
- Fotos editoriais são ilustrações de contexto, não prova de pessoas da equipe.
  Capas dos jogos mostram as experiências reais.
- Estados vazios e erros orientam o próximo passo sem inventar atividade.
- Movimento respeita `prefers-reduced-motion`. Fluxos de trabalho e estudo
  mantêm foco e legibilidade, com uso de teclado e toque verificado.

Critérios: [padrão visual da Academy](../../../../../docs/PADRAO_VISUAL_ACADEMY.md)
e [Studio e capítulo Orbi](../../../../../docs/STUDIO_E_ORBI_CAPITULO_01.md).

## Componentes e regras

- `StudentHome.tsx`: entrada e continuidade do estudante.
- `CollaboratorHome.tsx` e CSS próprio: priorização e abertura do projeto exato,
  dados recebidos por props, loading e recuperação de erro.
- `PortalSidebar.tsx`: navegação por área e foco do menu mobile. No Studio,
  separa trabalho, oportunidades, apresentação e conta/acesso.
- `PortalHeader.tsx`, `PortalPrimitives.tsx` e `PortalExperience.module.css`:
  estrutura e elementos compartilhados.
- `portalPresentation.ts`: apresentação e tratamento de dados.
- `src/lib/collaboratorExperience.ts`: status, prazo, prioridade, filtros e
  seleção do projeto autorizado.
- Os detalhes e editores ficam também em `src/components/colaborador/`;
  catálogo/continuidade pedagógica, em `src/components/estudante/`.

Status e percentuais usam dados reais. Projeto concluído não vira “A fazer”;
ausência de progresso não gera percentual inventado. Visibilidade de menu não
substitui autorização do servidor ou RLS.

## Prévias e auditorias

Com o servidor na porta 3015:

```text
/dev/portal-preview?role=work
/dev/workspace-preview?view=projects
/dev/workspace-preview?view=applications
/dev/workspace-preview?view=portfolio
/dev/academy-preview?view=home
```

Essas rotas retornam 404 fora de desenvolvimento. Fixtures isoladas não
substituem testes de autorização ou gravação em contas reais.

Roteiros atuais:

```powershell
node scripts/audit-collaborator-workspace.mjs
node scripts/audit-orbi-chapter.mjs
node scripts/audit-orbi-chapter-resilience.mjs
```

`scripts/audit-portal-experience.mjs` preserva verificações da rodada anterior;
seus seletores podem exigir revisão quando o layout muda. Resultados novos
devem citar o roteiro e a data, sem tratar todos os scripts históricos como
parte do CI.

As capturas ficam em `test-results/`, ignoradas pelo Git.
Veja o [guia de testes](../../../../../docs/TESTES_AUTOMATIZADOS.md).
