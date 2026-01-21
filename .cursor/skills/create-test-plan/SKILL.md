---
name: create-test-plan
description: Creates a comprehensive test plan for a feature. Use before implementing tests to ensure coverage.
---

# Create Test Plan

Generate a structured test plan covering unit, integration, and edge cases.

## When to Use

- Before implementing a new feature (TDD)
- When adding tests to existing code
- Planning test coverage for refactoring
- Documenting test requirements

## Instructions

1. **Analyze the feature/code** to understand:
   - Inputs and outputs
   - Business logic
   - Dependencies
   - Edge cases

2. **Create test categories**:
   - **Unit Tests**: Pure logic, isolated functions
   - **Integration Tests**: Component interactions
   - **Edge Cases**: Boundaries, null, empty, invalid
   - **Error Cases**: Expected failures

3. **For each test, specify**:
   - Test name (descriptive)
   - Setup required
   - Input values
   - Expected output
   - Assertions to make

4. **Format as markdown**:
```markdown
## Unit Tests

### Test: calculateScore with valid input
- Setup: Mock user with streak = 3
- Input: correctAnswer=true, difficulty=4, timeMs=5000
- Expected: score = 12 (base 4 × streak 3)
- Assert: result.score === 12
```

5. **Identify gaps**: What's not covered?

## Output Format

Complete test plan ready for implementation, organized by test type.
