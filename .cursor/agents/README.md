---
name: README
model: fast
---

# NIGEL Subagents

This directory contains specialized AI subagents for the NIGEL project. Each subagent operates in its own context window and handles specific types of work.

## Available Subagents

### Orchestration & Planning
- **orchestrator.md** - Coordinates complex workflows, delegates to specialists
- **planner.md** - Creates technical plans with dependencies and steps
- **debugger.md** - Root cause analysis and systematic debugging

### Phase 1: Core (High Impact)
- **verifier.md** - Validates completed work is functional
- **memory-bank-updater.md** - Auto-updates MEMORY-BANK.md
- **test-runner.md** - Proactively runs and fixes tests

### Phase 2: Domain Specialists
- **discord-specialist.md** - Discord.js patterns and commands
- **rag-specialist.md** - RAG system and vector search

### Phase 3: Production Support
- **deployment-guardian.md** - Pre-flight checks and deployment
- **doc-auditor.md** - Documentation consistency

## Usage

### Automatic Delegation
Agent will proactively delegate based on task type.

### Explicit Invocation
Use `/name` syntax:
```
/verifier confirm drill command works
/discord-specialist create new command
/rag-specialist test similarity search
```

### Parallel Execution
Mention multiple tasks to run subagents in parallel:
```
Verify the drill command and check documentation
```

## Documentation

See `docs/SUBAGENTS-REFERENCE.md` for complete guide.

## Requirements

- Cursor must be on **Nightly** release channel
- Settings → Beta → Update Channel → Nightly
