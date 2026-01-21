@echo off
REM Create a new MCP server (Windows version)

setlocal

set SERVER_NAME=%1
set LANGUAGE=%2

if "%SERVER_NAME%"=="" (
    echo Error: Server name required
    echo Usage: new-mcp-server.bat ^<server-name^> [language]
    echo Languages: typescript, python
    exit /b 1
)

if "%LANGUAGE%"=="" set LANGUAGE=typescript

echo Creating MCP server: %SERVER_NAME%
echo Language: %LANGUAGE%

mkdir "%SERVER_NAME%" 2>nul
cd "%SERVER_NAME%"

if "%LANGUAGE%"=="typescript" (
    echo Setting up TypeScript MCP server...
    
    REM Create package.json
    (
echo {
echo   "name": "%SERVER_NAME%",
echo   "version": "1.0.0",
echo   "type": "module",
echo   "main": "build/index.js",
echo   "scripts": {
echo     "build": "tsc",
echo     "watch": "tsc --watch"
echo   },
echo   "dependencies": {
echo     "@modelcontextprotocol/sdk": "^1.0.0"
echo   },
echo   "devDependencies": {
echo     "@types/node": "^20.0.0",
echo     "typescript": "^5.3.0"
echo   }
echo }
    ) > package.json
    
    echo TypeScript server created
    echo.
    echo Next steps:
    echo    cd %SERVER_NAME%
    echo    npm install
    echo    npm run build
    
) else (
    echo Setting up Python MCP server...
    echo mcp^>=1.0.0 > requirements.txt
    
    echo Python server created
    echo.
    echo Next steps:
    echo    cd %SERVER_NAME%
    echo    pip install -r requirements.txt
)

echo.
echo Reference: docs/MCP-SERVER-REFERENCE.md

endlocal
