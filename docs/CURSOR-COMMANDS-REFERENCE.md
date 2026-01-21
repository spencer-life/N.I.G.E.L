# Cursor IDE Commands & AI Interaction Reference

## Overview
This guide covers all the ways to interact with Cursor's AI, including keyboard shortcuts, @ mentions, slash commands, and custom command patterns for your workflow.

---

## 1. Core Keyboard Shortcuts

### AI Interaction Modes

| Shortcut | Mode | Best Used For |
|----------|------|---------------|
| **`Cmd/Ctrl + K`** | **Inline Edit** | Quick edits to specific lines, adding small blocks of code within current file |
| **`Cmd/Ctrl + L`** | **Chat** | Questions, explanations, architectural advice, research |
| **`Cmd/Ctrl + I`** | **Composer** | Multi-file changes, feature scaffolding, complex buildouts |
| **`Cmd/Ctrl + Shift + L`** | **New Chat** | Start fresh conversation (clears context) |

### Terminal Integration

| Shortcut | Action |
|----------|--------|
| **`Cmd/Ctrl + Enter`** | Generate shell command from natural language in terminal |

### Navigation & Editor

| Shortcut | Action |
|----------|--------|
| **`Cmd/Ctrl + P`** | Quick file open |
| **`Cmd/Ctrl + Shift + P`** | Command palette |
| **`Cmd/Ctrl + B`** | Toggle sidebar |
| **`Cmd/Ctrl + J`** | Toggle terminal |

---

## 2. @ Mentions (Context Injection)

Use `@` to provide specific context to the AI in Chat or Composer mode.

### File & Folder Context

| Mention | Purpose | Example |
|---------|---------|---------|
| **`@Files`** | Reference specific files | `@src/components/Button.tsx` |
| **`@Folders`** | Reference entire folders | `@src/services/` |
| **`@Codebase`** | Search entire project | `@Codebase where is the database schema?` |

### External Context

| Mention | Purpose | Example |
|---------|---------|---------|
| **`@Web`** | Fetch current web info | `@Web latest Material Web Components updates` |
| **`@Docs`** | Reference indexed docs | `@Docs React hooks` |
| **`@Git`** | Git history context | `@Git what changed in last commit?` |

### Documentation References (Project-Specific)

| Mention | Purpose |
|---------|---------|
| **`@docs/MATERIAL-WEB-REFERENCE.md`** | M3 component patterns |
| **`@docs/MCP-SERVER-REFERENCE.md`** | MCP server implementation |
| **`@docs/MEMORY-BANK.md`** | Project context and state |
| **`@docs/BRTD.md`** | Requirements tracking |

---

## 3. Slash Commands (Chat & Composer)

Type `/` in chat or composer to access built-in commands.

| Command | Purpose | Example |
|---------|---------|---------|
| **`/edit`** | Request code modification | `/edit add error handling` |
| **`/fix`** | Debug errors | `/fix TypeError in console` |
| **`/generate`** | Create new files/code | `/generate React component` |
| **`/tests`** | Generate unit tests | `/tests for UserService` |
| **`/doc`** | Add documentation | `/doc explain this function` |

---

## 4. Custom Command Patterns

These are workflow-specific patterns you can use in any Cursor chat. The AI is trained to recognize these based on your global rules.

### Material Web (M3) Commands

#### `Build-M3-Page [name]`
**Purpose:** Scaffold a complete Material 3 page with proper imports and theming.

**What it does:**
- Creates HTML/JSX structure
- Imports necessary `@material/web` components
- Applies Material Design tokens (CSS variables)
- Sets up responsive layout

**Example:**
```
Build-M3-Page dashboard

# Creates a page with:
# - <md-top-app-bar>
# - <md-navigation-drawer>
# - Main content area with M3 components
# - Proper CSS tokens loaded
```

#### `Audit-M3-Styles`
**Purpose:** Check current file for Material Design compliance.

**What it does:**
- Finds hardcoded hex colors → Replace with `--md-sys-color-*` tokens
- Finds standard HTML elements → Suggest `<md-*>` alternatives
- Checks for missing Material Symbols imports

**Example:**
```
Audit-M3-Styles

# Scans current file and suggests:
# ❌ <button> → ✅ <md-filled-button>
# ❌ #6750A4 → ✅ var(--md-sys-color-primary)
```

#### `Generate-M3-Theme [color]`
**Purpose:** Create complete Material 3 theme from a primary color.

