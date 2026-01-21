---
name: generate-changelog
description: Generates a changelog from recent git commits. Use when preparing releases or documenting changes.
---

# Generate Changelog

Generate a well-formatted changelog from recent git commits.

## When to Use

- Preparing for a release
- Documenting changes for a PR
- Creating release notes
- Updating CHANGELOG.md file

## Instructions

1. Run `git log` to get recent commits (last 20 or since last tag)
2. Group commits by category:
   - **Features**: New functionality
   - **Bug Fixes**: Fixes and corrections
   - **Documentation**: Docs updates
   - **Refactoring**: Code improvements
   - **Tests**: Test additions/changes
   - **Chores**: Dependencies, config, etc.

3. Format as markdown:
```markdown
## [Version] - YYYY-MM-DD

### Features
- Feature description from commit message

### Bug Fixes
- Fix description from commit message

### Documentation
- Doc update description
```

4. Use conventional commit format if commits follow it
5. Skip merge commits and trivial commits
6. Link to issues/PRs if referenced in commits

## Output Format

Clean, scannable changelog suitable for CHANGELOG.md or release notes.
