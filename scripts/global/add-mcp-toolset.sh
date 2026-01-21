#!/bin/bash
# MCP Toolset Setup Script (Unix/Linux/macOS)
# 
# Adds MCP toolset support to any Node.js/TypeScript project
# Usage: ./add-mcp-toolset.sh

set -e

echo "🚀 MCP Toolset Setup"
echo "===================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in a Node.js project
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the root of a Node.js project"
    exit 1
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install @langchain/anthropic @langchain/core

echo ""
echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p src/services
mkdir -p templates
mkdir -p docs

echo ""
echo -e "${BLUE}📄 Downloading templates...${NC}"

# Template base URL (update this when deploying to GitHub)
GITHUB_BASE="https://raw.githubusercontent.com/YOUR_USERNAME/mcp-toolset-integration/main"
LOCAL_TEMPLATE_DIR="templates"

# Check if templates exist locally first (for development)
if [ -d "$LOCAL_TEMPLATE_DIR" ]; then
    echo -e "${YELLOW}Found local templates, copying...${NC}"
    cp "$LOCAL_TEMPLATE_DIR/McpToolsetService.ts" "src/services/McpToolsetService.ts"
    cp "$LOCAL_TEMPLATE_DIR/mcp-toolset-example.ts" "src/services/mcp-toolset-example.ts"
else
    # Download from GitHub
    echo "Downloading McpToolsetService.ts..."
    curl -sL "$GITHUB_BASE/templates/McpToolsetService.ts" -o "src/services/McpToolsetService.ts"
    
    echo "Downloading mcp-toolset-example.ts..."
    curl -sL "$GITHUB_BASE/templates/mcp-toolset-example.ts" -o "src/services/mcp-toolset-example.ts"
fi

# Download documentation
if [ -f "docs/MCP-TOOLSET-GUIDE.md" ]; then
    echo -e "${YELLOW}MCP-TOOLSET-GUIDE.md already exists, skipping...${NC}"
else
    echo "Downloading MCP-TOOLSET-GUIDE.md..."
    if [ -d "docs" ] && [ -f "docs/MCP-TOOLSET-GUIDE.md" ]; then
        cp "docs/MCP-TOOLSET-GUIDE.md" "docs/MCP-TOOLSET-GUIDE.md"
    else
        curl -sL "$GITHUB_BASE/docs/MCP-TOOLSET-GUIDE.md" -o "docs/MCP-TOOLSET-GUIDE.md"
    fi
fi

echo ""
echo -e "${BLUE}🔧 Checking for ANTHROPIC_API_KEY...${NC}"

if [ -f ".env" ]; then
    if grep -q "ANTHROPIC_API_KEY" .env; then
        echo -e "${GREEN}✅ ANTHROPIC_API_KEY found in .env${NC}"
    else
        echo -e "${YELLOW}⚠️  ANTHROPIC_API_KEY not found in .env${NC}"
        echo "Add this line to your .env file:"
        echo "ANTHROPIC_API_KEY=your_api_key_here"
        echo ""
        echo "# Optional MCP server tokens" >> .env
        echo "# MCP_SERVER_TOKEN=your_token_here" >> .env
    fi
else
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
    echo "Creating .env.example..."
    cat > .env.example << 'EOF'
# Anthropic API Key (required)
ANTHROPIC_API_KEY=your_api_key_here

# Optional: MCP Server Tokens
# MCP_CALENDAR_TOKEN=your_calendar_token
# MCP_DATABASE_TOKEN=your_database_token
# MCP_GITHUB_TOKEN=your_github_token
EOF
    echo "Created .env.example - copy to .env and add your keys"
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📚 Next steps:"
echo "1. Read the guide: docs/MCP-TOOLSET-GUIDE.md"
echo "2. Set up your .env file with ANTHROPIC_API_KEY"
echo "3. Check examples: src/services/mcp-toolset-example.ts"
echo "4. Start using: import { McpToolsetService } from './services/McpToolsetService'"
echo ""
echo "🎯 Quick start:"
echo "const service = new McpToolsetService();"
echo "service.addServer('https://api.example.com/sse', 'example', token);"
echo "const response = await service.query('Your question');"
echo ""
echo -e "${BLUE}Happy coding! 🚀${NC}"
