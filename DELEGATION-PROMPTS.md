# Work Delegation Prompts

These prompts are designed to split the subagent expansion work across multiple Claude chat sessions to reduce workload.

---

## CHAT 1: VoltAgent Subagent Adaptation

**Purpose:** Download and adapt VoltAgent subagents to Cursor-compatible format with NIGEL project context

**Copy this entire prompt into a new Claude chat:**

```
I need you to help me adapt subagents from the VoltAgent repository for use in Cursor IDE (not Claude Code CLI).

GOAL: Create general-purpose, project-agnostic subagents that work across ANY codebase - web apps, mobile apps, CLI tools, libraries, data pipelines, etc.

CURSOR SUBAGENT FORMAT:
Cursor uses this format in `.cursor/agents/` directory:

```yaml
---
name: agent-name
description: Clear description of when to use this agent. Use proactive language like "Use when..." or "Use for..."
model: inherit  # or "fast" for cheaper operations
---

You are a [role] specializing in [domain].

When invoked:
1. [Step 1]
2. [Step 2]

## Key Behaviors
- Behavior 1
- Behavior 2

## Adapting to Project Context
- Read README.md, CONTRIBUTING.md, or similar docs to understand project structure
- Infer patterns from existing code (naming conventions, architecture, style)
- Check for .editorconfig, .prettierrc, eslint configs, etc.
- Follow the project's established conventions
- Ask for clarification when project-specific context is needed

## Success Criteria
- Criterion 1
- Criterion 2
```

YOUR TASKS:

1. **Download these 12 VoltAgent subagents** from GitHub:
   - code-reviewer (categories/04-quality-security/)
   - performance-engineer (categories/04-quality-security/)
   - accessibility-tester (categories/04-quality-security/)
   - typescript-pro (categories/02-language-specialists/)
   - sql-pro (categories/02-language-specialists/)
   - python-pro (categories/02-language-specialists/)
   - refactoring-specialist (categories/06-developer-experience/)
   - legacy-modernizer (categories/06-developer-experience/)
   - git-workflow-manager (categories/06-developer-experience/)
   - llm-architect (categories/05-data-ai/)
   - prompt-engineer (categories/05-data-ai/)
   - nlp-engineer (categories/05-data-ai/)

2. **For each agent, convert to Cursor format:**
   - Remove VoltAgent-specific sections (MCP Tool Suite, Communication Protocol)
   - Simplify to Cursor's cleaner format
   - Add "Adapting to Project Context" section (see format above)
   - Adapt description for auto-delegation (use "Use when..." language)
   - Choose appropriate model (fast for simple tasks, inherit for complex)
   - Keep core expertise and behaviors

3. **Make agents project-agnostic:**
   - DO NOT reference specific project files (like MEMORY-BANK.md)
   - DO suggest agent should read README.md, CONTRIBUTING.md, docs/ to learn project
   - DO include generic best practices (e.g., "follow existing code style")
   - DO make agent adaptable to any language, framework, or domain
   - DO add instructions to infer patterns from existing code
   - DO NOT hardcode specific tech stacks or frameworks

4. **Output format:**
   For each agent, provide:
   ```
   ## [agent-name].md
   
   [Complete Cursor-formatted agent file content]
   
   ---
   ```

5. **Quality checklist per agent:**
   - [ ] YAML frontmatter valid (name, description, model)
   - [ ] Description uses "Use when..." or similar trigger language
   - [ ] "Adapting to Project Context" section included
   - [ ] Core expertise preserved from VoltAgent version
   - [ ] Simplified (no overly complex protocols)
   - [ ] Model choice justified (fast vs inherit)
   - [ ] NO hardcoded project-specific references
   - [ ] Works across multiple languages/frameworks/domains

CONSTRAINTS:
- Keep agents concise (under 500 lines each)
- Focus on actionable behaviors, not theory
- Make descriptions specific enough to trigger auto-delegation
- Preserve the expertise while simplifying the format
- Don't include tools that aren't available in Cursor
- Make agents UNIVERSAL - they should work on web apps, mobile apps, CLIs, libraries, scripts, etc.
- Don't assume specific tech stacks - make agents adaptable
- Include instructions for agents to learn project context dynamically

START WITH: code-reviewer, typescript-pro, and sql-pro (these are highest priority)
THEN: Do the remaining 9 agents

Provide complete, ready-to-save .md files for each agent.
```

---

## CHAT 2: Awesome-Claude-Code Resource Analysis

**Purpose:** Analyze the massive awesome-claude-code repository and recommend relevant resources

**Copy this entire prompt into a new Claude chat:**

