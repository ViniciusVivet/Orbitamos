# SQL com Orbi — oficina da loja

## Escopo da primeira entrega

Entrada atual: uma aventura de dez pequenas atividades na loja do Orbi, seguida pela oficina de cinco missões para criar a tabela `produtos`, cadastrar mercadorias, consultar, filtrar e atualizar. É uma introdução a SQL, não um curso completo nem formação profissional.

Entrada: Laboratório → SQL com Orbi. Rota autenticada: `/estudante/trilhas/sql`. Preview exclusivamente em desenvolvimento: `/dev/sql-preview`.

## Direção pedagógica

### Aventura refinada em 24 de outubro de 2026

O primeiro editor foi considerado excessivamente técnico e pouco parecido com jogo pelo usuário. A nova entrada é uma loja ilustrada com três produtos e uma missão por vez. A estrutura existente de execução SQL foi reaproveitada.

Sequência: identificar uma linha → identificar estoque → escolher SELECT → escrever FROM → prever o filtro → testar menor que 5 → escrever consulta menor que 10 → explicar a diferença entre resultado e origem → consultar maior ou igual a 7 → explicar WHERE. Resultado e estado da tabela são verificados pelo SQLite nas tarefas de execução. Uma resposta que altera dados ou esquema não é aprovada, mesmo se imitar o resultado esperado.

As prateleiras reagem às consultas; o resultado real fica ao lado no computador e junto do cenário compacto no celular. O aluno recebe retorno imediato nas escolhas e na escrita de FROM. Comandos completos são executados pelo botão Testar na loja, preservando a diferença entre escrever e consultar. Pistas são opcionais e registradas; conclusão não é apresentada como certificação de domínio. Pode repetir o desafio final.

Progresso da aventura usa `orbitamos-sql-quest-v1-{userId}`. A oficina antiga usa sua chave anterior, preservada; fica acessível em Opções → Abrir oficina de criação e ao concluir a aventura. Não há migração destrutiva nem sincronização entre aparelhos. Reinício exige confirmação e oferece desfazer durante a sessão.

A revisão automática em outro dia, a expansão para outras linguagens e o inglês contextual continuam como próximos passos. A primeira entrega concentra a experiência completa nesta missão SQL.

Verificação adicional: `src/lib/sqlQuest.test.ts` executa casos reais, resultados errados, alterações ocultas e progresso inválido. `node scripts/audit-sql-quest.mjs` cobre as dez atividades em desktop, WebKit/iPhone e 320px com axe, retomada e reinício. O teste da oficina anterior continua disponível em `scripts/audit-sql-studio.mjs`, agora entrando pelo menu de opções.

Rodada final: 293 testes em 32 arquivos passaram; lint direcionado passou. A nova aventura completou as dez atividades, execução SQLite, erro recuperável, retomada, reinício e verificação axe em desktop, WebKit/iPhone 13 e Chromium 320px. A oficina anterior passou no desktop. Evidências locais em `apps/web/test-results/sql-quest/` e `sql-studio/`.

Build de produção concluído com sucesso nesta rodada. Permaneceu o aviso preexistente de tracing amplo em `api/course-materials/[...path]`. Alterações locais, sem commit ou push.

Dois ajustes surgiram da revisão independente: removida a exigência de ORDER BY antes de ensiná-la (validação aceita qualquer ordem das linhas corretas, preservando multiplicidade); mantida e reconstruída a resposta anterior na pergunta sobre o Caderno, inclusive após recarregar. O menu fecha antes de confirmar reinício no celular. O cabeçalho da Academy respeita o topo da tela durante a aventura. Testar em iPhone físico continua necessário para conferir o teclado e o uso em condições reais.

O conteúdo abaixo descreve a oficina de criação, mantida como próximo ambiente após a aventura.

