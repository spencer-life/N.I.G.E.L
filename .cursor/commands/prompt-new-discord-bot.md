# New Discord Bot Project

## Auto-Loaded Context
@MEMORY-BANK.md
@README.md
@src/database/schema.sql
@src/commands/training/ask.ts
@src/services/RagService.ts
@src/index.ts

## Overview
I need to create a new Discord bot following the NIGEL architecture patterns. Please help me set up a complete Discord bot project with the following specifications.

## Architecture Requirements

### Core Technologies
- **Discord.js** (v14+) for bot framework
- **TypeScript** with strict mode enabled
- **Supabase** for PostgreSQL database with pgvector extension
- **Gemini API** for embeddings and AI responses
- **Railway** for deployment

### Project Structure
```
project-name/
├── src/
│   ├── commands/          # Slash command definitions
│   ├── interactions/      # Button/modal/select handlers
│   ├── services/          # Business logic (RAG, scoring, etc.)
│   ├── database/          # Schema, queries, repositories
│   ├── utils/             # Helpers (embeds, time, validators)
│   └── types/             # TypeScript type definitions
├── knowledge/             # RAG knowledge base (markdown)
├── docs/                  # Documentation templates
└── scripts/               # Utility scripts (ingestion, etc.)
```

## Implementation Checklist

### 1. Project Setup
- [ ] Initialize npm project with TypeScript
- [ ] Install dependencies: discord.js, @supabase/supabase-js, @google/generative-ai
- [ ] Configure tsconfig.json with strict mode
- [ ] Set up .env file with required tokens
- [ ] Create .gitignore

### 2. Discord Bot Setup
- [ ] Create main bot instance in `src/index.ts`
- [ ] Implement slash command handler pattern
- [ ] Set up interaction collector for buttons/modals
- [ ] Add error handling and logging
- [ ] Implement graceful shutdown

**Command Pattern (from NIGEL):**
- Use SlashCommandBuilder for command definitions
- Export data and execute functions
- Handle errors with try/catch
- Reply within 3 seconds (or defer)
- Use ephemeral responses for user-specific feedback

### 3. Database Setup
- [ ] Define schema in `src/database/schema.sql`
- [ ] Create user tracking table
- [ ] Set up knowledge_chunks table with vector column
- [ ] Implement repository pattern for database queries
- [ ] Add migration scripts

**Schema Patterns:**
- All timestamps as TIMESTAMPTZ (UTC)
- Use foreign key constraints
- Parameterized queries only (no string concatenation)
- pgvector for embeddings (dimension: 768 for Gemini)

### 4. RAG System (if needed)
- [ ] Create RagService in `src/services/`
- [ ] Implement chunking strategy (400-600 tokens target)
- [ ] Set up embedding generation with Gemini
- [ ] Implement similarity search
- [ ] Add framework_tags for filtering
- [ ] Configure similarity threshold (0.5 default)

### 5. Environment Variables
```env
# Discord
DISCORD_TOKEN=your_token_here
DISCORD_CLIENT_ID=your_client_id

# Supabase
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key

# Gemini
GEMINI_API_KEY=your_api_key

# Other
NODE_ENV=development
```

### 6. Documentation
- [ ] Create MEMORY-BANK.md with project context
- [ ] Create README.md with setup instructions
- [ ] Document all commands and their usage
- [ ] Add DEPLOYMENT.md for Railway setup

### 7. Deployment (Railway)
- [ ] Create railway.json configuration
- [ ] Set environment variables in Railway dashboard
- [ ] Configure health check endpoint
- [ ] Set up automatic deployments from git

## Code Patterns to Follow

### Slash Command Example
```typescript
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('commandname')
  .setDescription('Command description');

export async function execute(interaction: CommandInteraction) {
  try {
    // Command logic here
    await interaction.reply({
      content: 'Response',
      ephemeral: true
    });
  } catch (error) {
    console.error('Error:', error);
    await interaction.reply({
      content: 'An error occurred',
      ephemeral: true
    });
  }
}
```

### Interaction Handler Example
```typescript
export async function handleButtonInteraction(
  interaction: ButtonInteraction
): Promise<void> {
  const customId = interaction.customId;
  
  if (customId.startsWith('prefix_')) {
    // Handle button
    await interaction.update({
      content: 'Updated!',
      components: []
    });
  }
}
```

### RAG Query Pattern
```typescript
const relevant = await ragService.searchKnowledge(query, {
  threshold: 0.5,
  limit: 5,
  tags: ['framework-name']
});
```

## Bot Personality & Voice

### Communication Style
- Short, direct sentences
- Concrete language
- Calm, professional tone
- One subtle element of personality maximum
- No excessive emojis or hype language

### Response Format
- Clear, structured information
- Use embeds for rich content
- Ephemeral for user-specific data
- Public for community-relevant content

## Testing Checklist
- [ ] Test slash commands locally
- [ ] Verify database connections
- [ ] Test RAG queries (if applicable)
- [ ] Check error handling
- [ ] Verify environment variables
- [ ] Test interaction collectors
- [ ] Check memory usage

## Deployment Checklist
- [ ] All tests passing
- [ ] Environment variables set in Railway
- [ ] Database migrations applied
- [ ] Health check endpoint working
- [ ] Logs reviewed for errors
- [ ] Bot responds to commands

## Next Steps
After implementation:
1. Register slash commands with Discord
2. Ingest knowledge base (if RAG system)
3. Test all commands in Discord
4. Deploy to Railway
5. Monitor logs and performance
6. Update MEMORY-BANK.md with current state

## Additional Considerations

**What makes this bot unique?**
- Define the bot's primary purpose
- Identify target users
- Specify unique features
- Determine success metrics

**What data will be stored?**
- User information needed
- Interaction history
- Custom data structures

**What AI features are needed?**
- Simple responses vs RAG system
- Embeddings and similarity search
- Claude/Gemini integration

Please help me implement this bot with the specifications above, adapted to my specific use case.
