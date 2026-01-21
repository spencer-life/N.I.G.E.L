---
name: format-imports
description: Organizes and cleans up TypeScript/JavaScript imports. Use when imports are messy or after refactoring.
---

# Format Imports

Clean up and organize import statements in TypeScript/JavaScript files.

## When to Use

- After refactoring or moving files
- When imports are disorganized
- Before committing code
- During code review

## Instructions

1. **Group imports by category** (in this order):
   - External packages (node_modules)
   - Internal absolute imports
   - Internal relative imports
   - Type-only imports (if TypeScript)

2. **Within each group**:
   - Sort alphabetically
   - Remove unused imports
   - Combine imports from same source

3. **Format style**:
   - Use consistent quote style (single or double)
   - Add `.js` extension for ESM imports (if required)
   - Use named imports over default when possible

4. **Example**:
```typescript
// External packages
import { Client, GatewayIntentBits } from 'discord.js';
import Anthropic from '@anthropic-ai/sdk';

// Internal absolute
import { supabase } from '../database/client.js';
import { COLORS } from '../utils/embeds.js';

// Internal relative
import { DrillService } from './DrillService.js';

// Type imports
import type { User, Session } from '../types/database.js';
```

5. **Remove**:
   - Duplicate imports
   - Unused imports (check with linter)
   - Commented-out imports

## Output Format

Clean, organized imports following project conventions.
