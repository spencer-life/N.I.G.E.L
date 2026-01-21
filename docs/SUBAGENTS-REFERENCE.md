# Cursor Subagents Reference Guide

## Overview

Subagents are specialized AI assistants that operate in their own context windows, handling specific types of work independently. They complement custom commands by providing context isolation, parallel execution, and specialized expertise.

**Key Benefits:**
- **Context Isolation**: Long research/debugging doesn't bloat main conversation
- **Parallel Execution**: Multiple subagents work simultaneously
- **Specialized Expertise**: Domain-specific prompts and patterns
- **Automatic Delegation**: Agent proactively routes tasks to specialists
- **Token Optimization**: 30-40% reduction in main conversation tokens

---

## Prerequisites

### Nightly Release Channel Required

Subagents are **only available in Cursor Nightly**.

**Setup Steps:**
1. Open Cursor Settings: `Cmd+Shift+J` (Mac) or `Ctrl+Shift+J` (Windows)
2. Navigate to **Beta** section
3. Set **Update Channel** to **Nightly**
4. Click **Check for Updates**
5. **Restart Cursor** after update completes

**Verification:**
- Subagents will be automatically detected from `.cursor/agents/` directory
- Agent will start delegating tasks based on subagent descriptions

---

## File Locations

### Project-Level Subagents
**Location**: `.cursor/agents/`
**Scope**: Only available in current project
**Use case**: Project-specific specialists (Discord bot, RAG system, etc.)

### User-Level Subagents
**Location**: `~/.cursor/agents/` (your home directory)
**Scope**: Available across ALL projects
**Use case**: General-purpose specialists (Verifier, Memory Bank Updater, Doc Auditor)

**Priority**: Project-level subagents override user-level if same name exists.

---

## Available Subagents (NIGEL Project)

### Phase 1: Core Subagents (High Impact)

#### 1. Verifier
**File**: `.cursor/agents/verifier.md`

**Purpose**: Validates that claimed work is actually complete and functional.

**When to Use**:
- After implementing features
- Before marking todos complete
- When debugging claims "it's fixed"
- After deployment preparation

**Invocation**:
```
/verifier confirm the drill command works end-to-end
/verifier check if authority metrics are fully implemented
```

