# Fluxo unificado da Academy

Estado conferido no código em 04/11/2026. Histórico de implementação desde
26/10/2026. Esta atualização é documental; não repete as verificações de
navegador, autenticação ou build das rodadas anteriores.
Adendo de 12/11/2026: identidade de retomada da Oficina do Pulso conferida na
implementação; verificação atual de navegador/publicação registrada à parte.

Referências: [arquitetura e rotas](ARQUITETURA_ESTUDANTE.md),
[mapa da experiência](MAPA_EXPERIENCIA_ACADEMY.md) e
[capítulo aprovado da Entrega do Orbi](STUDIO_E_ORBI_CAPITULO_01.md).

## Dois contextos de navegação

O site público mantém projetos, serviços e orçamento. As rotas de estudante,
colaborador e mensagens usam o contexto de trabalho/estudo, sem a navegação e
os widgets comerciais sobrepostos. `SiteFrame` controla apresentação; proxy,
autenticação e permissões continuam responsáveis pelo acesso.

O menu do estudante tem cinco destinos estáveis:

| Destino | Função |
| --- | --- |
| Início — `/estudante` | Próxima ação da trilha escolhida e retomada da atividade salva |
| Trilhas — `/estudante/trilhas` | Primeiros passos, piloto C#, SQL e aulas de apoio por assunto |
| Praticar — `/estudante/pratica` | Código; abas para Jogos, Inglês e Revisão |
| Progresso — `/estudante/progresso` | Aulas e evidências das atividades, sem misturar percentuais |
| Comunidade — `/estudante/comunidade` | Fórum público, Discord, mentorias e mensagens |

Conta e configurações, troca de área, retorno ao site e saída ficam no rodapé.
O colaborador mantém seus destinos de trabalho com o mesmo cabeçalho.

## Continuidade sem inventar domínio

`academyActivity` combina os registros e rascunhos existentes, sem reescrevê-los.
Uma visita é diferente de uma tentativa, de uma etapa validada e de uma revisão.
Aulas, código, C# e SQL conservam suas próprias unidades e denominadores.
Não existe um percentual agregado que finja medir domínio de programação.

O índice `orbitamos-academy-resume-v1-<userId>` guarda apenas o destino interno
de uma atividade e sua data. A lista de rotas e parâmetros é restrita. Visitar
uma rota nunca concede conclusão. Saves antigos sem data são apresentados como
atividade salva, sem inventar quando foram feitos. O escopo é por conta neste
navegador; esses registros locais ainda não sincronizam entre dispositivos.

A página inicial prioriza a escolha opcional de **Primeiros passos**, **C# & .NET**
ou **SQL com Orbi**; uma visita fora dessa trilha permanece como retomada
secundária. Sem escolha, usa a atividade disponível, a próxima aula ou a primeira
linha de código. A seleção é guardada em
`orbitamos-academy-study-path-v1-<userId>` e pode ser trocada ou limpa sem apagar
rascunhos. C# preserva `module=variables|conditions|loops` na URL; SQL preserva
`mode=workshop`. Os cursos em vídeo anteriores permanecem acessíveis como apoio,
sem duplicar as trilhas de prática.

## Conteúdo disponível em 04/11/2026

- **Primeiros passos:** quatro entregas JavaScript, de perfil a orçamento de
  console, com guia, alteração validada e aplicação independente. Esse ciclo não
  está implementado em todos os desafios do laboratório.
- **C# & .NET:** piloto de variáveis, condições e laços. Métodos, objetos, dados,
  APIs, testes e entrega profissional são etapas do mapa em preparação.
- **SQL:** aventura de dez etapas e oficina de cinco missões, de `CREATE TABLE`
  e `INSERT` a consulta, filtro e `UPDATE`. A oficina executa SQL no ambiente local
  de prática; não representa um banco pessoal publicado.
- **Jogos:** seis experiências na central `/estudante/jogos`: A loja do Orbi,
  Entrega do Orbi, Inglês em cena, Vila dos Blocos, Guia o Orbi e Monte o Código.
  Revisão de bolso é um formato complementar em `/estudante/jogos/revisao`.

As pontes levam à prática do conceito: SQL abre sua oficina; os demais jogos
abrem desafios do laboratório, com origem identificada e sem substituir o
rascunho do aluno. Elas não são conclusão automática nem prova de transferência.
Na central, C# selecionado prioriza jogos de lógica; nas outras escolhas, a
recomendação ainda usa retomada/primeira experiência incompleta. Ainda não há
vínculo curricular de cada jogo com cada entrega da trilha.

### Entrega do Orbi: capítulo atual e histórico

`/estudante/jogos/entregas-do-orbi` abre **A última luz do bairro**. O aluno explora,
abre terminais, escreve declarações curtas e testa a consequência no cenário:
alcance da ponte, altura do elevador e energia calculada a partir de custo.
Concluir exige programa adequado e chegada física ao destino; a pergunta final
e a assistência de movimento da v1 não descrevem este capítulo.

O save `orbitamos-orbi-chapter-v2-<userId>` é a fonte de conclusão das três
entregas. O save v1 permanece como histórico. O diário marca `contentVersion=2`
e preserva datas/revisões antigas em `legacy*`; importar o diário ou abrir o jogo
não conclui o capítulo. A atualização entre abas do mesmo navegador não equivale
a sincronização entre aparelhos. Ver detalhes no
[registro de 04/11](STUDIO_E_ORBI_CAPITULO_01.md).

