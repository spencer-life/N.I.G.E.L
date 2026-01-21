# Quick Reference Card
**Print or Keep This Handy While Working**

---

## 🆕 Pre-Coding Workflow

### When Starting New Project

**AI will ask:**
> "Full Workflow or Quick Start?"

**Full Workflow (Recommended for new projects):**
1. User Research → `docs/USER-PERSONAS.md`
2. Requirements → `docs/BRTD.md`  
3. Success Criteria → Updated `BRTD.md`
4. Tests → `docs/TEST-PLAN.md` + test files
5. Memory Bank → `docs/MEMORY-BANK.md`
6. Get approval → Then code
7. Implement → Make tests pass
8. Iterate → Debug until done
9. Complete → All requirements ✅

**Quick Start (For small features):**
- Skip to planning and coding
- Still create Memory Bank

### Memory Bank = Token Savings

**Always create** `docs/MEMORY-BANK.md`:
- AI-optimized context
- Cached for 90% savings
- Update constantly
- **Result: 40-60% token reduction**

---

## 🎯 Model Selection (Choose Wisely)

```
┌─────────────────────────────────────────────────────────┐
│  TASK TYPE              MODEL          WHEN TO USE      │
├─────────────────────────────────────────────────────────┤
│  Simple lookup          Flash/Haiku    Quick answers    │
│  Basic CRUD             Flash/Haiku    Standard code    │
│  Feature planning       Sonnet         Architecture     │
│  Complex logic          Sonnet+Think   Multi-step       │
│  Debugging              Opus+Think     Critical issues  │
└─────────────────────────────────────────────────────────┘
```

---

## 💰 Cost Per Request (Estimates)

| Task | Model | Cost |
|------|-------|------|
| "What does this do?" | Flash/Haiku | $0.0001 |
| "Create API endpoint" | Sonnet | $0.010 |
| "Design architecture" | Sonnet+Think | $0.025 |
| "Debug production bug" | Opus+Think | $0.090 |

**Target Average:** $0.012/request (with intelligent routing)

---

## ⚡ Token Optimization Checklist

Before every request:

- [ ] **Search before reading** - Don't load unnecessary files
- [ ] **Request concise output** - "In 3 sentences" vs "Explain everything"
- [ ] **Use parallel calls** - Read multiple files at once
- [ ] **Enable caching** - System prompts should be cached
- [ ] **Right-size model** - Don't use Opus for simple tasks

**Expected Savings:** 60-87%

---

## 📋 Planning Protocol

When starting new features:

1. **Describe** what you want
2. **Wait** for Cursor to ask questions
3. **Answer** thoroughly
4. **Review** the presented plan
5. **Confirm** before implementation begins

**Never skip planning!**

---

## 📄 SOP Maintenance

Update your `docs/SOP.md` when:

- ✅ New feature completed → Section 4 (Implementation)
- ✅ Architecture changed → Section 3 (Decisions)
- ✅ New dependency added → Section 2 (Setup)
- ✅ Issue solved → Section 7 (Lessons Learned)

**Keep it current, it's your documentation lifeline.**

---

## 🔍 Complexity Score Guide

**Simple (0-39):** Use Flash/Haiku
- Quick lookups
- Simple edits
- Basic CRUD
- Documentation updates

**Moderate (40-59):** Use Sonnet
- Feature implementation
- Code review
- API design
- Moderate refactoring

**Complex (60-79):** Use Sonnet + Extended Thinking
- Architecture planning
- Multi-step logic
- Complex refactoring
- Performance optimization

**Critical (80+):** Use Opus + Extended Thinking
- Production debugging
- Security analysis
- Strategic decisions
- Maximum accuracy needed

---

## 🚨 Common Anti-Patterns

### ❌ DON'T:

1. **Load entire codebase** - Search first, read targeted files
2. **Skip planning** - Always plan before implementing
3. **Use Opus for everything** - Reserve for complex tasks
4. **Sequential independent calls** - Use parallel when possible
5. **Request verbose output** - Ask for concise responses
6. **Ignore the SOP** - Keep it updated as you work

