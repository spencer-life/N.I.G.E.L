# Token Optimization Guide
**Maximize Efficiency & Minimize Costs Across All AI Models**

---

## Table of Contents
1. [Why Token Optimization Matters](#why-token-optimization-matters)
2. [Prompt Caching Strategy](#prompt-caching-strategy)
3. [Parallel Tool Calling](#parallel-tool-calling)
4. [Context Management](#context-management)
5. [Batch Operations](#batch-operations)
6. [Query Optimization](#query-optimization)
7. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
8. [Monitoring & Metrics](#monitoring--metrics)

---

## Why Token Optimization Matters

### Cost Impact
```
Example: Building a Medium-Sized Project
├─ Without Optimization: ~$150/month
│  └─ Opus for everything, no caching, sequential calls
│
├─ With Basic Optimization: ~$60/month (60% savings)
│  └─ Hybrid routing, some caching
│
└─ With Full Optimization: ~$20/month (87% savings)
   └─ Intelligent routing, caching, parallel calls, context management
```

### Performance Impact
- **Parallel calls**: 3-5x faster for independent operations
- **Caching**: Near-instant responses for repeated contexts
- **Context management**: Faster processing of relevant code only

---

## Prompt Caching Strategy

### How Prompt Caching Works

**Claude's Prompt Caching:**
- **Cache TTL:** 5 minutes
- **Cache Read Cost:** 90% cheaper than normal
- **Cache Write Cost:** 25% more expensive than normal
- **Break-even:** 2 requests (1st writes, 2nd+ read)

**When to Cache:**
1. **System prompts** (identical every request)
2. **Large context documents** (>2K tokens)
3. **Tool definitions** (unchanged across calls)
4. **RAG retrieved chunks** (if similar queries expected)
5. **Project documentation** (loaded multiple times)

### Implementation Example

```typescript
// ✅ Good: Cache system prompt
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-5-20250929",
  system: [
    {
      type: "text",
      text: systemPrompt, // Same every request
      cache_control: { type: "ephemeral" }
    }
  ],
  messages: [{
    role: "user",
    content: userQuery
  }]
});

// ✅ Good: Cache large context
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-5-20250929",
  system: [
    {
      type: "text",
      text: systemPrompt,
      cache_control: { type: "ephemeral" }
    }
  ],
  messages: [{
    role: "user",
    content: [
      {
        type: "text",
        text: largeCodebase, // Retrieved context
        cache_control: { type: "ephemeral" }
      },
      {
        type: "text",
        text: userQuery // Not cached (changes)
      }
    ]
  }]
});
```

### Cost Analysis

**Scenario: 10 requests in a session with 5K token system prompt**

**Without Caching:**
```
Request 1: 5,000 tokens × $3/M = $0.015
Request 2: 5,000 tokens × $3/M = $0.015
...
Request 10: 5,000 tokens × $3/M = $0.015

Total: $0.150
```

**With Caching:**
```
Request 1: 5,000 tokens × $3.75/M = $0.01875 (cache write)
Request 2: 5,000 tokens × $0.30/M = $0.0015 (cache read)
Request 3: 5,000 tokens × $0.30/M = $0.0015
...
Request 10: 5,000 tokens × $0.30/M = $0.0015

Total: $0.01875 + (9 × $0.0015) = $0.03225
```

**Savings: $0.118 (78% reduction)**

### Caching Best Practices

1. **Order matters**: Put cached content first in messages
2. **Cache boundaries**: Only cache content that won't change
3. **Size threshold**: Cache only if content is >1K tokens
4. **Session planning**: Group related queries together
5. **TTL awareness**: 5-minute window, re-cache if needed

---

## Parallel Tool Calling

### Sequential vs Parallel Execution

**❌ Sequential (Slow):**
```typescript
// Time: ~12 seconds
const file1 = await readFile('src/auth.ts');     // 3s
const file2 = await readFile('src/db.ts');       // 3s
const file3 = await readFile('src/utils.ts');    // 3s
const file4 = await readFile('src/config.ts');   // 3s
```

**✅ Parallel (Fast):**
```typescript
// Time: ~3 seconds (4x faster)
const [file1, file2, file3, file4] = await Promise.all([
  readFile('src/auth.ts'),
  readFile('src/db.ts'),
  readFile('src/utils.ts'),
  readFile('src/config.ts')
]);
```

### When to Use Parallel Calls

**Always parallel for:**
- Reading multiple independent files
- Multiple search queries
- Independent API calls
- Multiple grep operations
- Multiple codebase searches

**Never parallel for:**
- Second call depends on first result
- Sequential workflow steps
- File write then read operations
- Create then modify operations

### Examples

**✅ Good: Independent file reads**
```typescript
// AI Assistant should make these calls in parallel
Read file: src/auth/login.ts
Read file: src/auth/register.ts
Read file: src/auth/jwt.ts
```

**❌ Bad: Dependent operations**
```typescript
// These MUST be sequential
Read file: config.json          // Need to see structure first
Write file: config.json         // Then modify based on content
Read file: config.json          // Then verify changes
```

### Cost & Time Savings

**Example: Code review of 5 files**

**Sequential:**
- Time: 15 seconds (5 files × 3s each)
- User experience: Slow, frustrating

**Parallel:**
- Time: 3 seconds (all at once)
- User experience: Fast, responsive
- **Savings: 80% time reduction**

---

## Context Management

### Load Only What You Need

**❌ Anti-pattern: Load entire codebase**
```typescript
// Expensive: 50K tokens loaded
const allFiles = await readAllFiles('src/');
// Cost: ~$0.15 per request (with Sonnet)
```

**✅ Best practice: Load targeted files**
```typescript
// Efficient: 5K tokens loaded
const relevantFiles = await searchPattern('authentication');
const files = await readFiles(relevantFiles);
// Cost: ~$0.015 per request
// Savings: 90%
```

### Search Before Reading

**Strategy: Use grep/search to narrow focus**

```typescript
// Step 1: Search for relevant code
const searchResults = await grep('JWT_SECRET', 'src/');

// Step 2: Read only relevant files (not all files)
const files = await readFiles(searchResults.files);

// vs Reading entire src/ directory
```

**Cost Comparison:**
- Search: 100 tokens (~$0.0003)
- Read 3 relevant files: 3K tokens (~$0.009)
- **Total: $0.0093**

vs

- Read all 50 files: 50K tokens (~$0.15)
- **Savings: 94%**

### Conversation History Management

**Problem:** Long conversations accumulate context

**Solution: Summarize or truncate**

```typescript
// After 20+ exchanges
if (conversationTokens > 50000) {
  // Option 1: Summarize old context
  const summary = await summarizeConversation(oldMessages);
  
  // Option 2: Truncate and keep only recent
  const recentMessages = messages.slice(-10);
  
  // Option 3: Start fresh with key context only
  const newSession = {
    systemPrompt: systemPrompt,
    keyDecisions: extractDecisions(messages),
    currentTask: currentTask
  };
}
```

### File Reading Strategies

**Strategy 1: Read file sections**
```typescript
// ❌ Read entire 10K line file (5000 tokens)
const file = await readFile('src/large-service.ts');

// ✅ Read only relevant function (200 tokens)
const file = await readFile('src/large-service.ts', {
  startLine: 450,
  endLine: 500
});
// Savings: 96%
```

**Strategy 2: Use grep to find exact locations**
```typescript
// Find where function is defined
const location = await grep('function authenticateUser', 'src/');

// Read just that section
const code = await readFileSection(location.file, location.line, 50);
```

### Context Window Awareness

**Model Limits:**
- Claude Sonnet: 200K tokens (1M beta)
- Gemini Flash: 2M tokens
- Claude Opus: 200K tokens

**Best Practice:**
- Stay under 50% of limit for performance
- Claude: Keep requests under 100K tokens
- Gemini: Keep requests under 1M tokens

---

## Batch Operations

### When to Use Batch API

**Ideal for:**
- Bulk data processing (100+ items)
- Report generation (non-urgent)
- Knowledge base ingestion
- Code analysis across many files
- Non-real-time tasks (can wait 24h)

**Not ideal for:**
- User-facing features (need immediate response)
- Interactive development
- Debugging (need quick iterations)

### Cost Savings

**Batch API Discount: 50%**

**Example: Process 1000 documents**

**Real-time API:**
```
1000 requests × $0.015 each = $15.00
Processing time: 1-2 hours
```

**Batch API:**
```
1000 requests × $0.0075 each = $7.50
Processing time: 12-24 hours
Savings: 50%
```

### Implementation

```typescript
// Create batch job
const batch = await anthropic.batches.create({
  requests: [
    {
      custom_id: "doc-001",
      params: {
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1024,
        messages: [/* ... */]
      }
    },
    // ... 999 more
  ]
});

// Check status
const status = await anthropic.batches.retrieve(batch.id);

// Retrieve results when done
if (status.processing_status === 'ended') {
  const results = await anthropic.batches.results(batch.id);
}
```

---

## Query Optimization

### Minimize Output Tokens

**Problem:** Output tokens are 5x more expensive than input

**Claude Sonnet Pricing:**
- Input: $3/M tokens
- Output: $15/M tokens (5x more)

**Strategy: Request concise responses**

```typescript
// ❌ Verbose request
"Explain everything about JWT authentication including history, 
alternatives, use cases, examples, and best practices"

// Response: 3000 tokens @ $0.045

// ✅ Concise request
"List 5 JWT best practices for Node.js apps. One sentence each."

// Response: 200 tokens @ $0.003
// Savings: 93%
```

### Pre-fill Responses (Gemini)

**Technique:** Start the response for the model

```typescript
// User message
"Write a function to add two numbers."

// Pre-fill the start of response
"def add_numbers(a, b):"

// Model completes
"    return a + b"
```

**Benefit:** Skips "Sure! Here's the code..." preamble  
**Savings:** 20-50 tokens per response

### Structured Output Requests

```typescript
// ❌ Unstructured (Model adds formatting)
"Tell me about these files"

// Response includes markdown headers, bullet points, etc.
// Output: 500 tokens

// ✅ Structured (Direct to the point)
"List each file with one-line description. Format: filename: description"

// Response is compact, no extra formatting
// Output: 200 tokens
// Savings: 60%
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Reading Files You Don't Need

**❌ Bad:**
```typescript
// User asks: "How does authentication work?"

// AI reads:
- src/auth/login.ts
- src/auth/register.ts  
- src/auth/jwt.ts       
- src/database/users.ts  ← Not needed
- src/utils/hash.ts      ← Not needed
- src/config/env.ts      ← Not needed
- src/middleware/cors.ts ← Not needed

// Cost: 7 files × 1K tokens = 7K tokens
```

**✅ Good:**
```typescript
// AI searches first:
grep "authentication" src/

// Then reads only:
- src/auth/login.ts
- src/auth/register.ts
- src/auth/jwt.ts

// Cost: 3 files × 1K tokens = 3K tokens
// Savings: 57%
```

### Anti-Pattern 2: Repeated Context Without Caching

**❌ Bad:**
```typescript
// Session with 10 queries, same system prompt every time
Request 1: System prompt + query (5K tokens)
Request 2: System prompt + query (5K tokens)
...
Request 10: System prompt + query (5K tokens)

// Total input: 50K tokens
// Cost: $0.15
```

**✅ Good:**
```typescript
// Cache system prompt
Request 1: System prompt (cached) + query
Request 2-10: Cached prompt + query

// Total input: 5K (write) + 9×5K (read at 90% discount)
// Cost: $0.035
// Savings: 77%
```

### Anti-Pattern 3: Sequential Independent Operations

**❌ Bad:**
```typescript
// Each operation takes 3 seconds
await searchCodebase('authentication'); // 3s
await searchCodebase('database');       // 3s
await searchCodebase('validation');     // 3s

// Total time: 9 seconds
```

**✅ Good:**
```typescript
// All operations run simultaneously
const [auth, db, validation] = await Promise.all([
  searchCodebase('authentication'),
  searchCodebase('database'),
  searchCodebase('validation')
]);

// Total time: 3 seconds
// Savings: 67% time
```

### Anti-Pattern 4: Using Expensive Models for Simple Tasks

**❌ Bad:**
```typescript
// Using Opus for "What does this variable name mean?"
// Cost: $0.005 per query

// 100 simple queries/day = $0.50/day = $15/month
```

**✅ Good:**
```typescript
// Using Gemini Flash for simple lookups
// Cost: $0.0001 per query

// 100 queries/day = $0.01/day = $0.30/month
// Savings: 98%
```

### Anti-Pattern 5: Verbose Output Requests

**❌ Bad:**
```typescript
"Explain this code in detail with examples and alternatives"

// Output: 2000 tokens @ $0.030
```

**✅ Good:**
```typescript
"Explain this code in 3 sentences"

// Output: 100 tokens @ $0.0015
// Savings: 95%
```

---

## Monitoring & Metrics

### Key Metrics to Track

#### Cost Metrics
- **Cost per request** by model
- **Daily/weekly/monthly spend**
- **Cost per feature/task type**
- **Cache hit rate** (target: >70%)
- **Average tokens per request**

#### Performance Metrics
- **Response time** by model
- **Parallel call usage rate** (target: >50% when applicable)
- **Context loaded per request**
- **Success rate** by complexity tier

#### Efficiency Metrics
- **Token utilization rate** (relevant tokens / total tokens)
- **Cache efficiency** (cached tokens / total tokens)
- **Model routing accuracy** (correct model for task)

### Dashboard Example

```
┌─────────────────────────────────────────────────────┐
│  TOKEN OPTIMIZATION DASHBOARD - January 2026        │
├─────────────────────────────────────────────────────┤
│  Cost Metrics                                       │
│  ├─ Monthly Spend:        $23.45 / $100 budget     │
│  ├─ Avg Cost/Request:     $0.012                   │
│  ├─ Cache Hit Rate:       76% ✅                    │
│  └─ Savings vs No-Cache:  68% ✅                    │
├─────────────────────────────────────────────────────┤
│  Performance Metrics                                │
│  ├─ Avg Response Time:    2.3s                     │
│  ├─ Parallel Call Usage:  58% ✅                    │
│  └─ Success Rate:         94% ✅                    │
├─────────────────────────────────────────────────────┤
│  Model Distribution                                 │
│  ├─ Gemini Flash:  68% of requests (simple)        │
│  ├─ Sonnet:        27% of requests (complex)       │
│  └─ Opus:           5% of requests (critical)      │
├─────────────────────────────────────────────────────┤
│  Token Efficiency                                   │
│  ├─ Avg Input:      2,340 tokens                   │
│  ├─ Avg Output:       450 tokens                   │
│  └─ Utilization:      87% (high efficiency) ✅      │
└─────────────────────────────────────────────────────┘
```

### Optimization Targets

**Excellent Performance:**
- Cache hit rate: >70%
- Model routing: <10% over-provisioned
- Context utilization: >80% relevant
- Parallel calls: >50% when applicable
- Cost per request: <$0.015 average

**Good Performance:**
- Cache hit rate: 50-70%
- Model routing: 10-20% over-provisioned
- Context utilization: 60-80% relevant
- Parallel calls: 30-50% when applicable
- Cost per request: $0.015-$0.030 average

**Needs Improvement:**
- Cache hit rate: <50%
- Model routing: >20% over-provisioned
- Context utilization: <60% relevant
- Parallel calls: <30% when applicable
- Cost per request: >$0.030 average

---

## Quick Reference

### Pre-Flight Checklist

Before making an AI request, verify:

- [ ] **Model Selection**: Using cheapest model that can handle task?
- [ ] **Caching**: System prompt and large contexts cached?
- [ ] **Context**: Loading only files I need to read?
- [ ] **Parallel**: Can any operations run simultaneously?
- [ ] **Output**: Requesting concise response?
- [ ] **Search First**: Should I search before reading files?

### Cost-Cutting Quick Wins

1. **Enable caching** → 60-70% savings immediately
2. **Use cheaper models** for simple tasks → 70-80% savings
3. **Search before reading** → 50-90% fewer tokens loaded
4. **Request concise outputs** → 20-50% fewer output tokens
5. **Parallel tool calls** → 3-5x faster (time savings)

### Emergency Cost Reduction

If costs are too high:

1. **Check cache hit rate** - Should be >50%
2. **Audit model usage** - Are you using Opus too much?
3. **Review context loading** - Loading entire codebase?
4. **Examine output lengths** - Requesting verbose responses?
5. **Consider batch processing** - Can tasks wait for 50% discount?

---

## Summary

### Expected Results

With full optimization:
- **60-87% cost reduction** vs unoptimized usage
- **3-5x faster** response times for parallel operations
- **90% cache hit rates** in active sessions
- **Minimal quality impact** with intelligent routing

### Golden Rules

1. **Always cache** system prompts and large contexts
2. **Search first, read second** - don't load unnecessary files
3. **Use parallel calls** for independent operations
4. **Route intelligently** - cheap models for simple tasks
5. **Request concise** outputs - output tokens are 5x expensive
6. **Monitor costs** - track metrics and adjust

### Remember

> "The fastest, cheapest token is the one you don't use."

But don't sacrifice quality for cost. The goal is **optimal efficiency**, not minimal spending. Use the right tool for the job, just don't overpay when a cheaper option works just as well.

---

**Last Updated:** January 2026  
**Next Review:** Quarterly or when pricing changes
