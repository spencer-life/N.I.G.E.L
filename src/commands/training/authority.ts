import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { AuthorityService } from "../../services/AuthorityService.js";
import { infoEmbed, errorEmbed, warningEmbed, NIGELColors } from "../../utils/embeds.js";
import { formatPhoenixDate } from "../../utils/phoenix.js";
import type { Command } from "../../types/discord.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("authority")
    .setDescription("Track and view your Authority metrics")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("log")
        .setDescription("Log today's Authority scores")
        .addBooleanOption((option) =>
          option
            .setName("public")
            .setDescription("Post entry to channel (default: public)")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("stats")
        .setDescription("View your Authority statistics and trends")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("week")
        .setDescription("View this week's Authority entries")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("leaderboard")
        .setDescription("View Authority leaderboard")
        .addStringOption((option) =>
          option
            .setName("period")
            .setDescription("Time period (default: week)")
            .addChoices(
              { name: "This Week", value: "week" },
              { name: "This Month", value: "month" },
              { name: "All Time", value: "all" }
            )
            .setRequired(false)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "log":
        await handleLog(interaction);
        break;
      case "stats":
        await handleStats(interaction);
        break;
      case "week":
        await handleWeek(interaction);
        break;
      case "leaderboard":
        await handleLeaderboard(interaction);
        break;
    }
  },
};

/**
 * Handles the /authority log subcommand.
 * Opens a modal with 5 text input fields for scores.
 */
