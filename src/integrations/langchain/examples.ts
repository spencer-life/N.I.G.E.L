/**
 * LangChain Integration Examples for NIGEL
 * 
 * Based on official LangChain docs: https://docs.langchain.com/oss/javascript/integrations/chat/anthropic
 * 
 * These examples show how to use NIGEL's optimized vector store with LangChain
 * and Claude 4.5 models for advanced RAG patterns.
 * 
 * Prerequisites:
 * ```bash
 * npm install @langchain/anthropic @langchain/core
 * ```
 */

import { ChatAnthropic } from "@langchain/anthropic";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { SupabaseVectorStore } from "./SupabaseVectorStore.js";

/**
 * Example 1: Basic RAG with Claude Haiku 4.5
 * Uses prompt caching for 90% cost reduction on repeated queries
 */
export async function basicRAG(question: string) {
  // Initialize vector store
  const vectorStore = new SupabaseVectorStore();
  const retriever = vectorStore.asRetriever({ k: 5 });

  // Initialize Claude Haiku 4.5 (fast, cheap)
  const llm = new ChatAnthropic({
    model: "claude-haiku-4-5-20251001",
    temperature: 0,
    maxTokens: 4096,
    // Prompt caching enabled automatically for system prompts
  });

  // Create RAG prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are NIGEL, a behavioral engineering training instructor for S.P.A.R.K. methodology.
      
Use the following doctrine to answer questions. If the doctrine doesn't cover the topic, say so directly.

Doctrine:
{context}

Remember NIGEL's voice:
- Calm, surgical, slightly mischievous
- Direct and precise
- One subtle joke maximum
- No "OMG", "Let's gooo", or hype language`,
    ],
    ["human", "{question}"],
  ]);

  // Create RAG chain
  const chain = RunnableSequence.from([
    {
      context: async (input: { question: string }) => {
        const docs = await retriever.getRelevantDocuments(input.question);
        return docs.map((doc) => doc.pageContent).join("\n\n");
      },
      question: new RunnablePassthrough(),
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  // Invoke chain
  const response = await chain.invoke({ question });
  return response;
}

/**
 * Example 2: Hybrid Search RAG
 * Combines keyword + semantic search for better accuracy
 */
export async function hybridSearchRAG(question: string) {
  const vectorStore = new SupabaseVectorStore();
  
  // Use hybrid search retriever
  const retriever = {
    getRelevantDocuments: async (query: string) => {
      return vectorStore.hybridSearch(query, 5);
    },
  };

  const llm = new ChatAnthropic({
    model: "claude-haiku-4-5-20251001",
    temperature: 0,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are NIGEL. Use this doctrine to answer:\n\n{context}"],
    ["human", "{question}"],
  ]);

  const chain = RunnableSequence.from([
    {
      context: async (input: { question: string }) => {
        const docs = await retriever.getRelevantDocuments(input.question);
        return docs.map((doc) => doc.pageContent).join("\n\n");
      },
      question: new RunnablePassthrough(),
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  return await chain.invoke({ question });
}

/**
 * Example 3: Conversational RAG with Memory
 * Maintains conversation history for follow-up questions
 */
export async function conversationalRAG() {
  const vectorStore = new SupabaseVectorStore();
  const retriever = vectorStore.asRetriever({ k: 5 });

  const llm = new ChatAnthropic({
    model: "claude-haiku-4-5-20251001",
    temperature: 0,
  });

  // Simple in-memory conversation history
  const conversationHistory: Array<{ role: string; content: string }> = [];

  const askQuestion = async (question: string) => {
    // Retrieve relevant context
    const docs = await retriever.getRelevantDocuments(question);
    const context = docs.map((doc) => doc.pageContent).join("\n\n");

    // Build messages with history
    const messages = [
      {
        role: "system",
        content: `You are NIGEL. Use this doctrine:\n\n${context}`,
      },
      ...conversationHistory,
      { role: "user", content: question },
    ];

    // Get response
    const response = await llm.invoke(messages as any);
    const answer = typeof response.content === "string" 
      ? response.content 
      : response.content[0]?.text || "";

    // Update history
    conversationHistory.push(
      { role: "user", content: question },
      { role: "assistant", content: answer }
    );

    return answer;
  };

  return { askQuestion };
}

/**
 * Example 4: RAG with Extended Thinking (Sonnet 4.5)
 * For complex queries requiring deep reasoning
 */
export async function ragWithThinking(question: string) {
  const vectorStore = new SupabaseVectorStore();
  const retriever = vectorStore.asRetriever({ k: 10 }); // More context for complex queries

  // Use Sonnet 4.5 with extended thinking
  const llm = new ChatAnthropic({
    model: "claude-sonnet-4-5-20250929",
    temperature: 0,
    maxTokens: 16000,
    // Extended thinking can be enabled via clientOptions
    clientOptions: {
      defaultHeaders: {
        "anthropic-beta": "extended-thinking-2025-01-01",
      },
    },
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are NIGEL. Analyze this doctrine deeply and provide a comprehensive answer:

{context}`,
    ],
    ["human", "{question}"],
  ]);

  const chain = RunnableSequence.from([
    {
      context: async (input: { question: string }) => {
        const docs = await retriever.getRelevantDocuments(input.question);
        return docs.map((doc) => doc.pageContent).join("\n\n");
      },
      question: new RunnablePassthrough(),
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  return await chain.invoke({ question });
}

/**
 * Example 5: Framework-Filtered RAG
 * Retrieve only from specific frameworks
 */
export async function frameworkFilteredRAG(
  question: string,
  frameworks: string[]
) {
  const vectorStore = new SupabaseVectorStore();

  // Custom retriever with framework filter
  const retriever = {
    getRelevantDocuments: async (query: string) => {
      return vectorStore.similaritySearch(query, 5, { frameworks });
    },
  };

  const llm = new ChatAnthropic({
    model: "claude-haiku-4-5-20251001",
    temperature: 0,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are NIGEL. Answer using ONLY these frameworks: ${frameworks.join(", ")}

Doctrine:
{context}`,
    ],
    ["human", "{question}"],
  ]);

  const chain = RunnableSequence.from([
    {
      context: async (input: { question: string }) => {
        const docs = await retriever.getRelevantDocuments(input.question);
        return docs.map((doc) => doc.pageContent).join("\n\n");
      },
      question: new RunnablePassthrough(),
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  return await chain.invoke({ question });
}

/**
 * Example 6: RAG with Citations
 * Uses Claude's citation feature to cite specific passages
 */
export async function ragWithCitations(question: string) {
  const vectorStore = new SupabaseVectorStore();
  const docs = await vectorStore.asRetriever({ k: 5 }).getRelevantDocuments(question);

  // Format documents for Claude's citation API
  const documentsWithCitations = docs.map((doc, index) => ({
    type: "document",
    source: {
      type: "content",
      data: doc.pageContent,
    },
    title: doc.metadata.section || `Document ${index + 1}`,
    context: `Framework: ${doc.metadata.framework_tags?.join(", ")}`,
    citations: {
      enabled: true,
    },
  }));

  const llm = new ChatAnthropic({
    model: "claude-haiku-4-5-20251001",
    clientOptions: {
      defaultHeaders: {
        "anthropic-beta": "citations-2025-01-01",
      },
    },
  });

  const messages = [
    {
      role: "user",
      content: [
        ...documentsWithCitations,
        {
          type: "text",
          text: question,
        },
      ],
    },
  ];

  const response = await llm.invoke(messages as any);
  return response.content; // Will include citations
}

/**
 * Example 7: Multi-Query RAG
 * Generates multiple query variations for better retrieval
 */
export async function multiQueryRAG(question: string) {
  const vectorStore = new SupabaseVectorStore();
  const retriever = vectorStore.asRetriever({ k: 3 });

  // Generate query variations
  const queryGenerator = new ChatAnthropic({
    model: "claude-haiku-4-5-20251001",
    temperature: 0.7,
  });

  const queryPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Generate 3 different versions of the user's question to retrieve relevant documents.",
    ],
    ["human", "{question}"],
  ]);

  const queries = await queryPrompt
    .pipe(queryGenerator)
    .pipe(new StringOutputParser())
    .invoke({ question });

  // Retrieve docs for all queries
  const queryList = queries.split("\n").filter((q) => q.trim());
  const allDocs = await Promise.all(
    queryList.map((q) => retriever.getRelevantDocuments(q))
  );

  // Deduplicate and combine
  const uniqueDocs = Array.from(
    new Map(
      allDocs.flat().map((doc) => [doc.metadata.id, doc])
    ).values()
  );

  // Answer with combined context
  const llm = new ChatAnthropic({
    model: "claude-haiku-4-5-20251001",
    temperature: 0,
  });

  const answerPrompt = ChatPromptTemplate.fromMessages([
    ["system", "Answer using this doctrine:\n\n{context}"],
    ["human", "{question}"],
  ]);

  const chain = RunnableSequence.from([
    {
      context: () => uniqueDocs.map((doc) => doc.pageContent).join("\n\n"),
      question: new RunnablePassthrough(),
    },
    answerPrompt,
    llm,
    new StringOutputParser(),
  ]);

  return await chain.invoke({ question });
}

/**
 * Usage Examples
 */
export const usage = {
  // Basic RAG
  basic: async () => {
    const answer = await basicRAG("What is the FATE framework?");
    console.log(answer);
  },

  // Hybrid search
  hybrid: async () => {
    const answer = await hybridSearchRAG("elicitation techniques");
    console.log(answer);
  },

  // Conversational
  conversation: async () => {
    const { askQuestion } = await conversationalRAG();
    
    const answer1 = await askQuestion("What is FATE?");
    console.log("Q1:", answer1);
    
    const answer2 = await askQuestion("How do I apply it?");
    console.log("Q2:", answer2);
  },

  // With thinking
  thinking: async () => {
    const answer = await ragWithThinking(
      "How do rapport building and human needs frameworks relate to each other?"
    );
    console.log(answer);
  },

  // Framework filtered
  filtered: async () => {
    const answer = await frameworkFilteredRAG(
      "How do I build rapport?",
      ["rapport", "human needs"]
    );
    console.log(answer);
  },

  // With citations
  citations: async () => {
    const answer = await ragWithCitations("What is elicitation?");
    console.log(JSON.stringify(answer, null, 2));
  },

  // Multi-query
  multiQuery: async () => {
    const answer = await multiQueryRAG("Tell me about influence techniques");
    console.log(answer);
  },
};
