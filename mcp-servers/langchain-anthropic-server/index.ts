#!/usr/bin/env node
/**
 * LangChain Anthropic MCP Server
 * 
 * Exposes LangChain capabilities as MCP tools:
 * - Supabase vector store setup
 * - RAG chain creation
 * - Document ingestion
 * - Vector search
 * - Claude integration
 * 
 * Use this MCP server in Cursor to quickly set up LangChain
 * features in any project.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Initialize server
const server = new Server(
  {
    name: "langchain-anthropic-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available LangChain tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "setup_supabase_vectorstore",
      description: "Generate code to set up Supabase as a vector store with LangChain. Returns TypeScript code ready to use.",
      inputSchema: {
        type: "object",
        properties: {
          project_name: {
            type: "string",
            description: "Name of the project",
          },
          table_name: {
            type: "string",
            description: "Name of the vector table in Supabase",
            default: "documents",
          },
          embedding_model: {
            type: "string",
            description: "Embedding model to use",
            enum: ["text-embedding-004", "text-embedding-3-small", "text-embedding-3-large"],
            default: "text-embedding-004",
          },
          dimension: {
            type: "number",
            description: "Vector dimension (768 for Gemini, 1536 for OpenAI)",
            default: 768,
          },
        },
        required: ["project_name"],
      },
    },
    {
      name: "create_rag_chain",
      description: "Generate a complete RAG chain with LangChain and Anthropic Claude. Returns TypeScript implementation.",
      inputSchema: {
        type: "object",
        properties: {
          vectorstore_type: {
            type: "string",
            description: "Type of vector store",
            enum: ["supabase", "pinecone", "chroma", "in-memory"],
            default: "supabase",
          },
          claude_model: {
            type: "string",
            description: "Claude model to use",
            enum: ["claude-haiku-4-5-20251001", "claude-sonnet-4-5-20250929", "claude-opus-4-5-20250929"],
            default: "claude-sonnet-4-5-20250929",
          },
          retriever_k: {
            type: "number",
            description: "Number of documents to retrieve",
            default: 5,
          },
          enable_caching: {
            type: "boolean",
            description: "Enable prompt caching (90% cost savings)",
            default: true,
          },
        },
        required: [],
      },
    },
    {
      name: "generate_document_ingestion",
      description: "Generate code for ingesting documents into a vector store with chunking and embedding.",
      inputSchema: {
        type: "object",
        properties: {
          source_type: {
            type: "string",
            description: "Type of documents to ingest",
            enum: ["markdown", "pdf", "text", "json", "csv"],
            default: "markdown",
          },
          chunk_size: {
            type: "number",
            description: "Chunk size in characters",
            default: 1000,
          },
          chunk_overlap: {
            type: "number",
            description: "Overlap between chunks",
            default: 200,
          },
          embedding_model: {
            type: "string",
            description: "Embedding model",
            default: "text-embedding-004",
          },
        },
        required: ["source_type"],
      },
    },
    {
      name: "create_conversational_rag",
      description: "Generate a conversational RAG system with memory that maintains context across multiple queries.",
      inputSchema: {
        type: "object",
        properties: {
          memory_type: {
            type: "string",
            description: "Type of conversation memory",
            enum: ["buffer", "summary", "buffer-window"],
            default: "buffer",
          },
          claude_model: {
            type: "string",
            description: "Claude model",
            default: "claude-sonnet-4-5-20250929",
          },
        },
        required: [],
      },
    },
    {
      name: "setup_hybrid_search",
      description: "Generate hybrid search setup combining vector similarity and keyword search (BM25).",
      inputSchema: {
        type: "object",
        properties: {
          vector_weight: {
            type: "number",
            description: "Weight for vector search (0-1)",
            default: 0.7,
          },
          keyword_weight: {
            type: "number",
            description: "Weight for keyword search (0-1)",
            default: 0.3,
          },
        },
        required: [],
      },
    },
    {
      name: "create_multi_query_retriever",
      description: "Generate a multi-query retriever that generates multiple search queries for better recall.",
      inputSchema: {
        type: "object",
        properties: {
          num_queries: {
            type: "number",
            description: "Number of query variations to generate",
            default: 3,
          },
        },
        required: [],
      },
    },
    {
      name: "setup_extended_thinking",
      description: "Generate code for extended thinking mode with Claude for complex reasoning tasks.",
      inputSchema: {
        type: "object",
        properties: {
          thinking_budget: {
            type: "number",
            description: "Token budget for thinking",
            default: 8000,
          },
          complexity_threshold: {
            type: "number",
            description: "Complexity score threshold to enable thinking (0-100)",
            default: 60,
          },
        },
        required: [],
      },
    },
    {
      name: "generate_package_setup",
      description: "Generate package.json dependencies and setup instructions for LangChain with Anthropic.",
      inputSchema: {
        type: "object",
        properties: {
          features: {
            type: "array",
            description: "Features to include",
            items: {
              type: "string",
              enum: ["supabase", "pdf", "csv", "streaming", "caching"],
            },
          },
        },
        required: [],
      },
    },
  ],
}));

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result = "";

    switch (name) {
      case "setup_supabase_vectorstore":
        result = generateSupabaseVectorStore(args as any);
        break;

      case "create_rag_chain":
        result = generateRAGChain(args as any);
        break;

      case "generate_document_ingestion":
        result = generateDocumentIngestion(args as any);
        break;

      case "create_conversational_rag":
        result = generateConversationalRAG(args as any);
        break;

      case "setup_hybrid_search":
        result = generateHybridSearch(args as any);
        break;

      case "create_multi_query_retriever":
        result = generateMultiQueryRetriever(args as any);
        break;

      case "setup_extended_thinking":
        result = generateExtendedThinking(args as any);
        break;

      case "generate_package_setup":
        result = generatePackageSetup(args as any);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Code Generators
 */

