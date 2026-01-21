# Discord Command Cleanup Guide

## Problem

You're seeing duplicate commands in Discord because commands are registered in **two places**:
1. **Global commands** - Available in all servers (takes up to 1 hour to update)
2. **Guild commands** - Available only in your specific server (updates instantly)

Discord shows both, creating duplicates.

---

## Solution: Clear and Re-register

### Step 1: Clear All Commands

Run this command to remove ALL commands (both global and guild):

```bash
npm run clear-commands:all
```

**What this does:**
- Removes all global commands
- Removes all guild-specific commands
- Leaves you with a clean slate

**Alternative options:**
```bash
npm run clear-commands         # Clear only guild commands
npm run clear-commands:global  # Clear only global commands
```

### Step 2: Re-register Commands (Guild Only)

After clearing, re-register commands to your guild:

```bash
npm run deploy
```

**This will:**
- Register all 11 commands to your guild
- Updates appear **instantly** (no waiting)
- No duplicates

---

## Command List

After cleanup, you should see these commands in Discord:

### Training Commands
- `/drill` - Start a training drill
- `/practice` - Practice with filters
- `/ask` - Ask about doctrine
- `/stats` - View your statistics
- `/leaderboard` - View drill leaderboard
- `/authority log` - Log authority metrics
- `/authority stats` - View authority statistics
- `/authority week` - View this week's entries
- `/authority leaderboard` - View authority rankings

### Utility Commands
- `/ping` - Check bot status
- `/help` - View command help

### Admin Commands (Ninja role only)
- `/trigger-drill` - Manually post drill
- `/add-question` - Add question (deprecated - uses dynamic generation now)
- `/user-lookup` - View user profile

**Total: 14 commands** (11 regular + 3 admin)

---

## Why This Happened

You likely ran both:
```bash
npm run deploy         # Registered to guild
npm run deploy:global  # Registered globally
```

This created two sets of identical commands.

---

## Best Practice

**For development/testing:**
- Use `npm run deploy` (guild commands)
- Updates are instant
- Easy to iterate

**For production (multiple servers):**
- Use `npm run deploy:global` (global commands)
- Takes up to 1 hour to propagate
- Available in all servers where bot is installed

**For NIGEL (single server):**
- Stick with `npm run deploy` (guild commands)
- No need for global registration

---

## Verification

After running the cleanup and re-deploy:

1. Open Discord
2. Type `/` in any channel
3. You should see each command **only once**
4. All commands should have the NIGEL bot icon

If you still see duplicates:
- Wait 5 minutes (Discord cache)
- Restart Discord app
- Check if bot is in multiple servers

---

## Quick Reference

```bash
# Clean slate (recommended)
npm run clear-commands:all
npm run deploy

# Or step by step
npm run clear-commands:global  # Remove global
npm run clear-commands         # Remove guild
npm run deploy                 # Re-register to guild
```

---

## Troubleshooting

**"Commands still duplicated after clearing"**
- Wait 5-10 minutes for Discord cache to clear
- Restart Discord completely
- Check if bot is in multiple servers (each server gets its own guild commands)

**"Commands disappeared completely"**
- Run `npm run deploy` to re-register them
- Check that GUILD_ID is set correctly in `.env`
- Verify bot has permission to create commands in your server

**"Some commands missing"**
- Check that all command files exist in `src/commands/`
- Look for errors in the deploy output
- Verify TypeScript compiled successfully

---

**Status:** Ready to clean up! Run the commands above to fix duplicates.
