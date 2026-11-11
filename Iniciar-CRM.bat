@echo off
setlocal
cd /d "%~dp0"
set "NODE_EXE=%~dp0runtime\node-v24.22.2-win-x64\node.exe"
if not exist "%NODE_EXE%" (
  set "NODE_EXE=node"
  where node >nul 2>nul
  if errorlevel 1 set "NODE_EXE=C:\Program Files\WindowsApps\OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt\dependencies\node\bin\node.exe"
)
if not exist ".env" copy ".env.example" ".env" >nul
if not exist "node_modules\@whiskeysockets\baileys\package.json" (
  where npm >nul 2>nul
  if errorlevel 1 (
    echo No se encontro npm. Revisa la instalacion local de Node.js.
    pause
    exit /b 1
  )
  call npm ci
  if errorlevel 1 (
    echo No se pudieron instalar las dependencias.
    pause
    exit /b 1
  )
)
start "Sync Connect WhatsApp" /D "%~dp0" cmd /k ""%NODE_EXE%" --env-file="%~dp0.env" "%~dp0src\server.js""
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:3030/"
endlocal
