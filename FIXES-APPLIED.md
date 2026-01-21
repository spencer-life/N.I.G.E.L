# NIGEL /ask Command Fixes Applied

## Issues Found

1. **Concept Name Extraction** - The regex only captured single words, so "what is the FATE framework" captured "the" instead of "fate"
2. **Multi-word Support** - Queries like "what is the Six-Minute X-Ray" weren't handled properly
3. **Acronym Handling** - Queries like "what is 6MX" or "what is BTE" needed special mapping
4. **Tag Search** - Framework tags search was case-sensitive and incomplete
5. **Embedding Storage** - Embeddings were being stored as TEXT instead of proper vector(768) type

## Fixes Applied

### 1. Improved Concept Extraction (`RagService.ts`)
- ✅ Updated regex to capture full multi-word concepts
- ✅ Added support for "what are" queries
- ✅ Automatic removal of common suffixes (framework, model, method, etc.)
- ✅ Added acronym mapping for common terms (6MX, BTE, PCP, FATE, etc.)

### 2. Enhanced Title Matching
- ✅ Added support for multi-word concepts with hyphens
- ✅ Better pattern matching for section titles
- ✅ Increased limit to catch more potential matches

### 3. Framework Tag Search
- ✅ Added case-insensitive tag searching (both lowercase and uppercase)
- ✅ Using `cs` operator for array containment

### 4. Vector Embedding Storage Fix
- ✅ Created SQL function `insert_chunk_with_embedding` to properly cast embeddings
- ✅ Updated ingestion script to use RPC function
- ⚠️  **ACTION REQUIRED**: Run migration SQL in Supabase

## Action Required

### Step 1: Run Migration in Supabase Dashboard

Go to your Supabase project SQL Editor and run:

```sql
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
```

### Step 2: Re-ingest Knowledge Base

```bash
npm run clear-knowledge
npm run ingest-knowledge
```

### Step 3: Restart the Bot

```bash
# Stop the current bot (Ctrl+C if running)
npm run dev
```

## Expected Results

After completing these steps:
- ✅ "what is 6MX" should return Six-Minute X-Ray content
- ✅ "what is the FATE framework" should return FATE content
- ✅ "what is BTE" should return Behavioral Table of Elements
- ✅ "what is the grief model" should return grief content
- ✅ All multi-word concepts should work correctly
- ✅ Vector search should return proper results (not "NO RESULTS")

## Test Results Before Fix

- Success Rate: 63.3% (19/30 passed)
- Major failures: 6MX, Six-Minute X-Ray, interrogation (NO RESULTS)
- Partial failures: Four Frames, hypnosis, linguistics (wrong documents)

## Expected Results After Fix

- Success Rate: 90%+ (27+/30 passed)
- All core frameworks should be found correctly
- Vector search should work for all ingested content

---

**Files Modified:**
- `src/services/RagService.ts` - Enhanced search logic
- `src/scripts/ingest-knowledge.ts` - Fixed embedding insertion
- `src/database/migrations/002_insert_chunk_function.sql` - New migration

**Created:** January 21, 2026
