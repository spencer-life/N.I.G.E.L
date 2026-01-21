# Command Testing Guide

## Overview
This guide provides instructions for testing all custom Cursor commands to verify they work correctly.

## How to Test Commands

### Basic Testing
1. Open Cursor chat (`Cmd/Ctrl + L`)
2. Type `/` to see command autocomplete
3. Select a command from the list
4. Verify the command executes and loads context

### What to Verify
- ✅ Command appears in autocomplete menu
- ✅ Command description is clear
- ✅ Referenced files load correctly (check for `@` mentions)
- ✅ Prompt structure is helpful
- ✅ Checklists and examples are present
- ✅ AI understands the context and provides appropriate guidance

## Commands to Test

### Project Initialization Prompts

#### `/prompt-new-discord-bot`
**Test:**
```
/prompt-new-discord-bot
```

**Verify:**
- [ ] Loads MEMORY-BANK.md
- [ ] Loads README.md
- [ ] Loads schema.sql
- [ ] Provides comprehensive Discord bot setup guide
- [ ] Includes environment variables checklist
- [ ] References NIGEL architecture patterns

**Expected AI Response:**
Should provide complete setup instructions for a Discord bot following NIGEL patterns.

#### `/prompt-rag-system`
**Test:**
```
/prompt-rag-system
```

**Verify:**
- [ ] Loads RagService.ts
- [ ] Loads ingest-knowledge.ts
- [ ] Provides chunking strategy details
- [ ] Explains embedding generation
- [ ] Includes database schema patterns

#### `/prompt-railway-deploy`
**Test:**
```
/prompt-railway-deploy
```

**Verify:**
- [ ] Loads DEPLOYMENT.md
- [ ] Loads railway.json
- [ ] Provides pre-deployment checklist
- [ ] Includes environment variable setup
- [ ] Explains health check configuration

#### `/prompt-testing-strategy`
**Test:**
```
/prompt-testing-strategy
```

**Verify:**
- [ ] Loads existing test files
- [ ] Loads tsconfig.json
- [ ] Provides Jest/Vitest configuration
- [ ] Includes testing patterns
- [ ] Explains mocking strategies

### Documentation Quick-Loaders

#### `/load-memory-bank`
**Test:**
```
/load-memory-bank
```

**Verify:**
- [ ] Loads MEMORY-BANK.md
- [ ] Brief, focused description
- [ ] Explains when to use

#### `/load-claude-practices`
**Test:**
```
/load-claude-practices
```

**Verify:**
- [ ] Loads CLAUDE-BEST-PRACTICES.md
- [ ] Explains optimization techniques
- [ ] Mentions prompt caching

#### `/load-global-rules`
**Test:**
```
/load-global-rules
```

**Verify:**
- [ ] Loads GLOBAL-USER-RULES.md
- [ ] Explains planning protocol
- [ ] References documentation standards

#### `/load-deployment-guide`
**Test:**
```
/load-deployment-guide
```

**Verify:**
- [ ] Loads DEPLOYMENT.md
- [ ] Provides Railway-specific guidance
- [ ] Includes troubleshooting tips

### Knowledge Base Loaders

#### `/load-knowledge-rapport`
**Test:**
```
/load-knowledge-rapport
```

**Verify:**
- [ ] Loads knowledge/rapport.md
- [ ] Explains rapport-building concepts
- [ ] Provides use case examples

**Follow-up test:**
```
/load-knowledge-rapport then explain how to build rapport in a sales context
```

**Verify AI uses loaded knowledge to provide specific, relevant advice.**

#### `/load-knowledge-authority`
**Test:**
```
/load-knowledge-authority
```

**Verify:**
- [ ] Loads knowledge/authority.md
- [ ] Explains authority principles
- [ ] Includes ethical considerations

#### `/load-knowledge-elicitation`
**Test:**
```
/load-knowledge-elicitation
```

**Verify:**
- [ ] Loads knowledge/elicitation.md
- [ ] Explains question techniques
- [ ] Provides practical examples

#### `/load-knowledge-fate`
**Test:**
```
/load-knowledge-fate
```

**Verify:**
- [ ] Loads knowledge/fate-framework.md
- [ ] Explains FATE phases
- [ ] Provides application scenarios

### Utility Commands

#### `/test-discord-locally`
**Test:**
```
/test-discord-locally
```

**Verify:**
- [ ] Provides environment variable checklist
- [ ] Includes database connection testing
- [ ] Explains command testing workflow
- [ ] Lists common issues and solutions

#### `/ingest-knowledge-guide`
**Test:**
```
/ingest-knowledge-guide
```

**Verify:**
- [ ] Loads ingest-knowledge.ts
- [ ] Loads knowledge/README.md
- [ ] Explains file format requirements
- [ ] Provides ingestion steps
- [ ] Includes troubleshooting

