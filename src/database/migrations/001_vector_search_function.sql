-- Vector search function for RAG system
-- Uses cosine distance for similarity matching

create or replace function search_chunks(
  query_embedding vector(768),
  match_threshold float default 0.3,
  match_count int default 10
)
returns table (
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
language sql
stable
as $$
  select
    chunks.id,
    chunks.document_id,
    chunks.section,
    chunks.content,
    chunks.framework_tags,
    chunks.token_count,
    chunks.embedding,
    chunks.created_at,
    chunks.embedding <=> query_embedding as distance
  from chunks
  where chunks.embedding <=> query_embedding < match_threshold
  order by distance asc
  limit match_count;
$$;
