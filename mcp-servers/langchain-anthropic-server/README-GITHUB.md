# LangChain Anthropic MCP Server

[![npm version](https://img.shields.io/npm/v/@your-username/langchain-anthropic-mcp-server.svg)](https://www.npmjs.com/package/@your-username/langchain-anthropic-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🚀 **MCP server that exposes LangChain + Anthropic Claude capabilities as tools** - instantly generate production-ready RAG systems, Supabase vector stores, document ingestion pipelines, and more!

Perfect for use with **Cursor AI** or any MCP client.

---

## 🎯 What This Does

This MCP server provides **8 powerful code generation tools** for common LangChain patterns:

- ✅ **Supabase Vector Store** - Complete setup with SQL schema + TypeScript
- ✅ **RAG Chains** - Full retrieval-augmented generation with Claude
- ✅ **Document Ingestion** - Load and chunk Markdown/PDF/CSV/JSON
- ✅ **Conversational RAG** - Add conversation memory to your RAG
- ✅ **Hybrid Search** - Combine vector + keyword search
- ✅ **Multi-Query Retrieval** - Generate query variations for better recall
- ✅ **Extended Thinking** - Configure Claude's extended thinking mode
- ✅ **Package Setup** - Generate complete dependencies

---

## 🚀 Quick Start

### Installation for Cursor

Add to your Cursor `mcp.json`:

```json
{
  "mcpServers": {
    "langchain-anthropic": {
      "command": "npx",
      "args": [
        "-y",
        "@your-username/langchain-anthropic-mcp-server"
      ],
      "env": {}
    }
  }
}
```

**That's it!** Restart Cursor and start using it.

---

### Installation for Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%/Claude/claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "langchain-anthropic": {
      "command": "npx",
      "args": [
        "-y",
        "@your-username/langchain-anthropic-mcp-server"
      ]
    }
  }
}
```

---

## 💡 Usage

Once installed, ask your AI assistant:

```
"Use langchain-anthropic to setup a Supabase vector store"
"Use langchain-anthropic to create a RAG chain with Claude Sonnet"
"Use langchain-anthropic to generate PDF document ingestion code"
```

The AI will call the appropriate tool and return complete, production-ready code!

---

## 🛠️ Available Tools

### 1. setup_supabase_vectorstore

**Generate complete Supabase vector store setup**

**Includes:**
- SQL schema with pgvector extension
- Vector similarity search function
- Indexes for performance
- TypeScript implementation with LangChain
- Environment variable template

**Parameters:**
- `project_name` - Your project name (required)
- `table_name` - Vector table name (default: "documents")
- `embedding_model` - Model to use (default: "text-embedding-004")
- `dimension` - Vector dimension (default: 768)

**Example:**
```
"Setup a Supabase vector store for project 'AI-Docs' with table 'knowledge_base'"
```

---

### 2. create_rag_chain

**Generate complete RAG chain with Claude**

**Includes:**
- Vector store integration
- Claude model configuration
- Retrieval chain setup
- Prompt caching (90% cost savings)
- Source document tracking

**Parameters:**
- `vectorstore_type` - supabase | pinecone | chroma | in-memory
- `claude_model` - haiku | sonnet | opus
- `retriever_k` - Number of documents to retrieve (default: 5)
- `enable_caching` - Enable prompt caching (default: true)

**Example:**
```
"Create a RAG chain with Supabase and Claude Sonnet, retrieve 10 documents"
```

---

### 3. generate_document_ingestion

**Generate document ingestion pipeline**

**Includes:**
- Document loader for specified type
- Text splitting/chunking
- Embedding generation
- Vector store insertion
- Batch processing example

**Parameters:**
- `source_type` - markdown | pdf | text | json | csv (required)
- `chunk_size` - Characters per chunk (default: 1000)
- `chunk_overlap` - Overlap between chunks (default: 200)
- `embedding_model` - Embedding model (default: "text-embedding-004")

**Example:**
```
"Generate document ingestion for PDF files with 500 character chunks"
```

---

### 4. create_conversational_rag

**Generate conversational RAG with memory**

**Includes:**
- Conversation buffer/summary/window memory
- Context retention across queries
- Follow-up question handling
- LangChain memory integration

**Parameters:**
- `memory_type` - buffer | summary | buffer-window
- `claude_model` - Claude model to use

**Example:**
```
"Create conversational RAG with buffer memory and Claude Sonnet"
```

---

### 5. setup_hybrid_search

**Generate hybrid search (vector + keyword)**

**Includes:**
- SQL function combining vector + BM25 search
- TypeScript integration
- Weight configuration
- Performance optimization

**Parameters:**
- `vector_weight` - Weight for vector search (0-1, default: 0.7)
- `keyword_weight` - Weight for keyword search (0-1, default: 0.3)

**Example:**
```
"Setup hybrid search with 80% vector and 20% keyword weight"
```

---

### 6. create_multi_query_retriever

**Generate multi-query retriever for better recall**

**Includes:**
- Query variation generation
- Multi-query retrieval
- Result deduplication
- LangChain integration

**Parameters:**
- `num_queries` - Number of query variations (default: 3)

**Example:**
```
"Create multi-query retriever with 5 query variations"
```

---

### 7. setup_extended_thinking

**Generate extended thinking configuration**

**Includes:**
- Complexity calculation
- Conditional thinking activation
- Token budget management
- Cost optimization

**Parameters:**
- `thinking_budget` - Token budget (default: 8000)
- `complexity_threshold` - Activation threshold (default: 60)

**Example:**
```
"Setup extended thinking with 10000 token budget"
```

---

### 8. generate_package_setup

**Generate complete package.json setup**

**Includes:**
- All required dependencies
- TypeScript configuration
- Environment variables
- Quick start template

**Parameters:**
- `features` - Array: supabase | pdf | csv | streaming | caching

**Example:**
```
"Generate package setup with Supabase and PDF support"
```

---

## 📊 Real-World Examples

### Example 1: Complete RAG System from Scratch

**Prompt:**
```
"I need to build a RAG system for my documentation using Supabase. 
Use langchain-anthropic to set it up."
```

**AI will generate:**
1. Supabase SQL schema
2. RAG chain implementation
3. Document ingestion code
4. Complete package.json
5. Environment variable template

**Result:** Production-ready RAG system in minutes!

---

### Example 2: Add Conversational Capability

**Prompt:**
```
"I want to add conversation memory to my existing RAG system. 
Use langchain-anthropic to show me how."
```

**AI will generate:**
- Conversation memory setup
- Integration with existing RAG
- Follow-up question handling
- Memory management code

---

### Example 3: Optimize with Hybrid Search

**Prompt:**
```
"My vector search isn't finding exact terms. 
Use langchain-anthropic to add hybrid search."
```

**AI will generate:**
- SQL hybrid search function
- Weight balancing code
- Integration instructions
- Performance tuning guide

---

## 🎓 Benefits

### For Developers
- ✅ **Save hours** - No need to piece together documentation
- ✅ **Best practices** - All code follows LangChain patterns
- ✅ **Production ready** - Includes error handling, caching, optimization
- ✅ **Copy-paste ready** - Complete, working code every time

### For Teams
- ✅ **Consistent patterns** - Everyone uses the same approach
- ✅ **Faster onboarding** - New developers get working examples
- ✅ **Reduced errors** - Tested patterns reduce bugs

---

## 🔧 Development

### Local Installation

```bash
git clone https://github.com/YOUR_USERNAME/langchain-anthropic-mcp-server.git
cd langchain-anthropic-mcp-server
npm install
npm run build
```

### Testing Locally

```bash
npm run dev
```

### Publishing to NPM

```bash
npm version patch  # or minor, or major
npm publish
```

---

## 📚 Documentation

- **LangChain JS Docs:** https://js.langchain.com
- **Anthropic Docs:** https://docs.anthropic.com
- **Supabase Docs:** https://supabase.com/docs
- **MCP Protocol:** https://modelcontextprotocol.io

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## ⭐ Star This Repo

If this MCP server helped you, please star the repo and share with others!

---

## 🐛 Issues & Support

Found a bug or need help?

- **Issues:** https://github.com/YOUR_USERNAME/langchain-anthropic-mcp-server/issues
- **Discussions:** https://github.com/YOUR_USERNAME/langchain-anthropic-mcp-server/discussions

---

## 🎉 Success Stories

Using this MCP server in production? [Share your story!](https://github.com/YOUR_USERNAME/langchain-anthropic-mcp-server/discussions)

---

**Built with ❤️ for the LangChain and MCP community**

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Compatibility:** Node.js 18+, Cursor, Claude Desktop, any MCP client
