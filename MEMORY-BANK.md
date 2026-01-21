# NIGEL Memory Bank

## 1. Project Identity
- **Name:** NIGEL
- **Purpose:** Interactive Training & Instruction Bot for the S.P.A.R.K. Discord server.
- **Outcome:** A Discord-native cognitive training system featuring daily drills, practice sessions, doctrine-grounded Q&A (RAG), and Authority Metrics tracking.
- **Personality/Voice:** 
  - **Calm, Surgical, Slightly Mischievous:** Tone should be authoritative but not robotic.
  - **Direct:** Short sentences, concrete language.
  - **Subtle Humor:** Max one subtle joke per response.
  - **Forbidden:** "OMG", "Let's gooo", "Bestie", excessive emojis, hype language, generic AI assistant platitudes.

## 2. Tech Stack (Hard Constraints)
- **Language:** Node.js + TypeScript (Strict mode).
- **Discord API:** `discord.js` (Slash commands, collectors, components).
- **Database:** Supabase PostgreSQL with `pgvector` for semantic search.
- **AI Engine:** 
  - **Embeddings:** Google Gemini `text-embedding-004` (768-dimensional vectors)
  - **Synthesis:** Anthropic Claude 4.5 (Haiku + Sonnet hybrid routing)
  - **Features:** Extended thinking, prompt caching, intelligent model selection
- **Hosting:** Railway for continuous deployment.
- **Timezone:** `America/Phoenix` (UTC storage, Phoenix-based period calculations).

## 3. Architecture Overview

### File Structure
```
src/
├── commands/           # Slash command definitions
│   ├── training/       # /drill, /leaderboard, /stats
│   └── utility/        # /ping, /help
├── interactions/       # Button/modal/select handlers
│   ├── DrillHandler.ts # Drill button interactions
│   └── router.ts       # Central interaction router
├── services/           # Business logic
│   ├── DrillService.ts # Session management, Q&A flow
│   ├── ScoringService.ts # Points, XP, streaks, levels
│   └── SchedulerService.ts # Cron jobs (daily drill, weekly leaderboard)
├── database/           # Data layer
│   ├── client.ts       # Supabase client
│   ├── schema.sql      # Full schema definition
│   └── UserRepository.ts # User CRUD operations
├── utils/              # Helpers
│   ├── phoenix.ts      # Timezone utilities
│   ├── embeds.ts       # Embed builders and colors
│   └── loader.ts       # Dynamic command loader
├── types/              # TypeScript interfaces
│   ├── database.ts     # All DB row types
│   └── discord.ts      # Command/client types
└── scripts/            # One-off scripts
    ├── seed-questions.ts # Populate question bank
    └── send-guide.ts     # Post system manual
```

### Core Data Flows
1. **Drill Flow:** User clicks Start → DrillService creates session → Questions shown one by one → Answers processed → Points/XP awarded → Final stats displayed.
2. **Scoring Flow:** Correct answer → Base points × difficulty × streak multiplier + speed bonus → Atomic database update → Streak calculation (Phoenix timezone).
3. **Daily Drill:** SchedulerService (9am Phoenix) → Posts invitation embed → User interaction → Full drill flow.

## 4. Database Schema Summary

### Tables & Relationships
- **`users`**: Base identity (Discord ID, metadata).
- **`user_stats`**: 1:1 with `users`. Tracks points, XP, and streaks.
- **`documents`**: Source doctrine files.
- **`chunks`**: M:1 with `documents`. Stores text segments and `vector(768)` embeddings.
- **`questions`**: Bank of drills and scenarios, tagged by framework.
- **`sessions` / `attempts`**: Tracks practice history and individual question performance.
- **`authority_entries`**: Daily logs of scores and notes.
- **`authority_streaks`**: Specialized streak tracking for metrics.
- **`period_scores`**: Snapshot of points for weekly/monthly rankings.
- **`badges` / `user_badges`**: M:M relationship for gamification rewards.

### Key Indexes
- **Vector Search:** `ivfflat` index on `chunks.embedding` using `vector_cosine_ops`.
- **Tag Search:** GIN indexes on `framework_tags` for fast filtering by Framework.
- **Performance:** B-tree indexes on `discord_user_id`, `created_at`, and `is_active`.

