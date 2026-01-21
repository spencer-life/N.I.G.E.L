# AI Model Selection Guide
**Intelligent Routing for Cost & Performance Optimization**

---

## Quick Decision Tree

```
┌─────────────────────────────────────────┐
│   Evaluate Task Complexity              │
└─────────────┬───────────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Is it a simple      │
    │ lookup/edit with    │ YES  ┌──────────────────────┐
    │ minimal context?    ├─────►│ Gemini Flash 3 Pro   │
    │                     │      │ or                   │
    └─────────┬───────────┘      │ Haiku 4.5 Extended   │
              │ NO               └──────────────────────┘
              ▼
    ┌─────────────────────┐
    │ Does it require     │
    │ complex reasoning   │ YES
    │ across multiple     ├─────┐
    │ concepts?           │     │
    └─────────┬───────────┘     │
              │ NO              ▼
              │        ┌──────────────────────┐
              │        │ Is it debugging or   │
              │        │ mission-critical     │ YES  ┌──────────────────────┐
              │        │ requiring maximum    ├─────►│ Opus 4.5            │
              │        │ accuracy?            │      │ Extended Thinking   │
              │        └─────────┬────────────┘      └──────────────────────┘
              │                  │ NO
              │                  ▼
              │        ┌──────────────────────┐
              │        │ Sonnet 4.5          │
              │        │ Extended Thinking   │
              │        │ (if score 60+)      │
              │        └──────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Sonnet 4.5          │
    │ (Standard)          │
    │ Default for most    │
    │ development tasks   │
    └─────────────────────┘
```

---

## Complexity Scoring System

### Scoring Formula

Calculate a complexity score (0-100) based on these factors:

| Factor | Points | When to Apply |
|--------|--------|---------------|
| **Query Length** | +15 | Query > 200 characters |
| **Multiple Frameworks/Concepts** | +20 | References 2+ distinct systems/patterns |
| **Comparison Keywords** | +20 | Contains: "compare", "analyze", "evaluate", "versus" |
| **Multiple Questions** | +15 each | Each distinct question mark or subquestion |
| **Code Review/Refactoring** | +25 | Involves reviewing or restructuring existing code |
| **Multi-step Planning** | +30 | Requires sequential dependent steps |
| **Debugging Context** | +35 | Troubleshooting production or complex issues |
| **Research/Synthesis** | +25 | Requires combining multiple sources |
| **Strategic Decisions** | +30 | Business impact or architectural choices |
| **Database/Schema Changes** | +25 | Modifying data structures or migrations |
| **Integration Work** | +20 | Connecting multiple services/APIs |
| **Security/Performance** | +20 | Critical optimization or security work |

### Routing Decision

```typescript
function selectModel(complexityScore: number): ModelConfig {
  if (complexityScore < 40) {
    return {
      model: 'gemini-3.0-flash-001', // or 'claude-haiku-4-5-20251001'
      thinking: { enabled: true }, // Extended thinking
      reason: 'Simple task - optimize for speed and cost'
    };
  }
  
  if (complexityScore >= 40 && complexityScore < 60) {
    return {
      model: 'claude-sonnet-4-5-20250929',
      thinking: { enabled: false },
      reason: 'Moderate complexity - balanced approach'
    };
  }
  
  if (complexityScore >= 60 && complexityScore < 80) {
    return {
      model: 'claude-sonnet-4-5-20250929',
      thinking: { 
        enabled: true,
        budget_tokens: 8000 
      },
      reason: 'Complex task - enable deep reasoning'
    };
  }
  
  // Score 80+
  return {
    model: 'claude-opus-4-5-20251101',
    thinking: { 
      enabled: true,
      budget_tokens: 10000 
    },
    reason: 'Critical/debugging - maximum intelligence required'
  };
}
```

---

## Model Profiles

### Gemini Flash 3 Pro

**API ID:** `gemini-3.0-flash-001`

**Cost:** Lowest (exact pricing varies, check current rates)

**Strengths:**
- Blazing fast response times (<1s typical)
- Excellent for high-volume operations
- Strong JSON mode and structured output
- Good at content extraction
- Cost-effective for simple tasks

**Best For:**
- Quick code lookups
- Simple CRUD operations
- Content extraction from documents
- High-frequency API calls
- Straightforward implementations
- Documentation updates
- Simple refactoring (renaming, formatting)

**Limitations:**
- Limited deep reasoning capability
- May struggle with complex multi-step tasks
- Less effective for nuanced code review
- Not ideal for architectural decisions

