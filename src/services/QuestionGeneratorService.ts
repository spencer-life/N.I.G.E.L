import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "../database/client.js";
import type { Question, Chunk } from "../types/database.js";

/**
 * Question Generator Service
 * Dynamically generates drill questions from the knowledge base using Claude.
 * No database seeding required - questions are ephemeral and always fresh.
 */
export class QuestionGeneratorService {
  private static claude: Anthropic | null = null;

  private static initialize(): void {
    if (this.claude) return;

    const claudeKey = process.env.ANTHROPIC_API_KEY;
    if (!claudeKey) {
      throw new Error("ANTHROPIC_API_KEY not configured in environment");
    }
    this.claude = new Anthropic({ apiKey: claudeKey });
  }

  /**
   * Generates questions dynamically from the knowledge base.
   * 
   * @param count - Number of questions to generate
   * @param frameworks - Optional framework filter (e.g., ["FATE", "6MX"])
   * @param difficulty - Optional difficulty level (1-5)
   * @returns Array of generated questions
   */
  static async generateQuestions(
    count: number,
    frameworks?: string[],
    difficulty?: number
  ): Promise<Question[]> {
    this.initialize();

    console.log(`[QuestionGenerator] Generating ${count} questions...`);
    if (frameworks) console.log(`[QuestionGenerator] Frameworks: ${frameworks.join(", ")}`);
    if (difficulty) console.log(`[QuestionGenerator] Difficulty: ${difficulty}`);

    // Fetch random chunks from knowledge base
    const chunks = await this.fetchRandomChunks(count * 2, frameworks);

    if (chunks.length === 0) {
      throw new Error("No knowledge chunks available. Knowledge base may be empty.");
    }

    console.log(`[QuestionGenerator] Retrieved ${chunks.length} chunks from knowledge base`);

    // Generate questions using Claude
    const questions = await this.generateQuestionsFromChunks(chunks, count, difficulty);

    console.log(`[QuestionGenerator] Successfully generated ${questions.length} questions`);
    return questions;
  }

