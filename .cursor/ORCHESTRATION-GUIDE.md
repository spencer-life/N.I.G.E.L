# Orchestration Pattern Guide

## Overview

The orchestration pattern allows complex workflows to be broken down and coordinated across multiple specialist subagents, with the main Agent or Orchestrator subagent managing the overall flow.

## Pattern: Planner → Implementer → Verifier

### Phase 1: Planning (`/planner`)

**Purpose**: Create detailed technical plan before implementation

**Input**: User requirements, feature description

**Process**:
1. Analyze requirements thoroughly
2. Design technical approach
3. Identify dependencies
4. Break into implementation steps
5. Define success criteria
6. Assess risks

**Output**: Structured plan with:
- Requirements analysis
- Technical design
- Dependencies
- Implementation steps
- Success criteria
- Risk assessment

**Handoff to Next Phase**:
```
PLAN COMPLETE - READY FOR IMPLEMENTATION
=========================================

Plan Summary: [Brief overview]

Specialists Needed:
- [Specialist 1] for [task type]
- [Specialist 2] for [task type]

Execution Order:
1. [Phase 1]: [Description]
2. [Phase 2]: [Description]
3. [Phase 3]: [Description]

See detailed plan above for full steps.
```

---

### Phase 2: Implementation (`/orchestrator` or Main Agent)

**Purpose**: Execute the plan by delegating to specialists

**Input**: Plan from Planner subagent

**Process**:
1. Review plan and identify specialists needed
2. Execute tasks in dependency order
3. Delegate to appropriate specialists:
   - **Discord work** → `/discord-specialist`
   - **RAG work** → `/rag-specialist`
   - **Testing** → `/test-runner`
   - **Debugging** → `/debugger`
   - **Documentation** → `/memory-bank-updater`

4. Pass structured context to each specialist
5. Verify each task completion
6. Integrate results

**Parallel Execution**:
For independent tasks, delegate multiple specialists simultaneously:
```
Task 1: Database schema → Execute directly
Task 2: API endpoint → Execute directly
(Both run in parallel)

Task 3: Frontend (depends on Task 2) → Wait for Task 2
Task 4: Tests (depends on all) → Wait for all
```

**Handoff Format to Specialists**:
```
TASK HANDOFF
============

Task: [Specific task for this specialist]

Context from Previous Tasks:
- [What was already completed]
- [Files that were modified]
- [Patterns established]

Requirements:
1. [Requirement 1]
2. [Requirement 2]

Success Criteria:
- [ ] [Criterion 1]
- [ ] [Criterion 2]

Files to Reference:
- [Relevant files]
- [Patterns to follow]
```

**Output**: Completed implementation with all tasks done

---

### Phase 3: Verification (`/verifier`)

**Purpose**: Independently validate that implementation is complete and functional

**Input**: Completed implementation from Phase 2

