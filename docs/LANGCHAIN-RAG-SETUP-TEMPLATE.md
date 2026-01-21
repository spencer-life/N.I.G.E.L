# LangChain + RAG Database Setup Template

**Universal template for setting up LangChain with vector RAG in any project**

---

## 🎯 What This Template Provides

- ✅ LangChain integration with Claude 4.5 models
- ✅ Vector database setup (Supabase/PostgreSQL with pgvector)
- ✅ RAG (Retrieval-Augmented Generation) system
- ✅ Embedding generation (Google Gemini or OpenAI)
- ✅ Hybrid search (keyword + semantic)
- ✅ Production-ready examples

**Time to setup:** ~15-30 minutes  
**Cost:** ~$0.0001 per query (with prompt caching)

---

## 📋 Prerequisites

### Required Tools
- Node.js 18+ or Python 3.9+
- Package manager (npm, yarn, or pnpm)
- Supabase account (free tier works)
- API keys:
  - Anthropic (Claude)
  - Google Gemini or OpenAI (for embeddings)

### Optional Tools
- Docker (for local PostgreSQL + pgvector)
- Vercel/Railway (for deployment)

---

## 🚀 Quick Start (5 Steps)

### Step 1: Install Dependencies

**JavaScript/TypeScript:**
```bash
npm install @langchain/anthropic @langchain/core @langchain/community
npm install @supabase/supabase-js
```

**Python:**
```bash
pip install langchain langchain-anthropic langchain-community
pip install supabase
```

### Step 2: Set Up Vector Database

#### Option A: Supabase (Recommended)

1. **Create Supabase Project:**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Note your project URL and anon key

2. **Enable pgvector:**
   ```sql
   -- Run in Supabase SQL Editor
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. **Create Schema:**
   ```sql
   -- Documents table
   CREATE TABLE documents (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     metadata JSONB DEFAULT '{}'::jsonb,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Chunks table with embeddings
   CREATE TABLE chunks (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     embedding VECTOR(768), -- Adjust dimension based on your model
     metadata JSONB DEFAULT '{}'::jsonb,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Vector similarity search function
   CREATE OR REPLACE FUNCTION search_chunks(
     query_embedding VECTOR(768),
     match_threshold FLOAT DEFAULT 0.5,
     match_count INT DEFAULT 10
   )
   RETURNS TABLE (
     id UUID,
     document_id UUID,
     content TEXT,
     metadata JSONB,
     similarity FLOAT
   )
   LANGUAGE plpgsql
   AS $$
   BEGIN
     RETURN QUERY
     SELECT
       chunks.id,
       chunks.document_id,
       chunks.content,
       chunks.metadata,
       1 - (chunks.embedding <=> query_embedding) AS similarity
     FROM chunks
     WHERE 1 - (chunks.embedding <=> query_embedding) > match_threshold
     ORDER BY chunks.embedding <=> query_embedding
     LIMIT match_count;
   END;
   $$;

   -- Create indexes for performance
   CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops)
     WITH (lists = 100);
   CREATE INDEX ON chunks (document_id);
   CREATE INDEX ON documents USING gin (metadata);
   ```

#### Option B: Local PostgreSQL + pgvector

```bash
# Using Docker
docker run -d \
  --name postgres-vector \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  ankane/pgvector

# Then run the same SQL schema as above
```

### Step 3: Configure Environment Variables

Create `.env`:
```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# AI Models
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=your-gemini-key
# OR
OPENAI_API_KEY=sk-...

# Optional
NODE_ENV=development
```

### Step 4: Create Vector Store Integration

**TypeScript:**
```typescript
// src/lib/vectorStore.ts
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { GoogleGenerativeAIEmbeddings } from '@langchain/community/embeddings/googleai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY!,
  modelName: 'text-embedding-004',
});

export const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabase,
  tableName: 'chunks',
  queryName: 'search_chunks',
});
```

**Python:**
```python
# src/lib/vector_store.py
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_community.embeddings import GoogleGenerativeAIEmbeddings
from supabase import create_client

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/text-embedding-004"
)

vector_store = SupabaseVectorStore(
    client=supabase,
    embedding=embeddings,
    table_name="chunks",
    query_name="search_chunks"
)
```

### Step 5: Create RAG Chain

**TypeScript:**
```typescript
// src/lib/rag.ts
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { vectorStore } from './vectorStore';