**Example:**
```
Generate-M3-Theme #FF5722

# Outputs CSS with full token set:
# --md-sys-color-primary: #FF5722;
# --md-sys-color-on-primary: #FFFFFF;
# --md-sys-color-primary-container: #FFCCBC;
# ... (all M3 color roles)
```

### MCP Server Commands

#### `New-MCP-Server [name] [language]`
**Purpose:** Scaffold a complete MCP server with best practices.

**What it does:**
- Creates project structure
- Installs correct SDK (`@modelcontextprotocol/sdk` or `mcp`)
- Sets up basic tool/resource/prompt handlers
- Configures for Cursor integration

**Example:**
```
New-MCP-Server github-integration typescript

# Creates:
# ├── src/
# │   └── index.ts (with Server, StdioTransport setup)
# ├── package.json (with MCP SDK)
# ├── tsconfig.json
# └── README.md
```

#### `Add-MCP-Tool [name]`
**Purpose:** Add a new tool to existing MCP server.

**Example:**
```
Add-MCP-Tool search_issues

# Adds to current MCP server:
# - ListToolsRequest handler entry
# - CallToolRequest handler logic
# - Proper TypeScript types
# - Input schema with validation
```

#### `Test-MCP-Server`
**Purpose:** Generate test commands for current MCP server.

**What it does:**
- Suggests `mcp-inspector` command
- Creates manual test client code
- Lists all available tools/resources

### Project Setup Commands

#### `Init-Project [type]`
**Purpose:** Initialize a new project with all standards applied.

**Types:**
- `fullstack-web` → M3 frontend + Node.js backend + MCP integration
- `frontend-only` → M3 components + Vite/React
- `mcp-server` → Standalone MCP server project
- `discord-bot` → Discord.js + Supabase pattern (like NIGEL)

**Example:**
```
Init-Project fullstack-web

# Creates:
# ├── docs/ (MEMORY-BANK.md, SOP.md, BRTD.md)
# ├── frontend/ (@material/web setup)
# ├── backend/ (Express + TypeScript)
# ├── mcp/ (MCP server for AI integration)
# └── .cursorrules (project-specific rules)
```

#### `Setup-Docs`
**Purpose:** Create all documentation templates for current project.

**What it does:**
- Creates `docs/MEMORY-BANK.md` from template
- Creates `docs/SOP.md` from template
- Creates `docs/BRTD.md` for requirements
- Creates `docs/TEST-PLAN.md` for testing strategy

### Code Quality Commands

#### `Audit-Dependencies`
**Purpose:** Check for outdated, unused, or vulnerable packages.

**Example:**
```
Audit-Dependencies

# Checks:
# - Unused imports across project
# - Outdated npm packages
# - Security vulnerabilities (npm audit)
# - Duplicate dependencies
```

#### `Optimize-Bundle`
**Purpose:** Analyze and suggest bundle size optimizations.

**Example:**
```
Optimize-Bundle

# Analyzes:
# - Which @material/web components to lazy load
# - Code splitting opportunities
# - Tree-shaking issues
# - Suggests dynamic imports
```

#### `Add-Tests [file]`
**Purpose:** Generate comprehensive tests for a file.

**Example:**
```
Add-Tests src/services/RagService.ts

# Creates:
# - Unit tests for all public methods
# - Mock setup for dependencies
# - Edge case coverage
# - Integration test suggestions
```

### Documentation Commands

#### `Update-Memory-Bank`
**Purpose:** Sync current project state to MEMORY-BANK.md.

**What it does:**
- Updates Section 2 (Current State)
- Updates Section 3 (Key Decisions Log)
- Updates Section 5 (Known Issues)
- Keeps it concise for token efficiency

#### `Generate-API-Docs`
**Purpose:** Create API documentation from code.

**Example:**
```
Generate-API-Docs src/api/

# Creates:
# - OpenAPI/Swagger spec
# - Markdown documentation
# - Example requests/responses
# - Error code reference
```

---

## 5. Terminal AI Integration

### Natural Language to Shell Commands

In any terminal, type natural language and press `Cmd/Ctrl + Enter`.

**Examples:**

```bash
# Type: "install material web components"
# Generates: npm install @material/web

# Type: "find all typescript files modified today"
# Generates: find . -name "*.ts" -mtime 0

# Type: "run dev server on port 3000"
# Generates: npm run dev -- --port 3000
```

### Common Project Commands

| Natural Language | Generated Command |
|------------------|-------------------|
| "start postgres in docker" | `docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres` |
| "test mcp server" | `npx @modelcontextprotocol/inspector node ./build/index.js` |
| "build and watch typescript" | `tsc --watch` |
| "format all code" | `npx prettier --write .` |