**Process**:
1. Review original requirements
2. Check all code exists and is functional
3. Run tests (don't just check they exist)
4. Test edge cases
5. Verify integration points
6. Check documentation updated

**Output**: Verification report:
```
VERIFICATION REPORT
===================

✅ Verified and Working:
- [Feature 1]: Tested and passing
- [Feature 2]: Tested and passing

⚠️ Incomplete or Issues:
- [Issue 1]: Description and fix needed

❌ Broken:
- None

Overall Status: PASS / NEEDS WORK
```

---

## Example: Full Orchestration Flow

### User Request
"Add a `/leaderboard weekly` command that shows top 10 users for current week"

### Phase 1: Planning

**Invoke**: `/planner analyze requirements for weekly leaderboard command`

**Planner Output**:
```
IMPLEMENTATION PLAN
===================

Feature: Weekly Leaderboard Command
Priority: P1
Estimated Effort: 2-3 hours

1. REQUIREMENTS
   - Command: /leaderboard weekly
   - Shows top 10 users for current week
   - Resets Monday 9 AM Phoenix time
   - Handles ties and empty states

2. TECHNICAL DESIGN
   Components:
   - Command: Add subcommand to existing /leaderboard
   - Service: ScoringService.getWeeklyLeaderboard()
   - Database: Query period_scores table
   - Response: Discord embed with results

   Data Flow:
   User → Command → Service → Database → Embed → Response

3. DEPENDENCIES
   Required:
   ✓ period_scores table exists
   ✓ Phoenix timezone utilities exist
   
   Prerequisites:
   - Verify weekly data in period_scores
   - Test timezone calculations

4. IMPLEMENTATION STEPS
   Phase 1: Database (Complexity: Low)
   1. Add getWeeklyLeaderboard() to ScoringService
   2. Calculate week bounds with Phoenix time
   3. Write SQL query
   4. Test query

   Phase 2: Command (Complexity: Medium)
   5. Add 'weekly' subcommand option
   6. Parse and validate
   7. Call service method
   8. Format embed response
   9. Handle edge cases

   Phase 3: Testing (Complexity: Low)
   10. Write unit tests
   11. Test edge cases
   12. Manual Discord test

   Phase 4: Documentation (Complexity: Low)
   13. Update MEMORY-BANK.md
   14. Update README.md

5. SUCCESS CRITERIA
   Functional:
   - [ ] Command responds correctly
   - [ ] Shows accurate top 10
   - [ ] Resets on Monday 9 AM Phoenix
   - [ ] Handles edge cases

   Quality:
   - [ ] Tests passing
   - [ ] NIGEL voice
   - [ ] Documentation updated

READY FOR IMPLEMENTATION
Delegate to: orchestrator
```

---

### Phase 2: Implementation

**Invoke**: `/orchestrator implement the weekly leaderboard plan`

**Orchestrator Process**:

**Step 1: Database Work**
```
[ORCHESTRATOR] Task 1/4: Database query
Handling directly (no specialist needed)

Creating ScoringService.getWeeklyLeaderboard()...
✓ Method created
✓ Phoenix timezone calculation added
✓ SQL query written
✓ Tested with sample data
```

**Step 2: Command Implementation**
```
[ORCHESTRATOR] Task 2/4: Discord command
Delegating to: discord-specialist

TASK HANDOFF TO DISCORD SPECIALIST
===================================
Task: Add 'weekly' subcommand to /leaderboard

Context:
- ScoringService.getWeeklyLeaderboard() exists
- Returns array of {rank, username, points}
- May return empty array

Requirements:
1. Add StringOption for subcommand ('weekly')
2. Parse subcommand in execute()
3. Call getWeeklyLeaderboard(10)
4. Format results in embed
5. Handle empty results with message
6. Use NIGEL voice

Success Criteria:
- [ ] Command responds within 3 seconds
- [ ] Embed shows top 10 users
- [ ] Empty state handled gracefully
- [ ] NIGEL voice in all messages

Files to Reference:
- src/commands/training/leaderboard.ts (existing)
- src/utils/embeds.ts (embed patterns)
```

**Discord Specialist completes task**

**Step 3: Testing**
```
[ORCHESTRATOR] Task 3/4: Testing
Delegating to: test-runner

TASK HANDOFF TO TEST RUNNER
============================
Task: Write and run tests for weekly leaderboard

Context:
- ScoringService.getWeeklyLeaderboard() implemented
- Command /leaderboard weekly implemented
- Edge cases: empty data, ties, week boundaries

Requirements:
1. Unit test for getWeeklyLeaderboard()
2. Test week boundary calculations
3. Test empty results
4. Test ties in rankings
5. Integration test for command

Success Criteria:
- [ ] All tests pass
- [ ] Edge cases covered
- [ ] No regressions in existing tests
```

**Test Runner completes task**

**Step 4: Documentation**
```
[ORCHESTRATOR] Task 4/4: Documentation
Delegating to: memory-bank-updater (background)

TASK HANDOFF TO MEMORY BANK UPDATER
====================================
Task: Update documentation for weekly leaderboard

Context:
- New feature: /leaderboard weekly command
- Shows top 10 users for current week
- Resets Monday 9 AM Phoenix time

Requirements:
1. Update MEMORY-BANK.md Section 6 (Current State)
2. Add to command list
3. Note Phoenix timezone dependency

Success Criteria:
- [ ] MEMORY-BANK.md reflects new command
- [ ] Concise (token optimization)
- [ ] Consistent with existing format
```

**Orchestrator Summary**:
```
[ORCHESTRATOR] IMPLEMENTATION COMPLETE
======================================

Completed Tasks:
✓ Task 1/4: Database query - Success
✓ Task 2/4: Discord command - Success
✓ Task 3/4: Testing - Success
✓ Task 4/4: Documentation - Success

Files Modified:
- src/services/ScoringService.ts
- src/commands/training/leaderboard.ts
- tests/unit/ScoringService.test.ts
- MEMORY-BANK.md

Ready for verification.
```

---

### Phase 3: Verification

**Invoke**: `/verifier confirm weekly leaderboard implementation`

**Verifier Process**:
1. Reviews requirements from plan
2. Checks code exists and is functional
3. Runs tests (actually executes them)
4. Tests edge cases manually
5. Verifies documentation updated

**Verifier Output**:
```
VERIFICATION REPORT
===================

✅ Verified and Working:
- Command /leaderboard weekly responds correctly
- Shows top 10 users for current week
- Tested with sample data: accurate results
- Empty state handled: shows "No data for this week"
- Ties handled: all tied users shown at same rank
- Tests passing: 12/12 unit tests, 3/3 integration tests
- Documentation updated: MEMORY-BANK.md Section 6

⚠️ Minor Issues:
- None identified

❌ Broken:
- None

🔍 Unable to Verify:
- Monday 9 AM reset (requires waiting for Monday)
  Recommendation: Monitor first reset manually

Overall Status: ✅ PASS

Feature is complete and ready for deployment.
```

---

## Long Task Management

For tasks requiring >20 tool calls, Orchestrator uses chunking:

### Strategy 1: Sequential Chunks
```
Chunk 1: Core functionality (MVP)
→ Implement → Test → Verify → Commit

Chunk 2: Edge cases and error handling
→ Implement → Test → Verify → Commit

Chunk 3: Polish and optimization
→ Implement → Test → Verify → Commit
```

### Strategy 2: Parallel Specialists
```
Specialist 1: Database layer
Specialist 2: API layer (depends on Specialist 1)
Specialist 3: Frontend (depends on Specialist 2)
Specialist 4: Tests (depends on all)

Orchestrator integrates results and verifies.
```

---

## Subagent Communication Protocol

### Structured Handoffs

**From Planner to Orchestrator**:
```
PLAN COMPLETE
=============
[Detailed plan with steps, dependencies, success criteria]

READY FOR IMPLEMENTATION
Specialists needed: [list]
Execution order: [sequence]
```

**From Orchestrator to Specialist**:
```
TASK HANDOFF
============
Task: [Specific task]
Context: [Previous work]
Requirements: [What to do]
Success Criteria: [How to verify]
Files to Reference: [Relevant files]
```

**From Specialist to Orchestrator**:
```
TASK COMPLETE
=============
Task: [What was done]
Files Modified: [List]
Tests: [Status]
Issues: [Any problems]
Ready for: [Next step]
```

**From Orchestrator to Verifier**:
```
READY FOR VERIFICATION
======================
Feature: [Name]
Implementation Summary: [What was built]
Files Modified: [List]
Tests: [Status]
Original Requirements: [From plan]
```

**From Verifier to Main Agent**:
```
VERIFICATION REPORT
===================
Status: PASS / NEEDS WORK
[Detailed findings]
```

---

## Best Practices

### For Main Agent
- Use `/planner` for complex features before starting
- Use `/orchestrator` for multi-specialist coordination
- Always end with `/verifier` for quality assurance
- Trust specialists in their domains

### For Planner
- Ask clarifying questions upfront
- Create actionable, testable steps
- Identify dependencies explicitly
- Define clear success criteria

### For Orchestrator
- Break work into logical chunks
- Provide rich context in handoffs
- Use parallel execution when possible
- Verify after each major task

### For Specialists
- Focus on your domain expertise
- Follow patterns from handoff context
- Report issues immediately
- Provide clear completion status

### For Verifier
- Be skeptical (don't trust claims)
- Actually run tests (don't just check they exist)
- Test edge cases
- Verify documentation matches reality

---

## Integration with Skills

**Skills** complement subagents for quick, single-purpose tasks:

| Use Skill | Use Subagent |
|-----------|--------------|
| Generate changelog | Debug complex issue |
| Format imports | Orchestrate feature |
| Create test plan | Implement and verify feature |

**Example Combined Usage**:
```
1. /planner - Create implementation plan
2. /orchestrator - Coordinate implementation
3. /generate-changelog skill - Create changelog
4. /verifier - Verify everything works
```

---

## Success Metrics

Orchestration is successful when:
- Complex tasks broken into manageable pieces
- Right specialists used for each piece
- All pieces integrate correctly
- Quality verified independently
- Main agent has clear understanding of results
- Documentation updated automatically

---

**See Also**:
- `.cursor/agents/orchestrator.md` - Full orchestrator subagent
- `.cursor/agents/planner.md` - Full planner subagent
- `.cursor/agents/verifier.md` - Full verifier subagent
- `docs/SUBAGENTS-REFERENCE.md` - Complete subagent guide
