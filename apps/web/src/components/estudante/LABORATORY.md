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

- A entrada padrão dos 32 desafios é o modo **passo a passo**. O aluno começa com um editor vazio e escreve código real cumulativo. A revisão de 28/09 abaixo acrescenta introdução e avanço automático opcional; o botão explícito continua disponível.
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

## Contexto antes da sintaxe — revisão de 28/09/2026

### Direção pedagógica

- O aluno precisa saber **qual problema está resolvendo, o que recebe, o que transforma e o que entrega**, antes de ver o editor. `PracticeBrief` mostra uma história curta, foto de contexto reutilizada e o fluxo entrada → ação → saída. Não embutir explicações em imagens.
- Os 32 desafios do catálogo têm histórias próprias em `practiceNarrative.ts`. Conferir cada narrativa contra a referência executável, não só contra o título. Exemplo: Python retorna os textos `sim`/`não` em Pode Dirigir; Notas que Atingem a Meta filtra `>= 7`, não calcula a média. O slug desse desafio continua `listas-python` para preservar links e rascunhos.
- Após começar, uma faixa compacta mantém linguagem e objetivo, com opção de rever a história sem perder código. Rascunhos iniciados retomam o editor diretamente. Os módulos C# já contextualizados usam a versão embutida, sem repetir a tela introdutória.
- A explicação do passo acompanha o editor. Calculadora de descontos, classificador de notas e comparação de idade têm explicações específicas de parâmetros, chamadas, retorno, regras e recuos. Perfis explicam cada variável e a diferença entre nome e valor. Não dizer que uma função é executada quando apenas declarada.
- A foto é contextual; o conteúdo instrucional permanece texto selecionável, responsivo e acessível. Sem scroll preso, animação comercial ou vídeo obrigatório.

### Contrato do avanço automático

- Padrão ligado, com checkbox visível para desligar. Após uma edição que corresponde ao prefixo esperado e **950 ms sem outra edição**, avança **uma microetapa**. Não preenche, executa ou aprova uma missão sozinho.
- Não roubar foco, mover o cursor ou abrir/fechar o teclado. Respeitar composição de texto, guia em revisão, documento oculto, foco fora do editor, reinício e execução pendente. Um programa colado não dispara uma cascata de etapas.
- Rever etapa, desfazer, reiniciar, recuperar, recarregar e ligar o toggle não armam o avanço: exige uma nova edição. O botão manual permanece disponível, inclusive abaixo do editor no celular.
- Correspondência de escrita não é teste semântico. `Executar código` fica disponível quando o programa de referência da missão está montado; quem quiser experimentar código parcial pode habilitar explicitamente o teste exploratório. A execução e os critérios originais continuam decidindo se a missão passou.
- Rascunhos e schema v1 preservados, sem migração destrutiva. Modo livre mantém armazenamento separado. Não prometer persistência de preferências entre dispositivos, sincronização ou .NET completo.

### Organização do catálogo

- Linguagem + objetivo: **Primeiros passos**, **Lógica e decisões**, **Funções e dados**, além de explorar tudo. Combinam com busca, dificuldade e estado. A recomendação acompanha linguagem e objetivo selecionados.
- Entrada explícita na trilha C# & .NET quando C# ou todas as linguagens estão selecionadas.
- CRUD → banco SQL → API/validação/testes → Docker é um caminho **em preparação**, fechado por padrão e sem links para aulas inexistentes. PostgreSQL aparece como exemplo; a trilha C# mantém seu planejamento de SQL Server/EF Core, sem trocar silenciosamente o currículo. Introduzir ferramentas quando o projeto precisar delas, não como exercícios aleatórios ou promessa de conteúdo pronto.

### Verificação desta revisão

```powershell
npm test -- --maxWorkers=2
node node_modules/typescript/bin/tsc --noEmit
node scripts/audit-practice-onboarding.mjs
$env:GUIDED_PROFILE='desktop'
node scripts/audit-guided-practice.mjs
npm run build
```

`audit-practice-onboarding.mjs` verifica desktop, WebKit/iPhone 13 e 320 px: introdução antes do editor, foco, auto/manual, composição, ausência de cascata ao colar, revisão, persistência, recuperação, execução parcial consciente, modo livre, filtros/roadmap e módulo C# embutido. Checa axe, overflow e fonte do editor, com capturas em `test-results/practice-onboarding/`. `PRACTICE_PROFILE` permite selecionar `desktop`, `iphone-webkit` ou `small-phone`.

O audit antigo mantém navegação manual intencionalmente (desliga o toggle) e executa as referências dos 32 desafios. O novo teste não certifica teclado virtual físico: ainda conferir no iPhone/Safari real o foco, seleção, retorno de outro app e leitura da instrução com teclado aberto.

### Resultados e observações

- 248 testes unitários aprovados em 27 arquivos; lint dos arquivos alterados sem erros.
- Referências dos 32 desafios executadas e validadas no navegador, com Python real no worker e o subconjunto C# existente.
- Introdução, escrita, recuperação e organização verificadas em desktop, WebKit/iPhone e 320 px, sem violações axe ou overflow horizontal nos estados auditados.
- Módulo de variáveis C# completo verificado em WebKit: 7 práticas e 3 questões, persistência e retorno pelo mapa. A auditoria revelou que `Can't find variable: ...` do Safari não recebia a mesma tradução pedagógica de `... is not defined` do Chromium. `csharpFeedback.ts` agora trata os dois, com quatro regressões unitárias.
- Build final de produção aprovado, incluindo TypeScript e geração das páginas. O aviso antigo de tracing em `api/course-materials/[...path]` permanece e é independente desta revisão. As capturas são evidência de emulação, não de teclado físico do iPhone.
- Esta rodada foi preparada localmente. Publicação não é implícita na revisão pedagógica; confirmar a solicitação atual antes de fazer commit/push.

