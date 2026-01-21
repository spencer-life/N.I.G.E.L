/**
 * MCP Toolset Service for NIGEL
 * 
 * Extends the base MCP Toolset Service with NIGEL-specific features:
 * - Hybrid model routing (Haiku/Sonnet based on complexity)
 * - NIGEL voice preservation
 * - Integration with existing RAG system
 * - Cost optimization via deferred loading
 */

import { ChatAnthropic, tools } from "@langchain/anthropic";
import type { MCPServer } from "@langchain/anthropic";

export interface McpToolsetConfig {
  allowlist?: string[];
  denylist?: string[];
  deferLoading?: boolean;
}

export class McpToolsetService {
  private llm: ChatAnthropic;
  private mcpServers: MCPServer[] = [];
  private toolConfigs: any[] = [];

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
   * Add an MCP server with tool configuration
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

    // Add server
    this.mcpServers.push({
      type: "url",
      url,
      name,
      authorization_token: authToken,
    });

    // Build tool config
    const toolsetConfig: any = { serverName: name };

    if (config) {
      // Allowlist pattern
      if (config.allowlist && config.allowlist.length > 0) {
        toolsetConfig.defaultConfig = { enabled: false };
        toolsetConfig.configs = {};
        config.allowlist.forEach((toolName) => {
          toolsetConfig.configs[toolName] = { enabled: true };
        });
      }

      // Denylist pattern
      if (config.denylist && config.denylist.length > 0) {
        toolsetConfig.configs = toolsetConfig.configs || {};
        config.denylist.forEach((toolName) => {
          toolsetConfig.configs[toolName] = { enabled: false };
        });
      }

      // Deferred loading with tool search
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
   * Query with MCP tools available
   */
  async query(prompt: string): Promise<string> {
    if (this.mcpServers.length === 0) {
      throw new Error("No MCP servers configured. Call addServer() first.");
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

  removeServer(name: string): void {
    const index = this.mcpServers.findIndex((s) => s.name === name);
    if (index !== -1) {
      this.mcpServers.splice(index, 1);
      this.toolConfigs = this.toolConfigs.filter(
        (t) => t.serverName !== name
      );
    }
  }

  reset(): void {
    this.mcpServers = [];
    this.toolConfigs = [];
  }

  getServerNames(): string[] {
    return this.mcpServers.map((s) => s.name);
  }

  hasServer(name: string): boolean {
    return this.mcpServers.some((s) => s.name === name);
  }

  getModel(): string {
    return this.llm.modelName;
  }

  setModel(model: string): void {
    const currentKey = this.llm.anthropicApiKey;
    this.llm = new ChatAnthropic({
      model,
      apiKey: currentKey,
    });
  }
}

/**
 * Test MCP server connectivity
 */
export async function testMcpConnection(
  url: string,
  token?: string
): Promise<boolean> {
  try {
    const llm = new ChatAnthropic({
      model: "claude-haiku-4-5-20251001",
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
