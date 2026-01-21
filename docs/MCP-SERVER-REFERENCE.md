# Model Context Protocol (MCP) Server Development Reference

## Overview
The **Model Context Protocol (MCP)** is an open protocol that enables seamless integration between LLM applications and external data sources and tools. This guide covers how to build, edit, and deploy MCP servers.

**Official Resources:**
- Documentation: [https://modelcontextprotocol.io](https://modelcontextprotocol.io)
- GitHub Organization: [https://github.com/modelcontextprotocol](https://github.com/modelcontextprotocol)
- Specification: [https://spec.modelcontextprotocol.io](https://spec.modelcontextprotocol.io)

---

## 1. Core Concepts

### What is MCP?
MCP provides a standardized way for AI assistants to:
- **Access Resources**: Read data from external sources (files, databases, APIs)
- **Call Tools**: Execute functions with parameters and return results
- **Use Prompts**: Leverage pre-defined prompt templates

### Architecture
```
┌─────────────────┐          ┌─────────────────┐
│   MCP Client    │          │   MCP Server    │
│ (e.g., Cursor)  │ ←──────→ │  (Your Code)    │
└─────────────────┘   stdio  └─────────────────┘
                              │
                              ├─ Resources
                              ├─ Tools
                              └─ Prompts
```

### Key Capabilities
1. **Resources**: Expose data that the AI can read (files, database records, API responses)
2. **Tools**: Define executable functions the AI can call (search, calculate, create)
3. **Prompts**: Provide reusable prompt templates with arguments

---

## 2. Available SDKs

| Language | Repository | Package |
|----------|-----------|---------|
| **TypeScript** | [typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) | `@modelcontextprotocol/sdk` |
| **Python** | [python-sdk](https://github.com/modelcontextprotocol/python-sdk) | `mcp` |
| **Java** | [java-sdk](https://github.com/modelcontextprotocol/java-sdk) | Spring AI integration |
| **Kotlin** | [kotlin-sdk](https://github.com/modelcontextprotocol/kotlin-sdk) | JetBrains collaboration |
| **C#** | [csharp-sdk](https://github.com/modelcontextprotocol/csharp-sdk) | Microsoft collaboration |
| **Go** | [go-sdk](https://github.com/modelcontextprotocol/go-sdk) | - |
| **PHP** | [php-sdk](https://github.com/modelcontextprotocol/php-sdk) | - |
| **Ruby** | [ruby-sdk](https://github.com/modelcontextprotocol/ruby-sdk) | - |
| **Rust** | [rust-sdk](https://github.com/modelcontextprotocol/rust-sdk) | - |
| **Swift** | [swift-sdk](https://github.com/modelcontextprotocol/swift-sdk) | - |

---

## 3. Creating MCP Servers

### TypeScript Implementation

#### Quick Start with Template
```bash
# Using the official template
npm init mcp-ts your-server-name
cd your-server-name
npm install
```

#### Manual Setup
```bash
npm install @modelcontextprotocol/sdk
```

**Basic Server Structure:**
```typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'my-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'calculate_sum',
      description: 'Adds two numbers together',
      inputSchema: {
        type: 'object',
        properties: {
          a: { type: 'number', description: 'First number' },
          b: { type: 'number', description: 'Second number' },
        },
        required: ['a', 'b'],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'calculate_sum') {
    const { a, b } = request.params.arguments as { a: number; b: number };
    return {
      content: [
        {
          type: 'text',
          text: `Result: ${a + b}`,
        },
      ],
    };
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Python Implementation

#### Quick Start with FastMCP
```bash
pip install mcp
```

**Basic Server Structure:**
```python
from mcp.server.fastmcp import FastMCP

# Create server
mcp = FastMCP("my-server")

# Define a tool
@mcp.tool()
def calculate_sum(a: int, b: int) -> int:
    """Adds two numbers together.
    
    Args:
        a: First number
        b: Second number
    
    Returns:
        The sum of a and b
    """
    return a + b

# Define a resource
@mcp.resource("config://settings")
def get_settings() -> str:
    """Returns application settings."""
    return "Setting1: Value1\nSetting2: Value2"

# Define a prompt
@mcp.prompt()
def review_code(language: str) -> str:
    """Generate a code review prompt.
    
    Args:
        language: Programming language
    """
    return f"Review this {language} code for best practices and security issues."

if __name__ == "__main__":
    mcp.run()
```

---

## 4. Server Capabilities

### Resources
Expose data that can be read by the AI.

**TypeScript Example:**
```typescript
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'file://logs/app.log',
      name: 'Application Logs',
      mimeType: 'text/plain',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  if (uri === 'file://logs/app.log') {
    const logContent = await readLogFile();
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: logContent,
        },
      ],
    };
  }
  throw new Error(`Resource not found: ${uri}`);
});
```

**Python Example:**
```python
@mcp.resource("logs://app")
def get_app_logs() -> str:
    """Returns application log contents."""
    with open('/var/log/app.log') as f:
        return f.read()
```

### Tools
Define functions the AI can execute.

**Input Schema (JSON Schema):**
```typescript
{
  name: 'search_database',
  description: 'Search for records in the database',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query'
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results',
        default: 10
      }
    },
    required: ['query']
  }
}
```

### Prompts
Pre-defined prompt templates with arguments.

**TypeScript Example:**
```typescript
import { ListPromptsRequestSchema, GetPromptRequestSchema } from '@modelcontextprotocol/sdk/types.js';

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [
    {
      name: 'code_review',
      description: 'Generate a code review prompt',
      arguments: [
        {
          name: 'language',
          description: 'Programming language',
          required: true,
        },
      ],
    },
  ],
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name === 'code_review') {
    const language = request.params.arguments?.language;
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Review this ${language} code for best practices and potential issues.`,
          },
        },
      ],
    };
  }
  throw new Error(`Unknown prompt: ${request.params.name}`);
});
```

---

## 5. Configuration & Deployment

### Cursor Integration

Add your server to Cursor's MCP configuration:

**Location:** Cursor Settings → Features → MCP

**Configuration Format:**
```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/absolute/path/to/build/index.js"]
    }
  }
}
```

**For NPM Packages:**
```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["my-mcp-package"]
    }
  }
}
```

**For Python Servers:**
```json
{
  "mcpServers": {
    "my-server": {
      "command": "python",
      "args": ["/absolute/path/to/server.py"]
    }
  }
}
```

### Environment Variables

Pass environment variables to your server:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["./build/index.js"],
      "env": {
        "API_KEY": "your-api-key",
        "DATABASE_URL": "postgresql://..."
      }
    }
  }
}
```

---

## 6. Testing & Debugging

### MCP Inspector
Official visual testing tool for MCP servers.

```bash
npm install -g @modelcontextprotocol/inspector
mcp-inspector node path/to/your/server.js
```

Visit the provided URL to interactively test tools, resources, and prompts.

### Manual Testing (TypeScript)
```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['./build/index.js'],
});