```
I need you to analyze the hesreallyhim/awesome-claude-code repository (21.2k stars) and recommend UNIVERSAL, project-agnostic resources.

GOAL: Build a versatile Cursor setup that works across ANY project type - web apps, mobile apps, CLI tools, libraries, data pipelines, etc.

PREFERENCE:
- Resources that work across multiple languages and frameworks
- Tools and workflows that are universally applicable
- Avoid resources tied to specific tech stacks (unless they're very popular/standard)
- Focus on developer experience, code quality, and productivity enhancements

YOUR TASKS:

1. **Browse awesome-claude-code repository categories:**
   - Agent Skills (100+ entries)
   - Workflows & Knowledge Guides
   - Tooling (CLI tools, IDE integrations, usage monitors, orchestrators)
   - Status Lines
   - Hooks (lifecycle automation)
   - Slash Commands (50+ entries)
   - CLAUDE.md files

2. **For each category, identify 3-5 most relevant resources:**
   Focus on:
   - Multi-language/framework compatibility
   - Universal developer workflows
   - Testing and quality automation (language-agnostic)
   - Git workflows and automation
   - Deployment automation (various platforms)
   - Developer experience improvements
   - Code review and quality tools
   - Performance optimization (cross-platform)

3. **Avoid:**
   - Resources tied to obscure/niche frameworks
   - Overly complex enterprise solutions
   - Resources requiring extensive infrastructure
   - Project-specific templates (unless highly adaptable)

4. **For each recommendation, provide:**
   ```
   ### [Resource Name]
   - **Category:** [Agent Skills/Hooks/Commands/etc.]
   - **Link:** [GitHub URL if available]
   - **Priority:** High / Medium / Low
   - **Complexity:** Easy / Medium / Hard
   - **Integration Time:** [< 30 min / 1-2 hours / Research needed]
   - **Why Universal:** [2-3 sentences on why it works across projects]
   - **Works With:** [Languages/frameworks/project types it supports]
   - **Installation:** [Specific commands or steps]
   - **Conflicts:** [Any known conflicts, or "None"]
   ```

5. **Organize output by priority:**
   - **Quick Wins** (< 30 min each, high impact)
   - **Medium Effort** (1-2 hours, solid value)
   - **Long-term** (research needed, strategic additions)

6. **Specific areas to prioritize:**
   - **Hooks:** Pre-commit quality gates (language-agnostic), test automation, git workflow
   - **Slash Commands:** Code analysis, testing (multi-language), documentation generation
   - **Tooling:** Session management, usage monitoring, cost tracking
   - **Status Lines:** Enhanced terminal UI with git/cost/project info
   - **Workflows:** TDD enforcement, planning patterns, deployment guards (multi-platform)

7. **Create implementation roadmap:**
   Week 1: [Quick wins - list resources]
   Week 2: [Medium effort - list resources]
   Week 3: [Long-term - list resources]

TARGET: 15-20 high-quality recommendations total

DELIVERABLE FORMAT:
```
# Universal Cursor Setup: Awesome-Claude-Code Recommendations

## Executive Summary
[1 paragraph overview - emphasize universality and cross-project value]

## Quick Wins (Week 1)
[3-5 resources with full details - prioritize most universal]

## Medium Effort (Week 2)
[5-7 resources with full details - balance universality with power]

## Long-term (Week 3)
[4-6 resources with full details - strategic, high-value additions]

## Installation Commands Summary
[Bash script with all curl/git commands]

## Language/Framework Coverage Matrix
[Table showing which resources work with which languages/frameworks]

## Notes
[Additional considerations for cross-project usage]
```

START ANALYSIS NOW.
```

---

## How to Use These Prompts

### Step 1: Start Two Separate Claude Chats

Open two new Claude chat sessions (web or desktop app, NOT Cursor):
- **Chat 1:** Paste "VoltAgent Subagent Adaptation" prompt
- **Chat 2:** Paste "Awesome-Claude-Code Resource Analysis" prompt

### Step 2: Wait for Deliverables

**From Chat 1:** You'll receive 12 complete `.md` files ready to save
**From Chat 2:** You'll receive organized recommendations with installation commands

### Step 3: Integration

Once you have both deliverables:
1. Save the 12 agent files from Chat 1 to `~/.cursor/agents/` (for global use across all projects)
   - Or `.cursor/agents/` if you want project-specific versions
2. Review Chat 2 recommendations
3. Choose quick wins to implement first
4. Follow installation commands provided

### Estimated Timeline

- **Chat 1:** 30-45 minutes (generating 12 adapted agents)
- **Chat 2:** 20-30 minutes (analyzing and recommending resources)
- **Total:** ~1 hour for both to complete
- **Integration:** 30-60 minutes to save files and test

---

## What You'll Get

**From Chat 1:**
- 12 Cursor-compatible subagent files
- Universal, project-agnostic design
- Auto-delegation descriptions optimized
- Ready to drop into `~/.cursor/agents/` (global) or `.cursor/agents/` (project)

**From Chat 2:**
- 15-20 curated universal recommendations
- Organized by implementation time
- Language/framework coverage matrix
- Installation commands ready
- Week-by-week roadmap

---

## After Both Complete

Return here with:
1. The 12 agent files from Chat 1
2. The recommendation report from Chat 2

Then we can:
- Review and test the agents
- Implement quick wins from recommendations
- Update MEMORY-BANK.md
- Test auto-delegation

---

## Why This Split Works

**Chat 1 (VoltAgent):**
- Focused, mechanical task (download + adapt)
- Clear input (12 specific agents)
- Clear output format (Cursor-compatible .md files)
- No complex decision-making

**Chat 2 (Awesome-Claude-Code):**
- Research and analysis task
- Requires judgment and filtering
- Needs to understand project fit
- Produces curated recommendations

**Result:** Parallel work, no context conflicts, faster completion

