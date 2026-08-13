# Handoff temporário — IDE do estudante

> Documento local de continuidade. **Não commitar este arquivo.** Ele existe para orientar as próximas sessões de trabalho e deve ser apagado quando o checklist final estiver concluído.

## Contexto do projeto

O Orbitamos possui uma área autenticada do estudante e, dentro dela, uma área de prática em `apps/web/src/app/estudante/pratica/[slug]/page.tsx`. Essa tela combina:

- desafios pedagógicos definidos em `apps/web/src/lib/desafios.ts`;
- editor Monaco no desktop e textarea compatível em dispositivos móveis;
- execução de JavaScript em Web Worker;
- execução de Python com Pyodide em Web Worker;
- console, guia passo a passo, dicas, solução e progresso local;
- restauração automática de rascunho por usuário e desafio.

O objetivo desta leva foi aproximar essa experiência de um “mini VS Code educacional”, mas simples o bastante para alguém programar pelo Android ou iPhone, no espírito de produtos como Mimo. A prioridade foi melhorar robustez e ergonomia sem trocar o design geral, sem alterar a infraestrutura de produção e sem adicionar código ao bundle do usuário além do necessário para a própria IDE.

## O que foi feito

### Editor e experiência mobile

- O editor móvel usa uma textarea compatível para evitar os problemas de Monaco com teclado virtual e ponteiro coarse.
- A fonte móvel foi mantida em 16px para impedir o zoom automático do Safari no iPhone.
- Foi adicionada uma barra horizontal de símbolos com Tab, parênteses, colchetes, chaves, aspas, igual, underscore e teclas específicas de JavaScript/Python.
- A inserção preserva seleção, foco e posição do cursor tanto no Monaco quanto na textarea.
- A barra de status mostra linguagem, linhas e caracteres.
- Controles principais e abas possuem alvo mínimo de 44px no mobile.
- O console pode ser expandido/reduzido no celular e sua saída pode ser copiada.
- A semântica das abas foi corrigida: cada painel agora aponta para o rótulo correto.
- Não existe overflow horizontal no documento nos perfis testados de iPhone 13, Pixel 7 e desktop.

### Execução e segurança do navegador

- JavaScript e Python podem ser interrompidos com `AbortController`.
- A interface exibe “Parar” enquanto há execução ativa.
- Há limite de tamanho do código, linhas e caracteres de saída.
- Saída excessiva é truncada com aviso, protegendo celulares contra travamentos.
- Timeouts, cancelamentos e falhas inesperadas não deixam o botão preso em estado de execução.
- Os Web Workers são terminados após execução/cancelamento.
- Mensagens de erro continuam traduzidas para explicações pedagógicas.

### Validação pedagógica

- Oito desafios receberam testes ocultos iniciais.
- A saída desses testes é separada do console que o aluno enxerga.
- A validação rejeita resultados internos falsos e exige ao menos uma confirmação verdadeira.
- As soluções de referência JavaScript e os testes ocultos são exercitados pela suíte de integridade.

### Salvamento e atalhos

- O rascunho informa `Salvando`, `Salvo neste dispositivo` ou erro de persistência.
- Rascunhos existentes são restaurados com indicação visual.
- `Ctrl/Cmd + Enter`: executar.
- `Ctrl/Cmd + S`: salvar localmente imediatamente.
- `Ctrl/Cmd + L`: limpar console.

### Ferramenta de auditoria visual

- Foi adicionada a dependência de desenvolvimento `@playwright/test`.
- O script `npm run test:ide` abre a IDE em iPhone 13, Pixel 7 e desktop.
- Ele verifica abertura, ausência de overflow, erros de página, edição mobile, barra de símbolos, execução e tamanho dos controles.
- As capturas são geradas em `apps/web/test-results/student-ide/` e não devem ser commitadas.
- A rota `src/app/dev/ide-preview/[slug]/page.tsx` permite testar sem credenciais somente em desenvolvimento; em produção chama `notFound()`.
- A parte visual foi extraída como `PraticaWorkspace`, mantendo a página autenticada normal como wrapper.

## Como reproduzir

No diretório `apps/web`:

```powershell
npm install
npx playwright install chromium
npm run dev
npm run test:ide
```

O servidor precisa responder em `http://localhost:3000`. Para usar outra URL:

```powershell
$env:IDE_AUDIT_URL = "http://localhost:3001"
npm run test:ide
```

Validação geral recomendada:

```powershell
npx tsc --noEmit
npm run lint -- --quiet
npm test
npm run test:contracts
npm run build
```

## Estado validado nesta sessão

- Auditoria visual: iPhone 13, Pixel 7 e desktop passaram.
- Android/iPhone: botão Executar com 44x44px.
- Overflow horizontal do documento: ausente nos três perfis.
- Erros JavaScript de página: nenhum nos três perfis.
- Testes unitários: 138/138 passaram antes da correção final de tipagem.
- Lint: passou.
- TypeScript encontrou apenas a tipagem `UserId` numérica, já corrigida depois da execução; deve ser revalidado antes do commit.
- O build deve ser executado novamente após a correção final.

## O que ainda falta fazer

