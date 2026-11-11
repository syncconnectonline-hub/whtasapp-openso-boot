$ErrorActionPreference = 'Stop'
$runtime = Join-Path $PSScriptRoot 'runtime\node-v24.22.2-win-x64'
$node = Join-Path $runtime 'node.exe'
$envFile = Join-Path $PSScriptRoot '.env'

if (-not (Test-Path -LiteralPath $envFile)) {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot '.env.example') -Destination $envFile
}

Set-Location $PSScriptRoot
Write-Host 'Al abrirse el panel, pega tu clave de OpenAI en el campo de configuración. La clave se guarda localmente.'
& $node --env-file=.env src/server.js
