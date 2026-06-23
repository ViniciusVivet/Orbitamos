-- Orbitamos v3.0 - Seed de cursos/materiais importados do Drive
-- Execute depois da migration 006. Nao apaga progresso de alunos.
-- Os arquivos ficam versionados em apps/web/public/course-materials e sao referenciados por external_url.

with course_seed(slug, title, description, level, position) as (
  values
    ('html-css-js', 'HTML, CSS e JavaScript', 'Base pratica para criar paginas, dashboards e interfaces web.', 'iniciante', 1),
    ('logica-programacao-python', 'Logica de Programacao com Python', 'Primeiros passos de algoritmo, raciocinio logico e pratica com Python.', 'iniciante', 2),
    ('csharp-fundamentos', 'C# Fundamentos', 'Base de C# para quem esta iniciando no ecossistema .NET.', 'iniciante', 3),
    ('sql-na-pratica', 'SQL na Pratica', 'Banco de dados relacional, consultas e exercicios com SQL.', 'iniciante', 4),
    ('github-colaborativo', 'GitHub Colaborativo', 'Fluxo basico e intermediario com fork, pull request e colaboracao.', 'iniciante', 5),
    ('excel-procv', 'Excel - PROCV', 'Consulta de dados e automacao inicial de planilhas com PROCV.', 'iniciante', 6),
    ('vba-excel', 'VBA para Excel', 'Macros, formularios e gravacao em planilhas como banco de dados.', 'intermediario', 7),
    ('power-bi', 'Power BI', 'Primeiros passos em analise visual de dados com Power BI.', 'iniciante', 8),
    ('montagem-manutencao', 'Montagem e Manutencao', 'Hardware, manutencao e sistema operacional Linux.', 'iniciante', 9)
)
insert into public.courses (slug, title, description, level, is_published, position)
select slug, title, description, level, true, position
from course_seed
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  level = excluded.level,
  is_published = excluded.is_published,
  position = excluded.position,
  updated_at = now();

with module_seed(course_slug, slug, title, position) as (
  values
    ('html-css-js', 'fundamentos-pratica-web', 'Fundamentos e pratica web', 1),
    ('logica-programacao-python', 'fundamentos', 'Fundamentos', 1),
    ('csharp-fundamentos', 'primeiras-aulas', 'Primeiras aulas', 1),
    ('sql-na-pratica', 'banco-de-dados', 'Banco de dados', 1),
    ('github-colaborativo', 'fluxo-de-colaboracao', 'Fluxo de colaboracao', 1),
    ('excel-procv', 'funcoes-de-busca', 'Funcoes de busca', 1),
    ('vba-excel', 'automacao-no-excel', 'Automacao no Excel', 1),
    ('power-bi', 'aula-inicial', 'Aula inicial', 1),
    ('montagem-manutencao', 'hardware-sistema-operacional', 'Hardware e sistema operacional', 1)
)
insert into public.course_modules (course_id, slug, title, position)
select c.id, m.slug, m.title, m.position
from module_seed m
join public.courses c on c.slug = m.course_slug
on conflict (course_id, slug) do update set
  title = excluded.title,
  position = excluded.position,
  updated_at = now();

