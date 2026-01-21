# Test Plan: [Project Name]

**Created:** [Date]  
**Last Updated:** [Date]  
**Status:** [Draft / Active / Maintenance]  
**Coverage Target:** [X]% (Currently: [Y]%)

---

## Document Purpose

This Test Plan defines the testing strategy, test specifications, and quality assurance approach for the project. All tests are written **before implementation** to enable test-driven development (TDD).

**Associated Documents:**
- **BRTD:** `docs/BRTD.md` - Requirements being tested
- **User Personas:** `docs/USER-PERSONAS.md` - User scenarios
- **Memory Bank:** `docs/MEMORY-BANK.md` - Current test status

---

## Testing Strategy

### Testing Philosophy
**Approach:** Test-Driven Development (TDD)
1. Write tests first (based on BRTD acceptance criteria)
2. Tests initially fail (no implementation)
3. Implement features to make tests pass
4. Refactor while keeping tests green
5. Check off requirements as tests pass

### Test Pyramid

```
         /\
        /  \  E2E Tests (10%)
       /────\  Integration Tests (30%)
      /──────\ Unit Tests (60%)
```

**Distribution:**
- **60% Unit Tests:** Individual functions/components
- **30% Integration Tests:** Component interactions
- **10% E2E Tests:** Full user workflows

### Coverage Goals
- **Overall Code Coverage:** ≥80%
- **Critical Paths:** 100%
- **New Code:** ≥90%
- **Bug Fixes:** Regression test required

---

## Test Environments

### Local Development
**Purpose:** Developer testing during implementation  
**URL:** http://localhost:3000  
**Database:** Local PostgreSQL  
**Run Command:** `npm test`

### CI/CD (Continuous Integration)
**Purpose:** Automated testing on every commit  
**Trigger:** Git push to any branch  
**Required:** All tests must pass before merge

### Staging
**Purpose:** Pre-production validation  
**URL:** https://staging.example.com  
**Database:** Staging database (production-like data)  
**Run Command:** `npm run test:staging`

### Production
**Purpose:** Smoke tests post-deployment  
**URL:** https://example.com  
**Monitoring:** Continuous health checks

---

## Unit Tests

### Purpose
Test individual functions, methods, and components in isolation.

### Framework
**Language:** [TypeScript / JavaScript / Python]  
**Framework:** [Jest / Mocha / pytest]  
**Mocking:** [Jest mocks / Sinon / unittest.mock]

### Naming Convention
```
describe('[ComponentName/FunctionName]', () => {
  it('should [expected behavior] when [condition]', () => {
    // Test implementation
  });
});
```

### Structure
```typescript
// AAA Pattern: Arrange, Act, Assert
describe('UserService', () => {
  it('should create user with hashed password', () => {
    // Arrange
    const userData = { email: 'test@example.com', password: 'password123' };
    
    // Act
    const result = userService.createUser(userData);
    
    // Assert
    expect(result.password).not.toBe('password123');
    expect(result.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash
  });
});
```

---

## Unit Test Specifications

### REQ-001: [Requirement Title]
**File:** `tests/unit/[feature-name].test.ts`  
**Status:** ⬜ Not Started | 🔄 Written (Failing) | ✅ Passing

#### Test Cases

**TEST-001-01: [Test Description]**
```typescript
it('should [expected behavior]', () => {
  // Arrange
  const input = [setup];
  
  // Act
  const result = functionUnderTest(input);
  
  // Assert
  expect(result).toEqual([expected]);
});
```
**Acceptance Criteria:** Maps to BRTD REQ-001 criterion 1  
**Status:** ⬜ Not Started

**TEST-001-02: [Test Description]**
```typescript
it('should [handle edge case]', () => {
  // Test implementation
});
```
**Acceptance Criteria:** Maps to BRTD REQ-001 criterion 2  
**Status:** ⬜ Not Started

