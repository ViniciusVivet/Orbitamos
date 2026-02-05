# Arquitetura: Área do Estudante

Visão da estrutura do ambiente dedicado a estudantes (alunos logados), separado do conteúdo público.

---

## 1. Princípios

- **Área separada por rota**: tudo do estudante logado fica em `/estudante/*`, com layout próprio (sidebar).
- **Público vs logado**: páginas como `/orbitacademy`, `/mentorias`, `/sobre` continuam **públicas** (atraem quem não está logado). Quando o usuário **loga como estudante**, entra no fluxo próprio em `/estudante`.
- **Backend compartilhado**: APIs como `/api/dashboard/summary`, `/api/dashboard/me` servem o estudante; controle por role quando precisar.
- **Escalável**: nova tela = nova pasta em `app/estudante/` + item no sidebar.

---

## 2. Rotas (Frontend)

| Rota | Descrição |
|------|-----------|
| `/estudante` | Início / resumo (progresso, próxima ação, checklist) |
| `/estudante/aulas` | OrbitAcademy para o aluno (conteúdo + progresso) |
| `/estudante/mentorias` | Suas mentorias e agenda |
| `/estudante/progresso` | Progresso, checklist da semana, conquistas |
| `/estudante/comunidade` | Mural / comunidade |
| `/estudante/conta` | Configurações da conta (nome, foto) |

Todas protegidas: só usuário logado com `role === STUDENT`. Caso contrário, redirecionar para `/dashboard` (que por sua vez redireciona STUDENT → `/estudante` e FREELANCER → `/colaborador`).

---

## 3. Fluxo

- **Não logado**: vê Home, Sobre, Mentorias, OrbitAcademy (público), Contato, Entrar.
- **Logado como estudante**: após login vai para `/estudante`; nav mostra "Área do Estudante" → `/estudante`.
- **Logado como colaborador**: após login vai para `/colaborador`; nav mostra "Área Colaborador" → `/colaborador`.

Assim o projeto não vira "gabunça": dois fluxos claros (estudante e colaborador), cada um com sua área e sidebar.
