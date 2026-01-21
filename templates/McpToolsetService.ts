/**
 * MCP Toolset Service Template
 * 
 * Universal service for integrating MCP (Model Context Protocol) toolsets
 * with Claude via LangChain.
 * 
 * Features:
 * - Connect to multiple MCP servers
 * - Allowlist/denylist tool configurations
 * - Deferred loading for cost optimization
 * - Type-safe configuration
 * 
 * Usage:
 * ```typescript
 * const service = new McpToolsetService();
 * service.addServer("https://api.example.com/sse", "example", token, {
 *   allowlist: ["tool1", "tool2"]
 * });
 * const response = await service.query("Your question");
 * ```
 */

import { ChatAnthropic, tools } from "@langchain/anthropic";
import type { MCPServer } from "@langchain/anthropic";

/**
 * Configuration for an MCP toolset
 */
export interface McpToolsetConfig {
  /** Only these tools will be enabled (recommended for production) */
  allowlist?: string[];
  
  /** These tools will be explicitly disabled */
  denylist?: string[];
  
  /** Defer loading tools until needed (saves costs) */
  deferLoading?: boolean;
}

/**
 * Service for managing MCP toolset integrations with Claude
 */
export class McpToolsetService {
  private llm: ChatAnthropic;
  private mcpServers: MCPServer[] = [];
  private toolConfigs: any[] = [];

