import cron from "node-cron";
import {
  Client,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from "discord.js";
import "dotenv/config";
import { formatPhoenixDate, formatPhoenixTime } from "../utils/phoenix.js";

/**
 * Handles all scheduled tasks for NIGEL.
 * Times are calculated in Phoenix timezone.
 */
export class SchedulerService {
  private static client: Client;

  /**
   * Initializes all scheduled jobs.
   */
  static init(client: Client): void {
    this.client = client;

    // Daily Drill - 09:00 Phoenix
    cron.schedule(
      "0 9 * * *",
      async () => {
        console.log("[Scheduler] Triggering Daily Drill...");
        await this.postDailyDrillInvitation();
      },
      { timezone: "America/Phoenix" }
    );

    // Weekly Leaderboard Update - Sunday 20:00 Phoenix
    cron.schedule(
      "0 20 * * 0",
      async () => {
        console.log("[Scheduler] Triggering Weekly Leaderboard...");
        await this.postWeeklyLeaderboard();
      },
      { timezone: "America/Phoenix" }
    );

    console.log("[Scheduler] All jobs initialized");
  }

  /**
   * Posts the daily drill invitation to the designated channel.
   */
  static async postDailyDrillInvitation(): Promise<void> {
    const channelId = process.env.DAILY_DRILL_CHANNEL_ID;
    if (!channelId) {
      console.error("[Scheduler] DAILY_DRILL_CHANNEL_ID not configured.");
      return;
    }

    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel || !(channel instanceof TextChannel)) {
        console.error("[Scheduler] Invalid channel:", channelId);
        return;
      }

      const now = new Date();
      const dateStr = formatPhoenixDate(now);

      // NIGEL voice - direct, authoritative, hint of personality
      const embed = new EmbedBuilder()
        .setTitle("Daily Drill")
        .setDescription(
          `**${dateStr}**\n\n` +
          "Your morning cognitive assessment is ready.\n\n" +
          "**Today's Parameters:**\n" +
          "• 10 questions, mixed frameworks\n" +
          "• Speed bonus available (<5s)\n" +
          "• Streak multiplier active\n\n" +
          "*Consistency separates operatives from tourists.*"
        )
        .setColor(0x2f3136)
        .setFooter({ text: "NIGEL • Daily Protocol" })
        .setTimestamp();

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("drill_start")
          .setLabel("Begin Drill")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("⚡")
      );

      await channel.send({ embeds: [embed], components: [row] });
      console.log("[Scheduler] Daily drill posted successfully");
    } catch (error) {
      console.error("[Scheduler] Failed to post daily drill:", error);
    }
  }

  /**
   * Posts the weekly leaderboard summary.
   */
  static async postWeeklyLeaderboard(): Promise<void> {
    const channelId = process.env.LEADERBOARD_CHANNEL_ID;
    if (!channelId) {
      console.warn("[Scheduler] LEADERBOARD_CHANNEL_ID not configured.");
      return;
    }

    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel || !(channel instanceof TextChannel)) {
        console.error("[Scheduler] Invalid leaderboard channel:", channelId);
        return;
      }

      // TODO: Implement weekly leaderboard calculation
      // This will query period_scores for the week
      const embed = new EmbedBuilder()
        .setTitle("Weekly Authority Report")
        .setDescription(
          "Week complete. Top performers recognized.\n\n" +
          "*Use `/leaderboard` for full standings.*"
        )
        .setColor(0x7289da)
        .setFooter({ text: "NIGEL • Weekly Report" })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      console.log("[Scheduler] Weekly leaderboard posted");
    } catch (error) {
      console.error("[Scheduler] Failed to post weekly leaderboard:", error);
    }
  }

  /**
   * Manually triggers the daily drill (for testing/admin).
   */
  static async triggerDailyDrill(): Promise<void> {
    await this.postDailyDrillInvitation();
  }
}