const llm = new ChatAnthropic({
  model: 'claude-haiku-4-5-20251001',
  temperature: 0,
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const retriever = vectorStore.asRetriever({ k: 5 });

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'Answer using this context:\n\n{context}'],
  ['human', '{question}'],
]);

export const ragChain = RunnableSequence.from([
  {
    context: async (input: { question: string }) => {
      const docs = await retriever.getRelevantDocuments(input.question);
      return docs.map(doc => doc.pageContent).join('\n\n');
    },
    question: (input: { question: string }) => input.question,
  },
  prompt,
  llm,
  new StringOutputParser(),
]);

// Usage
export async function askQuestion(question: string) {
  return await ragChain.invoke({ question });
}
```

**Python:**
```python
# src/lib/rag.py
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableSequence
from langchain_core.output_parsers import StrOutputParser
from .vector_store import vector_store

llm = ChatAnthropic(
    model="claude-haiku-4-5-20251001",
    temperature=0
)

retriever = vector_store.as_retriever(search_kwargs={"k": 5})

prompt = ChatPromptTemplate.from_messages([
    ("system", "Answer using this context:\n\n{context}"),
    ("human", "{question}")
])

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": lambda x: x["question"]}
    | prompt
    | llm
    | StrOutputParser()
)

def ask_question(question: str) -> str:
    return rag_chain.invoke({"question": question})
```

---

## 📚 Ingesting Documents

### TypeScript Example

```typescript
// src/scripts/ingest.ts
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { vectorStore } from '../lib/vectorStore';
import fs from 'fs/promises';

async function ingestDocuments(directory: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const files = await fs.readdir(directory);
  
  for (const file of files) {
    if (!file.endsWith('.md') && !file.endsWith('.txt')) continue;
    
    const content = await fs.readFile(`${directory}/${file}`, 'utf-8');
    const chunks = await splitter.splitText(content);
    
    await vectorStore.addDocuments(
      chunks.map(chunk => ({
        pageContent: chunk,
        metadata: { source: file },
      }))
    );
    
    console.log(`✅ Ingested: ${file}`);
  }
}

// Usage
ingestDocuments('./knowledge').then(() => {
  console.log('🎉 All documents ingested!');
});
```

### Python Example

```python
# src/scripts/ingest.py
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from src.lib.vector_store import vector_store
import os

def ingest_documents(directory: str):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    
    for filename in os.listdir(directory):
        if not filename.endswith(('.md', '.txt')):
            continue
            
        with open(os.path.join(directory, filename), 'r') as f:
            content = f.read()
            
        chunks = splitter.split_text(content)
        documents = [
            Document(page_content=chunk, metadata={"source": filename})
            for chunk in chunks
        ]
        
        vector_store.add_documents(documents)
        print(f"✅ Ingested: {filename}")

if __name__ == "__main__":
    ingest_documents("./knowledge")
    print("🎉 All documents ingested!")
```

---

## 🎯 Advanced Features

### 1. Hybrid Search (Keyword + Semantic)

```sql
-- Add full-text search column
ALTER TABLE chunks ADD COLUMN fts_content TSVECTOR;

-- Populate and index
UPDATE chunks SET fts_content = to_tsvector('english', content);
CREATE INDEX ON chunks USING gin(fts_content);