async function handleLog(interaction: ChatInputCommandInteraction): Promise<void> {
  const isPublic = interaction.options.getBoolean("public") ?? true; // Default to true (public)

  // Check if already logged today
  const hasLogged = await AuthorityService.hasLoggedToday(interaction.user.id);
  
  if (hasLogged) {
    const embed = warningEmbed(
      "Already Logged",
      "You've already logged Authority metrics today. Entry will be updated."
    );
    await interaction.reply({ embeds: [embed], ephemeral: true });
    // Continue to allow update
  }

  // Build modal with 5 score fields (Discord limit)
  const modal = new ModalBuilder()
    .setCustomId(`authority_log_${isPublic ? "public" : "private"}`)
    .setTitle("Daily Authority Metrics");

  // Create text input fields for each score
  const confidenceInput = new TextInputBuilder()
    .setCustomId("confidence")
    .setLabel("Confidence (1-10, or - to skip)")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(2)
    .setPlaceholder("8");

  const disciplineInput = new TextInputBuilder()
    .setCustomId("discipline")
    .setLabel("Discipline (1-10, or - to skip)")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(2)
    .setPlaceholder("7");

  const leadershipInput = new TextInputBuilder()
    .setCustomId("leadership")
    .setLabel("Leadership (1-10, or - to skip)")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(2)
    .setPlaceholder("9");

  const gratitudeInput = new TextInputBuilder()
    .setCustomId("gratitude")
    .setLabel("Gratitude (1-10, or - to skip)")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(2)
    .setPlaceholder("6");

  const enjoymentInput = new TextInputBuilder()
    .setCustomId("enjoyment")
    .setLabel("Enjoyment (1-10, or - to skip)")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(2)
    .setPlaceholder("8");

  // Add rows to modal
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(confidenceInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(disciplineInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(leadershipInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(gratitudeInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(enjoymentInput)
  );

  await interaction.showModal(modal);
}

/**
 * Handles the /authority stats subcommand.
 * Shows personal averages, trends, and streak.
 */
async function handleStats(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const stats = await AuthorityService.getPersonalStats(interaction.user.id);

    if (!stats) {
      const embed = infoEmbed(
        "No Data",
        "No Authority entries recorded yet. Use `/authority log` to start tracking."
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Format averages
    const formatAvg = (val: number | undefined): string => {
      return val !== undefined ? `${val}/10` : "-";
    };

    // Format trends
    const formatTrend = (val: number | undefined): string => {
      if (val === undefined || val === 0) return "Stable";
      const rounded = Math.round(val * 10) / 10;
      if (rounded > 0) return `↑ +${rounded}`;
      return `↓ ${rounded}`;
    };

    // Overall assessment
    const avgValues = Object.values(stats.averages).filter(
      (v): v is number => v !== undefined
    );
    const overallAvg = avgValues.reduce((a, b) => a + b, 0) / avgValues.length;
    const overallRounded = Math.round(overallAvg * 10) / 10;

    let assessment: string;
    if (overallRounded >= 8.0) {
      assessment = `Overall average: ${overallRounded}/10. Your authority metrics are precise.`;
    } else if (overallRounded >= 6.5) {
      assessment = `Overall average: ${overallRounded}/10. Solid baseline with calibration opportunities.`;
    } else if (overallRounded >= 5.0) {
      assessment = `Overall average: ${overallRounded}/10. Systematic improvement recommended.`;
    } else {
      assessment = `Overall average: ${overallRounded}/10. Significant work required.`;
    }

    const lastEntry = stats.lastEntryDate 
      ? formatPhoenixDate(new Date(stats.lastEntryDate + "T00:00:00Z"))
      : "Never";

    const embed = infoEmbed("Authority Statistics", assessment)
      .addFields(
        { name: "📊 Averages", value: "\u200B", inline: false },
        { name: "Confidence", value: formatAvg(stats.averages.confidence), inline: true },
        { name: "Discipline", value: formatAvg(stats.averages.discipline), inline: true },
        { name: "Leadership", value: formatAvg(stats.averages.leadership), inline: true },
        { name: "Gratitude", value: formatAvg(stats.averages.gratitude), inline: true },
        { name: "Enjoyment", value: formatAvg(stats.averages.enjoyment), inline: true },
        { name: "\u200B", value: "\u200B", inline: true }, // Spacer
        { name: "📈 Trends (Last 7 vs Previous 7)", value: "\u200B", inline: false },
        { name: "Confidence", value: formatTrend(stats.trends.confidence), inline: true },
        { name: "Discipline", value: formatTrend(stats.trends.discipline), inline: true },
        { name: "Leadership", value: formatTrend(stats.trends.leadership), inline: true },
        { name: "Gratitude", value: formatTrend(stats.trends.gratitude), inline: true },
        { name: "Enjoyment", value: formatTrend(stats.trends.enjoyment), inline: true },
        { name: "\u200B", value: "\u200B", inline: true }, // Spacer
        { name: "🔥 Streaks", value: "\u200B", inline: false },
        { name: "Current Streak", value: `${stats.currentStreak} day${stats.currentStreak !== 1 ? "s" : ""}`, inline: true },
        { name: "Longest Streak", value: `${stats.longestStreak} day${stats.longestStreak !== 1 ? "s" : ""}`, inline: true },
        { name: "Total Entries", value: `${stats.totalEntries}`, inline: true },
        { name: "Last Entry", value: lastEntry, inline: false }
      )
      .setFooter({ text: "NIGEL • Accountability compounds" });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("[Authority Stats] Error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to retrieve stats";
    const embed = errorEmbed("Stats Retrieval Failed", errorMessage);
    
    await interaction.editReply({ embeds: [embed] });
  }
}

/**
 * Handles the /authority week subcommand.
 * Shows entries for the current week.
 */
async function handleWeek(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const entries = await AuthorityService.getWeekEntries(interaction.user.id);

    if (entries.length === 0) {
      const embed = infoEmbed(
        "No Weekly Data",
        "No Authority entries for this week yet. Use `/authority log` to start."
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Format entries as table
    const formatScore = (val: number | undefined): string => {
      return val !== undefined ? val.toString() : "-";
    };

    const entriesText = entries
      .map((entry) => {
        const date = formatPhoenixDate(new Date(entry.entry_date + "T00:00:00Z"));
        const s = entry.scores;
        const avg = Object.values(s).filter((v): v is number => v !== undefined);
        const avgVal = avg.length > 0 
          ? (avg.reduce((a, b) => a + b, 0) / avg.length).toFixed(1) 
          : "-";

        return `**${date}**\nC:${formatScore(s.confidence)} D:${formatScore(s.discipline)} L:${formatScore(s.leadership)} G:${formatScore(s.gratitude)} E:${formatScore(s.enjoyment)} • Avg: ${avgVal}`;
      })
      .join("\n\n");

    const embed = infoEmbed("This Week's Entries", entriesText)
      .setFooter({ text: `NIGEL • ${entries.length} ${entries.length === 1 ? "entry" : "entries"} this week` });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("[Authority Week] Error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to retrieve week data";
    const embed = errorEmbed("Week Retrieval Failed", errorMessage);
    
    await interaction.editReply({ embeds: [embed] });
  }
}

/**
 * Handles the /authority leaderboard subcommand.
 * Shows top users by average authority score.
 */
async function handleLeaderboard(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: false }); // Public by default

  try {
    const period = (interaction.options.getString("period") ?? "week") as "week" | "month" | "all";
    const leaders = await AuthorityService.getLeaderboard(period, 10);

    if (leaders.length === 0) {
      const embed = infoEmbed(
        "No Leaderboard Data",
        `No Authority entries for ${period === "all" ? "all time" : `this ${period}`} yet. Use \`/authority log\` to start tracking.`
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Build leaderboard text
    const medals = ["🥇", "🥈", "🥉"];
    const leaderboardText = leaders
      .map((leader, i) => {
        const rank = i < 3 ? medals[i] : `**${i + 1}.**`;
        const name = leader.displayName || leader.username;
        return `${rank} ${name} — Avg: **${leader.averageScore.toFixed(1)}/10** • Streak: ${leader.currentStreak}d • Entries: ${leader.totalEntries}`;
      })
      .join("\n");

    // Period label
    const periodLabel = 
      period === "week" ? "This Week" :
      period === "month" ? "This Month" :
      "All Time";

    const embed = infoEmbed(`Authority Leaderboard — ${periodLabel}`, leaderboardText)
      .setFooter({ text: "NIGEL • Consistency compounds authority" })
      .setColor(NIGELColors.primary);

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("[Authority Leaderboard] Error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to retrieve leaderboard";
    const embed = errorEmbed("Leaderboard Retrieval Failed", errorMessage);
    
    await interaction.editReply({ embeds: [embed] });
  }
}

export default command;