function generateSupabaseVectorStore(args: any) {
  const { project_name, table_name = "documents", embedding_model = "text-embedding-004", dimension = 768 } = args;

  return `# Supabase Vector Store Setup

## 1. Install Dependencies

\`\`\`bash
npm install @langchain/community @langchain/core @supabase/supabase-js
npm install @google/generative-ai  # For Gemini embeddings
\`\`\`

## 2. Database Schema (SQL)

\`\`\`sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE ${table_name} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding VECTOR(${dimension})
);

-- Create index for vector similarity search
CREATE INDEX ON ${table_name} 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function for similarity search
CREATE OR REPLACE FUNCTION match_${table_name}(
  query_embedding VECTOR(${dimension}),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ${table_name}.id,
    ${table_name}.content,
    ${table_name}.metadata,
    1 - (${table_name}.embedding <=> query_embedding) AS similarity
  FROM ${table_name}
  WHERE 1 - (${table_name}.embedding <=> query_embedding) > match_threshold
  ORDER BY ${table_name}.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
\`\`\`

## 3. TypeScript Implementation

\`\`\`typescript
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY!,
  modelName: "${embedding_model}",
});

// Create vector store
const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabase,
  tableName: "${table_name}",
  queryName: "match_${table_name}",
});

// Example: Add documents
await vectorStore.addDocuments([
  { pageContent: "Document text here", metadata: { source: "file.md" } },
]);

// Example: Search
const results = await vectorStore.similaritySearch("query text", 5);
console.log(results);
\`\`\`

## 4. Environment Variables

Add to \`.env\`:
\`\`\`env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_key
\`\`\`

## Next Steps
- Run the SQL schema in Supabase SQL Editor
- Install dependencies
- Add environment variables
- Test with the TypeScript code
`;
}

