import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { RagService } from "../../services/RagService.js";
import { infoEmbed, errorEmbed } from "../../utils/embeds.js";
import type { Command } from "../../types/discord.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Query NIGEL's doctrine knowledge base")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Your question about behavioral engineering doctrine")
        .setRequired(true)
        .setMaxLength(500)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString("query", true);
    console.log(`[Ask Command] Received query: "${query}"`);

    // Defer reply with searching status
    await interaction.deferReply();

    try {
      // Search doctrine first
      console.log("[Ask Command] Searching doctrine...");
      const chunks = await RagService.searchDoctrine(query);
      
      if (chunks.length === 0) {
        const embed = infoEmbed(
          "No Doctrine Found",
          "No supporting doctrine found. I could speculate, but we both know how that ends."
        );
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Synthesize with model routing
      console.log("[Ask Command] Synthesizing response...");
      const response = await RagService.synthesizeResponse(query, chunks);
      console.log(`[Ask Command] Response received - model: ${response.modelUsed}, complexity: ${response.complexity.score}`);

      // Build clean response embed - no sources, no model indicator
      const embed = infoEmbed("NIGEL", response.answer);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("[Ask Command] Error:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to process query";
      
      const embed = errorEmbed("Query Failed", errorMessage);
      
      await interaction.editReply({ embeds: [embed] });
    }
  },
};

export default command;
