[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][ValidateRange(1, 4)][int]$Tarefa,
    [string]$DotnetPath = 'dotnet',
    [string]$SourcePath,
    [string]$ReportPath,
    [ValidateRange(1, 30)][int]$ExecutionTimeoutSeconds = 8
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$packageRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$utf8 = New-Object Text.UTF8Encoding($false)
$taskFolders = @('01-primeiro-servico', '02-fichas-separadas', '03-copia-emprestada', '04-lista-do-dia')
$expectedIds = @('classe-publica', 'construtor-exato', 'propriedades-exatas', 'metodos-publicos', 'construtor-nina', 'construtor-leo', 'pendentes-8-3', 'pendentes-12-4', 'pendentes-5-5', 'pendentes-0-0', 'pendentes-100-1', 'inicio-8-pago', 'inicio-0-pago', 'inicio-3-nao-pago', 'inicio-0-nao-pago', 'propriedades-mutaveis', 'regra-apos-mudar-dados')
switch ($Tarefa) {
    2 { $expectedIds += @('criar-assinatura-exata', 'criar-primeiros-dados', 'criar-outros-dados', 'criar-instancias-diferentes', 'criar-mudanca-independente', 'criar-mesmos-dados-outra-instancia') }
    3 { $expectedIds += @('copia-assinatura-exata', 'copia-dados', 'copia-outra-instancia', 'copia-nao-muda-original', 'original-nao-muda-copia', 'copia-outros-dados') }
    4 { $expectedIds += @('lista-assinatura-exata', 'lista-outra-lista', 'lista-dois-liberados', 'lista-ordem-identidades', 'lista-entrada-preservada', 'lista-vazia-nova', 'lista-nenhum-liberado', 'lista-ocorrencias-repetidas', 'lista-repetida-entrada-preservada') }
}
$expectedCount = $expectedIds.Count
$report = [ordered]@{
    schemaVersion = 1
    timestampUtc = [DateTime]::UtcNow.ToString('o')
    tarefa = $Tarefa
    success = $false
    status = 'nao-iniciado'
    sdkVersion = $null
    dotnetPath = $null
    sourceFocus = $null
    sourcePath = $null
    sources = @()
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
            $leaf -notmatch '^orbitamos-objetos-[a-f0-9]{32}$') {
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
    $taskRoot = Join-Path $packageRoot ('tarefas/' + $taskFolders[$Tarefa - 1])
    $focusFile = if ($Tarefa -eq 1) { 'Servico.cs' } else { 'Program.cs' }
    $report.sourceFocus = $focusFile
    $sourceTexts = @{}
    foreach ($file in @('Program.cs', 'Servico.cs')) {
        $path = if ($SourcePath -and $file -eq $focusFile) { $SourcePath } else { Join-Path $taskRoot $file }
        $absoluteSource = (Resolve-Path -LiteralPath $path).ProviderPath
        if (!(Test-Path -LiteralPath $absoluteSource -PathType Leaf)) { throw ('Arquivo nao encontrado: ' + $file) }
        $hash = (Get-FileHash -LiteralPath $absoluteSource -Algorithm SHA256).Hash.ToLowerInvariant()
        $report.sources += [pscustomobject]@{ file = $file; path = $absoluteSource; sha256 = $hash }
        $sourceTexts[$file] = [IO.File]::ReadAllText($absoluteSource)
        if ($file -eq $focusFile) { $report.sourcePath = $absoluteSource; $report.sourceSha256 = $hash }
    }
    if (Test-Path -LiteralPath $DotnetPath -PathType Leaf) {
        $dotnet = (Resolve-Path -LiteralPath $DotnetPath).ProviderPath
    }
    else { $dotnet = (Get-Command $DotnetPath -CommandType Application -ErrorAction Stop).Source }
    $ownedTempRoot = Join-Path $tempParent ('orbitamos-objetos-' + [Guid]::NewGuid().ToString('N'))
    [void][IO.Directory]::CreateDirectory($ownedTempRoot)
    $report.dotnetPath = $dotnet
    $sdk = Invoke-LocalProcess -Executable $dotnet -Arguments @('--version') -Directory $ownedTempRoot -TimeoutSeconds 20
    $report.sdkVersion = $sdk.Stdout.Trim()
    if ($sdk.TimedOut -or $sdk.ExitCode -ne 0 -or $report.sdkVersion -notmatch '^10\.0\.\d+$') {
        $report.status = 'sdk-indisponivel'
        throw 'Selecione um SDK .NET 10 estavel instalado. Confira --list-sdks ou informe -DotnetPath.'
    }
    $nonce = [Guid]::NewGuid().ToString('N')
    $prefix = '__orbi_' + $nonce
    $caseMarker = 'ORBITAMOS_CASE_' + $nonce + '|'
    $finalMarker = 'ORBITAMOS_FINAL_' + $nonce + '|'
    $harness = @'
int __ORBI___executed = 0;
int __ORBI___passed = 0;
Servico __ORBI___a = new Servico("Nina", 12, 4, true);
Servico __ORBI___b = new Servico("Leo", 5, 5, false);
System.Func<int> __ORBI___calc = __ORBI___a.CalcularPendentes;
System.Func<bool> __ORBI___start = __ORBI___a.PodeIniciar;
__ORBI___check("classe-publica", true, typeof(Servico).IsClass && typeof(Servico).IsPublic);
var __ORBI___constructor = typeof(Servico).GetConstructor(new[] { typeof(string), typeof(int), typeof(int), typeof(bool) });
var __ORBI___constructorParameters = __ORBI___constructor?.GetParameters();
__ORBI___check("construtor-exato", true, __ORBI___constructor != null && __ORBI___constructor.IsPublic && __ORBI___constructorParameters != null && __ORBI___constructorParameters.Length == 4 && __ORBI___constructorParameters[0].ParameterType == typeof(string) && __ORBI___constructorParameters[1].ParameterType == typeof(int) && __ORBI___constructorParameters[2].ParameterType == typeof(int) && __ORBI___constructorParameters[3].ParameterType == typeof(bool));
__ORBI___check("propriedades-exatas", true, __ORBI___property("Cliente", typeof(string)) && __ORBI___property("Total", typeof(int)) && __ORBI___property("Concluidos", typeof(int)) && __ORBI___property("Pago", typeof(bool)));
__ORBI___check("metodos-publicos", true, typeof(Servico).GetMethod("CalcularPendentes", Type.EmptyTypes)?.ReturnType == typeof(int) && typeof(Servico).GetMethod("PodeIniciar", Type.EmptyTypes)?.ReturnType == typeof(bool));
__ORBI___check("construtor-nina", true, __ORBI___a.Cliente == "Nina" && __ORBI___a.Total == 12 && __ORBI___a.Concluidos == 4 && __ORBI___a.Pago);
__ORBI___check("construtor-leo", true, __ORBI___b.Cliente == "Leo" && __ORBI___b.Total == 5 && __ORBI___b.Concluidos == 5 && !__ORBI___b.Pago);
__ORBI___check("pendentes-8-3", 5, new Servico("A", 8, 3, true).CalcularPendentes());
__ORBI___check("pendentes-12-4", 8, new Servico("A", 12, 4, true).CalcularPendentes());
__ORBI___check("pendentes-5-5", 0, new Servico("A", 5, 5, true).CalcularPendentes());
__ORBI___check("pendentes-0-0", 0, new Servico("A", 0, 0, false).CalcularPendentes());
__ORBI___check("pendentes-100-1", 99, new Servico("A", 100, 1, false).CalcularPendentes());
__ORBI___check("inicio-8-pago", true, new Servico("A", 12, 4, true).PodeIniciar());
__ORBI___check("inicio-0-pago", false, new Servico("A", 5, 5, true).PodeIniciar());
__ORBI___check("inicio-3-nao-pago", false, new Servico("A", 4, 1, false).PodeIniciar());
__ORBI___check("inicio-0-nao-pago", false, new Servico("A", 0, 0, false).PodeIniciar());
__ORBI___a.Cliente = "Bia";
__ORBI___a.Total = 9;
__ORBI___a.Concluidos = 6;
__ORBI___a.Pago = false;
__ORBI___check("propriedades-mutaveis", true, __ORBI___a.Cliente == "Bia" && __ORBI___a.Total == 9 && __ORBI___a.Concluidos == 6 && !__ORBI___a.Pago);
__ORBI___check("regra-apos-mudar-dados", true, __ORBI___a.CalcularPendentes() == 3 && !__ORBI___a.PodeIniciar());
'@
    switch ($Tarefa) {
        2 { $harness += @'

System.Func<string, int, int, bool, Servico> __ORBI___factory = CriarServico;
__ORBI___check("criar-assinatura-exata", true, __ORBI___signature(__ORBI___factory, typeof(Servico), typeof(string), typeof(int), typeof(int), typeof(bool)));
Servico __ORBI___first = CriarServico("Mara", 9, 2, true);
Servico __ORBI___second = CriarServico("Ivo", 6, 6, false);
__ORBI___check("criar-primeiros-dados", true, __ORBI___first.Cliente == "Mara" && __ORBI___first.Total == 9 && __ORBI___first.Concluidos == 2 && __ORBI___first.Pago);
__ORBI___check("criar-outros-dados", true, __ORBI___second.Cliente == "Ivo" && __ORBI___second.Total == 6 && __ORBI___second.Concluidos == 6 && !__ORBI___second.Pago);
__ORBI___check("criar-instancias-diferentes", true, !object.ReferenceEquals(__ORBI___first, __ORBI___second));
__ORBI___first.Cliente = "Mudou";
__ORBI___first.Total = 10;
__ORBI___first.Concluidos = 4;
__ORBI___first.Pago = false;
__ORBI___check("criar-mudanca-independente", true, __ORBI___second.Cliente == "Ivo" && __ORBI___second.Total == 6 && __ORBI___second.Concluidos == 6 && !__ORBI___second.Pago);
Servico __ORBI___third = CriarServico("Ivo", 6, 6, false);
__ORBI___check("criar-mesmos-dados-outra-instancia", true, !object.ReferenceEquals(__ORBI___second, __ORBI___third));

'@
        }
        3 { $harness += @'

System.Func<Servico, Servico> __ORBI___copy = CriarCopia;
__ORBI___check("copia-assinatura-exata", true, __ORBI___signature(__ORBI___copy, typeof(Servico), typeof(Servico)));
Servico __ORBI___original = new Servico("Mara", 9, 2, true);
Servico __ORBI___copied = CriarCopia(__ORBI___original);
__ORBI___check("copia-dados", true, __ORBI___copied.Cliente == "Mara" && __ORBI___copied.Total == 9 && __ORBI___copied.Concluidos == 2 && __ORBI___copied.Pago);
__ORBI___check("copia-outra-instancia", true, !object.ReferenceEquals(__ORBI___original, __ORBI___copied));
__ORBI___copied.Cliente = "Copia";
__ORBI___copied.Total = 10;
__ORBI___copied.Concluidos = 5;
__ORBI___copied.Pago = false;
__ORBI___check("copia-nao-muda-original", true, __ORBI___original.Cliente == "Mara" && __ORBI___original.Total == 9 && __ORBI___original.Concluidos == 2 && __ORBI___original.Pago);
__ORBI___original.Cliente = "Original";
__ORBI___original.Total = 7;
__ORBI___original.Concluidos = 4;
__ORBI___original.Pago = true;
__ORBI___check("original-nao-muda-copia", true, __ORBI___copied.Cliente == "Copia" && __ORBI___copied.Total == 10 && __ORBI___copied.Concluidos == 5 && !__ORBI___copied.Pago);
Servico __ORBI___other = CriarCopia(new Servico("Ivo", 0, 0, false));
__ORBI___check("copia-outros-dados", true, __ORBI___other.Cliente == "Ivo" && __ORBI___other.Total == 0 && __ORBI___other.Concluidos == 0 && !__ORBI___other.Pago);

'@
        }
        4 { $harness += @'

System.Func<List<Servico>, List<Servico>> __ORBI___select = SelecionarLiberados;
__ORBI___check("lista-assinatura-exata", true, __ORBI___signature(__ORBI___select, typeof(List<Servico>), typeof(List<Servico>)));
Servico __ORBI___zero = new Servico("Zero", 5, 5, true);
Servico __ORBI___first = new Servico("Zeca", 9, 2, true);
Servico __ORBI___unpaid = new Servico("Nao pago", 4, 1, false);
Servico __ORBI___last = new Servico("Ana", 3, 0, true);
List<Servico> __ORBI___input = new List<Servico> { __ORBI___zero, __ORBI___first, __ORBI___unpaid, __ORBI___last };
List<Servico> __ORBI___result = SelecionarLiberados(__ORBI___input);
__ORBI___check("lista-outra-lista", true, !object.ReferenceEquals(__ORBI___input, __ORBI___result));
__ORBI___check("lista-dois-liberados", 2, __ORBI___result.Count);
__ORBI___check("lista-ordem-identidades", true, __ORBI___result.Count == 2 && object.ReferenceEquals(__ORBI___result[0], __ORBI___first) && object.ReferenceEquals(__ORBI___result[1], __ORBI___last));
__ORBI___check("lista-entrada-preservada", true, __ORBI___input.Count == 4 && object.ReferenceEquals(__ORBI___input[0], __ORBI___zero) && object.ReferenceEquals(__ORBI___input[1], __ORBI___first) && object.ReferenceEquals(__ORBI___input[2], __ORBI___unpaid) && object.ReferenceEquals(__ORBI___input[3], __ORBI___last) && __ORBI___zero.Cliente == "Zero" && __ORBI___zero.Total == 5 && __ORBI___zero.Concluidos == 5 && __ORBI___zero.Pago && __ORBI___first.Cliente == "Zeca" && __ORBI___first.Total == 9 && __ORBI___first.Concluidos == 2 && __ORBI___first.Pago && __ORBI___unpaid.Cliente == "Nao pago" && __ORBI___unpaid.Total == 4 && __ORBI___unpaid.Concluidos == 1 && !__ORBI___unpaid.Pago && __ORBI___last.Cliente == "Ana" && __ORBI___last.Total == 3 && __ORBI___last.Concluidos == 0 && __ORBI___last.Pago);
List<Servico> __ORBI___empty = new List<Servico>();
List<Servico> __ORBI___emptyResult = SelecionarLiberados(__ORBI___empty);
__ORBI___check("lista-vazia-nova", true, __ORBI___emptyResult.Count == 0 && __ORBI___empty.Count == 0 && !object.ReferenceEquals(__ORBI___empty, __ORBI___emptyResult));
Servico __ORBI___deniedFirst = new Servico("Sem pendencia", 2, 2, true);
Servico __ORBI___deniedSecond = new Servico("Sem pagamento", 2, 0, false);
List<Servico> __ORBI___denied = new List<Servico> { __ORBI___deniedFirst, __ORBI___deniedSecond };
List<Servico> __ORBI___deniedResult = SelecionarLiberados(__ORBI___denied);
__ORBI___check("lista-nenhum-liberado", true, __ORBI___deniedResult.Count == 0 && !object.ReferenceEquals(__ORBI___denied, __ORBI___deniedResult) && __ORBI___denied.Count == 2 && object.ReferenceEquals(__ORBI___denied[0], __ORBI___deniedFirst) && object.ReferenceEquals(__ORBI___denied[1], __ORBI___deniedSecond) && __ORBI___deniedFirst.Cliente == "Sem pendencia" && __ORBI___deniedFirst.Total == 2 && __ORBI___deniedFirst.Concluidos == 2 && __ORBI___deniedFirst.Pago && __ORBI___deniedSecond.Cliente == "Sem pagamento" && __ORBI___deniedSecond.Total == 2 && __ORBI___deniedSecond.Concluidos == 0 && !__ORBI___deniedSecond.Pago);
Servico __ORBI___repeat = new Servico("Repetido", 6, 1, true);
Servico __ORBI___blocked = new Servico("Bloqueado", 3, 0, false);
Servico __ORBI___end = new Servico("Fim", 2, 1, true);
List<Servico> __ORBI___duplicates = new List<Servico> { __ORBI___repeat, __ORBI___blocked, __ORBI___repeat, __ORBI___end };
List<Servico> __ORBI___duplicateResult = SelecionarLiberados(__ORBI___duplicates);
__ORBI___check("lista-ocorrencias-repetidas", true, __ORBI___duplicateResult.Count == 3 && object.ReferenceEquals(__ORBI___duplicateResult[0], __ORBI___repeat) && object.ReferenceEquals(__ORBI___duplicateResult[1], __ORBI___repeat) && object.ReferenceEquals(__ORBI___duplicateResult[2], __ORBI___end));
__ORBI___check("lista-repetida-entrada-preservada", true, __ORBI___duplicates.Count == 4 && object.ReferenceEquals(__ORBI___duplicates[0], __ORBI___repeat) && object.ReferenceEquals(__ORBI___duplicates[1], __ORBI___blocked) && object.ReferenceEquals(__ORBI___duplicates[2], __ORBI___repeat) && object.ReferenceEquals(__ORBI___duplicates[3], __ORBI___end) && __ORBI___repeat.Cliente == "Repetido" && __ORBI___repeat.Total == 6 && __ORBI___repeat.Concluidos == 1 && __ORBI___repeat.Pago && __ORBI___blocked.Cliente == "Bloqueado" && __ORBI___blocked.Total == 3 && __ORBI___blocked.Concluidos == 0 && !__ORBI___blocked.Pago && __ORBI___end.Cliente == "Fim" && __ORBI___end.Total == 2 && __ORBI___end.Concluidos == 1 && __ORBI___end.Pago);

'@
        }
    }
    $harness += @'

System.Console.WriteLine("__FINAL__" + __ORBI___executed + "|" + __ORBI___passed);
System.Environment.ExitCode = __ORBI___passed == __COUNT__ ? 0 : 1;

void __ORBI___check(string id, object expected, object actual)
{
    __ORBI___executed++;
    bool passed = object.Equals(expected, actual);
    if (passed) __ORBI___passed++;
    System.Console.WriteLine("__CASE__" + id + "|" + expected + "|" + actual + "|" + (passed ? "PASS" : "FAIL"));
}

bool __ORBI___property(string name, Type type)
{
    var property = typeof(Servico).GetProperty(name);
    return property != null && property.PropertyType == type &&
        property.GetMethod != null && property.GetMethod.IsPublic && !property.GetMethod.IsStatic &&
        property.SetMethod != null && property.SetMethod.IsPublic && !property.SetMethod.IsStatic;
}

bool __ORBI___signature(Delegate method, Type returnType, params Type[] parameterTypes)
{
    var parameters = method.Method.GetParameters();
    if (method.Method.ReturnType != returnType || parameters.Length != parameterTypes.Length) return false;
    for (int i = 0; i < parameters.Length; i++)
    {
        if (parameters[i].ParameterType != parameterTypes[i]) return false;
    }
    return true;
}

'@
    $harness = $harness.Replace('__ORBI__', $prefix).Replace('__CASE__', $caseMarker).Replace('__FINAL__', $finalMarker).Replace('__COUNT__', [string]$expectedCount)
    # Both complete files are copied; only append direct calls in Program.cs.
    [IO.File]::WriteAllText((Join-Path $ownedTempRoot 'Program.cs'), $sourceTexts['Program.cs'] + [Environment]::NewLine + $harness, $utf8)
    [IO.File]::WriteAllText((Join-Path $ownedTempRoot 'Servico.cs'), $sourceTexts['Servico.cs'], $utf8)
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
    Write-Host ('SDK selecionado: ' + $report.sdkVersion + '. Compilando Program.cs e Servico.cs completos...')
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
            $report.message = "$expectedCount de $expectedCount casos reais passaram nesta verificacao local."
            $exitCode = 0
        }
        elseif ($run.TimedOut) {
            $report.status = 'execucao-tempo-esgotado'
            $report.message = 'A execucao excedeu o limite. Procure um laco sem fim; nenhuma aprovacao foi registrada.'
        }
        elseif (!$validCases -or !$report.finalMarkerObserved) {
            $report.status = 'execucao-incompleta'
            $report.message = 'A execucao nao chegou a todas as chamadas e ao marcador final. Imprimir respostas ou terminar antes nao aprova as funcoes.'
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
