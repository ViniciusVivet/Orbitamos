[CmdletBinding()]
param(
    [string]$DotnetPath = 'dotnet',
    [string]$ReportDirectory,
    [string[]]$Cenario
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$packageRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if (!$ReportDirectory) { $ReportDirectory = Join-Path $packageRoot 'relatorios/editorial' }
$ReportDirectory = [IO.Path]::GetFullPath($ReportDirectory)
[void][IO.Directory]::CreateDirectory($ReportDirectory)
$shell = (Get-Process -Id $PID).Path
$verifier = Join-Path $PSScriptRoot 'verificar.ps1'
$checks = @(
    @{ Name = 'solucao-tarefa1'; Task = 1; Source = 'solucao-servico.cs'; Exit = 0; Status = 'aprovado'; Cases = 17 },
    @{ Name = 'solucao-tarefa2'; Task = 2; Source = 'solucao-criar.cs'; Exit = 0; Status = 'aprovado'; Cases = 23 },
    @{ Name = 'solucao-tarefa3'; Task = 3; Source = 'solucao-copia.cs'; Exit = 0; Status = 'aprovado'; Cases = 23 },
    @{ Name = 'solucao-tarefa4'; Task = 4; Source = 'solucao-lista.cs'; Exit = 0; Status = 'aprovado'; Cases = 26 },
    @{ Name = 'tipo-incorreto'; Task = 1; Source = 'tipo-incorreto.cs'; Exit = 1; Status = 'regra-incorreta'; Cases = 17 },
    @{ Name = 'construtor-mais-amplo'; Task = 1; Source = 'construtor-mais-amplo.cs'; Exit = 1; Status = 'regra-incorreta'; Cases = 17 },
    @{ Name = 'retorno-fixo'; Task = 1; Source = 'retorno-fixo.cs'; Exit = 1; Status = 'regra-incorreta'; Cases = 17 },
    @{ Name = 'falta-retorno'; Task = 2; Source = 'falta-retorno.cs'; Exit = 1; Status = 'compilacao-falhou'; Cases = 0 },
    @{ Name = 'fabrica-cache'; Task = 2; Source = 'fabrica-cache.cs'; Exit = 1; Status = 'regra-incorreta'; Cases = 23 },
    @{ Name = 'copia-alias'; Task = 3; Source = 'copia-alias.cs'; Exit = 1; Status = 'regra-incorreta'; Cases = 23 },
    @{ Name = 'filtro-primeiro'; Task = 4; Source = 'filtro-primeiro.cs'; Exit = 1; Status = 'regra-incorreta'; Cases = 26 },
    @{ Name = 'entrada-alterada'; Task = 4; Source = 'entrada-alterada.cs'; Exit = 1; Status = 'regra-incorreta'; Cases = 26 },
    @{ Name = 'filtro-vazio-altera-entrada'; Task = 4; Source = 'filtro-vazio-altera-entrada.cs'; Exit = 1; Status = 'regra-incorreta'; Cases = 26 },
    @{ Name = 'console-fixo'; Task = 4; Source = 'console-fixo.cs'; Exit = 1; Status = 'regra-incorreta'; Cases = 26 },
    @{ Name = 'retorno-antes'; Task = 4; Source = 'retorno-antes.cs'; Exit = 1; Status = 'execucao-incompleta'; Cases = 0 },
    @{ Name = 'exit-zero'; Task = 4; Source = 'exit-zero.cs'; Exit = 1; Status = 'execucao-incompleta'; Cases = 0 },
    @{ Name = 'sem-fim'; Task = 4; Source = 'sem-fim.cs'; Exit = 1; Status = 'execucao-tempo-esgotado'; Cases = 0 }
)
if ($Cenario) {
    foreach ($name in $Cenario) {
        if ($name -notin @($checks | ForEach-Object { $_.Name })) { throw ('Cenario desconhecido: ' + $name) }
    }
    $checks = @($checks | Where-Object { $_.Name -in $Cenario })
}
$results = @()
foreach ($check in $checks) {
    Write-Host ('Conferencia editorial: ' + $check.Name)
    $reportPath = Join-Path $ReportDirectory ($check.Name + '.json')
    if (Test-Path -LiteralPath $reportPath) { Remove-Item -LiteralPath $reportPath -Force }
    & $shell -NoProfile -File $verifier -Tarefa $check.Task -DotnetPath $DotnetPath `
        -SourcePath (Join-Path $packageRoot ('fixtures/' + $check.Source)) `
        -ReportPath $reportPath -ExecutionTimeoutSeconds 3
    $observedExit = $LASTEXITCODE
    $data = [IO.File]::ReadAllText($reportPath) | ConvertFrom-Json
    $passed = $observedExit -eq $check.Exit -and $data.status -eq $check.Status -and
        @($data.cases).Count -eq $check.Cases -and $data.sdkVersion -match '^10\.0\.\d+$' -and
        $data.sourceSha256 -match '^[a-f0-9]{64}$' -and @($data.sources).Count -eq 2 -and
        @($data.sources | Where-Object { $_.sha256 -notmatch '^[a-f0-9]{64}$' }).Count -eq 0
    if ($check.Exit -eq 0) {
        $passed = $passed -and $data.success -and $data.finalMarkerObserved -and
            $data.buildExitCode -eq 0 -and $data.executionExitCode -eq 0 -and
            @($data.cases | Where-Object { !$_.passed }).Count -eq 0
    }
    else { $passed = $passed -and !$data.success }
    if ($check.Name -eq 'falta-retorno') {
        $passed = $passed -and $data.buildExitCode -ne 0 -and $null -eq $data.executionExitCode
    }
    if ($check.Name -in @('retorno-antes', 'exit-zero')) {
        $passed = $passed -and $data.buildExitCode -eq 0 -and $data.executionExitCode -eq 0 -and !$data.finalMarkerObserved
    }
    if ($check.Name -eq 'tipo-incorreto') {
        $passed = $passed -and @($data.cases | Where-Object { $_.id -eq 'propriedades-exatas' -and !$_.passed }).Count -eq 1
    }
    if ($check.Name -eq 'construtor-mais-amplo') {
        $passed = $passed -and $data.buildExitCode -eq 0 -and
            @($data.cases | Where-Object { $_.id -eq 'construtor-exato' -and !$_.passed }).Count -eq 1 -and
            @($data.cases | Where-Object { !$_.passed }).Count -eq 1
    }
    if ($check.Name -eq 'filtro-vazio-altera-entrada') {
        $passed = $passed -and $data.buildExitCode -eq 0 -and
            @($data.cases | Where-Object { $_.id -eq 'lista-nenhum-liberado' -and !$_.passed }).Count -eq 1 -and
            @($data.cases | Where-Object { !$_.passed }).Count -eq 1
    }
    if ($check.Name -eq 'retorno-fixo') {
        $passed = $passed -and @($data.cases | Where-Object { $_.id -eq 'pendentes-8-3' -and $_.passed }).Count -eq 1 -and
            @($data.cases | Where-Object { $_.id -eq 'pendentes-12-4' -and !$_.passed }).Count -eq 1
    }
    $results += [pscustomobject]@{ name = $check.Name; passed = [bool]$passed; status = $data.status; report = $reportPath }
    if (!$passed) { Write-Warning ('Resultado editorial inesperado: ' + $check.Name) }
}
$failed = @($results | Where-Object { !$_.passed }).Count
$summary = [ordered]@{ timestampUtc = [DateTime]::UtcNow.ToString('o'); success = $failed -eq 0; total = $results.Count; passed = $results.Count - $failed; results = $results }
$utf8 = New-Object Text.UTF8Encoding($false)
[IO.File]::WriteAllText((Join-Path $ReportDirectory 'resumo.json'), ($summary | ConvertTo-Json -Depth 8), $utf8)
Write-Host ('Conferencia editorial: {0}/{1} cenarios corretos.' -f ($results.Count - $failed), $results.Count)
if ($failed -gt 0) { exit 1 }
exit 0
