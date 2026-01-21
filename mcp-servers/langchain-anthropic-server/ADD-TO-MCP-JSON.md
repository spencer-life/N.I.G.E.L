# Add LangChain Anthropic to Your mcp.json

## Step 1: Open Your mcp.json

Location: `c:\Users\MLPC\.cursor\mcp.json`

## Step 2: Add This Entry

Add this to the `mcpServers` object:

```json
"langchain-anthropic": {
  "command": "node",
  "args": [
    "C:/Users/MLPC/.cursor/N.I.G.E.L/mcp-servers/langchain-anthropic-server/dist/index.js"
  ],
  "env": {}
}
```

## Complete Example

Your mcp.json should look like this:

```json
{
  "mcpServers": {
    "langchain-anthropic": {
      "command": "node",
      "args": [
        "C:/Users/MLPC/.cursor/N.I.G.E.L/mcp-servers/langchain-anthropic-server/dist/index.js"
      ],
      "env": {}
    },
    "github": {
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer YOUR_GITHUB_TOKEN_HERE"
      }
    },
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=kcxfleqsqadtyfkujjlj&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cstorage%2Cbranching",
      "headers": {}
    }
    // ... other servers ...
  }
}
```

## Step 3: Restart Cursor

Close and reopen Cursor for the changes to take effect.

## Step 4: Test It!

In Cursor AI chat, try:

```
"Use langchain-anthropic to setup a Supabase vector store for my project"
```

I (Cursor AI) will then call the MCP server and generate complete code for you!

---

## What You'll Be Able to Do

Once installed, you can ask me:

### Setup Commands
- "Use langchain-anthropic to setup a Supabase vector store"
- "Use langchain-anthropic to create a RAG chain with Claude"
- "Use langchain-anthropic to generate document ingestion for PDFs"

### Specific Configurations
- "Use langchain-anthropic to create conversational RAG with buffer memory"
- "Use langchain-anthropic to setup hybrid search"
- "Use langchain-anthropic to create multi-query retriever"

### Package Management
- "Use langchain-anthropic to generate package setup with Supabase and PDF support"

---

## Available Tools

The MCP server exposes 8 tools:

1. **setup_supabase_vectorstore** - Complete Supabase vector store setup
2. **create_rag_chain** - RAG chain with Claude
3. **generate_document_ingestion** - Document loading and chunking
4. **create_conversational_rag** - RAG with conversation memory
5. **setup_hybrid_search** - Vector + keyword search
6. **create_multi_query_retriever** - Multi-query for better recall
7. **setup_extended_thinking** - Extended thinking configuration
8. **generate_package_setup** - Dependencies and setup

Each tool generates production-ready TypeScript code you can use immediately!

---

## Troubleshooting

### "MCP server not found"
- Check the path in `args` is correct and absolute
- Make sure you ran `npm run build` in the server directory
- Restart Cursor

### "Tool not available"
- Verify the server appears in Cursor's MCP server list
- Check Cursor's developer console for errors

---

## You're Ready!

After adding this to your mcp.json and restarting Cursor, I'll be able to generate complete LangChain + Anthropic code for any project instantly! 🚀
