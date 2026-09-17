# Páginas comerciais Orbitamos — 16/09/2026

## Objetivo e restrições
Substituir as seis páginas genéricas de serviço por apresentações comerciais específicas. Preservar catálogo, preços, escopo, metadados, WhatsApp, condições e cases reais. Não fabricar resultados, depoimentos, urgência, descontos, garantias ou prazos. Não reintroduzir legendas sobre geração de IA removidas pelo usuário. CLAUDE.md permanece fora.

## Pesquisa aplicada
- Nielsen Norman Group, State the Price to Give B2B Sites a Competitive Advantage (2013): https://www.nngroup.com/articles/show-price/ — preço e limites visíveis para permitir comparação antes do contato.
- Baymard, Structuring Product Page Descriptions by Highlights (2018): https://baymard.com/research-articles/structure-descriptions-by-highlights — apresentar capacidades em blocos visuais exploráveis. Evidência de testes de usabilidade em produtos, não prova de aumento de conversão destas páginas de serviços; a transferência é uma hipótese.
- Nielsen Norman Group, Hierarchy of Trust: https://www.nngroup.com/articles/commitment-levels/ — demonstrar valor e confiança antes de exigir informações ou compromisso.
- GOV.UK, Measuring completion rate: https://www.gov.uk/service-manual/measuring-success/measuring-completion-rate — definir eventos e distinguir início de conclusão. Clique no WhatsApp não equivale a venda.
- Busca sobre PNL não forneceu evidência aplicável que permita prometer ganhos de venda para estas páginas. O artigo experimental de 1986 foi localizado, mas o texto não ficou acessível; não tratá-lo como comprovação. Não extrapolar pesquisa clínica para marketing.

## Direção e quadros prévios
Esta rodada prioriza persuasão informada, legibilidade e demonstração. Não impor uma travessia cinematográfica nem declarar 10/10.
1. Entrada: nome de serviço, headline curta, preço e CTA contextual. Ambiente e objeto visual diferentes por solução.
2. Produto em foco: capturas reais no hero de presença/vendas/gestão/especial; fluxo nativo para automação; painel de ciclo para manutenção.
3. Identificação: problema atual versus direção de solução, público e condição importante; leitura rápida.
4. Exploração: três capacidades selecionáveis por mouse/teclado. Arte HTML muda junto do argumento, sem autoplay.
5. Prova: mudança de superfície, screenshot grande e caso real. Status e natureza do case mantidos; nunca associar valores do pacote à totalidade de projetos complexos.
6. Decisão: investimento com entregáveis canônicos, o que depende de diagnóstico, processo e perguntas. Sem esconder informação indispensável em efeitos.
7. Fechamento: CTA específico, mensagem WhatsApp coerente, opção de contato por formulário e acesso aos demais serviços.

## Personalidade por produto
- Presença: editorial mineral/ciano, marca e apresentação, Sabrina Lashes.
- Vendas: âmbar, composição de vitrine, YUME.
- Gestão: azul, organização operacional, OrbiCore.
- Automação: verde, caminhos/gatilhos/validação; sem falsas integrações ativas.
- Especial: violeta, estrutura modular e Radar da Rima.
- Manutenção: pêssego, ciclos de trabalho/priorização; sem inventar uptime ou atendimento 24h.

## Métricas e comprovação
Não há série de conversão comercial disponível no repositório. Exibir o que cada negócio pode acompanhar, sem números de performance fabricados. Instrumentação local de eventos sem dados pessoais pode preparar integração futura; não instalar rastreador, cookie ou enviar dados a terceiros. Qualificação, propostas e vendas precisam ser registrados no atendimento para medir o funil completo.

## QA planejado
Seis rotas em desktop alto, notebook baixo, 390 e 320 px. Preços canônicos, imagens, links, teclado, FAQ, movimento reduzido, ausência de overflow e Axe nos novos blocos. Inspeção visual, lint, testes e build. Documentar limitações, sem confundir teste técnico com resultado comercial.

