# Test Discord Bot Locally

## Overview
Comprehensive checklist and guidance for testing your Discord bot in a local development environment before deployment.

## Pre-Test Setup Checklist

### 1. Environment Variables
Verify all required variables are set in `.env`:

```env
# Discord Configuration
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id
DISCORD_GUILD_ID=your_test_server_id  # Optional for development

# Database
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key

# AI Services
GEMINI_API_KEY=your_gemini_key
CLAUDE_API_KEY=your_claude_key  # If using Claude

# Other
NODE_ENV=development
LOG_LEVEL=debug
```

**Verification:**
```typescript
// Check in code
console.log('Environment check:', {
  discordToken: !!process.env.DISCORD_TOKEN,
  supabaseUrl: !!process.env.SUPABASE_URL,
  geminiKey: !!process.env.GEMINI_API_KEY
});
```

### 2. Database Connection
Test database connectivity before starting bot:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Test query
const { data, error } = await supabase
  .from('users')
  .select('count');

if (error) {
  console.error('Database connection failed:', error);
  process.exit(1);
}

console.log('✅ Database connected');
```

### 3. Discord Bot Permissions
Verify bot has necessary permissions in test server:
- [x] Send Messages
- [x] Send Messages in Threads
- [x] Embed Links
- [x] Add Reactions
- [x] Use Slash Commands
- [x] Read Message History

**Check in Discord:**
1. Right-click bot in server
2. View "Roles"
3. Verify permissions

### 4. Slash Commands Registered
Ensure commands are registered with Discord:

```bash
# Run deploy-commands script
npm run deploy-commands
# or
node build/deploy-commands.js
```

**Verify registration:**
- Type `/` in Discord
- Your bot's commands should appear
- Check command descriptions are correct

## Testing Workflow

### 1. Start Bot Locally

```bash
# Build TypeScript
npm run build

# Start in development mode with watch
npm run dev

# Or start built version
npm start
```

**Expected console output:**
```
✅ Database connected
✅ Bot is online!
✅ Logged in as: YourBotName#1234
✅ Ready in X guilds
✅ Slash commands loaded: X commands
```

### 2. Test Basic Commands

#### Test Simple Command
```
User: /ping
Expected: Bot responds with "Pong!" and latency
```

#### Test Command with Options
```
User: /ask question:"What is rapport?"
Expected: Bot searches knowledge base and responds
```

#### Test Error Handling
```
User: /ask question:""
Expected: Bot responds with error message (empty question)
```

### 3. Test Interactions

#### Test Buttons
```
1. Execute command that creates buttons
2. Click each button
3. Verify button responses
4. Check button states update correctly
5. Verify collectors clean up after timeout
```

#### Test Modals
```
1. Execute command that shows modal
2. Fill in modal fields
3. Submit modal
4. Verify data is processed correctly
5. Check database if data is stored
```

#### Test Select Menus
```
1. Execute command with select menu
2. Select various options
3. Verify correct handling of selections
4. Test multi-select if applicable
```

### 4. Test Database Operations

#### Test User Creation/Retrieval
```typescript
// In command handler
const user = await userRepository.findOrCreate(interaction.user.id);
console.log('User retrieved:', user);
```

#### Test Data Persistence
```
1. Execute command that saves data
2. Query database directly to verify
3. Execute command that retrieves data
4. Verify data is correct
```

#### Test RAG System (if applicable)
```
1. Run knowledge ingestion script
2. Test similarity search with queries
3. Verify relevant chunks returned
4. Check similarity scores are reasonable (>0.5)
```

### 5. Test Error Scenarios

#### Test Network Errors
```
1. Disconnect internet briefly
2. Execute command
3. Verify graceful error handling
4. Check bot reconnects automatically
```

#### Test Invalid Input
```
1. Provide invalid data types
2. Provide out-of-range values
3. Provide extremely long strings
4. Verify all cases handle gracefully
```

#### Test Rate Limits
```
1. Execute command rapidly multiple times
2. Verify rate limiting works
3. Check appropriate error messages
4. Ensure no crashes
```

## Debug Logging

### Enable Detailed Logging
```typescript
// Set in .env
LOG_LEVEL=debug

