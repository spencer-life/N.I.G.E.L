# Project Memory Bank: [Project Name]

**Purpose:** AI-optimized context for token efficiency and continuity  
**Last Updated:** [Date]  
**Status:** [In Development / Active / Maintenance]

---

## 1. Project Identity

### Core Information
**Project Name:** [Name]  
**Purpose:** [One sentence - what problem does this solve?]  
**Target Users:** [Who is this for?]

### Tech Stack
**Language/Runtime:** [e.g., Node.js, Python, etc.]  
**Framework:** [e.g., React, Express, Django, etc.]  
**Database:** [e.g., PostgreSQL, MongoDB, etc.]  
**Key Libraries:**
- [Library 1]: [Why chosen]
- [Library 2]: [Why chosen]

### Hard Constraints
- [Constraint 1 - e.g., Must support offline mode]
- [Constraint 2 - e.g., Must scale to 10K users]
- [Constraint 3 - e.g., Must deploy on AWS]

---

## 2. Current State

### Implemented Features ✅
- [Feature 1] - [Brief status/notes]
- [Feature 2] - [Brief status/notes]

### In Progress 🔄
- [Feature/Task] - [Who/what/when]
- [Feature/Task] - [Blockers if any]

### Planned Next 📋
1. [Next priority feature]
2. [Following feature]
3. [Future feature]

### Metrics
- **Total Requirements:** [X] ([Y]% complete)
- **Tests Passing:** [X]/[Y]
- **Code Coverage:** [Z]%
- **Last Deploy:** [Date]

---

## 3. Key Decisions Log

### Decision 1: [Title]
**When:** [Date]  
**Decision:** [What was decided]  
**Rationale:** [Why this was the best choice]  
**Alternatives Considered:** [What else was evaluated]  
**Impact:** [What this affects]

### Decision 2: [Title]
**When:** [Date]  
**Decision:**  
**Rationale:**  
**Alternatives Considered:**  
**Impact:**

### Decision 3: [Title]
[Continue pattern above]

---

## 4. Context for AI

### Naming Conventions
**Files:** [e.g., camelCase, kebab-case, PascalCase]  
**Functions:** [e.g., verbNoun like `getUserData`]  
**Classes:** [e.g., PascalCase nouns]  
**Variables:** [e.g., camelCase descriptive]  
**Constants:** [e.g., UPPER_SNAKE_CASE]

### Code Patterns
**Authentication:** [e.g., JWT tokens in auth.service.ts]  
**Error Handling:** [e.g., Try/catch with custom error classes]  
**Validation:** [e.g., Zod schemas at API boundaries]  
**Data Access:** [e.g., Repository pattern in database/ folder]

### File Organization
```
src/
├── feature-name/
│   ├── feature.controller.ts  # HTTP handlers
│   ├── feature.service.ts     # Business logic
│   ├── feature.types.ts       # TypeScript types
│   └── feature.test.ts        # Tests
└── shared/
    ├── utils/                 # Shared utilities
    └── types/                 # Shared types
```

### Important Patterns
- [Pattern 1]: [When to use, example location]
- [Pattern 2]: [When to use, example location]
- [Pattern 3]: [When to use, example location]

---

## 5. Known Issues & Blockers

### Active Bugs 🐛
- **[Bug ID/Title]**
  - Severity: [Critical/High/Medium/Low]
  - Description: [What's wrong]
  - Steps to Reproduce: [How to trigger]
  - Status: [Investigating/In Progress/Waiting]

### Technical Debt 💳
- **[Debt Item 1]**
  - Location: [Where in codebase]
  - Issue: [What needs improvement]
  - Impact: [Why it matters]
  - Plan: [How/when to address]

### Blockers 🚧
- **[Blocker 1]**
  - Blocking: [What can't proceed]
  - Reason: [Why blocked]
  - Action Needed: [How to unblock]
  - Owner: [Who's responsible]

---

## 6. Quick Reference

### Essential Commands
```bash
# Development
npm run dev              # Start dev server
npm test                 # Run test suite
npm run build            # Build for production

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed data
npm run db:reset         # Reset (dev only)

# Deployment
npm run deploy:staging   # Deploy to staging
npm run deploy:prod      # Deploy to production
```

### Environment Variables
```bash
# Required for all environments
DATABASE_URL=           # PostgreSQL connection string
API_KEY=               # External API key
SECRET_KEY=            # JWT signing key

# Optional / feature flags
ENABLE_ANALYTICS=true  # Enable analytics tracking
DEBUG_MODE=false       # Verbose logging
```

### Important Endpoints
**Local:** http://localhost:3000  
**Staging:** https://staging.example.com  
**Production:** https://example.com  
**API Docs:** https://example.com/api/docs

### Key Files
- `src/index.ts` - Application entry point
- `src/config/database.ts` - Database configuration
- `src/routes/index.ts` - Main router
- `.env.example` - Environment template
- `docs/BRTD.md` - Business requirements
- `docs/TEST-PLAN.md` - Test specifications

---

## 7. User Personas Summary

### Primary Persona
**[Persona Name]** - [One sentence description]
- Key Needs: [Top 3 needs]
- Pain Points: [Top challenges]
- Success Criteria: [What makes them successful]

### Secondary Personas
**[Persona 2]** - [One sentence]  
**[Persona 3]** - [One sentence]

**Full Details:** See `docs/USER-PERSONAS.md`

---

## 8. Requirements Status

### Critical (P0)
- [x] [Requirement 1] - ✅ Complete
- [ ] [Requirement 2] - 🔄 In progress
- [ ] [Requirement 3] - 📋 Planned

### High Priority (P1)
- [ ] [Requirement 4]
- [ ] [Requirement 5]

### Nice to Have (P2)
- [ ] [Requirement 6]

**Full Details:** See `docs/BRTD.md`

---

## 9. Recent Updates

### [Date] - [Update Title]
**Changed:** [What changed]  
**Why:** [Rationale]  
**Impact:** [What this affects]

### [Date] - [Update Title]
**Changed:**  
**Why:**  
**Impact:**

### [Date] - [Update Title]
**Changed:**  
**Why:**  
**Impact:**

---

## 10. AI Assistant Notes

### When Helping with This Project

**Always:**
- Check this Memory Bank first (cached for efficiency)
- Follow naming conventions in Section 4
- Update this file after major changes
- Reference user personas for decisions
- Check BRTD for requirements

**Remember:**
- [Important project-specific note 1]
- [Important project-specific note 2]
- [Important project-specific note 3]

**Don't:**
- [Common mistake to avoid 1]
- [Common mistake to avoid 2]
- [Common mistake to avoid 3]

---

## Usage Notes

### For AI Efficiency
- **Load this file first** in every session (enable caching)
- **Reference sections** instead of re-explaining context
- **Update immediately** after decisions or implementations
- **Keep concise** - detailed docs go in SOP.md

### Relationship with Other Docs
- **Memory Bank** (this file): AI context, current state
- **SOP.md**: Complete documentation for humans
- **BRTD.md**: Requirements and acceptance criteria
- **USER-PERSONAS.md**: Detailed user research
- **TEST-PLAN.md**: Test specifications

---

**This is a living document. Update frequently for maximum AI efficiency.**

**Token Optimization:** By caching this file (cached context costs 90% less), we reduce token costs by 40-60% across the project lifecycle.