**Example Tasks:**
```
✅ "Extract all email addresses from this text"
✅ "Create a simple REST endpoint for user login"
✅ "Format this JSON data"
✅ "What does this function do?"
✅ "Fix this typo in variable names"
```

**Configuration:**
```typescript
{
  model: 'gemini-3.0-flash-001',
  temperature: 1.0, // DON'T lower for Gemini
  maxOutputTokens: 8192
}
```

---

### Haiku 4.5 Extended Thinking

**API ID:** `claude-haiku-4-5-20251001`

**Cost:** $1/M input, $5/M output

**Strengths:**
- Fast responses (2-3s typical)
- Extended thinking capability
- Good code understanding
- Strong instruction following
- Excellent cost-to-quality ratio

**Best For:**
- Simple-to-moderate coding tasks
- Content generation
- Data processing
- Moderate refactoring
- Quick analysis
- Testing and validation

**Limitations:**
- Not as strong on complex reasoning as Sonnet/Opus
- May miss nuances in complex architectures
- Less creative than larger models

**Example Tasks:**
```
✅ "Write unit tests for this function"
✅ "Add error handling to this API endpoint"
✅ "Explain this code snippet"
✅ "Create a utility function for date formatting"
✅ "Review this PR for basic issues"
```

**Configuration:**
```typescript
{
  model: 'claude-haiku-4-5-20251001',
  thinking: { enabled: true },
  max_tokens: 4096
}
```

---

### Sonnet 4.5 (Standard & Extended Thinking)

**API ID:** `claude-sonnet-4-5-20250929`

**Cost:** $3/M input, $15/M output

**Strengths:**
- Excellent balance of capability and cost
- Strong coding and reasoning
- Good at multi-step tasks
- Effective code review
- Reliable instruction following
- Context window: 200K (1M in beta)

**Best For:**
- Most development tasks (default choice)
- Feature implementation
- Code review and refactoring
- API design
- Multi-step planning
- RAG systems
- Complex analysis (with Extended Thinking)

**When to Enable Extended Thinking:**
- Complexity score 60+
- Multi-framework comparisons
- Architectural planning
- Complex debugging scenarios
- Strategic code refactoring

**Example Tasks:**
```
✅ "Design a user authentication system with JWT and refresh tokens"
✅ "Refactor this service layer to follow SOLID principles"
✅ "Review this PR for security vulnerabilities"
✅ "Create a database migration strategy for this schema change"
✅ "Implement a caching layer with Redis"
✅ "Plan the architecture for a real-time chat feature"
```

**Configuration:**
```typescript
// Standard (Score 40-59)
{
  model: 'claude-sonnet-4-5-20250929',
  thinking: { enabled: false },
  max_tokens: 8192
}

// Extended Thinking (Score 60-79)
{
  model: 'claude-sonnet-4-5-20250929',
  thinking: { 
    enabled: true,
    budget_tokens: 8000 
  },
  max_tokens: 16000
}
```

---

### Opus 4.5 Extended Thinking

**API ID:** `claude-opus-4-5-20251101`

**Cost:** $5/M input, $25/M output (highest)

**Strengths:**
- Maximum intelligence and reasoning
- Best for complex debugging
- Excellent research and synthesis
- Highest creativity
- Most nuanced understanding
- Superior at catching edge cases

**Best For:**
- Complex production debugging
- Mission-critical implementations
- Deep architectural decisions
- Research and synthesis tasks
- Maximum accuracy requirements
- Complex optimization problems

**When to Use:**
- Complexity score 80+
- Production bugs that are hard to reproduce
- Strategic business-impacting decisions
- When cost is secondary to quality
- Complex security analysis
- Deep performance optimization

**Example Tasks:**
```
✅ "Debug this race condition in our distributed system"
✅ "Analyze the security implications of this architecture"
✅ "Design a fault-tolerant microservices architecture"
✅ "Optimize this algorithm from O(n²) to O(n log n)"
✅ "Research and recommend the best approach for real-time collaboration"
✅ "Strategic decision: monolith vs microservices for our scale"
```

**Configuration:**
```typescript
{
  model: 'claude-opus-4-5-20251101',
  thinking: { 
    enabled: true,
    budget_tokens: 10000 
  },
  max_tokens: 16000
}
```

---

## Cost Comparison Examples

### Scenario 1: Simple API Endpoint
**Task:** "Create a GET endpoint that returns user data"

**With Gemini Flash:**
- Cost: ~$0.0001 per request
- Time: 1s
- **Best Choice** ✅

