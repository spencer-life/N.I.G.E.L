import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types/discord.js";
import { UserRepository } from "../../database/UserRepository.js";
import { ScoringService } from "../../services/ScoringService.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the current standings")
    .addStringOption((option) =>
      option
        .setName("period")
        .setDescription("Time period to display")
        .setRequired(false)
        .addChoices(
          { name: "All Time", value: "all" },
          { name: "This Week", value: "week" },
          { name: "This Month", value: "month" }
        )
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const period = interaction.options.getString("period") ?? "all";
    
    // For MVP, we only support all-time leaderboard
    // Period-based will come in V1
    const entries = await UserRepository.getLeaderboard(10);

    if (entries.length === 0) {
      await interaction.editReply({
        content: "No operatives ranked yet. Complete a drill to claim your position.",
      });
      return;
    }

    // Build leaderboard display
    const medals = ["🥇", "🥈", "🥉"];
    const lines: string[] = [];

    for (let i = 0; i < entries.length; i++) {
      const { user, stats } = entries[i];
      const rank = i < 3 ? medals[i] : `\`${i + 1}.\``;
      const name = user.display_name || user.username || "Unknown Operative";
      const { level } = ScoringService.calculateLevel(stats.experience);
      
      lines.push(
        `${rank} **${name}**\n` +
        `   ${stats.points.toLocaleString()} pts • Lvl ${level} • ${stats.current_streak}🔥`
      );
    }

    // Find requesting user's position
    const userPosition = entries.findIndex(
      (e) => e.user.discord_user_id === interaction.user.id
    );

    const embed = new EmbedBuilder()
      .setTitle("Authority Standings")
      .setDescription(
        `*${period === "all" ? "All-Time" : period === "week" ? "Weekly" : "Monthly"} Rankings*\n\n` +
        lines.join("\n\n")
      )
      .setColor(0x7289da)
      .setFooter({ 
        text: userPosition >= 0 
          ? `You are ranked #${userPosition + 1}` 
          : "Complete drills to join the standings" 
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

export default command;
