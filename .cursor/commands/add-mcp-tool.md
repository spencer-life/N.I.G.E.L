# Add MCP Tool

## Overview
Add a new tool to an existing MCP server with proper schema, validation, error handling, and documentation.

## Reference
Review `@docs/MCP-SERVER-REFERENCE.md` for tool patterns and best practices.

## Steps

### 1. Define Tool Schema
Create a clear JSON Schema for the tool's input:

```typescript
{
  name: 'tool_name',
  description: 'Clear description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'What this parameter does',
      },
      param2: {
        type: 'number',
        description: 'Numeric parameter',
        minimum: 1,
        maximum: 100,
      },
    },
    required: ['param1'],
  },
}
```

### 2. Add to ListToolsRequest Handler
**TypeScript:**
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ... existing tools
    {
      name: 'new_tool',
      description: 'Tool description',
      inputSchema: { /* schema here */ },
    },
  ],
}));
```

**Python:**
```python
@mcp.tool()
def new_tool(param1: str, param2: int = 10) -> str:
    """Tool description.
    
    Args:
        param1: Parameter description
        param2: Optional parameter (default: 10)
    
    Returns:
        Result description
    """
    # Implementation
```

### 3. Implement Tool Logic
**TypeScript:**
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    if (name === 'new_tool') {
      const { param1, param2 } = args as { param1: string; param2?: number };
      
      // Validate inputs
      if (!param1 || param1.length === 0) {
        throw new Error('param1 is required and cannot be empty');
      }
      
      // Tool logic here
      const result = await processData(param1, param2);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
    
    // ... other tools
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});
```

### 4. Input Validation
Validate all inputs before processing:
- Check required fields exist
- Validate data types
- Validate ranges/constraints
- Sanitize string inputs
- Handle edge cases

### 5. Error Handling
Implement comprehensive error handling:
- Catch all exceptions
- Return meaningful error messages
- Log errors for debugging
- Set `isError: true` in response
- Don't expose sensitive information

### 6. Documentation
Document the tool:
- Clear description of purpose
- All parameters explained
- Return value format
- Example usage
- Error scenarios

## Tool Patterns

### Data Retrieval Tool
```typescript
{
  name: 'get_data',
  description: 'Retrieve data from source',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      limit: { type: 'number', description: 'Max results', default: 10 },
    },
    required: ['query'],
  },
}
```

### Data Modification Tool
```typescript
{
  name: 'update_data',
  description: 'Update existing data',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Record ID' },
      updates: { type: 'object', description: 'Fields to update' },
    },
    required: ['id', 'updates'],
  },
}
```

### Computation Tool
```typescript
{
  name: 'calculate',
  description: 'Perform calculation',
  inputSchema: {
    type: 'object',
    properties: {
      operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
      a: { type: 'number' },
      b: { type: 'number' },
    },
    required: ['operation', 'a', 'b'],
  },
}
```

## Testing the Tool

### 1. Use MCP Inspector
```bash
npx @modelcontextprotocol/inspector node ./build/index.js
```

### 2. Test Cases
- Valid inputs with expected results
- Invalid inputs (should error gracefully)
- Edge cases (empty strings, zero, negative numbers)
- Missing required parameters
- Incorrect data types

### 3. Manual Testing
Create test script:
```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const result = await client.callTool({
  name: 'new_tool',
  arguments: { param1: 'test', param2: 5 },
});
console.log(result);
```

## Best Practices
- Keep tools focused on single responsibility
- Validate all inputs explicitly
- Return structured, parseable output
- Use TypeScript types for type safety
- Document expected behavior clearly
- Consider rate limiting for expensive operations
- Log important operations
- Test thoroughly before deployment