function generateRAGChain(args: any) {
  const {
    vectorstore_type = "supabase",
    claude_model = "claude-sonnet-4-5-20250929",
    retriever_k = 5,
    enable_caching = true,
  } = args;

  return `# RAG Chain with Claude

## Installation

\`\`\`bash
npm install @langchain/anthropic @langchain/core @langchain/community
\`\`\`

## Implementation

\`\`\`typescript
import { ChatAnthropic } from "@langchain/anthropic";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Initialize Claude
const llm = new ChatAnthropic({
  model: "${claude_model}",
  apiKey: process.env.ANTHROPIC_API_KEY!,
  temperature: 1.0,
});

// Create retriever from vector store
const retriever = vectorStore.asRetriever({
  k: ${retriever_k},
  searchType: "similarity",
});

// Define system prompt${enable_caching ? ' (with caching enabled)' : ''}
const systemPrompt = \`You are an AI assistant that answers questions based on the provided context.

<context>
{context}
</context>

Answer the user's question using ONLY the information from the context above.
If the context doesn't contain relevant information, say so clearly.\`;

const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemPrompt],
  ["human", "{input}"],
]);

// Create chains
const combineDocsChain = await createStuffDocumentsChain({
  llm,
  prompt,
});

const ragChain = await createRetrievalChain({
  retriever,
  combineDocsChain,
});

// Query the chain
const response = await ragChain.invoke({
  input: "Your question here",
});

console.log("Answer:", response.answer);
console.log("Source Documents:", response.context);
\`\`\`

${enable_caching ? `
## Cost Optimization with Caching

The system prompt above will be automatically cached by Claude, saving 90% on costs for repeated queries.

**Cache Behavior:**
- First query: Full cost
- Subsequent queries (within 5 min): 10% cost
- Savings: ~90% on cache hits

**Tips:**
- Keep context structure consistent
- Batch queries together
- Cache TTL is 5 minutes
` : ''}

## Environment Variables

\`\`\`env
ANTHROPIC_API_KEY=your_anthropic_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_key
\`\`\`
`;
}

function generateDocumentIngestion(args: any) {
  const {
    source_type = "markdown",
    chunk_size = 1000,
    chunk_overlap = 200,
    embedding_model = "text-embedding-004",
  } = args;

  const loaderMap: Record<string, string> = {
    markdown: `import { TextLoader } from "langchain/document_loaders/fs/text";

const loader = new TextLoader("path/to/file.md");
const docs = await loader.load();`,
    pdf: `import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const loader = new PDFLoader("path/to/file.pdf");
const docs = await loader.load();`,
    text: `import { TextLoader } from "langchain/document_loaders/fs/text";

const loader = new TextLoader("path/to/file.txt");
const docs = await loader.load();`,
    json: `import { JSONLoader } from "langchain/document_loaders/fs/json";

const loader = new JSONLoader("path/to/file.json", "/content");
const docs = await loader.load();`,
    csv: `import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";

const loader = new CSVLoader("path/to/file.csv");
const docs = await loader.load();`,
  };

  return `# Document Ingestion for ${source_type.toUpperCase()}

## Installation

\`\`\`bash
npm install @langchain/core @langchain/community
${source_type === 'pdf' ? 'npm install pdf-parse' : ''}
\`\`\`

## Implementation

\`\`\`typescript
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
${loaderMap[source_type] || loaderMap.text}

// Load documents
const docs = await loader.load();

// Split into chunks
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: ${chunk_size},
  chunkOverlap: ${chunk_overlap},
});

const splitDocs = await splitter.splitDocuments(docs);

// Initialize embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY!,
  modelName: "${embedding_model}",
});

// Add to vector store
await vectorStore.addDocuments(splitDocs);

console.log(\`Ingested \${splitDocs.length} chunks\`);
\`\`\`

## Batch Processing Multiple Files

\`\`\`typescript
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";

const directoryLoader = new DirectoryLoader(
  "path/to/directory",
  {
    ".md": (path) => new TextLoader(path),
    // Add more file types as needed
  }
);

const allDocs = await directoryLoader.load();
const splitDocs = await splitter.splitDocuments(allDocs);
await vectorStore.addDocuments(splitDocs);
\`\`\`
`;
}

