# Laboratório Orbitamos — direção e manutenção

## Escopo da revisão (14/09/2026)

O catálogo de prática e a interface do editor passam a seguir a identidade da Academy: bancada de experimentos, tipografia da marca e uma folha de orientação ao lado do código. Não reproduzir os efeitos imersivos do site comercial dentro de uma ferramenta de estudo.

- Abertura com retomada do rascunho real ou primeiro desafio ainda não concluído.
- A prévia mostra instruções reais; contadores usam o catálogo e o armazenamento do navegador.
- Cartões por assunto, com cores estáveis por linguagem, habilidade e estado legível. Sem capas aleatórias, progresso inventado ou resultados fictícios.
- Busca, linguagem, dificuldade e status continuam combináveis, com ação clara para limpar filtros.
- Editor com arquivo virtual identificado, estado real de salvamento, execução em destaque e console separado.
- Guia com missão ativa em uma superfície clara, progresso e referências em uma única região rolável.
- Em celular, Código/Guia continuam em abas; console expande e controles principais têm área de toque de pelo menos 44 px.
- Não substituir responsividade com captura de scroll, vídeo ou animação decorativa.

## Limites preservados

Execução JavaScript/Python/C#, currículos, critérios de validação, dicas, reflexão, identificadores de armazenamento, autenticação e permissões não foram reescritos. Os rascunhos continuam locais, não sincronizados entre dispositivos. C# continua com as capacidades do executor existente, não um ambiente .NET completo.

A regra de altura do console foi ajustada para que o tamanho intermediário (640–767 px) não anule a expansão. Estilos de botões não devem sobrescrever as classes que ocultam controles exclusivos de celular.

## Arquivos

- `src/app/estudante/pratica/page.tsx`: catálogo e filtros; componente de apresentação recebe identificação de usuário.
- `src/app/estudante/pratica/[slug]/page.tsx`: workspace existente, agora com a nova camada visual.
- `src/components/estudante/Laboratory.module.css`: estilos encapsulados, sem novas dependências.
- `src/app/dev/LaboratoryPreviewFrame.tsx`: moldura de teste com barra lateral real, sem sessão de aluno.
- `/dev/lab-preview` e `/dev/ide-preview/[slug]`: prévias disponíveis apenas em desenvolvimento.

## Verificação reproduzível

Servidor local na porta 3015:

```powershell
$env:IDE_AUDIT_URL = 'http://localhost:3015'
node scripts/audit-laboratory.mjs
$env:IDE_AUDIT_REQUIRE_PYTHON = '1'
npm run test:ide
npm test
npm run build
```

O primeiro script cobre catálogo em 320, 390, 768, 1024 e 1440 px; filtros combinados, vazio, reflexão e retomada de rascunho; editor e guia em 320, 390, 700 e 1440 px; expansão do console em 700 px; axe e overflow. Capturas e relatório: `test-results/laboratory/`.

A auditoria de IDE cobre seis perfis de tela, execução, autocomplete, teclado de símbolos, atalhos, persistência, JavaScript offline, copiar/limpar/expandir console, interrupção e reutilização do runtime Python. Capturas: `test-results/student-ide/`.

As prévias usam armazenamento de teste e não validam permissões ou dados de uma conta real. Teste em aparelho físico com teclado virtual continua complementar à emulação. O primeiro carregamento do Python pode ser demorado; a alteração visual não promete reduzir esse custo.
# Laboratório guiado mobile — 21/09/2026

## Contrato pedagógico

- A entrada padrão dos 32 desafios é o modo **passo a passo**. O aluno começa com um editor vazio, escreve código real cumulativo e avança com um botão explícito.
- `src/lib/guidedPractice.ts` reúne referências completas, explicações de sintaxe e microetapas. Referências antigas incompletas receberam dados de entrada e chamadas explícitas; não montamos programas usando o rascunho do aluno.
- A soma Python 1–100 tem orientação própria sobre variável, limite exclusivo do `range`, acumulador, indentação e saída fora do laço.
- Verde durante a escrita significa **correspondência com o exemplo**, não prova de correção semântica. A missão só passa após execução nos workers existentes e aprovação dos critérios de todas as missões anteriores. Equivalências mais amplas e soluções autorais pertencem ao modo livre.
- O modo livre anterior continua disponível, com código e progresso separados. Não apagamos nem migramos destrutivamente rascunhos antigos.
- Progressão comunicada: exemplo guiado → prever/observar saída → praticar sem consulta → desafios intermediários. Não prometer formação avançada ou preparo profissional completo com exercícios de sintaxe.

## Contrato de interação e persistência

- Editor nativo (`textarea`, fonte 16px, sem autocorreção/capitalização) como padrão, inclusive no Safari. Realce e autocomplete são opcionais. Teclas de símbolos/recuo inserem na seleção atual e preservam o foco.
- Instrução detalhada + referência compacta junto ao editor. Controles para avançar também ficam abaixo do campo; nada obriga o usuário a descobrir uma aba escondida para conseguir escrever.
- Fluxo de página normal, sem prender o editor numa caixa menor que o teclado. No mobile guiado, o cabeçalho do portal é a navegação principal; não empilhamos também a navegação comercial. Não mudar a geometria do cabeçalho ao focar/desfocar: isso pode interromper um toque durante a troca de foco no celular.
- Reinício requer confirmação e oferece recuperação durante a sessão. Desfazer possui histórico local limitado. Editar durante execução cancela a execução pendente e invalida o resultado, evitando aprovação de código antigo.
- Chave: `orbitamos-guided-v1-{userId}-{slug}`. Autosave, flush ao ocultar/sair, versão de schema, validação do rascunho, código vazio preservado. Erros de armazenamento aparecem na interface. Sem sincronização entre aparelhos, sem promessa de uso totalmente offline.
- A primeira execução de Python precisa baixar o runtime. C# continua sendo um subconjunto didático, não .NET completo.

## Verificação reproduzível

```powershell
npm test
npm run build
$env:IDE_AUDIT_URL='http://localhost:3015'
node scripts/audit-guided-practice.mjs
$env:IDE_AUDIT_REQUIRE_PYTHON='1'
npm run test:ide
```

O novo audit usa **WebKit/iPhone**, Chromium 320px e desktop, com execução Python/JS, etapas explícitas, armazenamento vazio/retomada, confirmação/recuperação, erros, cancelamento, troca de modo, acessibilidade e execução das referências dos 32 desafios. `GUIDED_PROFILE` pode selecionar `safari-iphone`, `small-mobile` ou `desktop`. Previews seguem limitados ao ambiente de desenvolvimento; não abrir exceções de autenticação em produção.

**Limite da simulação:** viewport reduzido não reproduz o teclado virtual físico do iPhone. Checklist manual final: abrir Safari → entrar como estudante → laboratório → Soma de 1 a 100 → tocar em Escrever esta etapa → usar Recuo e aspas → alternar apps → voltar → executar 5050 → reiniciar/cancelar/recuperar. Conferir seleção, caret, barra do Safari e rotação do aparelho.

---
