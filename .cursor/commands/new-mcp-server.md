# Create New MCP Server

## Overview
Scaffold a complete Model Context Protocol (MCP) server with proper structure, error handling, and best practices.

## Reference
Review `@docs/MCP-SERVER-REFERENCE.md` for complete implementation patterns.

## Steps

### 1. Project Setup
**For TypeScript:**
- Initialize npm project
- Install `@modelcontextprotocol/sdk`
- Set up TypeScript configuration
- Create `src/` directory structure

**For Python:**
- Create virtual environment
- Install `mcp` package (FastMCP)
- Create main server file

### 2. Server Initialization
**TypeScript pattern:**
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: 'server-name', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {}, prompts: {} } }
);
```

**Python pattern:**
```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("server-name")
```

### 3. Implement Capabilities

#### Tools (Executable Functions)
- Define clear input schemas
- Implement proper error handling
- Return structured responses
- Add descriptive documentation

#### Resources (Data Access)
- Define resource URIs
- Implement read handlers
- Handle missing resources gracefully
- Use appropriate MIME types

#### Prompts (Templates)
- Create reusable prompt templates
- Define required/optional arguments
- Return properly formatted messages

### 4. Configuration
**Cursor Integration:**
Add to Cursor MCP settings:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["/absolute/path/to/build/index.js"],
      "env": {
        "API_KEY": "your-key-here"
      }
    }
  }
}
```

### 5. Testing
- Use MCP Inspector for interactive testing
- Create manual test scripts
- Test all tools, resources, and prompts
- Verify error handling

## Implementation Checklist
- [ ] Project initialized with dependencies
- [ ] Server instance created with proper config
- [ ] At least one tool implemented with schema
- [ ] Error handling in place
- [ ] Environment variables configured
- [ ] README with setup instructions
- [ ] Tested with MCP Inspector
- [ ] Added to Cursor configuration

## Best Practices
- Validate all inputs with JSON Schema
- Provide clear, descriptive error messages
- Use environment variables for secrets
- Document all tools/resources/prompts
- Implement rate limiting for expensive operations
- Log important operations for debugging
- Keep tool functions focused and single-purpose

## Security Considerations
- Never expose sensitive data without auth
- Sanitize all user inputs
- Use parameterized queries for databases
- Store credentials in environment variables
- Implement proper access controls
- Audit third-party dependencies
