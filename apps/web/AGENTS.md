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
