# Quick Start: Orchestration Pattern

## TL;DR

You now have an **orchestration system** that breaks complex tasks into manageable pieces and coordinates specialist subagents.

**Pattern**: `/planner` → `/orchestrator` → `/verifier`

---

## 3 New Power Subagents

### 1. Planner (`/planner`)
**Creates detailed technical plans before coding**

```
/planner analyze requirements for weekly leaderboard command
```

**Output**: Structured plan with requirements, design, steps, success criteria

---

### 2. Orchestrator (`/orchestrator`)
**Coordinates complex workflows across multiple specialists**

```
/orchestrator implement the weekly leaderboard plan
```

**What it does**:
- Breaks work into phases
- Delegates to specialists (Discord, RAG, Testing, Docs)
- Runs independent tasks in parallel
- Integrates results
- Enforces quality gates

---

### 3. Debugger (`/debugger`)
**Finds root causes and implements minimal fixes**

```
/debugger investigate drill command crash for new users
```

**What it does**:
- Captures error details
- Identifies reproduction steps
- Isolates failure location
- Analyzes root cause (not symptoms)
- Implements minimal fix
- Verifies solution

---

## When to Use Orchestration

### Use Orchestration For:
- ✅ Features requiring >10 steps
- ✅ Work spanning multiple domains (DB + API + UI)
- ✅ Complex refactoring
- ✅ Unclear requirements (use Planner first)
- ✅ Long tasks (>20 tool calls)

### Skip Orchestration For:
- ❌ Simple commands (use `/discord-specialist` directly)
- ❌ Quick fixes (use `/debugger` directly)
- ❌ Single-file changes
- ❌ Documentation updates (use `/doc-auditor` directly)

---

## Example Workflows

### Simple Task (No Orchestration)
```
User: "Add /stats weekly command"

Agent → /discord-specialist create weekly stats command
     → /verifier confirm it works
     → Done
```

---

### Complex Task (With Orchestration)
```
User: "Add user authentication with OAuth"

Step 1: Plan
/planner analyze OAuth authentication requirements
→ Creates detailed plan with 15 steps, 3 phases

Step 2: Orchestrate
/orchestrator implement OAuth authentication plan
→ Phase 1: Database schema
→ Phase 2: OAuth flow (delegates to discord-specialist)
→ Phase 3: Session management
→ Phase 4: Testing (delegates to test-runner)
→ Phase 5: Documentation (delegates to memory-bank-updater)

Step 3: Verify
/verifier confirm OAuth implementation
→ Reports: All tests passing, ready for deployment

Done ✓
```

---

### Debugging Task
```
User: "Drill command crashes for new users"

/debugger investigate drill command crash
→ Error: "Cannot read property 'id' of undefined"
→ Reproduction: New user runs /drill
→ Location: DrillService.startSession line 45
→ Root cause: Missing null check after Map.get()
→ Fix: Add null check before accessing .id
→ Verify: Tests pass, new users work

Done ✓
```

---

### Long Task (Chunking)
```
User: "Refactor entire RAG system"

/planner analyze RAG refactoring
→ Plan: 25 steps, 5 phases, 4-6 hours

/orchestrator implement RAG refactoring plan
→ Chunk 1: Embedding generation (2 hrs)
   Implement → Test → Verify → Commit ✓
→ Chunk 2: Model routing (1.5 hrs)
   Implement → Test → Verify → Commit ✓
→ Chunk 3: Prompt caching (1 hr)
   Implement → Test → Verify → Commit ✓
→ Chunk 4: Documentation (30 min)
   Implement → Verify → Commit ✓

/verifier confirm RAG refactoring complete
→ All tests passing, performance improved

Done ✓
```

---

## Parallel Execution

Orchestrator runs independent tasks simultaneously:

```
User: "Add authentication and update docs"

Orchestrator:
→ Task 1: Auth (discord-specialist) } Run in parallel
→ Task 2: Docs (doc-auditor)        }
→ Task 3: Tests (test-runner) - waits for Task 1
→ Task 4: Verify (verifier) - waits for all

Result: Faster completion, separate contexts
```

---

## Skills Integration

**Skills** = Quick, single-purpose tasks (no context isolation)

```
/generate-changelog     - Create changelog from git commits
/create-test-plan       - Generate test plan template
/format-imports         - Organize TypeScript imports
```

