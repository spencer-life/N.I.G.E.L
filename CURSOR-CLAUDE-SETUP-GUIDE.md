# Setting Up Claude Best Practices in Cursor
**Make Claude optimization available to ALL new chats and projects**

---

## Overview

This guide helps you configure Cursor so that every new chat and project automatically has access to Claude 4.5 best practices, ensuring optimal prompting, cost efficiency, and response quality.

---

## Step-by-Step Setup

### Step 1: Locate Your Global Rules File

I've created a global rules file at:
```
C:\Users\MLPC\.cursor\GLOBAL-CURSOR-RULES.md
```

This file contains:
- ✅ Model selection guidance (Haiku/Sonnet/Opus)
- ✅ XML prompt structure templates
- ✅ Cost optimization patterns (caching, routing)
- ✅ Extended thinking guidelines
- ✅ RAG system patterns
- ✅ Common pitfalls to avoid

### Step 2: Configure Cursor Settings

#### Option A: Via Cursor Settings UI (Recommended)

1. **Open Cursor Settings**
   - Windows: `Ctrl+,` or `Ctrl+Shift+P` → "Preferences: Open Settings"
   - Mac: `Cmd+,`

2. **Search for "Rules"**
   - In the search bar, type: `cursor rules`
   - Look for settings related to AI behavior or Cursor Rules

3. **Add Global Rules**
   - If there's a "Global Rules" or "AI Rules" text field:
     - Copy contents of `GLOBAL-CURSOR-RULES.md`
     - Paste into the field
   - If there's a file path field:
     - Enter: `C:\Users\MLPC\.cursor\GLOBAL-CURSOR-RULES.md`

4. **Enable for All Projects**
   - Look for checkbox: "Apply rules to all projects"
   - Enable it

#### Option B: Via Settings JSON (Advanced)

1. **Open Settings JSON**
   - Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
   - Type: "Preferences: Open User Settings (JSON)"
   - Press Enter

2. **Add Configuration**
   ```json
   {
     // Other settings...
     
     "cursor.general.globalRules": "C:\\Users\\MLPC\\.cursor\\GLOBAL-CURSOR-RULES.md",
     "cursor.ai.useRulesFromWorkspace": true,
     "cursor.ai.applyGlobalRules": true
   }
   ```

3. **Save** (`Ctrl+S`)

### Step 3: Verify Setup

Test that it's working:

1. **Create a new chat in Cursor**
   - Press `Ctrl+L` (or your chat shortcut)

2. **Ask a Claude-specific question:**
   ```
   "I'm building a RAG system with Claude API. Which model should I use and how should I structure my prompts?"
   ```

3. **Expected behavior:**
   - Cursor should reference the best practices
   - Mention XML structure, prompt caching, hybrid routing
   - Suggest specific model IDs (claude-haiku-4-5-20251001, etc.)

---

## Project-Level Setup (Already Done for NIGEL)

Your current project already has:
- ✅ `.cursorrules` with Claude API guidance
- ✅ `CLAUDE-BEST-PRACTICES.md` comprehensive reference
- ✅ Working implementation in `RagService.ts`

Any new project can reference these patterns.

---

## Quick Reference for New Projects

When starting a new project that uses Claude API:

### 1. Copy Core Files
```bash
# Copy these to new project:
CLAUDE-BEST-PRACTICES.md
.cursorrules (optional, customize per project)
```

### 2. Use These Starter Patterns

#### Basic Claude API Setup
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// System prompt with caching
const systemPrompt = `<role>
Your specific role
</role>

<critical_rules>
1. Your specific rules
</critical_rules>`;

// Request with caching
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 4096,
  system: [{
    type: "text",
    text: systemPrompt,
    cache_control: { type: "ephemeral" }
  }],
  messages: [
    { role: "user", content: userMessage }
  ]
});
```

#### RAG System Template
```typescript
// 1. Search
const chunks = await vectorSearch(query, { limit: 15, threshold: 0.5 });

// 2. Analyze complexity
const complexity = analyzeComplexity(query, chunks);

// 3. Select model
const model = complexity > 40 
  ? "claude-sonnet-4-5-20250929" 
  : "claude-haiku-4-5-20251001";

// 4. Enable thinking if needed
const useThinking = complexity > 60;

