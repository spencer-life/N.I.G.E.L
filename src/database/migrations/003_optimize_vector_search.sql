-- Migration 003: Comprehensive Database Optimizations
-- Purpose: Optimize vector search, add hybrid search, performance logging, and auto-embeddings
-- Date: January 21, 2026

-- ============================================================================
-- PART 1: OPTIMIZE VECTOR INDEX
-- ============================================================================

-- Drop existing suboptimal index
DROP INDEX IF EXISTS chunks_embedding_ivfflat;

-- Recreate with optimal parameters for current data size (151 chunks)
-- lists = sqrt(151) ≈ 15 is optimal for IVFFlat
CREATE INDEX chunks_embedding_ivfflat 
ON chunks 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 15);

-- Set probes to ~20% of lists for good accuracy/speed balance
ALTER DATABASE postgres SET ivfflat.probes = 3;

-- ============================================================================
-- PART 2: ADD FULL-TEXT SEARCH SUPPORT
-- ============================================================================

-- Add tsvector column for full-text search (weighted: section=A, content=B)
ALTER TABLE chunks 
ADD COLUMN IF NOT EXISTS fts tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(section, '')), 'A') ||
  setweight(to_tsvector('english', content), 'B')
) STORED;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS chunks_fts_gin ON chunks USING gin(fts);

-- ============================================================================
-- PART 3: OPTIMIZED SEARCH FUNCTIONS
-- ============================================================================

-- Drop existing search function if it exists
DROP FUNCTION IF EXISTS search_chunks(vector, float, int);