**Combined with Subagents**:
```
1. /planner - Create plan
2. /create-test-plan - Generate test template (skill)
3. /orchestrator - Implement feature
4. /format-imports - Clean up imports (skill)
5. /verifier - Validate
6. /generate-changelog - Create changelog (skill)
```

---

## Handoff Protocol

Subagents communicate with structured context:

**Planner → Orchestrator**:
```
PLAN COMPLETE
Specialists needed: [list]
Execution order: [sequence]
```

**Orchestrator → Specialist**:
```
TASK HANDOFF
Task: [specific task]
Context: [previous work]
Requirements: [what to do]
Success criteria: [how to verify]
```

**Specialist → Orchestrator**:
```
TASK COMPLETE
Files modified: [list]
Tests: [status]
Ready for: [next step]
```

---

## Quality Gates

Orchestrator enforces quality at each stage:

**Gate 1**: Implementation Complete
- All subtasks done
- Code follows patterns
- Error handling present

**Gate 2**: Testing
- Tests written and passing
- Edge cases covered

**Gate 3**: Documentation
- MEMORY-BANK.md updated
- Code comments added

**Gate 4**: Verification
- Verifier confirms all criteria met
- No regressions

---

## Testing the System

### Test 1: Simple Orchestration
```
/planner analyze requirements for a simple feature
/orchestrator implement the plan
/verifier confirm implementation
```

### Test 2: Parallel Execution
```
"Implement feature X and update documentation"
→ Watch orchestrator run tasks in parallel
```

### Test 3: Debugging
```
/debugger investigate [some error]
→ Watch systematic root cause analysis
```

### Test 4: Skills
```
/generate-changelog
/format-imports
/create-test-plan
```

---

## Complete Subagent System

**Orchestration** (NEW):
- orchestrator - Workflow coordination
- planner - Technical planning
- debugger - Root cause analysis

**Core**:
- verifier - Completion validation
- memory-bank-updater - Auto-documentation
- test-runner - Proactive testing

**Domain**:
- discord-specialist - Discord.js expert
- rag-specialist - RAG system expert

**Production**:
- deployment-guardian - Deployment safety
- doc-auditor - Documentation consistency

**Total**: 10 subagents + 3 skills (with framework for more)

---

## Key Benefits

### For Complex Tasks
- ✅ Breaks into manageable pieces
- ✅ Right specialist for each piece
- ✅ Parallel execution when possible
- ✅ Quality verified independently

### For Long Tasks
- ✅ Chunking strategy prevents context overflow
- ✅ Commit after each chunk
- ✅ Clear progress tracking
- ✅ Easy to resume if interrupted

### For Quality
- ✅ Independent verification
- ✅ Tests written and run
- ✅ Documentation updated automatically
- ✅ No incomplete features

### For Efficiency
- ✅ 40-50% token reduction (complex workflows)
- ✅ Faster completion (parallel execution)
- ✅ Focused specialists (better quality)
- ✅ Main agent coordinates (not overwhelmed)

---

## Next Steps

1. **Switch to Nightly** (required)
   - Settings → Beta → Nightly
   - Restart Cursor

2. **Try Simple Orchestration**
   ```
   /planner analyze requirements for [simple feature]
   /orchestrator implement the plan
   /verifier confirm implementation
   ```

3. **Try Parallel Execution**
   ```
   "Implement X and update Y"
   → Watch parallel delegation
   ```

4. **Try Skills**
   ```
   /generate-changelog
   ```

5. **Use for Real Work**
   - Next complex feature: Use orchestration
   - Next bug: Use debugger
   - Next refactor: Use planner first

---

## Resources

- **Full Guide**: `.cursor/ORCHESTRATION-GUIDE.md`
- **Implementation Summary**: `.cursor/ENHANCED-SUBAGENTS-SUMMARY.md`
- **Subagents Reference**: `docs/SUBAGENTS-REFERENCE.md`
- **Skills**: `.cursor/skills/README.md`

---

**You're Ready!**

The orchestration system is set up and ready to use. Start with a simple task to see how it works, then use it for your next complex feature.

**Remember**: 
- Complex tasks → Use orchestration
- Simple tasks → Direct specialist
- Quick actions → Use skills
- Always verify → Use verifier
