# Orbitamos — Trilha C#/.NET orientada à primeira oportunidade

Pesquisa e proposta de produto: **25/09/2026**.
Status: **desenho para discussão e implementação por etapas**, não curso completo publicado.
Público inicial proposto: pessoa iniciante no Brasil, conciliando estudo com trabalho, buscando backend júnior. Full stack entra como especialização opcional.

## 1. O produto que queremos entregar

Não apenas uma lista de vídeos: uma jornada de acolhimento, prática, revisão e construção de evidências de competência.

Nome de trabalho: **C#/.NET — da primeira linha ao primeiro projeto profissional**.

Proposta ao aluno: "Entenda a profissão, aprenda construindo e prepare projetos que você consegue explicar numa entrevista. Comece pelo celular; avance para um ambiente .NET real quando chegar a hora."

Não prometer contratação, salário, senioridade ou prazo universal. O marco final é uma avaliação prática com critérios públicos, não um contador de vídeos assistidos. Vagas, região, formação, disponibilidade e processos seletivos também influenciam a contratação.

## 2. O que a pesquisa encontrou

Amostra exploratória de seis anúncios coerentes com o tema, consultados em 25/09/2026. Não é levantamento estatístico nem permite afirmar percentuais do mercado. Uma página acessível não garante que a seleção continuará aberta. Preservar cargo, local, fonte e data de consulta; datas relativas de publicação são apenas as que o anúncio mostrava naquele momento.

