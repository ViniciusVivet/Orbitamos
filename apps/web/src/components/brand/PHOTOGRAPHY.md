# Acervo fotográfico Orbitamos

## Direção — 14/09/2026

Fotografia editorial de estudo e trabalho: pessoas adultas, materiais tangíveis, luz natural e detalhes ciano/azul. ORBITAMOS impresso fisicamente em roupas e objetos. Manter títulos, preços, progresso e botões em HTML, nunca gravados nas fotos.

Estas cenas foram **geradas com IA**, não são fotografias documentais de alunos, equipe ou clientes. Por solicitação do usuário em 16/09/2026, as legendas de geração foram removidas da interface; a origem permanece registrada nesta documentação interna. Capas e miniaturas são decorativas (alt vazio, com título adjacente). Nunca usar como avatar, depoimento, resultado comprovado ou capa fictícia de um case real.

## Aplicação e limites

| Área | Decisão |
| --- | --- |
| Laboratório | Seis capas temáticas próprias já aplicadas aos 32 desafios. Ver ../estudante/LABORATORY-IMAGES.md. |
| Painel estudante | Estante fotográfica com títulos e andamento reais; próxima aula e progresso preservados. |
| Aulas / busca | Capas estáveis por assunto, incluindo resultados de busca; filtros e progresso intactos. |
| Comunidade | Composição editorial com equipe ilustrativa, fórum e Discord reais. |
| Mentoria interna e pública | Cena de orientação; programas, condições e canais existentes preservados. |
| Sobre | Imagem conceitual de colaboração com legenda, sem atribuir identidades fictícias. |
| Fórum | Foto apenas na orientação lateral; publicações e avatares continuam reais. |
| Painel colaborador | Miniatura de criação no acesso ao portfólio, sem associar a trabalhos de clientes. |
| Portfólio e squad | Fotos no estado inicial; nunca preencher cases ou integrantes reais com conteúdo inventado. |
| OrbitAcademy (/orbitacademy, acesso protegido) | Foto de estudo no convite final, preservando planeta e experiências existentes. Preview isolado para teste sem conta. |
| Início | Vídeo e cases reais preservados; processo editorial em quatro etapas com fotos. Engenharia ilustrada em HTML/CSS, sem fotografia ornamental. |
| Serviços | Na rodada comercial de 16/09, as capas editoriais deram lugar a capturas reais dos cases e diagramas HTML específicos por solução. Preços e condições preservados; acervo fotográfico continua disponível, sem geração adicional. |
| Projetos e contato | Preservar capturas reais e mídias próprias; não gerar projetos fictícios. |
| Login | Carrossel existente preservado, referência de marca para este acervo. |
| Cursos/aula aberta, IDE, jogos e jornada | Manter vídeo didático, editor, arte dos jogos e visualização de progresso; não adicionar fotos que tomem espaço de uso. |
| Vagas, candidaturas e projetos internos | Priorizar dados reais, filtros e execução; não inventar imagem de empresa/projeto. |
| Conta, perfil, privacidade, mensagens e administração | Sem fotos ornamentais; avatares permanecem fornecidos pelos usuários. |
| /mural e /estudante/trilhas | Redirecionamentos, sem nova mídia própria. |

## Implementação