**TEST-001-03: [Test Description - Error Handling]**
```typescript
it('should throw error when [invalid input]', () => {
  // Arrange
  const invalidInput = null;
  
  // Act & Assert
  expect(() => functionUnderTest(invalidInput)).toThrow('Expected error message');
});
```
**Acceptance Criteria:** Maps to BRTD REQ-001 criterion 3  
**Status:** ⬜ Not Started

---

### REQ-002: [Requirement Title]
**File:** `tests/unit/[feature-name].test.ts`  
**Status:** ⬜ Not Started

[Follow same structure as REQ-001]

---

## Integration Tests

### Purpose
Test interactions between components, services, and external systems.

### Framework
**Framework:** [Jest / Supertest / pytest + requests]  
**Database:** Test database (reset between tests)  
**External Services:** Mocked or test endpoints

### Structure
```typescript
describe('Auth Flow Integration', () => {
  beforeEach(async () => {
    await clearTestDatabase();
  });
  
  it('should register user and return JWT token', async () => {
    // Test full registration flow
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });
    
    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
  });
});
```

---

## Integration Test Specifications

### INT-001: User Authentication Flow
**File:** `tests/integration/auth-flow.test.ts`  
**Status:** ⬜ Not Started | 🔄 Written (Failing) | ✅ Passing  
**Requirements:** REQ-001, REQ-002

#### Scenario 1: Complete Registration Flow
**Given:** New user wants to register  
**When:** User submits valid registration data  
**Then:** User created, email sent, JWT token returned

**Test Steps:**
1. POST /api/auth/register with valid data
2. Verify user exists in database
3. Verify password is hashed
4. Verify JWT token in response
5. Verify welcome email queued

**Status:** ⬜ Not Started

#### Scenario 2: Login with Valid Credentials
**Given:** User already registered  
**When:** User submits correct email and password  
**Then:** JWT token returned with user data

**Status:** ⬜ Not Started

#### Scenario 3: Login with Invalid Credentials
**Given:** User exists  
**When:** User submits incorrect password  
**Then:** 401 error returned, no token

**Status:** ⬜ Not Started

---

### INT-002: Task Management Flow
**File:** `tests/integration/task-flow.test.ts`  
**Status:** ⬜ Not Started  
**Requirements:** REQ-003, REQ-004

[Follow same structure]

---

## End-to-End (E2E) Tests

### Purpose
Test complete user workflows from UI to database.

### Framework
**Framework:** [Playwright / Cypress / Selenium]  
**Browser:** [Chrome, Firefox, Safari]  
**Environment:** Staging

### Structure
```typescript
test('complete task creation workflow', async ({ page }) => {
  // Navigate to app
  await page.goto('https://staging.example.com');
  
  // Login
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  // Create task
  await page.click('[data-testid="new-task-button"]');
  await page.fill('[data-testid="task-title"]', 'Test Task');
  await page.click('[data-testid="save-task"]');
  
  // Verify task appears
  await expect(page.locator('[data-testid="task-list"]')).toContainText('Test Task');
});
```

---

## E2E Test Specifications

### E2E-001: Complete User Onboarding
**File:** `tests/e2e/onboarding.spec.ts`  
**Status:** ⬜ Not Started  
**User Persona:** [Persona 1 name]  
**Requirements:** REQ-001, REQ-002, REQ-003

#### User Journey
1. **Land on homepage** → See value proposition
2. **Click "Sign Up"** → Registration form appears
3. **Fill registration form** → Validation works
4. **Submit form** → Account created
5. **Receive welcome email** → Email contains activation link
6. **Activate account** → Redirected to dashboard
7. **Complete profile** → Onboarding wizard
8. **First task creation** → Tutorial overlay helps

**Success Criteria:**
- [ ] Complete flow takes <5 minutes
- [ ] No errors encountered
- [ ] User reaches productive state
- [ ] All data persisted correctly

**Status:** ⬜ Not Started

---

### E2E-002: Task Management Workflow
**File:** `tests/e2e/task-workflow.spec.ts`  
**Status:** ⬜ Not Started  
**User Persona:** [Persona 1 name]  
**Requirements:** REQ-003, REQ-004, REQ-005

