import { ChatInputCommandInteraction, SlashCommandBuilder, GuildMember } from "discord.js";
import type { Command } from "../../types/discord.js";
import { isAdmin } from "../../utils/admin.js";
import { SchedulerService } from "../../services/SchedulerService.js";
import { successEmbed, errorEmbed } from "../../utils/embeds.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("trigger-drill")
    .setDescription("Manually trigger the daily drill post (Admin only)"),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Permission check
    if (!isAdmin(interaction.member as GuildMember)) {
      await interaction.reply({
        embeds: [errorEmbed("Access Denied", "Insufficient clearance for this operation.")],
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      await SchedulerService.triggerDailyDrill();

      await interaction.editReply({
        embeds: [
          successEmbed(
            "Override Confirmed",
            "Daily drill posted. Manual override logged."
          ),
        ],
      });
    } catch (error) {
      console.error("[trigger-drill] Error:", error);
      await interaction.editReply({
        embeds: [
          errorEmbed(
            "Operation Failed",
            "Could not trigger daily drill. Check channel configuration."
          ),
        ],
      });
    }
  },
};

export default command;