function generateConversationalRAG(args: any) {
  const {
    memory_type = "buffer",
    claude_model = "claude-sonnet-4-5-20250929",
  } = args;

  return `# Conversational RAG with Memory

## Installation

\`\`\`bash
npm install @langchain/anthropic @langchain/core
\`\`\`

## Implementation

\`\`\`typescript
import { ChatAnthropic } from "@langchain/anthropic";
import { BufferMemory } from "langchain/memory";
import { ConversationalRetrievalQAChain } from "langchain/chains";

// Initialize Claude
const llm = new ChatAnthropic({
  model: "${claude_model}",
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Create memory
const memory = new BufferMemory({
  memoryKey: "chat_history",
  returnMessages: true,
});

// Create conversational chain
const chain = ConversationalRetrievalQAChain.fromLLM(
  llm,
  vectorStore.asRetriever(),
  {
    memory,
    returnSourceDocuments: true,
  }
);

// Example conversation
const response1 = await chain.invoke({
  question: "What is RAG?",
});
console.log("Answer:", response1.text);

// Follow-up question (uses conversation history)
const response2 = await chain.invoke({
  question: "How does it work?",  // "it" refers to RAG from previous question
});
console.log("Answer:", response2.text);
\`\`\`

## Memory Types

### Buffer Memory (Current)
Stores all messages in memory. Good for short conversations.

### Summary Memory
\`\`\`typescript
import { ConversationSummaryMemory } from "langchain/memory";

const memory = new ConversationSummaryMemory({
  llm,
  memoryKey: "chat_history",
});
\`\`\`
Summarizes conversation history. Good for long conversations.

### Buffer Window Memory
\`\`\`typescript
import { BufferWindowMemory } from "langchain/memory";

const memory = new BufferWindowMemory({
  k: 5,  // Keep last 5 exchanges
  memoryKey: "chat_history",
});
\`\`\`
Keeps only recent messages. Good for moderate conversations.
`;
}

function generateHybridSearch(args: any) {
  const {
    vector_weight = 0.7,
    keyword_weight = 0.3,
  } = args;

  return `# Hybrid Search (Vector + Keyword)

## Overview
Combines vector similarity search with keyword matching (BM25) for better retrieval.

## Installation

\`\`\`bash
npm install @langchain/community
\`\`\`

## Supabase SQL Setup

\`\`\`sql
-- Add text search column
ALTER TABLE documents ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

-- Create GIN index for full-text search
CREATE INDEX documents_fts_idx ON documents USING gin(fts);

-- Hybrid search function
CREATE OR REPLACE FUNCTION hybrid_search(
  query_text TEXT,
  query_embedding VECTOR(768),
  match_count INT,
  vector_weight FLOAT DEFAULT ${vector_weight},
  keyword_weight FLOAT DEFAULT ${keyword_weight}
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH vector_search AS (
    SELECT
      id,
      content,
      metadata,
      (1 - (embedding <=> query_embedding)) * vector_weight AS v_score
    FROM documents
    ORDER BY embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  keyword_search AS (
    SELECT
      id,
      content,
      metadata,
      ts_rank(fts, plainto_tsquery('english', query_text)) * keyword_weight AS k_score
    FROM documents
    WHERE fts @@ plainto_tsquery('english', query_text)
    LIMIT match_count * 2
  )
  SELECT
    COALESCE(v.id, k.id) AS id,
    COALESCE(v.content, k.content) AS content,
    COALESCE(v.metadata, k.metadata) AS metadata,
    (COALESCE(v.v_score, 0) + COALESCE(k.k_score, 0)) AS score
  FROM vector_search v
  FULL OUTER JOIN keyword_search k ON v.id = k.id
  ORDER BY score DESC
  LIMIT match_count;
END;
$$;
\`\`\`

## TypeScript Usage

\`\`\`typescript
// Custom retriever using hybrid search
class HybridRetriever extends BaseRetriever {
  async _getRelevantDocuments(query: string) {
    // Get embedding
    const embedding = await embeddings.embedQuery(query);
    
    // Call hybrid search function
    const { data, error } = await supabase.rpc("hybrid_search", {
      query_text: query,
      query_embedding: embedding,
      match_count: 5,
      vector_weight: ${vector_weight},
      keyword_weight: ${keyword_weight},
    });
    
    if (error) throw error;
    
    return data.map((doc: any) => ({
      pageContent: doc.content,
      metadata: doc.metadata,
    }));
  }
}

// Use in RAG chain
const retriever = new HybridRetriever();
const chain = await createRetrievalChain({ retriever, combineDocsChain });
\`\`\`

## Weight Tuning

**Current weights:** Vector=${vector_weight}, Keyword=${keyword_weight}

- **High vector weight (0.8-0.9):** Better for semantic/conceptual queries
- **Balanced (0.5-0.7):** Good default for mixed queries
- **High keyword weight (0.8-0.9):** Better for exact phrase matching

Test with your data and adjust!
`;
}