## Continuidade, foco e aplicação — revisão de 04/10/2026

### Ordem lógica das melhorias

Antes de adicionar mais exercícios, reduzir três lacunas da experiência atual: perder a visão da sequência ao abrir o editor, competir com informação demais durante a escrita mobile e concluir copiando sem aplicar a ideia em outra situação. A identidade continua sendo de uma ferramenta de estudo, não uma página comercial imersiva.

1. **Localização no caminho:** `PracticeJourney` leva a sequência real da linguagem para dentro do desafio. Fechada inicialmente, abre por escolha do aluno. O número é a posição sugerida no catálogo, não domínio, certificado ou porcentagem da formação. Nada bloqueia exploração; links só apontam para desafios existentes.
2. **Foco explícito:** o aluno pode ligar Foco no código. Mantém instrução, linha de referência, editor e controles; a explicação completa fica em “Entender esta linha”. Não trocar o nó do editor, descartar seleção, esconder a tarefa ou mudar o layout automaticamente ao focar o campo. Ao concluir a missão, a orientação de continuidade reaparece.
3. **Aplicar depois de executar:** oito desafios iniciais recebem uma pergunta opcional de previsão, com feedback específico por alternativa e convite a experimentar no modo livre. A conclusão inclui um atalho para a pergunta, com margem de rolagem para não escondê-la atrás do cabeçalho. Não usar a pergunta para aprovar código, bloquear conclusões antigas ou prometer compreensão comprovada. Errou? Pode tentar de novo. O modo livre mantém seu rascunho separado; não injetar uma solução nele.
4. **Retomada:** filtros ficam na sessão da aba, por usuário. Voltar explicitamente a uma linguagem seleciona essa linguagem e limpa filtros incompatíveis. Não confundir preferências com progresso ou sincronização entre aparelhos.
5. **Digitação:** teclas auxiliares incluem ponto e vírgula, colchetes, divisão e resto; preservam seleção e foco. A última prática C# aponta para a trilha existente; outras linguagens oferecem revisão do catálogo, sem inventar próximo conteúdo.

### Contratos técnicos

- `practiceExperience.ts`: sequência, validação das preferências/respostas, oito perguntas e símbolos por linguagem. `practiceExperience.test.ts` cobre ordem, dados malformados, respostas e exemplos JS executáveis.
- Respostas: `orbitamos-practice-check-v1-{userId}-{check.id}` em localStorage, com identificador versionado da questão. Independentes de `orbitamos-guided-v1-*` e da conclusão do desafio. Falha de armazenamento é informada, sem impedir prática.
- Filtros: `orbitamos-lab-view-v1-{userId}` em sessionStorage; query limitada a 120 caracteres. `?linguagem=` explícito tem precedência sobre filtros lembrados.
- Nenhuma mudança no executor, critérios de aprovação, autenticação, permissões, sincronização ou capacidade .NET. Os módulos C# embutidos recebem o controle de foco, mas não duplicam o mapa e as perguntas externas.

### Verificação reproduzível

```powershell
npm test -- --maxWorkers=2
node node_modules/typescript/bin/tsc --noEmit
node scripts/audit-practice-continuity.mjs
$env:PRACTICE_PROFILE='iphone-webkit'
node scripts/audit-practice-onboarding.mjs
Remove-Item Env:PRACTICE_PROFILE
npm run build
```

O novo audit cobre desktop, WebKit/iPhone 13 e 320 px: mapa e links, mesmo nó de editor/seleção ao alternar foco, teclas de pontuação, resposta incorreta sem perda de conclusão, persistência de resposta, isolamento do modo livre, invalidação após editar e restauração de filtros. Checa axe e overflow nos estados capturados em `test-results/practice-continuity/`. Emulação não certifica teclado virtual físico; repetir no iPhone/Safari real antes de afirmar esse comportamento em aparelho.

Resultados desta rodada: 256 testes em 28 arquivos aprovados; TypeScript e build de produção aprovados. Continuidade aprovada nos três perfis; WebKit repetido após adicionar o atalho da pergunta. Regressão de onboarding aprovada em WebKit, incluindo o módulo C# embutido. Teclas de dicionários Python verificadas adicionalmente em WebKit, preservando foco e sem overflow/violações axe. O aviso preexistente de tracing de `api/course-materials/[...path]` e a base Browserslist desatualizada permanecem fora deste escopo. Durante os ajustes, uma execução registrou erro de navegador sem mensagem; a repetição sem edições concorrentes passou, e o audit agora registra stack e URL para diagnóstico.

### Próxima evolução recomendada

Adicionar variações de código com retirada gradual das dicas e testes próprios, depois um pequeno projeto cumulativo. Ampliar a trilha C# para métodos/coleções com validação executável antes de avançar para CRUD e banco de dados. Não simular integração real com .NET, SQL ou Docker dentro do executor didático e chamar isso de experiência profissional. Esta rodada não publica alterações automaticamente.
