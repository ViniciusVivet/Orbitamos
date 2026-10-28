# Academy: ver, entender e começar

## Direção acordada em 28/10/2026

As páginas dos estudantes precisam ser visuais desde a entrada. O padrão anterior
empilhava introdução, estatísticas, método, recomendação e filtros antes de chegar
às fotos das atividades. A organização funcional tinha avançado, mas a apresentação
continuava parecendo um documento. O usuário rejeitou esse resultado.

O critério desta rodada é permitir reconhecer o que existe, o que fazer agora e
onde tocar por meio da composição, da imagem e de poucos rótulos. Não é aumentar
o número de imagens em volta da mesma quantidade de texto.

## Regras de composição

1. Título curto, no máximo uma frase de contexto e uma ação principal na entrada.
2. Foto ou cena de tamanho útil na primeira dobra, inclusive em 320px. Um ícone
   pequeno dentro de um quadrado não substitui essa mídia.
3. Uma recomendação principal. Não repetir o mesmo convite em um bloco de método,
   outro de introdução e outro de próxima atividade.
4. Capas de jogos mostram a experiência real. Fotos de estudo e criação são cenas
   editoriais; nunca avatares, depoimentos ou prova de pessoas reais.
5. Mostrar o catálogo cedo. Busca e linguagem ficam acessíveis; filtros avançados,
   detalhes do conteúdo e explicações administrativas podem ser abertos quando úteis.
6. Preservar instruções pedagógicas durante a tarefa. Reduzir a sobrecarga antes de
   começar não significa esconder os requisitos do programa ou a mensagem de erro.
7. Não enfeitar cada campo da conta com fotos. Formulários precisam de rótulos,
   contraste e feedback. No curso, vídeo e editor já são mídia funcional.
8. Imagens responsivas com dimensões reservadas, recorte intencional, contraste
   legível e texto real no HTML. Sem parágrafos desenhados dentro da imagem.

## Aplicação desta rodada

- Código: recomendação com foto desde a entrada, dois atalhos visuais, catálogo
  sem os antigos blocos de método/roteiro antes das capas; filtros extras recolhidos.
- Jogos: recomendação e seis capas com capturas reais dos jogos. Revisão vazia
  recebe uma orientação visual; as perguntas em andamento mantêm o foco na tarefa.
- Trilhas e mapas: capas e ações claras antes do seletor opcional; detalhes do
  piloto e material de apoio consultáveis sem competir com o início.
- C#: foto própria da trilha, apresentação curta e botão para codar, preservando
  profissão, mapa, módulos e limitações do conteúdo.
- Aulas: foto inicial e estante, busca direta, filtros extras sob demanda.
- Comunidade e mentorias: imagens junto aos destinos, orientação longa recolhida,
  sem alterar os canais e condições existentes.
- Progresso: entrada visual, números compactos e registros com miniatura/barra;
  detalhes de contagem e métricas de aulas separados por expansão.
- Início: mídia humana no painel de continuidade, mantendo a retomada e a escolha
  da trilha principal.

## Artes e origem

Novas cenas editoriais geradas com o **ImageGen integrado**, convertidas para WebP
para entrega no site. Originais preservados na pasta de imagens geradas do Codex.
Otimização de formato/tamanho feita com Sharp, sem substituir a cena.

- `apps/web/public/images/academy/codigo-no-celular-v1.webp`: estudante programando
  pelo celular em casa; 1400×933, aproximadamente 107KB.
- `apps/web/public/images/academy/projeto-csharp-v1.webp`: estudante construindo
  um programa no laptop; 1400×933, aproximadamente 118KB.
- `apps/web/public/images/jogos/*-v1.webp`: capturas reais das experiências locais,
  recortadas e otimizadas. Não são cenas de gameplay inventadas pelo gerador.

### Prompt da cena de celular

Use case: photorealistic-natural. Create a polished editorial photograph for the
Orbitamos programming learning platform. A young adult Brazilian learner studying
real beginner programming on a smartphone at a small comfortable wooden desk next
to an open window in a modest contemporary São Paulo apartment, daylight with
subtle warm afternoon light, tactile believable skin and objects, candid documentary
style, no stock-photo smile. Composition landscape 3:2, close three-quarter view
over their shoulder: hands and portrait phone are the focal point in the right-center,
screen angled toward camera showing a calm dark programming editor with a handful
of very simple colorful JavaScript lines, believable small code without prominent
readable UI labels. The person is relaxed, dark charcoal shirt with a small
understated ORBITAMOS wordmark on sleeve. Notebook and pencil in soft focus, one
plant, muted navy/teal accents, restrained natural lavender in the background.
Real physical phone and hands, warm human atmosphere, optimistic and focused.
Strong composition usable as a large course cover, center subject safe for narrow
crops. No headlines, no overlays, no badges, no collage, no big text, no watermarks,
no glowing holograms.

### Prompt da cena de projeto

Editorial documentary photograph for a Brazilian adult programming learning
platform, Orbitamos. A young adult Brazilian man with medium brown skin and short
curly hair working on a small real software project on his laptop, seen in a candid
three-quarter side profile at a modest tidy home workspace in São Paulo. Hands
typing naturally, a believable large dark code editor on screen with restrained
lavender and green syntax highlights, no prominent readable text. Small physical
notebook beside laptop with an uncomplicated hand drawn arrows-and-boxes sketch.
He wears a charcoal cotton t-shirt with small ORBITAMOS wordmark. Natural soft
daylight, warm wood, muted teal and navy details, human textured candid photography,
no theatrical neon, no futuristic graphics. Landscape 3:2 composition with person
and laptop centered safely for narrow crops, camera close enough to show focused
work, polished premium learning editorial, no slogans, no title, no overlays,
no interface mockup, no watermark.

## Verificação

Revisar a primeira dobra e os estados com conteúdo e vazios. Conferir recorte de
rostos/tela, legibilidade, carregamento, botões por toque e ausência de overflow.
Testar abrir filtros, buscar, trocar e retomar trilha, chegar à tarefa e salvar.
Não usar um screenshot com blur de carregamento como evidência visual final.

As prévias continuam restritas ao desenvolvimento. Aulas no preview usam dados
locais e uma conta de teste; isso não abre acesso aos dados de contas reais.
Screenshots e relatórios ficam em `apps/web/test-results/`, fora do Git.

Rodada verificada: 425 testes unitários em 45 arquivos; lint de todos os arquivos
TS/TSX/MJS alterados; capturas e verificações em Chromium desktop, WebKit/iPhone 13
e Chromium de 320px. Foram conferidos Home/laboratório, catálogo/C#/comunidade,
Jogos/revisão, Aulas/Mentorias/Progresso e escolha/retomada de trilha. O percurso
completo das quatro entregas também passou após a revisão visual. Nas telas
cobertas, não houve overflow horizontal, erros de página ou violações axe na
rodada estável. Os títulos mobile tiveram um ajuste adicional de espaçamento,
confirmado em novas capturas. Isso não equivale a testar num iPhone físico nem
a uma auditoria WCAG completa.

Build de produção e TypeScript aprovados. Os avisos anteriores de Browserslist
desatualizado e rastreamento amplo em `api/course-materials/[...path]` permanecem;
esse endpoint não foi alterado nesta rodada.
