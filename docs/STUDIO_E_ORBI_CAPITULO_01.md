# Studio e Entrega do Orbi — rodada de 04/11/2026

## O que esta rodada resolve

O colaborador deve reconhecer seu próximo trabalho e abrir seu contexto sem
procurar em várias telas. Na Academy, o jogo de plataforma deve ter controle,
exploração e consequência visível do código, além de uma passagem para a IDE.
A entrega não transforma todos os jogos antigos em jogos de plataforma: este
capítulo estabelece a primeira referência para evoluir as outras experiências.

## Colaborador

- Home seleciona projeto com status, prazo e prioridade reais. O botão abre o
  mesmo projeto em `/colaborador/projetos?projeto=id`.
- Detalhe mostra briefing, links seguros, prazo, prioridade, progresso informado
  e integrantes obtidos pelas APIs atuais. Não inventa tarefas ou entregas.
- Projeto concluído aparece como concluído; pausado tem grupo próprio.
- Candidaturas agrupam pending/reviewing e declined/withdrawn com contagens
  coerentes. Erro de carga não é tratado como uma lista vazia.
- Menu separa trabalho, oportunidades, apresentação e conta/acesso.
- Portfólio aceita arquivo JPG/PNG/WebP, prévia, link opcional, rascunho por conta,
  recuperação e confirmação para apagar. Arquivos são preparados no navegador e
  enviados somente ao salvar.
- Upload reutiliza o bucket avatars e o prefixo auth.uid/portfolio. Não há nova
  política, migração ou autorização de storage. A validação do upload real
  depende da sessão autenticada e das políticas já existentes em produção.
- Guia do perfil usa campos reais; não mostra percentual fictício de completude.

## Entrega do Orbi: A última luz do bairro

### Ciclo pedagógico e de jogo

1. Explorar o cenário com controles próprios.
2. Encontrar o terminal e entender o problema concreto da entrega.
3. Escrever uma declaração JavaScript curta.
4. Aplicar: o valor altera a máquina no cenário.
5. Testar a hipótese caminhando, saltando e fazendo a entrega.
6. Levar a ideia para o laboratório e revisar depois.

O primeiro terminal mostra um exemplo, o segundo reduz a ajuda inicial e o
terceiro começa vazio. As pistas continuam disponíveis. O objetivo é retirar
apoio aos poucos sem abandonar quem está começando.

- Ponte: `const alcance = 280;` muda o comprimento; atravessar ainda exige ação.
- Elevador: `let altura = 180;` permite subir e alcançar o terraço.
- Farol: `const custo = 4; const energia = custo + 2;` introduz uma expressão
  dependente. Escrever somente o resultado não prova essa relação.

O terminal executa uma gramática restrita de declarações e contas numéricas.
Não é uma IDE JavaScript geral; não usa eval, não acessa rede, DOM ou arquivos.
Uma declaração válida mas insuficiente altera a máquina para mostrar a causa.
Código inválido mantém o último programa aplicado e mostra como corrigir.

### Implementação

- Phaser 4.2.1 carregado apenas ao montar o cenário depois de começar.
- Física determinística, aceleração, buffer de pulo, tolerância de borda,
  colisões, plataforma móvel, câmera, animações e ponto de retorno.
- Teclado e botões de toque; som original sintetizado, desligado inicialmente.
- Pausa ao ocultar a página; retorno explícito; limpeza de áudio/listeners ao sair.
- Código guardado por missão e conta. Recomeçar código tem confirmação e desfazer.
- Conclusão exige programa adequado e chegada física ao destino.

### Histórico e honestidade do progresso

Save novo: `orbitamos-orbi-chapter-v2-<conta>`.
O save v1 permanece intacto. Conquistas antigas são mostradas como histórico e
não concluem o capítulo novo. O journal preserva datas/revisões anteriores em
legacy* e marca contentVersion=2 para registros novos. A fonte de conclusão
é o save do capítulo; abrir a página e importar o journal não valem conclusão.

O progresso deste jogo continua local ao navegador e à conta, como os jogos
existentes. Não há sincronização entre dispositivos nesta rodada.

## Direção de arte e prompts

Artes criadas com o **ImageGen integrado**, não pela CLI/API. Originais
preservados no diretório generated_images do Codex. Entregáveis:

- `apps/web/public/images/games/orbi-chapter/background-v1.webp`
  — bairro brasileiro entre montanhas ao anoitecer, correio, plantas, casas
  acolhedoras iluminadas e faixa inferior tranquila para a área jogável; cenário
  lateral, sem texto/interface desenhados.
- `apps/web/public/images/games/orbi-chapter/orbi-sheet-v1.webp`
  — Orbi consistente com a referência existente, cabeça de globo, traje
  azul-petróleo e bolsa de entregas, grade regular 4×2: idle, quatro poses
  de corrida, salto, queda e celebração; fundo transparente.
- `apps/web/public/images/games/orbi-chapter/props-sheet-v1.webp`
  — grade 3×2, lateral e transparente: solo de pedra com musgo, ponte de madeira,
  terminal, elevador, farol e caixa de correio; mesma linguagem pictórica.
- A capa do catálogo deve ser uma **captura real** do jogo, não gameplay fictício
  gerado. Conversão/normalização técnica feita com Sharp mantendo alpha.

Essas especificações registram o conjunto dos prompts e suas invariantes.
A prioridade para próximas artes é consistência das poses, base dos pés, células
com recorte seguro e separação entre cenário decorativo e plataformas físicas.

## Verificação e como testar

Desenvolvimento:

- Colaborador: `/dev/portal-preview?role=work`.
- Projetos/candidaturas/portfólio:
  `/dev/workspace-preview?view=projects|applications|portfolio`.
- Jogo: `/dev/academy-preview?activity=delivery`.

As prévias usam fixtures isoladas e retornam 404 em produção. Fluxos publicados:

- `/colaborador`, `/colaborador/projetos`, `/colaborador/candidaturas`,
  `/colaborador/portfolio`, `/colaborador/perfil`.
- `/estudante/jogos/entregas-do-orbi`.

Conferir screenshots reais, desktop, WebKit iPhone e 320 px; teclado, toque,
pausa, erro de código, reset/desfazer, retomada, histórico, final e passagem à IDE.
Upload/edição do portfólio deve ser testado na prévia sem gravar fixtures no backend.
Validação: 450 testes unitários passaram (48 arquivos); lint sem erros, com
avisos anteriores do repositório. As telas do colaborador passaram por 30 registros
de QA em Chromium, WebKit/iPhone13 e 320 px. O portfólio passou por edição/upload
local, retomada, teclado e verificação axe no Chromium e WebKit. O jogo foi
atravessado por controles reais no navegador, incluindo as três entregas, erros,
pausa, recarga, revisão do legado e passagem ao laboratório.

Build de produção e TypeScript aprovados. O roteiro de resiliência confirmou
conquistas entre abas, aviso de quota dentro do terminal e dois toques reais
simultâneos (direção + pulo) pelo protocolo de entrada do Chromium.

Roteiros reproduzíveis em apps/web:

- `node scripts/audit-collaborator-workspace.mjs`
- `node scripts/audit-orbi-chapter.mjs` (desktop, WebKit/iPhone e 320 px)
- `node scripts/audit-orbi-chapter-resilience.mjs`

As artes de personagem e objetos em WebP somam 519 KB, redução de 83,9% sobre
os PNGs, com alpha e grades preservados. A captura real do catálogo é
`apps/web/public/images/jogos/entrega-orbi-v2.webp` (~112 KB).

O identificador do commit e o status da publicação ficam no relatório de entrega.