- Fontes locais em apps/web/public/images/orbitamos/*-v1.png.
- next/image, imports estáticos, blur e sizes responsivos. PNG original preservado; navegador recebe versão otimizada pelo Next.
- Sem carregamento antecipado de todo o acervo e sem novas bibliotecas de animação.
- Layouts reservam área da imagem para evitar saltos. Imagens não interceptam cliques e não contêm informação necessária à tarefa.
- Sem alterações em autenticação, API, permissões, banco de dados ou motores de exercícios.
- /dev/photos-preview?area=comunidade|cursos|mentorias|portfolio|squad|academy permite inspeção local. Retorna 404 fora de development. A rota /orbitacademy continua protegida pela autenticação original.
- Testes: orbitamosPhotography.test.ts e scripts/audit-photography.mjs; também rodar a auditoria de portal.
- Não é uma auditoria funcional completa de todas as rotas autenticadas: os previews testam apresentação, com componentes reais e estados isolados.

## Validação desta rodada

- 160 testes unitários passaram (17 arquivos).
- 22 cenários da auditoria fotográfica passaram, incluindo larguras 320, 390 e 1440 px, carregamento, pesquisa SQL, ausência de overflow e acessibilidade dos novos blocos de comunidade/estados iniciais.
- 19 cenários do portal passaram: desktop, mobile, menu/teclado, estante, estados vazio/carregando/erro/concluído e redirecionamento de visitante.
- Build de produção passou. Aviso preexistente de tracing no endpoint de materiais de curso permanece; não foi alterado nesta tarefa.
- Lint sem erros; dois avisos preexistentes de img em avatares/cases do colaborador, preservados para não alterar fontes externas reais.
- Previews de fotos (incluindo Academy), laboratório e portal retornaram 404 no servidor local de produção.
- Capturas em test-results/photography e test-results/portal-experience. Inspeção visual de comunidade, catálogo, estante, mentoria e laboratório em desktop/mobile.
- Esta rodada foi posteriormente publicada na main em 0c35886, após autorização explícita do usuário.

## Continuação — home e serviços (15/09/2026)

Uma nova cena de revisão mobile, lancamento-v1.png, completa as etapas do processo. O módulo studioPhotography reaproveita o acervo para a home e as seis capas de serviço, sem alterar o catálogo-base de seis fotografias dos portais. Prompt completo, origem, destino, decisões e evidências em docs/INICIO_PROCESSO_ENGENHARIA.md na raiz do repositório.

Validação desta continuação: 165 testes, build e lint sem erros; 15 resultados da auditoria da home e 12 cenários de serviços aprovados. Esta continuação permanece local, separada do commit 0c35886.

## Geração e prompts

Ferramenta: image_gen__imagegen integrada (skill imagegen). Uma imagem por chamada, sem geração por CLI. Originais copiados sem edição criativa posterior. A tentativa com referência local falhou; as seis imagens finais foram geradas por descrição, baseada no carrossel inspecionado.

### estudo

Destino: `apps/web/public/images/orbitamos/estudo-v1.png`

Use case: photorealistic-natural. Create ONE new 3:2 landscape editorial brand photograph for the Orbitamos education and digital-work website. Photograph only, no ad layout, no headline, no UI overlay, no social badges, no caption or watermark. Natural believable adult Brazilian people and anatomy, real skin and cloth textures, thoughtful documentary composition, premium art direction. Charcoal clothing, warm skin, dark ink-blue studio details with a restrained cyan or violet practical light, not oversaturated neon. Integrate the wordmark 'ORBITAMOS' accurately as a subtle physical print or embroidered mark on clothing or an item in the scene, not a floating logo. Keep all essential action in the middle horizontal band for responsive cropping. This is a fictional illustrative scene, not documentation of real staff, students or clients. Scene: a young adult brown-skinned woman with naturally curly hair studies programming at her home desk, concentrating on a slim laptop with a small cyan ORBITAMOS sticker, open notebook beside it. Candid side three-quarter view with her face and typing hands both visible, charcoal sweatshirt with a subtle white ORBITAMOS wordmark, warm side window light, restrained cool ambient blue at the back. Screen softly out of focus; no readable code. Authentic modest creative study environment, not luxury headquarters, not a posed stock-photo smile.

### equipe

Destino: `apps/web/public/images/orbitamos/equipe-v1.png`

Use case: photorealistic-natural. Create ONE new 3:2 landscape editorial brand photograph for the Orbitamos education and digital-work website. Photograph only, no ad layout, no headline, no UI overlay, no social badges, no caption or watermark. Natural believable adult Brazilian people and anatomy, real skin and cloth textures, thoughtful documentary composition, premium art direction. Charcoal clothing, warm skin, dark ink-blue studio details with a restrained cyan or violet practical light, not oversaturated neon. Integrate the wordmark 'ORBITAMOS' accurately as a subtle physical print or embroidered mark on clothing or an item in the scene, not a floating logo. Keep all essential action in the middle horizontal band for responsive cropping. This is a fictional illustrative scene, not documentation of real staff, students or clients. Scene: three young adult Brazilian collaborators, two women and a man with varied appearances, working together over one open notebook and laptop at a small creative studio table. Wide intimate side view, conversational gestures and concentration rather than looking at camera. One charcoal shirt with a small cyan ORBITAMOS wordmark and one matte black mug bearing the same name. Window daylight plus a soft practical cyan light, genuine lived-in working environment, not a giant corporate office. No visible screen UI or fake data.

### mentoria

Destino: `apps/web/public/images/orbitamos/mentoria-v1.png`

Use case: photorealistic-natural. Create ONE new 3:2 landscape editorial brand photograph for the Orbitamos education and digital-work website. Photograph only, no ad layout, no headline, no UI overlay, no social badges, no caption or watermark. Natural believable adult Brazilian people and anatomy, real skin and cloth textures, thoughtful documentary composition, premium art direction. Charcoal clothing, warm skin, dark ink-blue studio details with a restrained cyan or violet practical light, not oversaturated neon. Integrate the wordmark 'ORBITAMOS' accurately as a subtle physical print or embroidered mark on clothing or an item in the scene, not a floating logo. Keep all essential action in the middle horizontal band for responsive cropping. This is a fictional illustrative scene, not documentation of real staff, students or clients. Scene: one adult mentor and one adult student sitting beside each other reviewing a notebook and a laptop, a woman mentor in her early thirties gently pointing to the student's pencil sketch. Side-on close medium photograph captures both people naturally listening and thinking, not smiling at camera. Subtle ORBITAMOS embroidered on mentor's charcoal overshirt, a notebook with matching small printed wordmark. Warm task lamp, restrained blue background, eye-level camera, quiet supportive mood. No readable lesson text, no claims of real staff.

### dados

Destino: `apps/web/public/images/orbitamos/dados-v1.png`

Use case: photorealistic-natural. Create ONE new 3:2 landscape editorial brand photograph for the Orbitamos education and digital-work website. Photograph only, no ad layout, no headline, no UI overlay, no social badges, no caption or watermark. Natural believable adult Brazilian people and anatomy, real skin and cloth textures, thoughtful documentary composition, premium art direction. Charcoal clothing, warm skin, dark ink-blue studio details with a restrained cyan or violet practical light, not oversaturated neon. Integrate the wordmark 'ORBITAMOS' accurately as a subtle physical print or embroidered mark on clothing or an item in the scene, not a floating logo. Keep all essential action in the middle horizontal band for responsive cropping. This is a fictional illustrative scene, not documentation of real staff, students or clients. Scene: an adult student working with data at a small dark desk. Close over-shoulder angle, one hand on a laptop trackpad and the other holding a pen above an open paper grid. A second monitor in the background displays softly defocused abstract spreadsheet rows and a few simple chart shapes, no readable numbers or software logos. Matte charcoal notebook with clean cyan ORBITAMOS wordmark clearly visible in the foreground. A warm wood desk edge, subtle violet practical light, authentic analytical working moment, not glowing sci-fi dashboards.

### hardware

Destino: `apps/web/public/images/orbitamos/hardware-v1.png`

Use case: photorealistic-natural. Create ONE new 3:2 landscape editorial brand photograph for the Orbitamos education and digital-work website. Photograph only, no ad layout, no headline, no UI overlay, no social badges, no caption or watermark. Natural believable adult Brazilian people and anatomy, real skin and cloth textures, thoughtful documentary composition, premium art direction. Charcoal clothing, warm skin, dark ink-blue studio details with a restrained cyan or violet practical light, not oversaturated neon. Integrate the wordmark 'ORBITAMOS' accurately as a subtle physical print or embroidered mark on clothing or an item in the scene, not a floating logo. Keep all essential action in the middle horizontal band for responsive cropping. This is a fictional illustrative scene, not documentation of real staff, students or clients. Scene: adult student's hands carefully assembling a real desktop computer on a tidy graphite workbench. Realistic motherboard, memory slots, cooling fan and a precision screwdriver, a small tray of screws, physical credible parts. Close diagonal view, no sparks or fantastical hardware. One black antistatic mat has a modest crisp cyan ORBITAMOS print at its edge, in the visible central area. Warm task light with subtle ink-blue shadows, tangible machined metal and textured plastic. A compact learning workshop, not a data center.

### criacao

Destino: `apps/web/public/images/orbitamos/criacao-v1.png`

Use case: photorealistic-natural. Create ONE new 3:2 landscape editorial brand photograph for the Orbitamos education and digital-work website. Photograph only, no ad layout, no headline, no UI overlay, no social badges, no caption or watermark. Natural believable adult Brazilian people and anatomy, real skin and cloth textures, thoughtful documentary composition, premium art direction. Charcoal clothing, warm skin, dark ink-blue studio details with a restrained cyan or violet practical light, not oversaturated neon. Integrate the wordmark 'ORBITAMOS' accurately as a subtle physical print or embroidered mark on clothing or an item in the scene, not a floating logo. Keep all essential action in the middle horizontal band for responsive cropping. This is a fictional illustrative scene, not documentation of real staff, students or clients. Scene: young adult designer's hands working on a small brand and web layout study at a graphite desk. Real cream paper wireframe sketches with abstract rectangles, a few muted lilac and cyan swatches, a slim drawing tablet and blurred laptop, no readable UI or fake web page. A black notebook with clear small ORBITAMOS white wordmark and a subtle branded laptop sticker. Documentary diagonal overhead angle, tactile paper fibers, daylight, rich ink-blue shadows and warm skin. Practical creative study, not floating vector shapes or a 3D render.