function generateMultiQueryRetriever(args: any) {
  const { num_queries = 3 } = args;

  return `# Multi-Query Retriever

## Overview
Generates multiple query variations to improve retrieval recall.

## Installation

\`\`\`bash
npm install @langchain/anthropic @langchain/core
\`\`\`

## Implementation

\`\`\`typescript
import { ChatAnthropic } from "@langchain/anthropic";
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";

const llm = new ChatAnthropic({
  model: "claude-haiku-4-5-20251001",  // Use cheap model for query generation
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const retriever = MultiQueryRetriever.fromLLM({
  llm,
  retriever: vectorStore.asRetriever(),
  queryCount: ${num_queries},
});

// Generates ${num_queries} query variations and retrieves docs for each
const docs = await retriever.getRelevantDocuments("Original query");
console.log(\`Retrieved \${docs.length} unique documents\`);
\`\`\`

## How It Works

**Original Query:** "What is Claude's context window?"

**Generated Variations:**
1. "Claude AI model maximum context length"
2. "How many tokens can Claude process?"
3. "Claude context window size specifications"

Each variation retrieves documents, then all results are deduplicated.

## Benefits
- **Better recall:** Catches documents that might be missed by a single query
- **Semantic diversity:** Different phrasings match different document styles
- **Robust:** Less sensitive to query phrasing

## Cost Optimization
Use Haiku for query generation (shown above) - it's 10x cheaper than Sonnet!
`;
}

