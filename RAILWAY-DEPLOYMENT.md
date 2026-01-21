# NIGEL Railway Deployment Guide

## âœ… Step 1: GitHub Push Complete
Your code is now at: https://github.com/spencer-life/N.I.G.E.L

## ðŸš‚ Step 2: Deploy to Railway

### Option A: Deploy via Railway Dashboard (Recommended - Easiest)

1. **Go to Railway:** https://railway.app/
2. **Sign in** (use GitHub account for easy connection)
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose:** spencer-life/N.I.G.E.L
6. **Railway will automatically:**
   - Detect it's a Node.js project
   - Use the railway.json configuration
   - Run 
pm install and 
pm run build
   - Start with 
pm start

### Option B: Deploy via Railway CLI

1. **Install Railway CLI:**
   `powershell
   # Using npm (recommended)
   npm install -g @railway/cli
   
   # Or using Scoop
   scoop install railway
   `

2. **Login to Railway:**
   `powershell
   railway login
   `

3. **Initialize and Deploy:**
   `powershell
   cd "c:\Users\MLPC\.cursor\N.I.G.E.L"
   railway init
   railway up
   `

## ðŸ” Step 3: Configure Environment Variables

After creating the project, add these environment variables in Railway Dashboard:

### Required Variables:
`
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
GUILD_ID=your_discord_guild_id
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
DAILY_DRILL_CHANNEL_ID=your_channel_id
LEADERBOARD_CHANNEL_ID=your_channel_id
AUTHORITY_CHANNEL_ID=your_channel_id
ADMIN_ROLE_ID=1308506554290405449
`

### How to Add Variables in Railway:
1. Go to your project in Railway
2. Click on your service
3. Go to "Variables" tab
4. Click "New Variable"
5. Add each variable one by one
6. Railway will automatically redeploy after you add variables

## ðŸŽ¯ Step 4: Deploy Commands to Discord

After Railway deployment is live:

`powershell
# Set environment variables locally (for command deployment)
# Copy your .env file or set them manually

# Deploy commands to your Discord server
npm run deploy
`

## ðŸ” Step 5: Verify Deployment

1. **Check Railway Logs:**
   - Go to Railway Dashboard â†’ Your Project â†’ Deployments
   - Click on latest deployment
   - View logs to ensure bot started successfully
   - Look for: "âœ… Discord client ready"

2. **Test in Discord:**
   - Go to your Discord server
   - Type /ping to verify bot is responsive
   - Try /help to see all commands

## ðŸ“Š Step 6: Monitor

Railway Dashboard shows:
- **Deployment status**
- **Real-time logs**
- **Resource usage** (CPU, Memory, Network)
- **Build time** (should be ~2-3 minutes)

## ðŸ› ï¸ Troubleshooting

### Build Fails
- Check Railway logs for TypeScript errors
- Ensure all dependencies are in package.json
- Verify tsconfig.json is correct

### Bot Not Responding
- Verify environment variables are set correctly
- Check Discord token is valid
- Ensure bot has proper permissions in Discord server
- Check Railway logs for connection errors

### Database Issues
- Verify Supabase URL and key are correct
- Check that database schema is deployed
- Run knowledge ingestion if RAG isn't working

## ðŸŽ‰ Success Criteria

NIGEL is successfully deployed when:
- âœ… Railway shows "Active" status
- âœ… Bot appears online in Discord
- âœ… /ping command responds
- âœ… /drill command works
- âœ… /ask command returns doctrine
- âœ… Daily drills post at 9 AM Phoenix time

## ðŸ’° Railway Pricing

- **Starter Plan:** /month (500 hours)
- **Pro Plan:** /month (unlimited)
- NIGEL runs 24/7 = 720 hours/month
- **Recommended:** Pro Plan for continuous operation

## ðŸ”— Useful Links

- **Railway Dashboard:** https://railway.app/dashboard
- **Railway Docs:** https://docs.railway.com/
- **GitHub Repo:** https://github.com/spencer-life/N.I.G.E.L
- **Discord Developer Portal:** https://discord.com/developers/applications

---

**Next Step:** Go to https://railway.app/ and click "New Project" â†’ "Deploy from GitHub repo"
