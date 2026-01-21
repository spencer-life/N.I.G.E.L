# Load Memory Bank

## Auto-Loaded Context
@MEMORY-BANK.md

## Purpose
Load the current project context, state, and key decisions into chat.

## When to Use
- Starting a new chat session
- After returning to a project
- Before making architectural decisions
- When you need full project context
- Before implementing new features

## What's Included

The Memory Bank contains:
- **Project Identity**: Name, purpose, tech stack
- **Current State**: What's done, in progress, and planned
- **Key Decisions Log**: Why certain choices were made
- **Known Issues**: Bugs, technical debt, blockers
- **Quick Reference**: Commands, env vars, key files

## Next Steps

With the Memory Bank loaded, you can:
- Ask questions about the project
- Request clarification on decisions
- Implement features with full context
- Make informed architectural choices
- Update the Memory Bank when state changes

Use `/update-memory-bank` to sync changes after implementing features.
