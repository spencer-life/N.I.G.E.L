import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "../database/client.js";
import type { Chunk, ChunkSearchResult, RagResponse } from "../types/database.js";

/**
 * Known SPARK frameworks for complexity detection
 */
const FRAMEWORKS = [
  "6mx", "six-minute", "fate", "bte", "baseline", "trigger", "exception",
  "four frames", "4 frames", "elicitation", "rapport", "human needs",
  "compass", "authority", "cialdini", "cognitive bias", "body language",
  "profiling", "hierarchy", "influence", "hypnosis", "linguistics",
  "neuroscience", "script hacking", "six-axis", "social skills"
];

/**
 * Complexity indicators for routing decisions
 */
const COMPLEXITY_KEYWORDS = [
  "relationship", "compare", "contrast", "difference", "between",
  "how does", "why does", "combine", "integrate", "connect",
  "multiple", "together", "versus", "vs", "relate", "interaction",
  "apply", "scenario", "example", "practice", "when to use"
];

/**
 * Model configuration for hybrid routing
 * Using latest Claude 4.5 models with extended thinking support
 * 
 * Pricing (per 1M tokens):
 * - Haiku 4.5: $1 input / $5 output (~$0.008/query)
 * - Sonnet 4.5: $3 input / $15 output (~$0.026/query)
 */
const MODELS = {
  // Fast model for simple questions
  // Claude Haiku 4.5 - quick responses with near-frontier intelligence
  HAIKU: "claude-haiku-4-5-20251001",
  // Premium model for complex questions  
  // Claude Sonnet 4.5 - smart model for complex agents and coding
  SONNET: "claude-sonnet-4-5-20250929",
} as const;

type ModelTier = "haiku" | "sonnet";

interface ComplexityAnalysis {
  score: number;
  tier: ModelTier;
  reasons: string[];
  frameworksDetected: string[];
}

/**
 * RAG (Retrieval-Augmented Generation) Service
 * Handles doctrine search and response synthesis.
 * 
 * HYBRID ROUTING:
 * - Simple questions → Claude Haiku 4 (fast, cheap)
 * - Complex multi-framework questions → Claude Sonnet 4.5 (premium)
 * 
 * Uses Gemini for embeddings (unchanged).
 */
export class RagService {
  private static genAI: GoogleGenerativeAI | null = null;
  private static embeddingModel: any = null;
  private static claude: Anthropic | null = null;

  // Complexity threshold: scores >= this use Sonnet, below use Haiku
  private static readonly COMPLEXITY_THRESHOLD = 40;

  private static initialize(): void {
    if (this.genAI && this.claude) return;

    // Gemini for embeddings
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      throw new Error("GEMINI_API_KEY not configured in environment");
    }
    this.genAI = new GoogleGenerativeAI(geminiKey);
    this.embeddingModel = this.genAI.getGenerativeModel({ model: "text-embedding-004" });

