# LangChain Anthropic MCP Server

**Expose LangChain + Anthropic capabilities as MCP tools** - Use in Cursor AI or any MCP client to quickly set up RAG, vector stores, document ingestion, and more!

## 🎯 What This Does

This MCP server gives you instant access to code generators for common LangChain patterns:

- ✅ Supabase vector store setup (schema + code)
- ✅ RAG chain creation with Claude
- ✅ Document ingestion (Markdown, PDF, CSV, etc.)
- ✅ Conversational RAG with memory
- ✅ Hybrid search (vector + keyword)
- ✅ Multi-query retrieval
- ✅ Extended thinking mode
- ✅ Package setup with dependencies

## 🚀 Quick Start

### 1. Install

```bash
cd mcp-servers/langchain-anthropic-server
npm install
npm run build
```

### 2. Add to Cursor's mcp.json

Add this to your `mcp.json` file:

```json
{
  "mcpServers": {
    "langchain-anthropic": {
      "command": "node",
      "args": [
        "C:/Users/MLPC/.cursor/N.I.G.E.L/mcp-servers/langchain-anthropic-server/dist/index.js"
      ],
      "env": {}
    }
  }
}
```

### 3. Restart Cursor

Close and reopen Cursor for changes to take effect.

### 4. Use It!

In Cursor AI chat, ask:

```
"Use langchain-anthropic to set up a Supabase vector store"
"Use langchain-anthropic to create a RAG chain"
"Use langchain-anthropic to generate document ingestion code for PDF files"
```

## 🛠️ Available Tools

### 1. setup_supabase_vectorstore

**Generate complete Supabase vector store setup** including:
- SQL schema with pgvector
- TypeScript implementation
- Search functions
- Environment variables

**Parameters:**
- `project_name` - Name of your project
- `table_name` - Vector table name (default: "documents")
- `embedding_model` - Model to use (default: "text-embedding-004")
- `dimension` - Vector dimension (default: 768)

**Example:**
```
"Use langchain-anthropic to setup_supabase_vectorstore for project NIGEL with table name knowledge_base"
```

---

### 2. create_rag_chain

**Generate complete RAG chain** with:
- Vector store integration
- Claude integration
- Prompt caching (90% cost savings)
- Source document tracking

**Parameters:**
- `vectorstore_type` - supabase | pinecone | chroma | in-memory
- `claude_model` - Which Claude model to use
- `retriever_k` - Number of documents to retrieve
- `enable_caching` - Enable prompt caching (default: true)

**Example:**
```
"Use langchain-anthropic to create_rag_chain with Supabase and Claude Sonnet"
```

---

### 3. generate_document_ingestion

**Generate document ingestion pipeline** with:
- Document loading
- Text splitting/chunking
- Embedding generation
- Vector store insertion

**Parameters:**
- `source_type` - markdown | pdf | text | json | csv
- `chunk_size` - Chunk size in characters (default: 1000)
- `chunk_overlap` - Overlap between chunks (default: 200)
- `embedding_model` - Embedding model to use

**Example:**
```
"Use langchain-anthropic to generate_document_ingestion for PDF files with 500 character chunks"
```

---

### 4. create_conversational_rag

**Generate conversational RAG with memory** that:
- Maintains conversation context
- Handles follow-up questions
- Remembers previous interactions

**Parameters:**
- `memory_type` - buffer | summary | buffer-window
- `claude_model` - Claude model to use

**Example:**
```
"Use langchain-anthropic to create_conversational_rag with buffer memory"
```

---

### 5. setup_hybrid_search

**Generate hybrid search setup** combining:
- Vector similarity search
- Keyword search (BM25/full-text)
- Weighted score combination

**Parameters:**
- `vector_weight` - Weight for vector search (0-1, default: 0.7)
- `keyword_weight` - Weight for keyword search (0-1, default: 0.3)

**Example:**
```
"Use langchain-anthropic to setup_hybrid_search with 80% vector and 20% keyword"
```

---

### 6. create_multi_query_retriever

**Generate multi-query retriever** that:
- Creates multiple query variations
- Retrieves docs for each variation
- Deduplicates results
- Improves recall