**With Sonnet:**
- Cost: ~$0.003 per request (30x more)
- Time: 3s
- Unnecessary for this task

---

### Scenario 2: Complex Refactoring
**Task:** "Refactor this service layer to use dependency injection, add proper error handling, and implement retry logic"

**With Haiku:**
- Cost: ~$0.001 per request
- Quality: May miss edge cases
- Not recommended

**With Sonnet + Extended Thinking:**
- Cost: ~$0.015 per request
- Quality: Excellent, catches edge cases
- **Best Choice** ✅

**With Opus:**
- Cost: ~$0.050 per request (3x more than Sonnet)
- Quality: Marginally better
- Overkill for this task

---

### Scenario 3: Production Debugging
**Task:** "Debug intermittent crashes in production with complex race condition"

**With Sonnet:**
- Cost: ~$0.020 per request
- Quality: Good, but may miss subtle issues
- Risk: Might not find root cause

**With Opus + Extended Thinking:**
- Cost: ~$0.080 per request
- Quality: Excellent, thorough analysis
- **Best Choice** ✅ (cost worth it for production stability)

---

## Monthly Cost Projections

### Low Usage (100 requests/month)
- **All Gemini Flash:** ~$0.01/month
- **All Haiku:** ~$0.10/month
- **All Sonnet:** ~$3.00/month
- **All Opus:** ~$10.00/month
- **Intelligent Routing:** ~$1.00/month (70% savings)

### Medium Usage (500 requests/month)
- **All Gemini Flash:** ~$0.05/month
- **All Haiku:** ~$0.50/month
- **All Sonnet:** ~$15.00/month
- **All Opus:** ~$50.00/month
- **Intelligent Routing:** ~$5.00/month (67% savings)

### High Usage (2000 requests/month)
- **All Gemini Flash:** ~$0.20/month
- **All Haiku:** ~$2.00/month
- **All Sonnet:** ~$60.00/month
- **All Opus:** ~$200.00/month
- **Intelligent Routing:** ~$20.00/month (67% savings)

---

## Optimization Strategies

### 1. Prompt Caching (90% Savings)
**How it works:**
- First request: Full cost + 25% cache write
- Subsequent requests (within 5min): 90% discount on cached portion

**What to cache:**
- System prompts (same every time)
- Large context documents
- Tool definitions
- RAG retrieved chunks (if similar queries)

**Example:**
```typescript
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-5-20250929",
  system: [
    {
      type: "text",
      text: systemPrompt, // Cached
      cache_control: { type: "ephemeral" }
    }
  ],
  messages: [/* user messages */]
});
```

**Impact:**
- First query: $0.026
- Cached queries: $0.010
- **Savings: ~60% in typical sessions**

---

### 2. Hybrid Routing (60-80% Savings)
**Strategy:** Use cheap models for simple tasks, expensive for complex

**Implementation:**
```typescript
function selectModel(task: string) {
  const score = calculateComplexity(task);
  
  if (score < 40) return 'gemini-flash'; // 70% of tasks
  if (score < 60) return 'sonnet'; // 20% of tasks
  return 'opus'; // 10% of tasks
}
```

**Real-world distribution:**
- 70% tasks → Flash/Haiku (~$0.001 each)
- 20% tasks → Sonnet (~$0.015 each)
- 10% tasks → Opus (~$0.080 each)

**Average cost per task:** ~$0.012 (vs $0.080 all-Opus)
**Savings: 85%**

---

### 3. Context Management (40-60% Savings)
**Techniques:**
- Only load files you need to read
- Use grep/search before reading large files
- Don't include entire conversation history
- Summarize or compress old context

**Example:**
```typescript
// ❌ Bad: Load entire codebase
const files = await loadAllFiles();

// ✅ Good: Load only relevant files
const relevantFiles = await searchForPattern(query);
const files = await loadFiles(relevantFiles);
```

---

### 4. Batch Operations (50% Savings)
**Use Cases:**
- Bulk data processing
- Report generation
- Knowledge base ingestion
- Non-time-sensitive tasks

**Example:**
```typescript
const batch = await anthropic.batches.create({
  requests: [
    { custom_id: "req1", params: { /* ... */ } },
    { custom_id: "req2", params: { /* ... */ } }
  ]
});
```

**Savings: 50% discount vs real-time API**

---

## Real-World Examples

### Example 1: Building a REST API

**Task Breakdown:**

