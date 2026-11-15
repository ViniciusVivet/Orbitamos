[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][ValidateRange(1, 4)][int]$Tarefa,
    [string]$DotnetPath = 'dotnet',
    [string]$ProgramPath,
    [string]$ReportPath,
    [ValidateRange(1, 30)][int]$ExecutionTimeoutSeconds = 8
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$packageRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$utf8 = New-Object Text.UTF8Encoding($false)
$taskFolders = @('01-primeira-regra', '02-tres-clientes', '03-investigue-o-bug', '04-painel-independente')
$expectedCount = if ($Tarefa -eq 4) { 9 } else { 5 }
$report = [ordered]@{
    schemaVersion = 1
    timestampUtc = [DateTime]::UtcNow.ToString('o')
    tarefa = $Tarefa
    success = $false
    status = 'nao-iniciado'
    sdkVersion = $null
    dotnetPath = $null
    programPath = $null
    sourceSha256 = $null
    expectedCases = $expectedCount
    cases = @()
    buildExitCode = $null
    compilerOutput = $null
    executionExitCode = $null
    finalMarkerObserved = $false
    message = ''
}
$exitCode = 1
$ownedTempRoot = $null
$tempParent = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\', '/')

function Invoke-LocalProcess {
    param([string]$Executable, [string[]]$Arguments, [string]$Directory, [int]$TimeoutSeconds)
    $info = New-Object Diagnostics.ProcessStartInfo
    $info.FileName = $Executable
    # Windows paths cannot contain quotes. Every argument is quoted separately;
    # double final backslashes to preserve paths ending with a separator.
    $quoted = foreach ($argument in $Arguments) {
        if ($argument.Contains('"')) { throw 'Argumento de processo contem aspas inesperadas.' }
        '"' + ($argument -replace '(\\+)$', '$1$1') + '"'
    }
    $info.Arguments = $quoted -join ' '
    $info.WorkingDirectory = $Directory
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $info.EnvironmentVariables['DOTNET_CLI_TELEMETRY_OPTOUT'] = '1'
    $info.EnvironmentVariables['DOTNET_NOLOGO'] = '1'
    $info.EnvironmentVariables['DOTNET_SKIP_FIRST_TIME_EXPERIENCE'] = '1'
    $info.EnvironmentVariables['DOTNET_CLI_WORKLOAD_UPDATE_NOTIFY_DISABLE'] = '1'
    $process = New-Object Diagnostics.Process
    $process.StartInfo = $info
    try {
        [void]$process.Start()
        $stdout = $process.StandardOutput.ReadToEndAsync()
        $stderr = $process.StandardError.ReadToEndAsync()
        $finished = $process.WaitForExit($TimeoutSeconds * 1000)
        if (!$finished) {
            # The executed learner program is the direct dotnet child. Builds
            # disable build servers and shared compiler processes below.
            $process.Kill()
            $process.WaitForExit()
        }
        [pscustomobject]@{
            ExitCode = $process.ExitCode
            TimedOut = !$finished
            Stdout = $stdout.GetAwaiter().GetResult()
            Stderr = $stderr.GetAwaiter().GetResult()
        }
    }
    finally { $process.Dispose() }
}