**Key Behaviors**:
- Actually runs tests (doesn't just check they exist)
- Verifies implementations match requirements
- Reports what passed vs what's incomplete
- Skeptical validator mindset

---

#### 2. Memory Bank Updater
**File**: `.cursor/agents/memory-bank-updater.md`

**Purpose**: Keeps MEMORY-BANK.md synchronized with project state automatically.

**When to Use** (automatic):
- After implementing features
- After architectural decisions
- When discovering bugs
- After dependency changes

**Invocation**:
```
/memory-bank-updater update current state
```

**Background Mode**: Runs in background by default, doesn't block workflow.

**Key Behaviors**:
- Concise updates (token optimization)
- Updates Section 2 (Current State) and Section 7 (Decisions)
- Maintains consistency with README.md and TODO.md
- Preserves under 2000 tokens for caching

---

#### 3. Test Runner
**File**: `.cursor/agents/test-runner.md`

**Purpose**: Proactively runs tests and fixes failures.

**When to Use**:
- After code changes
- During TDD workflow
- Before deployment
- When debugging test failures

**Invocation**:
```
/test-runner run all tests
/test-runner fix failing drill tests
```

**Key Behaviors**:
- Automatically detects which tests to run
- Analyzes root causes (not symptoms)
- Fixes issues while preserving test intent
- Reports coverage gaps

---

### Phase 2: Domain Specialists

#### 4. Discord Specialist
**File**: `.cursor/agents/discord-specialist.md`

**Purpose**: Expert in discord.js patterns, slash commands, and interaction handlers.

**When to Use**:
- Creating new commands in `src/commands/`
- Building interaction handlers in `src/interactions/`
- Debugging Discord API issues
- Implementing Discord UI components

**Invocation**:
```
/discord-specialist create a new /practice command
/discord-specialist debug button interaction timeout
```

**Key Knowledge**:
- SlashCommandBuilder patterns
- Interaction collectors and timeouts
- Ephemeral responses
- NIGEL voice guidelines

---

#### 5. RAG Specialist
**File**: `.cursor/agents/rag-specialist.md`

**Purpose**: Expert in RAG systems, knowledge ingestion, vector search, and Claude 4.5 optimization.

**When to Use**:
- Running `scripts/ingest-knowledge.ts`
- Debugging vector search issues
- Optimizing chunk quality
- Testing similarity thresholds
- Claude API cost optimization

**Invocation**:
```
/rag-specialist ingest new knowledge files
/rag-specialist test similarity search for "rapport building"
/rag-specialist optimize chunk quality
```

**Key Knowledge**:
- Gemini embeddings (768-dimensional)
- Chunking strategies (400-600 tokens)
- pgvector cosine similarity
- Claude 4.5 hybrid routing (Haiku/Sonnet)

---

### Phase 3: Production Support

#### 6. Deployment Guardian
**File**: `.cursor/agents/deployment-guardian.md`

**Purpose**: Pre-flight checks and deployment validation specialist.

**When to Use**:
- Before deploying to Railway
- After deployment (health checks)
- Investigating production issues
- Environment variable validation

**Invocation**:
```
/deployment-guardian run pre-flight checks
/deployment-guardian validate environment variables
/deployment-guardian investigate production error
```

**Key Knowledge**:
- Pre-flight checklist from DEPLOYMENT.md
- Railway CLI commands
- Log analysis patterns
- Rollback procedures

---

#### 7. Documentation Auditor
**File**: `.cursor/agents/doc-auditor.md`

**Purpose**: Ensures consistency across all documentation.

**When to Use**:
- After major features
- Before releases
- When onboarding new collaborators
- Periodic documentation health checks

**Invocation**:
```
/doc-auditor audit all documentation
/doc-auditor check consistency between MEMORY-BANK and README
```

**Key Checks**:
- MEMORY-BANK.md reflects current state
- README.md aligns with implementation
- TODO.md checkboxes accurate
- No broken references or outdated examples

---

## Usage Patterns

### Automatic Delegation

Agent will proactively delegate when it detects certain keywords or patterns:

**Triggers**:
- "Verify this works" → Verifier subagent
- "Add a new Discord command" → Discord specialist
- "Test the RAG system" → RAG specialist
- "Ready to deploy" → Deployment guardian
- "Check documentation" → Doc auditor

**How it works**:
- Agent reads subagent `description` fields
- Matches task to best subagent
- Delegates with relevant context
- Receives result and continues

---

### Explicit Invocation

Use `/name` syntax in chat to invoke specific subagent:

```
/verifier confirm the drill command works end-to-end
/discord-specialist create a new /practice command
/rag-specialist test similarity search for "rapport building"
/deployment-guardian validate environment variables
/doc-auditor audit all documentation
```

**Natural Language Alternative**:
```
Use the verifier subagent to confirm the drill command works
Have the discord-specialist create a new practice command
Run the rag-specialist on similarity search testing
```

---

### Parallel Execution

Launch multiple subagents simultaneously by mentioning multiple tasks:

```
Verify the drill command works and check if Memory Bank is up to date
```

Agent sends multiple Task tool calls, so subagents run in parallel.

**Benefits**:
- Faster completion (work happens concurrently)
- Separate contexts (no interference)
- Parallel reporting (consolidated results)

---

### Background Execution

For long-running tasks, subagents can run in background:

```
/rag-specialist run full knowledge ingestion in background
```

**Behavior**:
- Subagent works independently
- Writes state to `~/.cursor/subagents/`
- Main conversation continues immediately
- Check results later

**When to use**:
- Long ingestion operations
- Comprehensive test suites
- Deep code audits
- Batch processing

---

### Resuming Subagents

Each subagent execution returns an agent ID. Resume with:

```
Resume agent abc123 and analyze the remaining test failures
```

**Use cases**:
- Continue previous conversation
- Add more context to investigation
- Refine previous analysis

---

## Integration with Existing Workflows

### Planning Protocol

**Before subagents**:
- Main Agent creates plan
- User reviews and approves
- Main Agent implements

**With subagents**:
- Main Agent creates plan
- **Verifier subagent** independently validates plan completeness
- Main Agent asks for approval only after Verifier confirms
- Higher quality plans, fewer missing requirements

---

### Two-Chat Workflow (Planner vs Builder)

**Planning Chat**:
- Main Agent creates requirements and architecture
- **Doc Auditor subagent** validates consistency
- **Memory Bank Updater** creates initial context

**Builder Chat**:
- Main Agent implements features
- **Test Runner subagent** continuously validates
- **Verifier subagent** confirms completion
- **Memory Bank Updater** keeps docs current (background)

---

### Memory Bank Protocol

**Before subagents** (manual):
- Implement feature
- Remember to update MEMORY-BANK.md
- Check for consistency
- Often forgotten or delayed

**With subagents** (automatic):
- Implement feature
- **Memory Bank Updater** runs in background
- Updates happen automatically after each feature
- Ensures 40-60% token savings through consistent caching

---

## Subagent File Format

Each subagent is a Markdown file with YAML frontmatter:

```markdown
---
name: subagent-name
description: When to use this subagent (Agent reads this for delegation)
model: inherit  # Options: inherit, fast, or specific model ID
readonly: false  # Set true to restrict write permissions
is_background: false  # Set true for long-running tasks
---

You are a [ROLE] specializing in [DOMAIN].

When invoked:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Report findings:
- [Format]
- [Structure]

Key files to reference:
- [File paths]
```

### Configuration Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Unique identifier (defaults to filename without extension) |
| `description` | No | When to use (Agent reads for delegation decisions) |
| `model` | No | Model to use: `fast`, `inherit`, or specific ID (default: `inherit`) |
| `readonly` | No | If `true`, restricts write permissions (default: `false`) |
| `is_background` | No | If `true`, runs without blocking (default: `false`) |

### Model Options

- **`inherit`**: Use same model as main Agent
- **`fast`**: Use cheaper/faster model (e.g., Haiku)
- **Specific ID**: Use exact model (e.g., `claude-sonnet-4-5-20250929`)

---

## Creating Custom Subagents

### Option 1: Ask Agent to Create

```
Create a subagent file at .cursor/agents/custom-specialist.md 
with YAML frontmatter (name, description, model: fast) followed by 
the prompt. The custom-specialist should [describe purpose and behaviors].
```

Agent will generate the complete subagent file.

---

### Option 2: Manual Creation

1. Create file: `.cursor/agents/my-specialist.md`
2. Add YAML frontmatter
3. Write specialized prompt
4. Save and restart Cursor (or just start using)

**Example**:

```markdown
---
name: security-auditor
description: Security specialist. Use when implementing auth, payments, or handling sensitive data.
model: inherit
---

You are a security expert auditing code for vulnerabilities.

When invoked:
1. Identify security-sensitive code paths
2. Check for common vulnerabilities (injection, XSS, auth bypass)
3. Verify secrets are not hardcoded
4. Review input validation

Report findings by severity:
- Critical (must fix before deploy)
- High (fix soon)
- Medium (address when possible)
```

---

## Best Practices

### Writing Effective Subagents

**DO**:
- ✅ Write focused subagents (single responsibility)
- ✅ Invest in descriptions (determines delegation)
- ✅ Keep prompts concise and specific
- ✅ Reference key project files
- ✅ Define clear success criteria

**DON'T**:
- ❌ Create generic "helper" agents
- ❌ Write vague descriptions ("helps with coding")
- ❌ Write 2000-word prompts (too verbose)
- ❌ Duplicate slash command functionality
- ❌ Create dozens of subagents (start with 3-5)

---

### When to Use Subagents vs Commands

| Use Subagent When... | Use Command When... |
|---------------------|---------------------|
| Multi-step workflow with investigation | Single-purpose prompt |
| Need context isolation | Quick, repeatable action |
| Long-running task | Immediate result needed |
| Specialized expertise across many steps | One-shot generation |
| Parallel execution needed | Sequential is fine |

**Example**:
- **Command**: `/load-memory-bank` - Quick context load
- **Subagent**: `/memory-bank-updater` - Automatic updates with validation

---

### Optimization Tips

**Token Efficiency**:
- Use `model: fast` for simple verification tasks
- Use `is_background: true` for long operations
- Keep subagent prompts under 500 tokens when possible

**Parallel Execution**:
- Design subagents to be independent
- Avoid dependencies between subagents
- Use parallel invocation for faster results

**Automatic Delegation**:
- Write clear, specific descriptions
- Include trigger phrases ("Use when...", "Use proactively...")
- Test delegation by asking relevant questions

---

## Troubleshooting

### Subagent Not Found

**Issue**: Agent says "subagent not found"

**Solutions**:
- Verify file exists in `.cursor/agents/`
- Check filename matches invocation (e.g., `verifier.md` → `/verifier`)
- Restart Cursor to refresh subagent registry

---

### Subagent Not Auto-Delegating

**Issue**: Agent not delegating tasks automatically

**Solutions**:
- Improve `description` field with trigger phrases
- Include "Use proactively" or "Use when" in description
- Be more explicit in your request to Agent
- Use explicit invocation (`/name`) instead

---

### Subagent Output Too Verbose

**Issue**: Subagent response too long or detailed

**Solutions**:
- Add output format constraints to prompt
- Use "Be concise" in subagent instructions
- Specify "Report in bullet points" or similar

---

### Background Subagent Not Completing

**Issue**: Background subagent seems stuck

**Solutions**:
- Check `~/.cursor/subagents/` for output files
- Look for error messages in subagent state
- Consider using foreground mode instead
- Check if task requires user input (doesn't work in background)

---

## Performance & Cost

### Token Usage

**Subagent Overhead**:
- Each subagent starts with fresh context
- Startup cost: ~500-1000 tokens per subagent
- Trade-off: Clean context vs startup cost

**When Worth It**:
- Long research (saves 5000+ tokens in main conversation)
- Parallel execution (time savings)
- Specialized knowledge (better output quality)

**When Not Worth It**:
- Simple 1-2 sentence questions
- Tasks requiring lots of context from main conversation
- Quick edits or lookups

---

### Cost Optimization

**Use cheaper models**:
```yaml
model: fast  # Uses Haiku instead of Sonnet
```

**Background mode for non-urgent tasks**:
```yaml
is_background: true  # Doesn't block, allows batching
```

**Parallel execution**:
- 3 subagents in parallel ≈ 3x tokens but 1x time
- Better than sequential for independent tasks

---

## Migration from Custom Commands

Your existing custom commands remain useful alongside subagents:

| Custom Command | Subagent Equivalent | Recommendation |
|---|---|---|
| `/load-memory-bank` | Memory Bank Updater | Keep command for quick loads |
| `/test-discord-locally` | Discord Specialist | Use subagent for debugging |
| `/ingest-knowledge-guide` | RAG Specialist | Use subagent for execution |
| `/deploy-railway` | Deployment Guardian | Use subagent for validation |

**Strategy**: Keep commands for prompts, use subagents for complex workflows.

---

## FAQ

### Can subagents launch other subagents?

Yes, custom subagents inherit all tools from parent by default, including the Task tool for spawning subagents.

**Exception**: Built-in `computerUse` subagent cannot spawn others.

---

### How do I see what a subagent is doing?

**Foreground subagents**: Output appears in conversation
**Background subagents**: Check `~/.cursor/subagents/` for state files

---

### What happens if a subagent fails?

The subagent returns an error to parent Agent. Parent can:
- Retry with more context
- Resume the subagent with fixes
- Handle failure differently

---

### Can subagents access MCP tools?

Yes, subagents inherit all MCP tools from configured servers.

---

### How do I update a subagent?

Edit the `.cursor/agents/name.md` file and save. Changes take effect immediately (no restart needed).

---

## Resources

- **Cursor Docs**: [https://cursor.com/docs/context/subagents](https://cursor.com/docs/context/subagents)
- **NIGEL Project**: See `.cursor/agents/` for all available subagents
- **Global User Rules**: See `GLOBAL-USER-RULES.md` for integration with workflows

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Optimized for**: Cursor Nightly with Claude 4.5