  /**
   * Create a new MCP Toolset Service
   * 
   * @param model - Claude model to use (default: claude-sonnet-4-5-20250929)
   * @param apiKey - Anthropic API key (defaults to ANTHROPIC_API_KEY env var)
   */
  constructor(
    model: string = "claude-sonnet-4-5-20250929",
    apiKey?: string
  ) {
    this.llm = new ChatAnthropic({
      model,
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Add an MCP server and configure its tools
   * 
   * @param url - MCP server URL (must be HTTPS)
   * @param name - Unique identifier for this server
   * @param authToken - Optional OAuth Bearer token
   * @param config - Tool configuration (allowlist/denylist/defer)
   * 
   * @example
   * // Allowlist pattern (recommended)
   * service.addServer(
   *   "https://calendar.example.com/sse",
   *   "calendar",
   *   process.env.CALENDAR_TOKEN,
   *   { allowlist: ["search_events", "create_event"] }
   * );
   * 
   * @example
   * // Denylist pattern
   * service.addServer(
   *   "https://db.example.com/sse",
   *   "database",
   *   process.env.DB_TOKEN,
   *   { denylist: ["drop_table", "delete_all"] }
   * );
   * 
   * @example
   * // Deferred loading (cost optimization)
   * service.addServer(
   *   "https://huge-toolset.com/sse",
   *   "tools",
   *   token,
   *   { deferLoading: true }
   * );
   */
  addServer(
    url: string,
    name: string,
    authToken?: string,
    config?: McpToolsetConfig
  ): void {
    // Validate URL
    if (!url.startsWith("https://") && !url.startsWith("http://localhost")) {
      throw new Error("MCP server URL must use HTTPS (or localhost for dev)");
    }

    // Add server configuration
    this.mcpServers.push({
      type: "url",
      url,
      name,
      authorization_token: authToken,
    });

    // Build tool configuration
    const toolsetConfig: any = {
      serverName: name,
    };

    if (config) {
      // Allowlist pattern - disable all, enable specific
      if (config.allowlist && config.allowlist.length > 0) {
        toolsetConfig.defaultConfig = { enabled: false };
        toolsetConfig.configs = {};
        config.allowlist.forEach((toolName) => {
          toolsetConfig.configs[toolName] = { enabled: true };
        });
      }

      // Denylist pattern - enable all, disable specific
      if (config.denylist && config.denylist.length > 0) {
        toolsetConfig.configs = toolsetConfig.configs || {};
        config.denylist.forEach((toolName) => {
          toolsetConfig.configs[toolName] = { enabled: false };
        });
      }

      // Deferred loading - load tools on-demand
      if (config.deferLoading) {
        toolsetConfig.defaultConfig = {
          ...toolsetConfig.defaultConfig,
          deferLoading: true,
        };
        
        // Add tool search for deferred loading
        if (!this.toolConfigs.some(t => t.name?.includes?.("toolSearchRegex"))) {
          this.toolConfigs.push(tools.toolSearchRegex_20251119());
        }
      }
    }

    this.toolConfigs.push(tools.mcpToolset_20251120(toolsetConfig));
  }

  /**
   * Query Claude with MCP tools available
   * 
   * @param prompt - Question or instruction for Claude
   * @returns Claude's response as a string
   * 
   * @throws Error if no MCP servers configured
   * 
   * @example
   * const response = await service.query("Find my meeting tomorrow");
   * console.log(response);
   */
  async query(prompt: string): Promise<string> {
    if (this.mcpServers.length === 0) {
      throw new Error(
        "No MCP servers configured. Call addServer() before querying."
      );
    }

    const response = await this.llm.invoke(prompt, {
      mcp_servers: this.mcpServers,
      tools: this.toolConfigs,
    });

    return typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);
  }

  /**
   * Query with streaming support
   * 
   * @param prompt - Question or instruction
   * @param onChunk - Callback for each response chunk
   * 
   * @example
   * await service.queryStream("Explain...", (chunk) => {
   *   process.stdout.write(chunk);
   * });
   */
  async queryStream(
    prompt: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (this.mcpServers.length === 0) {
      throw new Error("No MCP servers configured.");
    }

    const stream = await this.llm.stream(prompt, {
      mcp_servers: this.mcpServers,
      tools: this.toolConfigs,
    });

    for await (const chunk of stream) {
      const content = typeof chunk.content === "string" 
        ? chunk.content 
        : JSON.stringify(chunk.content);
      onChunk(content);
    }
  }

  /**
   * Remove a specific MCP server by name
   * 
   * @param name - Server name to remove
   */
  removeServer(name: string): void {
    const index = this.mcpServers.findIndex((s) => s.name === name);
    if (index !== -1) {
      this.mcpServers.splice(index, 1);
      // Remove corresponding tool config
      this.toolConfigs = this.toolConfigs.filter(
        (t) => t.serverName !== name
      );
    }
  }

  /**
   * Clear all MCP servers and tool configurations
   */
  reset(): void {
    this.mcpServers = [];
    this.toolConfigs = [];
  }

  /**
   * Get list of configured server names
   */
  getServerNames(): string[] {
    return this.mcpServers.map((s) => s.name);
  }

  /**
   * Check if a specific server is configured
   */
  hasServer(name: string): boolean {
    return this.mcpServers.some((s) => s.name === name);
  }

  /**
   * Get current model being used
   */
  getModel(): string {
    return this.llm.modelName;
  }

  /**
   * Switch to a different Claude model
   * 
   * @example
   * // Switch to cheaper model for simple tasks
   * service.setModel("claude-haiku-4-5-20251001");
   */
  setModel(model: string): void {
    const currentKey = this.llm.anthropicApiKey;
    this.llm = new ChatAnthropic({
      model,
      apiKey: currentKey,
    });
  }
}

/**
 * Utility function to test MCP server connectivity
 * 
 * @param url - MCP server URL
 * @param token - Optional auth token
 * @returns true if connection successful
 * 
 * @example
 * const isConnected = await testMcpConnection(
 *   "https://api.example.com/sse",
 *   process.env.API_TOKEN
 * );
 */
export async function testMcpConnection(
  url: string,
  token?: string
): Promise<boolean> {
  try {
    const llm = new ChatAnthropic({
      model: "claude-haiku-4-5-20251001", // Use cheap model for testing
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    await llm.invoke("List available tools", {
      mcp_servers: [
        {
          type: "url",
          url,
          name: "test-server",
          authorization_token: token,
        },
      ],
      tools: [tools.mcpToolset_20251120({ serverName: "test-server" })],
    });

    return true;
  } catch (error) {
    console.error("MCP connection test failed:", error);
    return false;
  }
}

/**
 * Example usage demonstrating common patterns
 */
export async function exampleUsage() {
  const service = new McpToolsetService();

  // Pattern 1: Allowlist (recommended for production)
  service.addServer(
    "https://calendar.example.com/sse",
    "calendar",
    process.env.CALENDAR_TOKEN,
    {
      allowlist: ["search_events", "create_event"],
    }
  );

  // Pattern 2: Denylist (block dangerous operations)
  service.addServer(
    "https://database.example.com/sse",
    "database",
    process.env.DB_TOKEN,
    {
      denylist: ["drop_table", "delete_all", "grant_admin"],
    }
  );

  // Pattern 3: Deferred loading (cost optimization)
  service.addServer(
    "https://huge-toolset.example.com/sse",
    "tools",
    process.env.TOOLS_TOKEN,
    {
      deferLoading: true,
    }
  );

  // Query with all tools available
  const response = await service.query(
    "Search my calendar for tomorrow and summarize my meetings"
  );

  console.log(response);
}
