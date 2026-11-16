# Formação Orbitamos — objetivo, régua e ponto de continuidade

Revisão de **16/11/2026**, sobre a publicação `6613f3f`. Este é o controle do
escopo da **Academy**, não do site comercial. O [plano integral](PLANO_FORMACAO_ORBITAMOS.md)
e o [registro de execução](EVOLUCAO_FORMACAO_ACADEMY.md) continuam sendo as fontes
de diagnóstico e evidência. Este arquivo fixa o recorte da primeira entrega,
as frentes de planejamento e as prioridades.

O [mapa de execução](MAPA_EXECUCAO_ACADEMY.md) é a fila operacional vigente:
tarefas, subtarefas, dependências, estados e próximo ID. As prioridades deste
controle orientam a fila; seus registros históricos não são uma segunda lista
concorrente de trabalho.

## O que o usuário quer

Uma formação gratuita pelo povo, com cuidado de produto comparável ao esperado
de Alura/DIO e identidade própria. Uma pessoa com pouca familiaridade precisa
reconhecer onde está, entender o pedido, escrever código, receber ajuda útil e
conseguir aplicar a ideia em outra situação. Estudar pelo celular nas pausas
do trabalho é parte central do produto.

- Entrada visual e ação clara; evitar paredes de texto e cartões vazios com ícones.
- Caminho inteiro visível, posição atual e próximo passo coerentes; formatos não
  devem se transformar em dezenas de novos menus.
- Muito código real, com exemplo, previsão, investigação, alteração e tentativa
  independente. Assistir, copiar ou marcar uma caixa não demonstra domínio.
- Jogos com história, arte, controles e consequências do código. A referência
  mínima aprovada é **A última luz do bairro**, não um quiz com aparência de jogo.
- Inglês para programação com grafia correta, significado, aproximação de
  pronúncia escrita para brasileiros, áudio e prática contextual.
- Passagem de celular para computador sem perder o trabalho e com requisitos
  claros. Não fingir que o navegador compila recursos C# que não suporta.
- Um projeto que cresce até tarefas profissionais: arquivos, Git, dados, API,
  testes, segurança, investigação e entrega explicável.
- O usuário é o **Aluno 0**: conhece lógica/conceitos, vibecoda e quer disputar
  vagas C# em 2027. Não presumir fluência em sintaxe, terminal ou SDK.
- Preservar saves, conquistas e IDs. Evitar serviços pagos obrigatórios e usar
  a infraestrutura atual com consumo medido; não prometer gratuidade ilimitada.

## Recorte da primeira entrega

A primeira entrega pretendida é uma **formação C# do zero ao primeiro projeto
profissional**, com dados, API, testes, permissões, Git, instruções de execução
e uma alteração autoral explicada. O percurso inclui uma experiência transversal
navegável e testada: Home, mapa, ajuda, progresso e retomada, com jogos, SQL e
inglês ligados a ações de programação e ao projeto.

As outras trilhas e cursos existentes precisam ter navegação coerente,
disponibilidade explícita e curadoria registrada no que esse percurso utilizar.
Uma formação profissional completa em todas as carreiras possíveis e a revisão
integral de todo o catálogo ficam fora deste primeiro recorte. O site comercial
também não entra nesta régua.

## Estimativa interna de cobertura para planejamento

**Cerca de 30%, numa faixa de julgamento de 25–35%.** É uma estimativa interna
para orientar prioridades da primeira entrega descrita acima. A faixa não é um
intervalo estatístico e não resulta de medição com estudantes.

O número resume julgamentos sobre as frentes abaixo. Ele não representa uma
fração comprovada de um conjunto fechado de entregas, nota do produto,
percentual de aprendizagem, probabilidade de emprego ou equivalência medida a
uma plataforma paga. Os pesos são uma decisão de planejamento; somarem 100 não
os transforma num denominador de tarefas concluídas. As frentes se sobrepõem e
a confiança permanece limitada pelo pequeno recorte validado.

| Frente de planejamento | Peso | Marco atribuído hoje (0–100) | Evidência e principal falta |
| --- | ---: | ---: | --- |
| Jornada, orientação e uso mobile | 15 | 50 | Home/editor/mapas auditados e recomendação principal C# corrigida nesta rodada; falta observar iniciante e teclado real |
| Curadoria e unidades ligadas às práticas | 20 | 25 | Primeiros passos e unidades C# autoradas; falta revisar os materiais e vínculos aula/prática usados no percurso-alvo |
| Formação profissional C# completa | 20 | 25 | Fundamentos, lógica, métodos e primeira unidade de objetos/listas; faltam profundidade da estação 3, dados, API, segurança, testes e entrega autoral |
| Jogos, SQL e inglês ligados ao código | 15 | 25 | Formatos e experiências funcionais; transferência entre formatos e evolução curricular ainda parciais |
| Feedback, ajuda, evidência e revisão | 10 | 50 | Validação negativa, ajuda registrada e revisão existem em recortes; falta uniformidade por habilidade e variante posterior |
| Continuidade e transporte do trabalho | 10 | 25 | Saves locais e transporte nas duas unidades .NET; falta cobertura transversal e continuidade entre dispositivos observada |
| Base técnica, acessibilidade e orçamento | 5 | 75 | CI/build, checks e perfis mobile passam nos escopos conferidos; não há auditoria integral, teste em aparelho modesto ou orçamento de coorte medido |
| Observação com estudantes e retorno posterior | 5 | 0 | Não há sessão documentada do Aluno 0 nem variante posterior observada |
| **Soma dos pesos** | **100** | — | **Não é uma contagem de entregas nem de aprendizagem** |

