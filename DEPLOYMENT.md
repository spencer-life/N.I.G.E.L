# NIGEL V1 Deployment Checklist

## Pre-Deployment Verification

### Code Quality
- [ ] All TypeScript strict mode compliance
- [ ] No `any` types in production code
- [ ] All imports use `.js` extensions
- [ ] No linter errors: `npm run build`

### Database
- [ ] Schema deployed to Supabase
- [ ] Vector search function created
- [ ] Indexes created (check with `\di` in psql)
- [ ] Config table seeded
- [ ] Test query: `SELECT count(*) FROM chunks;`

### Knowledge Base
- [ ] All `.md` files in `knowledge/` folder
- [ ] Ingestion completed successfully
- [ ] Verify embeddings: `SELECT count(*) FROM chunks WHERE embedding IS NOT NULL;`
- [ ] Test RAG: `/ask query:What is FATE?`

### Question Bank
- [ ] Questions seeded: `SELECT count(*) FROM questions WHERE is_active = true;`
- [ ] Mix of difficulties (1-5)
- [ ] Framework tags applied
- [ ] Explanations provided

### Environment Variables
- [ ] All required vars set (see `.env.example`)
- [ ] API keys valid and tested
- [ ] Channel IDs correct
- [ ] Role ID matches your admin role

### Discord Setup
- [ ] Bot invited with correct permissions
- [ ] Intents enabled (Server Members, Message Content)
- [ ] Commands deployed: `npm run deploy`
- [ ] Admin role configured
- [ ] Test channels created

## Feature Testing

### Core Features (All Users)
- [ ] `/ping` - System diagnostics
- [ ] `/help` - Command documentation
- [ ] `/drill` - Start 10-question drill
- [ ] `/stats` - View personal statistics
- [ ] `/leaderboard` - All-time rankings

### V1 Features (All Users)
- [ ] `/ask` - RAG query with sources
- [ ] `/authority log` - Private modal entry
- [ ] `/authority log --public` - Public channel post
- [ ] `/authority stats` - Personal trends
- [ ] `/authority week` - Current week view
- [ ] `/practice` - Framework-filtered session

### Admin Features (Ninja Role Only)
- [ ] `/trigger-drill` - Manual drill post
- [ ] `/add-question` - Modal question entry
- [ ] `/user-lookup` - User profile view

### Scheduled Tasks
- [ ] Daily drill posts at 9 AM Phoenix time
- [ ] Weekly leaderboard posts Monday 9 AM
- [ ] Verify cron jobs running: Check logs

### Edge Cases
- [ ] Multiple drills in same day (same-day streak logic)
- [ ] Drill abandonment handling
- [ ] No matching questions for practice filters
- [ ] RAG with no relevant doctrine
- [ ] Authority log update (same day entry)
- [ ] Non-admin attempts admin command

## NIGEL Voice Audit

Review all user-facing strings for voice compliance:

### ✅ Good Examples
- "Sharp execution. Your doctrine retention is precise."
- "No supporting doctrine found. I could speculate, but we both know how that ends."
- "Authority logged. Your future self will thank you. Or blame you."
- "Practice complete. 73% accuracy. Room for growth is a polite way to say that."

### ❌ Forbidden
- "OMG", "Let's gooo", "Bestie"
- Excessive emojis (one per response max)
- Generic AI platitudes
- Hype language

Check these files:
- [ ] `src/commands/training/ask.ts`
- [ ] `src/commands/training/authority.ts`
- [ ] `src/commands/training/practice.ts`
- [ ] `src/interactions/AuthorityHandler.ts`
- [ ] `src/interactions/DrillHandler.ts`

## Performance Checks

### Database
- [ ] Query response time < 500ms for vector search
- [ ] No missing indexes (check slow query log)
- [ ] Connection pooling configured

### Memory
- [ ] Session cleanup after completion/abandonment
- [ ] No memory leaks in long-running sessions
- [ ] Monitor Map size for `activeDrills`

### API Limits
- [ ] Gemini API quota sufficient (embeddings + synthesis)
- [ ] Discord rate limits respected
- [ ] Supabase API limits within plan

## Post-Deployment Monitoring

### Day 1
- [ ] Monitor error logs
- [ ] Verify daily drill posts
- [ ] Check user engagement
- [ ] Test all commands manually

### Week 1
- [ ] Review weekly leaderboard post
- [ ] Check authority streak logic
- [ ] Monitor RAG accuracy/confidence
- [ ] Collect user feedback

### Ongoing
- [ ] Weekly knowledge base updates
- [ ] Question bank expansion
- [ ] Performance optimization
- [ ] User badge implementation (V2)

## Rollback Plan

If critical issues occur:

1. **Stop the bot:** Kill the process or pause Railway deployment
2. **Identify issue:** Check logs, database state, API errors
3. **Database rollback:** If schema changes, restore from backup
4. **Code rollback:** Revert to last stable commit
5. **Redeploy:** `npm run build && npm start`
6. **Verify:** Test core features before announcing

## Success Criteria

NIGEL V1 is considered successfully deployed when:

- ✅ All features tested and functional
- ✅ Daily drills posting automatically
- ✅ RAG returning relevant doctrine
- ✅ Authority metrics tracking with streaks
- ✅ Practice sessions filtering correctly
- ✅ Admin commands restricted properly
- ✅ NIGEL voice consistent across features
- ✅ No critical errors in logs for 24 hours
- ✅ User feedback positive on core features

## V2 Planning

After V1 stabilizes, consider:
- Badge system implementation
- Live events functionality
- Period score snapshots
- Advanced analytics dashboard
- Redis for session storage
- Webhook integrations
