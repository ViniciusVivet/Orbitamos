# Material editorial — fora do ZIP do aluno

Fonte no monorepo, distribuição em `orbiservicos-objetos-v1.zip`. O aluno extrai
em outra pasta/repositório de estudo. Não deve criar histórico na main do site.

## Contratos e limites

`Servico` é uma classe pública com construtor
`Servico(string cliente, int total, int concluidos, bool pago)`, quatro
propriedades públicas `Cliente: string`, `Total: int`, `Concluidos: int`,
`Pago: bool`, todas com get/set, e os métodos sem argumentos
`int CalcularPendentes()` e `bool PodeIniciar()`. Domínio válido, sem nulos.
A unidade usa propriedades mutáveis para observar estado; encapsulamento,
validação, persistência, herança e domínio de produção ficam para depois.

Tarefas: 1 edita Servico.cs; 2–4 editam Program.cs com a classe correta fornecida.
A tarefa 2 exige instância nova em cada chamada; a 3, cópia com independência
em ambos os sentidos; a 4, outra lista com as mesmas referências selecionadas,
ordem e ocorrências preservadas, sem mutação da entrada. Uso de foreach/Add e
explicação do aluno requerem revisão humana, além da checagem funcional.

## Executar a validação editorial

```powershell
powershell -NoProfile -File .\tools\validar-material.ps1 -DotnetPath 'C:\caminho-real-do-sdk\dotnet.exe'
```

Use um caminho existente para SDK 10.0 estável. O script executa **17 cenários
em sequência**: quatro soluções, propriedade com tipo incorreto, construtor
com parâmetro mais amplo, retorno fixo,
função sem retorno que deve falhar na compilação, fábrica que reutiliza cache,
cópia que devolve o original, filtro que devolve
só o primeiro, filtro que altera entrada, filtro que apaga a entrada apenas
quando nenhum item é liberado, console fixo, return precoce,
Environment.Exit(0) e laço infinito. Para repetir um caso, use
`-Cenario nome` e outro `-ReportDirectory` para preservar o resumo principal.

O verificador preserva ambos os arquivos completos. Com `-SourcePath`, só o
arquivo de foco é substituído; o companion vem da tarefa. O harness acrescentado
ao Program.cs faz chamadas diretas e vínculos de delegates exatos; os tipos
continuam em Servico.cs. Metadados conferem tipos, visibilidade e get/set públicos.
São 17/23/23/26 casos para as tarefas 1/2/3/4.

Não há extração de funções por regex. Cada execução exige as linhas de todos os
casos, marcador final com nonce novo, resultados esperados e código de saída
zero. Imprimir respostas, retornar antes, encerrar com zero ou travar não aprova.
Relatórios têm hashes de ambos os arquivos originais, SDK, códigos de saída e
diagnóstico real da compilação. Não são prova de autoria, aprendizagem ou
proteção contra adulteração deliberada do próprio verificador.

## Gerar o download

```powershell
powershell -NoProfile -File .\tools\empacotar.ps1
```

A allowlist tem **20 arquivos** do aluno. Exclui fixtures/soluções, relatórios,
scripts editoriais, .git, bin e obj. O destino padrão é
`apps/web/public/downloads/academy/orbiservicos-objetos-v1.zip`.
Todos os textos são normalizados para UTF-8 sem BOM e LF, com uma quebra final,
ordem e timestamp fixos. Isso estabiliza o hash entre checkouts com CRLF/LF.
Compare duas gerações antes de registrar o hash final.

A limpeza recursiva do verificador valida de novo o caminho absoluto, nome
único, pai temporário esperado e ausência de link na raiz em cada tentativa.
O programa é executado com tempo limitado e compilação sem servidores,
com uma tarefa de MSBuild por vez. Não executar junto ao build/testes do site
em uma máquina com pouca memória. Relatórios em relatorios/ são ignorados.

## Conferência local de 16/11/2026

Executado em Windows, SDK **10.0.404**, com compilações em sequência e sem
pacotes NuGet externos. A rodada editorial inicial passou **15/15 cenários**;
`relatorios/editorial/resumo.json` aponta os relatórios individuais. Os quatro
positivos passaram **17/23/23/26 casos**, respectivamente. A propriedade Total
com tipo long compilou e foi rejeitada pelo contrato exato; o retorno fixo
acertou `(8,3)` e falhou em outras entradas. A função sem retorno produziu
o diagnóstico real **CS0161**, em `Program.cs(11,9)`, sem executar um binário.

Cache de instância, cópia que devolve o original, filtro só do primeiro item,
alteração da entrada e impressão fixa foram rejeitados. `return` precoce e
`Environment.Exit(0)` compilaram e terminaram com zero, mas não produziram
todos os casos nem o nonce final e foram rejeitados. O laço infinito foi
interrompido pelo limite de tempo. Não houve aviso de limpeza nesta rodada.

Uma cópia extraída fora do repositório recebeu a solução editorial apenas no
arquivo de foco de cada tarefa e compilou os **quatro projetos originais**,
com Program.cs e Servico.cs. As quatro saídas nominais foram conferidas:
`Nina / 8 / True`; `Nina / 8 / True / Leo / 0 / False`; `5 / 3`; `1 / Nina`.
O relatório é `relatorios/smoke-extraido.json`. O ZIP do aluno continua com
os pontos de partida incompletos/bug preparados; soluções não foram incluídas.

Depois da revisão, o construtor passou a exigir igualdade dos quatro tipos de
parâmetro (o binder de reflexão pode aceitar tipos mais amplos). O caso sem
liberados também passou a conferir contagem, referências, ordem e propriedades
da entrada. As contagens permanecem 17/23/23/26. O suplemento separado passou
**4/4 cenários** (`relatorios/suplemento-revisao/resumo.json`): solução T1 17/17,
solução T4 26/26, construtor com object rejeitado apenas em `construtor-exato`
(16/17), filtro que apaga entrada sem liberados rejeitado apenas em
`lista-nenhum-liberado` (25/26). O catálogo atual tem 17 cenários; a evidência
registrada é a rodada inicial de 15 e esse suplemento de 4, não uma nova rodada
integral de 17. Os quatro projetos C# do smoke permanecem iguais; mudou somente
o verificador distribuído depois daquele smoke.

ZIP final revisado: **20 arquivos, 20.079 bytes**, SHA256
`31ec3c700fcd433eef64315c78d40a52c0c2f614dfa327dc3dfc63b9d01801bd`.
Duas gerações foram idênticas. Outra cópia de todos os arquivos foi convertida
para CRLF e UTF-8 com BOM; empacotá-la gerou o **mesmo hash**, confirmando a
normalização (`relatorios/reproducibilidade.json`). Cópias temporárias próprias
foram preservadas fora do Git. Relatórios não entram no download ou no commit.

Isso comprova os contratos técnicos observados, sem ensaio com aluno zero,
avaliação de aprendizagem, commit do aluno ou validação remota. O registro de
execução na plataforma continua sendo declaração do estudante.
