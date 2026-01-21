import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/discord.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("System diagnostics and latency check"),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const sent = await interaction.reply({
      content: "Running diagnostics...",
      fetchReply: true,
    });

    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = interaction.client.ws.ping;

    // NIGEL voice - technical, precise
    await interaction.editReply(
      `**System Status:** Operational\n` +
      `**Roundtrip:** ${roundtrip}ms\n` +
      `**Gateway:** ${wsLatency}ms`
    );
  },
};

export default command;