---

## 6. Context Management Tips

### When to Use Each Mode

**Inline Edit (`Cmd+K`):**
- ✅ Changing a single function
- ✅ Adding imports
- ✅ Quick styling tweaks
- ❌ Multi-file changes
- ❌ Complex architectural decisions

**Chat (`Cmd+L`):**
- ✅ "How does this work?"
- ✅ "What's the best approach for X?"
- ✅ Research and exploration
- ❌ Immediate code changes (use Composer instead)

**Composer (`Cmd+I`):**
- ✅ Building entire features
- ✅ Multi-file refactoring
- ✅ Scaffolding projects
- ✅ Complex implementations
- ❌ Simple questions (wastes context)

### Providing Effective Context

**Good:**
```
@docs/MATERIAL-WEB-REFERENCE.md @src/components/
Create a Material 3 dialog component that matches our design system
```

**Better:**
```
@docs/MATERIAL-WEB-REFERENCE.md 
@docs/MEMORY-BANK.md
@src/components/

Create a reusable Material 3 dialog component:
- Use <md-dialog> from @material/web
- Apply our CSS tokens for theming
- Accept title, content, and action props
- Match patterns in ButtonComponent.tsx
```

---

## 7. Advanced Patterns

### Multi-Step Workflows

**Pattern:** Break complex tasks into explicit steps.

```
Step 1: Analyze current M3 usage
@Codebase find all Material Web imports

Step 2: Identify missing components
Compare against docs/MATERIAL-WEB-REFERENCE.md

Step 3: Implement upgrades
Update components one at a time with tests
```

### Iterative Refinement

**Pattern:** Build → Test → Refine in tight loops.

```
1. Build-M3-Page login
2. Test-M3-Page (check accessibility, responsiveness)
3. Audit-M3-Styles
4. (Refine based on suggestions)
5. Add-Tests src/pages/Login.tsx
```

### Documentation-First Development

**Pattern:** Use Pre-Coding Workflow from global rules.

```
1. Setup-Docs
2. (AI generates USER-PERSONAS.md, BRTD.md, TEST-PLAN.md)
3. Review and approve
4. Init-Project [type]
5. (AI implements based on requirements)
```

---

## 8. Quick Reference Card

### Most Used Commands

```bash
# Project Setup
Setup-Docs
Init-Project [type]
Update-Memory-Bank

# M3 Development
Build-M3-Page [name]
Generate-M3-Theme [color]
Audit-M3-Styles

# MCP Development
New-MCP-Server [name] [language]
Add-MCP-Tool [name]
Test-MCP-Server

# Code Quality
Add-Tests [file]
Audit-Dependencies
Optimize-Bundle
```

### Essential @ Mentions

```
@docs/MATERIAL-WEB-REFERENCE.md  # M3 patterns
@docs/MCP-SERVER-REFERENCE.md    # MCP patterns
@docs/MEMORY-BANK.md             # Project context
@Codebase                         # Full project search
@Web                              # Current web info
```

### Keyboard Shortcuts to Memorize

```
Cmd/Ctrl + K    → Inline Edit
Cmd/Ctrl + L    → Chat
Cmd/Ctrl + I    → Composer
Cmd/Enter       → Terminal AI
```

---

## 9. Best Practices

### Do's
- ✅ Use `@docs/MEMORY-BANK.md` at start of session for context
- ✅ Use custom commands for repetitive workflows
- ✅ Provide specific file context with `@Files`
- ✅ Break complex tasks into steps
- ✅ Use Composer for multi-file changes

### Don'ts
- ❌ Don't use Chat when you need code changes (use Composer)
- ❌ Don't provide entire codebase as context (be selective)
- ❌ Don't repeat context already in MEMORY-BANK.md
- ❌ Don't use Inline Edit for architectural decisions
- ❌ Don't forget to update docs after major changes

---

## Resources

- **Cursor Documentation**: [https://docs.cursor.com](https://docs.cursor.com)
- **Cursor Discord**: Community support and tips
- **Material Web Reference**: `docs/MATERIAL-WEB-REFERENCE.md`
- **MCP Server Reference**: `docs/MCP-SERVER-REFERENCE.md`
- **Global User Rules**: `GLOBAL-USER-RULES.md`

---

**Last Updated:** January 2026  
**Version:** 1.0  
**Optimized for:** Cursor IDE with Claude 4.5 / Gemini 3
