# Roadmap de produto

Ultima atualizacao: 2026-06-24

## Direcao

A Orbitamos deve continuar com duas frentes conectadas:

- **Studio digital**: vender projetos, gerar autoridade e captar clientes.
- **Portal de tecnologia**: formar alunos, organizar aulas, comunidade, progresso e oportunidades.

O curto prazo deve proteger custo baixo e estabilidade. O medio prazo pode adicionar automacao e painel administrativo. Backend proprio so volta quando existir regra de negocio suficiente para justificar custo e manutencao.

## Curto prazo

- Consolidar Supabase como backend principal da area logada.
- Validar login, perfil, avatar, contatos, forum, mensagens e progresso em producao.
- Melhorar a experiencia de aulas com preview de PDF/DOCX e download confiavel.
- Manter portfolio publico atualizado com novos cases e metricas reais.
- Ajustar RLS/policies quando novos fluxos forem adicionados.

## Medio prazo

- Criar painel administrativo para cursos, modulos, aulas e materiais.
- Criar painel para portfolio/cases se o volume de projetos crescer.
- Evoluir chat para Supabase Realtime.
- Criar fluxo de vagas/candidaturas entre estudantes e colaboradores.
- Adicionar certificados simples por conclusao de trilha.

## Futuro

- Avaliar API propria em ASP.NET Core, Spring ou outro stack quando houver demanda real.
- Considerar CMS se o conteudo publico ficar frequente demais para editar no codigo.
- Considerar storage externo para materiais grandes.
- Adicionar automacoes de WhatsApp/email quando existir rotina operacional.

## Criterio de prioridade

Antes de implementar qualquer feature, responder:

1. Isso ajuda a vender projetos agora?
2. Isso ajuda aluno a estudar melhor agora?
3. Isso reduz manutencao/custo agora?
4. Isso exige backend proprio ou Supabase resolve bem?

Se a resposta nao for clara, deixar no backlog.
