#!/bin/bash
# Create a new MCP server with TypeScript

set -e

SERVER_NAME=$1
LANGUAGE=${2:-typescript}

if [ -z "$SERVER_NAME" ]; then
    echo "❌ Error: Server name required"
    echo "Usage: ./new-mcp-server.sh <server-name> [language]"
    echo "Languages: typescript, python"
    exit 1
fi

echo "🚀 Creating MCP server: $SERVER_NAME"
echo "📦 Language: $LANGUAGE"

mkdir -p "$SERVER_NAME"
cd "$SERVER_NAME"

if [ "$LANGUAGE" = "typescript" ]; then
    echo "📝 Setting up TypeScript MCP server..."
    
    # Create package.json
    cat > package.json << EOF
{
  "name": "$SERVER_NAME",
  "version": "1.0.0",
  "description": "MCP server for $SERVER_NAME",
  "type": "module",
  "main": "build/index.js",
  "bin": {
    "$SERVER_NAME": "build/index.js"
  },
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "dev": "tsc --watch & node --watch build/index.js",
    "inspector": "mcp-inspector node build/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  }
}
EOF
    
    # Create tsconfig.json
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build"]
}
EOF
    
    # Create src directory
    mkdir -p src
    
    # Create main server file
    cat > src/index.ts << 'EOF'
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'SERVER_NAME',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'example_tool',
      description: 'An example tool that demonstrates the pattern',
      inputSchema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'A message to process',
          },
        },
        required: ['message'],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'example_tool') {
      const { message } = args as { message: string };
      
      return {
        content: [
          {
            type: 'text',
            text: `Processed message: ${message}`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'example://data',
      name: 'Example Data',
      mimeType: 'application/json',
      description: 'Example resource',
    },
  ],
}));

// Read resources
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'example://data') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({ message: 'Hello from MCP server!' }, null, 2),
        },
      ],
    };
  }

  throw new Error(`Resource not found: ${uri}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
EOF
    
    # Replace SERVER_NAME placeholder
    sed -i.bak "s/SERVER_NAME/$SERVER_NAME/g" src/index.ts && rm src/index.ts.bak
    
    echo "  ✓ TypeScript server created"
    
elif [ "$LANGUAGE" = "python" ]; then
    echo "📝 Setting up Python MCP server..."
    
    # Create main server file
    cat > server.py << 'EOF'
#!/usr/bin/env python3
"""MCP server for SERVER_NAME"""

from mcp.server.fastmcp import FastMCP

# Create server
mcp = FastMCP("SERVER_NAME")

@mcp.tool()
def example_tool(message: str) -> str:
    """An example tool that demonstrates the pattern.
    
    Args:
        message: A message to process
    
    Returns:
        The processed message
    """
    return f"Processed message: {message}"

@mcp.resource("example://data")
def get_example_data() -> str:
    """Returns example data."""
    return '{"message": "Hello from MCP server!"}'

if __name__ == "__main__":
    mcp.run()
EOF
    
    # Replace SERVER_NAME placeholder
    sed -i.bak "s/SERVER_NAME/$SERVER_NAME/g" server.py && rm server.py.bak
    chmod +x server.py
    
    # Create requirements.txt
    cat > requirements.txt << 'EOF'
mcp>=1.0.0
EOF
    
    echo "  ✓ Python server created"
fi

# Create README
cat > README.md << EOF
# $SERVER_NAME

MCP server for $SERVER_NAME functionality.

## Installation

\`\`\`bash
EOF

if [ "$LANGUAGE" = "typescript" ]; then
    cat >> README.md << 'EOF'
npm install
npm run build
```

## Development

```bash
# Build and watch
npm run watch

# Test with inspector
npm run inspector
```

## Usage

Add to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "SERVER_NAME": {
      "command": "node",
      "args": ["/absolute/path/to/build/index.js"]
    }
  }
}
```

## Tools

- `example_tool` - An example tool

## Resources

- `example://data` - Example data resource
EOF
else
    cat >> README.md << 'EOF'
pip install -r requirements.txt
```

## Development

```bash
# Run server
python server.py

# Test with inspector
mcp-inspector python server.py
```

## Usage

Add to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "SERVER_NAME": {
      "command": "python",
      "args": ["/absolute/path/to/server.py"]
    }
  }
}
```

## Tools

- `example_tool` - An example tool

## Resources

- `example://data` - Example data resource
EOF
fi

sed -i.bak "s/SERVER_NAME/$SERVER_NAME/g" README.md && rm README.md.bak

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
build/
*.pyc
__pycache__/
.env
.DS_Store
EOF

echo ""
echo "✨ MCP server created successfully!"
echo ""
echo "📁 Next steps:"
echo "   cd $SERVER_NAME"

if [ "$LANGUAGE" = "typescript" ]; then
    echo "   npm install"
    echo "   npm run build"
    echo "   npm run inspector  # Test your server"
else
    echo "   pip install -r requirements.txt"
    echo "   python server.py"
fi

echo ""
echo "📚 Reference: docs/MCP-SERVER-REFERENCE.md"
echo ""
