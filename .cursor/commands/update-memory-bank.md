# Update Memory Bank

## Overview
Sync the current project state to `docs/MEMORY-BANK.md` to maintain accurate AI context and reduce token costs.

## Why Update Memory Bank?
- **Token Efficiency**: Cached Memory Bank reduces costs by 40-60%
- **Context Accuracy**: Keeps AI informed of current state
- **Team Alignment**: Single source of truth for project
- **Session Continuity**: New AI sessions start with correct context

## What to Update

### Section 2: Current State
**Update when:**
- Feature is completed
- Major milestone reached
- Architecture changes
- Dependencies added/removed

**Include:**
- What's fully implemented ✅
- What's in progress 🚧
- What's planned but not started 📋

### Section 3: Key Decisions Log
**Update when:**
- Architectural decision made
- Technology choice finalized
- Pattern/convention established

**Format:**
```markdown
**[Date] - [Decision Title]**
- **Context**: Why this decision was needed
- **Decision**: What was chosen
- **Rationale**: Why this was the best choice
- **Alternatives**: What was considered and rejected
```

### Section 5: Known Issues
**Update when:**
- Bug discovered
- Technical debt identified
- Performance issue found
- Security concern noted

**Include:**
- Clear description
- Impact/severity
- Workaround (if any)
- Planned fix (if decided)

### Section 6: Quick Reference
**Update when:**
- Environment variables added
- Commands changed
- Deployment process updated
- New scripts added

## Keep It Concise
❌ **Don't:**
- Copy entire file contents
- Add verbose explanations
- Duplicate information from other docs
- Include temporary notes

✅ **Do:**
- Use bullet points
- Be specific and factual
- Focus on AI-relevant context
- Keep sections under 200 words each

## Update Frequency

**After every major change:**
- New feature completed
- Bug fix deployed
- Architecture refactored
- Dependencies updated

**Weekly:**
- Review for accuracy
- Remove outdated information
- Add new decisions
- Update current state

## Example Updates

### Good Update (Concise):
```markdown
## 2. Current State

### Completed ✅
- Material Web components integrated (buttons, text fields, dialogs)
- MCP server for GitHub API (tools: search_repos, create_issue)
- User authentication with Supabase

### In Progress 🚧
- Dashboard layout with real-time updates
- Notification system using MCP resources

### Planned 📋
- Mobile responsive layout
- Dark mode support
```

### Bad Update (Too Verbose):
```markdown
## 2. Current State

We have successfully completed the integration of the Material Web component library into our application. This involved installing the @material/web package from npm and then carefully importing each individual component that we needed for our user interface. The components we imported include buttons (both filled and outlined variants), text fields (specifically the outlined version), and dialog components for modal interactions...
```

## After Updating
- Commit changes to git
- Mention in PR if applicable
- Notify team of significant updates
- AI will automatically cache updated content
