# LangChain Integration Guide for NIGEL

Complete guide to using LangChain with NIGEL's optimized vector database.

**Based on:** [LangChain Anthropic Docs](https://docs.langchain.com/oss/javascript/integrations/chat/anthropic)

---

## 🚀 Quick Start

### Installation

```bash
npm install @langchain/anthropic @langchain/core
```

### Basic Usage

```typescript
import { SupabaseVectorStore } from './src/integrations/langchain/SupabaseVectorStore';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';

// 1. Set up vector store
const vectorStore = new SupabaseVectorStore();
const retriever = vectorStore.asRetriever({ k: 5 });

// 2. Set up Claude Haiku 4.5
const llm = new ChatAnthropic({
  model: 'claude-haiku-4-5-20251001',
  temperature: 0
});

// 3. Create RAG chain
const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are NIGEL. Use this doctrine:\n\n{context}'],
  ['human', '{question}']
]);

const chain = RunnableSequence.from([
  {
    context: async (input) => {
      const docs = await retriever.getRelevantDocuments(input.question);
      return docs.map(doc => doc.pageContent).join('\n\n');
    },
    question: (input) => input.question
  },
  prompt,
  llm
]);

// 4. Ask questions
const response = await chain.invoke({ question: 'What is FATE?' });
console.log(response.content);
```

---

## 📚 Available Examples

All examples are in [`src/integrations/langchain/examples.ts`](src/integrations/langchain/examples.ts):

### 1. Basic RAG
```typescript
import { basicRAG } from './src/integrations/langchain/examples';
const answer = await basicRAG("What is the FATE framework?");
```

### 2. Hybrid Search RAG
```typescript
import { hybridSearchRAG } from './src/integrations/langchain/examples';
const answer = await hybridSearchRAG("elicitation techniques");
```

### 3. Conversational RAG (with memory)
```typescript
import { conversationalRAG } from './src/integrations/langchain/examples';
const { askQuestion } = await conversationalRAG();

await askQuestion("What is FATE?");
await askQuestion("How do I apply it?"); // Uses conversation history
```

### 4. RAG with Extended Thinking (Sonnet 4.5)
```typescript
import { ragWithThinking } from './src/integrations/langchain/examples';
const answer = await ragWithThinking("Complex question here...");
```

### 5. Framework-Filtered RAG
```typescript
import { frameworkFilteredRAG } from './src/integrations/langchain/examples';
const answer = await frameworkFilteredRAG(
  "How do I build rapport?",
  ["rapport", "human needs"]
);
```

### 6. RAG with Citations
```typescript
import { ragWithCitations } from './src/integrations/langchain/examples';
const answer = await ragWithCitations("What is elicitation?");
// Returns content with citation metadata
```

### 7. Multi-Query RAG
```typescript
import { multiQueryRAG } from './src/integrations/langchain/examples';
const answer = await multiQueryRAG("Tell me about influence techniques");
// Generates multiple query variations for better retrieval
```

---

## 🎯 Key Features

### Prompt Caching (90% Cost Reduction)

Claude automatically caches system prompts for 5 minutes:

```typescript
const llm = new ChatAnthropic({
  model: 'claude-haiku-4-5-20251001',
  // Caching enabled automatically for system prompts
});

// First call: Full cost
// Subsequent calls within 5 min: 90% cheaper!
```

### Extended Thinking (for complex queries)

Enable extended thinking for Sonnet 4.5:

```typescript
const llm = new ChatAnthropic({
  model: 'claude-sonnet-4-5-20250929',
  clientOptions: {
    defaultHeaders: {
      'anthropic-beta': 'extended-thinking-2025-01-01'
    }
  }
});
```

### Hybrid Search

Combine keyword + semantic search:

```typescript
const vectorStore = new SupabaseVectorStore();
const docs = await vectorStore.hybridSearch("elicitation techniques", 5);
```

### Framework Filtering

Retrieve only from specific frameworks:

```typescript
const docs = await vectorStore.similaritySearch(
  "rapport building",
  5,
  { frameworks: ['rapport', 'human needs'] }
);
```

---

## 💰 Cost Optimization

### Model Selection

| Model | Speed | Cost | Use For |
|-------|-------|------|---------|
| **Haiku 4.5** | ⚡⚡⚡ | $ | Simple questions, fast responses |
| **Sonnet 4.5** | ⚡⚡ | $$$ | Complex reasoning, multi-framework |
| **Sonnet + Thinking** | ⚡ | $$$$ | Deep analysis, strategic questions |

### Prompt Caching Savings

```typescript
// Without caching: ~$0.026 per query (Sonnet)
// With caching: ~$0.003 per query (90% savings!)

// Caching is automatic for:
// - System prompts
// - Repeated context (within 5 minutes)
```

### Best Practices

1. **Use Haiku for most queries** - It's 10x cheaper than Sonnet
2. **Enable prompt caching** - Automatic, just reuse system prompts
3. **Batch similar questions** - Maximize cache hits
4. **Use framework filtering** - Reduce context size

---

## 🔧 Integration with Discord Commands

### Example: `/ask` command with LangChain

```typescript
import { SlashCommandBuilder } from 'discord.js';
import { basicRAG } from '../integrations/langchain/examples';

export const data = new SlashCommandBuilder()
  .setName('ask')
  .setDescription('Ask NIGEL a question')
  .addStringOption(option =>
    option.setName('question')
      .setDescription('Your question')
      .setRequired(true)
  );

export async function execute(interaction) {
  await interaction.deferReply();
  
  const question = interaction.options.getString('question');
  const answer = await basicRAG(question);
  
  await interaction.editReply({
    content: answer,
    ephemeral: false
  });
}
```

### Example: Conversational drill with memory

```typescript
import { conversationalRAG } from '../integrations/langchain/examples';

// Store conversation per user
const userConversations = new Map();

export async function handleDrillQuestion(userId, question) {
  // Get or create conversation for user
  if (!userConversations.has(userId)) {
    const { askQuestion } = await conversationalRAG();
    userConversations.set(userId, askQuestion);
  }
  
  const askQuestion = userConversations.get(userId);
  const answer = await askQuestion(question);
  
  return answer;
}
```

---

## 📊 Performance Comparison

### Before LangChain Integration

```typescript
// Manual RAG implementation
const chunks = await RagService.searchDoctrine(query);
const response = await RagService.synthesizeResponse(query, chunks);
// ~1-2 seconds
```

### After LangChain Integration

```typescript
// LangChain with optimized retriever
const answer = await basicRAG(query);
// ~1-2 seconds (same speed, more features!)
```

**Benefits:**
- ✅ Same performance
- ✅ More advanced patterns (conversational, multi-query, etc.)
- ✅ Better prompt management
- ✅ Easier to extend and maintain
- ✅ Industry-standard patterns

---

## 🎓 Advanced Patterns

### 1. Self-Query Retrieval

Let the model decide what to retrieve:

```typescript
const llm = new ChatAnthropic({ model: 'claude-haiku-4-5-20251001' });

// Model decides which frameworks to search
const queryAnalysis = await llm.invoke([
  ['system', 'Analyze this question and suggest which frameworks to search: FATE, BTE, Rapport, Elicitation'],
  ['human', question]
]);

// Use suggested frameworks
const docs = await vectorStore.similaritySearch(question, 5, {
  frameworks: extractFrameworks(queryAnalysis.content)
});
```

### 2. Parent Document Retrieval

Retrieve full documents instead of chunks:

```typescript
const retriever = {
  getRelevantDocuments: async (query) => {
    const chunks = await vectorStore.similaritySearch(query, 5);
    
    // Get full documents
    const documentIds = [...new Set(chunks.map(c => c.metadata.document_id))];
    const { data } = await supabase
      .from('documents')
      .select('*')
      .in('id', documentIds);
    
    return data.map(doc => ({
      pageContent: doc.content,
      metadata: doc.metadata
    }));
  }
};
```

### 3. Ensemble Retrieval

Combine multiple retrieval strategies:

```typescript
async function ensembleRetrieval(query, k = 5) {
  // Get results from both methods
  const vectorResults = await vectorStore.similaritySearch(query, k);
  const hybridResults = await vectorStore.hybridSearch(query, k);
  
  // Combine and deduplicate
  const combined = [...vectorResults, ...hybridResults];
  const unique = Array.from(
    new Map(combined.map(doc => [doc.metadata.id, doc])).values()
  );
  
  return unique.slice(0, k);
}
```

---

## 🐛 Troubleshooting

### Issue: "Module not found: @langchain/anthropic"

```bash
npm install @langchain/anthropic @langchain/core
```

### Issue: Slow responses

1. Check if using Haiku (fast) vs Sonnet (slower)
2. Reduce `k` parameter (fewer documents)
3. Use framework filtering to reduce context

### Issue: High costs

1. Switch from Sonnet to Haiku
2. Verify prompt caching is working (check logs)
3. Reduce max_tokens parameter

### Issue: Low accuracy

1. Try hybrid search instead of vector search
2. Increase `k` parameter (more documents)
3. Use Sonnet with extended thinking for complex queries

---

## 📖 Resources

- **LangChain Docs:** https://docs.langchain.com/oss/javascript/integrations/chat/anthropic
- **LangChain MCP:** https://docs.langchain.com/mcp
- **Claude API Docs:** https://docs.anthropic.com
- **NIGEL Integration:** [`src/integrations/langchain/`](src/integrations/langchain/)
- **Examples:** [`src/integrations/langchain/examples.ts`](src/integrations/langchain/examples.ts)

---

## ✅ Next Steps

1. **Install LangChain:** `npm install @langchain/anthropic @langchain/core`
2. **Try basic example:** Run `basicRAG("What is FATE?")`
3. **Explore examples:** Check [`examples.ts`](src/integrations/langchain/examples.ts)
4. **Integrate with Discord:** Add to your command handlers
5. **Monitor costs:** Track usage in Anthropic dashboard

**Ready to use LangChain with NIGEL!** 🚀
