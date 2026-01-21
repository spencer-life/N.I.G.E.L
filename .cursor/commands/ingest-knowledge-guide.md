# Knowledge Ingestion Guide

## Auto-Loaded Context
@scripts/ingest-knowledge.ts
@knowledge/README.md

## Overview
Step-by-step guide for ingesting knowledge files into your RAG system, including formatting, chunking, embedding, and validation.

## Knowledge File Format

### Markdown Structure
Knowledge files should be well-structured markdown:

```markdown
# Main Topic

Brief introduction to the topic.

## Subtopic 1

Content for subtopic 1...

### Sub-section 1.1

More detailed content...

## Subtopic 2

Content for subtopic 2...
```

### Formatting Rules
- **Use clear headings** - H1 for main topic, H2/H3 for sections
- **Keep paragraphs focused** - One concept per paragraph
- **Use lists for clarity** - Bullet points and numbered lists
- **Add examples** - Code blocks, scenarios, case studies
- **Avoid excessive formatting** - No complex tables or images

### Metadata
Add framework tags to identify knowledge domains:

**Option 1: In filename**
```
rapport-building.md        → tags: ['rapport']
authority-influence.md     → tags: ['authority', 'influence']
fate-framework.md          → tags: ['fate']
```

**Option 2: In front matter (if supported)**
```markdown
---
tags: [rapport, communication]
category: interpersonal
---

# Rapport Building
...
```

## Chunking Strategy

### Target Chunk Size
- **Minimum**: 100 tokens
- **Target**: 400-600 tokens
- **Maximum**: 800 tokens
- **Overlap**: 50 tokens between chunks

### Chunking Boundaries
Chunk on natural boundaries:
1. **Section headings** (H2, H3) - Preferred
2. **Paragraphs** - Good fallback
3. **Sentences** - Last resort

**Example:**
```markdown
# Topic                    ← Chunk 1 starts
Content paragraph 1...
Content paragraph 2...

## Subtopic A               ← Chunk 2 starts
Content for A...

## Subtopic B               ← Chunk 3 starts
Content for B...
```

### Preserving Context
Each chunk should be independently meaningful:
- Include parent heading in chunk
- Add enough context to stand alone
- Preserve key terms and definitions

## Ingestion Process

### 1. Prepare Knowledge Files

**Checklist:**
- [ ] Files are in `knowledge/` directory
- [ ] Files are valid markdown
- [ ] Files use clear heading structure
- [ ] Files have appropriate filenames
- [ ] Content is factual and accurate
- [ ] No sensitive information included

### 2. Run Ingestion Script

```bash
# Build if needed
npm run build

# Run ingestion
npm run ingest-knowledge
# or
node build/scripts/ingest-knowledge.js
```

**Expected output:**
```
📚 Starting knowledge ingestion...
Reading files from: knowledge/

Processing: rapport.md
  ✓ Read file (15,234 characters)
  ✓ Chunked into 8 pieces
  ✓ Generated embeddings (8/8)
  ✓ Inserted into database

Processing: authority.md
  ✓ Read file (12,456 characters)
  ✓ Chunked into 6 pieces
  ✓ Generated embeddings (6/6)
  ✓ Inserted into database

✨ Ingestion complete!
Summary:
  - Files processed: 2
  - Total chunks: 14
  - Successfully embedded: 14
  - Errors: 0
```

### 3. Verify Ingestion

**Check database:**
```sql
-- Count total chunks
SELECT COUNT(*) FROM knowledge_chunks;

-- Check by source file
SELECT source_file, COUNT(*) 
FROM knowledge_chunks 
GROUP BY source_file;

-- Check embedding dimensions
SELECT source_file, 
       array_length(embedding::float[], 1) as dimensions
FROM knowledge_chunks
LIMIT 5;
```

**Expected results:**
- All files should have chunks
- All chunks should have 768-dimensional embeddings
- Chunk counts should be reasonable (5-15 per file typically)

### 4. Test RAG Queries

```typescript
// Test search functionality
const results = await ragService.searchKnowledge(
  "How do I build rapport?",
  { threshold: 0.5, limit: 5 }
);

console.log('Search results:', results.map(r => ({
  similarity: r.similarity,
  source: r.source_file,
  preview: r.content.substring(0, 100)
})));
```

**Expected:**
- Should return relevant chunks
- Similarity scores should be >0.5
- Content should match query topic

## Ingestion Configuration

### Gemini Embedding Settings
```typescript
const embedConfig = {
  model: 'text-embedding-004',
  dimensions: 768,
  taskType: 'RETRIEVAL_DOCUMENT'
};
```

### Chunking Parameters
```typescript
const chunkConfig = {
  targetSize: 500,      // Target chunk size in tokens
  maxSize: 800,         // Maximum chunk size
  minSize: 100,         // Minimum chunk size
  overlap: 50           // Overlap between chunks
};
```