-- Create optimized vector search with boosting
CREATE OR REPLACE FUNCTION search_chunks_optimized(
  query_embedding vector(768),
  match_threshold float DEFAULT 1.0,
  match_count int DEFAULT 15,
  framework_filter text[] DEFAULT NULL,
  boost_section_match text DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
  document_id bigint,
  section text,
  content text,
  framework_tags text[],
  token_count int,
  embedding vector(768),
  created_at timestamptz,
  distance float,
  boosted_score float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH vector_results AS (
    SELECT 
      c.id,
      c.document_id,
      c.section,
      c.content,
      c.framework_tags,
      c.token_count,
      c.embedding,
      c.created_at,
      (c.embedding <=> query_embedding) as dist
    FROM chunks c
    WHERE 
      (framework_filter IS NULL OR c.framework_tags && framework_filter)
      AND (c.embedding <=> query_embedding) < match_threshold
    ORDER BY dist
    LIMIT match_count * 2  -- Get extra for boosting
  )
  SELECT 
    vr.id,
    vr.document_id,
    vr.section,
    vr.content,
    vr.framework_tags,
    vr.token_count,
    vr.embedding,
    vr.created_at,
    vr.dist,
    -- Apply section title boost (20% for matches)
    CASE 
      WHEN boost_section_match IS NOT NULL 
           AND lower(vr.section) LIKE '%' || lower(boost_section_match) || '%'
      THEN (1 - vr.dist / 2) + 0.20
      ELSE (1 - vr.dist / 2)
    END as boosted_score
  FROM vector_results vr
  ORDER BY boosted_score DESC
  LIMIT match_count;
END;
$$;

-- Maintain backward compatibility with original search_chunks
CREATE OR REPLACE FUNCTION search_chunks(
  query_embedding vector(768),
  match_threshold float DEFAULT 1.0,
  match_count int DEFAULT 15
)
RETURNS TABLE (
  id bigint,
  document_id bigint,
  section text,
  content text,
  framework_tags text[],
  token_count int,
  embedding vector(768),
  created_at timestamptz,
  distance float
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    id, document_id, section, content, framework_tags, 
    token_count, embedding, created_at, distance
  FROM search_chunks_optimized(
    query_embedding, 
    match_threshold, 
    match_count, 
    NULL, 
    NULL
  );
$$;

-- ============================================================================
-- PART 4: HYBRID SEARCH (RRF Algorithm)
-- ============================================================================

-- Hybrid search combining full-text and semantic search with Reciprocal Rank Fusion
CREATE OR REPLACE FUNCTION hybrid_search_chunks(
  query_text text,
  query_embedding vector(768),
  match_count int DEFAULT 10,
  full_text_weight float DEFAULT 1.0,
  semantic_weight float DEFAULT 1.0,
  rrf_k int DEFAULT 50
)
RETURNS TABLE (
  id bigint,
  document_id bigint,
  section text,
  content text,
  framework_tags text[],
  token_count int,
  embedding vector(768),
  created_at timestamptz,
  similarity float,
  rank_score float
)
LANGUAGE sql
STABLE
AS $$
WITH full_text AS (
  SELECT
    c.id,
    ROW_NUMBER() OVER(ORDER BY ts_rank_cd(c.fts, websearch_to_tsquery(query_text)) DESC) as rank_ix
  FROM chunks c
  WHERE c.fts @@ websearch_to_tsquery(query_text)
  LIMIT match_count * 2
),
semantic AS (
  SELECT
    c.id,
    (1 - (c.embedding <=> query_embedding) / 2) as similarity,
    ROW_NUMBER() OVER(ORDER BY c.embedding <=> query_embedding) as rank_ix
  FROM chunks c
  WHERE (c.embedding <=> query_embedding) < 1.0
  LIMIT match_count * 2
)
SELECT
  c.id,
  c.document_id,
  c.section,
  c.content,
  c.framework_tags,
  c.token_count,
  c.embedding,
  c.created_at,
  COALESCE(s.similarity, 0)::float as similarity,
  (COALESCE(1.0 / (rrf_k + ft.rank_ix), 0.0) * full_text_weight +
   COALESCE(1.0 / (rrf_k + s.rank_ix), 0.0) * semantic_weight)::float as rank_score
FROM chunks c
LEFT JOIN full_text ft ON c.id = ft.id
LEFT JOIN semantic s ON c.id = s.id
WHERE ft.id IS NOT NULL OR s.id IS NOT NULL
ORDER BY rank_score DESC
LIMIT match_count;
$$;

-- ============================================================================
-- PART 5: PERFORMANCE MONITORING
-- ============================================================================

-- Table to track query performance
CREATE TABLE IF NOT EXISTS query_performance_log (
  id bigserial PRIMARY KEY,
  query_type text NOT NULL,  -- 'vector', 'hybrid', 'full_text'
  query_text text,
  execution_time_ms int,
  chunks_returned int,
  model_used text,  -- 'haiku', 'sonnet', etc.
  user_id bigint REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for analysis
CREATE INDEX IF NOT EXISTS query_performance_log_type_date_idx 
  ON query_performance_log(query_type, created_at);
CREATE INDEX IF NOT EXISTS query_performance_log_slow_queries_idx 
  ON query_performance_log(execution_time_ms) 
  WHERE execution_time_ms > 1000;

-- Helper function to log query performance
CREATE OR REPLACE FUNCTION log_query_performance(
  p_query_type text,
  p_query_text text,
  p_execution_time_ms int,
  p_chunks_returned int,
  p_model_used text DEFAULT NULL,
  p_user_id bigint DEFAULT NULL
)
RETURNS void
LANGUAGE sql
AS $$
  INSERT INTO query_performance_log (
    query_type, query_text, execution_time_ms, 
    chunks_returned, model_used, user_id
  )
  VALUES (
    p_query_type, 
    substring(p_query_text, 1, 500),  -- Limit text length
    p_execution_time_ms, 
    p_chunks_returned, 
    p_model_used, 
    p_user_id
  );
$$;

-- ============================================================================
-- PART 6: AUTOMATIC EMBEDDINGS INFRASTRUCTURE
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgmq;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS hstore;

-- Create utility schema if not exists
CREATE SCHEMA IF NOT EXISTS util;

-- Utility function to get project URL from Vault
CREATE OR REPLACE FUNCTION util.project_url()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  secret_value text;
BEGIN
  SELECT decrypted_secret INTO secret_value 
  FROM vault.decrypted_secrets 
  WHERE name = 'project_url';
  RETURN secret_value;
END;
$$;

-- Generic function to invoke Edge Functions
CREATE OR REPLACE FUNCTION util.invoke_edge_function(
  name text,
  body jsonb,
  timeout_milliseconds int DEFAULT 5 * 60 * 1000
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  headers_raw text;
  auth_header text;
BEGIN
  headers_raw := current_setting('request.headers', true);
  
  auth_header := CASE
    WHEN headers_raw IS NOT NULL THEN
      (headers_raw::json->>'authorization')
    ELSE
      NULL
  END;
  
  PERFORM net.http_post(
    url => util.project_url() || '/functions/v1/' || name,
    headers => jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', auth_header
    ),
    body => body,
    timeout_milliseconds => timeout_milliseconds
  );
END;
$$;

-- Generic trigger function to clear a column on update
CREATE OR REPLACE FUNCTION util.clear_column()
RETURNS trigger
LANGUAGE plpgsql 
AS $$
DECLARE
  clear_column text := TG_ARGV[0];
BEGIN
  NEW := NEW #= hstore(clear_column, NULL);
  RETURN NEW;
END;
$$;

-- Create queue for embedding jobs
SELECT pgmq.create('embedding_jobs');

-- Generic trigger function to queue embedding jobs
CREATE OR REPLACE FUNCTION util.queue_embeddings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  content_function text := TG_ARGV[0];
  embedding_column text := TG_ARGV[1];
BEGIN
  PERFORM pgmq.send(
    queue_name => 'embedding_jobs',
    msg => jsonb_build_object(
      'id', NEW.id,
      'schema', TG_TABLE_SCHEMA,
      'table', TG_TABLE_NAME,
      'contentFunction', content_function,
      'embeddingColumn', embedding_column
    )
  );
  RETURN NEW;
END;
$$;

-- Function to process embedding jobs from queue
CREATE OR REPLACE FUNCTION util.process_embeddings(
  batch_size int DEFAULT 10,
  max_requests int DEFAULT 10,
  timeout_milliseconds int DEFAULT 5 * 60 * 1000
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  job_batches jsonb[];
  batch jsonb;
BEGIN
  WITH
    numbered_jobs AS (
      SELECT
        message || jsonb_build_object('jobId', msg_id) as job_info,
        (ROW_NUMBER() OVER (ORDER BY 1) - 1) / batch_size as batch_num
      FROM pgmq.read(
        queue_name => 'embedding_jobs',
        vt => timeout_milliseconds / 1000,
        qty => max_requests * batch_size
      )
    ),
    batched_jobs AS (
      SELECT
        jsonb_agg(job_info) as batch_array,
        batch_num
      FROM numbered_jobs
      GROUP BY batch_num
    )
  SELECT array_agg(batch_array)
  FROM batched_jobs
  INTO job_batches;
  
  FOREACH batch IN ARRAY job_batches LOOP
    PERFORM util.invoke_edge_function(
      name => 'embed',
      body => batch,
      timeout_milliseconds => timeout_milliseconds
    );
  END LOOP;
END;
$$;

-- Schedule embedding processing every 10 seconds
SELECT cron.schedule(
  'process-embeddings',
  '10 seconds',
  $$
  SELECT util.process_embeddings();
  $$
);

-- Function to generate embedding input for chunks
CREATE OR REPLACE FUNCTION chunk_embedding_input(chunk chunks)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN coalesce(chunk.section || E'\n\n', '') || chunk.content;
END;
$$;

-- Trigger to queue embeddings on chunk insert
CREATE TRIGGER embed_chunks_on_insert
  AFTER INSERT ON chunks
  FOR EACH ROW
  EXECUTE FUNCTION util.queue_embeddings('chunk_embedding_input', 'embedding');

-- Trigger to queue embeddings on chunk update
CREATE TRIGGER embed_chunks_on_update
  AFTER UPDATE OF content, section ON chunks
  FOR EACH ROW
  EXECUTE FUNCTION util.queue_embeddings('chunk_embedding_input', 'embedding');

-- Trigger to clear embeddings on update (ensures accuracy)
CREATE TRIGGER clear_chunk_embedding_on_update
  BEFORE UPDATE OF content, section ON chunks
  FOR EACH ROW
  EXECUTE FUNCTION util.clear_column('embedding');

-- ============================================================================
-- PART 7: MATERIALIZED VIEW FOR CACHING
-- ============================================================================

-- Materialized view for frequently accessed chunks
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_framework_chunks AS
SELECT 
  c.*,
  d.name as document_name
FROM chunks c
JOIN documents d ON c.document_id = d.id;

-- Indexes on materialized view
CREATE INDEX IF NOT EXISTS mv_framework_chunks_embedding_idx 
  ON mv_framework_chunks 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 15);

CREATE INDEX IF NOT EXISTS mv_framework_chunks_tags_idx 
  ON mv_framework_chunks 
  USING gin(framework_tags);

CREATE INDEX IF NOT EXISTS mv_framework_chunks_fts_idx 
  ON mv_framework_chunks 
  USING gin(fts);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_framework_chunks_cache()
RETURNS void
LANGUAGE sql
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_framework_chunks;
$$;

-- Schedule cache refresh every hour
SELECT cron.schedule(
  'refresh-framework-cache',
  '0 * * * *',  -- Every hour
  $$
  SELECT refresh_framework_chunks_cache();
  $$
);

-- ============================================================================
-- PART 8: HELPER VIEWS FOR MONITORING
-- ============================================================================

-- View for slow query analysis
CREATE OR REPLACE VIEW v_slow_queries AS
SELECT 
  query_type,
  COUNT(*) as slow_query_count,
  AVG(execution_time_ms) as avg_time_ms,
  MAX(execution_time_ms) as max_time_ms,
  DATE_TRUNC('hour', created_at) as hour
FROM query_performance_log
WHERE execution_time_ms > 1000
GROUP BY query_type, DATE_TRUNC('hour', created_at)
ORDER BY hour DESC, avg_time_ms DESC;

-- View for query performance summary
CREATE OR REPLACE VIEW v_query_performance_summary AS
SELECT 
  query_type,
  COUNT(*) as total_queries,
  AVG(execution_time_ms) as avg_time_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY execution_time_ms) as p50_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time_ms) as p95_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY execution_time_ms) as p99_ms,
  AVG(chunks_returned) as avg_chunks_returned
FROM query_performance_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY query_type;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify installation
DO $$
BEGIN
  RAISE NOTICE 'Migration 003 completed successfully!';
  RAISE NOTICE 'Optimizations applied:';
  RAISE NOTICE '  ✓ Vector index optimized (lists=15, probes=3)';
  RAISE NOTICE '  ✓ Full-text search enabled';
  RAISE NOTICE '  ✓ Hybrid search function created';
  RAISE NOTICE '  ✓ Performance logging enabled';
  RAISE NOTICE '  ✓ Automatic embeddings configured';
  RAISE NOTICE '  ✓ Materialized view cache created';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Deploy embed Edge Function (see supabase/functions/embed/)';
  RAISE NOTICE '  2. Add project_url to Vault: SELECT vault.create_secret(''<your-url>'', ''project_url'');';
  RAISE NOTICE '  3. Update RagService to use new functions';
  RAISE NOTICE '  4. Monitor performance with v_query_performance_summary view';
END $$;