[Follow same structure]

---

## QA Manual Test Cases

### Purpose
Test cases that require human judgment or are difficult to automate.

### QA-001: Visual Regression Testing
**Requirement:** NFR-005 (Accessibility)  
**Frequency:** Before each release

**Test Steps:**
1. Compare screenshots across browsers
2. Verify consistent styling
3. Check responsive breakpoints
4. Validate color contrast ratios

**Tools:** [Percy / Chromatic / Manual comparison]  
**Status:** ⬜ Not Started

---

### QA-002: Accessibility Testing
**Requirement:** NFR-005  
**Frequency:** Before each release

**Test Steps:**
1. Run automated accessibility scanner
2. Navigate entire app with keyboard only
3. Test with screen reader (NVDA/JAWS)
4. Verify ARIA labels present
5. Check color contrast meets WCAG 2.1 AA

**Tools:** [aXe DevTools / Lighthouse]  
**Status:** ⬜ Not Started

---

### QA-003: Cross-Browser Testing
**Requirement:** NFR-005  
**Browsers:** Chrome, Firefox, Safari, Edge  
**Devices:** Desktop, Mobile (iOS/Android), Tablet

**Test Matrix:**

| Feature | Chrome | Firefox | Safari | Edge | Mobile |
|---------|--------|---------|--------|------|--------|
| Login | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Task CRUD | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| [Feature 3] | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

**Status:** ⬜ Not Started

---

## Performance Testing

### PERF-001: Load Testing
**Requirement:** NFR-001 (Performance)  
**Tool:** [K6 / JMeter / Artillery]

**Scenarios:**
1. **Baseline:** 100 concurrent users
2. **Expected Peak:** 1,000 concurrent users
3. **Stress Test:** 5,000 concurrent users

**Success Criteria:**
- [ ] Response time p95 < 200ms at baseline
- [ ] Response time p95 < 500ms at expected peak
- [ ] No errors at expected peak
- [ ] Graceful degradation at stress level

**Status:** ⬜ Not Started

---

### PERF-002: Database Performance
**Requirement:** NFR-001  
**Tool:** EXPLAIN ANALYZE / Database profiler

**Test Cases:**
- [ ] All queries execute in <50ms
- [ ] Indexes used where appropriate
- [ ] No N+1 query problems
- [ ] Connection pool sized correctly

**Status:** ⬜ Not Started

---

## Security Testing

### SEC-001: OWASP Top 10
**Requirement:** NFR-002 (Security)  
**Tool:** [OWASP ZAP / Burp Suite]

**Test Coverage:**
- [ ] SQL Injection prevention
- [ ] XSS prevention
- [ ] CSRF token validation
- [ ] Authentication bypass attempts
- [ ] Authorization checks
- [ ] Sensitive data exposure
- [ ] Security misconfiguration
- [ ] Broken access control
- [ ] Using components with known vulnerabilities
- [ ] Insufficient logging/monitoring

**Status:** ⬜ Not Started

---

### SEC-002: Penetration Testing
**Requirement:** NFR-002  
**Frequency:** Before production launch, then quarterly  
**Performed By:** [Internal team / External firm]

**Scope:**
- API endpoints
- Authentication/Authorization
- Data storage
- Third-party integrations

**Status:** ⬜ Not Started

---

## Test Data Management

### Test Users
```javascript
const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'TestAdmin123!',
    role: 'admin'
  },
  user: {
    email: 'user@test.com',
    password: 'TestUser123!',
    role: 'user'
  }
};
```

### Test Data Sets
**Location:** `tests/fixtures/`

- `users.json` - Sample user data
- `tasks.json` - Sample task data
- `scenarios.json` - Complete workflow scenarios

### Database Seeding
```bash
npm run test:seed  # Populate test database
npm run test:reset # Clear and re-seed
```

---

## Test Execution

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Watch mode (during development)
npm run test:watch

