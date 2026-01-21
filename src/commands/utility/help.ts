import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types/discord.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("NIGEL system documentation and available commands"),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle("NIGEL Operating Manual")
      .setDescription(
        "*Neural Interactive Guide for Elicitation & Learning*\n\n" +
        "I am the training interface for behavioral engineering doctrine. " +
        "Below are my available protocols."
      )
      .addFields(
        {
          name: "🎯 Training Commands",
          value:
            "`/drill` — Start 10-question training drill\n" +
            "`/practice` — Custom session (framework + difficulty filters)\n" +
            "`/stats` — View your training statistics\n" +
            "`/leaderboard` — Current standings",
          inline: false,
        },
        {
          name: "🤖 Knowledge & Metrics",
          value:
            "`/ask` — Query doctrine knowledge base (RAG)\n" +
            "`/authority log` — Log daily authority metrics\n" +
            "`/authority stats` — View trends and averages\n" +
            "`/authority week` — This week's entries",
          inline: false,
        },
        {
          name: "⚙️ Admin Commands",
          value:
            "*Requires Ninja role clearance*\n" +
            "`/trigger-drill` — Manual drill post\n" +
            "`/add-question` — Add question to bank\n" +
            "`/user-lookup` — Inspect user profile",
          inline: false,
        },
        {
          name: "📖 System Commands",
          value:
            "`/ping` — System diagnostics\n" +
            "`/help` — Display this manual",
          inline: false,
        },
        {
          name: "📍 Key Channels",
          value:
            "Daily drills post at **09:00 Phoenix** time.\n" +
            "Check the guide channel for the complete system manual.",
          inline: false,
        }
      )
      .setColor(0x2f3136)
      .setFooter({ text: "NIGEL • S.P.A.R.K. Initiative" });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

export default command;
