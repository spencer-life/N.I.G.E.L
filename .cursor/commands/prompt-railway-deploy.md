# Railway Deployment Setup

## Auto-Loaded Context
@DEPLOYMENT.md
@railway.json
@package.json
@src/index.ts

## Overview
I need to deploy my Discord bot to Railway. Please help me set up the deployment configuration, environment variables, and deployment process.

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing locally
- [ ] No TypeScript/linter errors
- [ ] Build completes successfully (`npm run build`)
- [ ] Dependencies up to date and secure
- [ ] No hardcoded secrets or tokens
- [ ] Error handling in place

### Environment Configuration
- [ ] All required environment variables documented
- [ ] `.env.example` file created
- [ ] Sensitive data in environment variables only
- [ ] Database connection string ready
- [ ] API keys obtained and tested

### Database
- [ ] Schema finalized in `schema.sql`
- [ ] Migration scripts ready
- [ ] Seed data prepared (if needed)
- [ ] Database backup strategy planned
- [ ] Connection pooling configured

## Railway Configuration

### 1. railway.json Setup
Create `railway.json` in project root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "node build/index.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. Environment Variables

**Required Variables:**
```env
# Discord Bot
DISCORD_TOKEN=            # Bot token from Discord Developer Portal
DISCORD_CLIENT_ID=        # Application ID from Discord Developer Portal

# Supabase Database
SUPABASE_URL=            # Project URL from Supabase dashboard
SUPABASE_KEY=            # Anon/public key from Supabase dashboard

# AI Services
GEMINI_API_KEY=          # Google AI Studio API key
CLAUDE_API_KEY=          # Anthropic API key (if using Claude)

# Application Config
NODE_ENV=production
PORT=3000                # For health check endpoint
LOG_LEVEL=info          # error, warn, info, debug
```

**Setting in Railway:**
1. Go to project settings
2. Navigate to Variables tab
3. Add each variable with production values
4. Use Railway's secret management for sensitive values
5. Deploy after all variables are set

### 3. Health Check Endpoint

**Add to your bot (src/index.ts):**
```typescript
import express from 'express';

// Health check server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    bot: client.isReady() ? 'connected' : 'disconnected'
  });
});

app.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});
```

### 4. Package.json Scripts

**Ensure these scripts exist:**
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node build/index.js",
    "dev": "tsx watch src/index.ts",
    "deploy": "railway up",
    "logs": "railway logs"
  }
}
```

## Deployment Process

### Initial Deployment

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login to Railway:**
```bash
railway login
```

3. **Link Project:**
```bash
railway link
```

4. **Set Environment Variables:**
```bash
railway variables set DISCORD_TOKEN="your_token"
railway variables set SUPABASE_URL="your_url"
# ... set all variables
```

5. **Deploy:**
```bash
railway up
```

### Subsequent Deployments

**Option 1: Automatic (Recommended)**
- Connect GitHub repository in Railway dashboard
- Enable automatic deployments on push to main
- Every push to main triggers deployment

**Option 2: Manual via CLI**
```bash
railway up
```

**Option 3: Manual via Dashboard**
- Go to Railway dashboard
- Click "Deploy" button
- Select branch/commit to deploy

## Post-Deployment Verification

### 1. Check Deployment Status
```bash
railway status
```

### 2. View Logs
```bash
railway logs
```

**Look for:**
- ✅ "Bot is online!" or similar success message
- ✅ Database connection successful
- ✅ Health check endpoint running
- ❌ Any error messages or warnings

### 3. Test Bot Connection

**In Discord:**
- Bot should appear online
- Try a simple command
- Check command responses
- Verify database interactions

### 4. Health Check
```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 123.45,
  "timestamp": "2024-01-20T12:00:00.000Z",
  "bot": "connected"
}
```

### 5. Database Verification

**Check if tables exist:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

**Verify data can be written:**
- Execute a command that writes to database
- Query database to confirm data is there

## Monitoring & Maintenance

### View Logs
```bash
# Real-time logs
railway logs

# Last 100 lines
railway logs --lines 100

