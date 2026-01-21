# RAG System Implementation

## Auto-Loaded Context
@src/services/RagService.ts
@scripts/ingest-knowledge.ts
@knowledge/README.md
@src/database/schema.sql

## Overview
I need to implement a complete RAG (Retrieval-Augmented Generation) system for my Discord bot. Please help me set up knowledge chunking, embedding generation, vector storage, and similarity search.

## Architecture Overview

### Components
1. **Knowledge Base** - Markdown files in `knowledge/` directory
2. **Ingestion Script** - Chunks and embeds documents
3. **RAG Service** - Handles similarity search at runtime
4. **Database** - Supabase with pgvector extension

### Data Flow
```
Markdown Files → Chunking → Embedding → Vector Storage → Similarity Search → Context for AI
```

## Implementation Checklist

### 1. Database Schema
- [ ] Create `knowledge_chunks` table
- [ ] Add vector column (dimension 768 for Gemini)
- [ ] Add metadata columns (source, tags, timestamps)
- [ ] Create vector similarity search function
- [ ] Set up indexes for performance

**Schema Pattern:**
```sql
CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(768),
  source_file TEXT NOT NULL,
  framework_tags TEXT[],
  chunk_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);
```

### 2. Knowledge File Format

**Markdown Structure:**
- Use clear headings (H1, H2, H3)
- Keep sections focused and modular
- Add metadata at top (framework tags)
- Use consistent formatting

**Example:**
```markdown
# Topic Name

## Subtopic 1
Content here...

## Subtopic 2
More content...
```

**Chunking Strategy:**
- Target: 400-600 tokens per chunk
- Maximum: 800 tokens
- Split on natural boundaries (headings, paragraphs)
- Preserve context in each chunk
- Include framework tags for filtering

### 3. Ingestion Script

**Core Functions:**
- [ ] Read markdown files from `knowledge/` directory
- [ ] Chunk content intelligently
- [ ] Generate embeddings with Gemini
- [ ] Store in Supabase with metadata
- [ ] Handle errors and retries
- [ ] Report statistics

**Key Parameters:**
```typescript
const CHUNK_CONFIG = {
  targetSize: 500,      // tokens
  maxSize: 800,         // tokens
  overlap: 50,          // tokens
  minSize: 100          // tokens
};

const EMBEDDING_CONFIG = {
  model: 'text-embedding-004',
  dimensions: 768,
  taskType: 'RETRIEVAL_DOCUMENT'
};
```

**Ingestion Steps:**
1. List all markdown files in `knowledge/`
2. Read file content
3. Extract framework tags from filename/metadata
4. Chunk content based on size and boundaries
5. Generate embedding for each chunk
6. Insert into database with metadata
7. Validate insertion
8. Report success/failures

### 4. RAG Service Implementation

**Core Methods:**
- [ ] `searchKnowledge(query, options)` - Main search function
- [ ] `generateEmbedding(text)` - Create query embedding
- [ ] `findSimilarChunks(embedding, options)` - Vector search
- [ ] `formatContext(chunks)` - Prepare for AI prompt

**Search Configuration:**
```typescript
interface SearchOptions {
  threshold: number;      // 0.5 default (lower = more lenient)
  limit: number;          // 5 default
  tags?: string[];        // Filter by framework tags
  minScore?: number;      // Minimum similarity score
}
```

**Search Process:**
1. Generate embedding for user query
2. Perform cosine similarity search in database
3. Filter by threshold and tags
4. Return top N results
5. Format as context for AI

### 5. Vector Search Query

**Supabase RPC Function:**
```typescript
async searchKnowledge(query: string, options: SearchOptions) {
  // Generate embedding
  const embedding = await this.generateEmbedding(query);
  
  // Search database
  const { data, error } = await supabase.rpc('match_knowledge', {
    query_embedding: embedding,
    match_threshold: options.threshold,
    match_count: options.limit,
    filter_tags: options.tags
  });
  
  return data;
}
```

