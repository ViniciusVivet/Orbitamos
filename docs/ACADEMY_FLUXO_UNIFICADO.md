# Fluxo unificado da Academy

Registro de implementação e decisões: 26/10/2026.

## Dois contextos de navegação

O site público mantém projetos, serviços e orçamento. As rotas de estudante,
colaborador e mensagens usam o contexto de trabalho/estudo, sem a navegação e
os widgets comerciais sobrepostos. `SiteFrame` controla apresentação; proxy,
autenticação e permissões continuam responsáveis pelo acesso.

O menu do estudante tem cinco destinos estáveis:

| Destino | Função |
| --- | --- |
| Início | Próxima ação e retomada da atividade salva |
| Trilhas | C#, SQL e conteúdos de apoio organizados por assunto |
| Praticar | Código, Jogos, Inglês e Revisão |
| Progresso | Aulas e evidências das atividades, sem misturar percentuais |
| Comunidade | Fórum público, Discord, mentorias e mensagens |

Conta e configurações, troca de área, retorno ao site e saída ficam no rodapé.
O colaborador mantém seus destinos de trabalho com o mesmo cabeçalho.

## Continuidade sem inventar domínio

`academyActivity` combina os registros e rascunhos existentes, sem reescrevê-los.
Uma visita é diferente de uma tentativa, de uma etapa validada e de uma revisão.
Aulas, código, C# e SQL conservam suas próprias unidades e denominadores.
Não existe um percentual agregado que finja medir domínio de programação.

O índice `orbitamos-academy-resume-v1-<userId>` guarda apenas o destino interno
de uma atividade e sua data. A lista de rotas e parâmetros é restrita. Visitar
uma rota nunca concede conclusão. Saves antigos sem data são apresentados como
atividade salva, sem inventar quando foram feitos. O escopo é por conta neste
navegador; esses registros locais ainda não sincronizam entre dispositivos.

A página inicial oferece uma ação principal de retomada. Quando não há atividade,
propõe a primeira linha de código. Jogos apontam para a aplicação do conceito no
editor. C# preserva o módulo na URL e SQL mantém o modo oficina. Os cursos em vídeo
anteriores permanecem acessíveis como apoio, sem duplicar as trilhas de prática.

## Celular e acessibilidade

O cabeçalho e a sidebar compartilham títulos, destino ativo e contexto. O menu
mobile prende o foco enquanto aberto, fecha com Escape e devolve o foco ao botão,
inclusive no WebKit. Nomes extensos no rodapé são truncados dentro da sidebar.
Os atalhos inferiores aparecem nas páginas de escolha, sem cobrir os controles
dos jogos e do editor. A navegação comercial continua disponível no site público.

## Retorno depois do login

`authNavigation` valida destinos relativos internos e preserva query e âncora,
recusando URLs externas, escapes e loops de autenticação. Login, cadastro,
restauração de sessão e guards usam a mesma política. Mensagens recebe
`area=student|work` e considera o contexto salvo por conta para voltar à área certa.

Limite de validação: nesta cópia local o Supabase não está configurado para
concluir uma autenticação real. As regras de retorno têm testes unitários e de
proxy, mas isso não equivale a um login ponta a ponta aprovado. Não foram criadas
contas reais nem alteradas as variáveis de ambiente.

## Prévia local e verificações

As prévias continuam disponíveis apenas em desenvolvimento:

- `/dev/academy-preview?view=home`: início com continuidade local.
- `/dev/academy-preview?view=tracks`: catálogo de trilhas.
- `/dev/academy-preview?view=progress`: evidências de progresso.
- `/dev/academy-preview?view=community`: comunidade e ajuda.
- `/dev/academy-preview`: jogos e formatos de prática.
- `/dev/lab-preview?academy=1`: laboratório integrado à mesma prévia.
- `/dev/csharp-preview?academy=1`: trilha C# com o mesmo identificador local.

Links de conta, mensagens e conteúdos privados continuam exigindo autenticação;
a prévia não simula acesso aos dados privados.

Scripts de verificação em `apps/web/scripts/`:

- `audit-academy-navigation.mjs`: destinos, formato ativo, menu/foco mobile,
  retomada, evidências de visita e preservação do site comercial.
- `audit-academy-catalog.mjs`: trilhas e comunidade.
- `audit-academy-continuity.mjs`: saves preservados, retomada e módulo C#.
- `audit-auth-navigation.mjs`: registra também o bloqueio de configuração do login.

Os relatórios e capturas ficam em `apps/web/test-results/`. Os perfis incluem
desktop, WebKit com iPhone 13 e viewport de 320 pixels. A suíte unitária completa
tem 374 testes em 41 arquivos. Build, lint e auditorias de navegador devem ser
conferidos novamente quando houver mudanças de comportamento.
