# Claude API Best Practices Guide
**For Claude 4.5 Models (Opus, Sonnet, Haiku)**  
*Reference: [Claude Documentation](https://platform.claude.com/docs/en/home)*

---

## Table of Contents
1. [Model Selection](#model-selection)
2. [Prompting Best Practices](#prompting-best-practices)
3. [Cost Optimization](#cost-optimization)
4. [RAG Systems](#rag-systems)
5. [Agent & Tool Use](#agent--tool-use)
6. [Common Pitfalls](#common-pitfalls)

---

## Model Selection

### Available Models (2026)

| Model | API ID | Pricing (per 1M tokens) | Best For |
|-------|--------|------------------------|----------|
| **Haiku 4.5** | `claude-haiku-4-5-20251001` | $1 in / $5 out | Fast responses, simple tasks, high volume |
| **Sonnet 4.5** | `claude-sonnet-4-5-20250929` | $3 in / $15 out | Complex reasoning, coding, balanced use |
| **Opus 4.5** | `claude-opus-4-5-20251101` | $5 in / $25 out | Maximum intelligence, research, complex analysis |

**Aliases** (auto-update to latest version):
- `claude-haiku-4-5`
- `claude-sonnet-4-5`
- `claude-opus-4-5`

### Model Features Comparison

| Feature | Haiku 4.5 | Sonnet 4.5 | Opus 4.5 |
|---------|-----------|------------|----------|
| Extended Thinking | ✅ Yes | ✅ Yes | ✅ Yes |
| Context Window | 200K | 200K (1M beta) | 200K |
| Max Output | 64K | 64K | 64K |
| Prompt Caching | ✅ Yes | ✅ Yes | ✅ Yes |
| Best Latency | Fastest | Fast | Moderate |
| Vision | Good | Excellent | Best |
| Computer Use | ❌ No | ✅ Yes | ✅ Yes |

### When to Use Which Model

**Haiku 4.5** - Use for:
- Simple Q&A and lookups
- Content filtering/moderation
- Data extraction from documents
- High-volume operations (>1000 req/day)
- Real-time chat responses

**Sonnet 4.5** - Use for:
- Complex reasoning and analysis
- Code generation and review
- Multi-step problem solving
- RAG systems (most queries)
- Agent applications

**Opus 4.5** - Use for:
- Research and synthesis
- Complex coding projects
- Strategic decision making
- When accuracy is critical
- Document creation with high creativity

### Hybrid Routing Pattern

For cost optimization, implement intelligent routing:

```typescript
function selectModel(query: string, context: any): string {
  let score = 0;
  
  // Complexity indicators
  if (query.length > 200) score += 15;
  if (query.includes('compare') || query.includes('analyze')) score += 20;
  if (query.split('?').length > 1) score += 15;
  if (context.multipleFrameworks) score += 20;
  
  // Route based on complexity
  if (score < 40) return 'claude-haiku-4-5-20251001';
  if (score < 70) return 'claude-sonnet-4-5-20250929';
  return 'claude-opus-4-5-20251101';
}
```

---

## Prompting Best Practices

### Core Principles (Claude 4.x)

#### 1. Be Explicit with Instructions

Claude 4.x models follow instructions precisely - vagueness leads to generic outputs.

❌ **Less Effective:**
```text
Create a dashboard
```

✅ **More Effective:**
```text
Create an analytics dashboard. Include as many relevant features and interactions as possible. Go beyond the basics to create a fully-featured implementation.
```

#### 2. Provide Context for WHY

Explaining the motivation behind instructions helps Claude understand your goals.

❌ **Less Effective:**
```text
NEVER use ellipses
```

✅ **More Effective:**
```text
Your response will be read aloud by text-to-speech, so never use ellipses since TTS engines cannot pronounce them properly.
```

#### 3. Use XML Tags for Structure

Claude 4.x responds better to XML-structured prompts.

```xml
<task>
Analyze this code for security vulnerabilities
</task>

<code>
${codeHere}
</code>

<requirements>
- Focus on SQL injection risks
- Check authentication flows
- Identify exposed secrets
</requirements>
```

### Prompt Template (System Prompt)

```text
<role>
You are [SPECIFIC ROLE with context about why this matters].
</role>

<personality>
[Define communication style with reasoning]
Example: "Use short, concrete sentences because users are reading on mobile where brevity matters."
</personality>

<expertise>
[List specific knowledge domains]
</expertise>

<response_guidelines>
1. [ACTION VERB] - what to do first
2. [ACTION VERB] - what to do next
3. [ACTION VERB] - how to format output
</response_guidelines>

<critical_rules>
- [Rule with explanation of why it matters]
- [Rule with specific formatting guidance]
</critical_rules>
```

### Formatting Control

Claude 4.x can converge on generic "AI slop" aesthetics. Control this explicitly:

```text
<avoid_excessive_markdown>
Write in clear, flowing prose using complete paragraphs and sentences. Use standard paragraph breaks for organization. Reserve markdown primarily for code blocks and simple headings.

DO NOT use ordered lists (1. ...) or unordered lists (*) unless:
a) Presenting truly discrete items where a list is best, or
b) User explicitly requests a list

Instead, incorporate information naturally into sentences. Using prose instead of excessive formatting improves readability.
</avoid_excessive_markdown>
```

### Extended Thinking

Enable for complex reasoning (Sonnet/Opus only):

```typescript
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 16000,
  thinking: {
    type: "enabled",
    budget_tokens: 8000  // Allow thinking budget
  },
  messages: [...]
});
```

**When to enable:**
- Multi-step reasoning required
- Comparing multiple frameworks/concepts
- Complex debugging or analysis
- Strategic planning tasks

**Note:** Thinking tokens are charged at standard rates but significantly improve output quality.

### Avoid "Think" Terminology

Claude Opus 4.5 is sensitive to the word "think" when extended thinking is disabled.

❌ Avoid: "Think about...", "Think through..."  
✅ Use: "Consider...", "Evaluate...", "Analyze..."

---

## Cost Optimization

### 1. Prompt Caching

**Massive savings**: Cache reads cost 90% less, cache writes cost 25% more.  
**Cache TTL**: 5 minutes

```typescript
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-5-20250929",
  system: [
    {
      type: "text",
      text: systemPrompt,  // Cached - same every request
      cache_control: { type: "ephemeral" }
    }
  ],
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: longContext,  // Cache if similar queries expected
          cache_control: { type: "ephemeral" }
        }
      ]
    }
  ]
});
```

**What to cache:**
- System prompts (identical every request)
- Large context documents
- RAG retrieved chunks (if similar queries)
- Tool definitions
- Few-shot examples

**Cost Impact Example:**
- First query: $0.026 (+ 25% cache write)
- Cached queries: $0.010 (90% savings on cached portions)
- **Overall savings: ~60% in typical sessions**

### 2. Batch API

For non-time-sensitive tasks: **50% discount**

Use for:
- Bulk data processing
- Report generation
- Analytics
- Knowledge base ingestion

```typescript
const batch = await anthropic.batches.create({
  requests: [
    { custom_id: "req1", params: { model: "claude-haiku-4-5", ... } },
    { custom_id: "req2", params: { model: "claude-haiku-4-5", ... } }
  ]
});
```

### 3. Hybrid Model Routing

Use cheaper models for simpler tasks:

| Pattern | Potential Savings |
|---------|-------------------|
| Haiku for simple → Sonnet for complex | ~70% |
| Sonnet for most → Opus for critical | ~40% |
| All three with routing | ~60-80% |

### 4. Context Window Management

- **Use 200K context** for most tasks
- **Enable 1M context** (beta) only when needed - costs more
- Compress context when possible
- Remove unnecessary history

---

## RAG Systems

### Architecture Pattern

```typescript
// 1. Generate query embedding
const embedding = await generateEmbedding(query);

// 2. Vector search
const chunks = await vectorDB.search(embedding, {
  limit: 15,
  threshold: 0.5  // Lower = more results
});

// 3. Analyze complexity
const complexity = analyzeComplexity(query, chunks);

// 4. Select model based on complexity
const model = selectModel(complexity);

// 5. Enable caching and thinking
const response = await anthropic.messages.create({
  model: model,
  thinking: complexity.score > 60 ? { type: "enabled" } : undefined,
  system: [{ 
    text: systemPrompt, 
    cache_control: { type: "ephemeral" } 
  }],
  messages: [{
    role: "user",
    content: [{
      text: buildContext(chunks, query),
      cache_control: { type: "ephemeral" }
    }]
  }]
});
```

### RAG-Specific Prompting

```xml
<task>
Answer based on the provided sources. Never speculate beyond the sources.
</task>

<sources>
${retrievedChunks}
</sources>

<question>
${userQuery}
</question>

<instructions>
1. IDENTIFY which sources are most relevant
2. SYNTHESIZE information across sources when they connect
3. CITE source numbers [1], [2] when referencing
4. If sources don't fully answer, explicitly state what IS and ISN'T covered
5. NEVER speculate beyond source material
</instructions>
```

### Embedding Best Practices

**For embeddings, use:**
- Gemini `text-embedding-004` (768 dims, $0.00002/1K)
- OpenAI `text-embedding-3-small` (1536 dims, $0.00002/1K)
- Cohere `embed-english-v3.0` (1024 dims, $0.0001/1K)

**Chunking strategy:**
- Target: 400-600 tokens per chunk
- Max: 800 tokens
- Overlap: 50 tokens
- Keep semantic boundaries (paragraphs, sections)

**Similarity thresholds:**
- Strict (0.7-0.8): High precision, may miss context
- Balanced (0.5-0.6): Good for most cases
- Loose (0.3-0.4): High recall, may include noise

---

## Agent & Tool Use

### Tool Definition Pattern

```typescript
const tools = [
  {
    name: "search_database",
    description: "Search the knowledge base for relevant information. Use this when the user asks about documented topics.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query - be specific and include key terms"
        },
        limit: {
          type: "integer",
          description: "Number of results to return (1-20)",
          default: 10
        }
      },
      required: ["query"]
    }
  }
];
```

### Agent System Prompt

```text
<tool_usage_guidelines>
By default, implement actions using tools rather than only suggesting them. If user intent is unclear, infer the most useful action and proceed, using tools to discover missing details.

When multiple independent tools can be called, make ALL independent calls in parallel to maximize efficiency. Only call tools sequentially when one depends on another's output.

Examples of parallel calls:
- Reading multiple files: call read_file 3x in parallel
- Multiple searches: call search 3x in parallel

Never use placeholders or guess parameters - if information is missing, use tools to discover it first.
</tool_usage_guidelines>
```

### Parallel Tool Calling

Claude 4.x excels at parallel execution:

```typescript
// Claude will automatically call these in parallel
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-5-20250929",
  tools: tools,
  messages: [{
    role: "user",
    content: "Read files A.txt, B.txt, and C.txt"
  }]
});

// Result: 3 parallel tool_use blocks
```

To maximize this behavior:

```text
<parallel_efficiency>
If you intend to call multiple tools with no dependencies between them, make all independent calls in parallel. This significantly improves response time and user experience.
</parallel_efficiency>
```

---

## Common Pitfalls

### 1. Over-Engineering (Opus 4.5)

**Problem:** Opus tends to create extra files, add abstractions, build in unnecessary flexibility.

**Solution:**
```text
<avoid_overengineering>
Only make changes that are directly requested or clearly necessary. Keep solutions simple and focused. Don't add features, refactor code, or make "improvements" beyond what was asked.

Don't create helpers or abstractions for one-time operations. Don't design for hypothetical future requirements. The right amount of complexity is the minimum needed for the current task.
</avoid_overengineering>
```

### 2. Under-Triggering Tools

**Problem:** Claude suggests changes instead of implementing them.

**Solution:** Be explicit:
```text
❌ "Can you suggest improvements?"
✅ "Improve this function's performance"
✅ "Make these edits to the authentication flow"
```

### 3. Hallucinations in Code

**Problem:** Speculating about code without reading it.

**Solution:**
```text
<investigate_before_answering>
ALWAYS read and understand relevant files before proposing code edits. Do not speculate about code you have not inspected. If the user references a file, you MUST open and inspect it before explaining or proposing fixes.
</investigate_before_answering>
```

### 4. Generic Aesthetics

**Problem:** "AI slop" design with overused fonts/colors.

**Solution:**
```text
<frontend_aesthetics>
Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, system fonts)
- Clichéd color schemes (purple gradients on white)
- Predictable layouts and components

Instead:
- Choose distinctive, beautiful fonts
- Commit to cohesive themes with sharp accents
- Add meaningful animations and micro-interactions
- Create atmosphere with layered gradients and patterns
</frontend_aesthetics>
```

### 5. Excessive Verbosity

**Problem:** Long-winded summaries after every action.

**Solution:**
```text
<communication_style>
Be concise and direct. Provide fact-based progress reports rather than self-celebratory updates. Skip verbose summaries unless explicitly requested. Jump directly to next actions after tool use when appropriate.
</communication_style>
```

### 6. Hard-Coding to Pass Tests

**Problem:** Implementing only for test cases instead of general solutions.

**Solution:**
```text
<principled_implementation>
Write general-purpose solutions using standard tools. Do not create workarounds or helper scripts for efficiency. Implement solutions that work for all valid inputs, not just test cases. Don't hard-code values.

Tests verify correctness - they don't define the solution. If tests are incorrect or the task is unreasonable, inform me rather than working around it.
</principled_implementation>
```

---

## Quick Reference

### Model Selection Decision Tree

```
Is it a simple lookup/extraction?
  └─ YES → Haiku 4.5
  └─ NO → Does it require reasoning across multiple concepts?
       └─ YES → Is accuracy absolutely critical?
            └─ YES → Opus 4.5
            └─ NO → Sonnet 4.5
       └─ NO → Sonnet 4.5 (default for most tasks)
```

### Cost Optimization Checklist

- [ ] Enable prompt caching on system prompts
- [ ] Cache large contexts that repeat
- [ ] Use Haiku for simple operations
- [ ] Route to Sonnet/Opus only when needed
- [ ] Use Batch API for non-real-time tasks
- [ ] Monitor cache hit rates in usage logs

### Prompting Checklist

- [ ] Use XML tags for structure
- [ ] Provide context for WHY (not just WHAT)
- [ ] Use action verbs (ANALYZE, SYNTHESIZE, etc.)
- [ ] Be explicit about desired format
- [ ] Add examples when behavior is nuanced
- [ ] Avoid "think" terminology if not using extended thinking
- [ ] Match prompt style to desired output style

### RAG Checklist

- [ ] Retrieve 10-15 chunks for context
- [ ] Lower threshold (0.5) for more coverage
- [ ] Cache system prompt + context
- [ ] Route based on query complexity
- [ ] Enable thinking for multi-framework queries
- [ ] Explicit instructions to cite sources
- [ ] Never speculate beyond sources

---

## Resources

- **Documentation**: [https://platform.claude.com/docs/en/home](https://platform.claude.com/docs/en/home)
- **API Reference**: [https://platform.claude.com/docs/en/api/overview](https://platform.claude.com/docs/en/api/overview)
- **Cookbook**: [https://platform.claude.com/cookbooks](https://platform.claude.com/cookbooks)
- **Quickstarts**: [https://github.com/anthropics/anthropic-quickstarts](https://github.com/anthropics/anthropic-quickstarts)
- **Release Notes**: [https://platform.claude.com/docs/en/release-notes/api](https://platform.claude.com/docs/en/release-notes/api)

---

*Last Updated: January 2026*  
*Model Version: Claude 4.5 Series*
