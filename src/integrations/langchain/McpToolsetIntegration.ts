/**
 * NIGEL-Specific MCP Toolset Integration
 * 
 * Integrates MCP toolset with NIGEL's existing RAG system:
 * - Hybrid model routing (complexity-based)
 * - NIGEL voice preservation
 * - Prompt caching for cost optimization
 * - Integration with existing RagService
 */

import { ChatAnthropic, tools } from "@langchain/anthropic";
import type { MCPServer } from "@langchain/anthropic";

/**
 * Calculate query complexity for model routing
 */
function calculateComplexity(query: string): number {
  let score = 0;

  // Length factor
  const wordCount = query.split(/\s+/).length;
  if (wordCount > 50) score += 20;
  else if (wordCount > 30) score += 10;

  // Complexity keywords
  const complexKeywords = [
    "analyze", "compare", "explain", "evaluate", "synthesize",
    "design", "architect", "optimize", "strategic", "comprehensive"
  ];
  complexKeywords.forEach(keyword => {
    if (query.toLowerCase().includes(keyword)) score += 5;
  });

  // Question depth
  const questionMarks = (query.match(/\?/g) || []).length;
  if (questionMarks > 2) score += 10;

  // Multi-part requests
  if (query.includes(" and ") || query.includes(" then ")) score += 5;

  return Math.min(score, 100);
}

/**
 * Select optimal model based on complexity
 */
function selectModel(complexity: number): string {
  if (complexity < 40) {
    return "claude-haiku-4-5-20251001"; // Simple queries
  } else if (complexity < 60) {
    return "claude-sonnet-4-5-20250929"; // Moderate complexity
  } else {
    return "claude-sonnet-4-5-20250929"; // Complex (with extended thinking)
  }
}

/**
 * NIGEL Voice System Prompt
 */
const NIGEL_SYSTEM_PROMPT = `<identity>
You are NIGEL, an AI training assistant for cognitive and behavioral frameworks.
</identity>

<voice>
- Calm, surgical, slightly mischievous
- Direct: Short sentences, concrete language
- Subtle humor: Maximum one subtle joke per response
- Professional but not robotic
</voice>

<forbidden>
Never use: "OMG", "Let's gooo", "Bestie", excessive emojis, hype language, generic AI phrases
</forbidden>

<knowledge_rule>
CRITICAL: If you don't know something or the tools don't provide information, explicitly state:
"I don't have doctrine on that" or "No relevant information found"
Never hallucinate or speculate beyond provided context.
</knowledge_rule>

<response_format>
- Be concise and actionable
- Cite sources when using tool results
- Structure complex answers with clear sections
- Use examples when helpful
</response_format>`;

/**
 * Enhanced MCP Toolset Service for NIGEL
 */
export class NigelMcpToolsetService {
  private mcpServers: MCPServer[] = [];
  private toolConfigs: any[] = [];
  private enableCaching: boolean = true;

  constructor(enableCaching: boolean = true) {
    this.enableCaching = enableCaching;
  }

  /**
   * Add MCP server with NIGEL-optimized defaults
   */
  addServer(
    url: string,
    name: string,
    authToken?: string,
    config?: {
      allowlist?: string[];
      denylist?: string[];
      deferLoading?: boolean;
    }
  ): void {
    if (!url.startsWith("https://") && !url.startsWith("http://localhost")) {
      throw new Error("MCP server must use HTTPS");
    }

    this.mcpServers.push({
      type: "url",
      url,
      name,
      authorization_token: authToken,
    });

    const toolsetConfig: any = { serverName: name };

    if (config) {
      if (config.allowlist?.length) {
        toolsetConfig.defaultConfig = { enabled: false };
        toolsetConfig.configs = {};
        config.allowlist.forEach((tool) => {
          toolsetConfig.configs[tool] = { enabled: true };
        });
      }

      if (config.denylist?.length) {
        toolsetConfig.configs = toolsetConfig.configs || {};
        config.denylist.forEach((tool) => {
          toolsetConfig.configs[tool] = { enabled: false };
        });
      }

      if (config.deferLoading) {
        toolsetConfig.defaultConfig = {
          ...toolsetConfig.defaultConfig,
          deferLoading: true,
        };
        
        if (!this.toolConfigs.some(t => t.name?.includes?.("toolSearchRegex"))) {
          this.toolConfigs.push(tools.toolSearchRegex_20251119());
        }
      }
    }

    this.toolConfigs.push(tools.mcpToolset_20251120(toolsetConfig));
  }

  /**
   * Query with NIGEL voice and hybrid routing
   */
  async query(userQuery: string): Promise<{
    response: string;
    model: string;
    complexity: number;
  }> {
    if (this.mcpServers.length === 0) {
      throw new Error("No MCP servers configured");
    }

    // Calculate complexity and select model
    const complexity = calculateComplexity(userQuery);
    const modelId = selectModel(complexity);
    const useExtendedThinking = complexity >= 60;

    // Create LLM with selected model
    const llm = new ChatAnthropic({
      model: modelId,
      apiKey: process.env.ANTHROPIC_API_KEY,
      ...(useExtendedThinking && {
        temperature: 1.0,
        maxTokens: 16000,
      }),
    });

    // Build messages with system prompt caching
    const messages = [
      {
        role: "system" as const,
        content: NIGEL_SYSTEM_PROMPT,
        ...(this.enableCaching && { cache_control: { type: "ephemeral" as const } }),
      },
      {
        role: "user" as const,
        content: userQuery,
      },
    ];

    // Invoke with MCP tools
    const response = await llm.invoke(messages, {
      mcp_servers: this.mcpServers,
      tools: this.toolConfigs,
      ...(useExtendedThinking && {
        thinking: {
          type: "enabled",
          budget_tokens: 8000,
        },
      }),
    });

    const content = typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

    return {
      response: content,
      model: modelId,
      complexity,
    };
  }

  /**
   * Get model indicator emoji (for Discord messages)
   */
  getModelIndicator(model: string): string {
    if (model.includes("haiku")) return "⚡"; // Fast/cheap
    if (model.includes("sonnet")) return "🎯"; // Balanced
    if (model.includes("opus")) return "🧠"; // Premium
    return "🤖";
  }

  reset(): void {
    this.mcpServers = [];
    this.toolConfigs = [];
  }

  getServerNames(): string[] {
    return this.mcpServers.map((s) => s.name);
  }
}

/**
 * Example: Integrate MCP tools with NIGEL's /ask command
 */
export async function enhancedAskCommand(
  query: string,
  mcpServers?: Array<{ url: string; name: string; token?: string }>
): Promise<string> {
  const service = new NigelMcpToolsetService();

  // Add configured MCP servers (if any)
  if (mcpServers?.length) {
    mcpServers.forEach(({ url, name, token }) => {
      service.addServer(url, name, token, {
        deferLoading: true, // Cost optimization
      });
    });
  }

  // Query with hybrid routing
  const { response, model, complexity } = await service.query(query);
  
  // Add model indicator
  const indicator = service.getModelIndicator(model);
  
  return `${indicator} ${response}\n\n*Model: ${model} (complexity: ${complexity})*`;
}