with lesson_seed(course_slug, module_slug, slug, title, content, position) as (
  values
    ('html-css-js', 'fundamentos-pratica-web', 'html-do-zero', 'HTML do zero', 'Estrutura inicial de uma pagina HTML antes de entrar em CSS e JavaScript.', 1),
    ('html-css-js', 'fundamentos-pratica-web', 'html-css-js-atividade-pratica', 'HTML, CSS e JS - atividade pratica', 'Exercicio guiado para aplicar estrutura, estilo e comportamento em uma pagina simples.', 2),
    ('html-css-js', 'fundamentos-pratica-web', 'dashboard-futurista-html', 'Dashboard futurista com HTML', 'Material para construir uma interface visual mais elaborada e treinar composicao de tela.', 3),
    ('html-css-js', 'fundamentos-pratica-web', 'html-aula-1', 'HTML - aula 1', 'Reforco de marcacao e organizacao inicial de conteudo web.', 4),
    ('logica-programacao-python', 'fundamentos', 'aula-0-introducao-logica', 'Aula 0 - introducao a logica', null, 1),
    ('logica-programacao-python', 'fundamentos', 'apostila-logica-python', 'Apostila de logica com Python', null, 2),
    ('logica-programacao-python', 'fundamentos', 'logica-programacao-python', 'Logica de programacao com Python', null, 3),
    ('logica-programacao-python', 'fundamentos', 'logica-programacao-parte-2', 'Logica de programacao - parte 2', null, 4),
    ('logica-programacao-python', 'fundamentos', 'aula-3-pratica-python', 'Aula 3 - pratica com Python', null, 5),
    ('csharp-fundamentos', 'primeiras-aulas', 'csharp-aula-1', 'C# - aula 1', null, 1),
    ('csharp-fundamentos', 'primeiras-aulas', 'csharp-atividade-pratica-1', 'C# - atividade pratica 1', null, 2),
    ('csharp-fundamentos', 'primeiras-aulas', 'averiguar-csharp', 'Averiguar C#', null, 3),
    ('csharp-fundamentos', 'primeiras-aulas', 'csharp-nivel-medio-cinema-bruno', 'C# nivel medio - Cinema do Bruno', null, 4),
    ('sql-na-pratica', 'banco-de-dados', 'introducao-ao-sql', 'Introducao ao SQL', null, 1),
    ('sql-na-pratica', 'banco-de-dados', 'sql-pratica-oracle-live', 'SQL na pratica 2 - Oracle Live', null, 2),
    ('github-colaborativo', 'fluxo-de-colaboracao', 'github-basico-intermediario', 'GitHub basico ao intermediario', null, 1),
    ('github-colaborativo', 'fluxo-de-colaboracao', 'fork-pull-request', 'Fork e pull request', null, 2),
    ('github-colaborativo', 'fluxo-de-colaboracao', 'pull-request-pratica', 'Pull request na pratica', null, 3),
    ('excel-procv', 'funcoes-de-busca', 'excel-procv', 'Excel PROCV', null, 1),
    ('vba-excel', 'automacao-no-excel', 'vba-excel-atividade-pratica', 'VBA para Excel avancado - atividade pratica', null, 1),
    ('vba-excel', 'automacao-no-excel', 'banco-dados-planilha', 'Banco de dados em planilha', null, 2),
    ('vba-excel', 'automacao-no-excel', 'formulario-grava-banco-dados', 'Formulario que grava no banco de dados', null, 3),
    ('power-bi', 'aula-inicial', 'power-bi-aula-1', 'Power BI - aula 1', null, 1),
    ('power-bi', 'aula-inicial', 'gabarito-power-bi-aula-1', 'Gabarito Power BI - aula 1', null, 2),
    ('montagem-manutencao', 'hardware-sistema-operacional', 'pecas-hardware-computador', 'Pecas de hardware do computador', null, 1),
    ('montagem-manutencao', 'hardware-sistema-operacional', 'desafio-pratico-hardware', 'Desafio pratico - tecnico de hardware', null, 2),
    ('montagem-manutencao', 'hardware-sistema-operacional', 'sistema-operacional-linux', 'Sistema operacional Linux', null, 3)
)
insert into public.lessons (module_id, slug, title, youtube_video_id, content, is_published, position)
select cm.id, l.slug, l.title, null, l.content, true, l.position
from lesson_seed l
join public.courses c on c.slug = l.course_slug
join public.course_modules cm on cm.course_id = c.id and cm.slug = l.module_slug
on conflict (module_id, slug) do update set
  title = excluded.title,
  youtube_video_id = excluded.youtube_video_id,
  content = excluded.content,
  is_published = excluded.is_published,
  position = excluded.position,
  updated_at = now();

delete from public.lesson_materials lm
using public.lessons l
join public.course_modules cm on cm.id = l.module_id
join public.courses c on c.id = cm.course_id
where lm.lesson_id = l.id
  and c.slug in (
    'html-css-js',
    'logica-programacao-python',
    'csharp-fundamentos',
    'sql-na-pratica',
    'github-colaborativo',
    'excel-procv',
    'vba-excel',
    'power-bi',
    'montagem-manutencao'
  );