    // Claude for synthesis (both Haiku and Sonnet)
    const claudeKey = process.env.ANTHROPIC_API_KEY;
    if (!claudeKey) {
      throw new Error("ANTHROPIC_API_KEY not configured in environment");
    }
    this.claude = new Anthropic({ apiKey: claudeKey });
  }

  /**
   * Analyzes query complexity to determine which model to use.
   * 
   * Scoring factors:
   * - Number of frameworks mentioned (0-30 points)
   * - Complexity keywords present (0-30 points)
   * - Query length (0-20 points)
   * - Question depth indicators (0-20 points)
   */
  static analyzeComplexity(query: string, chunks: ChunkSearchResult[]): ComplexityAnalysis {
    const lowerQuery = query.toLowerCase();
    const reasons: string[] = [];
    let score = 0;

    // 1. Count frameworks mentioned in query
    const frameworksInQuery = FRAMEWORKS.filter(f => lowerQuery.includes(f));
    const frameworkScore = Math.min(frameworksInQuery.length * 15, 30);
    score += frameworkScore;
    if (frameworksInQuery.length > 0) {
      reasons.push(`${frameworksInQuery.length} framework(s) in query`);
    }

    // 2. Count unique frameworks in retrieved chunks
    const chunkFrameworks = new Set<string>();
    chunks.forEach(c => c.chunk.framework_tags.forEach(t => chunkFrameworks.add(t.toLowerCase())));
    const uniqueFrameworkCount = chunkFrameworks.size;
    if (uniqueFrameworkCount > 2) {
      score += 15;
      reasons.push(`${uniqueFrameworkCount} frameworks in sources`);
    }

    // 3. Complexity keywords
    const complexityMatches = COMPLEXITY_KEYWORDS.filter(k => lowerQuery.includes(k));
    const complexityScore = Math.min(complexityMatches.length * 10, 30);
    score += complexityScore;
    if (complexityMatches.length > 0) {
      reasons.push(`Complexity keywords: ${complexityMatches.slice(0, 3).join(", ")}`);
    }

    // 4. Query length (longer = more complex)
    const wordCount = query.split(/\s+/).length;
    if (wordCount > 20) {
      score += 15;
      reasons.push("Long query");
    } else if (wordCount > 10) {
      score += 8;
    }

    // 5. Question depth - "why" and "how" are deeper than "what"
    if (lowerQuery.includes("why")) {
      score += 10;
      reasons.push("Why question (causal)");
    }
    if (lowerQuery.includes("how") && (lowerQuery.includes("apply") || lowerQuery.includes("use"))) {
      score += 10;
      reasons.push("Application question");
    }

    // 6. Multiple questions in one
    const questionMarks = (query.match(/\?/g) || []).length;
    if (questionMarks > 1) {
      score += 15;
      reasons.push("Multiple questions");
    }

    // Determine tier
    const tier: ModelTier = score >= this.COMPLEXITY_THRESHOLD ? "sonnet" : "haiku";

    return {
      score,
      tier,
      reasons,
      frameworksDetected: [...frameworksInQuery, ...chunkFrameworks],
    };
  }

  /**
   * Generates an embedding vector for text using Gemini embedding model.
   * Returns a 768-dimensional vector.
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    this.initialize();

    const result = await this.embeddingModel.embedContent(text);
    return result.embedding.values;
  }

  /**
   * Retrieves the confidence threshold from config table.
   * Defaults to 0.5 if not configured.
   */
  static async getConfidenceThreshold(): Promise<number> {
    const { data, error } = await supabase
      .from("config")
      .select("value")
      .eq("key", "rag_threshold")
      .maybeSingle();

    if (error) {
      console.error("[RagService] Error fetching config:", error.message);
      return 0.5;
    }

    if (data?.value && typeof data.value === "object" && "value" in data.value) {
      return Number(data.value.value) || 0.5;
    }

    return 0.5;
  }

  /**
   * Searches doctrine using vector similarity with title matching boost.
   * Returns chunks that meet the confidence threshold.
   * 
   * OPTIMIZED: Uses search_chunks_optimized() function for better performance
   */
  static async searchDoctrine(
    query: string,
    threshold?: number
  ): Promise<ChunkSearchResult[]> {
    const startTime = Date.now();
    
    // Generate embedding for the query
    console.log("[RagService] Generating embedding for query:", query.substring(0, 50));
    const queryEmbedding = await this.generateEmbedding(query);
    console.log("[RagService] Embedding generated, length:", queryEmbedding.length);
    
    // Extract concept name from query for title matching
    const conceptMatch = query.toLowerCase().match(/(?:what (?:is|are)|define|explain)\s+(?:an?\s+)?(?:the\s+)?(.+?)(?:\s*\?|$)/);
    let conceptName = conceptMatch ? conceptMatch[1].trim() : null;
    
    // Clean up common suffixes
    if (conceptName) {
      conceptName = conceptName
        .replace(/\s+(framework|model|method|system|process|technique|protocol)$/i, '')
        .trim();
    }
    
    const confidenceThreshold = threshold ?? (await this.getConfidenceThreshold());
    let matchThreshold = 2 * (1 - confidenceThreshold);
    
    // For concept queries, use a more permissive threshold
    if (conceptName) {
      matchThreshold = Math.max(matchThreshold, 1.4);
      console.log(`[RagService] Concept query detected ("${conceptName}") - using permissive threshold: ${matchThreshold}`);
    } else {
      console.log("[RagService] Confidence threshold:", confidenceThreshold, "| Match threshold:", matchThreshold);
    }

    // Use optimized search function with title boosting
    const { data, error } = await supabase.rpc("search_chunks_optimized", {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: 15,
      framework_filter: null,
      boost_section_match: conceptName
    });

    const elapsed = Date.now() - startTime;
    console.log(`[RagService] Vector search completed in ${elapsed}ms - error:`, error, "| data length:", data?.length ?? 0);

    if (error) {
      console.error("[RagService] Search error:", error);
      throw new Error(`Doctrine search failed: ${error.message}`);
    }

    // Log performance if slow (fire and forget)
    if (elapsed > 1000) {
      void supabase.rpc("log_query_performance", {
        p_query_type: 'vector',
        p_query_text: query,
        p_execution_time_ms: elapsed,
        p_chunks_returned: data?.length ?? 0
      });
    }

    if (!data || data.length === 0) {
      console.log("[RagService] No chunks found matching threshold");
      return [];
    }

    // Convert results to ChunkSearchResult format
    // The boosted_score from the database function is already applied
    const results = data.map((row: any) => ({
      chunk: {
        id: row.id,
        document_id: row.document_id,
        section: row.section,
        content: row.content,
        framework_tags: row.framework_tags,
        token_count: row.token_count,
        embedding: row.embedding,
        created_at: row.created_at,
      } as Chunk,
      similarity: row.boosted_score ?? (1 - row.distance / 2), // Use boosted score if available
    }));

    console.log(`[RagService] Returning ${results.length} chunks`);
    return results;
  }

  /**
   * Synthesizes a response using the appropriate Claude model.
   * Automatically routes to Haiku or Sonnet based on complexity.
   * Enables extended thinking for high-complexity Sonnet queries.
   */
  static async synthesizeResponse(
    query: string,
    chunks: ChunkSearchResult[]
  ): Promise<RagResponse & { modelUsed: string; complexity: ComplexityAnalysis; usedThinking: boolean }> {
    this.initialize();

    if (chunks.length === 0) {
      return {
        answer: "No supporting doctrine found. I could speculate, but we both know how that ends.",
        sources: [],
        confidence: 0,
        modelUsed: "none",
        complexity: { score: 0, tier: "haiku", reasons: [], frameworksDetected: [] },
        usedThinking: false,
      };
    }

    // Analyze complexity to determine model
    const complexity = this.analyzeComplexity(query, chunks);
    const model = complexity.tier === "sonnet" ? MODELS.SONNET : MODELS.HAIKU;
    
    console.log(`[RagService] Complexity Analysis:`);
    console.log(`  - Score: ${complexity.score}/${this.COMPLEXITY_THRESHOLD} threshold`);
    console.log(`  - Tier: ${complexity.tier.toUpperCase()}`);
    console.log(`  - Reasons: ${complexity.reasons.join(", ") || "Simple query"}`);
    console.log(`  - Model: ${model}`);

    // Build context from chunks - no source numbering, just raw doctrine
    const context = chunks
      .map((result) => {
        const tags = result.chunk.framework_tags.join(", ");
        return `[Framework: ${tags}]\n${result.chunk.content}`;
      })
      .join("\n\n---\n\n");

    // System prompt defines NIGEL's personality - cached for cost reduction
    // Cache saves 90% on repeated calls within 5-minute window
    const systemPromptText = `You are NIGEL, a behavioral engineering training instructor for the S.P.A.R.K. methodology. You're not a generic AI assistant—you're a skilled practitioner who's seen these techniques work in the field.

<personality>
Your communication style:
- Calm, surgical, slightly mischievous—like a chess player explaining why someone just walked into checkmate
- Direct and precise, but conversational. You're teaching humans, not writing academic papers
- One subtle joke or clever observation per response. Just enough wit to keep it interesting
- Zero tolerance for: "OMG", "Let's gooo", "Bestie", corporate buzzwords, or generic AI cheerfulness
- Think: seasoned instructor who respects the craft, not textbook regurgitation
</personality>

<communication_context>
Your responses appear in Discord where users expect:
- Natural, flowing explanations (like you're explaining over coffee, not writing a thesis)
- Direct answers without academic throat-clearing
- 200-300 words typically—enough to be thorough, not enough to need a bookmark
- Professional but human. Authoritative but approachable
</communication_context>

<expertise>
You specialize in behavioral engineering frameworks: 6MX, FATE, BTE, Four Frames, Elicitation, Rapport, Human Needs, Cognitive Biases, Profiling, Authority, Compass, Hierarchy, Script Hacking, Six-Axis Model, and the psychology that makes them work.
</expertise>

<critical_rules>
1. NO SOURCE CITATIONS: Weave doctrine naturally into explanations without [1], [2] references. The knowledge should feel integrated, not footnoted
2. NEVER SPECULATE: Stick to what the doctrine actually says. If it's not covered, say so directly without apologizing
3. BE CONVERSATIONAL: Write like you're explaining to a colleague, not defending a dissertation
4. SHOW, DON'T JUST TELL: Use the examples from doctrine to illustrate points
5. CONNECT CONCEPTS: When frameworks overlap, point it out naturally—that's where the power is
6. FLOWING PROSE: Complete thoughts in natural paragraphs. Bullet points only for discrete lists
7. PERSONALITY OVER FORMALITY: Sound like NIGEL, not like you're reading from a manual
8. UNDERSTAND HIERARCHY: When answering "what is X?", prioritize doctrine chunks whose section title EXACTLY matches X. If you receive a chunk labeled as a sub-technique (e.g., Category says "11. Elicitation (Techniques & triggers)"), do NOT describe that sub-technique as if it's the parent concept. Look for chunks with broader, general definitions.
9. ACCURACY OVER STYLE: If the doctrine says something specific (like "uses statements, not questions"), NEVER contradict it—even if it would sound better. The facts come first.
</critical_rules>

<voice_examples>
GOOD: "Elicitation works because doubt makes people talk. Simple as that."
BAD: "According to the source material [1], elicitation is defined as..."

GOOD: "Here's the thing most people miss about FATE..."
BAD: "The FATE framework, as documented in the literature..."

GOOD: "You'd think pushing harder would work. It doesn't. Here's why."
BAD: "Research indicates that increased pressure is counterproductive..."
</voice_examples>`;

    // User message with doctrine context
    // No source citations - weave doctrine naturally into conversational explanation
    const userMessage = `<doctrine_knowledge>
${context}
</doctrine_knowledge>

<question>
${query}
</question>

<instructions>
Pull from the doctrine knowledge above to answer naturally. Teach this like you're explaining to someone who wants to actually use it, not memorize it for a test.

IMPORTANT - When answering "what is X?" or defining concepts:
- Check the section headers (##) in the doctrine chunks. Prioritize chunks whose section title matches the concept being asked about.
- If a chunk's Category field identifies it as a sub-technique (e.g., "11. Elicitation (Techniques & triggers)" with section title "Disbelief"), recognize it's NOT the main definition—it's one specific technique within that framework.
- Use the broadest, most general definition available. Save sub-techniques for "how" or "example" questions.
- Never contradict core principles stated in the doctrine (e.g., if it says "statements, not questions", don't say "questions").

Connect the dots between concepts when relevant. If something isn't covered in the doctrine, say so directly—no speculation, no filler.
</instructions>`;

    const useExtendedThinking = complexity.tier === "sonnet" && complexity.score >= 60;
    console.log(`[RagService] Sending to ${complexity.tier === "sonnet" ? "Claude Sonnet 4.5" : "Claude Haiku 4.5"}...`);
    console.log(`[RagService] Extended thinking: ${useExtendedThinking ? "ENABLED" : "disabled"}`);
    const startTime = Date.now();
    
    // Build request with prompt caching enabled
    // System prompt is cached (90% cost reduction on cache hits within 5min)
    const requestOptions: any = {
      model: model,
      max_tokens: complexity.tier === "sonnet" ? 16000 : 4096,
      // Use cache_control on system prompt for cost savings
      system: [
        {
          type: "text",
          text: systemPromptText,
          cache_control: { type: "ephemeral" } // Cache for 5 minutes
        }
      ],
      messages: [
        { 
          role: "user", 
          content: [
            {
              type: "text",
              text: userMessage,
              // Cache the doctrine context too - helps when same chunks are retrieved
              cache_control: { type: "ephemeral" }
            }
          ]
        }
      ]
    };

    // Enable extended thinking for complex Sonnet queries
    // This allows Claude to "think through" the doctrine before responding
    if (useExtendedThinking) {
      requestOptions.thinking = {
        type: "enabled",
        budget_tokens: 8000 // Allow up to 8K tokens of thinking
      };
    }

    const response = await this.claude!.messages.create(requestOptions);
    
    // Log cache performance
    const usage = response.usage as any;
    if (usage?.cache_read_input_tokens || usage?.cache_creation_input_tokens) {
      console.log(`[RagService] Cache stats - read: ${usage.cache_read_input_tokens || 0}, created: ${usage.cache_creation_input_tokens || 0}`);
    }
    
    // Extract the text response (may have thinking blocks before it)
    let answer = "Unable to generate response.";
    for (const block of response.content) {
      if (block.type === "text") {
        answer = block.text;
        break;
      }
    }
    
    const elapsed = Date.now() - startTime;
    console.log(`[RagService] ${complexity.tier.toUpperCase()} responded in ${elapsed}ms`);

    // Calculate average confidence
    const avgConfidence =
      chunks.reduce((sum, c) => sum + c.similarity, 0) / chunks.length;

    // Get document names for sources
    const documentIds = [...new Set(chunks.map((c) => c.chunk.document_id))];
    const { data: documents } = await supabase
      .from("documents")
      .select("id, name")
      .in("id", documentIds);

    const docMap = new Map(documents?.map((d) => [d.id, d.name]) || []);

    const sources = chunks.map((result) => ({
      documentName: docMap.get(result.chunk.document_id) || "Unknown",
      section: result.chunk.section,
      similarity: Math.round(result.similarity * 100) / 100,
    }));

    return {
      answer,
      sources,
      confidence: avgConfidence,
      modelUsed: complexity.tier,
      complexity,
      usedThinking: useExtendedThinking,
    };
  }

  /**
   * Hybrid search combining keyword and semantic search
   * Uses Reciprocal Rank Fusion (RRF) for better accuracy
   */
  static async hybridSearch(
    query: string,
    matchCount: number = 10,
    fullTextWeight: number = 1.0,
    semanticWeight: number = 1.0
  ): Promise<ChunkSearchResult[]> {
    const startTime = Date.now();
    
    // Generate embedding for semantic search
    const queryEmbedding = await this.generateEmbedding(query);
    
    // Use hybrid search function
    const { data, error } = await supabase.rpc("hybrid_search_chunks", {
      query_text: query,
      query_embedding: queryEmbedding,
      match_count: matchCount,
      full_text_weight: fullTextWeight,
      semantic_weight: semanticWeight,
      rrf_k: 50
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`[RagService] Hybrid search completed in ${elapsed}ms`);
    
    if (error) {
      console.error("[RagService] Hybrid search error:", error);
      throw new Error(`Hybrid search failed: ${error.message}`);
    }
    
    // Log performance if slow (fire and forget)
    if (elapsed > 1000) {
      void supabase.rpc("log_query_performance", {
        p_query_type: 'hybrid',
        p_query_text: query,
        p_execution_time_ms: elapsed,
        p_chunks_returned: data?.length ?? 0
      });
    }
    
    // Convert to ChunkSearchResult format
    return (data || []).map((row: any) => ({
      chunk: {
        id: row.id,
        document_id: row.document_id,
        section: row.section,
        content: row.content,
        framework_tags: row.framework_tags,
        token_count: row.token_count,
        embedding: row.embedding,
        created_at: row.created_at,
      } as Chunk,
      similarity: row.similarity,
    }));
  }

  /**
   * Main entry point: Ask a question and get a doctrine-grounded response.
   * Automatically routes to the appropriate model based on complexity.
   * 
   * Set useHybridSearch=true to combine keyword + semantic search for better accuracy
   */
  static async ask(
    query: string, 
    threshold?: number,
    useHybridSearch: boolean = false
  ): Promise<RagResponse> {
    const chunks = useHybridSearch 
      ? await this.hybridSearch(query, 15)
      : await this.searchDoctrine(query, threshold);
      
    const result = await this.synthesizeResponse(query, chunks);
    
    // Return standard RagResponse (strip internal fields for compatibility)
    return {
      answer: result.answer,
      sources: result.sources,
      confidence: result.confidence,
    };
  }
}