Desde a implementação de 12/11, a Oficina opcional tem destino próprio de
retomada na mesma página:
`/estudante/jogos/entregas-do-orbi#oficina-do-pulso`. Quando ela é a atividade
recente, a Home mostra **Oficina do Pulso** e a rota corrente do save da conta,
respeitando a prioridade da trilha selecionada. A troca de subaventura notifica
o tracker mesmo com `history.replaceState`; a conversão para prévia conserva
apenas essa âncora permitida.

A Oficina tem duas rotas e save `orbitamos-orbi-pulse-v1-<userId>` separado.
A retomada não a insere no denominador de atividades da central nem concede
XP da Entrega. Não aceita hashes arbitrários ou novos redirects. Detalhes do
guia, previsão opcional, retorno ao terminal e QA de 12/11 em
[EVOLUCAO_ENTREGA_ORBI.md](EVOLUCAO_ENTREGA_ORBI.md#bloco-b--fatia-implementada-em-12112026).

## Celular e acessibilidade

O cabeçalho e a sidebar compartilham títulos, destino ativo e contexto. O menu
mobile prende o foco enquanto aberto, fecha com Escape e devolve o foco ao botão,
inclusive no WebKit. Nomes extensos no rodapé são truncados dentro da sidebar.
Os atalhos inferiores aparecem nas páginas de escolha, sem cobrir os controles
dos jogos e do editor. A navegação comercial continua disponível no site público.

## Retorno depois do login

`authNavigation` valida destinos relativos internos e preserva query e âncora,
recusando URLs externas, escapes e loops de autenticação. Login, cadastro,
restauração de sessão e guards usam a mesma política. Mensagens recebe
`area=student|work` e considera o contexto salvo por conta para voltar à área certa.

Limite registrado na auditoria de 26/10: a configuração local do Supabase impediu
concluir uma autenticação real. As regras de retorno tinham testes unitários e
de proxy, mas isso não equivalia a um login ponta a ponta aprovado. Esta revisão
documental não inspecionou credenciais/configuração nem repetiu o login; não
atualiza esse resultado histórico.

## Prévias e verificações registradas

As prévias continuam disponíveis apenas em desenvolvimento:

- `/dev/academy-preview?view=home`: início com continuidade local.
- `/dev/academy-preview?view=tracks`: catálogo de trilhas.
- `/dev/academy-preview?view=progress`: evidências de progresso.
- `/dev/academy-preview?view=community`: comunidade e ajuda.
- `/dev/academy-preview`: jogos e formatos de prática.
- `/dev/lab-preview?academy=1`: laboratório integrado à mesma prévia.
- `/dev/csharp-preview?academy=1`: trilha C# com o mesmo identificador local.
- `/dev/academy-preview?activity=delivery`: capítulo atual da Entrega do Orbi.
- `/dev/academy-preview?activity=delivery#oficina-do-pulso`: Oficina opcional,
  com identidade própria na retomada.
- `/dev/academy-preview?activity=sql&mode=workshop`: oficina SQL.
- `/dev/academy-preview?activity=english|village|review`: use um dos valores para
  abrir Inglês em cena, Vila dos Blocos ou Revisão.

Links de conta, mensagens e conteúdos privados continuam exigindo autenticação;
a prévia não simula acesso aos dados privados.

Scripts de verificação em `apps/web/scripts/`:

- `audit-academy-navigation.mjs`: destinos, formato ativo, menu/foco mobile,
  retomada, evidências de visita e preservação do site comercial.
- `audit-academy-catalog.mjs`: trilhas e comunidade.
- `audit-academy-continuity.mjs`: saves preservados, retomada e módulo C#.
- `audit-auth-navigation.mjs`: registra também o bloqueio de configuração do login.

Os relatórios e capturas históricos ficam em `apps/web/test-results/`. Os perfis
incluem desktop, WebKit com iPhone 13 e viewport de 320 pixels. A suíte unitária
registrou 425 testes em 45 arquivos na rodada de aplicação independente e transporte
seguro de código. Build, lint e auditorias de navegador devem ser
conferidos novamente quando houver mudanças de comportamento. A rodada do capítulo
de 04/11 registra sua própria validação em `STUDIO_E_ORBI_CAPITULO_01.md`; os números
acima não são uma execução nova nem o total atual da suíte.

## Histórico — 26 a 28/10/2026

Na rodada posterior ao primeiro deploy, `academyStudyPath` passou a guardar uma
escolha opcional de trilha C#/SQL por conta neste navegador. `AcademyContinue`
prioriza o próximo passo real dessa trilha; a última atividade visitada permanece
como ação secundária. Trocar ou limpar a escolha não altera os registros anteriores.
O modo da oficina SQL é refletido em `mode=workshop`, inclusive após reload e
voltar/avançar. O guia mobile recolhe contexto/opções e aproxima a instrução do
editor, preservando a explicação da linha e o mapa para consulta.

Em 28/10/2026, **Primeiros passos** foi acrescentado às opções de trilha principal.
Seu mapa tem quatro entregas JavaScript, em ordem de pré-requisitos. Guia, alteração
e aplicação independente têm evidências distintas; completar só o guia não encerra
essas entregas. A escolha C#/SQL existente e os rascunhos anteriores são preservados.
O transporte ao modo livre usa uma escolha explícita quando há conflito e mantém
versões recuperáveis, sem atribuir uma conclusão pela importação do código.

Para testar localmente: `/dev/academy-preview?view=tracks` → Primeiros passos, ou
`/dev/ide-preview/variaveis-js?academy=1`. Na produção, o caminho equivalente é
`/estudante/pratica/variaveis-js`, dentro da conta do aluno. Os saves novos continuam
locais por conta/navegador, sem sincronização entre aparelhos.