### ✅ DO:

1. **Search → Read → Implement** - Narrow focus progressively
2. **Plan → Confirm → Build** - Always get approval first
3. **Route intelligently** - Right model for right task
4. **Parallel everything** - Independent ops run simultaneously
5. **Cache aggressively** - Especially system prompts
6. **Update SOP** - Document as you go

---

## 📊 Success Metrics

Track these monthly:

**Cost Metrics:**
- Total AI spend
- Cost per request
- Cache hit rate (target: >70%)

**Quality Metrics:**
- Projects with complete SOPs (target: 100%)
- Planning defects found later (target: <5%)
- Time to reproduce project (target: <30min)

**Efficiency Metrics:**
- Model distribution (target: 70% cheap, 25% medium, 5% expensive)
- Parallel call usage (target: >50% when applicable)
- Token utilization (target: >80% relevant context)

---

## 🎓 When in Doubt

### Choosing a Model?

**Ask yourself:** "Could a junior developer do this?"
- **YES** → Use Flash/Haiku
- **NO** → Use Sonnet or higher

**Ask yourself:** "Is this production-critical?"
- **YES** → Use Opus
- **NO** → Use Sonnet

### Need to Load Context?

**Ask yourself:** "Do I need the whole file?"
- **YES** → Read entire file
- **NO** → Search for specific section, read only that

**Ask yourself:** "Can I search first?"
- **YES** → grep/search before reading
- **NO** → Read directly

### Planning Complete?

**Ask yourself:** "Can I explain this to someone else right now?"
- **YES** → Ready to implement
- **NO** → Keep planning

**Ask yourself:** "Have I considered edge cases?"
- **YES** → Ready to implement
- **NO** → Keep planning

---

## 🔧 Emergency Troubleshooting

### Rules Not Working

1. Check User Rules (not Project Rules)
2. Restart Cursor
3. Start new chat session

### Costs Too High

1. Check model usage in API dashboard
2. Verify caching is enabled
3. Review what context you're loading

### SOP Not Created

1. Manually ask: "Create the SOP file"
2. Copy from template
3. Verify SOP section in User Rules

---

## 💡 Pro Tips

1. **Group related queries** - Cache hits within 5 minutes
2. **Ask for structure first** - Then request implementation
3. **Review before running** - Cursor shows plan, verify it's right
4. **Use @ mentions** - Reference specific files/rules
5. **Monitor weekly** - First month especially
6. **Adjust thresholds** - Based on your real usage patterns

---

## 📞 Quick Links

- **Setup Guide:** `GLOBAL-RULES-SETUP.md`
- **Model Guide:** `docs/MODEL-SELECTION-GUIDE.md`
- **Token Guide:** `docs/TOKEN-OPTIMIZATION-GUIDE.md`
- **SOP Template:** `docs/SOP-TEMPLATE.md`
- **Main README:** `GLOBAL-RULES-README.md`

---

## 🎯 Daily Routine

### Morning (Project Start)

- [ ] Review yesterday's SOP updates
- [ ] Plan today's features
- [ ] Confirm architecture still sound

### During Development

- [ ] Plan each feature before implementing
- [ ] Use right model for each task
- [ ] Update SOP after major milestones

### Evening (Wrap Up)

- [ ] Update SOP with decisions made
- [ ] Document challenges solved
- [ ] Review AI usage/costs

---

## ⏱️ Time Savers

| Old Way | With Rules | Time Saved |
|---------|------------|------------|
| Read 10 files sequentially | Parallel read | 80% |
| Implement → fix bugs | Plan → implement | 50% |
| Re-explain context | Use cached prompts | 70% |
| Rebuild project from memory | Follow SOP | 90% |

---

## 💭 Remember

> "The fastest, cheapest token is the one you don't use."

> "Plan twice, code once."

> "Documentation that updates itself is the only documentation that stays current."

> "The right model for the right job—not the most expensive model for every job."

---

**Keep this card visible while working!**

**Version:** 1.0 | **Updated:** January 2026