1. **Planning the API structure** (Complexity: 65)
   - Model: Sonnet 4.5 Extended Thinking
   - Cost: ~$0.020
   - Why: Multi-step architectural planning

2. **Creating basic CRUD endpoints** (Complexity: 25)
   - Model: Gemini Flash 3 Pro
   - Cost: ~$0.0002 per endpoint
   - Why: Straightforward implementation

3. **Adding authentication** (Complexity: 55)
   - Model: Sonnet 4.5 (standard)
   - Cost: ~$0.010
   - Why: Moderate complexity, security consideration

4. **Code review** (Complexity: 45)
   - Model: Sonnet 4.5 (standard)
   - Cost: ~$0.012
   - Why: Needs good judgment, but not extreme

5. **Debugging production issue** (Complexity: 85)
   - Model: Opus 4.5 Extended Thinking
   - Cost: ~$0.090
   - Why: Critical, complex problem

**Total Cost:** ~$0.132  
**If all Opus:** ~$0.450 (3.4x more expensive)  
**Savings: 71%**

---

### Example 2: Database Migration

**Task Breakdown:**

1. **Design new schema** (Complexity: 70)
   - Model: Sonnet 4.5 Extended Thinking
   - Cost: ~$0.025

2. **Write migration SQL** (Complexity: 40)
   - Model: Sonnet 4.5 (standard)
   - Cost: ~$0.008

3. **Create rollback plan** (Complexity: 55)
   - Model: Sonnet 4.5 (standard)
   - Cost: ~$0.012

4. **Test on staging** (Complexity: 30)
   - Model: Haiku 4.5
   - Cost: ~$0.003

5. **Debug migration failure** (Complexity: 88)
   - Model: Opus 4.5 Extended Thinking
   - Cost: ~$0.095

**Total Cost:** ~$0.143  
**If all Opus:** ~$0.475 (3.3x more expensive)  
**Savings: 70%**

---

## Monitoring & Adjustment

### Track These Metrics

**Cost Metrics:**
- Cost per request by model
- Total monthly spend
- Cost per feature/task type
- Cache hit rate

**Quality Metrics:**
- Task completion success rate
- Number of retries needed
- Time to complete tasks
- User satisfaction (your experience)

**Efficiency Metrics:**
- Average complexity score distribution
- Model usage distribution
- Tokens used per request
- Response time by model

### Adjustment Triggers

**Increase model tier if:**
- Success rate < 85% for complexity bracket
- Frequent retries needed (>20%)
- Tasks taking significantly longer
- Quality is noticeably lower

**Decrease model tier if:**
- Success rate > 95% consistently
- Tasks completing faster than needed
- Cost is a concern and quality is adequate

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────┐
│  TASK TYPE              │  MODEL         │  EST. COST  │
├────────────────────────────────────────────────────────┤
│  Simple lookup          │  Flash/Haiku   │  $0.0001   │
│  Basic CRUD             │  Flash/Haiku   │  $0.0003   │
│  Simple refactor        │  Flash/Haiku   │  $0.0005   │
│  Code review (basic)    │  Haiku         │  $0.001    │
│  Feature planning       │  Sonnet        │  $0.010    │
│  Complex implementation │  Sonnet+Think  │  $0.020    │
│  Architecture design    │  Sonnet+Think  │  $0.025    │
│  Deep debugging         │  Opus+Think    │  $0.090    │
│  Research & synthesis   │  Opus+Think    │  $0.100    │
└────────────────────────────────────────────────────────┘
```

---

## Summary

### Golden Rules

1. **Default to Sonnet** for most development work
2. **Use Flash/Haiku** for simple, well-defined tasks
3. **Escalate to Opus** for debugging and critical decisions
4. **Enable Extended Thinking** for complexity score 60+
5. **Always use prompt caching** for system prompts
6. **Track your costs** and adjust thresholds as needed

### Expected Savings

With intelligent routing:
- **60-70% cost reduction** vs using only Sonnet
- **70-85% cost reduction** vs using only Opus
- **Minimal quality impact** when routing is correct

### When in Doubt

**Ask yourself:**
- "Could I explain this task to a junior developer?"
  - YES → Use Flash/Haiku
  - NO → Use Sonnet or higher

- "Is this production-critical or very complex?"
  - YES → Use Opus
  - NO → Use Sonnet

- "Does this require deep multi-step reasoning?"
  - YES → Enable Extended Thinking
  - NO → Standard mode is fine

---

**Last Updated:** January 2026  
**Next Review:** As model pricing/capabilities change
