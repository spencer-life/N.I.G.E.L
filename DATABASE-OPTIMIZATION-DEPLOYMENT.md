# Database Optimization Deployment Guide

**Date:** January 21, 2026  
**Status:** Ready for Deployment  
**Expected Impact:** 50-60% faster RAG responses, hybrid search capability, automatic embeddings

---

## What Was Optimized

### ✅ Phase 1: Vector Search Performance
- Rebuilt IVFFlat index with optimal parameters (lists=15, probes=3)
- Created `search_chunks_optimized()` function with built-in title boosting
- Reduced multiple sequential queries to single optimized query
- Added performance logging to track slow queries

### ✅ Phase 2: Hybrid Search
- Added full-text search column (`fts`) with weighted sections
- Created `hybrid_search_chunks()` function using RRF algorithm
- Enables combining keyword + semantic search for better accuracy

### ✅ Phase 3: Automatic Embeddings
- Set up pgmq queue for embedding jobs
- Created Edge Function for Gemini embedding generation
- Added triggers to auto-generate embeddings on insert/update
- Scheduled pg_cron job to process queue every 10 seconds

### ✅ Phase 4: Caching & Monitoring
- Created materialized view for frequently accessed chunks
- Added query performance logging table
- Created monitoring views for slow query analysis

### ✅ Phase 5: AI Integrations
- LangChain wrapper for retrieval chains and agents
- LlamaIndex wrapper for advanced document processing
- Both leverage optimized database functions

---

## Deployment Steps

### Step 1: Apply Database Migration

The migration file contains all SQL changes. Apply it to your Supabase database:

```bash
# Option A: Via Supabase CLI
supabase db push

# Option B: Via SQL Editor in Supabase Dashboard
# Copy contents of src/database/migrations/003_optimize_vector_search.sql
# Paste into SQL Editor and run
```

**Verification:**
```sql
-- Check if optimization applied
SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'chunks_embedding_ivfflat';
-- Should return 1

-- Check if new functions exist
SELECT proname FROM pg_proc WHERE proname IN (
  'search_chunks_optimized',
  'hybrid_search_chunks',
  'log_query_performance'
);
-- Should return 3 rows
```

### Step 2: Add Project URL to Vault

For automatic embeddings to work, add your Supabase project URL to Vault:

```sql
-- Replace <your-project-url> with your actual URL (e.g., https://xxx.supabase.co)
SELECT vault.create_secret('<your-project-url>', 'project_url');
```

**Get your project URL:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy the "Project URL"

### Step 3: Deploy Edge Function

Deploy the `embed` Edge Function for automatic embedding generation:

```bash
# Navigate to project root
cd /path/to/N.I.G.E.L

# Deploy the function
supabase functions deploy embed

# Set environment variable
supabase secrets set GEMINI_API_KEY=<your-gemini-api-key>
```

**Verification:**
```bash
# Test the function
supabase functions invoke embed --data '[]'
# Should return: {"completedJobs":[],"failedJobs":[]}
```

### Step 4: Update RagService (Already Done)

The RagService has been updated to use the new optimized functions. No additional changes needed.

**Changes made:**
- Uses `search_chunks_optimized()` instead of multiple queries
- Added `hybridSearch()` method for hybrid search
- Added performance logging for slow queries
- Simplified title boosting logic (now handled by database)

### Step 5: Test the Optimizations

Run these tests to verify everything works:

```typescript
// Test 1: Vector search (should be faster)
import { RagService } from './services/RagService';

const startTime = Date.now();
const result = await RagService.ask("What is FATE?");
const elapsed = Date.now() - startTime;

console.log(`Response time: ${elapsed}ms`);
console.log(`Answer: ${result.answer}`);
// Expected: < 2000ms (was 2-4 seconds before)

// Test 2: Hybrid search (new capability)
const hybridResult = await RagService.ask("elicitation techniques", undefined, true);
console.log(`Hybrid search result: ${hybridResult.answer}`);

// Test 3: Check performance logs
const { data: logs } = await supabase
  .from('query_performance_log')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);

console.log('Recent queries:', logs);
```

### Step 6: Monitor Performance

Use the monitoring views to track performance:

```sql
-- View query performance summary (last 24 hours)
SELECT * FROM v_query_performance_summary;

-- View slow queries
SELECT * FROM v_slow_queries;

-- Check embedding queue status
SELECT COUNT(*) FROM pgmq.read('embedding_jobs', 100, 1);
-- Should be 0 or low (jobs are processed every 10 seconds)
```

---

## Expected Performance Improvements

### Before Optimization
- Vector search: ~500-800ms
- Multiple sequential queries for title matching
- Total RAG response: ~2-4 seconds
- No hybrid search capability
- Manual embedding re-ingestion

### After Optimization
- Vector search: ~200-300ms (60% faster)
- Single optimized query with boosting
- Total RAG response: ~1-2 seconds (50% faster)
- Hybrid search: ~300-400ms
- Automatic embedding generation

---

## New Capabilities

### 1. Hybrid Search

Combine keyword + semantic search for better accuracy:

```typescript
// In your Discord command handlers
const result = await RagService.ask(query, undefined, true); // useHybridSearch=true
```

**When to use:**
- User query contains specific keywords
- Need both exact matches and semantic matches
- Searching for technical terms + concepts

### 2. Automatic Embeddings

Embeddings are now generated automatically when you:
- Insert new chunks
- Update chunk content or section

**No more manual re-ingestion!** Just update the database and embeddings will be generated within 10 seconds.

### 3. Performance Monitoring

Track query performance automatically:

