# GitHub Deployment Guide

This guide shows you how to deploy the MCP Toolset Integration to GitHub for public sharing.

## 📋 Prerequisites

- GitHub account
- Git installed locally
- Repository name chosen (e.g., `mcp-toolset-integration`)

## 🚀 Step-by-Step Deployment

### 1. Create GitHub Repository

**Option A: Via GitHub Website**

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `mcp-toolset-integration`
3. Description: "Universal MCP toolset support for Claude via LangChain"
4. Public repository (recommended for sharing)
5. ✅ Add README
6. ✅ Add .gitignore (Node)
7. ✅ Choose license: MIT
8. Click "Create repository"

**Option B: Via GitHub CLI**

```bash
gh repo create mcp-toolset-integration --public --description "Universal MCP toolset support for Claude via LangChain" --license mit
```

### 2. Prepare Files for Deployment

Create the repository structure:

```bash
mkdir mcp-toolset-integration
cd mcp-toolset-integration

# Initialize git (if not already done)
git init
```

### 3. Copy Files from NIGEL Project

From your NIGEL project root, copy these files:

```bash
# Core files
cp templates/McpToolsetService.ts ./templates/
cp templates/mcp-toolset-example.ts ./templates/

# Scripts
cp scripts/global/add-mcp-toolset.sh ./scripts/
cp scripts/global/add-mcp-toolset.bat ./scripts/

# Documentation
cp docs/MCP-TOOLSET-GUIDE.md ./docs/
cp MCP-TOOLSET-README.md ./README.md

# Configuration files
cp mcp-toolset-package.json ./package.json
cp mcp-toolset-gitignore ./.gitignore
cp mcp-toolset-env-example ./.env.example
```

### 4. Update Repository URLs

Edit these files to replace `YOUR_USERNAME` with your GitHub username:

**File: `README.md`**
```markdown
# Replace all instances of:
YOUR_USERNAME
# With your actual GitHub username, e.g.:
yourusername
```

**File: `scripts/add-mcp-toolset.sh`**
```bash
# Line ~33
GITHUB_BASE="https://raw.githubusercontent.com/YOUR_USERNAME/mcp-toolset-integration/main"
# Change to:
GITHUB_BASE="https://raw.githubusercontent.com/yourusername/mcp-toolset-integration/main"
```

**File: `scripts/add-mcp-toolset.bat`**
```batch
REM Line ~39
set GITHUB_BASE=https://raw.githubusercontent.com/YOUR_USERNAME/mcp-toolset-integration/main
REM Change to:
set GITHUB_BASE=https://raw.githubusercontent.com/yourusername/mcp-toolset-integration/main
```

**File: `package.json`**
```json
{
  "repository": {
    "url": "https://github.com/YOUR_USERNAME/mcp-toolset-integration.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/mcp-toolset-integration/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/mcp-toolset-integration#readme"
}
```

### 5. Commit and Push

```bash
# Make scripts executable
chmod +x scripts/add-mcp-toolset.sh

# Stage all files
git add .

# Initial commit
git commit -m "Initial release: MCP Toolset Integration v1.0"

# Add remote (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/mcp-toolset-integration.git

# Push to GitHub
git push -u origin main
```

### 6. Create Release (Optional but Recommended)

**Via GitHub Website:**

1. Go to your repository
2. Click "Releases" → "Create a new release"
3. Tag: `v1.0.0`
4. Title: `v1.0.0 - Initial Release`
5. Description:
```markdown
## 🎉 Initial Release

Universal MCP toolset integration for Claude via LangChain.

### Features
- ✅ Easy one-command setup
- ✅ Multiple MCP server support
- ✅ Allowlist/denylist configurations
- ✅ Cost optimization with deferred loading
- ✅ TypeScript support
- ✅ Production-ready security

### Installation

**Unix/Linux/macOS:**
```bash
curl -sL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-toolset-integration/main/scripts/add-mcp-toolset.sh | bash
```

**Windows:**
```powershell
curl -sL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-toolset-integration/main/scripts/add-mcp-toolset.bat -o add-mcp-toolset.bat && add-mcp-toolset.bat
```

See [README.md](README.md) for full documentation.
```

6. Click "Publish release"

### 7. Verify Installation Works

Test the public installation:

```bash
# In a new directory (not your NIGEL project)
mkdir test-mcp-install
cd test-mcp-install
npm init -y

# Run your installation script
curl -sL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-toolset-integration/main/scripts/add-mcp-toolset.sh | bash

# Verify files created
ls -la src/services/
ls -la docs/
```

## 📦 Repository Structure

After deployment, your repository should look like:

```
mcp-toolset-integration/
├── templates/
│   ├── McpToolsetService.ts
│   └── mcp-toolset-example.ts
├── scripts/
│   ├── add-mcp-toolset.sh
│   └── add-mcp-toolset.bat
├── docs/
│   └── MCP-TOOLSET-GUIDE.md
├── .gitignore
├── .env.example
├── package.json
├── README.md
└── LICENSE (MIT)
```

## 🎨 Customize Repository

### Add Topics

Go to repository settings and add topics:
- `mcp`
- `model-context-protocol`
- `claude`
- `anthropic`
- `langchain`
- `typescript`
- `ai-tools`

### Enable GitHub Pages (Optional)

1. Settings → Pages
2. Source: Deploy from branch
3. Branch: `main` → `/docs`
4. Your guide will be available at: `https://YOUR_USERNAME.github.io/mcp-toolset-integration/`

### Add Badges to README

```markdown
[![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/mcp-toolset-integration?style=social)](https://github.com/YOUR_USERNAME/mcp-toolset-integration)
[![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/mcp-toolset-integration?style=social)](https://github.com/YOUR_USERNAME/mcp-toolset-integration/fork)
[![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/mcp-toolset-integration)](https://github.com/YOUR_USERNAME/mcp-toolset-integration/issues)
```

## 📣 Share Your Work

### 1. Social Media

Share on:
- Twitter/X with hashtags: `#MCP #Claude #LangChain #AI`
- LinkedIn
- Reddit: r/LangChain, r/ClaudeAI
- Discord: LangChain community

### 2. Submit to Awesome Lists

- [Awesome MCP](https://github.com/modelcontextprotocol/awesome-mcp)
- [Awesome LangChain](https://github.com/kyrolabs/awesome-langchain)
- [Awesome Claude](https://github.com/anthropics/awesome-claude)

### 3. Write Blog Post

Publish a blog post explaining:
- What problem this solves
- How to use it
- Real-world examples
- Link to your GitHub repo

### 4. Create Video Tutorial

YouTube tutorial showing:
- Installation
- Basic usage
- Real examples
- Link in description

## 🔄 Future Updates

### Update Process

1. Make changes in your local repository
2. Update version in `package.json`
3. Commit and push
4. Create new release on GitHub

```bash
# Update files
git add .
git commit -m "Update: description of changes"
git push

# Tag new version
git tag v1.1.0
git push --tags
```

### Versioning

Follow semantic versioning:
- **Major** (v2.0.0): Breaking changes
- **Minor** (v1.1.0): New features, backward compatible
- **Patch** (v1.0.1): Bug fixes

## 🤝 Enable Contributions

### Create CONTRIBUTING.md

```markdown
# Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Setup

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/mcp-toolset-integration.git
cd mcp-toolset-integration
npm install
\`\`\`

## Code Style

- TypeScript strict mode
- ESLint for linting
- Prettier for formatting

## Testing

\`\`\`bash
npm test
\`\`\`
```

### Enable Issues

Settings → Features → ✅ Issues

### Create Issue Templates

`.github/ISSUE_TEMPLATE/bug_report.md`
`.github/ISSUE_TEMPLATE/feature_request.md`

## ✅ Post-Deployment Checklist

- [ ] Repository is public
- [ ] README has correct URLs (no YOUR_USERNAME)
- [ ] Scripts have correct GitHub URLs
- [ ] LICENSE file present (MIT)
- [ ] .env.example created
- [ ] Installation script tested
- [ ] Release created (v1.0.0)
- [ ] Topics added
- [ ] Badges added to README
- [ ] Shared on social media
- [ ] Submitted to awesome lists

## 🎉 You're Done!

Your MCP Toolset Integration is now public and ready to share with the world!

**Repository URL:** `https://github.com/YOUR_USERNAME/mcp-toolset-integration`

**Installation Command:**
```bash
curl -sL https://raw.githubusercontent.com/YOUR_USERNAME/mcp-toolset-integration/main/scripts/add-mcp-toolset.sh | bash
```

Now anyone can add MCP toolset support to their Claude projects in one command! 🚀