- Orbi apresenta uma necessidade concreta de uma pequena loja, não uma lista de comandos sem contexto.
- Referência compacta acompanha a linha ativa. O aluno escreve cada linha; não há preenchimento automático.
- Acima de cada linha: significado em português, discreto mas legível. Na referência: o motivo dos sinais e palavras.
- Enter navega para a próxima linha; Tab mantém navegação nativa. Atalhos de símbolos ajudam no celular.
- Explicações e referência podem ser ocultadas para praticar a recuperação de memória.
- A planta reconhece a escrita do exemplo. Ela é explicitamente diferente do banco real: verde não significa execução nem domínio do conceito.
- Executar é intencional, inclusive para experimentar código incompleto. A missão é aprovada pelo esquema e pelos dados reais, não por igualdade literal do código.
- O filtro mostra uma consulta separada da tabela armazenada. UPDATE sem WHERE executa, mas falha no objetivo por alterar o produto errado também.
- Não confundir digitação com compreensão: próximas entregas devem acrescentar previsão de resultados, pequenas variações sem referência e explicação pelo próprio aluno.

## Implementação e limites

`sql.js` 1.14.2 executa SQLite WebAssembly em Web Worker dedicado. Scripts e WASM são copiados de node_modules para public/vendor/sqljs no predev/prebuild pelo sincronizador existente. A licença acompanha os arquivos. Nenhum CDN é necessário.

A cada execução, um banco em memória é criado e os comandos das missões anteriores são reaplicados. A execução atual não acessa Supabase nem dados reais da Orbitamos. O banco temporário é descartado ao encerrar o worker.

Limites: 30 segundos para carregar, 4 segundos para executar, 30 instruções por execução, até 200 linhas retornadas e 1.000 caracteres por campo escrito. Worker pode ser interrompido. Esses limites são proteção prática da oficina, não garantia para executar qualquer carga SQL arbitrária.

SQLite é o dialeto ensinado. `STRICT` é explicado como específico deste banco; PostgreSQL e SQL Server têm diferenças. `NOT NULL` não proíbe texto vazio. A chave primária identifica cada registro. Consultas usam ORDER BY para ordem explícita.

Progresso e rascunhos ficam em localStorage por identificador de conta. Não sincronizam entre dispositivos; limpar dados do navegador apaga esse progresso. Falha no armazenamento é informada. Editar uma missão invalida sua conclusão e as posteriores, preservando os textos. Reinício exige confirmação e oferece recuperação do rascunho durante a sessão.

## Verificação

- `npm test -- --maxWorkers=2`: inclui testes que executam o próprio worker em SQLite real, cobrindo cinco missões, SQL equivalente, tipos, sintaxe, chave duplicada, limites, reinício e persistência.
- `node scripts/audit-sql-studio.mjs`: fluxo real em Chromium desktop, WebKit/iPhone 13 e Chromium 320px, com axe, overflow, execução, erro preservando código, restauração, mapa e reinício.
- WebKit simulado não substitui teste com teclado virtual em iPhone físico.
- `npm run build`: build de produção; preview indisponível em produção por projeto.

Rodada de 2026-10-10: 277 testes em 31 arquivos passaram. Auditorias desktop, WebKit/iPhone 13 e tela 320px passaram, sem violações axe no módulo e sem overflow horizontal de página. TypeScript e lint direcionado passaram. Evidências locais em `apps/web/test-results/sql-studio/` (não versionadas). Um primeiro build encontrou sintaxe corrompida em `.next/dev/types/validator.ts`; o arquivo gerado foi preservado nessa pasta de evidências e o build repetido sem o dev server concorrente.

Build repetido concluído com sucesso. Permanece aviso preexistente de tracing amplo em `api/course-materials/[...path]`, além da base Browserslist desatualizada. Não houve publicação nesta rodada.

## Próximos módulos, ainda não implementados

1. Variações sem copiar: outros produtos, filtros e previsões.
2. Clientes e pedidos: relações e chaves estrangeiras.
3. JOIN e agregações, com perguntas de negócio.
4. Transações e alterações seguras; conectar a API em uma trilha apropriada.

## Referências técnicas

- https://sql.js.org/documentation/
- https://www.sqlite.org/lang_createtable.html

## Dependências

Auditoria npm em 2026-10-10 relatou 22 vulnerabilidades no conjunto do projeto (7 moderadas, 14 altas, 1 crítica), incluindo Next. sql.js e seus tipos não constavam como pacotes afetados. Não houve atualização ampla automática: as correções exigem uma rodada separada de compatibilidade e segurança antes de afirmar que o projeto está livre de vulnerabilidades.