### Database Settings
```typescript
const dbConfig = {
  batchSize: 10,        // Insert chunks in batches
  retryAttempts: 3,     // Retry failed insertions
  retryDelay: 1000      // Delay between retries (ms)
};
```

## Troubleshooting

### Files Not Found
**Error:** `Cannot find knowledge directory`

**Solution:**
```bash
# Verify directory exists
ls knowledge/

# Create if missing
mkdir -p knowledge

# Check script path
node -e "console.log(process.cwd())"
```

### Chunking Errors
**Error:** `Chunk size exceeds maximum`

**Solution:**
- Break up large sections in markdown
- Add more headings to create natural boundaries
- Adjust `maxSize` parameter if needed

### Embedding Failures
**Error:** `Failed to generate embedding`

**Possible causes:**
- Invalid GEMINI_API_KEY
- Rate limit exceeded
- Network connectivity issues
- Content too long for API

**Solution:**
```typescript
// Add error handling and retries
try {
  const embedding = await generateEmbedding(chunk);
} catch (error) {
  console.error('Embedding failed:', error);
  // Implement retry logic
}
```

### Database Insertion Fails
**Error:** `Insert failed`

**Possible causes:**
- Invalid embedding dimensions
- Null/undefined values
- Database connection lost
- RLS policies blocking insert

**Solution:**
```typescript
// Validate before insert
if (!embedding || embedding.length !== 768) {
  throw new Error('Invalid embedding');
}

// Check database connection
const { error } = await supabase
  .from('knowledge_chunks')
  .select('count');
```

### Empty Results in RAG Search
**Problem:** Ingestion succeeded but searches return nothing

**Causes:**
- Similarity threshold too high
- Framework tags filtering incorrectly
- Embedding mismatch (query vs document)

**Solution:**
```typescript
// Test with lower threshold
const results = await ragService.searchKnowledge(query, {
  threshold: 0.3,  // More lenient
  limit: 10
});

// Test without tag filtering
const results = await ragService.searchKnowledge(query, {
  threshold: 0.5,
  limit: 5,
  tags: undefined  // Don't filter by tags
});
```

## Re-Ingestion

### When to Re-Ingest
- Knowledge content updated
- Chunking strategy changed
- Embedding model changed
- Framework tags modified

### Re-Ingestion Process
```bash
# 1. Backup existing data (optional)
# 2. Clear old chunks
# 3. Re-run ingestion
```

**Clear old chunks:**
```sql
-- Delete all chunks
TRUNCATE TABLE knowledge_chunks;

-- Or delete specific file
DELETE FROM knowledge_chunks 
WHERE source_file = 'specific-file.md';
```

### Incremental Updates
For updating single files:
```typescript
// Delete old chunks for file
await supabase
  .from('knowledge_chunks')
  .delete()
  .eq('source_file', 'updated-file.md');

// Re-ingest just that file
await ingestFile('updated-file.md');
```

## Best Practices

### Content Quality
- **Be accurate** - Verify all facts
- **Be clear** - Use simple language
- **Be comprehensive** - Cover topic thoroughly
- **Be structured** - Use logical organization

### File Management
- **Consistent naming** - Use kebab-case
- **Descriptive filenames** - Clear topic identification
- **Version control** - Track changes in git
- **Documentation** - Maintain knowledge/README.md

### Performance
- **Batch processing** - Ingest multiple files efficiently
- **Rate limiting** - Respect Gemini API limits
- **Error handling** - Retry failed operations
- **Logging** - Track ingestion progress

### Maintenance
- **Regular audits** - Check chunk quality
- **Update content** - Keep knowledge current
- **Monitor usage** - Track which chunks are accessed
- **Optimize** - Refine based on search patterns

## Validation Checklist

After ingestion, verify:
- [ ] All files processed successfully
- [ ] Chunk count is reasonable
- [ ] All chunks have embeddings (768 dimensions)
- [ ] All chunks have framework_tags
- [ ] No duplicate chunks
- [ ] Sample searches return relevant results
- [ ] Similarity scores are reasonable
- [ ] No database errors in logs

## Next Steps

After successful ingestion:
1. Test RAG queries with `/test-rag-query` command
2. Check chunk quality with `/check-rag-health`
3. Tune similarity threshold based on results
4. Document any ingestion-specific patterns
5. Update MEMORY-BANK.md with knowledge status

## Integration with Bot

Use ingested knowledge in commands:
```typescript
export async function execute(interaction: CommandInteraction) {
  const question = interaction.options.getString('question', true);
  
  // Search knowledge base
  const context = await ragService.searchKnowledge(question, {
    threshold: 0.5,
    limit: 5,
    tags: ['rapport']  // Optional filtering
  });
  
  // Use context for AI response
  // ...
}
```
