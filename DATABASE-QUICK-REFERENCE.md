# NIGEL Database Quick Reference

## Connection

```typescript
import { supabase } from "./database/client.js";
```

---

## Common Queries

### Users

```typescript
// Get or create user
const user = await UserRepository.getOrCreate(
  discordUserId,
  username,
  displayName,
  avatarUrl
);

// Get user stats
const stats = await UserRepository.getStats(discordUserId);

// Get leaderboard
const leaders = await UserRepository.getLeaderboard(10);
```

### Vector Search (RAG)

```typescript
// Search knowledge base
const chunks = await RagService.searchDoctrine(query, threshold);

// Full RAG query
const response = await RagService.ask(query);
// Returns: { answer, sources, confidence }
```

### Questions

```typescript
// Get active drill questions
const { data } = await supabase
  .from("questions")
  .select("*")
  .eq("is_active", true)
  .eq("question_type", "drill")
  .limit(10);

// Filter by framework
const { data } = await supabase
  .from("questions")
  .select("*")
  .overlaps("framework_tags", ["FATE", "6MX"]);
```

### Sessions & Attempts

```typescript
// Create session
const { data: session } = await supabase
  .from("sessions")
  .insert({
    user_id: userId,
    session_type: "drill",
    status: "active",
    metadata: { question_count: 10 },
  })
  .select()
  .single();

// Record attempt
await supabase.from("attempts").insert({
  session_id: sessionId,
  user_id: userId,
  question_id: questionId,
  answer_text: "2",
  is_correct: true,
  points_awarded: 150,
  response_time_ms: 3500,
});
```

### Authority Metrics

```typescript
// Log authority entry
await supabase.from("authority_entries").insert({
  user_id: userId,
  entry_date: new Date().toISOString().split("T")[0],
  scores: {
    presence: 8,
    composure: 7,
    discipline: 9,
    clarity: 8,
    influence: 7,
  },
  notes: "Optional notes",
});

// Get user's authority stats
const { data } = await supabase
  .from("authority_entries")
  .select("*")
  .eq("user_id", userId)
  .order("entry_date", { ascending: false })
  .limit(30);
```

---

## Database Functions

### Phoenix Timezone Helper

```typescript
// Use in queries for streak calculations
const { data } = await supabase.rpc("phoenix_date", {
  ts: new Date().toISOString(),
});
// Returns: '2026-01-21' (Phoenix date)
```

### Vector Search

```typescript
// Generate embedding first
const embedding = await RagService.generateEmbedding(query);

// Search chunks
const { data } = await supabase.rpc("search_chunks", {
  query_embedding: embedding,
  match_threshold: 0.6, // Lower = more results
  match_count: 15,
});
```

---

## Configuration

### Get RAG Threshold

```typescript
const { data } = await supabase
  .from("config")
  .select("value")
  .eq("key", "rag_threshold")
  .single();

const threshold = data?.value?.value || 0.5;
```

### Update Config

```typescript
await supabase
  .from("config")
  .upsert({
    key: "rag_threshold",
    value: { value: 0.7 },
  });
```

---

## Error Handling

```typescript
const { data, error } = await supabase
  .from("users")
  .select("*")
  .eq("discord_user_id", discordUserId)
  .single();

if (error) {
  console.error("Database error:", error.message);
  throw new Error(`Failed to fetch user: ${error.message}`);
}

if (!data) {
  console.log("User not found");
  return null;
}
```

---

## Performance Tips

1. **Use indexes:** All common queries are indexed (user_id, discord_user_id, framework_tags)
2. **Limit results:** Always use `.limit()` for large tables
3. **Select specific columns:** Use `.select("id, name")` instead of `.select("*")`
4. **Batch operations:** Use `.insert([...])` for multiple rows
5. **Cache config:** Don't fetch config on every request

---

## Common Patterns

### Get or Create Pattern

```typescript
// Try to find existing
let { data: existing } = await supabase
  .from("table")
  .select("*")
  .eq("key", value)
  .single();

if (!existing) {
  // Create new
  const { data: created } = await supabase
    .from("table")
    .insert({ key: value })
    .select()
    .single();
  existing = created;
}

return existing;
```

### Upsert Pattern

```typescript
// Insert or update if exists
await supabase
  .from("authority_entries")
  .upsert(
    {
      user_id: userId,
      entry_date: date,
      scores: newScores,
    },
    {
      onConflict: "user_id,entry_date", // Unique constraint
    }
  );
```

### Transaction Pattern

```typescript
// Supabase doesn't support transactions in client
// Use database functions for atomic operations
// Or handle rollback manually
```

---

## Environment Variables

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

---

## Useful SQL Queries

### Check Vector Search Performance

```sql
EXPLAIN ANALYZE
SELECT * FROM chunks
WHERE embedding <=> '[0.1, 0.2, ...]'::vector < 0.6
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 15;
```

### Get Framework Distribution

```sql
SELECT 
  unnest(framework_tags) as framework,
  COUNT(*) as chunk_count
FROM chunks
GROUP BY framework
ORDER BY chunk_count DESC;
```

### Get User Activity

```sql
SELECT 
  u.username,
  us.points,
  us.current_streak,
  COUNT(DISTINCT s.id) as total_sessions,
  COUNT(a.id) as total_attempts,
  SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) as correct_answers
FROM users u
JOIN user_stats us ON u.id = us.user_id
LEFT JOIN sessions s ON u.id = s.user_id
LEFT JOIN attempts a ON u.id = a.user_id
GROUP BY u.id, u.username, us.points, us.current_streak
ORDER BY us.points DESC
LIMIT 10;
```

---

## Troubleshooting

### "No rows returned"
- Check if data exists: `SELECT COUNT(*) FROM table;`
- Verify filters are correct
- Use `.maybeSingle()` instead of `.single()` if row might not exist

### "Vector dimension mismatch"
- Embeddings must be exactly 768 dimensions
- Check Gemini API response
- Verify vector type: `vector(768)`

### "Slow queries"
- Check if indexes exist: `\d+ table_name` in SQL editor
- Use EXPLAIN ANALYZE to see query plan
- Consider adding composite indexes for common filters

### "Connection timeout"
- Check environment variables
- Verify Supabase project is active
- Check network/firewall settings