O índice usa marcos ordinais de planejamento: 0 = ausente; 25 = recorte/piloto;
50 = percurso funcional parcial; 75 = ampla cobertura ainda com pendências;
100 = aceites dessa frente cumpridos. Passar de 25 para 50 não significa dobrar
o trabalho entregue. A escolha de cada marco exige apontar aceites concretos,
evidência e justificativa; sem esses vínculos, permanece um julgamento provisório.
Para comunicar uma porcentagem de entregas concluídas, será necessário fixar
uma lista delimitada de aceites e contar os efetivamente cumpridos.
Não acrescentar pontos automaticamente por commit, arquivo,
imagem, aula, teste ou funcionalidade isolada. A pontuação pode cair se uma
auditoria revelar um bloqueio. Alterar pesos ou escopo exige registrar a nova
versão e o motivo, sem reescrever a estimativa histórica.

O peso de observação não reduz sua importância: os gates de qualidade abaixo
são obrigatórios, independentemente do índice ponderado. Um índice interno alto
não comprova eficácia de ensino sem observar estudantes.

## Quatro evidências diferentes

Para cada percurso piloto, registrar separadamente:

| Estado | O que significa | Situação atual |
| --- | --- | --- |
| Implementado | Existe uma atividade utilizável e uma entrega definida | Sim, em recortes publicados |
| QA técnico | Fluxo/casos/erro/recuperação foram conferidos | Sim, nos recortes e perfis documentados |
| Observado com aluno | Tentativa acompanhada ou gravação revista, com bloqueios, ajuda e artefato identificados | Ainda não documentado |
| Retomada posterior | A pessoa voltou e resolveu outra situação sem receber a resposta | Ainda não documentado |

Os **951 testes** e as auditorias de três perfis da publicação-base `6613f3f` são
evidência técnica. Não substituem as duas últimas linhas. Uma autodeclaração
de execução não é compilação conferida pela plataforma; uma sessão em WebKit
não é teste físico de iPhone; publicar um mapa não publica todas as suas aulas.

Cada registro precisa indicar sua origem e o que foi efetivamente conferido:

- **Relato do aluno:** descreve sua tentativa; não equivale a observação direta.
- **Gravação revista:** permite observar as ações e falas presentes na gravação.
- **Sessão acompanhada:** registra ações, bloqueios e ajuda durante a tentativa.
- **Artefato conferido:** permite revisar ou executar o código fornecido; não
  comprova sozinho quem escreveu, a compreensão ou a autonomia.

Essas fontes podem se complementar. Receber somente um relato mantém a
observação direta pendente; conferir o artefato não preenche automaticamente
os estados de observação humana e retomada posterior.

## Quando poderemos dizer que a experiência está boa

1. **Orientação:** aluno encontra missão, posição no mapa, ajuda e próximo passo
   sem o observador indicar os cliques. Registrar tempo/bloqueios, sem inventar taxa.
2. **Uso real:** no celular com teclado aberto, escreve, corrige, usa símbolos,
   interrompe e retoma sem perder o código. No PC, encontra o arquivo certo e
   distingue salvar, compilar, executar e verificar.
3. **Aprendizagem:** explica o efeito de uma linha, resolve uma variação nova e
   consegue dizer onde usou ajuda. Repetir posteriormente em outro contexto.
4. **Conteúdo:** objetivo, exemplo, prática e verificação correspondem entre si;
   fontes e materiais do percurso têm revisão registrada.
5. **Transferência:** jogo/inglês/SQL alimentam uma ação de programação ou parte
   do projeto, em vez de viverem apenas como minigames separados.
6. **Entrega profissional:** aluno constrói e modifica uma aplicação com dados,
   API, testes, permissões, Git e instruções de execução; responde a um pedido novo.
7. **Acesso e gratuidade:** percurso piloto funciona sem assinatura obrigatória,
   tem alternativas de interação e requisitos de aparelho claros. Medir consumo
   antes de afirmar suporte a uma quantidade de usuários.

Esses critérios orientam a comparação de cuidado com plataformas pagas. Ainda
não existe uma comparação experimental com Alura/DIO nem base para declarar
equivalência ou nota 10/10.

## O que existe no C# e o que ainda falta

- Aberto: variáveis, condições e laços no subconjunto do navegador; métodos e
  objetos/listas com projeto real no SDK .NET 10. O ambiente, arquivos, terminal
  e Git têm orientação inicial, não proficiência do aluno comprovada.
