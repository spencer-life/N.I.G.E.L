#!/bin/bash
# Initialize a new project with all standard documentation

set -e

PROJECT_NAME=$1
PROJECT_TYPE=${2:-fullstack-web}

if [ -z "$PROJECT_NAME" ]; then
    echo "❌ Error: Project name required"
    echo "Usage: ./init-project.sh <project-name> [type]"
    echo "Types: fullstack-web, frontend-only, mcp-server, discord-bot"
    exit 1
fi

echo "🚀 Initializing project: $PROJECT_NAME"
echo "📦 Type: $PROJECT_TYPE"

# Create project directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Create docs folder with templates
mkdir -p docs
echo "📝 Creating documentation templates..."

# Copy templates from global docs folder
GLOBAL_DOCS="../docs"

if [ -d "$GLOBAL_DOCS" ]; then
    echo "✅ Found global docs, copying templates..."
    
    # Memory Bank
    if [ -f "$GLOBAL_DOCS/MEMORY-BANK-TEMPLATE.md" ]; then
        cp "$GLOBAL_DOCS/MEMORY-BANK-TEMPLATE.md" docs/MEMORY-BANK.md
        echo "  ✓ MEMORY-BANK.md"
    fi
    
    # SOP
    if [ -f "$GLOBAL_DOCS/SOP-TEMPLATE.md" ]; then
        cp "$GLOBAL_DOCS/SOP-TEMPLATE.md" docs/SOP.md
        echo "  ✓ SOP.md"
    fi
    
    # BRTD
    if [ -f "$GLOBAL_DOCS/BRTD-TEMPLATE.md" ]; then
        cp "$GLOBAL_DOCS/BRTD-TEMPLATE.md" docs/BRTD.md
        echo "  ✓ BRTD.md"
    fi
    
    # Test Plan
    if [ -f "$GLOBAL_DOCS/TEST-PLAN-TEMPLATE.md" ]; then
        cp "$GLOBAL_DOCS/TEST-PLAN-TEMPLATE.md" docs/TEST-PLAN.md
        echo "  ✓ TEST-PLAN.md"
    fi
    
    # User Personas
    if [ -f "$GLOBAL_DOCS/USER-PERSONAS-TEMPLATE.md" ]; then
        cp "$GLOBAL_DOCS/USER-PERSONAS-TEMPLATE.md" docs/USER-PERSONAS.md
        echo "  ✓ USER-PERSONAS.md"
    fi
fi

# Initialize git
echo "🔧 Initializing git repository..."
git init
echo "  ✓ Git initialized"

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
venv/
__pycache__/

# Build outputs
dist/
build/
*.pyc

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
.cursor/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/
EOF
echo "  ✓ .gitignore created"

# Create README
cat > README.md << EOF
# $PROJECT_NAME

## Overview
[Describe your project here]

## Tech Stack
- [List technologies]

## Setup
\`\`\`bash
# Installation steps
\`\`\`

## Documentation
- \`docs/MEMORY-BANK.md\` - Project context and state
- \`docs/SOP.md\` - Standard Operating Procedures
- \`docs/BRTD.md\` - Requirements tracking
- \`docs/TEST-PLAN.md\` - Testing strategy

## Development
\`\`\`bash
# Development commands
\`\`\`

## Deployment
See \`DEPLOYMENT.md\` for deployment instructions.
EOF
echo "  ✓ README.md created"

# Create project-specific structure based on type
case $PROJECT_TYPE in
    "fullstack-web")
        echo "🏗️  Setting up fullstack-web structure..."
        mkdir -p frontend/src/{components,pages,styles}
        mkdir -p backend/src/{routes,services,utils}
        mkdir -p mcp
        echo "  ✓ Frontend, backend, and MCP folders created"
        ;;
    
    "frontend-only")
        echo "🏗️  Setting up frontend-only structure..."
        mkdir -p src/{components,pages,styles,utils}
        echo "  ✓ Frontend structure created"
        ;;
    
    "mcp-server")
        echo "🏗️  Setting up MCP server structure..."
        mkdir -p src/{tools,resources,prompts}
        echo "  ✓ MCP server structure created"
        ;;
    
    "discord-bot")
        echo "🏗️  Setting up Discord bot structure..."
        mkdir -p src/{commands,interactions,services,utils,types}
        mkdir -p knowledge
        echo "  ✓ Discord bot structure created"
        ;;
    
    *)
        echo "⚠️  Unknown project type: $PROJECT_TYPE"
        echo "📁 Creating basic structure..."
        mkdir -p src
        ;;
esac

# Create TODO.md
cat > TODO.md << 'EOF'
# Project TODO

## Setup
- [ ] Initialize project dependencies
- [ ] Configure environment variables
- [ ] Set up database (if applicable)

## Development
- [ ] Implement core features
- [ ] Write tests
- [ ] Documentation

## Deployment
- [ ] Configure production environment
- [ ] Set up CI/CD
- [ ] Deploy

EOF
echo "  ✓ TODO.md created"

echo ""
echo "✨ Project initialized successfully!"
echo ""
echo "📂 Next steps:"
echo "   cd $PROJECT_NAME"
echo "   # Update docs/MEMORY-BANK.md with project details"
echo "   # Update docs/BRTD.md with requirements"
echo "   # Start implementing features"
echo ""
