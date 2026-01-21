# Testing Strategy & Setup

## Auto-Loaded Context
@package.json
@tsconfig.json
@src/services/RagService.ts
@src/commands/training/ask.ts

## Overview
I need to set up a comprehensive testing strategy for my Discord bot. Please help me configure testing frameworks, write test patterns, and establish testing practices.

## Testing Stack

### Recommended Tools
- **Jest** or **Vitest** - Test runner and assertion library
- **@discordjs/builders** - Mock Discord interactions
- **MSW** (Mock Service Worker) - Mock HTTP requests
- **tsx** - TypeScript execution for tests

### Installation
```bash
npm install -D jest @types/jest ts-jest
npm install -D vitest  # Alternative to Jest
```

## Test Structure

### Directory Organization
```
project/
├── src/
│   ├── commands/
│   │   └── ask.ts
│   └── services/
│       └── RagService.ts
├── tests/
│   ├── unit/
│   │   ├── commands/
│   │   │   └── ask.test.ts
│   │   └── services/
│   │       └── RagService.test.ts
│   ├── integration/
│   │   ├── discord-bot.test.ts
│   │   └── database.test.ts
│   ├── fixtures/
│   │   ├── mock-interactions.ts
│   │   └── test-data.ts
│   └── setup.ts
└── jest.config.js (or vitest.config.ts)
```

## Configuration

### Jest Configuration (jest.config.js)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
```

### Vitest Configuration (vitest.config.ts)
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['src/index.ts', '**/*.d.ts']
    }
  }
});
```

### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration"
  }
}
```

## Testing Patterns

### 1. Unit Tests - Discord Commands

**Pattern: Testing slash commands**
```typescript
import { CommandInteraction } from 'discord.js';
import { execute } from '../../../src/commands/ask';
import { RagService } from '../../../src/services/RagService';

// Mock dependencies
jest.mock('../../../src/services/RagService');

describe('Ask Command', () => {
  let mockInteraction: Partial<CommandInteraction>;
  let mockRagService: jest.Mocked<RagService>;

  beforeEach(() => {
    // Setup mock interaction
    mockInteraction = {
      options: {
        getString: jest.fn().mockReturnValue('test question')
      },
      reply: jest.fn(),
      deferReply: jest.fn(),
      editReply: jest.fn(),
      user: { id: '123', username: 'testuser' }
    };

    // Setup mock service
    mockRagService = new RagService() as jest.Mocked<RagService>;
    mockRagService.searchKnowledge.mockResolvedValue([
      { content: 'test context', similarity: 0.8 }
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reply with answer when knowledge is found', async () => {
    await execute(mockInteraction as CommandInteraction);
    
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.any(String),
        ephemeral: true
      })
    );
  });

  it('should handle no knowledge found', async () => {
    mockRagService.searchKnowledge.mockResolvedValue([]);
    
    await execute(mockInteraction as CommandInteraction);
    
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('no information')
      })
    );
  });

  it('should handle errors gracefully', async () => {
    mockRagService.searchKnowledge.mockRejectedValue(
      new Error('Database error')
    );
    
    await execute(mockInteraction as CommandInteraction);
    
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('error')
      })
    );
  });
});
```

### 2. Unit Tests - Services

**Pattern: Testing RAG Service**
```typescript
import { RagService } from '../../../src/services/RagService';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock external dependencies
jest.mock('@supabase/supabase-js');
jest.mock('@google/generative-ai');

describe('RagService', () => {
  let ragService: RagService;
  let mockSupabase: any;
  let mockGenAI: any;

  beforeEach(() => {
    // Setup mocks
    mockSupabase = {
      rpc: jest.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            content: 'test chunk',
            similarity: 0.85,
            source_file: 'test.md'
          }
        ],
        error: null
      })
    };

    mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue({
        embedContent: jest.fn().mockResolvedValue({
          embedding: { values: new Array(768).fill(0.1) }
        })
      })
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    (GoogleGenerativeAI as jest.Mock).mockReturnValue(mockGenAI);

    ragService = new RagService();
  });

  describe('searchKnowledge', () => {
    it('should return relevant chunks', async () => {
      const results = await ragService.searchKnowledge('test query', {
        threshold: 0.5,
        limit: 5
      });

      expect(results).toHaveLength(1);
      expect(results[0].similarity).toBeGreaterThanOrEqual(0.5);
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'match_knowledge',
        expect.objectContaining({
          match_threshold: 0.5,
          match_count: 5
        })
      );
    });

    it('should filter by framework tags', async () => {
      await ragService.searchKnowledge('test', {
        threshold: 0.5,
        limit: 5,
        tags: ['rapport']
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'match_knowledge',
        expect.objectContaining({
          filter_tags: ['rapport']
        })
      );
    });

    it('should handle empty results', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

      const results = await ragService.searchKnowledge('test');

      expect(results).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(
        ragService.searchKnowledge('test')
      ).rejects.toThrow('Database error');
    });
  });

  describe('generateEmbedding', () => {
    it('should generate 768-dimensional embedding', async () => {
      const embedding = await ragService.generateEmbedding('test text');

      expect(embedding).toHaveLength(768);
      expect(mockGenAI.getGenerativeModel).toHaveBeenCalledWith({
        model: 'text-embedding-004'
      });
    });

    it('should handle API errors', async () => {
      mockGenAI.getGenerativeModel().embedContent.mockRejectedValue(
        new Error('API error')
      );

      await expect(
        ragService.generateEmbedding('test')
      ).rejects.toThrow('API error');
    });
  });
});
```

### 3. Integration Tests

**Pattern: Testing bot startup**
```typescript
import { Client, GatewayIntentBits } from 'discord.js';
import { createClient } from '@supabase/supabase-js';