  /**
   * Fetches random chunks from the knowledge base.
   * If frameworks specified, filters by framework_tags.
   */
  private static async fetchRandomChunks(
    count: number,
    frameworks?: string[]
  ): Promise<Chunk[]> {
    let query = supabase
      .from("chunks")
      .select("*");

    // Filter by frameworks if specified
    if (frameworks && frameworks.length > 0) {
      query = query.overlaps("framework_tags", frameworks);
    }

    // Get random chunks using ORDER BY random()
    const { data, error } = await query
      .order("id", { ascending: false }) // Use id ordering for consistent results
      .limit(count);

    if (error) {
      console.error("[QuestionGenerator] Error fetching chunks:", error);
      throw new Error(`Failed to fetch knowledge chunks: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Shuffle the results for randomness
    return this.shuffle(data as Chunk[]);
  }

  /**
   * Generates questions from chunks using Claude.
   */
  private static async generateQuestionsFromChunks(
    chunks: Chunk[],
    count: number,
    difficulty?: number
  ): Promise<Question[]> {
    // Build context from chunks
    const context = chunks
      .map((chunk, i) => {
        const tags = chunk.framework_tags.join(", ");
        return `[Chunk ${i + 1} - Framework: ${tags}]\n${chunk.content}`;
      })
      .join("\n\n---\n\n");

    // Build difficulty instruction
    const difficultyInstruction = difficulty
      ? `Target difficulty level: ${difficulty}/5 (1=basic recall, 5=complex application)`
      : "Mix of difficulty levels (1-3 for most questions)";

    // System prompt for question generation
    const systemPrompt = `You are a question generator for a behavioral engineering training system. Your task is to create multiple-choice questions based on doctrine content provided.

<requirements>
1. Generate EXACTLY ${count} questions from the provided doctrine
2. Each question must have 4 answer options (A, B, C, D)
3. Only ONE option should be correct
4. Questions should test understanding, not just memorization
5. ${difficultyInstruction}
6. Include a brief explanation for the correct answer (1-2 sentences)
7. Extract framework tags from the source material
8. Questions should be clear, specific, and unambiguous
9. CRITICAL: Each answer option MUST be 55 characters or less (Discord button limit)
</requirements>

<output_format>
Return ONLY a valid JSON array with this exact structure:
[
  {
    "question_text": "The question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_option_index": 0,
    "difficulty": 2,
    "framework_tags": ["Framework1", "Framework2"],
    "explanation": "Brief explanation of why this is correct."
  }
]
</output_format>

<guidelines>
- Focus on practical application, not trivia
- Avoid questions that rely on exact wording from the doctrine
- Test understanding of concepts, relationships, and use cases
- Make incorrect options plausible but clearly wrong
- Keep questions concise (under 100 characters when possible)
- Keep answer options VERY SHORT (max 55 chars) - they appear as Discord buttons with "A: " prefix
- Explanations should reference the doctrine naturally
</guidelines>`;

    const userMessage = `<doctrine>
${context}
</doctrine>

Generate ${count} multiple-choice questions based on the doctrine above. Return ONLY the JSON array, no other text.`;

    console.log(`[QuestionGenerator] Sending to Claude Haiku for question generation...`);
    const startTime = Date.now();

    const response = await this.claude!.messages.create({
      model: "claude-haiku-4-5-20251001", // Use Haiku for speed and cost
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const elapsed = Date.now() - startTime;
    console.log(`[QuestionGenerator] Claude responded in ${elapsed}ms`);

    // Extract text response
    let responseText = "";
    for (const block of response.content) {
      if (block.type === "text") {
        responseText = block.text;
        break;
      }
    }

    // Parse JSON response
    try {
      // Remove markdown code blocks if present
      let jsonText = responseText.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      const parsed = JSON.parse(jsonText);

      if (!Array.isArray(parsed)) {
        throw new Error("Response is not an array");
      }

      // Convert to Question format
      const questions: Question[] = parsed.map((q, index) => ({
        id: Date.now() + index, // Temporary ID (not stored in DB)
        question_text: q.question_text,
        answer_text: null,
        options: q.options,
        correct_option_index: q.correct_option_index,
        question_type: "drill",
        difficulty: q.difficulty || 2,
        framework_tags: q.framework_tags || [],
        source_document_id: null,
        is_active: true,
        explanation: q.explanation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Validate questions
      for (const q of questions) {
        if (!q.question_text || !q.options || q.options.length !== 4) {
          console.warn("[QuestionGenerator] Invalid question format:", q);
          throw new Error("Generated question has invalid format");
        }
        if (q.correct_option_index === null || q.correct_option_index < 0 || q.correct_option_index > 3) {
          console.warn("[QuestionGenerator] Invalid correct_option_index:", q);
          throw new Error("Generated question has invalid correct answer index");
        }
        
        // Validate option lengths (Discord button limit is 80 chars, reserve 25 for "A: " prefix + safety margin)
        for (let i = 0; i < q.options.length; i++) {
          if (q.options[i].length > 55) {
            console.warn(`[QuestionGenerator] Option ${i} too long (${q.options[i].length} chars):`, q.options[i]);
            // Truncate the option rather than failing
            q.options[i] = q.options[i].substring(0, 52) + "...";
            console.log(`[QuestionGenerator] Truncated to: ${q.options[i]}`);
          }
        }
      }

      return questions.slice(0, count); // Ensure we return exactly the requested count
    } catch (parseError) {
      console.error("[QuestionGenerator] Failed to parse Claude response:", responseText);
      console.error("[QuestionGenerator] Parse error:", parseError);
      throw new Error("Failed to parse generated questions. Claude may have returned invalid JSON.");
    }
  }

  /**
   * Fisher-Yates shuffle for unbiased randomization.
   */
  private static shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
