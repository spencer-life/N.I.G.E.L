import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import type { Command } from "../../types/discord.js";
import { DrillService } from "../../services/DrillService.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("drill")
    .setDescription("Start a training drill to test your doctrine knowledge")
    .addIntegerOption((option) =>
      option
        .setName("questions")
        .setDescription("Number of questions (5-20)")
        .setMinValue(5)
        .setMaxValue(20)
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const questionCount = interaction.options.getInteger("questions") ?? 10;

    // Check for existing session
    if (await DrillService.hasActiveSession(interaction.user.id)) {
      await interaction.reply({
        content: "You have an unfinished drill. Abandoning previous session.",
        ephemeral: true,
      });
      await DrillService.abandonSession(interaction.user.id);
    }

    // Show drill invitation embed
    const inviteEmbed = new EmbedBuilder()
      .setTitle("Training Drill Initiated")
      .setDescription(
        "Your cognitive assessment is ready.\n\n" +
        "**Parameters:**\n" +
        `• **Questions**: ${questionCount}\n` +
        "• **Frameworks**: Mixed\n" +
        "• **Time Bonus**: Under 5s per question\n\n" +
        "*Streaks amplify your score. Consistency is authority.*"
      )
      .setColor(0x2f3136)
      .setFooter({ text: "NIGEL • Training Protocol" });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("drill_start")
        .setLabel("⚡ Begin Drill")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [inviteEmbed],
      components: [row],
      ephemeral: true,
    });
  },
};

export default command;
