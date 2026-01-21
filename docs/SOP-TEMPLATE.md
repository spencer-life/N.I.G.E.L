# Project SOP: [Project Name]

**Standard Operating Procedure - Living Documentation**  
**Created:** [Date]  
**Last Updated:** [Date]  
**Status:** [In Development / Production / Maintenance]

---

## 1. Project Overview

### Purpose and Goals
**What problem does this project solve?**
- Primary objective:
- Target users/audience:
- Success criteria:

**Key Goals:**
- Goal 1:
- Goal 2:
- Goal 3:

### Tech Stack Decisions
**Core Technologies:**
- Language/Runtime:
- Framework(s):
- Database:
- Key Libraries:

**Why these choices?**
- [Technology]: Chosen because [rationale]
- [Technology]: Chosen because [rationale]

### Key Constraints
**Technical Constraints:**
- Performance requirements:
- Scalability needs:
- Platform compatibility:

**Business Constraints:**
- Budget limitations:
- Timeline:
- Team size/skills:

**Hard Requirements:**
- Must have: [Feature/capability]
- Must avoid: [Anti-pattern/technology]

---

## 2. Initial Setup

### Environment Prerequisites
**Required Software:**
```bash
# List required tools and versions
Node.js: v20.x or higher
npm: v10.x or higher
PostgreSQL: v15.x or higher
```

**System Requirements:**
- OS: [Windows/Mac/Linux]
- RAM: [Minimum]
- Disk: [Minimum]

### Installation Steps
```bash
# Clone repository
git clone [repository-url]
cd [project-name]

# Install dependencies
npm install
# or
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Initialize database
npm run db:migrate
# or
python manage.py migrate

# Start development server
npm run dev
```

### Configuration Files
**`.env` Variables:**
```bash
# API Keys
API_KEY=your_key_here
DATABASE_URL=your_database_url

# Feature Flags
ENABLE_FEATURE_X=true

# Environment
NODE_ENV=development
PORT=3000
```

**`config.json` or similar:**
```json
{
  "setting": "value",
  "another_setting": "value"
}
```

### Dependencies Installed
**Production Dependencies:**
- `package-name@version`: Purpose and why needed
- `package-name@version`: Purpose and why needed

**Development Dependencies:**
- `package-name@version`: Purpose and why needed
- `package-name@version`: Purpose and why needed

**Dependency Decisions:**
- Chose X over Y because: [rationale]
- Using version Z because: [compatibility/features]

---

## 3. Architecture Decisions

### System Architecture
```
[Include mermaid diagram or ASCII art of system architecture]
```

**Architecture Pattern:**
- Pattern used: [MVC / Microservices / Serverless / etc.]
- Rationale: [Why this pattern fits the project]

### Data Model
**Database Schema:**
```sql
-- Key tables and relationships
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add other key tables
```

**Entity Relationships:**
- Users → Projects (one-to-many)
- Projects → Tasks (one-to-many)
- [Document key relationships]

**Schema Design Rationale:**
- Normalized to [level] because: [reasoning]
- Using [data type] for [field] because: [reasoning]
- Indexing strategy: [approach and why]

### API Design
**Endpoint Structure:**
```
GET    /api/v1/resource       - List all
GET    /api/v1/resource/:id   - Get one
POST   /api/v1/resource       - Create
PUT    /api/v1/resource/:id   - Update
DELETE /api/v1/resource/:id   - Delete
```

