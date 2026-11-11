$ErrorActionPreference = 'Stop'
$project = Join-Path $PSScriptRoot 'flutter_app'
$flutterCommand = Get-Command flutter -ErrorAction SilentlyContinue
if ($flutterCommand) {
    $flutter = $flutterCommand.Source
} else {
    $flutter = Join-Path $env:USERPROFILE 'develop\flutter\bin\flutter.bat'
}
if (-not (Test-Path -LiteralPath $flutter)) {
    throw 'No encuentro Flutter. Instala el SDK estable desde https://docs.flutter.dev/install/manual y vuelve a ejecutar este archivo.'
}
Push-Location $project
try {
    & $flutter pub get
    if ($LASTEXITCODE -ne 0) { throw 'flutter pub get no pudo resolver las dependencias.' }
    & $flutter build web --release --base-href=/
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo compilar Flutter Web.' }
} finally {
    Pop-Location
}
Write-Host 'Flutter Web compilado. Reinicia el bot y abre http://127.0.0.1:3030.'
