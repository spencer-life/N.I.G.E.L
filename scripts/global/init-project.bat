@echo off
REM Initialize a new project with all standard documentation (Windows version)

setlocal

set PROJECT_NAME=%1
set PROJECT_TYPE=%2

if "%PROJECT_NAME%"=="" (
    echo Error: Project name required
    echo Usage: init-project.bat ^<project-name^> [type]
    echo Types: fullstack-web, frontend-only, mcp-server, discord-bot
    exit /b 1
)

if "%PROJECT_TYPE%"=="" set PROJECT_TYPE=fullstack-web

echo Initializing project: %PROJECT_NAME%
echo Type: %PROJECT_TYPE%

REM Create project directory
mkdir "%PROJECT_NAME%" 2>nul
cd "%PROJECT_NAME%"

REM Create docs folder
mkdir docs 2>nul
echo Creating documentation templates...

REM Note: In production, you'd copy from template files
REM For now, creating basic templates

echo # %PROJECT_NAME% > README.md
echo. >> README.md
echo ## Documentation >> README.md
echo - docs/MEMORY-BANK.md >> README.md
echo - docs/SOP.md >> README.md

REM Create .gitignore
(
echo node_modules/
echo dist/
echo build/
echo .env
echo .DS_Store
echo *.log
) > .gitignore

echo.
echo Project initialized successfully!
echo.
echo Next steps:
echo    cd %PROJECT_NAME%
echo    # Add your project files
echo.

endlocal
