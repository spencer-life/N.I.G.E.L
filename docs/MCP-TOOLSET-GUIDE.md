# MCP Toolset Integration Guide

## Overview

The **MCP Toolset** (`mcpToolset_20251120`) is a powerful feature in Anthropic's Claude API that allows Claude to connect directly to remote MCP (Model Context Protocol) servers and use their tools without implementing a separate MCP client.

**This guide shows you how to add MCP toolset support to ANY project using Claude.**

---

## 🎯 What Can You Do With This?

- **Connect to external tools** - Use tools from any MCP server in your Claude conversations
- **Dynamic tool discovery** - Claude can find and use the right tools on-demand
- **Multi-server support** - Connect to multiple MCP servers simultaneously
- **Selective tool access** - Allowlist/denylist specific tools for security
- **Cost optimization** - Defer tool loading until needed

---

## 📦 Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
npm install @langchain/anthropic @langchain/core
```

### 2. Basic Usage

```typescript
import { ChatAnthropic, tools } from "@langchain/anthropic";

const llm = new ChatAnthropic({
  model: "claude-sonnet-4-5-20250929",
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Enable all tools from an MCP server
const response = await llm.invoke("What tools do you have?", {
  mcp_servers: [
    {
      type: "url",
      url: "https://example-server.modelcontextprotocol.io/sse",
      name: "example-mcp",
      authorization_token: "YOUR_TOKEN", // Optional
    },
  ],
  tools: [tools.mcpToolset_20251120({ serverName: "example-mcp" })],
});

console.log(response.content);
```

### 3. That's It!

Claude can now access and use tools from the MCP server.

---

## 🔧 Configuration Patterns

### Pattern 1: Enable All Tools (Default)

**Use Case:** Trusted server, want access to everything.

```typescript
const response = await llm.invoke("Your query", {
  mcp_servers: [
    {
      type: "url",
      url: "https://trusted-server.com/sse",
      name: "trusted-mcp",
    },
  ],
  tools: [tools.mcpToolset_20251120({ serverName: "trusted-mcp" })],
});
```

**Cost:** All tools loaded immediately.

---

### Pattern 2: Allowlist Specific Tools (Recommended)

**Use Case:** Only need a few specific tools, want to minimize cost.

```typescript
const response = await llm.invoke("Search my calendar", {
  mcp_servers: [
    {
      type: "url",
      url: "https://calendar-server.com/sse",
      name: "calendar-mcp",
      authorization_token: process.env.CALENDAR_TOKEN,
    },
  ],
  tools: [
    tools.mcpToolset_20251120({
      serverName: "calendar-mcp",
      // Disable all tools by default
      defaultConfig: { enabled: false },
      // Explicitly enable only these
      configs: {
        search_events: { enabled: true },
        create_event: { enabled: true },
      },
    }),
  ],
});
```

**Benefits:**
- ✅ Lower cost (fewer tools loaded)
- ✅ Better security (explicit permission)
- ✅ Faster responses (less tool context)

---

### Pattern 3: Denylist Dangerous Tools

**Use Case:** Want most tools, but block specific dangerous ones.

```typescript
const response = await llm.invoke("List my data", {
  mcp_servers: [
    {
      type: "url",
      url: "https://database-server.com/sse",
      name: "db-mcp",
    },
  ],
  tools: [
    tools.mcpToolset_20251120({
      serverName: "db-mcp",
      // All tools enabled by default
      configs: {
        // Explicitly disable dangerous operations
        drop_table: { enabled: false },
        delete_all: { enabled: false },
        grant_admin: { enabled: false },
      },
    }),
  ],
});
```

---

### Pattern 4: Deferred Loading (Cost Optimization)

**Use Case:** Large server with many tools, only load what's needed.

```typescript
const response = await llm.invoke("Find the right tool for this task", {
  mcp_servers: [
    {
      type: "url",
      url: "https://huge-toolset.com/sse",
      name: "huge-mcp",
    },
  ],
  tools: [
    // Tool search helps Claude discover tools on-demand
    tools.toolSearchRegex_20251119(),
    tools.mcpToolset_20251120({
      serverName: "huge-mcp",
      // Don't load tools until Claude requests them
      defaultConfig: { deferLoading: true },
    }),
  ],
});
```

**Savings:** 60-80% cost reduction for large MCP servers.

---

### Pattern 5: Multiple MCP Servers

**Use Case:** Need tools from different specialized servers.

```typescript
const response = await llm.invoke("Use tools from both servers", {
  mcp_servers: [
    {
      type: "url",
      url: "https://calendar.example.com/sse",
      name: "calendar-mcp",
      authorization_token: process.env.CALENDAR_TOKEN,
    },
    {
      type: "url",
      url: "https://github.example.com/sse",
      name: "github-mcp",
      authorization_token: process.env.GITHUB_TOKEN,
    },
  ],
  tools: [
    // Calendar server - allowlist pattern
    tools.mcpToolset_20251120({
      serverName: "calendar-mcp",
      defaultConfig: { enabled: false },
      configs: {
        search_events: { enabled: true },
        create_event: { enabled: true },
      },
    }),
    // GitHub server - denylist pattern
    tools.mcpToolset_20251120({
      serverName: "github-mcp",
      configs: {
        delete_repository: { enabled: false },
        force_push: { enabled: false },
      },
    }),
  ],
});
```

---

## 🏗️ Implementation Template

### Create a Reusable Service

**File:** `services/McpToolsetService.ts`

```typescript
import { ChatAnthropic, tools } from "@langchain/anthropic";
import type { MCPServer } from "@langchain/anthropic";

export interface McpToolsetConfig {
  serverName: string;
  allowlist?: string[]; // Only these tools enabled
  denylist?: string[]; // Block these tools
  deferLoading?: boolean; // Load tools on-demand
}

export class McpToolsetService {
  private llm: ChatAnthropic;
  private mcpServers: MCPServer[];
  private toolConfigs: any[];

  constructor(
    model: string = "claude-sonnet-4-5-20250929",
    apiKey?: string
  ) {
    this.llm = new ChatAnthropic({
      model,
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
    this.mcpServers = [];
    this.toolConfigs = [];
  }

  /**
   * Add an MCP server connection
   */
  addServer(
    url: string,
    name: string,
    authToken?: string,
    config?: McpToolsetConfig
  ): void {
    // Add server
    this.mcpServers.push({
      type: "url",
      url,
      name,
      authorization_token: authToken,
    });

    // Build tool config
    const toolsetConfig: any = {
      serverName: name,
    };

    if (config) {
      // Allowlist pattern
      if (config.allowlist && config.allowlist.length > 0) {
        toolsetConfig.defaultConfig = { enabled: false };
        toolsetConfig.configs = {};
        config.allowlist.forEach((toolName) => {
          toolsetConfig.configs[toolName] = { enabled: true };
        });
      }

      // Denylist pattern
      if (config.denylist && config.denylist.length > 0) {
        toolsetConfig.configs = toolsetConfig.configs || {};
        config.denylist.forEach((toolName) => {
          toolsetConfig.configs[toolName] = { enabled: false };
        });
      }

      // Deferred loading
      if (config.deferLoading) {
        toolsetConfig.defaultConfig = {
          ...toolsetConfig.defaultConfig,
          deferLoading: true,
        };
      }
    }

    this.toolConfigs.push(tools.mcpToolset_20251120(toolsetConfig));
  }

  /**
   * Query with MCP tools available
   */
  async query(prompt: string): Promise<string> {
    if (this.mcpServers.length === 0) {
      throw new Error("No MCP servers configured. Call addServer() first.");
    }

    const response = await this.llm.invoke(prompt, {
      mcp_servers: this.mcpServers,
      tools: this.toolConfigs,
    });

    return typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);
  }

  /**
   * Clear all servers and configs
   */
  reset(): void {
    this.mcpServers = [];
    this.toolConfigs = [];
  }
}
```

### Usage Example

```typescript
import { McpToolsetService } from "./services/McpToolsetService";

// Initialize
const service = new McpToolsetService("claude-sonnet-4-5-20250929");

// Add calendar server (allowlist)
service.addServer(
  "https://calendar.example.com/sse",
  "calendar-mcp",
  process.env.CALENDAR_TOKEN,
  {
    allowlist: ["search_events", "create_event"],
  }
);

// Add GitHub server (denylist)
service.addServer(
  "https://github.example.com/sse",
  "github-mcp",
  process.env.GITHUB_TOKEN,
  {
    denylist: ["delete_repository", "force_push"],
  }
);

// Query
const response = await service.query(
  "Find my meeting tomorrow and create a GitHub issue to follow up"
);

console.log(response);
```

---

## 💰 Cost Optimization Strategies

### 1. Use Allowlists (60-80% Savings)

Only load tools you actually need:

```typescript
// ❌ BAD: Loads all 50 tools
tools: [tools.mcpToolset_20251120({ serverName: "huge-server" })]

// ✅ GOOD: Loads only 3 tools
tools: [
  tools.mcpToolset_20251120({
    serverName: "huge-server",
    defaultConfig: { enabled: false },
    configs: {
      search: { enabled: true },
      read: { enabled: true },
      write: { enabled: true },
    },
  })
]
```

---

### 2. Defer Loading for Large Servers

Load tools only when needed:

```typescript
tools: [
  tools.toolSearchRegex_20251119(), // Required for deferred loading
  tools.mcpToolset_20251120({
    serverName: "large-server",
    defaultConfig: { deferLoading: true },
  })
]
```

**Savings:** Tools loaded on-demand, not upfront.

---

### 3. Use Cheaper Models When Possible

For simple MCP tool calls, use Haiku:

```typescript
// Complex reasoning needed → Sonnet
const complexLlm = new ChatAnthropic({
  model: "claude-sonnet-4-5-20250929",
});

// Simple tool execution → Haiku (10x cheaper)
const simpleLlm = new ChatAnthropic({
  model: "claude-haiku-4-5-20251001",
});
```

---

### 4. Batch Queries

Make multiple tool calls in one request:

```typescript
const response = await llm.invoke(
  "1. Search my calendar for tomorrow. 2. Create a GitHub issue. 3. Send summary email.",
  {
    mcp_servers: [calendar, github, email],
    tools: [...toolConfigs],
  }
);
```

**Cost:** 1 API call instead of 3.

---

## 🔒 Security Best Practices

### 1. Always Use Allowlists for Production

```typescript
// ❌ DANGEROUS: All tools enabled
tools.mcpToolset_20251120({ serverName: "production-db" })

// ✅ SAFE: Explicit permissions
tools.mcpToolset_20251120({
  serverName: "production-db",
  defaultConfig: { enabled: false },
  configs: {
    read_user: { enabled: true },
    search_records: { enabled: true },
    // delete_all: NOT enabled (blocked by default)
  },
})
```

---

### 2. Use Environment Variables for Tokens

```typescript
// ❌ BAD: Hardcoded secrets
authorization_token: "sk-ant-1234567890"

// ✅ GOOD: Environment variables
authorization_token: process.env.MCP_SERVER_TOKEN
```

---

### 3. Validate MCP Server URLs

```typescript
function validateMcpUrl(url: string): boolean {
  // Only allow HTTPS
  if (!url.startsWith("https://")) {
    throw new Error("MCP server must use HTTPS");
  }

  // Allowlist trusted domains
  const trustedDomains = [
    "modelcontextprotocol.io",
    "example.com",
    "your-domain.com",
  ];

  const domain = new URL(url).hostname;
  if (!trustedDomains.some((d) => domain.endsWith(d))) {
    throw new Error(`Untrusted MCP server domain: ${domain}`);
  }

  return true;
}
```

---

### 4. Implement Rate Limiting

```typescript
class RateLimitedMcpService extends McpToolsetService {
  private requestCount = 0;
  private resetTime = Date.now() + 60000; // 1 minute

  async query(prompt: string): Promise<string> {
    // Reset counter every minute
    if (Date.now() > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = Date.now() + 60000;
    }

    // Enforce limit
    if (this.requestCount >= 10) {
      throw new Error("Rate limit exceeded: 10 requests/minute");
    }

    this.requestCount++;
    return super.query(prompt);
  }
}
```

---

## 🧪 Testing

### Test MCP Server Connectivity

```typescript
async function testMcpServer(url: string, token?: string): Promise<void> {
  const llm = new ChatAnthropic({
    model: "claude-haiku-4-5-20251001", // Use cheap model for testing
  });

  try {
    const response = await llm.invoke("List available tools", {
      mcp_servers: [
        {
          type: "url",
          url,
          name: "test-server",
          authorization_token: token,
        },
      ],
      tools: [tools.mcpToolset_20251120({ serverName: "test-server" })],
    });

    console.log("✅ MCP server connected successfully");
    console.log("Response:", response.content);
  } catch (error) {
    console.error("❌ MCP server connection failed:", error);
    throw error;
  }
}

// Usage
await testMcpServer(
  "https://example-server.com/sse",
  process.env.MCP_TOKEN
);
```

---

## 📊 Real-World Examples

### Example 1: Calendar + GitHub Integration

**Scenario:** Create GitHub issues from calendar events.

```typescript
import { McpToolsetService } from "./services/McpToolsetService";

const service = new McpToolsetService();

service.addServer(
  "https://calendar.example.com/sse",
  "calendar",
  process.env.CALENDAR_TOKEN,
  { allowlist: ["search_events", "get_event"] }
);

service.addServer(
  "https://github.example.com/sse",
  "github",
  process.env.GITHUB_TOKEN,
  { allowlist: ["create_issue"] }
);

const result = await service.query(`
  Find all meetings labeled "ACTION ITEM" from this week
  and create a GitHub issue for each with:
  - Title: Meeting name
  - Body: Meeting notes
  - Label: action-item
`);

console.log(result);
```

---

### Example 2: Database + Email Integration

**Scenario:** Send email summaries of database queries.

```typescript
service.addServer(
  "https://db.example.com/sse",
  "database",
  process.env.DB_TOKEN,
  {
    allowlist: ["query_users", "get_stats"],
    denylist: ["delete", "drop", "truncate"],
  }
);

service.addServer(
  "https://email.example.com/sse",
  "email",
  process.env.EMAIL_TOKEN,
  { allowlist: ["send_email"] }
);

await service.query(`
  Query active users from last 7 days,
  calculate engagement stats,
  and email summary to admin@example.com
`);
```

---

### Example 3: Multi-Source Research

**Scenario:** Aggregate information from multiple sources.

```typescript
service.addServer(
  "https://research-papers.com/sse",
  "papers",
  process.env.PAPERS_TOKEN,
  {
    allowlist: ["search_papers", "get_abstract"],
    deferLoading: true, // Large corpus
  }
);

service.addServer(
  "https://news-api.com/sse",
  "news",
  process.env.NEWS_TOKEN,
  { allowlist: ["search_articles"] }
);

service.addServer(
  "https://wikipedia.com/sse",
  "wiki",
  undefined, // Public, no token
  { allowlist: ["search", "get_page"] }
);

const research = await service.query(`
  Research "quantum computing advancements in 2025"
  using all available sources. Provide:
  1. Recent academic papers (last 6 months)
  2. News articles (last 30 days)
  3. Wikipedia summary
  Synthesize into a 500-word summary with citations.
`);
```

---

## 🎓 Best Practices Summary

### DO ✅

- **Use allowlists** for production environments
- **Store tokens** in environment variables
- **Validate URLs** before connecting
- **Implement rate limiting** for expensive operations
- **Test connectivity** before deploying
- **Use deferred loading** for large MCP servers
- **Choose the right model** (Haiku for simple, Sonnet for complex)
- **Batch multiple operations** into single requests

### DON'T ❌

- **Enable all tools** without reviewing them
- **Hardcode secrets** in source code
- **Skip URL validation** for user-provided servers
- **Ignore error handling** for MCP connections
- **Use Sonnet** for simple tool execution (use Haiku)
- **Load all tools upfront** for large servers (defer loading)
- **Make separate API calls** for related operations (batch them)

---

## 🐛 Troubleshooting

### Issue: "MCP server connection failed"

**Causes:**
1. Invalid URL format
2. Server not responding
3. Invalid authorization token
4. Network connectivity issues

**Solutions:**
```typescript
// Test with minimal config
const response = await llm.invoke("ping", {
  mcp_servers: [
    {
      type: "url",
      url: "https://your-server.com/sse",
      name: "test",
    },
  ],
  tools: [tools.mcpToolset_20251120({ serverName: "test" })],
});
```

---

### Issue: "Tool not found"

**Cause:** Tool name doesn't match MCP server's tool name.

**Solution:**
```typescript
// First, list available tools
const response = await llm.invoke("What tools are available?", {
  mcp_servers: [{ type: "url", url: "...", name: "server" }],
  tools: [tools.mcpToolset_20251120({ serverName: "server" })],
});
console.log(response.content); // Shows all tool names
```

---

### Issue: "Rate limit exceeded"

**Cause:** Too many requests to MCP server.

**Solution:**
Implement caching:

```typescript
class CachedMcpService extends McpToolsetService {
  private cache = new Map<string, { result: string; timestamp: number }>();
  private cacheTTL = 300000; // 5 minutes

  async query(prompt: string): Promise<string> {
    const cacheKey = prompt;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      console.log("Cache hit");
      return cached.result;
    }

    const result = await super.query(prompt);
    this.cache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  }
}
```

---

## 📚 Additional Resources

- **Anthropic MCP Docs**: [https://docs.anthropic.com/en/docs/build-with-claude/tool-use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- **LangChain Anthropic**: [https://js.langchain.com/docs/integrations/chat/anthropic](https://js.langchain.com/docs/integrations/chat/anthropic)
- **MCP Protocol Spec**: [https://spec.modelcontextprotocol.io](https://spec.modelcontextprotocol.io)
- **MCP Servers**: [https://github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

---

## 🚀 Quick Commands

### Install globally (coming soon)
```bash
npx add-mcp-toolset
```

### Add to existing project
```bash
npm install @langchain/anthropic @langchain/core
cp templates/McpToolsetService.ts src/services/
```

---

**Version:** 1.0  
**Last Updated:** January 2026  
**Compatibility:** Claude 4.5+, LangChain 0.3+

---

## License

MIT - Use freely, share widely, adapt as needed.