describe('Discord Bot Integration', () => {
  let client: Client;

  beforeAll(async () => {
    // Setup test environment
    process.env.DISCORD_TOKEN = 'test_token';
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_KEY = 'test_key';
  });

  afterAll(async () => {
    if (client) {
      await client.destroy();
    }
  });

  it('should initialize client with correct intents', () => {
    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
      ]
    });

    expect(client).toBeDefined();
  });

  it('should connect to database', async () => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );

    const { data, error } = await supabase.from('users').select('count');

    expect(error).toBeNull();
  });
});
```

### 4. Test Fixtures

**Create reusable mock data:**
```typescript
// tests/fixtures/mock-interactions.ts
export const createMockInteraction = (overrides = {}) => ({
  id: 'interaction-123',
  type: 2, // APPLICATION_COMMAND
  user: {
    id: 'user-123',
    username: 'testuser',
    discriminator: '0001'
  },
  options: {
    getString: jest.fn(),
    getInteger: jest.fn(),
    getBoolean: jest.fn()
  },
  reply: jest.fn(),
  deferReply: jest.fn(),
  editReply: jest.fn(),
  followUp: jest.fn(),
  ...overrides
});

// tests/fixtures/test-data.ts
export const mockKnowledgeChunks = [
  {
    id: '1',
    content: 'Test content about rapport',
    similarity: 0.85,
    source_file: 'rapport.md',
    framework_tags: ['rapport']
  },
  {
    id: '2',
    content: 'Test content about authority',
    similarity: 0.75,
    source_file: 'authority.md',
    framework_tags: ['authority']
  }
];
```

## Mocking Strategies

### Mock Discord.js
```typescript
jest.mock('discord.js', () => ({
  Client: jest.fn(),
  SlashCommandBuilder: jest.fn(),
  EmbedBuilder: jest.fn()
}));
```

### Mock Supabase
```typescript
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  rpc: jest.fn()
};
```

### Mock Gemini API
```typescript
const mockGenAI = {
  getGenerativeModel: jest.fn().mockReturnValue({
    embedContent: jest.fn().mockResolvedValue({
      embedding: { values: new Array(768).fill(0.1) }
    }),
    generateContent: jest.fn().mockResolvedValue({
      response: { text: () => 'AI response' }
    })
  })
};
```

## Testing Checklist

### Unit Tests
- [ ] All commands have tests
- [ ] All services have tests
- [ ] All utilities have tests
- [ ] Edge cases covered
- [ ] Error handling tested
- [ ] Mocks properly configured

### Integration Tests
- [ ] Bot startup/shutdown
- [ ] Database connections
- [ ] API integrations
- [ ] Command execution flow
- [ ] Interaction handling

### Coverage Goals
- [ ] 70%+ line coverage
- [ ] 70%+ branch coverage
- [ ] 70%+ function coverage
- [ ] Critical paths at 90%+

## Running Tests

### Local Development
```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run specific file
npm test -- ask.test.ts

# Run with coverage
npm run test:coverage
```

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Best Practices

1. **Test Naming:** Use descriptive test names
   ```typescript
   it('should return error when user not found')
   ```

2. **AAA Pattern:** Arrange, Act, Assert
   ```typescript
   // Arrange
   const input = 'test';
   // Act
   const result = await service.process(input);
   // Assert
   expect(result).toBe('expected');
   ```

3. **One Assertion Per Test:** Keep tests focused

4. **Clean Up:** Use `afterEach` to clean up mocks

5. **Isolate Tests:** Each test should be independent

6. **Mock External Services:** Don't hit real APIs in tests

7. **Test Edge Cases:** Empty inputs, null, undefined, errors

## Next Steps

After setup:
1. Write tests for existing code
2. Achieve 70%+ coverage
3. Add tests for new features
4. Set up CI/CD pipeline
5. Review tests in PRs

Please help me set up testing with these patterns.
