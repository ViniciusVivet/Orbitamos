[CmdletBinding()]
param([string]$OutputPath)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$packageRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if (!$OutputPath) {
    $webRoot = Split-Path (Split-Path (Split-Path $packageRoot -Parent) -Parent) -Parent
    $OutputPath = Join-Path $webRoot 'public/downloads/academy/orbiservicos-objetos-v1.zip'
}
$OutputPath = [IO.Path]::GetFullPath($OutputPath)
[void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($OutputPath))
$paths = @('.gitignore', 'NuGet.Config', 'README.md', 'tools/verificar.ps1')
foreach ($folder in @('01-primeiro-servico', '02-fichas-separadas', '03-copia-emprestada', '04-lista-do-dia')) {
    foreach ($file in @('MISSAO.md', 'OrbiServicos.Console.csproj', 'Program.cs', 'Servico.cs')) {
        $paths += 'tarefas/' + $folder + '/' + $file
    }
}
# Explicit learner-only list: no fixtures, solutions, reports, .git, bin or obj.
Add-Type -AssemblyName System.IO.Compression
$utf8 = New-Object Text.UTF8Encoding($false)
$stream = [IO.File]::Open($OutputPath, [IO.FileMode]::Create, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
$archive = New-Object IO.Compression.ZipArchive($stream, [IO.Compression.ZipArchiveMode]::Create, $false)
try {
    foreach ($relative in ($paths | Sort-Object -CaseSensitive)) {
        $source = Join-Path $packageRoot $relative
        if (!(Test-Path -LiteralPath $source -PathType Leaf)) { throw ('Arquivo esperado nao encontrado: ' + $relative) }
        # Normalize checkout line endings and encoding before writing ZIP bytes.
        $content = [IO.File]::ReadAllText($source).Replace("`r`n", "`n").Replace("`r", "`n").TrimEnd("`n") + "`n"
        $bytes = $utf8.GetBytes($content)
        $entry = $archive.CreateEntry('orbiservicos-objetos-v1/' + $relative, [IO.Compression.CompressionLevel]::Optimal)
        $entry.LastWriteTime = [DateTimeOffset]::new(2026, 11, 16, 0, 0, 0, [TimeSpan]::Zero)
        $entry.ExternalAttributes = 0
        $entryStream = $entry.Open()
        try { $entryStream.Write($bytes, 0, $bytes.Length) }
        finally { $entryStream.Dispose() }
    }
}
finally { $archive.Dispose(); $stream.Dispose() }
$size = (Get-Item -LiteralPath $OutputPath).Length
if ($size -gt 262144) { throw 'Pacote inesperadamente grande: revise antes de distribuir.' }
Write-Host ('ZIP do aluno: ' + $OutputPath)
Write-Host ('Arquivos: ' + $paths.Count + '; bytes: ' + $size)
Write-Host ('SHA256: ' + (Get-FileHash -LiteralPath $OutputPath -Algorithm SHA256).Hash.ToLowerInvariant())
