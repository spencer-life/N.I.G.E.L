# Check RAG System Health

## Auto-Loaded Context
@scripts/check-fate-chunks.ts
@src/services/RagService.ts

## Overview
Comprehensive health check for your RAG (Retrieval-Augmented Generation) system, including chunk quality analysis, embedding validation, and search performance testing.

## Health Check Components

### 1. Chunk Quality Analysis

**Check chunk size distribution:**
```sql
SELECT 
  source_file,
  COUNT(*) as chunk_count,
  AVG(LENGTH(content)) as avg_length,
  MIN(LENGTH(content)) as min_length,
  MAX(LENGTH(content)) as max_length,
  STDDEV(LENGTH(content)) as std_dev
FROM knowledge_chunks
GROUP BY source_file
ORDER BY source_file;
```

**Expected results:**
- Average length: ~2000-3000 characters (400-600 tokens)
- Minimum length: >500 characters (~100 tokens)
- Maximum length: <4000 characters (~800 tokens)
- Standard deviation: Reasonable variation, not too extreme

**Red flags:**
- ❌ Chunks <500 characters (too small, lacking context)
- ❌ Chunks >5000 characters (too large, unfocused)
- ❌ Very high standard deviation (inconsistent chunking)

### 2. Embedding Validation

**Check for missing embeddings:**
```sql
SELECT 
  source_file,
  COUNT(*) as total_chunks,
  COUNT(embedding) as chunks_with_embeddings,
  COUNT(*) - COUNT(embedding) as missing_embeddings
FROM knowledge_chunks
GROUP BY source_file;
```

**Expected:** All chunks should have embeddings (missing = 0)

**Check embedding dimensions:**
```sql
SELECT 
  source_file,
  id,
  array_length(embedding::float[], 1) as dimensions
FROM knowledge_chunks
WHERE array_length(embedding::float[], 1) != 768
LIMIT 10;
```

**Expected:** Should return 0 rows (all embeddings should be 768-dimensional for Gemini)

**Red flags:**
- ❌ Missing embeddings (NULL values)
- ❌ Wrong dimensions (not 768)
- ❌ Zero vectors (all values are 0)

### 3. Framework Tags Validation

**Check tag distribution:**
```sql
SELECT 
  UNNEST(framework_tags) as tag,
  COUNT(*) as chunk_count
FROM knowledge_chunks
GROUP BY tag
ORDER BY chunk_count DESC;
```

**Check for missing tags:**
```sql
SELECT 
  source_file,
  id,
  content,
  framework_tags
FROM knowledge_chunks
WHERE framework_tags IS NULL 
   OR array_length(framework_tags, 1) = 0
   OR framework_tags = '{}';
```

**Expected:** 
- All chunks should have at least one tag
- Tag distribution should make sense for your knowledge base

**Red flags:**
- ❌ Chunks without tags
- ❌ Empty tag arrays
- ❌ Tags that don't match content

### 4. Content Validation

**Check for duplicate content:**
```sql
SELECT 
  content,
  COUNT(*) as duplicate_count,
  ARRAY_AGG(source_file) as source_files
FROM knowledge_chunks
GROUP BY content
HAVING COUNT(*) > 1;
```

**Expected:** Minimal to no duplicates

**Check for very short content:**
```sql
SELECT 
  source_file,
  id,
  LENGTH(content) as length,
  LEFT(content, 100) as preview
FROM knowledge_chunks
WHERE LENGTH(content) < 100
ORDER BY length ASC;
```

**Expected:** Very few or no extremely short chunks

**Red flags:**
- ❌ Many duplicate chunks (ingestion error)
- ❌ Chunks with <100 characters
- ❌ Chunks that are just headers with no content

### 5. Search Performance Testing

**Test basic similarity search:**
```typescript
const testQueries = [
  "How do I build rapport?",
  "What is authority?",
  "Explain the FATE framework",
  "Elicitation techniques"
];

for (const query of testQueries) {
  const start = Date.now();
  const results = await ragService.searchKnowledge(query, {
    threshold: 0.5,
    limit: 5
  });
  const duration = Date.now() - start;
  
  console.log(`Query: "${query}"`);
  console.log(`  Results: ${results.length}`);
  console.log(`  Duration: ${duration}ms`);
  console.log(`  Top score: ${results[0]?.similarity.toFixed(3)}`);
  console.log();
}
```

**Performance benchmarks:**
- ✅ <100ms: Excellent
- ⚠️  100-500ms: Good
- ❌ >500ms: Needs optimization

**Quality benchmarks:**
- ✅ Top score >0.7: High confidence
- ⚠️  Top score 0.5-0.7: Moderate confidence
- ❌ Top score <0.5: Low confidence, may need threshold adjustment

### 6. Threshold Analysis

**Test different thresholds:**
```typescript
const thresholds = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
const testQuery = "How do I build rapport?";

for (const threshold of thresholds) {
  const results = await ragService.searchKnowledge(testQuery, {
    threshold,
    limit: 10
  });
  
  console.log(`Threshold ${threshold}:`);
  console.log(`  Results: ${results.length}`);
  console.log(`  Avg score: ${
    results.reduce((sum, r) => sum + r.similarity, 0) / results.length
  }`);
}
```

**Find optimal threshold:**
- Too low (<0.4): Many irrelevant results
- Too high (>0.7): May miss relevant content
- Sweet spot: Usually 0.5-0.6

## Complete Health Check Script

