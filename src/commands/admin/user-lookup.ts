import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  GuildMember,
} from "discord.js";
import type { Command } from "../../types/discord.js";
import { isAdmin } from "../../utils/admin.js";
import { supabase } from "../../database/client.js";
import { UserRepository } from "../../database/UserRepository.js";
import { AuthorityService } from "../../services/AuthorityService.js";
import { infoEmbed, errorEmbed, formatNumber } from "../../utils/embeds.js";

/**
 * Calculates user level from experience.
 * Formula: level = floor(sqrt(xp / 100))
 */
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}

/**
 * Determines trajectory based on recent activity.
 */
function getTrajectory(currentStreak: number, lastActivityDate: string | null): string {
  if (!lastActivityDate) return "dormant";
  
  const daysSinceActivity = Math.floor(
    (Date.now() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceActivity > 7) return "dormant";
  if (currentStreak >= 7) return "ascending";
  if (currentStreak >= 3) return "stable";
  return "emerging";
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("user-lookup")
    .setDescription("View detailed user profile and metrics (Admin only)")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to look up")
        .setRequired(true)
    ),

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

    const targetUser = interaction.options.getUser("user", true);

    try {
      // Get user profile and stats
      const profile = await UserRepository.getFullProfile(targetUser.id);

      if (!profile) {
        await interaction.editReply({
          embeds: [
            errorEmbed(
              "User Not Found",
              `${targetUser.displayName} has no recorded activity.`
            ),
          ],
        });
        return;
      }

      const { user, stats } = profile;
      const level = calculateLevel(stats.experience);
      const trajectory = getTrajectory(stats.current_streak, stats.last_activity_at);

      // Get recent sessions (last 5)
      const { data: sessions } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(5);

      // Get authority metrics
      const authorityStats = await AuthorityService.getPersonalStats(targetUser.id);

      // Build session history string
      let sessionHistory = "";
      if (sessions && sessions.length > 0) {
        sessionHistory = sessions
          .map((s) => {
            const date = new Date(s.started_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            const status = s.status === "completed" ? "✓" : s.status === "abandoned" ? "✗" : "◉";
            return `${status} ${date} - ${s.session_type}`;
          })
          .join("\n");
      } else {
        sessionHistory = "No sessions recorded.";
      }

      // Build authority section
      let authoritySection = "";
      if (authorityStats && authorityStats.totalEntries > 0) {
        const { averages } = authorityStats;
        const metrics = [];
        if (averages.presence !== undefined) metrics.push(`PRE: ${averages.presence}`);
        if (averages.composure !== undefined) metrics.push(`COM: ${averages.composure}`);
        if (averages.discipline !== undefined) metrics.push(`DIS: ${averages.discipline}`);
        if (averages.clarity !== undefined) metrics.push(`CLA: ${averages.clarity}`);
        if (averages.influence !== undefined) metrics.push(`INF: ${averages.influence}`);
        
        authoritySection = 
          `\n\n**Authority Metrics**\n` +
          `${metrics.join(" • ")}\n` +
          `Streak: ${authorityStats.currentStreak} days • Entries: ${authorityStats.totalEntries}`;
      }

      // Build the embed
      const description =
        `**Points:** ${formatNumber(stats.points)}\n` +
        `**XP:** ${formatNumber(stats.experience)}\n` +
        `**Level:** ${level}\n\n` +
        `**Streaks**\n` +
        `Current: ${stats.current_streak} • Best: ${stats.longest_streak}\n\n` +
        `**Recent Sessions**\n` +
        `\`\`\`\n${sessionHistory}\n\`\`\`` +
        authoritySection +
        `\n\n*Trajectory: ${trajectory}*`;

      await interaction.editReply({
        embeds: [
          infoEmbed(
            `User Analysis: ${targetUser.displayName}`,
            description
          ),
        ],
      });
    } catch (error) {
      console.error("[user-lookup] Error:", error);
      await interaction.editReply({
        embeds: [
          errorEmbed(
            "Lookup Failed",
            "Could not retrieve user data. Check logs."
          ),
        ],
      });
    }
  },
};

export default command;
