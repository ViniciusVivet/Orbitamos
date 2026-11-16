<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Direção visual da Orbitamos: "efeito de imersão"

Quando o usuário pedir **imersão**, **efeito Apple**, **scroll imersivo** ou linguagem equivalente, não interpretar isso como apenas animar um mockup, aplicar parallax ou fazer elementos surgirem durante uma página convencional.

O objetivo é a **página inteira se tornar uma cena contínua dirigida pelo scroll**: viewport, cenário, luz, cor, profundidade, escala, câmera, tipografia, mídia e narrativa devem evoluir juntos. O usuário considera o padrão anterior — um elemento central avançando enquanto o restante continua com aparência de site — aproximadamente **2/10**. Toda nova execução deve mirar **10/10** segundo os critérios em `../../docs/DIRECAO_IMERSIVA.md`.

Antes de implementar uma experiência desse tipo, leia `../../docs/DIRECAO_IMERSIVA.md` e `../../docs/METODO_ORBITA_IMERSIVA.md`. Use seus critérios como requisito de produto e checklist de validação visual em desktop e mobile. Registre no segundo documento as decisões, pontuações e aprendizados relevantes de cada nova iteração.

## Academy: padrão visual para estudantes

Leia `../../docs/PADRAO_VISUAL_ACADEMY.md` antes de alterar as telas dos estudantes.
Leia também `../../docs/CONTROLE_FORMACAO_ORBITAMOS.md` para manter o objetivo,
o alvo da formação, a régua de progresso e o próximo aceite. No encerramento, distinga
implementação, QA técnico, observação com aluno e retomada posterior; não
substitua os dois últimos por quantidade de testes. A pendência de ensaio humano
não exige repetir pedidos de permissão para trabalho já autorizado.
Para selecionar o trabalho, use o cursor e as dependências de
`../../docs/MAPA_EXECUCAO_ACADEMY.md`. Preserve a distinção entre tarefas técnicas,
publicação e evidência humana; não interrompa toda a fila por uma pendência local.
O usuário rejeitou repetidamente entradas com pilhas de parágrafos, métricas,
slogans e cartões vazios de ícones. Organizar o texto não resolve esse problema.

- A primeira dobra deve mostrar mídia contextual de tamanho útil e uma ação clara.
- Use fotos editoriais para estudo e capturas do jogo real para escolher jogos.
- Introdução, método, recomendação e métricas não podem formar quatro blocos antes
  do conteúdo. Mantenha um título curto e a recomendação principal.
- Filtros avançados, disponibilidade detalhada e explicações auxiliares ficam sob
  demanda. Instruções necessárias para resolver uma atividade continuam visíveis.
- Não adicionar foto decorativa a cada campo de formulário nem substituir código,
  vídeo ou cena interativa por uma imagem. A mídia precisa ajudar a entender a ação.
- Confira screenshots reais em desktop e celular, além de lint/build. Número de
  testes aprovados não comprova qualidade visual. Preserve auth, saves e progresso.

## Academy: referência aprovada para jogos (04/11/2026)

O usuário aprovou o capítulo **A última luz do bairro**, da Entrega do Orbi,
como referência mínima para os próximos jogos e refinamentos. Preserve o cuidado
com direção de arte própria, personagens coerentes, história curta, controles
realmente jogáveis no teclado e no toque, feedback e consequências visíveis do
código. As mecânicas devem servir ao objetivo pedagógico de cada experiência.

Consulte `../../docs/STUDIO_E_ORBI_CAPITULO_01.md`. Verifique o percurso real,
inclusive dois toques simultâneos, erros, retomada e preservação das conquistas.
Mantenha física e renderização no cliente, mídia otimizada e carregamento sob
demanda. Sincronizações futuras devem gravar marcos úteis, evitando chamadas ao
banco por quadro ou tecla. Avalie também desempenho em aparelhos modestos.

Para continuar a evolução da aventura, leia também
`../../docs/EVOLUCAO_ENTREGA_ORBI.md`: estado da Oficina do Pulso, saves separados,
plano por blocos e próximo ponto de retomada. Atualize esse registro com evidências
da rodada; não confunda funcionalidades planejadas com funcionalidades publicadas.

## Academy: metodologia de inglês — requisito de 14/11/2026

O usuário tornou **obrigatório** o apoio de pronúncia escrito para brasileiros,
como `save → salvar → sêiv` e `file → arquivo → fáil`. A decisão inicial de
omiti-lo foi superada. Leia `../../docs/METODO_INGLES_ORBI.md` antes de alterar
qualquer experiência de inglês ou acrescentar vocabulário.

- Na apresentação/feedback de um modelo, ligue grafia inglesa correta,
  significado em português, pronúncia aproximada em português e modelo sonoro
  em inglês. Não transformar a aproximação na grafia que o aluno deve escrever.
- Use `src/lib/englishPronunciation.ts` e o componente compartilhado
  `EnglishPronunciationGuide`. Todo novo alvo exige apoio/chunks/dica revisados
  no catálogo e cobertura no teste; expressão desconhecida não ganha um fallback
  de pronúncia inventado.
- Preserve a tarefa: não antecipar a tradução em uma questão de significado.
  Na revisão por escrita ou palavra ausente, esconder inglês completo e apoio
  até consulta explícita de pista/modelo ou acerto. A retomada da Home mostra
  somente a pista em português.
- TTS deve receber a expressão inglesa real com idioma inglês. O apoio é uma
  aproximação visual autoral, não IPA, áudio em português ou corretor de fala.
- Orbi indica os eventos reais de reprodução e a vez do aluno. Não simular que
  o microfone ouviu/aprovou alguém; boca animada não equivale a sincronização
  fonema a fonema. Respeitar movimento reduzido e cancelar ao sair/parar.
- Mantenha contexto visual e ação claros em desktop e celular, sem empilhar
  explicações. Confira capturas reais e controles de toque em tela estreita.
- Não introduzir API paga, serviço de animação ou dependência externa de voz
  para esta metodologia. Preserve saves, XP e ausência de microfone. A síntese
  do aparelho pode precisar de rede e não garante qualidade/offline uniforme.
