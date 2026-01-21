-- Helper function to insert chunks with proper vector type casting
-- This ensures embeddings are stored as vector(768) not text

create or replace function insert_chunk_with_embedding(
  p_document_id bigint,
  p_section text,
  p_content text,
  p_framework_tags text[],
  p_token_count int,
  p_embedding float[]
)
returns void
language plpgsql
as $$
begin
  insert into chunks (
    document_id,
    section,
    content,
    framework_tags,
    token_count,
    embedding
  ) values (
    p_document_id,
    p_section,
    p_content,
    p_framework_tags,
    p_token_count,
    p_embedding::vector(768)
  );
end;
$$;
