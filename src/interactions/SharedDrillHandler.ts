import {
  ButtonInteraction,
  EmbedBuilder,
} from "discord.js";
import { DrillService } from "../services/DrillService.js";
import { SharedDrillService } from "../services/SharedDrillService.js";
import { ScoringService } from "../services/ScoringService.js";
import { GoogleSheetsService } from "../services/GoogleSheetsService.js";

/**
 * Handles interactions for shared daily drills.
 * Shared drills are community events where everyone answers the same questions.
 */
export class SharedDrillHandler {
  /**
   * Entry point for shared drill button interactions.
   */
  static async handleButton(interaction: ButtonInteraction): Promise<void> {
    const customId = interaction.customId;

    try {
      if (customId === "shared_drill_join") {
        await this.joinDrill(interaction);
      } else if (customId.startsWith("shared_drill_q")) {
        await this.handleAnswer(interaction);
      }
    } catch (error) {
      console.error("[SharedDrillHandler] Error:", error);
      const message =
        error instanceof Error ? error.message : "Unknown error occurred.";

      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: `System fault. ${message}`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `System fault. ${message}`,
          ephemeral: true,
        });
      }
    }
  }

  /**
   * Handles the "Join Drill" button click.
   * Redirects user to the drill thread.
   */
  private static async joinDrill(interaction: ButtonInteraction): Promise<void> {
    const threadId = SharedDrillService.getThreadId();
    if (!threadId) {
      await interaction.reply({
        content: "No active drill found. Please wait for the next daily drill.",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: `Head to <#${threadId}> to start the drill!`,
      ephemeral: true,
    });
  }

  /**
   * Handles an answer button click on a shared drill question.
   */
  private static async handleAnswer(
    interaction: ButtonInteraction
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    // Parse customId: shared_drill_q{index}_a{answerIndex}
    const parts = interaction.customId.split("_");
    const questionIndex = parseInt(parts[2].substring(1), 10); // Remove 'q' prefix
    const answerIndex = parseInt(parts[3].substring(1), 10); // Remove 'a' prefix

    // Check if there's a drill for today
    if (!SharedDrillService.hasDrillForToday()) {
      await interaction.editReply({
        content: "No active drill found. Please wait for the next daily drill.",
      });
      return;
    }

    // Check if user has an active session
    let session = await DrillService.getSession(interaction.user.id);

    // If no session or session is from a different day, create a new one
    if (!session || this.isSessionFromDifferentDay(session)) {
      const questions = SharedDrillService.getAllQuestions();

      // Abandon old session if it exists
      if (session) {
        await DrillService.abandonSession(interaction.user.id);
      }

      // Create new session with today's questions
      session = await this.createSharedDrillSession(
        interaction.user.id,
        interaction.user.username,
        interaction.user.displayName,
        questions
      );

      // Mark user as participant
      SharedDrillService.addParticipant(interaction.user.id);
    }

    // Calculate response time (from message creation)
    const responseTimeMs = Date.now() - interaction.message.createdTimestamp;

    // Process the answer
    const result = await DrillService.processAnswer(
      interaction.user.id,
      answerIndex,
      responseTimeMs,
      interaction.user.username,
      interaction.user.displayName
    );

    // Show feedback
    const feedbackEmbed = this.buildFeedbackEmbed(result);
    await interaction.editReply({ embeds: [feedbackEmbed] });

    // If drill is finished, post results to the thread
    if (result.isFinished && result.finalStats) {
      await this.postResultsToThread(interaction, result.finalStats);
    }
  }

  /**
   * Checks if a session is from a different day than today.
   */
  private static isSessionFromDifferentDay(session: any): boolean {
    const today = new Date().toISOString().split("T")[0];
    const sessionDate = session.startTime
      ? new Date(session.startTime).toISOString().split("T")[0]
      : null;
    return sessionDate !== today;
  }

  /**
   * Creates a new drill session for shared drill participation.
   */
  private static async createSharedDrillSession(
    userId: string,
    username: string,
    displayName: string,
    questions: any[]
  ): Promise<any> {
    // Use DrillService to create the session, but manually set questions
    const session = await DrillService.startSession(
      userId,
      questions.length,
      username,
      displayName
    );

    // Replace the generated questions with today's shared questions
    session.questions = questions;

    return session;
  }

  /**
   * Builds feedback embed after answering a question.
   */
  private static buildFeedbackEmbed(result: {
    isCorrect: boolean;
    points: number;
    xp: number;
    streakBonus: number;
    explanation: string | null;
  }): EmbedBuilder {
    const { isCorrect, points, xp, streakBonus, explanation } = result;

    const title = isCorrect ? "✓ Correct" : "✗ Incorrect";
    const verdict = isCorrect ? "Sharp execution." : "Review required.";

    let description = `**${verdict}**\n\n`;

    if (isCorrect) {
      description += `**+${points}** points`;
      if (streakBonus > 0) {
        description += ` *(includes +${streakBonus} streak bonus)*`;
      }
      description += `\n**+${xp}** XP`;
    } else {
      description += `**+${xp}** XP *(participation)*`;
    }

    if (explanation) {
      description += `\n\n**Doctrine:**\n${explanation}`;
    }

    return new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(isCorrect ? 0x43b581 : 0xf04747);
  }

  /**
   * Posts drill completion results to the thread.
   */
  private static async postResultsToThread(
    interaction: ButtonInteraction,
    stats: {
      totalScore: number;
      totalXp: number;
      totalQuestions: number;
      correctCount: number;
      newStreak: number;
    }
  ): Promise<void> {
    const threadId = SharedDrillService.getThreadId();
    if (!threadId) {
      console.error("[SharedDrillHandler] No thread ID for results posting");
      return;
    }

    try {
      const thread = await interaction.client.channels.fetch(threadId);
      if (!thread?.isThread()) {
        console.error("[SharedDrillHandler] Thread not found or not a thread");
        return;
      }

      const accuracy = Math.round((stats.correctCount / stats.totalQuestions) * 100);
      const { level } = ScoringService.calculateLevel(stats.totalXp);

      // Performance rank emoji
      let rankEmoji: string;
      if (accuracy >= 90) {
        rankEmoji = "🏆";
      } else if (accuracy >= 80) {
        rankEmoji = "🥇";
      } else if (accuracy >= 70) {
        rankEmoji = "🥈";
      } else if (accuracy >= 60) {
        rankEmoji = "🥉";
      } else {
        rankEmoji = "📊";
      }

      const username = interaction.user.displayName || interaction.user.username;
      const streakText = stats.newStreak > 1 ? ` • ${stats.newStreak}🔥` : "";

      const resultsEmbed = new EmbedBuilder()
        .setAuthor({
          name: username,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `${rankEmoji} **${accuracy}%** accuracy (${stats.correctCount}/${stats.totalQuestions})\n` +
          `**+${stats.totalScore}** pts • **Lvl ${level}**${streakText}`
        )
        .setColor(accuracy >= 70 ? 0x43b581 : accuracy >= 50 ? 0xfaa61a : 0xf04747)
        .setFooter({ text: "Drill Completed" })
        .setTimestamp();

      await thread.send({ embeds: [resultsEmbed] });

      // Log to Google Sheets
      const today = new Date().toISOString().split("T")[0];
      void GoogleSheetsService.logUserResult({
        date: today,
        userId: interaction.user.id,
        username,
        accuracy,
        score: stats.totalScore,
        xp: stats.totalXp,
        level,
        streak: stats.newStreak,
      });
    } catch (error) {
      console.error("[SharedDrillHandler] Failed to post results to thread:", error);
    }
  }
}
