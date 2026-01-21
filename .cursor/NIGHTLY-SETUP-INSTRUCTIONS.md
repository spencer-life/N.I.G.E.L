# Cursor Nightly Channel Setup

## Required for Subagents Feature

Subagents are only available in the **Nightly** release channel.

## Setup Steps

1. Open Cursor Settings: `Cmd+Shift+J` (Mac) or `Ctrl+Shift+J` (Windows)
2. Navigate to **Beta** section
3. Set **Update Channel** to **Nightly**
4. Click **Check for Updates**
5. **Restart Cursor** after the update completes

## Verification

After restarting, subagents will be available. You can verify by:
- Creating subagent files in `.cursor/agents/`
- Agent will automatically detect and use them for delegation

## Note

Once you've switched to Nightly and restarted, delete this file and mark the first todo as complete.