## 5. Environment Variables
- `DISCORD_TOKEN`: Bot token for authentication
- `CLIENT_ID`: Discord application ID (for command registration)
- `GUILD_ID`: Target server ID (for guild-scoped commands)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Public API key for Supabase interaction
- `GEMINI_API_KEY`: Google Gemini API key (for embeddings only)
- `ANTHROPIC_API_KEY`: Claude API key (for RAG synthesis with Haiku/Sonnet)
- `DAILY_DRILL_CHANNEL_ID`: Channel for daily drill posts
- `LEADERBOARD_CHANNEL_ID`: Channel for weekly leaderboard posts
- `AUTHORITY_CHANNEL_ID`: Channel for public authority posts

## 6. Current State

### Database Verification (January 21, 2026)
- ✅ **Supabase Connection:** Verified operational (PostgreSQL 17.6)
- ✅ **Schema Deployment:** All 14 tables deployed with proper relationships
- ✅ **Vector Search:** pgvector 0.8.0 installed, 151 chunks with 768-dim embeddings
- ✅ **Knowledge Base:** 31 documents ingested, all frameworks covered
- ✅ **Functions:** search_chunks, phoenix_date, insert_chunk_with_embedding deployed
- ✅ **Indexes:** 20+ performance indexes operational (including IVFFlat vector index)
- ✅ **RAG Service:** Verified correct database access patterns

### LangChain Integration (January 21, 2026)
- ✅ **LangChain Integration:** Production-ready with Claude 4.5 models
- ✅ **7 Working Examples:** Basic RAG, Hybrid Search, Conversational, Extended Thinking, Framework Filtering, Citations, Multi-Query
- ✅ **Cost Optimization:** Prompt caching enabled (90% cost reduction)
- ✅ **Documentation:** Complete guide with examples and best practices
- ✅ **Files Added:**
  - `src/integrations/langchain/SupabaseVectorStore.ts` (enhanced)
  - `src/integrations/langchain/examples.ts` (7 examples)
  - `LANGCHAIN-INTEGRATION-GUIDE.md` (complete guide)
  - `LANGCHAIN-SETUP-COMPLETE.md` (quick reference)
- ✅ **Repository Pattern:** UserRepository using safe parameterized queries
- ✅ **Dynamic Question Generation:** Questions generated from knowledge base using Claude (no seeding required)
- 📄 **Documentation:** DATABASE-VERIFICATION-REPORT.md, DATABASE-QUICK-REFERENCE.md created

### MCP Toolset Integration (January 21, 2026)
- ✅ **Universal MCP Toolset System:** Works in ANY Node.js/TypeScript project (not just NIGEL)
- ✅ **Core Service:** `templates/McpToolsetService.ts` - Reusable service for any project
- ✅ **NIGEL Integration:** `src/integrations/langchain/McpToolsetIntegration.ts` with hybrid routing
- ✅ **Discord Command:** `/ask-mcp` - Enhanced RAG with external MCP tool access
- ✅ **Installation Scripts:** One-command setup for Unix/Windows (`add-mcp-toolset.sh/.bat`)
- ✅ **8 Working Examples:** Calendar, research, database, GitHub, streaming, cost optimization
- ✅ **Cost Optimization:** Allowlist, denylist, deferred loading (60-80% savings)
- ✅ **Security:** HTTPS enforcement, allowlist defaults, environment variables
- ✅ **Testing:** 6 automated tests, 100% pass rate
- ✅ **Documentation:** 
  - `docs/MCP-TOOLSET-GUIDE.md` (5000+ word complete guide)
  - `MCP-TOOLSET-README.md` (GitHub repository README)
  - `GITHUB-DEPLOYMENT-GUIDE.md` (deployment instructions)
  - `MCP-TOOLSET-INTEGRATION-SUMMARY.md` (implementation summary)
- ✅ **GitHub Ready:** Full deployment package ready for public sharing

### MVP Foundation (Completed)
- ✅ Full project structure with TypeScript strict mode
- ✅ SQL Schema deployed on Supabase with pgvector
- ✅ Discord client with gateway connection
- ✅ Dynamic command loading system
- ✅ Central interaction router with error handling
- ✅ `/ping` - System diagnostics
- ✅ `/help` - Command documentation
- ✅ `/drill` - Manual drill trigger with dynamic question generation
- ✅ `/stats` - User statistics display
- ✅ `/leaderboard` - All-time standings
- ✅ `DrillService` - Full session lifecycle with dynamic questions
- ✅ `QuestionGeneratorService` - Dynamic question generation from knowledge base
- ✅ `ScoringService` - Points, XP, streaks with multipliers
- ✅ `SchedulerService` - Daily 9am drill, weekly leaderboard
- ✅ `UserRepository` - Get-or-create pattern for users
- ✅ Phoenix timezone utilities
- ✅ NIGEL voice applied to all user-facing messages

