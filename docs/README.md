# Documentação da Orbitamos

Índice revisado em **07/11/2026**.
Plano de evolução e registro da Oficina do Pulso acrescentados em **11/11/2026**.
Bloco B e roteiro de orientação/previsão/retomada documentados em **12/11/2026**;
validações locais e limites registrados no guia de evolução. A conferência
remota de SHA, CI e deploy permanece separada dos resultados locais.
O protótipo do Simulador de profissões foi implementado em **12/11/2026**, com
dois casos conferidos em desktop, WebKit/iPhone e tela de 320 px. QA local e
verificação remota de publicação têm registros separados no documento principal.
O projeto de inglês falado continua separado e não foi implementado nesta entrega.

Em **13/11/2026**, a fase seguinte do simulador foi implementada: verificações,
publicação do pacote em homologação e conferência do pedido. O fechamento de QA
e publicação da rodada fica em [SIMULADOR_PROFISSOES.md](SIMULADOR_PROFISSOES.md).

Os guias abaixo separam o estado implementado, as decisões de produto,
a operação e os registros históricos. Datas antigas em auditorias são mantidas
quando descrevem uma execução específica.

## Primeira leitura

1. [README da raiz](../README.md): produto, instalação e estrutura.
2. [Aplicativo web](../apps/web/README.md): comandos e prévias.
3. [Organização do repositório](ORGANIZACAO_REPOSITORIO.md): localização e regras
   para código, mídia, resultados e referências locais.
4. [Contribuição](../CONTRIBUTING.md) e [orientações dos agentes](../AGENTS.md).

## Arquitetura e operação

| Documento | Finalidade |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitetura executada, domínios e persistência |
| [ESCALABILIDADE_SEM_CUSTO.md](ESCALABILIDADE_SEM_CUSTO.md) | Catálogo resumido, chat por cursor, proteção de sessão e XP transacional; aplicação da 019 informada pelo usuário, sem nova validação funcional remota |
| [INFRA_ATUAL.md](INFRA_ATUAL.md) | Provedores, publicação, custos e evidências datadas |
| [VARIAVEIS_AMBIENTE.md](VARIAVEIS_AMBIENTE.md) | Nomes das variáveis lidas pelo código e exposição |
| [SUPABASE_NATIVE_MIGRATION.md](SUPABASE_NATIVE_MIGRATION.md) | Nomes reais, ordem das migrations e Storage |
| [SUPABASE_LOCAL.md](SUPABASE_LOCAL.md) | Banco descartável e testes locais de RLS |
| [TESTES_AUTOMATIZADOS.md](TESTES_AUTOMATIZADOS.md) | Comandos, CI, browser audits e limites dos resultados |
| [DOMINIO_NAMECHEAP_VERCEL.md](DOMINIO_NAMECHEAP_VERCEL.md) | Guia de DNS e registro histórico da verificação |

## Academy, Studio e aprendizagem

| Documento | Finalidade |
| --- | --- |
| [ARQUITETURA_ESTUDANTE.md](ARQUITETURA_ESTUDANTE.md) | Rotas e dados da área do estudante |
| [ARQUITETURA_COLABORADOR.md](ARQUITETURA_COLABORADOR.md) | Trabalho, apresentação, oportunidades e admin |
| [ACADEMY_FLUXO_UNIFICADO.md](ACADEMY_FLUXO_UNIFICADO.md) | Navegação, entradas e continuidade |
| [MAPA_EXPERIENCIA_ACADEMY.md](MAPA_EXPERIENCIA_ACADEMY.md) | Percurso atual e auditorias históricas de gargalos |
| [REVISAO_PEDAGOGICA_ACADEMY.md](REVISAO_PEDAGOGICA_ACADEMY.md) | Métodos de prática, implementação e próximos passos |
| [PRODUTO_TRILHA_CSHARP.md](PRODUTO_TRILHA_CSHARP.md) | Piloto entregue, pesquisa datada e roadmap profissional |
| [SQL_COM_ORBI.md](SQL_COM_ORBI.md) | Aventura SQL, oficina e retomada |
| [VILA_DOS_BLOCOS.md](VILA_DOS_BLOCOS.md) | Jogo de símbolos e indentação, saves e continuidade |
| [STUDIO_E_ORBI_CAPITULO_01.md](STUDIO_E_ORBI_CAPITULO_01.md) | Rodada do Studio e capítulo de plataforma aprovado |
| [EVOLUCAO_ENTREGA_ORBI.md](EVOLUCAO_ENTREGA_ORBI.md) | Oficina do Pulso, Bloco B implementado em 12/11, compatibilidade, experimentos encerrados e ponto de continuidade/QA |
| [SIMULADOR_PROFISSOES.md](SIMULADOR_PROFISSOES.md) | Protótipo DevOps: dois casos de conexão e fase de esteira/publicação, saves separados, retomada, QA e plano de expansão |
| [PESQUISA_ROTINAS_TECH.md](PESQUISA_ROTINAS_TECH.md) | Pesquisa inicial de 12/11: famílias, contextos, tarefas e fontes profissionais; não é catálogo já entregue |
| [INGLES_FALADO.md](INGLES_FALADO.md) | Viabilidade pesquisada em 12/11: ouvir/repetir, transcrição, limites da avaliação fonética e protótipo sem API contratada |

## Direção visual e páginas comerciais

| Documento | Finalidade |
| --- | --- |
| [PADRAO_VISUAL_ACADEMY.md](PADRAO_VISUAL_ACADEMY.md) | Critérios para entradas visuais e referência aprovada |
| [DIRECAO_IMERSIVA.md](DIRECAO_IMERSIVA.md) | Critérios de imersão da página inteira |
| [METODO_ORBITA_IMERSIVA.md](METODO_ORBITA_IMERSIVA.md) | Processo, decisões e iterações de imersão |
| [INICIO_PROCESSO_ENGENHARIA.md](INICIO_PROCESSO_ENGENHARIA.md) | Seções de engenharia/processo da home e verificações |
| [PAGINAS_COMERCIAIS.md](PAGINAS_COMERCIAIS.md) | Páginas de serviços, estratégia e registros de entrega |
| [PORTFOLIO_COMERCIAL.md](PORTFOLIO_COMERCIAL.md) | Curadoria comercial de 07/11, três cases da home, catálogo editorial com busca e histórico das capturas e da faixa |
| [CENARIOS_CATEGORIAS.md](CENARIOS_CATEGORIAS.md) | Seis cenários do portfólio, direção de arte, prompts, mídia, contexto comercial e validação |

## Planejamento e histórico

- [FUNCIONALIDADES_FUTURO.md](FUNCIONALIDADES_FUTURO.md): backlog; consulte o
  estado atual antes de tratar um item como ainda pendente.
- [migrations/](migrations): SQL histórico 001 a 004, do modelo anterior.
  As migrations atuais ficam em [supabase/migrations/](../supabase/migrations).
- `docs/local/`: runbooks, originais de mídia e resultados locais ignorados
  pelo Git. A ausência dessa pasta num clone novo é normal.

## Como interpretar os registros

- **Implementado no repositório**: há código ou SQL correspondente.
- **Verificado localmente**: houve execução registrada com data e escopo.
- **Validado em produção**: houve conferência no ambiente publicado; não implica
  que todos os fluxos autenticados foram testados.
- **Planejado**: intenção ou escopo futuro, sem promessa de entrega ou prazo.
- Presença de migration no Git não prova aplicação no Supabase remoto.
- Pesquisa de vagas, salários, preços ou regras de provedores mantém a data
  da consulta real. Revisar texto não renova essa pesquisa.