#### `/check-rag-health`
**Test:**
```
/check-rag-health
```

**Verify:**
- [ ] Loads check-fate-chunks.ts
- [ ] Loads RagService.ts
- [ ] Provides SQL queries for health checks
- [ ] Explains performance benchmarks
- [ ] Includes optimization recommendations

### Material Web Commands

#### `/build-m3-page`
**Test:**
```
/build-m3-page dashboard
```

**Verify:**
- [ ] Loads MATERIAL-WEB-REFERENCE.md
- [ ] Provides M3 component patterns
- [ ] Includes theming tokens
- [ ] References proper imports

#### `/audit-m3-styles`
**Test:**
```
/audit-m3-styles @src/components/SomeComponent.tsx
```

**Verify:**
- [ ] Loads MATERIAL-WEB-REFERENCE.md
- [ ] Analyzes code for M3 compliance
- [ ] Suggests specific improvements
- [ ] Provides code examples

#### `/generate-m3-theme`
**Test:**
```
/generate-m3-theme #FF5722
```

**Verify:**
- [ ] Loads MATERIAL-WEB-REFERENCE.md
- [ ] Generates complete color palette
- [ ] Includes typography tokens
- [ ] Provides CSS output

### MCP Server Commands

#### `/new-mcp-server`
**Test:**
```
/new-mcp-server my-tools typescript
```

**Verify:**
- [ ] Loads MCP-SERVER-REFERENCE.md
- [ ] Provides complete scaffold structure
- [ ] Includes example implementations
- [ ] Explains Cursor integration

#### `/add-mcp-tool`
**Test:**
```
/add-mcp-tool search_users
```

**Verify:**
- [ ] Loads MCP-SERVER-REFERENCE.md
- [ ] Provides tool schema pattern
- [ ] Explains input validation
- [ ] Includes error handling examples

### Project Management Commands

#### `/init-project`
**Test:**
```
/init-project my-new-bot discord-bot
```

**Verify:**
- [ ] Lists project types
- [ ] Explains documentation templates
- [ ] Provides folder structure
- [ ] Includes setup checklist

#### `/update-memory-bank`
**Test:**
```
/update-memory-bank
```

**Verify:**
- [ ] Explains what to update
- [ ] Provides update checklist
- [ ] References MEMORY-BANK.md structure
- [ ] Emphasizes conciseness

## Integration Testing

### Test Command Chaining
Try using multiple commands in sequence:

```
/load-memory-bank
# Review project context

/prompt-rag-system
# Get RAG implementation guide with context

/ingest-knowledge-guide
# Get specific ingestion instructions
```

**Verify:** Each command builds on previous context appropriately.

### Test with Parameters
```
/load-knowledge-rapport then create a Discord command that teaches rapport building
```

**Verify:** AI uses loaded knowledge to create relevant Discord command code.

## Common Issues

### Command Not Appearing
**Problem:** Command doesn't show in autocomplete

**Solutions:**
- Restart Cursor
- Check file is in `.cursor/commands/` directory
- Verify filename is kebab-case with `.md` extension
- Check file has no syntax errors

### Context Not Loading
**Problem:** `@` references not loading files

**Solutions:**
- Verify file paths are correct
- Check files exist in repository
- Use relative paths from project root
- Test by manually typing `@filename` to verify it works

### AI Not Following Command
**Problem:** AI ignores command structure

**Solutions:**
- Make command prompts more explicit
- Add more detailed instructions
- Verify markdown formatting is correct
- Test with simpler command first

## Test Results Log

Use this template to log test results:

```markdown
## Test Session: [Date]

### `/command-name`
- Status: ✅ Pass / ❌ Fail
- Context loaded: Yes/No
- AI response quality: Excellent/Good/Poor
- Issues found: [List any issues]
- Notes: [Any additional observations]
```

## Success Criteria

Commands are considered fully functional when:
- ✅ All commands appear in autocomplete
- ✅ All `@` references load correctly
- ✅ AI provides relevant, helpful responses
- ✅ Checklists and examples are clear
- ✅ Commands work with parameters
- ✅ Commands can be chained effectively
- ✅ No errors in Cursor console
- ✅ Documentation is accurate

## Next Steps After Testing

1. Fix any issues found during testing
2. Update command files if needed
3. Re-test after fixes
4. Document any special usage patterns
5. Consider creating team commands for frequently used ones
6. Share with team and gather feedback

## Feedback Loop

After testing, consider:
- Which commands are most useful?
- Which commands need improvement?
- Are there missing commands that would be helpful?
- Can any commands be combined for better workflow?
- Should some commands be promoted to team commands?

Use this feedback to continuously improve the command library!
