# Vila dos Blocos — direção pedagógica e de jogo

## Pedido e identidade (05/10/2026)

Jogo NOVO, separado de Monte o Código e Guia o Orbi. Não substituir o pedido por fases de ordenação. Uma aventura acolhedora, quase um livro ilustrado interativo: a ventania apagou a vila; o jogador ajuda a turma de símbolos a recuperar dez luzes para um festival. Não usar linguagem infantilizante para julgar o aluno, nem vidas, contagem regressiva ou punição por errar.

Personagens vetoriais próprios, feitos em SVG/CSS para continuarem nítidos, animáveis e leves em celular. Os símbolos são parte do corpo dos personagens e também aparecem em código textual selecionável. Nenhuma imagem contém instrução essencial.

## Progressão

1. Pipo & Pop entregam uma chamada de print em Python: escolher um personagem e encaixar no código.
2. Lili guarda estrelas numa lista Python.
3. Lili acessa um array em JavaScript: mesmo símbolo, outro uso, índice inicial zero.
4. Cora constrói um bloco JavaScript.
5. Pipo & Pop fazem uma chamada em C#.
6. Cora aparece num dicionário Python: desfazer o mito de que Python não usa chaves.
7. Nino leva uma ação para dentro do if: trilhos de recuo, quatro espaços por passo.
8. Três lanternas e um anúncio: distinguir dentro/fora de um laço pela consequência.
9. Um laço dentro de um if: dois níveis de recuo.
10. Convite à festa fora de uma condição falsa: código válido pode ter uma intenção diferente.

O jogador manipula símbolos e níveis, não ordena linhas. Cada fase tem história, objetivo, pista opcional, simulação explícita, explicação e código final. Luzes são conquistas reais locais, não medida inventada de domínio. O mapa permite revisitar e explorar; repetir não duplica luzes. O álbum compara funções dos símbolos, sem alegar uma lista exaustiva de usos ou linguagens.

## Precisão e limites

- Python usa parênteses, colchetes e chaves. Indentação delimita seus blocos; quatro espaços é a convenção adotada, não a única quantidade sintaticamente possível. Os controles não misturam tabs e espaços.
- Em JS/C#, chaves delimitam os blocos mostrados. Não ensinar que todo if exige chaves em qualquer situação, nem que o recuo substitui chaves nessas linguagens.
- As fases são puzzles autorais com simulação determinística, não execução arbitrária de Python/JS/.NET. A interface declara esse limite. Os códigos resultantes podem ser examinados e a conclusão leva ao laboratório.
- Fontes de conferência: https://docs.python.org/3/tutorial/controlflow.html ; https://docs.python.org/3/tutorial/datastructures.html ; https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/member-access-operators .
- Progresso `orbitamos-vila-v1-{userId}`: fase atual e IDs únicos concluídos. Dados inválidos descartados com segurança; falha de armazenamento informada. Não sincroniza dispositivos. Recomeçar fase não apaga conquistas.
- Rota autenticada `/estudante/jogos/vila-dos-blocos`, integrada ao catálogo de jogos e seus totais. Prévia `/dev/vila-preview` apenas em desenvolvimento. Sem alterações nos jogos existentes.
- Teclado e toque sem depender de arrastar. Alvos de 44px ou mais, contraste verificado, reduced-motion respeitado, feedback acessível e sem áudio automático.

## Critérios de aceite

Testar erro e acerto de encaixe; alterações de recuo e saídas diferentes; dez soluções; persistência/revisita sem duplicar conquistas; álbum; orientação até a prática real; desktop, WebKit/iPhone e 320px; axe, overflow, TypeScript, testes unitários e build. Não confundir emulação com teclado físico de iPhone.

## Verificação da primeira versão

```powershell
cd apps/web
npm test -- --maxWorkers=2
node scripts/audit-vila.mjs
npm run build
```

`VILA_PROFILE=desktop`, `iphone` ou `small` seleciona um perfil do audit. A prévia usa armazenamento `vila-preview`, isolado das contas reais. Capturas e relatórios em `apps/web/test-results/vila/`.

- 262 testes unitários em 29 arquivos aprovados; lint dos novos arquivos sem erros ou avisos.
- Build de produção e TypeScript aprovados, com 64 páginas geradas. Permanecem os avisos anteriores de Browserslist desatualizado e tracing em `api/course-materials/[...path]`; não foram introduzidos pelo jogo.
- Dez fases jogadas em desktop, WebKit/iPhone 13 e Chromium 320 px: encaixes errados/certos, recuos, consequências, álbum e foco, revisita, retomada e ausência de luzes duplicadas.
- Axe sem violações nos estados de abertura, álbum, encaixe, recuo e festival; sem overflow horizontal da página. Linhas de código longas têm rolagem interna acessível por teclado.
- A revisão corrigiu anúncio de recuos para leitores de tela, diferenciou recuo inválido de intenção diferente e retirou o cabeçalho comercial duplicado no mobile somente enquanto o jogo está presente.
- O estado conserva luzes e fase atual, não as tentativas intermediárias de cada tabuleiro. Não prometer retomada de um encaixe ainda não testado.
- Conteúdo anterior de Monte o Código e Guia o Orbi preservado. Esta versão nova fica local até autorização de publicação.
