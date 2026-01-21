#!/usr/bin/env node
/**
 * MCP Toolset Server
 * 
 * Exposes MCP Toolset functionality as an MCP server
 * so Cursor AI can use it during conversations.
 * 
 * This wraps the Anthropic mcpToolset_20251120 feature
 * and exposes it through the standard MCP protocol.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ChatAnthropic, tools } from "@langchain/anthropic";

// Initialize server
const server = new Server(
  {
    name: "mcp-toolset-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Configuration from environment
const MCP_SERVER_CONFIGS = JSON.parse(
  process.env.MCP_SERVER_CONFIGS || "[]"
);

// Initialize LangChain with Anthropic
const llm = new ChatAnthropic({
  model: "claude-sonnet-4-5-20250929",
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "query_with_mcp_tools",
      description: "Query Claude with access to external MCP server tools. Provide a natural language query and optionally specify which MCP servers to use.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The question or instruction to send to Claude",
          },
          servers: {
            type: "array",
            description: "Optional: Specific MCP server names to use (defaults to all configured)",
            items: { type: "string" },
          },
        },
        required: ["query"],
      },
    },
    {
      name: "list_mcp_servers",
      description: "List all configured MCP servers available for use",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
}));

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "list_mcp_servers") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              configured_servers: MCP_SERVER_CONFIGS.length,
              servers: MCP_SERVER_CONFIGS.map((s: any) => ({
                name: s.name,
                url: s.url,
                has_auth: !!s.authorization_token,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (name === "query_with_mcp_tools") {
    const { query, servers } = args as {
      query: string;
      servers?: string[];
    };

    try {
      // Filter servers if specific ones requested
      const mcpServers = servers
        ? MCP_SERVER_CONFIGS.filter((s: any) => servers.includes(s.name))
        : MCP_SERVER_CONFIGS;

      if (mcpServers.length === 0) {
        throw new Error(
          "No MCP servers configured. Set MCP_SERVER_CONFIGS environment variable."
        );
      }

      // Build tool configs for each server
      const toolConfigs = mcpServers.map((serverConfig: any) =>
        tools.mcpToolset_20251120({
          serverName: serverConfig.name,
          ...(serverConfig.deferLoading && {
            defaultConfig: { deferLoading: true },
          }),
          ...(serverConfig.allowlist && {
            defaultConfig: { enabled: false },
            configs: Object.fromEntries(
              serverConfig.allowlist.map((tool: string) => [
                tool,
                { enabled: true },
              ])
            ),
          }),
        })
      );

      // Add tool search if any server uses deferred loading
      if (mcpServers.some((s: any) => s.deferLoading)) {
        toolConfigs.unshift(tools.toolSearchRegex_20251119());
      }

      // Query with MCP tools
      const response = await llm.invoke(query, {
        mcp_servers: mcpServers,
        tools: toolConfigs,
      });

      const content =
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content);

      return {
        content: [
          {
            type: "text",
            text: content,
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
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("MCP Toolset Server running");
  console.error(`Configured servers: ${MCP_SERVER_CONFIGS.length}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
