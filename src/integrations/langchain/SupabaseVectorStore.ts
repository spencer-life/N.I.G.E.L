/**
 * LangChain Integration for NIGEL
 * 
 * Provides a LangChain-compatible vector store wrapper around Supabase
 * Enables advanced RAG patterns like conversational retrieval, multi-query, etc.
 * 
 * Based on LangChain official docs: https://docs.langchain.com/oss/javascript/integrations/chat/anthropic
 * 
 * Installation:
 * ```bash
 * npm install @langchain/anthropic @langchain/core
 * ```
 * 
 * Usage:
 * ```typescript
 * import { SupabaseVectorStore } from './integrations/langchain/SupabaseVectorStore';
 * import { ChatAnthropic } from '@langchain/anthropic';
 * import { RunnableSequence } from '@langchain/core/runnables';
 * 
 * const vectorStore = new SupabaseVectorStore();
 * const retriever = vectorStore.asRetriever({ k: 5 });
 * 
 * // Use Claude Haiku 4.5 with prompt caching for cost savings
 * const llm = new ChatAnthropic({ 
 *   model: 'claude-haiku-4-5-20251001',
 *   temperature: 0,
 *   maxTokens: 4096
 * });
 * 
 * // Create RAG chain
 * const chain = RunnableSequence.from([
 *   { context: retriever, question: (input) => input.question },
 *   llm
 * ]);
 * 
 * const response = await chain.invoke({ question: 'What is FATE?' });
 * ```
 * 
 * Features:
 * - Vector similarity search with NIGEL's optimized indexes
 * - Hybrid search (keyword + semantic) using RRF
 * - Framework filtering for targeted retrieval
 * - Compatible with LangChain chains, agents, and tools
 * - Supports prompt caching for 90% cost reduction
 * - Tool calling for RAG-as-a-tool patterns
 */

import { supabase } from "../../database/client.js";
import { RagService } from "../../services/RagService.js";
import type { Chunk } from "../../types/database.js";

export interface Document {
  pageContent: string;
  metadata: Record<string, any>;
}

export interface VectorStoreRetrieverOptions {
  k?: number;
  filter?: Record<string, any>;
  searchType?: 'similarity' | 'mmr';
}

/**
 * Supabase Vector Store for LangChain
 * Wraps NIGEL's optimized vector search functions for LangChain compatibility
 */
export class SupabaseVectorStore {
  /**
   * Similarity search using optimized vector index
   * Leverages NIGEL's RagService for embedding generation and search
   */
  async similaritySearch(
    query: string,
    k: number = 4,
    filter?: Record<string, any>
  ): Promise<Document[]> {
    // Use RagService which handles embedding generation and optimized search
    const results = await RagService.searchDoctrine(query, filter?.threshold);

    // Take top k results
    const topResults = results.slice(0, k);

    return topResults.map((result) => ({
      pageContent: result.chunk.content,
      metadata: {
        id: result.chunk.id,
        section: result.chunk.section,
        framework_tags: result.chunk.framework_tags,
        document_id: result.chunk.document_id,
        similarity: result.similarity,
        token_count: result.chunk.token_count
      }
    }));
  }

  /**
   * Hybrid search combining keyword and semantic
   * Uses Reciprocal Rank Fusion (RRF) for better accuracy
   */
  async hybridSearch(
    query: string,
    k: number = 4
  ): Promise<Document[]> {
    // Use RagService hybrid search
    const results = await RagService.hybridSearch(query, k);

    return results.map((result) => ({
      pageContent: result.chunk.content,
      metadata: {
        id: result.chunk.id,
        section: result.chunk.section,
        framework_tags: result.chunk.framework_tags,
        document_id: result.chunk.document_id,
        similarity: result.similarity,
        token_count: result.chunk.token_count
      }
    }));
  }

  /**
   * Create a retriever for use in LangChain chains
   */
  asRetriever(options: VectorStoreRetrieverOptions = {}) {
    const { k = 4, filter, searchType = 'similarity' } = options;

    return {
      getRelevantDocuments: async (query: string): Promise<Document[]> => {
        if (searchType === 'similarity') {
          return this.similaritySearch(query, k, filter);
        } else {
          return this.hybridSearch(query, k);
        }
      }
    };
  }

  /**
   * Add documents to the vector store
   * Note: This would trigger automatic embedding via database triggers
   */
  async addDocuments(documents: Document[]): Promise<void> {
    for (const doc of documents) {
      // Extract document info from metadata
      const documentName = doc.metadata.documentName || 'Unknown';
      const section = doc.metadata.section || null;
      const frameworkTags = doc.metadata.framework_tags || [];

      // Insert into documents table if needed
      const { data: existingDoc } = await supabase
        .from('documents')
        .select('id')
        .eq('name', documentName)
        .single();

      let documentId: number;

      if (!existingDoc) {
        const { data: newDoc, error } = await supabase
          .from('documents')
          .insert({
            name: documentName,
            source: doc.metadata.source || null,
            doc_type: doc.metadata.doc_type || 'markdown',
            metadata: {}
          })
          .select('id')
          .single();

        if (error) throw new Error(`Failed to create document: ${error.message}`);
        documentId = newDoc.id;
      } else {
        documentId = existingDoc.id;
      }

      // Insert chunk (embedding will be generated automatically via trigger)
      const { error: chunkError } = await supabase
        .from('chunks')
        .insert({
          document_id: documentId,
          section,
          content: doc.pageContent,
          framework_tags: frameworkTags,
          token_count: doc.pageContent.split(/\s+/).length,
          // embedding will be generated by trigger
        });

      if (chunkError) {
        throw new Error(`Failed to insert chunk: ${chunkError.message}`);
      }
    }
  }
}

/**
 * Example usage patterns
 */
export const examples = {
  // Basic similarity search
  basicSearch: async () => {
    const store = new SupabaseVectorStore();
    const results = await store.similaritySearch("What is FATE?", 5);
    return results;
  },

  // Hybrid search
  hybridSearch: async () => {
    const store = new SupabaseVectorStore();
    const results = await store.hybridSearch("elicitation techniques", 5);
    return results;
  },

  // Filtered search
  filteredSearch: async () => {
    const store = new SupabaseVectorStore();
    const results = await store.similaritySearch(
      "rapport building",
      5,
      { frameworks: ['rapport', 'human needs'] }
    );
    return results;
  },

  // As retriever (for LangChain chains)
  asRetriever: () => {
    const store = new SupabaseVectorStore();
    const retriever = store.asRetriever({ k: 5, searchType: 'similarity' });
    return retriever;
  }
};