function Remove-OwnedTemporaryDirectory {
    param([string]$Target)
    for ($attempt = 0; $attempt -lt 5; $attempt++) {
        if (!(Test-Path -LiteralPath $Target)) { return }
        $absolute = [IO.Path]::GetFullPath((Resolve-Path -LiteralPath $Target).ProviderPath)
        $expected = [IO.Path]::GetFullPath($ownedTempRoot)
        $parent = [IO.Path]::GetDirectoryName($absolute)
        $leaf = [IO.Path]::GetFileName($absolute)
        if (!$absolute.Equals($expected, [StringComparison]::OrdinalIgnoreCase) -or
            !$parent.Equals($tempParent, [StringComparison]::OrdinalIgnoreCase) -or
            $leaf -notmatch '^orbitamos-metodos-[a-f0-9]{32}$') {
            throw 'Limpeza recusada: a pasta nao e a pasta temporaria exclusiva desta verificacao.'
        }
        if (((Get-Item -LiteralPath $absolute -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw 'Limpeza recusada: a pasta temporaria foi substituida por um link.'
        }
        try { Remove-Item -LiteralPath $absolute -Recurse -Force; return }
        catch {
            if ($attempt -eq 4) { throw }
            # Windows can release a killed process's mapped DLL slightly later.
            Start-Sleep -Milliseconds 200
        }
    }
}

try {
    if (!$ProgramPath) {
        $ProgramPath = Join-Path $packageRoot ('tarefas/' + $taskFolders[$Tarefa - 1] + '/Program.cs')
    }
    $sourcePath = (Resolve-Path -LiteralPath $ProgramPath).ProviderPath
    if (!(Test-Path -LiteralPath $sourcePath -PathType Leaf)) { throw 'Program.cs nao encontrado.' }
    $report.programPath = $sourcePath
    $report.sourceSha256 = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash.ToLowerInvariant()
    $source = [IO.File]::ReadAllText($sourcePath)
    if (Test-Path -LiteralPath $DotnetPath -PathType Leaf) {
        $dotnet = (Resolve-Path -LiteralPath $DotnetPath).ProviderPath
    }
    else { $dotnet = (Get-Command $DotnetPath -CommandType Application -ErrorAction Stop).Source }

    $ownedTempRoot = Join-Path $tempParent ('orbitamos-metodos-' + [Guid]::NewGuid().ToString('N'))
    [void][IO.Directory]::CreateDirectory($ownedTempRoot)
    $report.dotnetPath = $dotnet
    $sdk = Invoke-LocalProcess -Executable $dotnet -Arguments @('--version') -Directory $ownedTempRoot -TimeoutSeconds 20
    $report.sdkVersion = $sdk.Stdout.Trim()
    if ($sdk.TimedOut -or $sdk.ExitCode -ne 0 -or $report.sdkVersion -notmatch '^10\.0\.\d+$') {
        $report.status = 'sdk-indisponivel'
        throw 'Selecione um SDK .NET 10 instalado. Confira dotnet --list-sdks ou informe -DotnetPath.'
    }

    $nonce = [Guid]::NewGuid().ToString('N')
    $prefix = '__orbi_' + $nonce
    $caseMarker = 'ORBITAMOS_CASE_' + $nonce + '|'
    $finalMarker = 'ORBITAMOS_FINAL_' + $nonce + '|'
    $harness = @"

// Verificacoes acrescentadas no mesmo escopo do Program.cs original.
int ${prefix}_executed = 0;
int ${prefix}_passed = 0;
System.Func<int, int, int> ${prefix}_calcular = CalcularPendentes;
${prefix}_int("pendentes-8-3", 5, CalcularPendentes(8, 3));
${prefix}_int("pendentes-12-4", 8, CalcularPendentes(12, 4));
${prefix}_int("pendentes-5-5", 0, CalcularPendentes(5, 5));
${prefix}_int("pendentes-0-0", 0, CalcularPendentes(0, 0));
${prefix}_int("pendentes-100-1", 99, CalcularPendentes(100, 1));
"@
    if ($Tarefa -eq 4) {
        $harness += @"

System.Func<int, bool, bool> ${prefix}_iniciar = PodeIniciar;
${prefix}_bool("inicio-8-pago", true, PodeIniciar(8, true));
${prefix}_bool("inicio-0-pago", false, PodeIniciar(0, true));
${prefix}_bool("inicio-3-nao-pago", false, PodeIniciar(3, false));
${prefix}_bool("inicio-0-nao-pago", false, PodeIniciar(0, false));
"@
    }
    $harness += @"

System.Console.WriteLine("$finalMarker" + ${prefix}_executed + "|" + ${prefix}_passed);
System.Environment.ExitCode = ${prefix}_passed == $expectedCount ? 0 : 1;

void ${prefix}_int(string id, int expected, int actual)
{
    ${prefix}_executed++;
    bool passed = actual == expected;
    if (passed) ${prefix}_passed++;
    System.Console.WriteLine("$caseMarker" + id + "|" + expected + "|" + actual + "|" + (passed ? "PASS" : "FAIL"));
}
"@
    if ($Tarefa -eq 4) {
        $harness += @"

void ${prefix}_bool(string id, bool expected, bool actual)
{
    ${prefix}_executed++;
    bool passed = actual == expected;
    if (passed) ${prefix}_passed++;
    System.Console.WriteLine("$caseMarker" + id + "|" + expected + "|" + actual + "|" + (passed ? "PASS" : "FAIL"));
}
"@
    }
    # Preserve the complete learner source. No function/body extraction or parser.
    [IO.File]::WriteAllText((Join-Path $ownedTempRoot 'Program.cs'), $source + [Environment]::NewLine + $harness, $utf8)
    $project = @'
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <UseAppHost>false</UseAppHost>
  </PropertyGroup>
</Project>
'@
    [IO.File]::WriteAllText((Join-Path $ownedTempRoot 'Verificacao.csproj'), $project, $utf8)
    Copy-Item -LiteralPath (Join-Path $packageRoot 'NuGet.Config') -Destination (Join-Path $ownedTempRoot 'NuGet.Config')
    Write-Host ('SDK selecionado: ' + $report.sdkVersion + '. Compilando seu Program.cs completo...')
    $build = Invoke-LocalProcess -Executable $dotnet -Directory $ownedTempRoot -TimeoutSeconds 120 -Arguments @(
        'build', 'Verificacao.csproj', '--nologo', '--verbosity', 'minimal', '--disable-build-servers',
        '-m:1', '-p:UseSharedCompilation=false', '-p:NuGetAudit=false', '--configfile', 'NuGet.Config'
    )
    $report.buildExitCode = $build.ExitCode
    $report.compilerOutput = $build.Stdout + $build.Stderr
    if ($build.TimedOut -or $build.ExitCode -ne 0) {
        $report.status = if ($build.TimedOut) { 'compilacao-tempo-esgotado' } else { 'compilacao-falhou' }
        $report.message = 'O codigo salvo nao compilou. Leia o diagnostico real abaixo; nenhum binario antigo foi executado.'
        Write-Host $build.Stdout
        Write-Host $build.Stderr
    }
    else {
        $run = Invoke-LocalProcess -Executable $dotnet -Directory $ownedTempRoot -TimeoutSeconds $ExecutionTimeoutSeconds -Arguments @('bin/Debug/net10.0/Verificacao.dll')
        $report.executionExitCode = $run.ExitCode
        $lines = @($run.Stdout -split '\r?\n')
        $caseLines = @($lines | Where-Object { $_.StartsWith($caseMarker, [StringComparison]::Ordinal) })
        $expectedIds = @('pendentes-8-3', 'pendentes-12-4', 'pendentes-5-5', 'pendentes-0-0', 'pendentes-100-1')
        if ($Tarefa -eq 4) { $expectedIds += @('inicio-8-pago', 'inicio-0-pago', 'inicio-3-nao-pago', 'inicio-0-nao-pago') }
        $validCases = $caseLines.Count -eq $expectedCount
        $cases = @()
        foreach ($line in $caseLines) {
            $parts = $line.Substring($caseMarker.Length).Split('|')
            if ($parts.Count -ne 4) { $validCases = $false; continue }
            $cases += [pscustomobject]@{ id = $parts[0]; expected = $parts[1]; actual = $parts[2]; passed = $parts[3] -eq 'PASS' }
        }
        foreach ($id in $expectedIds) {
            if (@($cases | Where-Object { $_.id -eq $id }).Count -ne 1) { $validCases = $false }
        }
        $report.cases = @($cases)
        $finalLines = @($lines | Where-Object { $_.StartsWith($finalMarker, [StringComparison]::Ordinal) })
        $expectedFinal = $finalMarker + $expectedCount + '|' + $expectedCount
        $report.finalMarkerObserved = $finalLines.Count -eq 1
        $passedCases = @($cases | Where-Object { $_.passed }).Count
        $report.success = !$run.TimedOut -and $run.ExitCode -eq 0 -and $validCases -and
            $passedCases -eq $expectedCount -and $finalLines.Count -eq 1 -and $finalLines[0] -ceq $expectedFinal
        if ($report.success) {
            $report.status = 'aprovado'
            $report.message = "$expectedCount de $expectedCount chamadas reais passaram nesta verificacao local."
            $exitCode = 0
        }
        elseif ($run.TimedOut) {
            $report.status = 'execucao-tempo-esgotado'
            $report.message = 'A execucao excedeu o limite. Procure um laco sem fim; nenhuma aprovacao foi registrada.'
        }
        elseif (!$validCases -or !$report.finalMarkerObserved) {
            $report.status = 'execucao-incompleta'
            $report.message = 'A execucao nao chegou a todas as chamadas e ao marcador final. Imprimir respostas ou terminar antes nao aprova a regra.'
        }
        else {
            $report.status = 'regra-incorreta'
            $report.message = "$passedCases de $expectedCount chamadas passaram. Compare esperado e obtido."
        }
        foreach ($case in $cases) {
            Write-Host ('{0}: esperado {1}; obtido {2}; {3}' -f $case.id, $case.expected, $case.actual, $(if ($case.passed) { 'OK' } else { 'REVER' }))
        }
        if ($run.Stderr) { Write-Host $run.Stderr }
    }
}
catch {
    if ($report.status -eq 'nao-iniciado') { $report.status = 'ambiente-ou-arquivo-indisponivel' }
    $report.success = $false
    $exitCode = 1
    $report.message = $_.Exception.Message
}
finally {
    if ($ownedTempRoot) {
        try { Remove-OwnedTemporaryDirectory -Target $ownedTempRoot }
        catch { Write-Warning $_.Exception.Message }
    }
    if ($ReportPath) {
        try {
            $absoluteReport = [IO.Path]::GetFullPath($ReportPath)
            [void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($absoluteReport))
            [IO.File]::WriteAllText($absoluteReport, ($report | ConvertTo-Json -Depth 8), $utf8)
            Write-Host ('Relatorio local: ' + $absoluteReport)
        }
        catch { $exitCode = 1; Write-Warning ('Nao foi possivel gravar o relatorio: ' + $_.Exception.Message) }
    }
}
Write-Host $report.message
exit $exitCode
