# Pesquisa de rotinas profissionais em tecnologia

Consulta inicial: **12/11/2026**. Vinculada ao
[Simulador de profissões](SIMULADOR_PROFISSOES.md). Este arquivo separa fontes,
exemplos organizacionais e propostas autorais de missões. Não representa um
censo de vagas brasileiras, uma tabela salarial ou um catálogo completo de
profissões já implementado.

## Como interpretar o mapa

Uma vaga pode reunir vários papéis. O contexto determina escopo, ferramentas,
responsabilidades e quem pode autorizar uma mudança. Os perfis ilustrativos da
[SFIA](https://sfia-online.org/en/tools-and-resources/standard-industry-skills-profiles/sfia-9-skills-for-role-families-job-titles)
servem como ponto de partida adaptável. O
[NICE](https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/nice-framework-current-versions)
oferece uma estrutura de tarefas, conhecimentos e habilidades para segurança;
não deve ser usado como taxonomia de todo o setor de tecnologia.

Usaremos eixos independentes: **família de trabalho, papel, contexto da empresa,
autonomia, competências e episódio**. Linguagens e ferramentas são etiquetas
adicionais, com versão quando necessário. Isso permite compartilhar uma missão
entre percursos sem duplicar o conteúdo.

## Categorias e subcategorias iniciais

As situações abaixo são propostas educativas. A profundidade da pesquisa varia;
uma linha no mapa não autoriza publicar um curso como concluído.

| Família proposta | Subcategorias/papéis possíveis | Situação educativa proposta | Pesquisa nesta rodada |
| --- | --- | --- | --- |
| Operação e entrega | DevOps, SRE, engenharia de plataforma, CloudOps | Publicar mudança, observar o serviço, recuperar falha, automatizar rotina | Base aprofundada para o piloto: R03–R10 e R20 |
| Desenvolvimento de software | Backend, frontend, full stack | Receber requisito, editar código, testar, revisar e integrar | Bases iniciais de backend/frontend: R11–R12 e R15 |
| Qualidade | Testes exploratórios, automação, performance, acessibilidade | Reproduzir falha, construir teste útil e verificar correção | Base inicial de testes: R01 e R15; demais especialidades a pesquisar |
| Dados | Engenharia de dados, analytics/BI, ciência de dados, bancos | Corrigir carga com dados duplicados e verificar qualidade | Engenharia de dados: R13; demais ramos a pesquisar |
| Segurança | AppSec, operações de segurança, IAM, segurança cloud | Investigar acesso indevido fictício, ajustar permissão e reunir evidências | Estrutura NICE: R02; episódios ainda exigem pesquisa específica |
| Infraestrutura e suporte | Service desk, administração de sistemas, redes | Diagnosticar conexão, identificar alcance do problema e escalar | Estrutura inicial: R01; rotina específica ainda a pesquisar |
| IA e aprendizado de máquina | Engenharia de ML, avaliação, MLOps | Investigar dado inadequado, medir resultado e acompanhar versão | Rascunho de expansão; pesquisa própria pendente |
| Experiência e design | UX, UI, pesquisa, acessibilidade | Investigar dificuldade do usuário e validar melhoria de fluxo | Exemplo organizacional inicial: R14 |
| Produto e entrega | Produto, análise de negócio, gestão de entrega | Esclarecer requisito, priorizar com evidência e verificar resultado | Estrutura inicial: R01; rotinas a pesquisar |
| Outras especialidades | Mobile, jogos, embarcados/IoT, arquitetura e liderança | Definir episódios próprios conforme demanda e revisão | Mapa futuro, sem alegação de cobertura nesta rodada |

As categorias são da Orbitamos. Referenciar frameworks não implica reproduzir
suas definições ou incorporar todo o material licenciado ao jogo.

## O que muda conforme a empresa

| Contexto fictício | Diferenças que precisam aparecer no episódio |
| --- | --- |
| Comércio pequeno | Poucos serviços, orçamento restrito, sistemas gerenciados e responsabilidades compartilhadas |
| SaaS em crescimento | Várias equipes, versões, dependências, observabilidade e definição de responsabilidades |
| Empresa com controle formal de mudanças | Autorizações, revisão e evidências previstas na política fictícia do cenário |
| Plataforma interna | Outros desenvolvedores são usuários; facilitar uso, manutenção e autonomia é parte do resultado |

Regras de uma regulamentação real exigem pesquisa específica antes de ensinar
que uma ação é obrigatória. Nenhuma política fictícia deste projeto é uma
declaração de conformidade real.

## Operação e entrega: fundamento do piloto

DevOps descreve uma abordagem de colaboração e entrega; títulos de vagas nem
sempre seguem a mesma definição. SRE enfatiza confiabilidade; plataforma atende
desenvolvedores com capacidades internas; CloudOps inclui operação de workloads.
As fronteiras se sobrepõem. R03, R09, R10 e R20 sustentam essa distinção.

A rotina pode envolver mudança pequena, revisão, CI, configuração, deploy,
observação, investigação, automação e documentação. Plantão varia por equipe e
serviço. As missões devem incluir trabalho planejado e colaboração, além de
incidentes. A referência da Google para plantão contempla diagnóstico, mitigação
e escalonamento; não prescrever uma rotina de emergência para todos os cargos.

<a id="missoes-propostas-para-operacao-e-entrega"></a>

### Missões propostas para operação e entrega

Game design autoral fundamentado nas fontes indicadas, com dados fictícios.
M01–M06 compõem o primeiro turno; M07–M10 são expansão, não escopo já entregue.

| ID | Pedido e ação do aluno | Artefato/evidência | Critério de avaliação | Base |
| --- | --- | --- | --- | --- |
| M01 | Conhecer equipe, serviço, usuários e ambientes | Mapa curto de serviço e responsabilidades | Distinguir ambientes e identificar quem pode ajudar/autorizar | R03, R10 |
| M02 | Investigar pedido de teste que falha em homologação apesar de a home abrir | Ticket com sintoma reproduzido, ambiente e log relevante | Localizar a falha no ambiente afetado sem concluir que o fluxo inteiro funciona só pela home | R04, R05 |
| M03 | Corrigir configuração no ambiente seguro e pedir revisão | Arquivo, diff pequeno e justificativa | Alterar o necessário, preservar os demais campos e responder à revisão | R07, R11 |
| M04 | Ler e corrigir uma falha de CI | Saída do teste e alteração correspondente | Resolver a causa; remover o teste não satisfaz o objetivo | R08 |
| M05 | Implantar em homologação o artefato testado | Versão, configuração do ambiente e teste de funcionamento | Usar o pacote correto e verificar o fluxo esperado | R07 |
| M06 | Entregar a correção em homologação e resolver pequena variação | Ticket de correção concluído após QA; mudança de produção pendente de autorização | Relacionar mudança e resultado no ambiente certo e aplicar a ideia com menos ajuda | R07, R16–R17 |
| M07 | Construir observação útil e tratar uma release ruim | Painel simples, alerta, comunicação e decisão de recuperação | Detectar impacto, mitigar e verificar os sinais depois da ação | R04, R05 |
| M08 | Rever um incidente com o time | Linha do tempo e ação preventiva verificável | Explicar causas contribuintes e testar a prevenção, sem culpar um personagem | R06 |
| M09 | Preparar mais capacidade com limites do cenário | Plano/diff e previsão fictícia de recursos | Atender à necessidade preservando dados e permissões; repetir não duplica recursos | R10, R20 |
| M10 | Oferecer um caminho padrão para outro time | Template, interface de solicitação e instrução curta | Outro personagem consegue usar o caminho com outro serviço válido | R09 |

Rollback é uma possível estratégia em alguns cenários, não uma cura universal.
Uma mudança de dados incompatível, por exemplo, exige outro desenho do episódio.
O avaliador precisa conhecer as regras e o estado inicial do caso.

No primeiro turno, o problema é descoberto durante teste de uma nova versão em
homologação; produção não está afetada. Encerrar a correção desse ambiente não
declara publicação em produção nem resolução de um incidente de clientes reais.
O protótipo `checkout-staging` está detalhado no plano principal.

Métricas de entrega e confiabilidade não devem virar um placar de velocidade
individual ou uma promessa de contratação. Uma boa decisão pode envolver
investigar, pedir ajuda ou evitar uma alteração irreversível.

## Backend como segunda expansão

R11 descreve o trabalho de backend numa empresa específica: colaboração,
qualidade, segurança, manutenção, desempenho e revisão. A linguagem utilizada
pela GitLab não é uma exigência universal. Para o ramo C#, usar documentação
da tecnologia escolhida e artefatos próprios de ASP.NET Core.

Uma sequência candidata: esclarecer regra de pedido → implementar endpoint e
validação → persistir dados → tratar falha/duplicidade → escrever teste → pedir
revisão e verificar integração. R15 oferece referência técnica para testes com
infraestrutura de teste .NET. Não atribuir uma execução real de ASP.NET ao
executor C# simplificado que hoje existe na Orbitamos.

Frontend pode compartilhar o mesmo negócio com tarefa diferente: construir o
formulário, conectar os estados da interface, tratar erros e testar o fluxo.
Dados pode receber a inconsistência posterior na carga dos pedidos. Assim, o
aluno enxerga a colaboração entre papéis e o mesmo problema por outras lentes.
Esses episódios ainda são propostas.

## Fontes e uso nesta pesquisa

Todos os links abaixo foram consultados na rodada de **12/11/2026**. Data de
consulta não significa data de publicação nem garante que uma vaga esteja
aberta. Descrições de cargos são exemplos organizacionais, não estatística do
mercado. Textos antigos de referência mantêm sua natureza histórica.

| ID | Fonte primária | Uso e limite |
| --- | --- | --- |
| R01 | [SFIA — perfis ilustrativos](https://sfia-online.org/en/tools-and-resources/standard-industry-skills-profiles/sfia-9-skills-for-role-families-job-titles) | Estruturar competências/papéis adaptáveis; não prescreve o organograma da Orbitamos |
| R02 | [NIST — NICE Framework](https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/nice-framework-current-versions) | Tarefas, conhecimentos e habilidades em segurança; escopo específico dessa área |
| R03 | [Google — SRE e DevOps](https://sre.google/workbook/how-sre-relates/) | Relação entre abordagens; não define todos os cargos com esses títulos |
| R04 | [Google — monitoramento](https://sre.google/sre-book/monitoring-distributed-systems/) | Sinais de latência, tráfego, erros e saturação para investigar impacto |
| R05 | [Google — plantão](https://sre.google/workbook/on-call/) | Diagnóstico, mitigação e escalonamento conforme o serviço/equipe |
| R06 | [Google — postmortem](https://sre.google/sre-book/postmortem-culture/) | Aprendizado de incidentes e ações no sistema, sem culpabilização |
| R07 | [DORA — automação de deploy](https://dora.dev/capabilities/deployment-automation/) | Artefatos, configuração, versionamento e verificação da implantação |
| R08 | [DORA — integração contínua](https://dora.dev/capabilities/continuous-integration/) | Mudanças frequentes, build/teste e feedback; não é uma nota individual |
| R09 | [CNCF — maturidade de plataforma](https://tag-app-delivery.cncf.io/whitepapers/platform-eng-maturity-model/) | Produto interno e evolução de capacidades conforme contexto |
| R10 | [GitLab — SRE](https://handbook.gitlab.com/job-description-library/engineering/infrastructure/site-reliability-engineer/) | Exemplo de especializações e responsabilidades numa empresa |
| R11 | [GitLab — backend](https://handbook.gitlab.com/job-description-library/engineering/backend-engineer/) | Desenvolvimento, revisão e colaboração no contexto dessa organização |
| R12 | [GitLab — frontend](https://handbook.gitlab.com/job-description-library/engineering/development/frontend/) | Interface, código, testes e trabalho com outras funções |
| R13 | [GitLab — engenharia de dados](https://handbook.gitlab.com/job-description-library/marketing/enterprise-data/data-engineer/) | Pipelines, qualidade e documentação de dados; exemplo organizacional |
| R14 | [GitLab — product design](https://handbook.gitlab.com/job-description-library/product/product-designer/) | Pesquisa e validação de necessidades do usuário |
| R15 | [Microsoft — testes de integração ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0) | Referência técnica versionada para futura prática .NET, não prova de demanda de vagas |
| R16 | [IES/WWC — organização da aprendizagem](https://ies.ed.gov/ncee/wwc/PracticeGuide/1) | Exemplos, explicações, representações e recuperação; guia educacional de 2007 |
| R17 | [AERO — espaçamento e recuperação](https://www.edresearch.edu.au/guides-resources/practice-guides/spacing-and-retrieval-practice-guide-full-publication) | Revisitar conteúdo e recuperar conhecimento; adaptação exige avaliar nosso público |
| R18 | [Vercel — Hobby](https://vercel.com/docs/plans/hobby) | Restrição do plano a uso pessoal não comercial; não é auditoria da conta |
| R19 | [Supabase — planos e cotas](https://supabase.com/docs/guides/platform/billing-on-supabase) | Recursos têm cotas; não comprova consumo atual da Orbitamos |
| R20 | [AWS — CloudOps Associate](https://aws.amazon.com/certification/certified-cloudops-engineer-associate/) | Referência de competências cloud; certificação não é amostra de vagas |

## Método para aprofundar e manter o catálogo

1. Escolher papel, nível de autonomia e contexto antes de coletar ferramentas.
2. Cruzar documentação profissional, descrição de trabalho de organizações e
   exemplos públicos de issues, revisões ou runbooks. Verificar avisos de
   depreciação e não publicar dados sensíveis encontrados por acaso.
3. Para alinhar ao mercado brasileiro, realizar uma pesquisa própria de vagas
   datada, registrando fonte, região, senioridade e contexto. Distinguir lista
   de requisitos de evidência sobre tarefas efetivamente desempenhadas.
4. Extrair tarefa → decisão → artefato → sinal de sucesso → falhas plausíveis.
   Referenciar cada missão e indicar o que foi simplificado.
5. Propor revisão por alguém que exerça a função. Isso é uma etapa futura; não
   foram enviadas mensagens ou conduzidas entrevistas nesta rodada.
6. Testar compreensão e uma variação independente com iniciantes. Fontes
   profissionais corretas não comprovam que nosso jogo ensina bem.
7. Reavaliar fontes antes de publicar um ramo e sempre que mudar tecnologia,
   regra de missão ou contexto. Preservar o histórico da pesquisa anterior.

Registro mínimo por missão: fonte/URL, data de consulta, contexto, hipótese de
aprendizagem, simplificações, revisão técnica, versão, evidência produzida,
resultado de teste com usuário e estado de implementação/publicação.
