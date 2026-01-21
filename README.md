# NIGEL - SPARK Interactive Training & Instruction Bot

## What Is This?

NIGEL is a Discord bot for the S.P.A.R.K. server that provides:

1. **Interactive Training Apps** - Drills, quizzes, scenario diagnostics, practice labs
2. **Natural Language Instructor** - RAG-backed Q&A that only answers from official SPARK/Chase Hughes doctrine
3. **Authority Metrics Tracking** - Daily self-assessment logging with trends and accountability
4. **Gamification System** - Points, streaks, leaderboards, belts, and badges

## The Outcome We Are Building

A Discord-native cognitive training system where users can:

- Answer a daily drill question each morning (auto-posted)
- Run self-directed practice sessions filtered by framework, difficulty, and length
- Ask NIGEL questions and receive doctrine-grounded answers (no hallucinations)
- Log daily Authority Metrics via Discord modals (replacing the external Netlify app)
- Track progress through leaderboards, streaks, and belt promotions
- Participate in live timed drill events

## Hard Constraints

| Constraint | Value |
|------------|-------|
| Language | Node.js + TypeScript |
| Framework | discord.js |
| Database | Supabase PostgreSQL |
| Embeddings | pgvector |
| AI (responses) | Gemini Flash / Gemini Pro |
| Hosting | Railway |
| Timezone | Store UTC, compute America/Phoenix |

## Knowledge Rule (Critical)

**NIGEL must never invent SPARK doctrine.**

- All answers must come from retrieved document chunks
- If no supporting content exists, NIGEL says so and asks permission to answer generally
- Every chunk has: document name, section, framework tags, embedding

## NIGEL Voice

- Calm, surgical, slightly mischievous
- Short sentences, concrete language
- One subtle joke maximum per response
- Never: "OMG", "Let's gooo", "Bestie", excessive emojis, hype

## Core Apps

| App | Channel | Trigger |
|-----|---------|---------|
| Daily Drill | #spark-daily-drill | Auto 9am Phoenix |
| Practice Lab | #spark-practice-lab | /practice |
| Ask NIGEL | #ask-nigel | /ask, messages, mentions |
| Authority Metrics | #authority-metrics | /authority |
| Leaderboards | #spark-leaderboards | Auto-updated |
| Scenario Room | #spark-scenario-room | /scenario (V1) |
| Live Drills | #spark-live-drills | Admin scheduled (V2) |

## Success Criteria

1. Daily drill posts automatically at 9am Phoenix every day
2. Users can complete practice sessions with immediate feedback
3. /ask returns accurate, sourced answers or explicitly declines
4. Authority Metrics can be logged entirely within Discord
5. Leaderboards update weekly with role awards
6. Zero external web apps required for core functionality
