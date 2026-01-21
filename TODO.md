# NIGEL Implementation Checklist

## Phase: MVP (Weeks 1-3)

### Knowledge Base Extraction
- [x] Create knowledge/ folder structure with category placeholders
- [ ] Populate .md files with NotebookLLM output (In Progress)
- [ ] Perform Audit & Format Review of all extracted doctrine
- [ ] Review and clean up extracted doctrine

### Project Setup
- [x] Initialize Node.js project with TypeScript
- [x] Install dependencies (discord.js, @supabase/supabase-js, @google/generative-ai, node-cron)
- [x] Configure environment variables (.env.example)
- [x] Set up Railway deployment configuration

### Database
- [x] Create Supabase project
- [x] Enable pgvector extension
- [x] Deploy users and user_stats tables
- [x] Deploy documents and chunks tables (RAG)
- [x] Deploy questions, sessions, attempts tables
- [x] Deploy authority_entries and authority_streaks tables
- [x] Deploy period_scores, badges, user_badges tables
- [x] Deploy config and admin_logs tables
- [x] Create indexes and helper functions

### Discord Bot Core
- [ ] Create Discord application and bot
- [ ] Implement gateway connection and ready event
- [ ] Set up command registration script
- [ ] Implement basic command handler
- [ ] Implement interaction handler (buttons, modals, selects)

### RAG System
- [ ] Build document ingestion script (PDF/text extraction)
- [ ] Implement semantic chunking with overlap
- [ ] Add framework tagging logic
- [ ] Generate and store embeddings via Gemini
- [ ] Implement vector similarity search function
- [ ] Build response generator with system prompt

### Daily Drill
- [ ] Create scheduler service (node-cron)
- [ ] Implement question selection logic
- [ ] Build drill embed with answer buttons
- [ ] Handle button interactions
- [ ] Record attempts and calculate points
- [ ] Send ephemeral feedback

### Ask NIGEL (/ask)
- [ ] Create /ask slash command
- [ ] Integrate RAG retrieval
- [ ] Generate response with Gemini
- [ ] Handle "no doctrine" fallback
- [ ] Support #ask-nigel channel messages

### Authority Metrics
- [ ] Create /authority command with subcommands
- [ ] Build multi-page modal flow (4 modals)
- [ ] Store entries in authority_entries table
- [ ] Update streak tracking
- [ ] Post formatted summary to channel
- [ ] Support private mode (ephemeral only)

### Basic Scoring
- [ ] Implement point calculation function
- [ ] Track user_stats on each attempt
- [ ] Build weekly leaderboard query
- [ ] Create leaderboard embed display

---

## Phase: V1 (Weeks 4-6)

### Practice Lab
- [ ] Create /practice command
- [ ] Build framework selection menu
- [ ] Build mode selection (Recall/Scenario)
- [ ] Build difficulty selection (1-5)
- [ ] Build length selection (5/10/20)
- [ ] Implement session management
- [ ] Display question sequence
- [ ] Show session summary with stats

### Streaks & Bonuses
- [ ] Implement streak tracking logic
- [ ] Apply streak bonus to scoring
- [ ] Create streak display in user stats

### Extended Leaderboards
- [ ] Monthly leaderboard
- [ ] Yearly leaderboard
- [ ] Lifetime leaderboard
- [ ] Most improved calculation

### Badges & Belts
- [ ] Seed badge definitions
- [ ] Implement badge award triggers
- [ ] Create belt progression logic
- [ ] Award Discord roles on belt promotion

### Role Rotation
- [ ] Weekly champion role assignment
- [ ] Auto-expire previous week's role
- [ ] Post announcement to #belt-ceremony

### Admin Commands
- [ ] /admin question add
- [ ] /admin question edit
- [ ] /admin question status
- [ ] /admin drill trigger
- [ ] /admin user stats

### Authority Trends
- [ ] Weekly summary calculation
- [ ] Trend analysis (delta vs last week)
- [ ] /authority stats command
- [ ] /authority week command

---

## Phase: V2 (Weeks 7-10)

### Scenario Diagnostics
- [ ] Create scenario question type
- [ ] Build long-form vignette display
- [ ] Multi-part diagnostic flow
- [ ] Scoring for scenario accuracy

### Live Drill Events
- [ ] Event scheduling system
- [ ] Timed question reveals
- [ ] Real-time scoring with speed bonus
- [ ] Event leaderboard and results

### User Duels
- [ ] Challenge system
- [ ] Matched question sets
- [ ] Head-to-head scoring
- [ ] Duel history and stats

### Spaced Repetition
- [ ] Track per-user framework mastery
- [ ] Identify weak areas
- [ ] Suggest targeted practice
- [ ] Adaptive difficulty

### Authority Dashboards
- [ ] Historical trend visualization
- [ ] Category breakdown
- [ ] Composure tracking over time

### Advanced Analytics
- [ ] Server-wide statistics
- [ ] Question difficulty analysis
- [ ] User engagement metrics

---

## Completed

(Move items here when done)

---

## Notes

- Always test Discord interactions locally before deploying
- Keep question bank updated as issues are found
- Monitor Gemini API usage for cost management
