# Documentação da Orbitamos

Índice revisado em **05/11/2026**.

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

## Direção visual e páginas comerciais

| Documento | Finalidade |
| --- | --- |
| [PADRAO_VISUAL_ACADEMY.md](PADRAO_VISUAL_ACADEMY.md) | Critérios para entradas visuais e referência aprovada |
| [DIRECAO_IMERSIVA.md](DIRECAO_IMERSIVA.md) | Critérios de imersão da página inteira |
| [METODO_ORBITA_IMERSIVA.md](METODO_ORBITA_IMERSIVA.md) | Processo, decisões e iterações de imersão |
| [INICIO_PROCESSO_ENGENHARIA.md](INICIO_PROCESSO_ENGENHARIA.md) | Seções de engenharia/processo da home e verificações |
| [PAGINAS_COMERCIAIS.md](PAGINAS_COMERCIAIS.md) | Páginas de serviços, estratégia e registros de entrega |
| [PORTFOLIO_COMERCIAL.md](PORTFOLIO_COMERCIAL.md) | Curadoria comercial de 07/11, três cases da home, catálogo editorial com busca e histórico das capturas e da faixa |

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
