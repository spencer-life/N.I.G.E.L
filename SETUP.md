# NIGEL V1 Setup Guide

## Prerequisites

- Node.js 18+ installed
- Discord bot created with proper intents
- Supabase project with pgvector extension
- Google Gemini API key

## Installation Steps

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

Required variables:
- `DISCORD_TOKEN` - Bot token from Discord Developer Portal
- `CLIENT_ID` - Application ID from Discord
- `GUILD_ID` - Your server ID (for testing)
- `SUPABASE_URL` - From Supabase project settings
- `SUPABASE_ANON_KEY` - From Supabase project API settings
- `GEMINI_API_KEY` - From Google AI Studio
- `DAILY_DRILL_CHANNEL_ID` - Channel for daily drills
- `LEADERBOARD_CHANNEL_ID` - Channel for weekly leaderboards
- `AUTHORITY_CHANNEL_ID` - Channel for public authority posts

### 3. Database Setup

#### A. Run the Schema

Execute `src/database/schema.sql` in your Supabase SQL editor.

#### B. Add Vector Search Function

Execute `src/database/migrations/001_vector_search_function.sql` in Supabase.

#### C. Seed Initial Config (Optional)

```sql
INSERT INTO config (key, value) VALUES 
  ('rag_threshold', '{"value": 0.7}'),
  ('chunk_size', '{"target": 500, "max": 800, "overlap": 50}');
```

### 4. Deploy Commands to Discord

```bash
npm run deploy
```

For global deployment (not recommended during testing):
```bash
npm run deploy:global
```

### 5. Seed Question Bank

```bash
npm run seed-questions
```

### 6. Ingest Knowledge Base

This creates vector embeddings for the RAG system:

```bash
npm run ingest-knowledge
```

**Note:** This will make API calls to Gemini for each chunk. With ~30 knowledge files averaging 5 chunks each, expect ~150 API calls. This takes 2-5 minutes.

### 7. Start the Bot

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## Post-Deployment Checklist

### Discord Bot Intents

Ensure these intents are enabled in Discord Developer Portal:
- ✅ Server Members Intent
- ✅ Message Content Intent (if needed for future features)
- ✅ Presence Intent (optional)

### Discord Bot Permissions

Bot needs these permissions (use integer: 2147568640):
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Use Slash Commands
- Manage Messages (optional, for cleanup)

### Verify Ninja Role

The admin role ID is hardcoded as `1308506554290405449`. To use a different role:

1. Get your admin role ID from Discord (right-click role → Copy ID)
2. Update `src/utils/admin.ts` (when other model completes it)
3. Rebuild and restart

### Test Each Feature

1. **Drills:** `/drill` - Start a practice session
2. **Stats:** `/stats` - View your progress
3. **Leaderboard:** `/leaderboard` - Check rankings
4. **RAG:** `/ask query:What is FATE?` - Test doctrine search
5. **Authority:** `/authority log` - Log metrics
6. **Authority Stats:** `/authority stats` - View trends
7. **Practice:** `/practice framework:FATE difficulty:3 length:5`
8. **Admin (Ninja role only):**
   - `/trigger-drill` - Manual drill post
   - `/add-question` - Add new question
   - `/user-lookup` - View user data

## Scheduled Tasks

The bot automatically runs:
- **Daily Drill:** 9:00 AM Phoenix time
- **Weekly Leaderboard:** Monday 9:00 AM Phoenix time

These are configured in `src/services/SchedulerService.ts`.

## Knowledge Base Updates

To add new doctrine files:

1. Add `.md` files to `knowledge/` folder
2. (Optional) Add YAML frontmatter with tags:
   ```yaml
   ---
   tags: ["Framework1", "Framework2"]
   ---
   ```
3. Run ingestion:
   ```bash
   npm run ingest-knowledge
   ```

The script will:
- Skip unchanged files (checks content hash)
- Auto-detect tags from filename if no frontmatter
- Chunk content intelligently (400-600 tokens)
- Generate embeddings via Gemini Flash
- Store in Supabase with vector indexes

## Troubleshooting

### "No questions available"
Run `npm run seed-questions` to populate the question bank.

### "GEMINI_API_KEY not configured"
Add your API key to `.env` file.

### RAG returns "No doctrine found"
1. Verify knowledge ingestion completed: Check `documents` and `chunks` tables in Supabase
2. Lower the threshold: Update config table `rag_threshold` to 0.6 or 0.5
3. Check vector index: Ensure `chunks_embedding_ivfflat` index exists

### Commands not showing in Discord
1. Run `npm run deploy` again
2. Wait 1-5 minutes for Discord to propagate
3. For guild commands, ensure `GUILD_ID` is correct
4. Try kicking and re-inviting the bot

### Daily drill not posting
1. Check `DAILY_DRILL_CHANNEL_ID` is correct
2. Verify bot has permissions in that channel
3. Check server logs for cron job execution
4. Test manually with `/trigger-drill` (admin only)

### Authority modal not working
Ensure the router is properly handling `authority_log_` prefixed modal submissions. Check `src/interactions/router.ts`.

## Railway Deployment

Railway configuration is in `railway.json`. Ensure all environment variables are set in Railway dashboard.

Build command: `npm run build`
Start command: `npm start`

## Support

For issues, check:
1. `MEMORY-BANK.md` - Architecture and decisions
2. `TODO.md` - Implementation status
3. Server logs for error details
