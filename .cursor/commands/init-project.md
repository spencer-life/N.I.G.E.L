# Initialize Project

## Overview
Set up a new project with all documentation templates, proper structure, and configuration files following our standard practices.

## Project Types

### 1. fullstack-web
**Structure:**
- `frontend/` - Material Web (M3) components
- `backend/` - Node.js/TypeScript API
- `mcp/` - MCP server for AI integrations
- `docs/` - All documentation templates

**Use case:** Complete web applications with AI features

### 2. frontend-only
**Structure:**
- `src/` - M3 components and pages
- `docs/` - Documentation templates

**Use case:** Static sites, SPAs, component libraries

### 3. mcp-server
**Structure:**
- `src/` - MCP server implementation
- `docs/` - Server documentation

**Use case:** Standalone MCP servers for AI tools

### 4. discord-bot
**Structure:**
- `src/` - Commands, interactions, services
- `knowledge/` - RAG knowledge base
- `docs/` - Bot documentation

**Use case:** Discord bots with AI capabilities

## Documentation Templates

### Created Automatically:
1. **`docs/MEMORY-BANK.md`**
   - Project identity and tech stack
   - Current state tracking
   - Key decisions log
   - Known issues
   - Quick reference

2. **`docs/SOP.md`**
   - Standard Operating Procedures
   - Step-by-step implementation history
   - Reproducibility checklist

3. **`docs/BRTD.md`**
   - Business Requirements (with checkboxes)
   - Priority levels (P0, P1, P2, P3)
   - Acceptance criteria

4. **`docs/TEST-PLAN.md`**
   - Test specifications
   - Unit test structure
   - Integration test strategy

5. **`docs/USER-PERSONAS.md`**
   - Target user profiles
   - Needs and pain points
   - User journey maps

## Configuration Files

### Git
- `.gitignore` with sensible defaults
- Git repository initialized

### README
- Project overview
- Tech stack documentation
- Setup instructions
- Development commands

### TODO
- Initial task checklist
- Setup milestones
- Development phases

## Post-Initialization Steps

### 1. Update Documentation
- Fill in `MEMORY-BANK.md` with project specifics
- Define requirements in `BRTD.md`
- Identify target users in `USER-PERSONAS.md`

### 2. Install Dependencies
**Frontend projects:**
```bash
npm install @material/web
```

**MCP projects:**
```bash
npm install @modelcontextprotocol/sdk
```

### 3. Configure Environment
- Create `.env` file
- Set up API keys and secrets
- Configure database connections

### 4. Start Development
- Review TODO.md for next steps
- Follow Pre-Coding Workflow if needed
- Reference global rules in development

## Best Practices
- Always use documentation templates
- Keep MEMORY-BANK.md updated
- Follow naming conventions
- Use consistent folder structure
- Reference MATERIAL-WEB-REFERENCE.md for UI
- Reference MCP-SERVER-REFERENCE.md for servers
- Update SOP.md as you build
