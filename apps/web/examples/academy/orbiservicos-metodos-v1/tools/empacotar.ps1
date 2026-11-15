[CmdletBinding()]
param([string]$OutputPath)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$packageRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if (!$OutputPath) {
    $webRoot = Split-Path (Split-Path (Split-Path $packageRoot -Parent) -Parent) -Parent
    $OutputPath = Join-Path $webRoot 'public/downloads/academy/orbiservicos-metodos-v1.zip'
}
$OutputPath = [IO.Path]::GetFullPath($OutputPath)
[void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($OutputPath))

# Explicit learner-file allowlist. Editorial fixtures, solutions, reports,
# packing/validation tools, bin, obj and .git never enter the distributable.
$relativePaths = @('.gitignore', 'NuGet.Config', 'README.md', 'tools/verificar.ps1')
foreach ($folder in @('01-primeira-regra', '02-tres-clientes', '03-investigue-o-bug', '04-painel-independente')) {
    foreach ($file in @('MISSAO.md', 'OrbiServicos.Console.csproj', 'Program.cs')) {
        $relativePaths += 'tarefas/' + $folder + '/' + $file
    }
}
Add-Type -AssemblyName System.IO.Compression
$stream = [IO.File]::Open($OutputPath, [IO.FileMode]::Create, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
$archive = New-Object IO.Compression.ZipArchive($stream, [IO.Compression.ZipArchiveMode]::Create, $false)
try {
    foreach ($relative in ($relativePaths | Sort-Object -CaseSensitive)) {
        $source = Join-Path $packageRoot $relative
        if (!(Test-Path -LiteralPath $source -PathType Leaf)) { throw ('Arquivo esperado nao encontrado: ' + $relative) }
        $entry = $archive.CreateEntry('orbiservicos-metodos-v1/' + $relative, [IO.Compression.CompressionLevel]::Optimal)
        $entry.LastWriteTime = [DateTimeOffset]::new(2026, 11, 15, 0, 0, 0, [TimeSpan]::Zero)
        $entry.ExternalAttributes = 0
        $entryStream = $entry.Open()
        $sourceStream = [IO.File]::OpenRead($source)
        try { $sourceStream.CopyTo($entryStream) }
        finally { $sourceStream.Dispose(); $entryStream.Dispose() }
    }
}
finally { $archive.Dispose(); $stream.Dispose() }
$size = (Get-Item -LiteralPath $OutputPath).Length
if ($size -gt 262144) { throw 'Pacote inesperadamente grande: revise o conteudo antes de distribuir.' }
Write-Host ('ZIP do aluno: ' + $OutputPath)
Write-Host ('Arquivos: ' + $relativePaths.Count + '; bytes: ' + $size)
Write-Host ('SHA256: ' + (Get-FileHash -LiteralPath $OutputPath -Algorithm SHA256).Hash.ToLowerInvariant())