// In code
import { logger } from './utils/logger';

logger.debug('Command executed', {
  command: interaction.commandName,
  user: interaction.user.id,
  guild: interaction.guildId
});
```

### Key Events to Log
- Command executions
- Database queries
- API calls (Gemini, Claude, etc.)
- Error occurrences
- Interaction collector lifecycle

## Common Issues & Solutions

### Bot Not Responding to Commands

**Possible causes:**
- Commands not registered (run deploy-commands)
- Bot lacks permissions in server
- Incorrect DISCORD_TOKEN
- Bot not invited with correct scope

**Solution:**
```bash
# Re-register commands
npm run deploy-commands

# Check bot invite URL includes:
# &scope=bot%20applications.commands
```

### Database Connection Fails

**Possible causes:**
- Incorrect SUPABASE_URL or SUPABASE_KEY
- Network/firewall blocking connection
- Supabase project paused

**Solution:**
```typescript
// Test connection with detailed error
try {
  const { error } = await supabase.from('users').select('count');
  if (error) throw error;
} catch (err) {
  console.error('Detailed DB error:', err);
}
```

### Commands Work But No Database Updates

**Possible causes:**
- Transaction not committed
- Missing await on database calls
- Incorrect table/column names
- RLS (Row Level Security) blocking writes

**Solution:**
```typescript
// Check RLS policies in Supabase
// Temporarily disable RLS for testing
// Verify query syntax
```

### RAG Returns No Results

**Possible causes:**
- Knowledge not ingested
- Similarity threshold too high
- Incorrect framework_tags filter
- Embedding generation failed

**Solution:**
```bash
# Re-ingest knowledge
npm run ingest-knowledge

# Test with lower threshold
const results = await ragService.searchKnowledge(query, {
  threshold: 0.3  // Lower = more lenient
});
```

## Performance Testing

### Check Response Times
```typescript
const start = Date.now();
await executeCommand(interaction);
const duration = Date.now() - start;
console.log(`Command took ${duration}ms`);

// Target: <1000ms for most commands
// Warning: >2000ms (optimize)
// Critical: >3000ms (Discord timeout)
```

### Monitor Memory Usage
```typescript
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory:', {
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`
  });
}, 60000); // Every minute
```

## Testing Checklist

Before considering local testing complete:

### Functionality
- [ ] All commands execute successfully
- [ ] All interactions respond correctly
- [ ] Database operations work
- [ ] RAG system returns relevant results
- [ ] Error handling catches all cases

### Performance
- [ ] Commands respond within 3 seconds
- [ ] No memory leaks over time
- [ ] Database queries optimized
- [ ] API calls cached where appropriate

### User Experience
- [ ] Ephemeral responses for private data
- [ ] Clear error messages
- [ ] Helpful command descriptions
- [ ] Consistent formatting and style

### Code Quality
- [ ] No TypeScript errors
- [ ] No linter warnings
- [ ] Proper error handling
- [ ] Code follows project patterns

### Documentation
- [ ] All commands documented
- [ ] Environment variables listed
- [ ] Setup instructions clear
- [ ] Known issues noted

## Next Steps

After successful local testing:
1. Review any issues found and fix
2. Run automated tests if available
3. Prepare for deployment to Railway
4. Use `/prompt-railway-deploy` for deployment checklist
5. Document any changes in MEMORY-BANK.md

## Tips

- **Use a test Discord server** - Don't test in production servers
- **Enable debug logging** - Makes troubleshooting much easier
- **Test edge cases** - Empty inputs, null values, extreme lengths
- **Monitor console** - Watch for errors and warnings
- **Test thoroughly** - Better to catch issues now than in production
- **Keep notes** - Document any quirks or issues for future reference