### V1 Features (Completed)
- ✅ **RAG System (Claude 4.5 Optimized)**
  - ✅ `RagService` - Gemini for embeddings, Claude 4.5 for synthesis
  - ✅ **Hybrid Model Routing:** Haiku 4.5 for simple queries, Sonnet 4.5 for complex
  - ✅ **Extended Thinking:** Enabled for high-complexity queries (score 60+)
  - ✅ **Prompt Caching:** 90% cost savings on cache hits (5min TTL)
  - ✅ **Complexity Analysis:** Automatic model selection based on query characteristics
  - ✅ Vector search with cosine similarity (15 chunks retrieved)
  - ✅ Configurable confidence threshold (default 0.5, lower for better context)
  - ✅ `/ask` command with source citations and model indicators (⚡🎯🧠)
  - ✅ `ingest-knowledge` script for markdown vectorization
  - ✅ Automatic tag detection from filenames
  - ✅ Frontmatter support for manual tags
  - ✅ Intelligent chunking (400-600 tokens, 800 max)
  - ✅ XML-structured prompts following Claude 4.x best practices
  - ✅ Workbench-optimized system prompt

- ✅ **Authority Metrics**
  - ✅ `AuthorityService` - Logging, streaks, statistics, leaderboard
  - ✅ `AuthorityHandler` - 5-field modal (Confidence, Discipline, Leadership, Gratitude, Enjoyment)
  - ✅ `/authority log` - Public (default) or private, with username/avatar display
  - ✅ `/authority stats` - Personal averages and trends
  - ✅ `/authority week` - Current week entries
  - ✅ `/authority leaderboard` - Rankings by period (week/month/all)
  - ✅ Streak tracking (Phoenix timezone, same as drills)
  - ✅ NIGEL voice assessments

- ✅ **Practice Lab**
  - ✅ `/practice` command with filters
  - ✅ Framework selection (11 choices + "All")
  - ✅ Difficulty filter (1-5)
  - ✅ Length options (5, 10, 20 questions)
  - ✅ `DrillService.startPracticeSession()` method
  - ✅ Framework-specific tips (BTE corrected to Baseline/Trigger/Exception)
  - ✅ Practice sessions maintain streaks

- 🔄 **Admin Commands** (In progress - other model)
  - Admin role check utility
  - `/trigger-drill` - Manual drill posting
  - `/add-question` - Modal question entry
  - `/user-lookup` - User profile inspection

### Documentation
- ✅ `SETUP.md` - Complete installation and configuration guide
- ✅ `DEPLOYMENT.md` - Pre-deployment checklist and monitoring guide
- ✅ `CLAUDE-BEST-PRACTICES.md` - Comprehensive Claude 4.5 API guide
- ✅ Vector search SQL function
- ✅ Updated type definitions in `database.ts`
- ✅ Claude 4.x optimized prompts with XML structure
- ✅ Hybrid routing implementation documented

### Next Tasks
- Complete admin command implementation
- Full system testing
- Deploy to Railway
- Monitor first week of usage

### Recent Updates (January 21, 2026)
- ✅ Database connection verified operational
- ✅ Vector search tested (151 chunks, all with embeddings)
- ✅ All database functions confirmed deployed
- ✅ RAG service database access patterns verified
- ✅ Comprehensive documentation created (3 new files)
- ✅ **Dynamic question generation implemented** - Questions generated from knowledge base via Claude
- ✅ **Authority username display fixed** - Public posts now show user info
- ✅ **Authority leaderboard added** - `/authority leaderboard` command with period filters
- ✅ **MCP Toolset Integration** - Universal system for external tool access, GitHub deployment ready

## 7. Key Decisions Log

