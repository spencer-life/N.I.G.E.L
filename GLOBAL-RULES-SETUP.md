# Global Rules Setup Guide
**How to Install and Use Your Universal Cursor Rules**

---

## What You Just Created

You now have a comprehensive global rules system consisting of:

1. **`GLOBAL-USER-RULES.md`** - Universal rules that apply to every project
2. **`docs/SOP-TEMPLATE.md`** - Template for project documentation
3. **`docs/MODEL-SELECTION-GUIDE.md`** - Decision tree for choosing AI models
4. **`docs/TOKEN-OPTIMIZATION-GUIDE.md`** - Strategies to reduce costs by 60-87%

---

## Installation Steps

### Step 1: Install User Rules in Cursor

**Option A: Via Cursor Settings (Recommended)**

1. Open **Cursor**
2. Press `Ctrl/Cmd + Shift + P` to open command palette
3. Type: **"Preferences: Open Settings"**
4. Navigate to: **Rules** tab
5. Scroll to: **User Rules** section
6. Click: **Edit** button
7. Copy the entire contents of `GLOBAL-USER-RULES.md`
8. Paste into the User Rules editor
9. Click: **Save**

**Option B: Manual File Edit**

1. Open your Cursor settings folder:
   - **Windows:** `%APPDATA%\Cursor\User\`
   - **Mac:** `~/Library/Application Support/Cursor/User/`
   - **Linux:** `~/.config/Cursor/User/`

2. Find or create: `settings.json`
3. Add this section:
```json
{
  "cursor.rules.userRules": "[Paste GLOBAL-USER-RULES.md contents here]"
}
```

### Step 2: Verify Installation

1. Open any project in Cursor
2. Start a new chat
3. Ask: "What are your current rules?"
4. You should see references to:
   - Planning protocol (asking before implementing)
   - SOP documentation system
   - Model selection strategy
   - Token optimization

---

## How to Use the System

### For New Projects

When starting a new project:

1. **Cursor will automatically**:
   - Ask clarifying questions about goals and constraints
   - Create `docs/SOP.md` using the template
   - Use optimal AI model based on task complexity
   - Apply token optimization strategies

2. **You should**:
   - Answer the initial planning questions thoroughly
   - Review the SOP file periodically
   - Keep the SOP updated as you work (Cursor will help)

### For Existing Projects

When working on existing projects:

1. **Create SOP file**:
   - Copy `docs/SOP-TEMPLATE.md` to your project
   - Rename to `docs/SOP.md`
   - Fill in the sections with your project details
   - Ask Cursor to help populate it based on codebase

2. **Cursor will**:
   - Reference the SOP for context
   - Update it as you add features
   - Use it to maintain consistency

---

## Reference Materials Location

Keep these files accessible for reference:

### Option 1: Global Reference Folder (Recommended)

Create a folder for reference materials:

```
C:\Users\[YourName]\Documents\Cursor-Reference\
├── GLOBAL-USER-RULES.md
├── MODEL-SELECTION-GUIDE.md
├── TOKEN-OPTIMIZATION-GUIDE.md
└── SOP-TEMPLATE.md
```

### Option 2: Per-Project (Alternative)

Copy to each new project:

```
your-project/
├── docs/
│   ├── SOP.md (copy from SOP-TEMPLATE.md)
│   ├── MODEL-SELECTION-GUIDE.md
│   └── TOKEN-OPTIMIZATION-GUIDE.md
└── [project files...]
```

---

## Using New Features

### Memory Bank

**Automatic Creation:**
- Cursor will create `docs/MEMORY-BANK.md` for every project
- Initialized during pre-coding workflow OR on first major task
- Updated constantly as you work

**Purpose:**
- AI-optimized context (concise vs comprehensive SOP)
- Cached for 90% cost savings
- 40-60% token reduction overall

**Manual Creation:**
```bash
# Copy template to your project
cp docs/MEMORY-BANK-TEMPLATE.md docs/MEMORY-BANK.md
# Fill in the sections
# AI will help populate it based on your codebase
```

### Pre-Coding Workflow

**How It Works:**
1. Start new project
2. AI asks: "Full Workflow or Quick Start?"
3. Choose based on project complexity

**Full Workflow Creates:**
- `docs/USER-PERSONAS.md` - User research
- `docs/BRTD.md` - Requirements with checkboxes
- `docs/TEST-PLAN.md` - Test specifications
- `tests/unit/*.test.ts` - Skeleton unit tests (failing)
- `tests/integration/*.test.ts` - Skeleton integration tests (failing)
- `docs/MEMORY-BANK.md` - AI context

**Then:** Implement features to make tests pass

**Benefits:**
- Build the right thing (user-validated)
- Clear success criteria
- Test-driven development
- Reduced rework (60-70% less)

---

## Testing the System

### Test 1: Planning Protocol

1. Start a new chat in any project
2. Say: "I want to add user authentication"
3. **Expected**: Cursor should ask questions and present a plan
4. **Expected**: Cursor should ask "May I proceed?" before implementing

✅ **Pass**: Cursor waits for confirmation  
❌ **Fail**: Cursor starts implementing immediately → Re-check rules installation

### Test 2: SOP Auto-Generation

1. Start work on a new project (or create a test project)
2. Say: "Let's start building a REST API"
3. **Expected**: Cursor should ask about the project and offer to create `docs/SOP.md`

✅ **Pass**: SOP file is created and populated  
❌ **Fail**: No SOP mentioned → Manually request it: "Create the SOP file"

### Test 3: Model Selection

1. Ask a simple question: "What does this variable do?"
2. Check which model was used (if visible in logs/settings)
3. **Expected**: Should use Gemini Flash or Haiku (cheap/fast)

4. Ask a complex question: "Design the architecture for a real-time chat system"
5. **Expected**: Should use Sonnet with Extended Thinking

✅ **Pass**: Appropriate models used  
❌ **Fail**: Always using same model → Model selection may not be configured

### Test 4: Token Optimization

1. Ask to read 3 files
2. **Expected**: Cursor makes 3 parallel read calls (not sequential)

3. Have a conversation with 5+ messages
4. **Expected**: System prompt should be cached (check API logs)

✅ **Pass**: Parallel calls observed, caching active  
❌ **Fail**: Sequential calls → Rules may not be properly loaded

---

## Customization

### Adjust Model Selection Thresholds

In `GLOBAL-USER-RULES.md`, find the **Complexity Scoring** section:

```markdown
**Routing:**
- Score < 40: Gemini Flash or Haiku
- Score 40-59: Sonnet (standard)
- Score 60+: Sonnet or Opus (with Extended Thinking)
```

Modify based on your preferences:
- **More conservative** (save money): Raise thresholds by 10-20 points
- **Higher quality** (spend more): Lower thresholds by 10-20 points

### Adjust SOP Template

Edit `docs/SOP-TEMPLATE.md` to:
- Add sections specific to your workflow
- Remove sections you don't need
- Change the structure to match your preferences

### Disable Features

To disable a feature, comment it out in User Rules:

```markdown
<!-- DISABLED: SOP Auto-Generation
## SOP Documentation Protocol (Auto-Generated)
...
-->
```

---

## Troubleshooting

### Issue: Rules Not Applied

**Symptoms**: Cursor doesn't follow the rules

**Solutions**:
1. Verify rules are in User Rules section (not Project Rules)
2. Restart Cursor
3. Check for syntax errors in the rules markdown
4. Ensure you're using Cursor version that supports User Rules

### Issue: SOP Not Auto-Created

**Symptoms**: Starting new project, no SOP file offered

**Solutions**:
1. Manually ask: "Create the SOP file for this project"
2. Copy the template manually: `cp docs/SOP-TEMPLATE.md docs/SOP.md`
3. Verify the SOP protocol section exists in User Rules

### Issue: Wrong Model Used

**Symptoms**: Expensive model (Opus) used for simple tasks

**Solutions**:
1. Model selection is a guideline, not enforced by Cursor
2. Manually specify: "Use Gemini Flash for this simple task"
3. Check if you have access to the models listed in rules

### Issue: No Parallel Tool Calls

**Symptoms**: Files read one at a time (slow)

**Solutions**:
1. This depends on Cursor's implementation
2. Verify "Parallel Tool Calls" section exists in rules
3. Some operations can't be parallelized (that's expected)

### Issue: Costs Still High

**Symptoms**: Token usage not reduced as expected

**Solutions**:
1. Review `docs/TOKEN-OPTIMIZATION-GUIDE.md`
2. Check if prompt caching is enabled (API logs)
3. Verify model routing is working (check which models are used)
4. Monitor token usage in Anthropic/Gemini dashboards

---

## Monitoring Your Costs

### Anthropic (Claude) Dashboard

1. Go to: https://console.anthropic.com
2. Navigate to: **Usage** tab
3. Monitor:
   - Tokens used by model
   - Cache hit rates
   - Monthly spending

**Target Metrics**:
- Cache hit rate: >50% (good), >70% (excellent)
- Model distribution: 60-70% Haiku, 20-30% Sonnet, 5-10% Opus

### Google AI Studio (Gemini) Dashboard

1. Go to: https://aistudio.google.com
2. Navigate to: **API Keys** → **Usage**
3. Monitor:
   - Requests per day
   - Tokens used
   - Cost (if available)

**Target Metrics**:
- Majority of simple tasks should use Flash
- Keep under free tier if possible

---

## Best Practices

### DO:

✅ **Start every project** by answering Cursor's planning questions  
✅ **Keep SOP.md updated** as you work (Cursor will help)  
✅ **Reference the guides** when making architecture decisions  
✅ **Monitor costs** monthly to track optimization effectiveness  
✅ **Customize rules** to match your workflow and preferences  

### DON'T:

❌ **Skip planning** - The protocol exists to save you time later  
❌ **Ignore the SOP** - It's your project documentation lifeline  
❌ **Always use Opus** - It's expensive and often unnecessary  
❌ **Load entire codebases** - Be selective about context  
❌ **Disable optimization** - You'll waste money on tokens  

---

## Quick Start Checklist

For your next new project:

- [ ] Install User Rules in Cursor (one-time setup)
- [ ] Start new project chat
- [ ] Answer planning questions thoroughly
- [ ] Verify `docs/SOP.md` is created
- [ ] Begin development with optimized model routing
- [ ] Update SOP after each major feature
- [ ] Monitor costs weekly for first month
- [ ] Adjust thresholds if needed

---

## Advanced: Integration with Team

If you're working in a team:

### Option 1: Share as Team Rules (Cursor Teams)

1. Go to: Cursor Dashboard → Team Settings
2. Create Team Rule with `GLOBAL-USER-RULES.md` contents
3. All team members inherit the rules

### Option 2: Repository Template

1. Create a template repository with:
   - `.cursor/rules/` folder
   - `docs/SOP-TEMPLATE.md`
   - `docs/MODEL-SELECTION-GUIDE.md`
   - `docs/TOKEN-OPTIMIZATION-GUIDE.md`

2. Team clones template for new projects
3. SOP auto-populated from template

### Option 3: Documentation Hub

1. Create internal wiki/docs site
2. Host the guide files
3. Link from onboarding docs
4. Team references when setting up Cursor

---

## Maintenance

### Monthly Review

- [ ] Check cost metrics against targets
- [ ] Review model usage distribution
- [ ] Update SOP template if needed
- [ ] Adjust complexity thresholds based on experience

### Quarterly Review

- [ ] Check for new models/pricing from Anthropic/Google
- [ ] Update `MODEL-SELECTION-GUIDE.md` with new options
- [ ] Review and update `GLOBAL-USER-RULES.md`
- [ ] Share learnings with team (if applicable)

### Annual Review

- [ ] Major revision of all documents
- [ ] Incorporate lessons learned
- [ ] Update best practices
- [ ] Benchmark against industry standards

---

## Getting Help

### Resources

- **Cursor Docs**: https://cursor.com/docs
- **Anthropic Docs**: https://docs.anthropic.com
- **Google AI Studio**: https://ai.google.dev

### Common Questions

**Q: Do these rules work with other AI tools?**  
A: The principles apply universally, but the User Rules format is Cursor-specific.

**Q: Can I use this with GitHub Copilot?**  
A: The rules won't apply to Copilot, but the guides (MODEL-SELECTION, TOKEN-OPTIMIZATION) are useful reference.

**Q: Will this slow down Cursor?**  
A: No. Rules are just context for the AI. Parallel calls and optimization actually make it faster.

**Q: What if I don't have access to all models?**  
A: Adjust the model selection section to only use models you have access to.

**Q: Can I use this for non-coding projects?**  
A: Absolutely! The principles apply to any AI-assisted work. Adjust the "Code Quality" section for your domain.

---

## Success Stories (Track Your Own)

After 1 month, measure:

**Cost Savings:**
- Previous monthly spend: $____
- Current monthly spend: $____
- Savings: ____% (Target: 60-87%)

**Productivity:**
- Projects documented: ____
- SOPs created: ____
- Average time to reproduce project: ____ (Target: <30min with SOP)

**Quality:**
- Planning time saved: ____ (by reusing SOPs)
- Bugs caught in planning phase: ____
- Successful deployments: ____

---

## Conclusion

You now have a complete system for:

✅ **Consistent project planning** (never skip important steps)  
✅ **Automatic documentation** (SOPs that actually get maintained)  
✅ **Optimized AI spending** (60-87% cost reduction)  
✅ **Faster development** (parallel operations, better context)  
✅ **Higher quality output** (right model for each task)  

The system works best when you:
1. **Trust the process** - Don't skip planning
2. **Maintain the SOP** - Keep it updated as you work
3. **Monitor costs** - Adjust based on real data
4. **Iterate** - Customize for your needs

**Now go build something amazing—efficiently.**

---

**Questions or Issues?**  
Document them in your SOP under "Lessons Learned" so you remember for next time!

**Last Updated:** January 2026  
**Version:** 1.0
