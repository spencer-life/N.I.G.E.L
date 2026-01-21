@echo off
REM MCP Toolset Setup Script (Windows)
REM 
REM Adds MCP toolset support to any Node.js/TypeScript project
REM Usage: add-mcp-toolset.bat

setlocal enabledelayedexpansion

echo.
echo ============================================
echo    MCP Toolset Setup
echo ============================================
echo.

REM Check if we're in a Node.js project
if not exist "package.json" (
    echo [ERROR] package.json not found
    echo Please run this script from the root of a Node.js project
    exit /b 1
)

echo [1/5] Installing dependencies...
call npm install @langchain/anthropic @langchain/core
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo.
echo [2/5] Creating directories...
if not exist "src\services" mkdir "src\services"
if not exist "templates" mkdir "templates"
if not exist "docs" mkdir "docs"

echo.
echo [3/5] Copying templates...

REM Check if templates exist locally
if exist "templates\McpToolsetService.ts" (
    echo Found local templates, copying...
    copy /Y "templates\McpToolsetService.ts" "src\services\McpToolsetService.ts" >nul
    copy /Y "templates\mcp-toolset-example.ts" "src\services\mcp-toolset-example.ts" >nul
) else (
    echo Downloading from GitHub...
    set GITHUB_BASE=https://raw.githubusercontent.com/YOUR_USERNAME/mcp-toolset-integration/main
    
    echo Downloading McpToolsetService.ts...
    curl -sL "!GITHUB_BASE!/templates/McpToolsetService.ts" -o "src\services\McpToolsetService.ts"
    
    echo Downloading mcp-toolset-example.ts...
    curl -sL "!GITHUB_BASE!/templates/mcp-toolset-example.ts" -o "src\services\mcp-toolset-example.ts"
)

echo.
echo [4/5] Copying documentation...
if exist "docs\MCP-TOOLSET-GUIDE.md" (
    echo MCP-TOOLSET-GUIDE.md already exists, skipping...
) else (
    if exist "docs\MCP-TOOLSET-GUIDE.md" (
        copy /Y "docs\MCP-TOOLSET-GUIDE.md" "docs\MCP-TOOLSET-GUIDE.md" >nul
    ) else (
        curl -sL "!GITHUB_BASE!/docs/MCP-TOOLSET-GUIDE.md" -o "docs\MCP-TOOLSET-GUIDE.md"
    )
)

echo.
echo [5/5] Checking environment variables...
if exist ".env" (
    findstr /C:"ANTHROPIC_API_KEY" .env >nul
    if errorlevel 1 (
        echo [WARNING] ANTHROPIC_API_KEY not found in .env
        echo Add this line to your .env file:
        echo ANTHROPIC_API_KEY=your_api_key_here
        echo.
        echo # Optional MCP server tokens >> .env
        echo # MCP_SERVER_TOKEN=your_token_here >> .env
    ) else (
        echo [OK] ANTHROPIC_API_KEY found in .env
    )
) else (
    echo [WARNING] No .env file found
    echo Creating .env.example...
    (
        echo # Anthropic API Key ^(required^)
        echo ANTHROPIC_API_KEY=your_api_key_here
        echo.
        echo # Optional: MCP Server Tokens
        echo # MCP_CALENDAR_TOKEN=your_calendar_token
        echo # MCP_DATABASE_TOKEN=your_database_token
        echo # MCP_GITHUB_TOKEN=your_github_token
    ) > .env.example
    echo Created .env.example - copy to .env and add your keys
)

echo.
echo ============================================
echo    Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Read the guide: docs\MCP-TOOLSET-GUIDE.md
echo 2. Set up your .env file with ANTHROPIC_API_KEY
echo 3. Check examples: src\services\mcp-toolset-example.ts
echo 4. Start using: import { McpToolsetService } from './services/McpToolsetService'
echo.
echo Quick start:
echo   const service = new McpToolsetService^(^);
echo   service.addServer^('https://api.example.com/sse', 'example', token^);
echo   const response = await service.query^('Your question'^);
echo.
echo Happy coding!
echo.

endlocal