const client = new Client({
  name: 'test-client',
  version: '1.0.0',
});

await client.connect(transport);

// List tools
const tools = await client.listTools();
console.log('Available tools:', tools);

// Call a tool
const result = await client.callTool({
  name: 'calculate_sum',
  arguments: { a: 5, b: 3 },
});
console.log('Result:', result);
```

---

## 7. Best Practices

### Error Handling
Always provide meaningful error messages:

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    // Tool logic
  } catch (error) {
    throw new Error(`Tool execution failed: ${error.message}`);
  }
});
```

### Input Validation
Validate all tool inputs:

```python
@mcp.tool()
def divide(a: float, b: float) -> float:
    """Divides two numbers."""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b
```

### Documentation
Use clear descriptions for tools and parameters:

```typescript
{
  name: 'search_users',
  description: 'Search for users in the database by name or email',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search term (matches name or email)'
      },
      limit: {
        type: 'number',
        description: 'Max results to return (1-100)',
        minimum: 1,
        maximum: 100,
        default: 10
      }
    },
    required: ['query']
  }
}
```

### Security
- Never expose sensitive data without authentication
- Validate and sanitize all inputs
- Use environment variables for credentials
- Implement rate limiting for expensive operations

---

## 8. Common Patterns

### Database Query Tool
```typescript
{
  name: 'query_database',
  description: 'Execute a read-only SQL query',
  inputSchema: {
    type: 'object',
    properties: {
      sql: {
        type: 'string',
        description: 'SQL SELECT query'
      }
    },
    required: ['sql']
  }
}
```

### File System Resource
```python
@mcp.resource("file://{path}")
def read_file(path: str) -> str:
    """Read file contents."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")
    with open(path) as f:
        return f.read()
```

### API Integration Tool
```typescript
async function callExternalApi(request: CallToolRequest) {
  const response = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${process.env.API_KEY}`
    }
  });
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(await response.json(), null, 2)
    }]
  };
}
```

---

## 9. Official Server Examples

Explore maintained servers for reference:
- **Filesystem**: [https://github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
- **Database (PostgreSQL, SQLite)**: Official servers repository
- **Web Search**: Example implementations available
- **GitHub Integration**: Official GitHub MCP server

---

## 10. Quick Reference

### Server Initialization (TypeScript)
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({ name: 'my-server', version: '1.0.0' }, {
  capabilities: { tools: {}, resources: {}, prompts: {} }
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Server Initialization (Python)
```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-server")

if __name__ == "__main__":
    mcp.run()
```

### Request Schemas (TypeScript)
```typescript
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
```

---

## Resources

- **Documentation**: [https://modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Specification**: [https://spec.modelcontextprotocol.io](https://spec.modelcontextprotocol.io)
- **GitHub Org**: [https://github.com/modelcontextprotocol](https://github.com/modelcontextprotocol)
- **TypeScript SDK**: [https://github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- **Python SDK**: [https://github.com/modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk)
- **MCP Inspector**: [https://github.com/modelcontextprotocol/inspector](https://github.com/modelcontextprotocol/inspector)
- **Server Examples**: [https://github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

---

**Last Updated:** January 2026  
**Protocol Version:** 1.0  
**Maintained by:** The Linux Foundation