# Filter by keyword
railway logs | grep ERROR
```

### Common Log Patterns to Monitor

**Successful startup:**
```
✅ Database connected
✅ Bot is online!
✅ Health check server running on port 3000
```

**Common errors:**
```
❌ DiscordAPIError: Invalid token
❌ Connection refused (database)
❌ ECONNRESET (network issues)
❌ Out of memory
```

### Performance Monitoring

**Check resource usage:**
- Railway dashboard → Metrics tab
- Monitor CPU usage
- Monitor memory usage
- Check request latency
- Review error rates

**Set up alerts:**
- Configure Railway notifications
- Monitor uptime
- Track deployment failures

## Troubleshooting

### Bot Not Connecting
1. Verify `DISCORD_TOKEN` is set correctly
2. Check bot has required intents
3. Review logs for connection errors
4. Verify bot is invited to server with correct permissions

### Database Connection Failed
1. Verify `SUPABASE_URL` and `SUPABASE_KEY`
2. Check Supabase project is active
3. Verify connection string format
4. Check Railway → Supabase network connectivity

### Environment Variables Not Loading
1. Verify variables set in Railway dashboard
2. Check variable names match code exactly
3. Restart deployment after setting variables
4. Use `process.env.VAR_NAME` correctly in code

### Health Check Failing
1. Verify health check endpoint is running
2. Check `PORT` environment variable
3. Ensure express server starts before bot
4. Review health check timeout settings

### Out of Memory
1. Check for memory leaks in code
2. Review interaction collectors cleanup
3. Optimize database query patterns
4. Upgrade Railway plan if needed

## Rollback Strategy

### If Deployment Fails

1. **View previous deployments:**
   - Railway dashboard → Deployments tab
   - View logs of failed deployment

2. **Rollback to previous version:**
   - Click "Rollback" on last working deployment
   - Or redeploy previous commit via CLI

3. **Fix issues locally:**
   - Reproduce error locally
   - Fix and test thoroughly
   - Commit fix and redeploy

### Emergency Rollback
```bash
# View deployment history
railway logs --deployment previous

# Redeploy specific commit
git log --oneline  # Find last good commit
railway up --commit <commit-hash>
```

## Scaling Considerations

### Vertical Scaling (More Resources)
- Upgrade Railway plan for more CPU/RAM
- Optimize code first before scaling
- Monitor resource usage patterns

### Horizontal Scaling (Multiple Instances)
- Discord bots typically run as single instance
- Use Redis for shared state if needed
- Consider sharding for very large bots

## Database Migrations

### Running Migrations on Deploy

**Option 1: Manual via Supabase Dashboard**
- Copy SQL from `schema.sql`
- Run in Supabase SQL editor
- Verify schema changes

**Option 2: Migration Script**
Add to package.json:
```json
{
  "scripts": {
    "migrate": "node scripts/migrate.js"
  }
}
```

Run after deploy:
```bash
railway run npm run migrate
```

## Security Best Practices

- [ ] Never commit `.env` file
- [ ] Use Railway's secret variables for sensitive data
- [ ] Enable 2FA on Railway account
- [ ] Regularly rotate API keys
- [ ] Monitor access logs
- [ ] Keep dependencies updated
- [ ] Use principle of least privilege for database access

## Cost Management

**Railway Pricing:**
- Free tier: $5 credit/month
- Pro tier: $20/month + usage

**Optimize costs:**
- Use hobby plan for development/testing
- Monitor resource usage
- Optimize database queries
- Clean up unused resources

## Next Steps After Deployment

1. **Document the deployment:**
   - Update DEPLOYMENT.md with any changes
   - Note any issues encountered
   - Document custom configuration

2. **Set up monitoring:**
   - Configure alerts in Railway
   - Set up error tracking (Sentry optional)
   - Monitor bot uptime

3. **Plan for updates:**
   - Establish deployment schedule
   - Test updates in development first
   - Have rollback plan ready

4. **Update MEMORY-BANK.md:**
   - Document deployment configuration
   - Note environment variables
   - Record any deployment-specific patterns

Please help me deploy to Railway following these guidelines.