- [x] Revalidar TypeScript, lint, testes e build após a correção final de `UserId` (2026-08-06: 138 testes, 5 contratos, lint, TypeScript e build passaram).
- [ ] Testar manualmente com teclado virtual em um iPhone físico/Safari e Android físico/Chrome. Emulação não reproduz perfeitamente seleção, teclado, safe area e viewport quando o teclado abre.
- [ ] Testar o fluxo autenticado real com uma conta de estudante, confirmando restauração do cookie e persistência do rascunho por usuário.
- [x] Adicionar ao auditor a troca entre abas Código/Guia, expansão do console, copiar saída, limpar console e botão Parar.
- [x] Adicionar cenário Python ao Playwright, incluindo carregamento do Pyodide, execução, erro de indentação e cancelamento. O cenário completo roda quando o CDN está disponível; use `IDE_AUDIT_REQUIRE_PYTHON=1` para tornar a disponibilidade obrigatória. Nesta máquina, o CDN não iniciou o Pyodide e o auditor registrou `pythonAvailable: false` sem ocultar o diagnóstico.
- [ ] Medir o tempo do primeiro carregamento do Python em rede móvel lenta.
- [ ] Verificar VoiceOver e TalkBack em aparelho real.
- [ ] Decidir se o console deve continuar oculto quando um desafio concluído troca automaticamente para a aba Guia. Atualmente isso é intencional, mas pode esconder o resultado rápido demais.
- [ ] Decidir se a barra de símbolos deve ganhar setas, desfazer/refazer e fechamento automático de pares.
- [ ] Revisar as vulnerabilidades reportadas pelo `npm audit` separadamente. Não executar `npm audit fix --force` sem análise, pois pode introduzir mudanças incompatíveis.

## Continuação de 2026-08-06

- Foi corrigido o empilhamento do console sobre o Monaco: os controles apareciam no desktop, mas a camada do editor interceptava o clique.
- `npm run test:ide` passou em iPhone 13, Pixel 7 e desktop, sem overflow horizontal ou erros de página; os controles principais mediram 44px nos dois perfis mobile.
- O build local só deve ser executado pelo caminho canônico `C:\Users\dougl\Documents\Orbitamos\apps\web`. Usar variações de caixa como `C:\users\...\orbitamos` faz o Next carregar módulos duplicados no Windows e pode disparar falsamente `Expected workStore to be initialized`.
- O build permanece com um aviso não bloqueante de tracing da rota de materiais e aviso de `caniuse-lite` desatualizado.

## Melhorias futuras sugeridas

### Próxima prioridade

1. Worker Python persistente: carregar Pyodide uma vez e reutilizá-lo. Deve reduzir bastante a espera, mas exige isolamento correto do estado entre execuções e testes de memória/cancelamento.
2. Testes E2E autenticados com uma conta de teste controlada e `storageState`, sem colocar segredo no repositório.
3. Sessão de código com múltiplos arquivos virtuais para desafios maiores.
4. Explorador simples de arquivos, abas e painel de problemas, mantendo a interface mobile progressiva.
5. Histórico local de versões/undo entre sessões.

### Experiência educacional

- Feedback por caso de teste sem revelar o teste oculto.
- Explicação de diferença entre saída recebida e esperada.
- Sugestões contextuais baseadas na categoria do erro.
- Modo “digite junto” com destaque do próximo trecho, sem preencher a solução automaticamente.
- Exercícios curtos adaptados ao celular e progresso por habilidade.

### Robustez

- Testar cancelamento real de loops infinitos no navegador.
- Testar limite de 500 linhas/100 mil caracteres visualmente.
- Monitorar memória dos workers após muitas execuções.
- Confirmar CSP/Worker/Pyodide no domínio de produção e no Safari.

## Cuidados para próximas alterações

- Não remover o fallback de textarea mobile sem testes em aparelhos reais.
- Não executar código do aluno na thread principal.
- Não misturar a saída dos testes ocultos com a saída visível.
- Não transformar a rota de preview em bypass de autenticação de produção.
- Não colocar credenciais ou `storageState` autenticado no Git.
- Não commitar `test-results/`, screenshots, logs locais ou este documento.
- O worktree contém alterações de documentação/configuração que pertencem ao usuário e não fazem parte desta leva da IDE; sempre fazer `git add` com caminhos explícitos.

## Quando e como apagar este documento

Apague este arquivo **somente quando** todos os itens da seção “O que ainda falta fazer” estiverem concluídos, descartados com decisão registrada ou transferidos para issues/documentação oficial.

Antes de apagar:

1. Confirme que decisões permanentes foram registradas em documentação versionada ou issues.
2. Confirme que `npm run test:ide`, TypeScript, lint, testes e build passam.
3. Confirme que não há informação exclusiva aqui ainda necessária.
4. Remova localmente com:

```powershell
Remove-Item -LiteralPath .\IDE_ESTUDANTE_TRABALHO_LOCAL.md
```

Como este arquivo não deve ser commitado, sua remoção também não deve gerar commit. Se ele aparecer no staging, retire-o antes de publicar:

```powershell
git restore --staged -- IDE_ESTUDANTE_TRABALHO_LOCAL.md
```
