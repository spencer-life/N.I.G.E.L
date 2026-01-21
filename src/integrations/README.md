# NIGEL AI Integrations

This directory contains integrations with popular AI frameworks and tools, making it easy to leverage NIGEL's optimized vector database with industry-standard libraries.

## 🚀 Quick Start

**See [LANGCHAIN-INTEGRATION-GUIDE.md](../../LANGCHAIN-INTEGRATION-GUIDE.md) for complete setup and 7 working examples!**

## Available Integrations

### 🦜 LangChain (`langchain/`)

LangChain integration provides a vector store wrapper that works with LangChain's retrieval chains, agents, and tools.

**Based on:** [LangChain Anthropic Docs](https://docs.langchain.com/oss/javascript/integrations/chat/anthropic)

**Features:**
- Similarity search with filtering
- Hybrid search (keyword + semantic)
- Retriever interface for chains
- Automatic embedding generation via database triggers
- Prompt caching for 90% cost reduction
- Citations support
- Extended thinking for complex queries

**Quick Start:**
```typescript
import { SupabaseVectorStore } from './integrations/langchain/SupabaseVectorStore';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';

const vectorStore = new SupabaseVectorStore();
const retriever = vectorStore.asRetriever({ k: 5 });

const llm = new ChatAnthropic({ 
  model: 'claude-haiku-4-5-20251001',
  temperature: 0
});

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

const response = await chain.invoke({ question: 'What is FATE?' });
```

**7 Complete Examples Available:**
1. Basic RAG
2. Hybrid Search RAG
3. Conversational RAG (with memory)
4. RAG with Extended Thinking (Sonnet 4.5)
5. Framework-Filtered RAG
6. RAG with Citations
7. Multi-Query RAG

**See:** [`langchain/examples.ts`](langchain/examples.ts) for all examples

**Use Cases:**
- Conversational retrieval (chat with memory)
- Multi-query retrieval (query expansion)
- Self-query retrieval (metadata filtering)
- Agent tools (RAG as a tool)
- Citation-backed responses
- Complex reasoning with extended thinking

### 🦙 LlamaIndex (`llamaindex/`)

LlamaIndex integration provides an index wrapper with advanced document processing and query engines.

**Features:**
- Document ingestion with automatic chunking
- Advanced retrieval strategies
- Query response synthesis
- Index statistics and monitoring

**Quick Start:**
```typescript
import { SupabaseVectorIndex } from './integrations/llamaindex/SupabaseVectorIndex';

const index = new SupabaseVectorIndex();

// Ingest documents
await index.ingestDocuments([
  {
    text: "FATE stands for Focus, Authority, Tribe, and Emotion...",
    metadata: { framework: "FATE", section: "Overview" }
  }
]);

// Query
const response = await index.query("What is FATE?", { topK: 5 });
```

**Use Cases:**
- Document ingestion pipelines
- Advanced chunking strategies
- Query engines with synthesis
- Multi-document retrieval

## Installation

### LangChain

```bash
npm install @langchain/core @langchain/anthropic
```

### LlamaIndex

```bash
npm install llamaindex
```

## Architecture

Both integrations leverage NIGEL's optimized database functions:

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (LangChain/LlamaIndex Interfaces)     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Integration Wrappers               │
│  - SupabaseVectorStore (LangChain)     │
│  - SupabaseVectorIndex (LlamaIndex)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     Optimized Database Functions        │
│  - search_chunks_optimized()            │
│  - hybrid_search_chunks()               │
│  - Automatic embedding triggers         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Supabase PostgreSQL             │
│  - pgvector (IVFFlat index)            │
│  - Full-text search (GIN index)        │
│  - Materialized views (caching)        │
└─────────────────────────────────────────┘
```

## Performance

Both integrations benefit from NIGEL's database optimizations:

- **Vector Index:** IVFFlat with optimal parameters (lists=15, probes=3)
- **Full-Text Index:** GIN index on tsvector column
- **Hybrid Search:** Reciprocal Rank Fusion (RRF) algorithm
- **Caching:** Materialized views for frequently accessed data
- **Monitoring:** Automatic performance logging

**Expected Performance:**
- Vector search: ~200-300ms (60% faster than before)
- Hybrid search: ~300-400ms
- Total RAG response: ~1-2 seconds

## Examples

### LangChain: Conversational Retrieval

```typescript
import { SupabaseVectorStore } from './integrations/langchain/SupabaseVectorStore';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { ChatAnthropic } from '@langchain/anthropic';
import { BufferMemory } from 'langchain/memory';

const vectorStore = new SupabaseVectorStore();
const retriever = vectorStore.asRetriever({ k: 5 });

const llm = new ChatAnthropic({
  modelName: 'claude-haiku-4-5-20251001',
  temperature: 0
});

const memory = new BufferMemory({
  memoryKey: 'chat_history',
  returnMessages: true
});

const chain = ConversationalRetrievalQAChain.fromLLM(
  llm,
  retriever,
  { memory }
);

// First question
await chain.call({ question: "What is FATE?" });

// Follow-up (uses conversation history)
await chain.call({ question: "How do I apply it in practice?" });
```

### LlamaIndex: Multi-Document Query

```typescript
import { SupabaseVectorIndex } from './integrations/llamaindex/SupabaseVectorIndex';

const index = new SupabaseVectorIndex();

// Query across multiple frameworks
const response = await index.query(
  "How do rapport and human needs relate?",
  {
    topK: 10,
    frameworkFilter: ['rapport', 'human needs'],
    useHybrid: true
  }
);

console.log(response.response);
response.sourceNodes.forEach(node => {
  console.log(`- ${node.metadata.section} (score: ${node.score})`);
});
```

## Best Practices

### 1. Choose the Right Search Method

- **Vector Search:** Best for semantic similarity, concept matching
- **Hybrid Search:** Best for queries with specific keywords + meaning
- **Full-Text Search:** Best for exact phrase matching

### 2. Optimize Query Parameters

```typescript
// For broad exploration
{ topK: 10, similarityThreshold: 0.3 }

// For precise matches
{ topK: 5, similarityThreshold: 0.7 }

// For framework-specific queries
{ topK: 5, frameworkFilter: ['FATE', 'BTE'] }
```

### 3. Monitor Performance

Check the `query_performance_log` table:

```sql
SELECT 
  query_type,
  AVG(execution_time_ms) as avg_time,
  COUNT(*) as query_count
FROM query_performance_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY query_type;
```

### 4. Use Caching Wisely

The materialized view `mv_framework_chunks` is refreshed hourly. For real-time data, query the `chunks` table directly.

## Troubleshooting

### Slow Queries

1. Check vector index: `\d+ chunks_embedding_ivfflat`
2. Verify probes setting: `SHOW ivfflat.probes;`
3. Review slow query log: `SELECT * FROM v_slow_queries;`

### Low Accuracy

1. Increase `topK` parameter
2. Lower `similarityThreshold`
3. Try hybrid search instead of pure vector search
4. Check if embeddings are up to date

### Missing Results

1. Verify embeddings exist: `SELECT COUNT(*) FROM chunks WHERE embedding IS NOT NULL;`
2. Check automatic embedding queue: `SELECT * FROM pgmq.read('embedding_jobs', 10, 1);`
3. Review Edge Function logs for embedding generation errors

## Contributing

When adding new integrations:

1. Create a new directory under `src/integrations/`
2. Implement wrapper classes that use NIGEL's database functions
3. Add examples and documentation
4. Update this README

## Resources

- **[LANGCHAIN-INTEGRATION-GUIDE.md](../../LANGCHAIN-INTEGRATION-GUIDE.md)** - Complete LangChain guide with examples
- **[langchain/examples.ts](langchain/examples.ts)** - 7 working LangChain examples
- [LangChain Anthropic Docs](https://docs.langchain.com/oss/javascript/integrations/chat/anthropic)
- [LangChain MCP](https://docs.langchain.com/mcp)
- [LangChain Documentation](https://js.langchain.com/docs/)
- [LlamaIndex Documentation](https://docs.llamaindex.ai/)
- [Supabase Vector Documentation](https://supabase.com/docs/guides/ai)
- [NIGEL Database Schema](../../database/schema.sql)
- [NIGEL RAG Service](../services/RagService.ts)