```sql
-- Find slowest queries
SELECT query_text, execution_time_ms, chunks_returned
FROM query_performance_log
WHERE execution_time_ms > 1000
ORDER BY execution_time_ms DESC
LIMIT 10;

-- Average performance by query type
SELECT 
  query_type,
  AVG(execution_time_ms) as avg_ms,
  COUNT(*) as total_queries
FROM query_performance_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY query_type;
```

### 4. AI Framework Integrations

Use LangChain or LlamaIndex with your optimized database:

```typescript
// LangChain
import { SupabaseVectorStore } from './integrations/langchain/SupabaseVectorStore';
const store = new SupabaseVectorStore();
const retriever = store.asRetriever({ k: 5 });

// LlamaIndex
import { SupabaseVectorIndex } from './integrations/llamaindex/SupabaseVectorIndex';
const index = new SupabaseVectorIndex();
const response = await index.query("What is FATE?");
```

---

## Rollback Plan

If you need to rollback the changes:

### 1. Restore Original Index

```sql
-- Drop optimized index
DROP INDEX IF EXISTS chunks_embedding_ivfflat;

-- Recreate original index
CREATE INDEX chunks_embedding_ivfflat 
ON chunks 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

### 2. Revert RagService

```bash
git checkout HEAD~1 src/services/RagService.ts
```

### 3. Remove New Tables (Optional)

```sql
DROP TABLE IF EXISTS query_performance_log CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_framework_chunks CASCADE;
```

---

## Troubleshooting

### Issue: Slow Queries After Optimization

**Diagnosis:**
```sql
-- Check if index is being used
EXPLAIN ANALYZE 
SELECT * FROM search_chunks_optimized('[...]'::vector(768), 1.0, 15, NULL, NULL);
```

**Solution:**
```sql
-- Rebuild index
REINDEX INDEX chunks_embedding_ivfflat;

-- Verify probes setting
SHOW ivfflat.probes; -- Should be 3
```

### Issue: Embeddings Not Generating

**Diagnosis:**
```sql
-- Check queue
SELECT * FROM pgmq.read('embedding_jobs', 10, 1);

-- Check Edge Function logs
-- Go to Supabase Dashboard → Edge Functions → embed → Logs
```

**Solution:**
```bash
# Redeploy Edge Function
supabase functions deploy embed

# Verify GEMINI_API_KEY is set
supabase secrets list
```

### Issue: Hybrid Search Returns No Results

**Diagnosis:**
```sql
-- Check if fts column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'chunks' AND column_name = 'fts';

-- Check if GIN index exists
SELECT indexname FROM pg_indexes 
WHERE tablename = 'chunks' AND indexname = 'chunks_fts_gin';
```

**Solution:**
```sql
-- Recreate fts column if missing
ALTER TABLE chunks 
ADD COLUMN fts tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(section, '')), 'A') ||
  setweight(to_tsvector('english', content), 'B')
) STORED;

CREATE INDEX chunks_fts_gin ON chunks USING gin(fts);
```

---

## Maintenance

### Weekly Tasks

1. **Review Performance Logs**
   ```sql
   SELECT * FROM v_query_performance_summary;
   ```

2. **Check Embedding Queue**
   ```sql
   SELECT COUNT(*) FROM pgmq.read('embedding_jobs', 100, 1);
   ```

3. **Refresh Materialized View** (automatic, but can force)
   ```sql
   REFRESH MATERIALIZED VIEW CONCURRENTLY mv_framework_chunks;
   ```

### Monthly Tasks

1. **Analyze Slow Queries**
   ```sql
   SELECT * FROM v_slow_queries 
   WHERE hour > NOW() - INTERVAL '30 days';
   ```

2. **Review Index Performance**
   ```sql
   SELECT 
     schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
   FROM pg_stat_user_indexes 
   WHERE tablename = 'chunks';
   ```

3. **Clean Old Performance Logs**
   ```sql
   DELETE FROM query_performance_log 
   WHERE created_at < NOW() - INTERVAL '90 days';
   ```

---

## Next Steps

### Recommended Enhancements

1. **Scale Vector Index to HNSW** (when you hit 1000+ chunks)
   ```sql
   CREATE INDEX chunks_embedding_hnsw 
   ON chunks 
   USING hnsw (embedding vector_cosine_ops) 
   WITH (m = 16, ef_construction = 64);
   ```

2. **Add Query Caching** (Redis or in-memory)
   - Cache frequent queries for instant responses
   - Invalidate on knowledge base updates

3. **Implement Query Expansion** (LangChain)
   - Generate multiple query variations
   - Combine results for better coverage

4. **Add Conversation Memory** (LangChain)
   - Track conversation history
   - Provide context-aware responses

---

## Support

### Documentation
- [Supabase Vector Docs](https://supabase.com/docs/guides/ai)
- [pgvector Performance Guide](https://github.com/pgvector/pgvector#performance)
- [LangChain Integration](src/integrations/langchain/)
- [LlamaIndex Integration](src/integrations/llamaindex/)

### Monitoring Dashboards
- Supabase Dashboard: Database → Performance
- Query Logs: `SELECT * FROM v_query_performance_summary;`
- Edge Function Logs: Supabase Dashboard → Edge Functions

---

**Deployment Checklist:**

- [ ] Apply database migration (Step 1)
- [ ] Add project URL to Vault (Step 2)
- [ ] Deploy embed Edge Function (Step 3)
- [ ] Test vector search performance (Step 5)
- [ ] Test hybrid search (Step 5)
- [ ] Verify automatic embeddings (Step 5)
- [ ] Set up monitoring alerts (Step 6)
- [ ] Update MEMORY-BANK.md with new capabilities

**Ready to deploy!** 🚀