| Fonte | Sinal observado | Consequência para a trilha |
| --- | --- | --- |
| [BRQ — Backend Júnior, LinkedIn](https://br.linkedin.com/jobs/view/desenvolvedor-a-backend-j%C3%BAnior-c%23-net-h%C3%ADbrido-sp-at-brq-digital-solutions-4466342270) | Base de C#, orientação a objetos, APIs, SQL, Git e colaboração; separa requisitos de diferenciais | Ensinar o núcleo antes de Docker, filas e microsserviços |
| [Extractta — Backend Júnior, LinkedIn](https://br.linkedin.com/jobs/view/desenvolvedor-backend-j%C3%BAnior-c%23-net-at-extractta-4469632074) | SQL Server/Oracle, APIs, testes, PRs, Azure DevOps, bugs e uso crítico de IA; graduação em andamento/concluída aparece no requisito | Incluir manutenção, entrega e leitura crítica de código; explicar filtros de formação |
| [SEGIMOB — Full Stack .NET Júnior, Gupy](https://segimob.gupy.io/jobs/12059829) | EF Core, Angular, SQL, Git, Docker/CI, arquitetura e integração | Criar ramificação full stack, sem tornar toda essa lista uma barreira à primeira aula |
| [Confitec — .NET/Angular Júnior, Gupy](https://confitec.gupy.io/jobs/12425462) | Regras de negócio, APIs, autenticação, LINQ, revisão de código e responsabilidade por código feito com IA | O aluno deve explicar e testar a solução, não apenas produzir código |
| [Benner — Programador Junior, Gupy](https://vemserbenner.gupy.io/jobs/12261423) | Funcionalidades, testes unitários, investigação de bugs, revisão e SQL Server/Git; formação também aparece | Simular uma tarefa de equipe e uma correção em projeto existente |
| [4DF Connect — .NET Júnior/Pleno, LinkedIn](https://br.linkedin.com/jobs/view/desenvolvedor-a-net-j%C3%BAnior-pleno-at-4df-connect-4463143653) | C#, ASP.NET Core, APIs, SQL e Git; manutenção de SaaS como diferencial | Priorizar um projeto de negócio compreensível, incluindo manutenção |

**Cuidado com os títulos:** o [anúncio NOUS LATAM](https://br.linkedin.com/jobs/view/desenvolvedor-a-full-stack-junior-c%23-net-%2B-angular-brl-4-500-clt-%2B-benef%C3%ADcios-at-nous-latam-4469943998) mostrava júnior e R$ 4.500 no título, mas descrevia uma posição plena. Excluído da referência salarial de júnior. Não repetir salário extraído apenas de um título de busca.

Conclusão editorial, não estatística: backend C# é a combinação de linguagem + APIs + dados + qualidade + colaboração. Angular aparece no recorte full stack; não é requisito universal de backend. Microserviços, Kubernetes e múltiplas nuvens não devem abrir o curso.

## 3. Como falar de salário sem vender ilusão

O [Guia Robert Half 2026 — Backend Júnior](https://www.roberthalf.com/br/pt/vagas-detalhes/desenvolvedora-back-end-junior) apresenta os valores nacionais de R$ 6.050, R$ 6.850 e R$ 8.750 nos percentis 25, 50 e 75. É uma referência de recrutamento para **backend em geral**, não exclusivamente C#, e não um piso ou promessa de primeira contratação. A metodologia usa remunerações de profissionais conectados a empresas pela consultoria.

O anúncio da 4DF Connect informa R$ 6.000–8.000 por mês, mas mistura **júnior/pleno** no título. Usar apenas como exemplo individual identificado, sem tratá-lo como média de entrada e sem inferir CLT/PJ a partir dos benefícios.

Na interface:

- Mostrar fonte, ano, senioridade, região e regime quando informado.
- Separar "referência de guia salarial" de "exemplo de anúncio".
- Explicar que oferta concreta pode variar, inclusive abaixo dessas referências.
- Não misturar valores CLT e PJ nem anunciar média obtida dessas poucas observações.
- Dados salariais ficam em texto editável, não queimados numa imagem ou vídeo que envelhece.
- Revisão editorial sugerida: mensal para vagas e na nova edição para guias; exibir sempre a data da última revisão real. Nenhuma atualização automática foi configurada.

## 4. Stack proposta e ordem de prioridade

### Núcleo da primeira oportunidade

1. Lógica e C#: tipos, operadores, condições, laços, métodos, strings, coleções e tratamento de erros.
2. Depuração: ler mensagens, reproduzir um erro, breakpoints, inspecionar variáveis e explicar a correção.
3. Orientação a objetos: composição, encapsulamento, interfaces e responsabilidades. SOLID com exemplos pequenos, não memorização de siglas.
4. C# aplicado: generics, LINQ, nullable, exceções, `async/await`, `Task` e cancelamento.
5. Git/GitHub: commits pequenos, branches, pull requests, revisão e conflitos. Começar cedo, não deixar para o último módulo.
6. HTTP, JSON, REST, status codes, contratos, validação e documentação OpenAPI.
7. ASP.NET Core: endpoints, controllers/Minimal APIs, injeção de dependência, middleware, configuração, logs e tratamento de erros.
8. SQL: modelagem, chaves e relacionamentos, consultas, joins, transações e noção de índices. SQL Server como referência principal da amostra; PostgreSQL como transferência posterior.
9. Entity Framework Core: consultas, migrations, relacionamentos, rastreamento e prevenção de consultas desnecessárias. Ensinar SQL antes de depender do ORM.
10. Autenticação versus autorização; identidade, permissões e validação de tokens usando bibliotecas consolidadas. Segredos fora do repositório e dados fictícios nos exercícios.
11. xUnit como ferramenta inicial de testes; noções de NUnit/MSTest para leitura de outros projetos. Testes de regra de negócio e integração da API com banco apropriado.
12. Entrega: Docker básico, pipeline de build/testes, publicação em um ambiente, logs, diagnóstico e rollback básico.
13. Trabalho em equipe: entender um ticket, fazer perguntas, escrever critérios de aceite, documentar, estimar com ressalvas e responder a code review.
14. IA como assistente: pedir explicação, avaliar sugestões, escrever testes e identificar erro plausível. O aluno continua responsável e precisa conseguir explicar o resultado.

### Base de versão

Usar **.NET 10 LTS**, atualizado no patch, como base nova. A [política oficial da Microsoft](https://dotnet.microsoft.com/en-us/platform/support/policy) informa suporte até 14/11/2028. .NET 8 e 9 têm encerramento de suporte informado para 10/11/2026; não lançar um curso novo ancorado neles sem contextualizar migração. Ensinar a distinguir .NET moderno de .NET Framework e a ler uma base legada, sem transformar legado no eixo inicial.

### Aprofundamentos posteriores

- Angular + TypeScript + HTML/CSS para vagas full stack.
- Azure: um deploy compreendido antes de explorar vários serviços; Azure DevOps ou GitHub Actions como primeira esteira, não ambos simultaneamente.
- Dapper, queries mais complexas e leitura de procedures conforme a oportunidade.
- Redis, mensageria, idempotência, RabbitMQ/Service Bus; depois arquiteturas distribuídas.
- Leitura de .NET Framework/ASP.NET MVC/WinForms conforme o recorte de vaga.
- Clean Architecture e DDD depois de existir um sistema com problemas que essas abordagens ajudem a resolver.
- Kubernetes, múltiplos brokers, MAUI, Unity e especializações não fazem parte da porta de entrada backend.

Os nomes das ferramentas acima são escolhas curriculares justificadas; não significam que cada anúncio exige todas elas.

## 5. Uma história que acompanha o aluno

Projeto contínuo: **OrbiServiços**, sistema fictício para organizar clientes, serviços e entregas de um pequeno negócio. Usar problemas reconhecíveis por quem faz freelances ou entregas, sem restringir a formação a esse setor.

| Estação | O aluno aprende | Evidência que entrega |
| --- | --- | --- |
| 0 — Antes do código | Profissão, remuneração com contexto, rotina, limites e mapa | Escolha de objetivo e plano de estudo revisável |
| 1 — Primeiras linhas | Lógica, variáveis, decisões, repetição e métodos | Pequenos programas e explicação da saída, incluindo uma variação sem copiar |
| 2 — Programa organizado | Objetos, coleções, LINQ e erros | Aplicação console de serviços com regras próprias e histórico Git |
| 3 — Dados de verdade | Modelagem, SQL e consultas | Banco com clientes, serviços e consultas explicadas |
| 4 — Sua primeira API | HTTP, ASP.NET Core, validação, EF Core e async | API documentada que cadastra, consulta e atualiza serviços |
| 5 — Confiabilidade | Autorização, testes, bugs, logs e falhas | Correção de um bug com teste que reproduz o problema e PR revisável |
| 6 — Entrega de equipe | Docker, CI/CD, configuração e deploy | Projeto reproduzível, pipeline e demonstração da aplicação |
| 7 — Primeiras candidaturas | Portfólio, explicação técnica, currículo, entrevista e leitura de vagas | Caso autoral + desafio diferente do tutorial + simulação de entrevista |

Git, testes e comunicação reaparecem ao longo da jornada; não são assuntos que o aluno só encontra numa estação isolada.

**Segunda evidência independente:** depois do projeto guiado, construir sem receita um sistema de agendamento ou estoque com requisitos novos. Esse trabalho diferencia reprodução de autonomia.

**Terceira evidência:** manutenção de código recebido pronto, com bug e requisito ambíguo. O aluno pergunta, reproduz, testa, corrige e abre PR. Isso representa melhor parte do cotidiano do que sempre iniciar repositórios vazios.

## 6. A experiência dentro do site

Fluxo proposto:

**Boas-vindas → profissão e mercado → diagnóstico leve → mapa pessoal → missão atual → prática → evidência → revisão → próximo passo.**

### Abertura

Uma página de entrada em `/estudante/trilhas/csharp`, vinculada à jornada existente. Não começar com uma parede de 80 aulas.

1. Seu vídeo de 60–90 segundos acolhendo e mostrando um resultado que o aluno vai construir.
2. "O que um dev C# faz?" com uma tarefa real explicada sem jargão.
3. Painel de mercado e salários com fontes/data. Informações financeiras permanecem editáveis fora do vídeo.
4. "Você não precisa conhecer todos esses nomes hoje": núcleo e aprofundamentos distinguíveis.
5. Perguntas opcionais: já escreveu código? usa só celular ou também computador? prefere sessões curtas ou longas?
6. Roadmap com **próxima ação clara**, disponibilidade verdadeira dos módulos e link de acesso aos conteúdos já publicados.

Não exigir telefone, renda ou história pessoal para começar. Permitir rever escolhas e explorar o mapa sem bloquear artificialmente o aluno.

### Cada missão

1. Contexto: "Um cliente cadastrou o mesmo serviço duas vezes. O que deveria acontecer?"
2. Conceito curto em texto/diagrama e vídeo opcional.
3. Previsão: o aluno pensa no resultado antes de rodar.
4. Prática guiada: instrução próxima ao editor, uma etapa por vez, explicação do porquê.
5. Variação: mudam os dados ou uma regra; a resposta não está transcrita no vídeo.
6. Correção de erro: receber uma implementação defeituosa e identificar a causa.
7. Validação: execução e testes apropriados, com feedback acionável.
8. Explicação: "O que você mudou e por quê?" e preparação da próxima missão.

Tom de voz: próximo, adulto e respeitoso. "Essa condição ainda aceita um valor inválido. Vamos testar o caso zero?" funciona melhor que uma mensagem genérica de erro ou uma celebração vazia.

### Progresso honesto

Separar quatro estados: **vi / pratiquei / passei no desafio / tive a entrega revisada**. Assistir ao vídeo ou marcar uma caixa não comprova domínio de uma skill. Não exibir "90% pronto para o mercado" a partir de cliques.

Rubrica sugerida por competência: ainda precisa de guia; resolve com ajuda; resolve sozinho; explica/testa/adapta. O projeto final precisa demonstrar as competências essenciais, inclusive manutenção e comunicação, antes de uma recomendação de candidatura — e isso não é garantia de contratação.

## 7. Seus vídeos: aprender construindo, ensinar com responsabilidade

Sua presença pode ser um diferencial real. Gravar enquanto aprende funciona como diário de construção; a aula publicada precisa passar por teste e revisão técnica. Dúvidas assumidas e corrigidas são boas, conclusões técnicas não verificadas não devem virar a referência do aluno.

Formato inicial proposto por gravação:

- Uma tarefa e um objetivo observável, em vez de uma hora de assuntos misturados.
- Resultado mostrado no início; depois raciocínio e implementação.
- Fonte grande, tela limpa, áudio claro e legenda/transcrição.
- Pelo menos um erro real explicado e um caso de teste.
- Uma pausa explícita: "Agora faça esta variação sem copiar."
- Repositório/commit da aula, versão do SDK e data de revisão registrados.
- Versão em texto equivalente, reprodução manual sem autoplay e opção de qualidade baixa para economizar dados.

### Roteiro de abertura, versão para você adaptar

"Se você trabalha o dia todo e está tentando abrir uma nova possibilidade, esta trilha foi pensada para você conseguir dar um passo de cada vez. Aqui você vai entender como funciona um trabalho com C# e construir um sistema comigo. Vai escrever, errar, testar e aprender a explicar suas decisões. Dá para começar pelo celular; quando o projeto precisar de um ambiente completo, vamos preparar essa transição juntos. Não vou te prometer vaga ou salário. Vou te mostrar o caminho, o que as vagas estão pedindo e as entregas que você precisa conseguir fazer. Sua primeira missão é pequena: fazer um programa funcionar e entender por quê."

Primeiros vídeos a produzir: apresentação da jornada; primeira linha e console; variáveis e tipos; decisões com exemplos; repetição; depuração de um erro; primeiro projeto console; primeiro commit e PR. Roteiros e exercícios devem ser revisados antes da gravação final para evitar refazer vídeos longos.

## 8. Celular, computador e o limite técnico atual

### O que existe no repositório hoje

- `src/lib/cursos.ts`: fallback C# com 14 aulas em cinco módulos. Há títulos cobrindo sintaxe, objetos, LINQ, API, EF Core e projeto, mas essa inspeção **não valida a qualidade/atualidade dos vídeos incorporados**. Em produção, o catálogo pode vir do Supabase; editar apenas o fallback não garante alterar o curso ao vivo.
- `src/lib/roadmaps.ts` e `CareerJourney.tsx`: roadmap C# já existe, com checklist e associação a cursos. Aproveitar IDs e histórico, não apagar o progresso.
- `src/lib/desafios.ts`: quatro exercícios introdutórios C# no laboratório.
- `src/lib/browserCodeRunner.ts`: C# é traduzido para um subconjunto de JavaScript. Não é compilador C#/Roslyn, não roda ASP.NET Core/EF Core/xUnit e não deve ser vendido como .NET real. Diferenças semânticas precisam ser explicitadas; exemplos financeiros com `decimal`, por exemplo, exigem validação no runtime real.
- A rodada de melhorias do laboratório guiado ainda está no diretório local e deve ser finalizada/verificada separadamente antes de publicação.

### Dois ambientes, uma jornada

**No celular:** introdução, leitura, vídeos opcionais, primeiros exercícios guiados, revisão, previsão de saída e leitura de bugs. Manter rascunho, retomada, acessibilidade, feedback e consumo de dados em mente. Não prometer que o executor atual suportará a formação inteira.

**No ambiente .NET real:** projetos, múltiplos arquivos, pacotes, API, banco, testes e deploy. Oferecer caminho local gratuito com SDK e editor e avaliar uma alternativa de desenvolvimento em nuvem para quem não dispõe de computador próprio.

GitHub Codespaces é uma opção a testar, não uma decisão contratada. A [documentação de cobrança](https://docs.github.com/en/billing/concepts/product-billing/github-codespaces) informa franquias para contas pessoais e cobrança/limites por computação e armazenamento. Não anunciar uso ilimitado gratuito; evitar habilitar custos automaticamente. Avaliar a usabilidade no Safari físico, além de WebKit simulado, antes de recomendar a experiência completa no telefone.

Se a Orbitamos hospedar execução .NET própria, será um projeto de infraestrutura separado: isolamento forte, usuário sem privilégios, filesystem efêmero, rede controlada, limites de CPU/RAM/tempo/saída, fila, proteção contra abuso e orçamento. **Não executar código arbitrário de aluno diretamente no processo do site/Vercel nem com segredos do projeto disponíveis.**

## 9. Implementação proposta no projeto

### Primeira entrega: porta de entrada e piloto completo

- Nova página de jornada C#, integrada à área do estudante, sem substituir o curso atual silenciosamente.
- Dados de mercado estruturados com `sourceUrl`, `checkedAt`, `role`, `seniority`, `location`, `employmentType` quando verificado, e notas de confiabilidade.
- Conteúdo salarial editorial separado do player e das imagens.
- Roadmap com estados reais: disponível, em produção e planejado. Nada de botões de aula concluída sem conteúdo correspondente.
- Introdução textual acessível pronta; vídeo só entra quando houver arquivo/link final autorizado. Não inventar um vídeo do instrutor.
- Um módulo piloto de fundamentos com vídeo/texto, prática guiada, variação, erro para corrigir e avaliação final.
- CTA para os quatro exercícios existentes somente com a limitação didática indicada.
- Caminho para configurar ambiente real antes dos módulos que dependem dele.

### Modelo de conteúdo a evoluir

`Track → Stage → Mission → Activity → Evidence → Review`.

Missão: objetivo, pré-requisitos, conceitos, material textual, mídia opcional, starter, guia, exercício de transferência, testes, reflexão, ambiente necessário, versão e disponibilidade.

Evidência: aluno, missão e versão, tentativa, referência do código/commit, resultado dos testes e revisão. Dados pessoais protegidos por permissões/RLS; resultados oficiais não devem depender exclusivamente de um checkbox ou valor editável no navegador. Rascunho local pode continuar existindo para UX.

Preservar IDs de aulas e progresso existentes. Fazer migração explícita e reversível; distinguir conteúdo editorial local de conteúdo administrado no Supabase. Não duplicar duas trilhas com progresso incompatível.

### Etapas seguintes

1. Piloto de fundamentos com um pequeno grupo, antes de gravar dezenas de aulas.
2. Ambiente .NET real, repositório-base e projeto console/SQL.
3. API, persistência, testes e segurança; revisão técnica de cada módulo.
4. Deploy, manutenção, portfólio e simulação de trabalho em equipe.
5. Ramificação Angular/legado e aprofundamentos conforme feedback e novas vagas.

Cada entrega deve ser funcional e avaliável; não publicar um mapa bonito como se toda a formação já existisse.

## 10. Negócio e validação

Modelo comercial **a decidir com o fundador**. Hipótese para discussão: entrada/fundamentos gratuitos e acompanhamento com revisão de projetos pago. O valor pago seria orientação, feedback e experiência organizada, não uma promessa de emprego nem acesso a informações públicas disfarçadas de exclusivas. Não criar preços, checkout ou cobranças antes dessa decisão.

Piloto sugerido: 5–10 pessoas com diferentes níveis e aparelhos. Observar se conseguem começar sem instrução verbal, escrever a primeira linha, interpretar o erro e retornar ao estudo. Acompanhar com consentimento: primeira execução, etapa em que travam, tentativas, retorno e resultado da variação independente. Metas numéricas só depois de medir a linha de base.

Atribuir revisão técnica ao conteúdo avançado. A disponibilidade do fundador para gravar e revisar deve limitar o tamanho da primeira oferta; deixar explícito o que já está disponível e o que ainda será produzido.

## 11. Referências técnicas para produção das aulas

- [Política de suporte .NET — Microsoft](https://dotnet.microsoft.com/en-us/platform/support/policy).
- [Primeira Minimal API ASP.NET Core 10 — Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api?view=aspnetcore-10.0).
- [Testes C# com xUnit e dotnet test — Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-csharp-with-xunit).
- [Cobrança e limites do Codespaces — GitHub](https://docs.github.com/en/billing/concepts/product-billing/github-codespaces).

As fontes de vagas orientam prioridades, não substituem revisão pedagógica. As durações dos vídeos, tamanho do piloto e formato de jornada são propostas de produto, não resultados comprovados por essa pesquisa.

## 12. Piloto implementado — 26/09/2026

Entrada autenticada: `/estudante/trilhas/csharp`. Prévia sem conta, exclusiva de desenvolvimento: `/dev/csharp-preview` (404 em produção). A área inicial do estudante e o seletor de carreira apontam para a nova jornada. O curso anterior e seu histórico não foram substituídos.

Disponível nesta versão:

- Acolhimento, preferências de aparelho/ritmo, panorama de mercado com fontes datadas e ressalvas salariais.
- Oito estações de roadmap, com somente o primeiro piloto marcado como disponível.
- Projeto didático OrbiServiços: previsão de saída, escrita guiada com editor inicialmente vazio, variação independente, depuração de nome de variável e reflexão.
- Validação por execução, checagem de variáveis e saída. A variação rejeita imprimir apenas um número fixo. Editar uma prática independente invalida sua validação anterior.
- Rascunhos e preferências locais, separados por usuário e versão. Não há sincronização entre aparelhos, certificado, cobrança, coleta de eventos nem avaliação humana da reflexão.
- Reuso do executor didático existente. Não é Roslyn/.NET completo; APIs, EF Core e testes reais continuam dependendo de uma futura infraestrutura .NET.

Arquivos centrais: `apps/web/src/lib/csharpTrack.ts`, `apps/web/src/components/estudante/CSharpTrack.tsx`, `CSharpTrack.module.css`. A prática usa `GuidedPractice` em modo incorporado. Auditoria reproduzível: `node scripts/audit-csharp-track.mjs` dentro de `apps/web` com o servidor de desenvolvimento na porta 3015.

Verificações: 198 testes unitários aprovados, TypeScript e lint dos arquivos alterados aprovados, build de produção concluído. Auditoria de ponta a ponta em Chromium desktop, WebKit/iPhone 13 e Chromium 320 px: navegação, persistência, execução guiada, variação, correção, conclusão e acessibilidade automatizada sem violações no componente. A prévia retorna 404 na compilação de produção. Há um aviso preexistente de rastreamento de arquivos em `api/course-materials`; não foi alterado neste escopo.

Para testar manualmente: entrar na prévia, conhecer a profissão, explorar o mapa, abrir a primeira missão, escrever as quatro linhas seguindo as etapas, executar, resolver a variação, observar/corrigir o erro e registrar a reflexão. Recarregar para conferir a retomada. No iPhone físico, observar especialmente teclado, inserção de símbolos, foco/rolagem e conforto ao alternar instrução e editor. A emulação WebKit não certifica o comportamento do teclado físico do Safari.

Próximas entregas ainda não implementadas: aulas das estações 2–8, vídeos autorais, ambiente .NET completo, sincronização de progresso, revisão de projetos e modelo comercial. Não anunciar a formação completa como já disponível.

## 13. Revisão após teste do fundador — código como atividade principal

Feedback: a primeira versão não deixava evidente quando o aluno programaria, oferecia pouca repetição prática e separava demais a atividade atual do mapa da formação.

Implementação desta rodada:

- O botão inicial passa a ser “Começar a codar · variáveis” e abre diretamente a bancada guiada. Não é obrigatório passar pelo conteúdo sobre profissão antes de escrever.
- O módulo Fundamentos → Variáveis contém 10 atividades: 7 práticas de código e 3 questões intercaladas. Os assuntos são string/int, variável versus texto literal, reatribuição, cálculo usando variáveis, leitura de erros e uma entrega integradora.
- Cada atividade declara assunto, objetivo, posição na sequência e próximo assunto. O contexto “Você está aprendendo: Variáveis” acompanha a rolagem.
- Desktop: lista lateral das dez atividades com posição e conclusão. Mobile: lista recolhível. O mapa completo da formação fica a um botão de distância e preserva a atividade ao retornar.
- Explorar ou ler não marca conclusão. Código requer execução e checagem da saída/estrutura; questões requerem alternativa correta e dão feedback para todas as alternativas. Editar código remove sua validação, inclusive na bancada guiada.
- Progresso do módulo separado da formação completa. Os módulos futuros continuam identificados como planejados. Não exibir porcentagens que deem a entender que a carreira está “dominada”.
- Novo estado local `orbitamos-csharp-variables-v1-{userId}`. Rascunhos e validações compatíveis do piloto anterior são migrados; o registro antigo não é apagado. Continuam sem sincronização entre aparelhos.

Arquivos do módulo: `csharpVariables.ts`, `csharpVariables.test.ts`, `CSharpVariables.tsx` e `CSharpVariables.module.css`. `scripts/audit-csharp-track.mjs` agora percorre as dez atividades, incluindo cada linha da prática guiada, alternativas incorretas, soluções executáveis, recuperação após reinício, ida/volta ao mapa, persistência e invalidação ao editar. Relatório atual: `test-results/csharp-track/report-v2.json` (artefato local de teste).

Limite pedagógico/técnico mantido: checagens didáticas e executor simplificado não são um compilador C# completo, uma avaliação de empregabilidade nem uma proteção antifraude. As práticas precisam de observação com alunos reais, principalmente no teclado físico do iPhone.

Validação da revisão: 213 testes unitários aprovados; TypeScript e lint aprovados. Auditoria das dez atividades aprovada em Chromium desktop, WebKit/iPhone 13 e Chromium 320 px, incluindo restauração de rascunhos, retorno do mapa e zero violações de acessibilidade automatizada no componente. O teclado físico do Safari continua dependendo de teste manual.

## 14. Publicação de variáveis e continuidade com condições

A rodada anterior foi commitada e enviada à `main` em `c46ce57` (26/09/2026), sem incluir `CLAUDE.md`. O status de commit do GitHub confirmou `Vercel: success / Deployment has completed`.

Continuidade local, posterior a esse push:

- Módulo Condições: 7 práticas de código e 3 questões. Começa por if, evolui para else, comparação no limite, bool, && e ||, corrige um bug lógico e termina com um programa que combina variáveis, cálculo e if/else if/else.
- Seletor Variáveis/Condições, avanço entre módulos e mapa com as duas ofertas disponíveis. Laços, métodos e estações posteriores continuam em preparação.
- Estado separado em `orbitamos-csharp-conditions-v1-{userId}`. Alternar os módulos não mistura respostas, código ou conclusão. A seleção do módulo também é guardada localmente.
- Feedback específico para int/bool entre aspas, = no lugar de ==, ponto e vírgula ausente, chave sem par e diferenças de maiúscula/minúscula nos nomes. São diagnósticos didáticos do subconjunto aceito, não uma implementação completa do compilador C#.
- Práticas independentes de condições executam casos adicionais em workers novos, alterando entradas declaradas: zero, limites, pagamento e disponibilidade. A saída inicial correta não basta para concluir. O aluno vê qual caso falhou e compara saída esperada/obtida.
- Na entrega final, o programa deve decidir entre tudo entregue, trabalho permitido e pagamento pendente. Casos combinados verificam a prioridade das regras.

Arquivos: `csharpConditions.ts`, `csharpFeedback.ts`, `csharpConditions.test.ts`; a interface de práticas foi reutilizada sem copiar outra página inteira. Auditoria: `node scripts/audit-csharp-conditions.mjs`. `audit-csharp-track.mjs` continua cobrindo regressões de variáveis.

Os 226 testes unitários passaram nesta rodada. Não tratar estas alterações posteriores como publicadas só porque o commit anterior já foi enviado. Para o próximo agente: conferir `git status` e os relatórios em `test-results/csharp-conditions/` antes de informar publicação ou resultados da auditoria final.

Fechamento da rodada: auditoria de condições aprovada em desktop, WebKit/iPhone 13 e Chromium 320 px, com zero violações automatizadas de acessibilidade; regressão completa de variáveis aprovada em desktop. Build de produção e lint aprovados (permanece o aviso preexistente de rastreamento em `api/course-materials`). Condições e feedback continuam locais, posteriores a `c46ce57`, aguardando avaliação antes de um novo push.
