# ðŸš€ NIGEL Deployment - Quick Reference

## âœ… COMPLETED: GitHub Push
- **Repository:** https://github.com/spencer-life/N.I.G.E.L
- **Status:** All code pushed successfully
- **Branch:** main

## ðŸŽ¯ NEXT: Railway Deployment

### Fastest Method (5 minutes):

1. **Go to:** https://railway.app/
2. **Sign in** with GitHub
3. **New Project** â†’ **Deploy from GitHub repo**
4. **Select:** spencer-life/N.I.G.E.L
5. **Add Environment Variables** (see below)
6. **Wait for deployment** (~3 minutes)
7. **Verify bot is online** in Discord

### Environment Variables to Add:

Copy these from your local .env file:

`
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=
SUPABASE_URL=
SUPABASE_ANON_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
DAILY_DRILL_CHANNEL_ID=
LEADERBOARD_CHANNEL_ID=
AUTHORITY_CHANNEL_ID=
ADMIN_ROLE_ID=1308506554290405449
`

### After Deployment:

`powershell
# Deploy Discord commands
npm run deploy
`

## ðŸ“š Documentation Created:
- âœ… RAILWAY-DEPLOYMENT.md (detailed guide)
- âœ… .env.example (template)
- âœ… railway.json (auto-detected by Railway)

## ðŸŽ‰ You're Ready!

**Start here:** https://railway.app/new

Questions? Check RAILWAY-DEPLOYMENT.md for full instructions.
