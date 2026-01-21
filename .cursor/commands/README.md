# Cursor Custom Commands

This directory contains custom commands that can be triggered in Cursor chat by typing `/` followed by the command name.

## Available Commands

### Project Initialization Prompts
**Comprehensive prompts that auto-load context for starting new projects**

- `/prompt-new-discord-bot` - Complete Discord bot setup with NIGEL patterns (loads MEMORY-BANK, schema, code patterns)
- `/prompt-rag-system` - RAG implementation guide (loads RagService, ingestion scripts, knowledge structure)
- `/prompt-railway-deploy` - Railway deployment checklist (loads DEPLOYMENT.md, railway.json, env vars)
- `/prompt-testing-strategy` - Testing setup and patterns (loads test files, configuration, mocking strategies)

### Documentation Quick-Loaders
**Instantly inject key documentation into chat context**

- `/load-memory-bank` - Load current project context and state
- `/load-claude-practices` - Load Claude API optimization guide
- `/load-global-rules` - Load universal coding standards and workflows
- `/load-deployment-guide` - Load Railway deployment documentation

### Knowledge Base Loaders
**Load specific knowledge files for RAG system or training content**

- `/load-knowledge-rapport` - Load rapport-building framework
- `/load-knowledge-authority` - Load authority and influence principles
- `/load-knowledge-elicitation` - Load information-gathering techniques
- `/load-knowledge-fate` - Load FATE (Focus, Assess, Target, Execute) framework

### Utility Commands
**Practical guides for testing, ingestion, and health monitoring**

- `/test-discord-locally` - Local Discord bot testing checklist (env vars, database, commands)
- `/ingest-knowledge-guide` - Step-by-step knowledge ingestion for RAG system
- `/check-rag-health` - RAG system health check (chunks, embeddings, search performance)

### Material Web (M3) Commands
**Frontend development with Material Design 3**

- `/build-m3-page` - Scaffold a complete Material 3 page with proper imports and theming
- `/audit-m3-styles` - Review file for M3 compliance and suggest improvements
- `/generate-m3-theme` - Create full M3 theme from a primary color

### MCP Server Commands
**Model Context Protocol server development**

- `/new-mcp-server` - Scaffold a complete MCP server with best practices
- `/add-mcp-tool` - Add a new tool to existing MCP server

### Project Management Commands
**Documentation and project setup**

- `/init-project` - Initialize new project with all documentation templates
- `/update-memory-bank` - Sync current project state to MEMORY-BANK.md

## How to Use

1. Open Cursor chat (`Cmd/Ctrl + L`)
2. Type `/` to see available commands
3. Select a command or continue typing to filter
4. Add parameters after the command name if needed

**Examples:**

```
/prompt-new-discord-bot for a customer support bot with ticketing system
```

```
/load-memory-bank
# Then ask questions about the project
```

```
/load-knowledge-rapport then explain how to build rapport in sales conversations
```

```
/test-discord-locally
# Get comprehensive testing checklist
```

```
/build-m3-page dashboard with top app bar and navigation
```

```
/generate-m3-theme #FF5722
```

```
/new-mcp-server github-tools using TypeScript
```

## Command Structure

Commands are Markdown files that provide:
- **Overview**: What the command does
- **Steps**: How to execute the task
- **Checklists**: Items to complete
- **Best Practices**: Guidelines to follow
- **Examples**: Code snippets and patterns

## Creating New Commands

1. Create a new `.md` file in this directory
2. Use descriptive kebab-case naming (e.g., `setup-testing.md`)
3. Structure with Overview, Steps, and Examples
4. Command will automatically appear in `/` menu

**Template:**
```markdown
# Command Name

## Overview
Brief description of what this command does.

## Steps
1. First step
2. Second step
3. Third step

## Checklist
- [ ] Item 1
- [ ] Item 2

## Examples
Code examples or usage patterns
```

## Parameters

You can add context after the command:
```
/build-m3-page login page with email and password fields
```

Everything after the command name is included in the AI prompt.

## Reference Documentation

These commands reference:
- `docs/MATERIAL-WEB-REFERENCE.md` - M3 component patterns
- `docs/MCP-SERVER-REFERENCE.md` - MCP implementation guide
- `docs/CURSOR-COMMANDS-REFERENCE.md` - Full command documentation
- `GLOBAL-USER-RULES.md` - Project standards

## Team Commands

For team-wide standardization:
1. Go to [Cursor Dashboard](https://cursor.com/dashboard?tab=team-content&section=commands)
2. Create team commands (Team/Enterprise plans)
3. Commands automatically sync to all team members

## Tips

- Use commands for repetitive workflows
- Combine with `@` mentions for context: `/build-m3-page @docs/MATERIAL-WEB-REFERENCE.md`
- Chain multiple commands in conversation
- Commands follow your global rules automatically

---

**Note:** Commands are in beta and syntax may evolve. Check [Cursor Docs](https://cursor.com/docs/context/commands) for updates.