# Specific file
npm test -- auth.test.ts
```

### CI/CD Pipeline

**On Every Commit:**
1. Lint code
2. Run unit tests
3. Run integration tests
4. Generate coverage report

**On Pull Request:**
1. All commit checks
2. E2E tests (smoke suite)
3. Security scan
4. Performance baseline

**Before Deployment:**
1. Full test suite
2. E2E tests (complete)
3. Load testing
4. Manual QA sign-off

---

## Defect Management

### Bug Reporting Template
```markdown
**Bug ID:** BUG-001
**Severity:** Critical / High / Medium / Low
**Status:** Open / In Progress / Fixed / Closed

**Description:**
[What's wrong]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Environment:**
- Browser: [Chrome 120]
- OS: [Windows 11]
- Build: [v1.2.3]

**Related Requirement:** REQ-001

**Regression Test:** TEST-001-04 (to be added)
```

### Severity Levels
- **Critical:** App unusable, data loss, security breach
- **High:** Major feature broken, severe UX issue
- **Medium:** Feature partially working, minor UX issue
- **Low:** Cosmetic issue, edge case

---

## Test Coverage Report

### Current Coverage: [X]%

| Module | Coverage | Target | Status |
|--------|----------|--------|--------|
| Auth | [X]% | 90% | ⬜ |
| Tasks | [X]% | 90% | ⬜ |
| Users | [X]% | 80% | ⬜ |
| Utils | [X]% | 80% | ⬜ |
| **Overall** | **[X]%** | **80%** | ⬜ |

### Coverage Gaps
- [ ] [Feature/module] - Currently [X]%, need [Y]%
- [ ] [Feature/module] - No tests yet

---

## Test Maintenance

### Review Schedule
- **After Each Sprint:** Update test specs for new requirements
- **Monthly:** Review and remove obsolete tests
- **Quarterly:** Full test suite audit

### Flaky Tests
**Definition:** Tests that intermittently fail without code changes

**Current Flaky Tests:**
- [ ] [Test name] - [Reason] - [Fix plan]

**Policy:** Fix or delete within 1 week

---

## Acceptance Criteria Mapping

### Requirement → Test Coverage

| Requirement | Acceptance Criteria | Test Case(s) | Status |
|-------------|---------------------|--------------|--------|
| REQ-001 | Criterion 1 | TEST-001-01 | ⬜ |
| REQ-001 | Criterion 2 | TEST-001-02 | ⬜ |
| REQ-001 | Criterion 3 | TEST-001-03 | ⬜ |
| REQ-002 | Criterion 1 | TEST-002-01 | ⬜ |

**Goal:** 100% coverage of all acceptance criteria

---

## How to Use This Document

### For Developers
1. **Before coding:** Write tests based on specs here
2. **During coding:** Run tests in watch mode
3. **After coding:** Verify all related tests pass
4. **Before PR:** Run full test suite

### For QA Engineers
1. **Create test specs** from BRTD acceptance criteria
2. **Execute manual tests** from QA section
3. **Report bugs** using defect template
4. **Track coverage** and identify gaps

### For Product Managers
1. **Verify all requirements** have test coverage
2. **Review acceptance criteria** mapping
3. **Sign off on test results** before release

---

## Appendix

### Glossary
**Unit Test:** Tests a single function/component in isolation  
**Integration Test:** Tests interaction between components  
**E2E Test:** Tests complete user workflow  
**TDD:** Test-Driven Development - write tests first  
**Coverage:** % of code executed by tests  
**Regression Test:** Test to ensure old bugs don't return

### Tools & Frameworks
- **[Jest](https://jestjs.io/)** - JavaScript testing framework
- **[Playwright](https://playwright.dev/)** - E2E testing
- **[K6](https://k6.io/)** - Load testing
- **[OWASP ZAP](https://www.zaproxy.org/)** - Security testing

---

**Remember:** Tests are written BEFORE implementation. They should fail initially, then pass as features are built. This ensures we're building exactly what's required and provides a safety net for future changes.

**Status Updates:** As tests pass, check them off (⬜ → ✅) and update completion percentages.