- Parcial: estação 3. A primeira classe usa setters públicos e entradas válidas;
  encapsulação, validação, erros, nullable, outras coleções, interfaces e LINQ
  ainda precisam de unidades.
- Em preparação: currículo integrado de SQL relacional/EF, HTTP/API/async e
  integrações, autenticação/autorização, testes de aplicação, CI/operação e
  projeto autoral/revisão. O SQL e o simulador atuais não concluem essas estações.

Não calcular progresso como “3 de 8 estações = 37,5%”: as estações têm tamanhos
diferentes e a terceira continua parcial. Os [aceites do Aluno 0](ALUNO_ZERO_CSHARP_2027.md)
definem o destino; nenhuma unidade isolada certifica prontidão para vaga.

## Próximo ponto de trabalho, em ordem

1. **Correção implementada e conferida localmente:** a trilha principal C# na
   Home agora aponta para métodos após os três módulos do navegador e preserva
   a unidade .NET escolhida após visitar inglês. Trocar para SQL ou limpar a
   escolha continua seguindo a intenção do aluno. Auditoria isolada nos três
   perfis confirma rascunhos/retomada, sem criar execução verificada ou XP.
   Publicação confirmada em `a216357`, `main` remota, CI `43959062550` e Vercel
   aprovados. Este reparo não aumenta a estimativa.
2. Fazer a [sessão do Aluno 0](SESSAO_ALUNO_ZERO.md). A IA pode preparar e testar
   o percurso técnico, mas não inventar a tentativa, a compreensão ou o relato
   de um estudante. O usuário e depois outros iniciantes precisam realizá-lo.
3. Corrigir os bloqueios observados. Se o percurso estiver compreensível,
   continuar encapsulação/validação no OrbiServiços. Se a pessoa travar na
   orientação ou transição ao SDK, resolver essa etapa antes de ampliar o curso.
4. Retomar frentes transversais: curadoria aula/prática, revisão por erro e
   transferência jogos/inglês/SQL → código. Não deixar a Academy inteira virar
   apenas expansão do C#.

A pendência humana não é um pedido repetido de aprovação para trabalhar. Podemos
continuar o que estiver autorizado, mantendo o limite explícito e a prioridade
documentada. Não apresentar expansão de conteúdo como substituta da observação.

## Regra para as próximas rodadas

Antes de alterar a Academy, reler este arquivo e identificar a frente atendida.
No fechamento, registrar: problema do aluno, mudança, evidência técnica,
evidência humana existente/ausente, publicação e próximo aceite. Só revisar
a estimativa quando um marco da frente avançar de fato, com motivo registrado.

### Histórico da régua

- 15/11: estimativa anterior de 20–25% era qualitativa, antes das duas unidades
  .NET. Foi comunicada sem um denominador ponderado fixo; não tratá-la como medição.
- 16/11: primeira régua explícita para a entrega C# com experiência transversal.
  O cálculo interno ponderado resultou em 32,5 pontos, preservados aqui para
  rastreabilidade; a comunicação é cerca de 30%, numa faixa de julgamento de
  25–35%. Não é fração medida de escopo ou intervalo estatístico.
  Observação humana continua ausente.
  O reparo de recomendação é correção de integração, sem aumento automático.

## QA desta rodada — 16/11/2026

- TypeScript, lint dos cinco arquivos de código alterados e build de produção
  aprovados. Suíte completa: **962 testes em 78 arquivos**; após encurtar a
  chamada da Home, os 72 testes dos dois módulos afetados foram repetidos e
  aprovados, assim como lint e build. Os nove contratos de arquivos passaram;
  eles não executam RLS no Supabase remoto.
- A [auditoria da trilha escolhida](../apps/web/scripts/audit-academy-chosen-csharp.mjs)
  passou em Chromium 1366×768 e WebKit 390×664/320×640: escolha pela UI,
  métodos → objetos → inglês → Home, troca para SQL, limpeza da escolha,
  reload e retorno ao rascunho correto. Sem erros de página, overflow ou
  violações nos nove estados/escopos Axe conferidos.
- O cenário que avança dos três módulos do navegador usa uma fixture explícita
  em outro contexto. Isso não registra um aluno concluindo os módulos.
  O roteiro espera a transição/foco antes de digitar; não é teste de entrada
  durante a troca nem de teclado físico do iPhone.
- Capturas foram inspecionadas: a chamada encurtada deixa mais contexto visual
  na primeira dobra de 320 px. Isso não é uma medição de conversão ou aprendizagem.
- Build mantém o aviso preexistente de rastreamento dinâmico na rota de materiais,
  fora deste recorte. Os projetos nativos e migrations não foram alterados nem
  tiveram sua execução repetida nesta rodada.

Evidências locais ignoradas: `docs/local/academy-control-20261116/`, em especial
`chosen-csharp-release/report.json`, capturas, `build.log` e `continuity.json`.
SHA remoto, CI e Vercel devem ser confirmados após o push e registrados
separadamente. Nenhuma sessão humana foi adicionada como concluída.