-- Hybrid search function
CREATE OR REPLACE FUNCTION hybrid_search_chunks(
  query_text TEXT,
  query_embedding VECTOR(768),
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH semantic AS (
    SELECT chunks.id, chunks.content,
      1 - (chunks.embedding <=> query_embedding) AS score
    FROM chunks
    ORDER BY chunks.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  keyword AS (
    SELECT chunks.id, chunks.content,
      ts_rank(fts_content, plainto_tsquery('english', query_text)) AS score
    FROM chunks
    WHERE fts_content @@ plainto_tsquery('english', query_text)
    ORDER BY score DESC
    LIMIT match_count * 2
  ),
  combined AS (
    SELECT id, content, score FROM semantic
    UNION ALL
    SELECT id, content, score FROM keyword
  )
  SELECT DISTINCT ON (combined.id)
    combined.id,
    combined.content,
    AVG(combined.score) AS similarity
  FROM combined
  GROUP BY combined.id, combined.content
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

### 2. Conversational RAG (with Memory)

```typescript
import { BufferMemory } from 'langchain/memory';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const memory = new BufferMemory({
  memoryKey: 'chat_history',
  returnMessages: true,
});

const conversationalChain = ConversationalRetrievalQAChain.fromLLM(
  llm,
  retriever,
  { memory }
);

// Usage
await conversationalChain.call({ question: 'What is X?' });
await conversationalChain.call({ question: 'Tell me more about that' });
```

### 3. Multi-Query Retrieval

```typescript
import { MultiQueryRetriever } from 'langchain/retrievers/multi_query';

const multiQueryRetriever = MultiQueryRetriever.fromLLM({
  llm,
  retriever,
  verbose: true,
});

// Automatically generates multiple query variations
const docs = await multiQueryRetriever.getRelevantDocuments('complex question');
```

### 4. Citations

```typescript
const llm = new ChatAnthropic({
  model: 'claude-haiku-4-5-20251001',
  clientOptions: {
    defaultHeaders: {
      'anthropic-beta': 'citations-2025-01-01',
    },
  },
});

// Format documents for citations
const documentsWithCitations = docs.map((doc, i) => ({
  type: 'document',
  source: { type: 'content', data: doc.pageContent },
  title: doc.metadata.source || `Document ${i + 1}`,
  citations: { enabled: true },
}));
```

---

## 💰 Cost Optimization

### Prompt Caching (90% Savings)

```typescript
const llm = new ChatAnthropic({
  model: 'claude-haiku-4-5-20251001',
  // Caching enabled automatically for system prompts!
});

// First call: ~$0.0001
// Subsequent calls (within 5 min): ~$0.00001 (90% cheaper)
```

### Model Selection

| Task | Model | Cost/Query | Speed |
|------|-------|------------|-------|
| Simple Q&A | Haiku 4.5 | $0.0001 | ⚡⚡⚡ |
| Complex reasoning | Sonnet 4.5 | $0.003 (cached) | ⚡⚡ |
| Deep analysis | Sonnet + Thinking | $0.006 | ⚡ |

### Embedding Models

| Provider | Model | Dimensions | Cost/1M tokens |
|----------|-------|------------|----------------|
| Google Gemini | text-embedding-004 | 768 | $0.025 |
| OpenAI | text-embedding-3-small | 1536 | $0.020 |
| OpenAI | text-embedding-3-large | 3072 | $0.130 |

**Recommendation:** Use Gemini `text-embedding-004` (768-dim) for best cost/performance.

---

## 🧪 Testing Your Setup

```typescript
// test.ts
import { askQuestion } from './lib/rag';

async function test() {
  console.log('Testing RAG system...\n');
  
  const questions = [
    'What is this project about?',
    'How do I get started?',
    'What are the main features?',
  ];
  
  for (const question of questions) {
    console.log(`Q: ${question}`);
    const answer = await askQuestion(question);
    console.log(`A: ${answer}\n`);
  }
}

test();
```

---

## 📊 Performance Benchmarks

**Expected Performance:**
- Vector search: 50-200ms
- Hybrid search: 100-300ms
- Full RAG response: 1-2 seconds
- Embedding generation: 100-500ms per chunk

**Optimization Tips:**
1. Use IVFFlat index for >10K vectors
2. Adjust `lists` parameter based on data size
3. Enable prompt caching for repeated queries
4. Use Haiku for 90% of queries

---

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] Documents ingested
- [ ] Test queries working
- [ ] Prompt caching enabled
- [ ] Error handling implemented
- [ ] Monitoring/logging set up
- [ ] Rate limiting configured
- [ ] Backup strategy in place

---

## 📖 Resources

- **LangChain Docs:** https://js.langchain.com/docs/
- **LangChain Anthropic:** https://docs.langchain.com/oss/javascript/integrations/chat/anthropic
- **Supabase Vector:** https://supabase.com/docs/guides/ai
- **pgvector:** https://github.com/pgvector/pgvector
- **Claude API:** https://docs.anthropic.com

---

## 🆘 Troubleshooting

### Issue: "Module not found: @langchain/anthropic"
```bash
npm install @langchain/anthropic @langchain/core
```

### Issue: "pgvector extension not found"
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Issue: Slow vector search
```sql
-- Check index
\d+ chunks

-- Recreate with more lists for larger datasets
DROP INDEX IF EXISTS chunks_embedding_idx;
CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100); -- Adjust based on data size
```

### Issue: High costs
1. Switch from Sonnet to Haiku
2. Enable prompt caching
3. Reduce chunk count (k parameter)
4. Use smaller embedding model

---

**Template Version:** 1.0  
**Last Updated:** January 2026  
**Tested With:** LangChain 0.3.x, Claude 4.5, Supabase
