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
import { SharedDrillService } from "./SharedDrillService.js";
import type { Question } from "../types/database.js";

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
   * Creates a public thread and posts all questions.
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
        .setTitle("🎯 Daily Drill")
        .setDescription(
          `**${dateStr}**\n\n` +
          "Your morning cognitive assessment is ready.\n\n" +
          "**Today's Parameters:**\n" +
          "• 10 questions, mixed frameworks\n" +
          "• Speed bonus available (<5s)\n" +
          "• Streak multiplier active\n" +
          "• Public thread - learn from your peers\n\n" +
          "*Consistency separates operatives from tourists.*"
        )
        .setColor(0x2f3136)
        .setFooter({ text: "NIGEL • Community Drill" })
        .setTimestamp();

      // Post main message
      const mainMessage = await channel.send({ embeds: [embed] });

      // Create public thread
      const thread = await mainMessage.startThread({
        name: `Daily Drill - ${dateStr}`,
        autoArchiveDuration: 1440, // 24 hours
        reason: "Daily drill thread",
      });

      // Create the daily drill and get questions
      const drill = await SharedDrillService.createDailyDrill(thread.id, 10);

      // Post all questions in the thread
      await this.postQuestionsToThread(thread, drill.questions);

      // Update main message with join button
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("shared_drill_join")
          .setLabel("📋 Join Drill →")
          .setStyle(ButtonStyle.Primary)
      );

      await mainMessage.edit({
        embeds: [embed],
        components: [row],
      });

      console.log(`[Scheduler] Daily drill posted successfully with thread ${thread.id}`);
    } catch (error) {
      console.error("[Scheduler] Failed to post daily drill:", error);
    }
  }

  /**
   * Posts all questions to the thread with answer buttons.
   */
  private static async postQuestionsToThread(
    thread: any,
    questions: Question[]
  ): Promise<void> {
    const labels = ["A", "B", "C", "D"];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      // Progress bar visualization
      const progress = Math.round(((i + 1) / questions.length) * 10);
      const progressBar = "▰".repeat(progress) + "▱".repeat(10 - progress);

      // Difficulty indicator
      const difficulty = question.difficulty ?? 1;
      const difficultyStars = "★".repeat(difficulty) + "☆".repeat(5 - difficulty);

      // Framework tags display
      const tags =
        question.framework_tags.length > 0
          ? question.framework_tags.join(" • ")
          : "General";

      const embed = new EmbedBuilder()
        .setTitle(`Question ${i + 1} of ${questions.length}`)
        .setDescription(
          `**${question.question_text}**\n\n` +
          `\`${progressBar}\` ${i + 1}/${questions.length}`
        )
        .addFields(
          { name: "Difficulty", value: difficultyStars, inline: true },
          { name: "Framework", value: tags, inline: true }
        )
        .setColor(0x2f3136)
        .setFooter({ text: "NIGEL • Select your answer below" });

      // Create answer buttons with truncation
      const row = new ActionRowBuilder<ButtonBuilder>();
      const options = question.options || [];

      options.forEach((opt, optIndex) => {
        const prefix = `${labels[optIndex]}· `;
        const maxLength = 55; // Conservative limit
        const maxAnswerLength = maxLength - prefix.length;
        const truncated =
          opt.length > maxAnswerLength
            ? opt.substring(0, maxAnswerLength - 3) + "..."
            : opt;

        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`shared_drill_q${i}_a${optIndex}`)
            .setLabel(`${prefix}${truncated}`)
            .setStyle(ButtonStyle.Secondary)
        );
      });

      await thread.send({ embeds: [embed], components: [row] });

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Post completion message
    const completionEmbed = new EmbedBuilder()
      .setTitle("Complete All Questions")
      .setDescription(
        "Answer all 10 questions above to complete the drill.\n\n" +
        "Your results will be posted here when you finish.\n\n" +
        "*Good luck, operative.*"
      )
      .setColor(0x43b581)
      .setFooter({ text: "NIGEL • Daily Protocol" });

    await thread.send({ embeds: [completionEmbed] });
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