function generateExtendedThinking(args: any) {
  const {
    thinking_budget = 8000,
    complexity_threshold = 60,
  } = args;

  return `# Extended Thinking with Claude

## Overview
Enable Claude's extended thinking for complex reasoning tasks.

## Implementation

\`\`\`typescript
import { ChatAnthropic } from "@langchain/anthropic";

// Calculate query complexity
function calculateComplexity(query: string): number {
  let score = 0;
  const wordCount = query.split(/\\s+/).length;
  
  // Length factor
  if (wordCount > 50) score += 20;
  else if (wordCount > 30) score += 10;
  
  // Complexity keywords
  const complexKeywords = [
    "analyze", "compare", "explain", "evaluate", "synthesize",
    "design", "architect", "optimize", "strategic"
  ];
  complexKeywords.forEach(kw => {
    if (query.toLowerCase().includes(kw)) score += 5;
  });
  
  // Question depth
  const questionMarks = (query.match(/\\?/g) || []).length;
  if (questionMarks > 2) score += 10;
  
  return Math.min(score, 100);
}

// Create LLM with conditional extended thinking
async function queryWithThinking(query: string, context: string) {
  const complexity = calculateComplexity(query);
  const useThinking = complexity >= ${complexity_threshold};
  
  const llm = new ChatAnthropic({
    model: "claude-sonnet-4-5-20250929",
    apiKey: process.env.ANTHROPIC_API_KEY!,
    temperature: 1.0,
    ...(useThinking && {
      thinking: {
        type: "enabled",
        budget_tokens: ${thinking_budget},
      },
    }),
  });
  
  const response = await llm.invoke([
    {
      role: "system",
      content: \`Answer based on this context:\\n\\n\${context}\`,
    },
    {
      role: "user",
      content: query,
    },
  ]);
  
  return {
    answer: response.content,
    complexity,
    usedThinking: useThinking,
  };
}

// Usage
const result = await queryWithThinking(
  "Complex multi-part question requiring deep analysis...",
  contextFromVectorStore
);

console.log(\`Complexity: \${result.complexity}/100\`);
console.log(\`Used thinking: \${result.usedThinking}\`);
console.log(\`Answer: \${result.answer}\`);
\`\`\`

## When Extended Thinking Activates

**Current threshold:** ${complexity_threshold}/100

- **< ${complexity_threshold}:** Standard mode
- **>= ${complexity_threshold}:** Extended thinking enabled

## Cost Impact

- **Without thinking:** ~$0.003 per query (Sonnet)
- **With thinking:** ~$0.020 per query (Sonnet + thinking)
- **Use case:** Complex analysis, multi-step reasoning, strategic decisions

## Thinking Budget

**Current budget:** ${thinking_budget} tokens

- Small tasks: 2,000-4,000 tokens
- Medium tasks: 4,000-8,000 tokens  
- Large tasks: 8,000-16,000 tokens

Higher budget = more thorough reasoning = higher cost
`;
}

function generatePackageSetup(args: any) {
  const { features = [] } = args;

  const baseDeps = {
    "@langchain/anthropic": "^1.3.0",
    "@langchain/core": "^1.1.0",
    "@langchain/community": "^1.1.0",
    "@langchain/textsplitters": "^1.0.0",
  };

  const featureDeps: Record<string, Record<string, string>> = {
    supabase: {
      "@supabase/supabase-js": "^2.45.0",
      "@langchain/google-genai": "^2.1.0",
    },
    pdf: {
      "pdf-parse": "^1.1.1",
    },
    csv: {
      "csv-parse": "^5.5.6",
    },
    streaming: {},
    caching: {},
  };

  let allDeps = { ...baseDeps };
  features.forEach((feature: string) => {
    allDeps = { ...allDeps, ...featureDeps[feature] };
  });

  return `# LangChain + Anthropic Setup

## Installation

\`\`\`bash
npm install ${Object.keys(allDeps).join(" ")}
\`\`\`

## package.json Dependencies

\`\`\`json
{
  "dependencies": ${JSON.stringify(allDeps, null, 2)}
}
\`\`\`

## Environment Variables

Create \`.env\` file:

\`\`\`env
# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

${features.includes("supabase") ? `# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

# Embeddings (Gemini)
GEMINI_API_KEY=your_gemini_api_key
` : ''}
\`\`\`

## TypeScript Configuration

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
\`\`\`

## Quick Start Template

\`\`\`typescript
import { ChatAnthropic } from "@langchain/anthropic";
${features.includes("supabase") ? `import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";` : ''}

// Initialize Claude
const llm = new ChatAnthropic({
  model: "claude-sonnet-4-5-20250929",
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

${features.includes("supabase") ? `
// Initialize Supabase + Embeddings
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY!,
  modelName: "text-embedding-004",
});

const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabase,
  tableName: "documents",
  queryName: "match_documents",
});
` : ''}

// Your code here
console.log("LangChain + Anthropic ready!");
\`\`\`

## Next Steps

1. Install dependencies: \`npm install\`
2. Create \`.env\` file with API keys
3. ${features.includes("supabase") ? "Run Supabase schema setup" : "Start coding!"}
4. Test with the quick start template

${features.includes("supabase") ? `
## Supabase Schema

Use the \`setup_supabase_vectorstore\` tool to generate the SQL schema.
` : ''}
`;
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("LangChain Anthropic MCP Server running");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