**Authentication/Authorization:**
- Method: [JWT / OAuth / API Keys]
- Implementation: [How it's handled]
- Rationale: [Why this approach]

### Key Architectural Decisions

#### Decision 1: [Title]
**Context:** What situation led to this decision?  
**Decision:** What was decided?  
**Rationale:** Why was this the best choice?  
**Alternatives Considered:** What else was evaluated?  
**Trade-offs:** What did we gain/lose?

#### Decision 2: [Title]
**Context:**  
**Decision:**  
**Rationale:**  
**Alternatives Considered:**  
**Trade-offs:**

---

## 4. Implementation Steps

### Feature 1: [Feature Name]
**Date:** [Implementation date]  
**Status:** ✅ Complete / 🔄 In Progress / ⏸️ Paused

**Prompts Used:**
```
"Create a user authentication system with JWT tokens"
"Implement password hashing with bcrypt"
"Add refresh token rotation for security"
```

**Files Created/Modified:**
- `src/auth/jwt.ts` - JWT token generation and validation
- `src/middleware/auth.ts` - Authentication middleware
- `src/routes/auth.ts` - Auth endpoints (login, register, refresh)
- `prisma/schema.prisma` - Added User model with auth fields

**Implementation Approach:**
1. Set up JWT library and configuration
2. Created user model with hashed password field
3. Implemented registration endpoint with bcrypt
4. Created login endpoint with token generation
5. Added middleware to protect routes
6. Implemented refresh token rotation

**Challenges Solved:**
- **Challenge:** Token expiry causing poor UX
  - **Solution:** Implemented refresh token rotation with sliding window
- **Challenge:** Password reset security
  - **Solution:** Added time-limited tokens with single-use validation

**Testing:**
- Unit tests: `tests/auth.test.ts`
- Integration tests: `tests/auth-flow.test.ts`
- Manual testing: Postman collection

---

### Feature 2: [Feature Name]
**Date:**  
**Status:**

**Prompts Used:**
```
[Document the actual prompts you used]
```

**Files Created/Modified:**
- `path/to/file.ts` - Purpose and what changed

**Implementation Approach:**
1. Step 1
2. Step 2
3. Step 3

**Challenges Solved:**
- **Challenge:** [Description]
  - **Solution:** [How resolved]

**Testing:**
- [Testing approach]

---

### Feature 3: [Feature Name]
[Repeat pattern above]

---

## 5. Key Files & Their Roles

### Core Application Files
- **`src/index.ts`** - Application entry point, server initialization
- **`src/config/database.ts`** - Database connection and configuration
- **`src/routes/index.ts`** - Main router, consolidates all route modules

### Feature Modules
- **`src/features/auth/`** - Authentication and authorization
  - `auth.controller.ts` - Request handlers
  - `auth.service.ts` - Business logic
  - `auth.middleware.ts` - Auth guards
  - `auth.types.ts` - TypeScript types

- **`src/features/users/`** - User management
  - [Document structure]

### Utility/Helper Files
- **`src/utils/logger.ts`** - Structured logging utility
- **`src/utils/validation.ts`** - Input validation helpers
- **`src/utils/errors.ts`** - Custom error classes

### Configuration Files
- **`tsconfig.json`** - TypeScript compiler configuration
- **`package.json`** - Dependencies and scripts
- **`.env.example`** - Template for environment variables
- **`docker-compose.yml`** - Local development services

### Database Files
- **`prisma/schema.prisma`** - Database schema definition
- **`prisma/migrations/`** - Database migration history
- **`prisma/seed.ts`** - Database seeding script

---

## 6. Reproducibility Checklist

### Environment Setup
- [ ] Node.js/Python/[runtime] installed (correct version)
- [ ] Package manager (npm/pip/yarn) installed
- [ ] Database server running (PostgreSQL/MySQL/MongoDB)
- [ ] Redis/cache server (if applicable)
- [ ] All environment variables configured

### Development Setup
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Environment file created from `.env.example`
- [ ] Database created and migrations run
- [ ] Seed data loaded (if applicable)
- [ ] Development server starts without errors

### Database Setup
- [ ] Database created with correct name
- [ ] All migrations applied successfully
- [ ] Indexes created
- [ ] Seed data populated (if needed)
- [ ] Database user has correct permissions

### External Services
- [ ] API keys obtained and configured
- [ ] Webhook endpoints registered
- [ ] OAuth apps configured (if applicable)
- [ ] Third-party service accounts set up

### Testing Approach
**Unit Tests:**
- Framework: [Jest / Mocha / pytest]
- Location: `tests/unit/`
- Run with: `npm test`

**Integration Tests:**
- Framework: [Same or different]
- Location: `tests/integration/`
- Run with: `npm run test:integration`

**E2E Tests:**
- Framework: [Playwright / Cypress / Selenium]
- Location: `tests/e2e/`
- Run with: `npm run test:e2e`

**Test Coverage Goals:**
- Target: >80% coverage
- Critical paths: 100% coverage
- Check with: `npm run test:coverage`

### Deployment Process

#### Staging Deployment
1. Merge feature branch to `develop`
2. CI/CD pipeline runs tests
3. Auto-deploy to staging environment
4. Run smoke tests on staging
5. Manual QA verification

#### Production Deployment
1. Merge `develop` to `main`
2. CI/CD runs full test suite
3. Create release tag (semantic versioning)
4. Deploy to production with blue-green strategy
5. Run health checks
6. Monitor error rates and performance
7. Rollback plan: Revert to previous tag if issues

**Deployment Checklist:**
- [ ] All tests passing
- [ ] Environment variables configured in production
- [ ] Database migrations reviewed and tested
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented
- [ ] Team notified of deployment window

---

## 7. Lessons Learned

### What Worked Well
**Technical Wins:**
- ✅ [Approach/technology] - Resulted in [positive outcome]
- ✅ [Pattern/practice] - Made [aspect] much easier
- ✅ [Tool/library] - Saved time by [how]

**Process Wins:**
- ✅ [Practice] - Improved team velocity
- ✅ [Approach] - Reduced bugs by [amount]

**Examples:**
- Using TypeScript strict mode caught 20+ potential bugs before runtime
- Implementing comprehensive logging saved hours in debugging production issues
- Code review process caught security vulnerability before deployment

### What to Avoid Next Time
**Technical Issues:**
- ❌ [Mistake/approach] - Led to [negative outcome]
- ❌ [Technology choice] - Would use [alternative] instead because [reason]
- ❌ [Pattern] - Created [problem]

**Process Issues:**
- ❌ [Practice] - Slowed down [aspect]
- ❌ [Approach] - Created confusion around [topic]

**Examples:**
- Not setting up CI/CD early led to manual deployment errors
- Skipping database indexes initially caused performance issues later
- Insufficient error handling made production debugging difficult

### Performance Optimizations Made
**Optimization 1: [Title]**
- **Problem:** [What was slow]
- **Solution:** [What was done]
- **Result:** [Measurable improvement]
- **Code Example:**
```typescript
// Before: N+1 query problem
for (const user of users) {
  const posts = await db.posts.findMany({ where: { userId: user.id } });
}

// After: Single query with join
const users = await db.users.findMany({ include: { posts: true } });
```

**Optimization 2: [Title]**
- **Problem:**
- **Solution:**
- **Result:**

### Security Considerations
**Implemented:**
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (output sanitization)
- ✅ CSRF tokens on state-changing operations
- ✅ Rate limiting on authentication endpoints
- ✅ Secrets stored in environment variables (never in code)

**To Consider for Future:**
- [ ] Implement Content Security Policy headers
- [ ] Add audit logging for sensitive operations
- [ ] Set up automated security scanning
- [ ] Regular dependency vulnerability checks

### Future Improvements
**Technical Debt:**
- [ ] Refactor [module] - Currently complex, needs simplification
- [ ] Add tests for [feature] - Currently under-tested
- [ ] Extract [functionality] into shared library

**Feature Enhancements:**
- [ ] [Feature idea] - Would improve [aspect]
- [ ] [Integration] - Requested by users
- [ ] [Optimization] - Would reduce [cost/time]

**Scalability Considerations:**
- [ ] Implement caching layer (Redis)
- [ ] Add database read replicas
- [ ] Consider message queue for async tasks
- [ ] Implement rate limiting at API gateway level

---

## 8. Quick Reference

### Common Commands
```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm test                 # Run test suite
npm run lint             # Run linter
npm run format           # Format code

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:reset         # Reset database (dev only)

# Deployment
npm run deploy:staging   # Deploy to staging
npm run deploy:prod      # Deploy to production
```

### Important URLs
- **Production:** https://[domain]
- **Staging:** https://staging.[domain]
- **Documentation:** https://docs.[domain]
- **CI/CD Dashboard:** [URL]
- **Error Monitoring:** [Sentry/other URL]
- **Analytics:** [Dashboard URL]

### Team Contacts
- **Project Lead:** [Name] - [Contact]
- **Tech Lead:** [Name] - [Contact]
- **DevOps:** [Name] - [Contact]

### Related Documentation
- [Link to API documentation]
- [Link to architecture diagrams]
- [Link to runbook/operations guide]
- [Link to user documentation]

---

## 9. Maintenance Notes

### Regular Maintenance Tasks
**Daily:**
- Monitor error logs
- Check system health dashboards
- Review security alerts

**Weekly:**
- Review and update dependencies
- Check database performance
- Analyze usage metrics

**Monthly:**
- Security audit
- Performance review
- Cost analysis
- Backup verification

### Troubleshooting Guide
**Issue: Application won't start**
- Check: Environment variables configured?
- Check: Database accessible?
- Check: Dependencies installed?
- Check: Port already in use?

**Issue: Database connection errors**
- Check: Database service running?
- Check: Connection string correct?
- Check: Firewall rules?
- Check: Database credentials valid?

**Issue: Performance degradation**
- Check: Database query performance
- Check: API response times
- Check: Memory usage
- Check: Network latency

---

## Version History

### v1.0.0 - [Date]
- Initial release
- Features: [List core features]

### v1.1.0 - [Date]
- Added: [New feature]
- Fixed: [Bug fix]
- Improved: [Enhancement]

---

**This SOP is a living document. Update it as the project evolves.**

**Last reviewed by:** [Your name]  
**Next review scheduled:** [Date]