**SQL Function:**
```sql
CREATE FUNCTION match_knowledge(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_tags text[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float,
  source_file text,
  framework_tags text[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_chunks.id,
    knowledge_chunks.content,
    1 - (knowledge_chunks.embedding <=> query_embedding) as similarity,
    knowledge_chunks.source_file,
    knowledge_chunks.framework_tags
  FROM knowledge_chunks
  WHERE 
    (filter_tags IS NULL OR knowledge_chunks.framework_tags && filter_tags)
    AND 1 - (knowledge_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

## Configuration

### Gemini Embedding API
```typescript
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ 
    model: 'text-embedding-004' 
  });
  
  const result = await model.embedContent({
    content: { parts: [{ text }] },
    taskType: 'RETRIEVAL_DOCUMENT'
  });
  
  return result.embedding.values;
}
```

### Threshold Tuning
- **0.7+**: Very similar (high precision, low recall)
- **0.5-0.7**: Moderately similar (balanced)
- **0.3-0.5**: Loosely related (low precision, high recall)
- **<0.3**: Everything (noisy)

**Recommendation:** Start with 0.5 and adjust based on results

## Testing the RAG System

### 1. Chunk Quality Check
```sql
-- Check chunk sizes
SELECT 
  source_file,
  AVG(LENGTH(content)) as avg_length,
  MIN(LENGTH(content)) as min_length,
  MAX(LENGTH(content)) as max_length,
  COUNT(*) as chunk_count
FROM knowledge_chunks
GROUP BY source_file;

-- Check for missing embeddings
SELECT COUNT(*) FROM knowledge_chunks WHERE embedding IS NULL;

-- Check framework tags
SELECT DISTINCT UNNEST(framework_tags) as tag, COUNT(*) 
FROM knowledge_chunks 
GROUP BY tag;
```

### 2. Test Queries
```typescript
// Test specific topic
const results = await ragService.searchKnowledge(
  "How do I build rapport?",
  { threshold: 0.5, limit: 5, tags: ['rapport'] }
);

// Test general query
const results = await ragService.searchKnowledge(
  "Authority and influence",
  { threshold: 0.5, limit: 5 }
);

// Check similarity scores
console.log(results.map(r => ({
  score: r.similarity,
  source: r.source_file,
  preview: r.content.substring(0, 100)
})));
```

### 3. Validation Checklist
- [ ] All knowledge files ingested
- [ ] Chunk sizes within target range
- [ ] All chunks have embeddings
- [ ] All chunks have framework tags
- [ ] Search returns relevant results
- [ ] Similarity scores make sense
- [ ] No duplicate chunks
- [ ] Performance acceptable (<200ms)

## Integration with Discord Bot

### Command Usage Example
```typescript
export async function execute(interaction: CommandInteraction) {
  const question = interaction.options.getString('question', true);
  
  // Search knowledge base
  const context = await ragService.searchKnowledge(question, {
    threshold: 0.5,
    limit: 5
  });
  
  if (context.length === 0) {
    await interaction.reply({
      content: "I don't have information on that topic.",
      ephemeral: true
    });
    return;
  }
  
  // Use context with AI (Claude/Gemini)
  const response = await generateResponse(question, context);
  
  await interaction.reply({
    content: response,
    ephemeral: true
  });
}
```

## Performance Optimization

### Caching
- Cache frequently accessed chunks
- Cache embeddings for common queries
- Use in-memory cache (Redis optional)

### Indexing
- Create ivfflat index on embedding column
- Index framework_tags for filtering
- Index source_file for debugging

### Batch Processing
- Generate embeddings in batches during ingestion
- Use connection pooling for database
- Implement retry logic with exponential backoff

## Troubleshooting

**No results returned:**
- Lower similarity threshold
- Check if query embedding generated correctly
- Verify chunks exist in database
- Check framework_tags filtering

**Poor result quality:**
- Increase similarity threshold
- Improve chunking strategy
- Add more specific framework tags
- Refine knowledge content

**Slow performance:**
- Add vector index
- Reduce match_count
- Cache common queries
- Optimize chunk sizes

## Next Steps
After implementation:
1. Ingest initial knowledge base
2. Test with sample queries
3. Tune similarity threshold
4. Monitor search performance
5. Iterate on chunk quality
6. Document query patterns

Please help me implement this RAG system with these specifications.
