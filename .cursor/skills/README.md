# Cursor Skills

This directory contains Agent Skills following the [Agent Skills standard](https://agentskills.io).

## Skills vs Subagents

**Skills** are single-purpose, quick prompts that extend Agent's capabilities:
- Format: `SKILL.md` file in skill folder
- Use: Quick, repeatable actions
- Scope: Single-shot operations
- Example: Generate changelog, format code, create component

**Subagents** are specialized AI assistants with their own context:
- Format: `.md` file in `.cursor/agents/`
- Use: Complex, multi-step workflows
- Scope: Long-running investigations
- Example: Debug complex issue, orchestrate feature implementation

## When to Use Which

| Use Skill When... | Use Subagent When... |
|-------------------|----------------------|
| Single-purpose task | Multi-step workflow |
| Quick generation | Investigation needed |
| No context isolation needed | Long research required |
| Repeatable template | Specialized expertise |

## Available Skills

See individual skill folders for details.

## Installing Skills from GitHub

1. Open Cursor Settings → Rules
2. Click "Add Rule" in Project Rules
3. Select "Remote Rule (Github)"
4. Enter GitHub repository URL

## Creating Custom Skills

Each skill is a folder containing `SKILL.md`:

```
.cursor/skills/
└── my-skill/
    └── SKILL.md
```

Format:
```markdown
---
name: my-skill
description: Short description of what this skill does
---

# My Skill

Detailed instructions for Agent...
```

See [agentskills.io](https://agentskills.io) for complete specification.