**Parameters:**
- `num_queries` - Number of query variations (default: 3)

**Example:**
```
"Use langchain-anthropic to create_multi_query_retriever with 5 query variations"
```

---

### 7. setup_extended_thinking

**Generate extended thinking setup** for:
- Complex reasoning tasks
- Multi-step analysis
- Strategic decisions

**Parameters:**
- `thinking_budget` - Token budget for thinking (default: 8000)
- `complexity_threshold` - When to enable thinking (0-100, default: 60)

**Example:**
```
"Use langchain-anthropic to setup_extended_thinking with 10000 token budget"
```

---

### 8. generate_package_setup

**Generate complete package setup** including:
- package.json dependencies
- Environment variable template
- TypeScript configuration
- Quick start code

**Parameters:**
- `features` - Array of features: supabase | pdf | csv | streaming | caching

**Example:**
```
"Use langchain-anthropic to generate_package_setup with supabase and pdf support"
```

---

## 💡 Usage Examples

### Example 1: Set Up RAG from Scratch

**You ask Cursor AI:**
```
"I need to set up a RAG system for NIGEL using Supabase. Can you help?"
```

**Cursor AI will:**
1. Use `setup_supabase_vectorstore` to generate SQL schema
2. Use `create_rag_chain` to generate the RAG implementation
3. Use `generate_package_setup` to show dependencies
4. Provide complete, ready-to-use code

---

### Example 2: Add Document Ingestion

**You ask:**
```
"I need to ingest PDF documents into my vector store"
```

**Cursor AI will:**
1. Use `generate_document_ingestion` with source_type="pdf"
2. Generate complete ingestion pipeline
3. Show how to batch process multiple files
4. Include chunking and embedding code

---

### Example 3: Upgrade to Hybrid Search

**You ask:**
```
"How do I add hybrid search to my existing RAG system?"
```

**Cursor AI will:**
1. Use `setup_hybrid_search` to generate SQL functions
2. Show TypeScript implementation
3. Explain weight tuning
4. Provide integration code

---

## 🎓 Benefits

### For You
- ✅ **Instant code generation** - No memorizing LangChain APIs
- ✅ **Best practices built-in** - Caching, cost optimization, error handling
- ✅ **Complete examples** - SQL + TypeScript + config
- ✅ **Production ready** - All code is tested and optimized

### For Cursor AI
- ✅ **Consistent patterns** - Generates standardized code
- ✅ **Up-to-date** - Always uses latest LangChain patterns
- ✅ **Context-aware** - Adapts to your specific needs

---

## 🔧 Customization

All generated code is fully customizable. The MCP server provides a starting point - you can modify:
- Models and parameters
- Chunking strategies
- Search algorithms
- Prompt templates
- Cost optimization settings

---

## 📊 Real-World Workflow

```
You: "I want to build a RAG system for my documentation"

Cursor AI (using this MCP server):
1. Generates Supabase schema
2. Creates RAG chain with Claude Sonnet
3. Shows document ingestion code
4. Adds hybrid search
5. Configures prompt caching
6. Provides complete package.json

Result: Complete, production-ready RAG system in minutes!
```

---

## 🐛 Troubleshooting

### Server not appearing in Cursor

1. Check path in `mcp.json` is absolute
2. Verify `npm run build` completed successfully
3. Restart Cursor
4. Check Cursor MCP logs

### Generated code has errors

The server generates code templates - you'll need to:
- Fill in your actual API keys
- Adjust file paths
- Install dependencies
- Run SQL schema in Supabase

---

## 📚 Learn More

- **LangChain Docs:** https://js.langchain.com
- **Anthropic Docs:** https://docs.anthropic.com
- **Supabase Docs:** https://supabase.com/docs
- **MCP Protocol:** https://modelcontextprotocol.io

---

## 🎉 You're Ready!

Now when working on any project in Cursor, just ask me to use `langchain-anthropic` tools and I'll generate complete, production-ready code for you!

**Try it now:**
```
"Use langchain-anthropic to setup a complete RAG system"
```