### Architectural Choices
- **User Registration:** Automatic get-or-create on first interaction via `UserRepository`
- **Session Storage:** In-memory Map for MVP speed (consider Redis for production scale)
- **Streak Calculation:** Phoenix timezone-based day boundaries for both drills AND authority metrics
- **Point Formula:** Base × Difficulty × Streak Multiplier + Speed Bonus
- **Fisher-Yates Shuffle:** Proper randomization for question selection
- **Gemini Model Split:** Flash for embeddings (speed), Pro for synthesis (quality)
- **Authority Modal Limit:** 5-field limit (Discord constraint) - notes omitted, scores only
- **Practice Sessions:** Count toward streaks, use same session infrastructure as drills
- **RAG Threshold:** 0.7 default, stored in config table for runtime adjustability
- **Framework Tags:** Auto-detect from filenames, override via frontmatter
- **Chunking Strategy:** 400-600 token target, 800 max, 50-token overlap, heading-aware

### V1 Specific Decisions
- **Authority Privacy:** Public by default, can be set to private in modal
- **Authority Leaderboard:** Shows top 10 users by average score, filterable by period
- **Admin Access:** Single hardcoded role ID (Ninja: 1308506554290405449)
- **BTE Correction:** Baseline/Trigger/Exception (not Break/Trigger/Exploit)
- **Practice Filters:** Framework + difficulty, questions generated dynamically
- **RAG Fallback:** "No doctrine found" message, no speculation
- **Dynamic Questions:** Questions generated from knowledge base using Claude Haiku, no database storage

### Claude 4.5 Integration Decisions (Jan 2026)
- **Model Selection:** Claude Haiku 4.5 + Sonnet 4.5 hybrid routing for cost/quality balance
- **Hybrid Routing:** Score-based (0-39: Haiku, 40-59: Sonnet, 60+: Sonnet + Thinking)
- **Complexity Factors:** Framework count, query length, keywords, question depth
- **Extended Thinking:** Enabled for score 60+, 8K token budget for deep reasoning
- **Prompt Caching:** System prompt + context cached, 5min TTL, 90% savings on hits
- **Model IDs:** `claude-haiku-4-5-20251001`, `claude-sonnet-4-5-20250929`
- **XML Structure:** All prompts use XML tags for better Claude 4.x instruction following
- **Workbench Integration:** System prompt optimized using Claude Console prompt generator
- **Cost Optimization:** Caching + routing saves ~60-70% vs single-model approach
- **Threshold Adjustment:** Lowered to 0.5 from 0.7 for more context to thinking models

### LangChain Integration Decisions (Jan 2026)
- **Framework Choice:** LangChain for industry-standard RAG patterns and community support
- **Vector Store:** Custom `SupabaseVectorStore` wrapper using NIGEL's optimized RagService
- **Search Methods:** Vector similarity, hybrid (RRF), and framework filtering
- **Model Integration:** Official `@langchain/anthropic` package with Claude 4.5 models
- **Prompt Caching:** Automatic for system prompts (90% cost reduction)
- **Examples Library:** 7 production-ready patterns (basic, hybrid, conversational, thinking, filtered, citations, multi-query)
- **Documentation:** Complete guide with setup, examples, cost optimization, and troubleshooting
- **Performance:** Same speed as direct RagService, more features and patterns
- **Use Cases:** Conversational memory, multi-query retrieval, citations, extended thinking
- **Integration Path:** Drop-in replacement for Discord commands, maintains NIGEL's voice

### Anti-Patterns (Do NOT do)
- **Hallucination:** NEVER invent doctrine. If RAG returns low confidence, explicitly state the lack of source
- **Raw SQL:** NEVER use string concatenation; use parameterized queries
- **Any Types:** Avoid `any` at all costs. Use strict interfaces
- **Biased Randomization:** Don't use `Math.random() - 0.5` for shuffling
- **NIGEL Voice Violations:** No "OMG", "Let's gooo", excessive emojis, or hype language

## 8. NPM Scripts
```bash
npm run dev              # Start with tsx (development)
npm run build            # Compile TypeScript
npm run start            # Run compiled JS (production)
npm run deploy           # Register commands to guild
npm run deploy:global    # Register commands globally
npm run send-guide       # Post system manual to channel
npm run ingest-knowledge # Vectorize knowledge base
```

**Note:** `seed-questions` script no longer needed - questions are generated dynamically from knowledge base.

## 9. Knowledge Base
- **Source:** Official SPARK/Chase Hughes documentation.
- **Frameworks Covered:** 6MX, FATE, BTE, 4 Frames, Elicitation, Cognitive Biases, Body Language, Rapport, Cialdini Influence.
- **Chunking Strategy:** 400-600 tokens target, 800 max. Each chunk inherits parent document tags.
- **Ingestion Protocol:** All doctrine formatted as Markdown with concept headers before vectorization.