```typescript
// scripts/check-rag-health.ts

async function checkRAGHealth() {
  console.log('🏥 RAG System Health Check\n');
  
  // 1. Check chunk counts
  const { data: counts } = await supabase
    .from('knowledge_chunks')
    .select('source_file')
    .then(({ data }) => ({
      data: data?.reduce((acc, curr) => {
        acc[curr.source_file] = (acc[curr.source_file] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    }));
  
  console.log('📊 Chunk Counts:');
  Object.entries(counts).forEach(([file, count]) => {
    console.log(`  ${file}: ${count} chunks`);
  });
  console.log();
  
  // 2. Check embedding dimensions
  const { data: embeddingCheck } = await supabase.rpc('check_embeddings');
  
  if (embeddingCheck?.missing > 0) {
    console.log('❌ Missing embeddings:', embeddingCheck.missing);
  } else {
    console.log('✅ All chunks have embeddings');
  }
  console.log();
  
  // 3. Test sample queries
  console.log('🔍 Testing Sample Queries:\n');
  
  const queries = [
    "rapport building",
    "authority principles",
    "elicitation techniques"
  ];
  
  for (const query of queries) {
    const results = await ragService.searchKnowledge(query, {
      threshold: 0.5,
      limit: 3
    });
    
    console.log(`Query: "${query}"`);
    console.log(`  Results: ${results.length}`);
    if (results.length > 0) {
      console.log(`  Top score: ${results[0].similarity.toFixed(3)}`);
      console.log(`  Source: ${results[0].source_file}`);
    } else {
      console.log('  ⚠️  No results found');
    }
    console.log();
  }
  
  // 4. Summary
  console.log('📋 Summary:');
  console.log('  Total chunks:', Object.values(counts).reduce((a, b) => a + b, 0));
  console.log('  Source files:', Object.keys(counts).length);
  console.log();
  
  console.log('✨ Health check complete!');
}
```

## Automated Health Monitoring

### Daily Health Check
Create a scheduled task to monitor RAG health:

```typescript
// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  const health = await checkRAGHealth();
  
  if (health.errors.length > 0) {
    // Send alert
    await sendAlert('RAG Health Issues Detected', health.errors);
  }
});
```

### Metrics to Track
- Total chunk count
- Average similarity scores
- Query response times
- Error rates
- Cache hit rates (if using cache)

## Common Issues & Solutions

### Issue: Low Similarity Scores
**Symptoms:** All search results have scores <0.5

**Possible causes:**
- Query embedding different from document embeddings
- Chunking lost important context
- Knowledge content doesn't match queries

**Solutions:**
1. Lower threshold temporarily
2. Review chunk content quality
3. Add more relevant knowledge
4. Check embedding generation consistency

### Issue: No Results for Valid Queries
**Symptoms:** Searches return empty arrays

**Possible causes:**
- Threshold too high
- Framework tags filtering too strict
- Missing/incorrect embeddings
- Knowledge not ingested

**Solutions:**
```typescript
// Test without filtering
const results = await ragService.searchKnowledge(query, {
  threshold: 0.3,  // Lower threshold
  limit: 10,
  tags: undefined  // No tag filtering
});
```

### Issue: Slow Search Performance
**Symptoms:** Searches take >1 second

**Possible causes:**
- Missing vector index
- Too many chunks
- Inefficient query
- Database performance

**Solutions:**
```sql
-- Create ivfflat index
CREATE INDEX ON knowledge_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Analyze table for better query plans
ANALYZE knowledge_chunks;
```

### Issue: Inconsistent Results
**Symptoms:** Same query returns different results

**Possible causes:**
- Concurrent ingestion/updates
- Non-deterministic embedding generation
- Cache invalidation issues

**Solutions:**
- Lock table during ingestion
- Use consistent embedding parameters
- Clear cache after ingestion

## Health Check Checklist

Run this checklist weekly:

### Data Quality
- [ ] All chunks have embeddings
- [ ] All embeddings are 768-dimensional
- [ ] All chunks have framework_tags
- [ ] No duplicate chunks
- [ ] Chunk sizes within target range
- [ ] No missing content

### Performance
- [ ] Search queries complete in <200ms
- [ ] Similarity scores are reasonable (>0.5 for good matches)
- [ ] Database index is present and used
- [ ] Memory usage is stable

### Functionality
- [ ] Test queries return relevant results
- [ ] Framework tag filtering works
- [ ] Threshold settings are appropriate
- [ ] Error handling works correctly

### Maintenance
- [ ] Knowledge content is up to date
- [ ] Old/obsolete chunks removed
- [ ] Logs reviewed for errors
- [ ] Backups are current

## Optimization Recommendations

### Based on Health Check Results

**If many chunks are too small:**
- Adjust chunking to preserve more context
- Combine related short chunks
- Re-ingest with better boundaries

**If many chunks are too large:**
- Increase granularity of chunking
- Split on more heading levels
- Re-ingest with smaller max size

**If search is slow:**
- Add vector index
- Increase match_count limit
- Optimize database queries
- Consider caching

**If results are irrelevant:**
- Improve knowledge content quality
- Refine chunking strategy
- Adjust similarity threshold
- Add more specific framework tags

## Next Steps

After health check:
1. Address any red flags found
2. Optimize based on recommendations
3. Re-test after changes
4. Document findings in MEMORY-BANK.md
5. Schedule regular health checks

## Integration with Monitoring

```typescript
// Add to bot's health endpoint
app.get('/health', async (req, res) => {
  const ragHealth = await checkRAGHealth();
  
  res.json({
    status: ragHealth.errors.length === 0 ? 'healthy' : 'degraded',
    rag: {
      totalChunks: ragHealth.totalChunks,
      searchPerformance: ragHealth.avgSearchTime,
      issues: ragHealth.errors
    }
  });
});
```

Use this command regularly to ensure your RAG system stays healthy and performs optimally!