with material_seed(course_slug, module_slug, lesson_slug, title, kind, external_url, position) as (
  values
    ('html-css-js', 'fundamentos-pratica-web', 'html-do-zero', 'HTML do zero', 'DOCX', '/course-materials/html-css-js/04-html-do-zero-sem-css-e-sem-javascript.docx', 1),
    ('html-css-js', 'fundamentos-pratica-web', 'html-css-js-atividade-pratica', 'Atividade pratica HTML, CSS e JS', 'DOCX', '/course-materials/html-css-js/02-html-js-e-css-atv-pratica-1.docx', 1),
    ('html-css-js', 'fundamentos-pratica-web', 'dashboard-futurista-html', 'HTML Dashboard Futurista', 'DOCX', '/course-materials/html-css-js/01-html-dashboard-futurista.docx', 1),
    ('html-css-js', 'fundamentos-pratica-web', 'html-aula-1', 'HTML - aula 1', 'DOCX', '/course-materials/html-css-js/03-html-1.docx', 1),
    ('logica-programacao-python', 'fundamentos', 'aula-0-introducao-logica', 'Logica de programacao - aula 0', 'DOCX', '/course-materials/logica-programacao-python/04-logica-de-programacao-aula-0.docx', 1),
    ('logica-programacao-python', 'fundamentos', 'apostila-logica-python', 'Apostila - logica de programacao com Python', 'DOCX', '/course-materials/logica-programacao-python/01-apostila-logica-de-programacao-com-python.docx', 1),
    ('logica-programacao-python', 'fundamentos', 'logica-programacao-python', 'Logica de programacao com Python', 'DOCX', '/course-materials/logica-programacao-python/02-logica-de-programacao-com-python.docx', 1),
    ('logica-programacao-python', 'fundamentos', 'logica-programacao-parte-2', 'Logica de programacao - parte 2', 'DOCX', '/course-materials/logica-programacao-python/03-logica-de-programacao-2.docx', 1),
    ('logica-programacao-python', 'fundamentos', 'aula-3-pratica-python', 'Logica de programacao - aula 3 com Python', 'DOCX', '/course-materials/logica-programacao-python/05-logica-de-programacao-aula-3-com-python.docx', 1),
    ('csharp-fundamentos', 'primeiras-aulas', 'csharp-aula-1', 'C# - aula 1', 'DOCX', '/course-materials/csharp-fundamentos/03-c-aula-1.docx', 1),
    ('csharp-fundamentos', 'primeiras-aulas', 'csharp-atividade-pratica-1', 'C# - atividade pratica 1', 'DOCX', '/course-materials/csharp-fundamentos/01-c-aula-pratica-atv-1.docx', 1),
    ('csharp-fundamentos', 'primeiras-aulas', 'averiguar-csharp', 'Averiguar C#', 'DOCX', '/course-materials/csharp-fundamentos/02-averiguar-c.docx', 1),
    ('csharp-fundamentos', 'primeiras-aulas', 'csharp-nivel-medio-cinema-bruno', 'C# nivel medio - Cinema do Bruno', 'DOCX', '/course-materials/csharp-fundamentos/04-c-2-nivel-medio-cinema-do-bruno.docx', 1),
    ('sql-na-pratica', 'banco-de-dados', 'introducao-ao-sql', 'Introducao ao SQL - banco de dados na pratica', 'DOCX', '/course-materials/sql-na-pratica/02-introducao-ao-sql-banco-de-dados-na-pratica.docx', 1),
    ('sql-na-pratica', 'banco-de-dados', 'sql-pratica-oracle-live', 'SQL na pratica 2 - Oracle Live', 'DOCX', '/course-materials/sql-na-pratica/01-sql-na-pratica-2-oracle-live.docx', 1),
    ('github-colaborativo', 'fluxo-de-colaboracao', 'github-basico-intermediario', 'GitHub basico ao intermediario', 'DOCX', '/course-materials/github-colaborativo/03-github-basico-intermediario.docx', 1),
    ('github-colaborativo', 'fluxo-de-colaboracao', 'fork-pull-request', 'GitHub - fork e pull request', 'DOCX', '/course-materials/github-colaborativo/01-github-fork-pull-request.docx', 1),
    ('github-colaborativo', 'fluxo-de-colaboracao', 'pull-request-pratica', 'GitHub - fork e pull request PR', 'DOCX', '/course-materials/github-colaborativo/02-github-fork-pull-request-pr.docx', 1),
    ('excel-procv', 'funcoes-de-busca', 'excel-procv', 'Excel PROCV', 'DOCX', '/course-materials/excel-procv/01-excel-procv.docx', 1),
    ('vba-excel', 'automacao-no-excel', 'vba-excel-atividade-pratica', 'VBA para Excel avancado - atividade pratica', 'DOCX', '/course-materials/vba-excel/01-vba-para-excel-avancado-atv-pratica-1.docx', 1),
    ('vba-excel', 'automacao-no-excel', 'banco-dados-planilha', 'Banco de dados XLSM', 'XLSM', '/course-materials/vba-excel/02-banco-de-dados-xlsm2005.xlsm', 1),
    ('vba-excel', 'automacao-no-excel', 'formulario-grava-banco-dados', 'Apostila VBA - formulario com banco de dados', 'DOCX', '/course-materials/vba-excel/03-apostila-vba-no-excel-formulario-que-grava-no-banco-de-dados.docx', 1),
    ('power-bi', 'aula-inicial', 'power-bi-aula-1', 'Power BI - aula 1', 'DOCX', '/course-materials/power-bi/01-aula-1-power-bi.docx', 1),
    ('power-bi', 'aula-inicial', 'gabarito-power-bi-aula-1', 'Gabarito Power BI - aula 1', 'DOCX', '/course-materials/power-bi/02-gabarito-powerbi-aula-1.docx', 1),
    ('montagem-manutencao', 'hardware-sistema-operacional', 'pecas-hardware-computador', 'Pecas de hardware do computador', 'DOCX', '/course-materials/montagem-manutencao/01-pecas-de-hardware-do-computador.docx', 1),
    ('montagem-manutencao', 'hardware-sistema-operacional', 'desafio-pratico-hardware', 'Desafio pratico - tecnico de hardware', 'DOCX', '/course-materials/montagem-manutencao/02-desafio-pratico-tecnico-de-hardware.docx', 1),
    ('montagem-manutencao', 'hardware-sistema-operacional', 'sistema-operacional-linux', 'Montagem e manutencao - Linux', 'DOCX', '/course-materials/montagem-manutencao/03-montagem-manutencao-sistema-operacional-linux.docx', 1)
)
insert into public.lesson_materials (lesson_id, title, kind, external_url, position)
select l.id, m.title, m.kind, m.external_url, m.position
from material_seed m
join public.courses c on c.slug = m.course_slug
join public.course_modules cm on cm.course_id = c.id and cm.slug = m.module_slug
join public.lessons l on l.module_id = cm.id and l.slug = m.lesson_slug;
