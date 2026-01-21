# Global Utility Scripts

These scripts accelerate project setup and development across all your projects.

## Available Scripts

### 1. `init-project.sh` / `init-project.bat`
Initialize a new project with all documentation templates.

**Usage:**
```bash
# macOS/Linux
./init-project.sh my-project fullstack-web

# Windows
init-project.bat my-project fullstack-web
```

**Project Types:**
- `fullstack-web` - Frontend (M3) + Backend (Node.js) + MCP integration
- `frontend-only` - M3 components + modern bundler
- `mcp-server` - Standalone MCP server
- `discord-bot` - Discord.js pattern (like NIGEL)

**What it creates:**
- `docs/` folder with all templates (MEMORY-BANK, SOP, BRTD, TEST-PLAN, USER-PERSONAS)
- `.gitignore` with sensible defaults
- `README.md` with project structure
- `TODO.md` for task tracking
- Project-specific folder structure

---

### 2. `scaffold-m3-component.js`
Scaffold Material Web (M3) components with proper imports and patterns.

**Usage:**
```bash
node scaffold-m3-component.js ButtonPrimary button
node scaffold-m3-component.js LoginForm textfield
node scaffold-m3-component.js ConfirmDialog dialog
```

**Component Types:**
- `button` - Filled/Outlined button wrapper
- `textfield` - Outlined text field with validation
- `dialog` - Dialog with confirm/cancel actions
- `card` - Card with elevation and M3 tokens
- `list` - List with list items
- `generic` - Basic template for custom components

**What it creates:**
- `ComponentName.tsx` - React component with M3 imports
- `ComponentName.css` - Styles using Material Design tokens
- TypeScript interfaces for props
- Best practice patterns

---

### 3. `new-mcp-server.sh` / `new-mcp-server.bat`
Create a new MCP server with TypeScript or Python.

**Usage:**
```bash
# macOS/Linux
./new-mcp-server.sh github-tools typescript

# Windows
new-mcp-server.bat github-tools typescript
```

**Languages:**
- `typescript` - Uses `@modelcontextprotocol/sdk`
- `python` - Uses `mcp` (FastMCP)

**What it creates:**
- Complete MCP server structure
- Example tool implementation
- Example resource implementation
- README with setup instructions
- Configuration files (package.json/requirements.txt)
- TypeScript configuration (if applicable)

---

## Installation

### Option 1: Global Installation (Recommended)

Add these scripts to your PATH so they're available everywhere:

**macOS/Linux:**
```bash
# Add to ~/.zshrc or ~/.bashrc
export PATH="$HOME/path/to/N.I.G.E.L/scripts/global:$PATH"

# Reload shell
source ~/.zshrc  # or source ~/.bashrc
```

**Windows:**
1. Right-click "This PC" → Properties
2. Advanced System Settings → Environment Variables
3. Edit "Path" under User variables
4. Add: `C:\Users\MLPC\.cursor\N.I.G.E.L\scripts\global`
5. Restart terminal

### Option 2: Local Usage

Run directly from the scripts directory:
```bash
cd /path/to/N.I.G.E.L/scripts/global
./init-project.sh my-project fullstack-web
```

---

## Windows Compatibility

For Windows users, use the `.bat` versions of shell scripts:
- `init-project.bat` instead of `init-project.sh`
- `new-mcp-server.bat` instead of `new-mcp-server.sh`

Node.js scripts (`.js`) work the same on all platforms:
```bash
node scaffold-m3-component.js ComponentName type
```

---

## Examples

### Starting a New Full-Stack Project
```bash
# Initialize project
./init-project.sh my-app fullstack-web
cd my-app

# Install dependencies
npm install @material/web
npm install @modelcontextprotocol/sdk

# Create an M3 component
node ../scripts/global/scaffold-m3-component.js LoginButton button

# Create an MCP server
cd mcp
../../scripts/global/new-mcp-server.sh api-tools typescript
```

### Creating a Material Web Component Library
```bash
# Initialize frontend-only project
./init-project.sh my-components frontend-only
cd my-components

# Scaffold multiple components
node ../scripts/global/scaffold-m3-component.js PrimaryButton button
node ../scripts/global/scaffold-m3-component.js SearchField textfield
node ../scripts/global/scaffold-m3-component.js ConfirmDialog dialog
node ../scripts/global/scaffold-m3-component.js UserCard card
```

### Building an MCP Server
```bash
# Create standalone MCP server
./new-mcp-server.sh database-tools typescript
cd database-tools

npm install
npm run build
npm run inspector  # Test your server
```

---

## Integration with Cursor

Once you've created projects or components with these scripts, reference them in Cursor:

**In Chat/Composer:**
```
@docs/MATERIAL-WEB-REFERENCE.md
Create a dashboard using the components in src/components/
```

**Custom Commands:**
```
Build-M3-Page dashboard
# AI will use these scripts as reference patterns

New-MCP-Server api-integration typescript
# AI will follow the structure these scripts create
```

---

## Tips

1. **Always use templates**: These scripts create consistent structures across projects
2. **Update templates**: Modify template files in `docs/` to customize defaults
3. **Version control**: Commit these scripts to your global setup repository
4. **Share with team**: Team members can use same scripts for consistency

---

## Troubleshooting

### Script not found
- Ensure scripts are executable: `chmod +x *.sh` (macOS/Linux)
- Use full path if not in PATH: `/full/path/to/init-project.sh`

### Permission denied
```bash
chmod +x scripts/global/*.sh  # Make executable
```

### Node not found
- Ensure Node.js is installed: `node --version`
- Install from: https://nodejs.org

### Template files not found
- Run scripts from correct directory
- Ensure `docs/` folder exists with templates
- Update `GLOBAL_DOCS` path in scripts if needed

---

## Reference Documentation

- **Cursor Commands**: `docs/CURSOR-COMMANDS-REFERENCE.md`
- **Material Web**: `docs/MATERIAL-WEB-REFERENCE.md`
- **MCP Servers**: `docs/MCP-SERVER-REFERENCE.md`
- **Global Rules**: `GLOBAL-USER-RULES.md`

---

**Last Updated:** January 2026  
**Compatible with:** macOS, Linux, Windows (PowerShell/Git Bash)
