# Capas fotográficas do laboratório

Criadas em 14/09/2026 com a ferramenta integrada de geração de imagens (skill imagegen), sem CLI/API externo. São cenas ilustrativas geradas por IA, não registros de alunos reais da Orbitamos.

## Direção

Fotografia editorial de estudo e experimentação, materiais táteis, luz natural lateral e tons sóbrios. Seis famílias reutilizadas por assunto nos 32 desafios; não representam 32 fotos exclusivas. Não transformar as imagens em enunciados ou diagramas pedagógicos: instruções e critérios permanecem no texto do site.

## Arquivos e aplicação

Imagens finais em `apps/web/public/images/laboratorio/`. Originais gerados foram preservados na pasta de geração do Codex. Importação estática por `laboratoryCovers.ts`, com blur automático, tamanhos responsivos, otimização Next/Image e carregamento lazy. Nenhuma dependência nova. Capas são decorativas (`alt=""`); o nome acessível de cada link vem do título e conteúdo real do card. Filtros não alteram a capa de um desafio.

## fundamentos-v1.png

Arquivo: `apps/web/public/images/laboratorio/fundamentos-v1.png`

Prompt final:

> Use case: photorealistic-natural. Asset type: landscape photographic cover for a coding exercise card in Orbitamos Academy. Create one premium editorial photograph, wide 3:2 composition. Scene: an intimate contemporary Brazilian study workshop, NOT a corporate office. Two young adult students with natural Brazilian diversity, one woman with curly dark hair and a brown-skinned man, casually dressed in charcoal and muted sage, seen in a candid close three-quarter over-shoulder view, concentrating together on one laptop and an open notebook at a graphite workbench. Screen content softly out of focus, no readable text. Hands and notebook visible, natural plausible anatomy. Interesting asymmetric documentary composition, intimate and tangible rather than posed stock photo. Soft daylight from side, restrained warm highlights against deep blue-charcoal shadows, a small muted lavender stationery detail ties the series together. Real skin texture, linen fabric, paper fibers, subtle photographic grain, 50mm editorial camera look. Subjects remain legible in a shallow 2:1 website crop. No titles, text overlays, logos, watermark, glowing code, holograms, robots, plastic 3D render or sci-fi. This is a fictional illustrative study scene, not documentation of real enrolled students.

## calculos-v1.png

Arquivo: `apps/web/public/images/laboratorio/calculos-v1.png`

Prompt final:

> Use case: photorealistic-natural. Asset type: landscape photographic cover for a coding exercise card in Orbitamos Academy, one photograph, wide 3:2. Premium editorial still life about mathematical thinking: close diagonal view of a tactile vintage compact mechanical calculator with ivory and dark graphite keys and one amber-orange key, resting on dark blue charcoal tabletop next to a small cream squared-paper notebook and a slim brushed metal pencil. Tight confident composition, calculator prominently fills the frame, actual materials and a hint of use. No brand markings, no fake written equations. Strong soft daylight from one side, controlled deep shadows, warm cream and muted amber accents, a subtle lavender paper edge. Real photography with fine film grain, not a glossy 3D product render. Keep the meaningful objects within the central shallow 2:1 crop. No readable titles, no UI, no decorative text, no watermark, no neon, no floating numbers.

## decisoes-v1.png

Arquivo: `apps/web/public/images/laboratorio/decisoes-v1.png`

Prompt final:

> Use case: photorealistic-natural. Asset type: landscape photographic cover for coding exercise cards, Orbitamos Academy, one 3:2 photograph. Premium editorial overhead documentary photograph of an adult student's brown hand placing a small muted lavender paper decision diamond into a clean branching arrangement of cream rectangular paper cards and two sage paper cards on a charcoal cutting mat. Very simple branching flow visually evident through thin pencil arrows, NO words or letters anywhere. A small edge of dark casual sleeve, realistic hand anatomy, natural paper shadows and fibers. The study arrangement is handcrafted and smart, not a flat vector diagram, not office post-it wall stock photography. Asymmetric close framing, material detail, soft daylight, blue-black shadows and warm cream highlights, subtle fine grain. All relevant content comfortably inside a shallow 2:1 cover crop. No logo, watermark, caption, hologram, neon or 3D render.

## repeticao-v1.png

Arquivo: `apps/web/public/images/laboratorio/repeticao-v1.png`

Prompt final:

> Use case: photorealistic-natural. Asset type: landscape editorial photograph for an Orbitamos Academy coding exercise cover about loops and repeated patterns. One wide 3:2 image. Macro oblique photograph of a real compact hardware step sequencer on a dark workbench: a beautiful repeating row of tactile ivory square buttons and a second row of brushed aluminum knobs, a few tiny muted amber indicator lamps show an intentional repeating rhythm. No screens with lettering and no branding. Physical details, subtle scratches, precise credible manufactured construction, one blurred dark cable in background. Repetition and rhythm read immediately without any text. Moody natural side daylight, charcoal and ink-blue shadows, warm cream surfaces, restrained amber accent. Premium art-directed analog electronics editorial photography, fine grain, not CGI or a neon gaming setup. Central shallow 2:1 crop keeps the repeated buttons in view. No text overlay, logo, watermark, floating code or holograms.

## dados-v1.png

Arquivo: `apps/web/public/images/laboratorio/dados-v1.png`

Prompt final:

> Use case: photorealistic-natural. Asset type: photographic coding exercise card cover, Orbitamos Academy. One wide landscape 3:2 premium editorial photograph about collections and structured data. Close overhead view of a real modular smoked-translucent parts organizer on a dark graphite worktable. Six orderly shallow compartments contain small tactile objects sorted by type: ivory square tiles, sage round tokens, brushed metal small cylinders, lavender rectangular tabs. One human hand naturally moves a sage token to its matching compartment; realistic fingers, slight object imperfections, real acrylic thickness, realistic shadows. Not a colorful toy scene, not floating abstract 3D blocks. Sophisticated tangible experiment, composition fills frame with distinct ordered groups that remain visible in 2:1 crop. Soft side daylight, muted palette, ink-blue dark background, photographic grain. No labels, writing, captions, logo, watermark, holographic interface or neon.

## funcoes-v1.png

Arquivo: `apps/web/public/images/laboratorio/funcoes-v1.png`

Prompt final:

> Use case: photorealistic-natural. Asset type: landscape photographic coding exercise card cover for Orbitamos Academy. One wide 3:2 photograph. Candid close view of an adult student's hands assembling a small real electronics prototype on a graphite workbench, demonstrating a modular input and output system: a clean ivory breadboard, a rotary knob, a short neatly routed wire and a small amber lamp, with a compact unbranded laptop softly blurred at the back. Only a small careful circuit, believable realistic wiring and human anatomy. Charcoal cotton sleeves, metal and tactile material detail, a muted lavender component case. Art-directed editorial makers-workshop photograph, natural side window light, cool blue-black shadows, warm highlights, subtle film grain. Central objects readable in a shallow 2:1 website cover crop. No text, no brand, no watermark, no sparks, no sci-fi, no neon, no CGI, no fake floating code.
