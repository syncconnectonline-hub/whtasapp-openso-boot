@echo off
setlocal
cd /d "%~dp0"

set "NODE_EXE=node"
where node >nul 2>nul
if errorlevel 1 set "NODE_EXE=C:\Program Files\WindowsApps\OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt\dependencies\node\bin\node.exe"
if "%NODE_EXE%"=="node" (where node >nul 2>nul) else (if not exist "%NODE_EXE%" goto missing_node)
if errorlevel 1 goto missing_node

if not exist "node_modules\@whiskeysockets\baileys\package.json" (
  where npm >nul 2>nul
  if errorlevel 1 (
    echo No se encontro npm. Reinstala Node.js 20 o superior con npm incluido.
    pause
    exit /b 1
  )
  call npm install
  if errorlevel 1 (
    echo No se pudieron instalar las dependencias. Revisa tu conexion a Internet.
    pause
    exit /b 1
  )
)

start "WhatsApp CRM" /D "%~dp0" cmd /k ""%NODE_EXE%" app.js"
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:3008/"
endlocal
exit /b 0

:missing_node
echo No se encontro Node.js. Instala Node.js 20 o superior y vuelve a abrir este archivo.
pause
exit /b 1
