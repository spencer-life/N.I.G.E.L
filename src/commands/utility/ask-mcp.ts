/**
 * /ask-mcp Command - Enhanced RAG with MCP Toolset Support
 * 
 * Extends NIGEL's RAG system with external MCP tools for:
 * - Real-time data access
 * - External API integration
 * - Specialized tool usage
 * 
 * Example: /ask-mcp "What are the latest trends in cognitive science?"
 */

import { SlashCommandBuilder, EmbedBuilder, CommandInteraction } from "discord.js";
import { NigelMcpToolsetService } from "../../integrations/langchain/McpToolsetIntegration";
import { createEmbed } from "../../utils/embeds";

export const data = new SlashCommandBuilder()
  .setName("ask-mcp")
  .setDescription("Ask NIGEL a question with MCP tool access")
  .addStringOption((option) =>
    option
      .setName("question")
      .setDescription("Your question for NIGEL")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();

  const question = interaction.options.get("question", true).value as string;

  try {
    // Initialize MCP service
    const service = new NigelMcpToolsetService();

    // Example: Add research paper MCP server (configure as needed)
    // Uncomment and configure based on your available MCP servers
    /*
    service.addServer(
      process.env.RESEARCH_MCP_URL!,
      "research",
      process.env.RESEARCH_MCP_TOKEN,
      {
        allowlist: ["search_papers", "get_abstract"],
        deferLoading: true,
      }
    );
    */

    // Example: Add web search MCP server
    /*
    service.addServer(
      process.env.WEB_SEARCH_MCP_URL!,
      "web-search",
      process.env.WEB_SEARCH_MCP_TOKEN,
      {
        allowlist: ["search", "get_content"],
        deferLoading: true,
      }
    );
    */

    // Query with MCP tools
    const { response, model, complexity } = await service.query(question);
    const indicator = service.getModelIndicator(model);

    // Build embed
    const embed = createEmbed(
      `${indicator} Response`,
      response,
      "Info"
    )
      .addFields(
        { name: "Model", value: model.includes("haiku") ? "Haiku" : "Sonnet", inline: true },
        { name: "Complexity", value: `${complexity}/100`, inline: true },
        { name: "MCP Servers", value: service.getServerNames().join(", ") || "None", inline: true }
      )
      .setFooter({
        text: `${indicator} Model: ${model.includes("haiku") ? "⚡ Fast" : "🎯 Balanced"}`,
      });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Error in /ask-mcp:", error);

    const errorEmbed = createEmbed(
      "Error",
      error instanceof Error
        ? error.message
        : "Failed to process your question. Check MCP server configuration.",
      "Error"
    );

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