## Implementação concluída
- ServiceSalesPage renderiza a narrativa comercial no servidor; mantém metadados e geração estática das seis rotas.
- serviceStories define seis direções, seis chamadas principais e 18 capítulos específicos. Valores e entregáveis continuam vindo de src/data/servicos.ts, sem alteração desse catálogo.
- ServiceExplorer oferece três capítulos por página, com teclas direcionais/Home/End, tablist/tabpanel e foco explícito.
- ServiceDiagram usa HTML/CSS e ícones existentes: apresentação de marca, vitrine, painel operacional, fluxo de automação, módulos de produto e ciclo de manutenção. Sem dependências novas, autoplay ou rolagem capturada.
- Capturas reais de Sabrina Lashes, YUME, OrbiCore e Radar da Rima representam execução. Status publicado/MVP/em evolução vem dos dados reais do case. Observação de escopo diferencia referência visual de entrega contratada.
- As antigas capas editoriais não participam mais destas páginas; os arquivos foram preservados. Nenhuma imagem nova foi gerada nesta rodada.
- Investimento aparece na abertura, navegação sticky e escopo. CTA leva ao mesmo WhatsApp, com nome e preço canônicos numa mensagem de interesse, sem sugerir compromisso já firmado.
- Limites comerciais, infraestrutura, escopo inicial, recorrência e dependências são explicitados; prazo e pagamento não foram inventados.
- FAQ nativo, contato alternativo por formulário, acesso aos demais produtos e preços acessíveis sem JavaScript.

## Validação final
- 173 testes unitários em 20 arquivos passaram, incluindo oito novos contratos comerciais.
- ESLint passou sem erros ou avisos nos arquivos desta rodada.
- Build final de produção passou: seis rotas comerciais estáticas. Avisos preexistentes de Browserslist e tracing no endpoint de materiais não foram alterados.
- Auditoria comercial: 25 resultados passaram (seis páginas x quatro viewports: 1440x1000, 1280x600, 390x844, 320x740; mais uma verificação sem JavaScript).
- Navegação entre todos os capítulos, teclado, FAQ, preço, canonical, imagens, URL/mensagem do WhatsApp, eventos locais e ausência de erro de runtime/overflow horizontal verificados.
- Axe WCAG 2 A/AA e 2.1 AA: nenhuma violação nos novos blocos das seis páginas em 1440 e 390 px. Isso não constitui certificação de acessibilidade do site inteiro.
- Dois testes extras de âncora: títulos ficaram abaixo da navegação fixa em notebook e celular.
- Auditoria de mídia: 209 arquivos de código, 32 referências literais locais, nenhuma ausente; 12 cenários de imagens aprovados. Respostas WebP observadas entre 2.6 e 96.9 KB no DPR/larguras testados; não são métricas de conexão móvel real.
- Inspeção visual de heros, prova, exploração e investimento em desktop/celular. Evidências locais em apps/web/test-results/service-sales e apps/web/test-results/site-media.
- Catálogo, preços, autenticação, home, cases imersivos, APIs e regras dos portais não foram modificados. CLAUDE.md preservado e fora do lote.

## Medição disponível e limites
ServiceSignals emite apenas CustomEvent("orbitamos:service") na janela: slug, action e detail. Ações: view, feature, case, contact, faq, form. Não grava armazenamento/cookies e não faz requisições. Isto é um ponto de integração local, NÃO um dashboard de analytics nem coleta persistente já em operação.
- Definir consentimento e ferramenta de analytics antes de conectar um coletor.
- Excluir testes internos e deduplicar cliques/views conforme a métrica. StrictMode de desenvolvimento pode emitir efeitos de montagem novamente.
- Medir visitas qualificadas -> contatos -> propostas -> fechamentos. As últimas etapas dependem do atendimento; clicar no WhatsApp não comprova envio, lead ou venda.
- Comparar por origem e serviço, não apenas total agregado. Alterações visuais só poderão ser associadas a ganho comercial após dados reais; um teste A/B precisa de volume e alocação adequados.
- Não existe, neste momento, base empírica para declarar que estas páginas aumentaram a conversão ou que PNL garante fechamento.

## Publicação
Implementação e evidências prontas localmente. Aprovação para commit/push deste redesenho foi solicitada; ainda não recebida no fechamento do registro. Não confundir com os commits anteriores já publicados.
