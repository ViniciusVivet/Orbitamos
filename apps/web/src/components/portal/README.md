# Portal Orbitamos — Academy e Studio

Esta camada visual atende às entradas `/estudante` e `/colaborador` e à navegação compartilhada das respectivas áreas. Não é uma reescrita dos editores, jogos, formulários ou páginas internas.

## Direção de interface

- Academy: caderno aberto com a próxima aula e a sequência real do curso; biblioteca em capas tipográficas por assunto; bancada de prática. No celular, a estante usa rolagem horizontal nativa com foco de teclado visível.
- Studio: mesa de trabalho com um briefing real em destaque, arquivo de projetos, chamadas abertas e acompanhamento de candidaturas. Composição diferente da Academy, não apenas uma troca de cor.
- Uma ação principal por abertura; os demais recursos têm prioridade visual menor.
- Tipografia Space Grotesk já instalada, superfícies de caderno, capas com lombadas e folha de projeto em CSS. Retirados o cartão inclinado, os símbolos decorativos gigantes e o hero compartilhado. Sem novas dependências, vídeos ou imagens geradas.
- Estados vazios devem orientar o próximo passo; nunca inventar atividade, notificações, entregas ou métricas.
- Movimento discreto e opcional, respeitando `prefers-reduced-motion`. O painel é um ambiente de trabalho e estudo, não uma página de scroll imersivo.

## Organização

- `StudentHome.tsx` e `CollaboratorHome.tsx`: apresentação com dados recebidos por props.
- `PortalPrimitives.tsx`: títulos de seção, estados vazios e carregamento.
- `PortalSidebar.tsx`: navegação por área, conta, avatar, troca de área e foco do menu móvel.
- `PortalExperience.module.css`: identidade visual e regras responsivas encapsuladas.
- As páginas autenticadas continuam usando as APIs existentes. A sessão, as políticas do Supabase e as permissões não foram alteradas.
- A disponibilidade de links internos/administrativos continua dependente do usuário. Visibilidade de menu não substitui autorização no servidor.

## Refinamento após feedback de identidade

A versão anterior melhorava organização, mas ainda repetia um dashboard genérico. A revisão substitui essa estrutura por duas metáforas úteis e coerentes com as tarefas: caderno de estudo e mesa de produção. Não avaliar qualidade apenas pelo número de efeitos ou por screenshots com dados preenchidos.

Preservar estes critérios:
- O conteúdo real protagoniza a abertura. Não usar projetos de clientes como se pertencessem ao colaborador.
- Não apresentar o primeiro item do catálogo como próxima aula quando todas já foram concluídas.
- Status de projeto usa os valores reais da administração, incluindo completed, in_progress, paused e todo.
- Progresso ausente não vira percentual inventado; datas ausentes aparecem como a definir.
- A estante móvel deve mostrar a próxima capa, permitir foco pelo teclado e não alargar a página.
- Não replicar estes blocos automaticamente em toda subpágina: adaptar o formato à tarefa.

A lógica de apresentação está em portalPresentation.ts, com testes de status, datas e percentuais.

## Conferência local

Com o servidor de desenvolvimento em execução na porta 3015:

```text
node scripts/audit-portal-experience.mjs
```

Outra porta pode ser informada em `PORTAL_AUDIT_URL`.

A auditoria usa `/dev/portal-preview`, uma rota que retorna 404 fora de desenvolvimento. As fixtures são demonstrativas e não fazem parte das telas autenticadas. Não usar essa rota para testar autorização de dados reais.

A auditoria cobre as duas áreas em 320, 390, 768, 1024 e 1440 px; rolagem horizontal; erros de JavaScript; abertura/fechamento/foco do menu móvel; estados vazio, carregando e falha com nova tentativa; aula concluída; e redirecionamento de visitante não autenticado. Executa axe em desktop e celular.

Capturas e relatório ficam em `test-results/portal-experience/`, ignorados pelo Git. A inspeção com conta autenticada real continua sendo uma etapa complementar, especialmente para dados e permissões específicos do usuário.

Validação complementar: TypeScript, ESLint dos arquivos alterados, `npm test`, `npm run test:contracts` e `npm run build`.
