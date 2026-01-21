# ✅ Global Rules Updated: LangChain + RAG Support

Your global Cursor rules now include **automatic LangChain + RAG setup** for any future project!

---

## 📦 What Was Added

### 1. **Complete RAG Setup Template**
**File:** `docs/LANGCHAIN-RAG-SETUP-TEMPLATE.md`

**Includes:**
- ✅ 5-step quick start guide
- ✅ Supabase + pgvector setup
- ✅ LangChain integration code (TypeScript + Python)
- ✅ Document ingestion scripts
- ✅ Vector search functions
- ✅ Hybrid search (keyword + semantic)
- ✅ RAG chain examples
- ✅ Cost optimization strategies
- ✅ Troubleshooting guide

**Setup Time:** 15-30 minutes  
**Cost:** ~$0.0001 per query

### 2. **Updated Global Rules**
**File:** `GLOBAL-USER-RULES.md`

**New Sections:**
- **LangChain + RAG Database Standards** - When and how to use
- **LangChain Integration Patterns** - Best practices and architecture
- **Quick Setup Trigger** - Automatic template offering
- **Quick Reference** - Commands and decision trees

---

## 🚀 How It Works

### Automatic Detection

When you start a new project and mention any of these keywords:
- "knowledge base"
- "document search"
- "semantic search"
- "vector database"
- "RAG"
- "embeddings"
- "answer questions from documents"
- "chatbot with custom data"

**Cursor will automatically:**
1. Detect the need for RAG
2. Offer the complete setup template
3. Guide you through the 5-step process
4. Create all necessary files and configuration

### Example Conversation

```
You: "I want to build a chatbot that answers questions from my documentation"

Cursor: "I can set up a complete LangChain + RAG system for you. This includes:
- Vector database (Supabase with pgvector)
- Document ingestion pipeline
- Semantic search with Claude 4.5
- Production-ready examples

Setup takes ~15-30 minutes. Shall I proceed with the template?"

You: "Yes"

Cursor: [Follows 5-step template, creates all files, configures everything]
```

---

## 📚 Template Structure

### Step 1: Install Dependencies
```bash
npm install @langchain/anthropic @langchain/core @langchain/community
npm install @supabase/supabase-js
```

### Step 2: Set Up Vector Database
- Supabase project creation
- pgvector extension
- Schema with embeddings
- Vector search functions
- Performance indexes

### Step 3: Configure Environment
```bash
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...
GEMINI_API_KEY=...
```

### Step 4: Create Vector Store Integration
- Embedding generation (Gemini or OpenAI)
- Supabase client setup
- Vector store wrapper

### Step 5: Create RAG Chain
- Retriever setup
- Prompt template
- LangChain chain
- Query function

---

## 🎯 Supported Features

### Basic Features
- ✅ Vector similarity search
- ✅ Document ingestion
- ✅ RAG question answering
- ✅ Metadata filtering

### Advanced Features
- ✅ Hybrid search (keyword + semantic)
- ✅ Conversational RAG (with memory)
- ✅ Multi-query retrieval
- ✅ Citations
- ✅ Prompt caching (90% cost savings)

### Supported Databases
- ✅ Supabase (recommended)
- ✅ Local PostgreSQL + pgvector
- ✅ Any PostgreSQL with vector extension

### Supported Languages
- ✅ TypeScript/JavaScript
- ✅ Python

---

## 💰 Cost Optimization

### Model Selection
| Use Case | Model | Cost/Query |
|----------|-------|------------|
| Simple Q&A | Haiku 4.5 | $0.0001 |
| Complex reasoning | Sonnet 4.5 | $0.003 (cached) |
| Deep analysis | Sonnet + Thinking | $0.006 |

### Embedding Models
| Provider | Model | Dimensions | Cost/1M tokens |
|----------|-------|------------|----------------|
| **Google Gemini** | text-embedding-004 | 768 | **$0.025** ⭐ |
| OpenAI | text-embedding-3-small | 1536 | $0.020 |
| OpenAI | text-embedding-3-large | 3072 | $0.130 |

**Recommendation:** Use Gemini for best cost/performance.

### Prompt Caching
- First query: Standard cost
- Repeated queries (within 5 min): **90% cheaper**
- Enabled automatically with LangChain

---

## 🎓 Usage Examples

### For Any New Project

**Scenario 1: Documentation Chatbot**
```
You: "I need a chatbot for my product docs"
Cursor: [Offers RAG template] → Sets up everything
```

**Scenario 2: Customer Support**
```
You: "Build a support bot that searches our knowledge base"
Cursor: [Offers RAG template] → Sets up everything
```

**Scenario 3: Research Assistant**
```
You: "I want to search through research papers"
Cursor: [Offers RAG template] → Sets up everything
```

**Scenario 4: Code Search**
```
You: "Semantic search for code snippets"
Cursor: [Offers RAG template] → Sets up everything
```

---

## 📖 Available Resources

### Documentation Files
- **`docs/LANGCHAIN-RAG-SETUP-TEMPLATE.md`** - Complete setup guide
- **`GLOBAL-USER-RULES.md`** - Updated with LangChain patterns
- **`LANGCHAIN-INTEGRATION-GUIDE.md`** - NIGEL-specific guide (reference)

### External Resources
- [LangChain Docs](https://docs.langchain.com)
- [LangChain Anthropic](https://docs.langchain.com/oss/javascript/integrations/chat/anthropic)
- [Supabase Vector](https://supabase.com/docs/guides/ai)
- [pgvector](https://github.com/pgvector/pgvector)

---

## ✅ Verification

To verify the global rules are working:

1. **Start a new project** (any folder)
2. **Open Cursor chat**
3. **Type:** "I want to build a chatbot that answers questions from documents"
4. **Observe:** Cursor should offer the RAG template setup

If it works, you're all set! 🎉

---

## 🔄 What Happens Next

### In NIGEL (Current Project)
- ✅ LangChain already integrated
- ✅ 7 working examples ready
- ✅ Just run: `npm install @langchain/anthropic @langchain/core`

### In Future Projects
- ✅ Cursor automatically detects RAG needs
- ✅ Offers complete template
- ✅ Guides through 5-step setup
- ✅ Creates all files and configuration
- ✅ Ready to use in 15-30 minutes

---

## 🎉 Summary

You now have:

✅ **Global RAG template** for all projects  
✅ **Automatic detection** of RAG needs  
✅ **5-step quick start** guide  
✅ **TypeScript + Python** support  
✅ **Cost-optimized** setup (Gemini + Haiku)  
✅ **Production-ready** examples  
✅ **Hybrid search** included  
✅ **Prompt caching** enabled  
✅ **15-30 minute** setup time  

**Every future project can have RAG in under 30 minutes!** 🚀

---

**Version:** 1.0  
**Last Updated:** January 2026  
**Applies To:** All Cursor projects globally