// 5. Build request
const response = await anthropic.messages.create({
  model: model,
  thinking: useThinking ? { type: "enabled", budget_tokens: 8000 } : undefined,
  system: [{ text: systemPrompt, cache_control: { type: "ephemeral" } }],
  messages: [{ role: "user", content: buildContext(chunks, query) }]
});
```

#### Hybrid Routing Function
```typescript
function analyzeComplexity(query: string, context: any): number {
  let score = 0;
  
  // Length
  if (query.split(' ').length > 20) score += 15;
  
  // Keywords
  if (query.match(/compare|analyze|why|how.*apply/i)) score += 20;
  
  // Multiple questions
  if ((query.match(/\?/g) || []).length > 1) score += 15;
  
  // Multiple frameworks/concepts in context
  if (context.frameworks?.length >= 2) score += 20;
  
  return score;
}

function selectModel(complexity: number): string {
  if (complexity < 40) return 'claude-haiku-4-5-20251001';
  if (complexity < 70) return 'claude-sonnet-4-5-20250929';
  return 'claude-opus-4-5-20251101';
}
```

---

## Cost Monitoring

### In Anthropic Console
1. Go to: https://console.anthropic.com/
2. Navigate to "Usage" or "Billing"
3. Monitor:
   - Requests per model
   - Cache hit rates
   - Total spend

### Key Metrics to Watch
- **Cache hit rate**: Should be >50% for typical usage
- **Model distribution**: ~70% Haiku, ~25% Sonnet, ~5% Opus (adjust based on use case)
- **Average cost per request**: Should be <$0.015 with good routing

### Set Budget Alerts
1. In Anthropic Console → Settings → Billing
2. Set monthly budget alert (e.g., $100, $500)
3. Get notified before overages

---

## Troubleshooting

### Issue: Cursor not using global rules

**Solution:**
1. Check settings JSON syntax (no trailing commas)
2. Verify file path is correct
3. Restart Cursor completely
4. Check Cursor version (update if old)

### Issue: Rules not applying to new chats

**Solution:**
1. Make sure "Apply to all projects" is enabled
2. Try closing and reopening chat panel
3. Check if project-level `.cursorrules` is overriding

### Issue: Still getting generic Claude responses

**Solution:**
1. Add explicit instructions in your prompt:
   ```
   "Follow Claude 4.5 best practices: use XML structure, explain context..."
   ```
2. Reference the rules file explicitly:
   ```
   "Refer to CLAUDE-BEST-PRACTICES.md in my Cursor config"
   ```

---

## Updating the Rules

When Claude releases new features or you learn new patterns:

1. **Edit the global file:**
   ```
   C:\Users\MLPC\.cursor\GLOBAL-CURSOR-RULES.md
   ```

2. **Changes apply immediately** (no Cursor restart needed)

3. **Keep project-specific docs in sync:**
   ```
   CLAUDE-BEST-PRACTICES.md (in each project)
   ```

---

## Templates for Common Use Cases

### Discord Bot with Claude
```typescript
// See NIGEL project for complete implementation
// Key patterns:
// - Hybrid routing for cost optimization
// - Personality-driven prompts
// - No source citations (natural conversation)
// - Extended thinking for complex queries
```

### CLI Tool with Claude
```typescript
// Use Haiku for fast responses
const response = await anthropic.messages.create({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 1024,
  system: "You are a CLI assistant. Be concise.",
  messages: [{ role: "user", content: command }]
});
```

### Data Processing with Claude
```typescript
// Use Batch API for 50% cost savings
const batch = await anthropic.batches.create({
  requests: dataItems.map(item => ({
    custom_id: item.id,
    params: {
      model: "claude-haiku-4-5-20251001",
      messages: [{ role: "user", content: item.text }]
    }
  }))
});
```

---

## Resources

- **Global Rules**: `C:\Users\MLPC\.cursor\GLOBAL-CURSOR-RULES.md`
- **Full Guide**: `CLAUDE-BEST-PRACTICES.md` (this project)
- **NIGEL Implementation**: `src/services/RagService.ts` (reference implementation)
- **Claude Docs**: https://platform.claude.com/docs/en/home
- **Cookbook**: https://platform.claude.com/cookbooks

---

## Summary Checklist

Setup complete when:
- [ ] `GLOBAL-CURSOR-RULES.md` created
- [ ] Cursor settings configured (Settings UI or JSON)
- [ ] "Apply to all projects" enabled
- [ ] Tested with new chat (rules are applied)
- [ ] Project-level `.cursorrules` updated (if needed)
- [ ] Team members aware (if collaborative project)

---

**You're all set!** Every new Cursor chat and project will now have access to Claude 4.5 optimization best practices.
