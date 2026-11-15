# Orientação da equipe — fora do ZIP do aluno

O exemplo vive no monorepo como fonte editorial. O aluno extrai o ZIP em uma
pasta própria e inicia outro repositório de estudo; não deve usar a branch/main
do site. A lista explícita em `empacotar.ps1` inclui só 16 arquivos do aluno.
Fixtures com soluções/contraexemplos, este guia, scripts editoriais e relatórios
não fazem parte do ZIP.

## Conferir com compilador real

Na raiz deste exemplo, em Windows/PowerShell com SDK .NET 10:

```powershell
powershell -NoProfile -File .\tools\validar-material.ps1 -DotnetPath 'C:\caminho-real-do-sdk\dotnet.exe'
```

Use o caminho instalado, não o exemplo literal. O script executa os cenários
**em sequência**, sem servidores de compilação: solução nas quatro tarefas,
retorno fixo que compila e falha fora do primeiro caso, falta de `return` que
não compila, impressão de respostas com funções erradas, `return` precoce,
`Environment.Exit(0)`, laço infinito e assinatura incompatível. São onze cenários.
Para repetir um caso, use `-Cenario assinatura-incompativel` e outro
`-ReportDirectory` para preservar o resumo integral. Cada relatório registra
o hash do arquivo, SDK selecionado, saídas de processo e casos realmente observados.
O diagnóstico de compilação exibido é o emitido pelo SDK, sem código de erro
inventado ou execução de um binário anterior.

O verificador copia o arquivo completo e acrescenta um harness de chamadas
diretas às funções locais no mesmo escopo. As cinco entradas de cálculo são
`(8,3)`, `(12,4)`, `(5,5)`, `(0,0)`, `(100,1)`; a tarefa 4 acrescenta quatro
decisões: `(8,true)`, `(0,true)`, `(3,false)`, `(0,false)`. Exige todos os casos,
resultado esperado, saída zero e marcador final com nonce novo por execução.
Não se baseia no painel impresso. Saída zero ou texto das respostas sem executar
o harness não basta. Isto é uma checagem de contrato local, não uma proteção
contra adulteração deliberada do verificador e não uma avaliação de autoria.

O relatório confirma funções para essas entradas; a revisão humana ainda confere
painel, reutilização, explicação, uso de ajuda, diff e commit no repo de estudo.
Não rotular uma autodeclaração na plataforma como execução validada por ela.

## Gerar o download

```powershell
powershell -NoProfile -File .\tools\empacotar.ps1
```

O destino padrão é `apps/web/public/downloads/academy/orbiservicos-metodos-v1.zip`.
Entradas em ordem fixa, timestamp fixo e conteúdo sem arquivos gerados permitem
reproduzir o mesmo ZIP no mesmo ambiente. Rode duas vezes e compare SHA256.
Não extrair/testar o pacote dentro de um repositório já existente como se fosse
um aluno iniciando seu primeiro Git.

O script só apaga recursivamente a pasta temporária exclusiva que criou depois
de conferir caminho absoluto, pai esperado, nome único e ausência de link na
raiz. Relatórios locais ficam em `relatorios/` (ignorado). Não registrar uma
rodada nova como aprovada antes de executar e ler o resumo real.

## Conferência local de 15/11/2026

Executado em Windows com SDK **10.0.404**, sem pacotes NuGet externos e com
compilações em sequência. A rodada principal passou **10/10 cenários**
(`relatorios/editorial/resumo.json`); o suplemento de assinatura passou **1/1**
(`relatorios/assinatura/resumo.json`). A solução passou 5 chamadas nas tarefas
1–3 e **9 chamadas na tarefa 4**. O retorno fixo compilou, acertou `(8,3)` e
falhou nos outros cálculos. A falta de retorno emitiu o diagnóstico real
**CS0161**, em `Program.cs(4,5)`, e não executou. A assinatura com `long,long`
foi recusada pelo compilador com **CS0123**, na vinculação tipada do harness.

Impressão fixa foi rejeitada. `return` precoce e `Environment.Exit(0)`
terminaram com saída zero, mas sem chamadas/marcador final, e foram rejeitados.
O laço infinito excedeu o limite e foi rejeitado. Após um lock breve do Windows
na limpeza do processo interrompido, foi acrescentada retentativa curta e
limitada; o cenário de timeout foi repetido sem aviso de limpeza.

O ZIP final foi gerado duas vezes com bytes idênticos: **16 arquivos, 16.091 bytes**,
SHA256 `9a21f84cc0268912be6c79c677822ef2ad963bbc15d15e7d5b5000b2f67642cc`.
Uma cópia extraída fora do repositório compilou o projeto original da tarefa 1,
imprimiu `5`, e, após alterar só o segundo argumento e recompilar, imprimiu `3`.
Ambas as compilações desse projeto tiveram zero avisos e zero erros. Essa cópia
temporária foi preservada; nada foi incluído no ZIP a partir dela. Depois desse
smoke, foi acrescentada ao README a orientação para chamar o SDK portátil
com `&` no PowerShell e removida uma linha vazia final do `.gitignore`.
Os projetos e o verificador permaneceram iguais.

Isso comprova os contratos técnicos observados nesta rodada. Não houve ensaio
com aluno zero, avaliação de aprendizagem, commit do aluno ou validação remota.
