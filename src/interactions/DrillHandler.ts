import {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { DrillService } from "../services/DrillService.js";
import { ScoringService } from "../services/ScoringService.js";
import type { Question } from "../types/database.js";

/**
 * Handles all drill-related button interactions.
 * NIGEL Voice: Calm, surgical, slightly mischievous. Direct sentences.
 */
export class DrillHandler {
  /**
   * Entry point for drill-related button interactions.
   */
  static async handleButton(interaction: ButtonInteraction): Promise<void> {
    const customId = interaction.customId;

    try {
      if (customId === "drill_start") {
        await this.startDrill(interaction);
      } else if (customId.startsWith("drill_answer_")) {
        await this.handleAnswer(interaction);
      } else if (customId === "drill_next") {
        await this.sendNextQuestion(interaction);
      } else if (customId === "drill_finish") {
        // Already handled in answer processing
        await interaction.deferUpdate();
      }
    } catch (error) {
      console.error("[DrillHandler] Error:", error);
      const message = error instanceof Error ? error.message : "Unknown error occurred.";
      
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
   * Starts a new drill session.
   */
  private static async startDrill(interaction: ButtonInteraction): Promise<void> {
    // Check for existing session
    if (await DrillService.hasActiveSession(interaction.user.id)) {
      await interaction.reply({
        content: "You have an unfinished drill. Complete it first, or it will be abandoned.",
        ephemeral: true,
      });
      await DrillService.abandonSession(interaction.user.id);
      return; // Stop here - interaction already replied
    }

    await interaction.deferReply({ ephemeral: true });

    const state = await DrillService.startSession(
      interaction.user.id,
      10,
      interaction.user.username,
      interaction.user.displayName
    );

    await this.sendQuestion(
      interaction,
      state.questions[0],
      0,
      state.questions.length
    );
  }

  /**
   * Processes an answer selection.
   */
  private static async handleAnswer(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();

    const parts = interaction.customId.split("_");
    const answerIndex = parseInt(parts[parts.length - 1], 10);
    const responseTimeMs = Date.now() - interaction.message.createdTimestamp;

    const result = await DrillService.processAnswer(
      interaction.user.id,
      answerIndex,
      responseTimeMs,
      interaction.user.username,
      interaction.user.displayName
    );

    if (result.isFinished && result.finalStats) {
      await this.showFinalResults(interaction, result.finalStats);
      return;
    }

    // Build feedback embed
    const feedbackEmbed = this.buildFeedbackEmbed(result);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("drill_next")
        .setLabel("Continue →")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.editReply({ embeds: [feedbackEmbed], components: [row] });
  }

  /**
   * Advances to the next question.
   */
  private static async sendNextQuestion(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();

    const progress = await DrillService.getProgress(interaction.user.id);
    const question = await DrillService.getCurrentQuestion(interaction.user.id);

    if (!progress || !question) {
      await interaction.editReply({
        content: "Session expired. Start a new drill.",
        embeds: [],
        components: [],
      });
      return;
    }

    await this.sendQuestion(
      interaction,
      question,
      progress.current - 1,
      progress.total
    );
  }

  /**
   * Displays a question with answer buttons.
   */
  private static async sendQuestion(
    interaction: ButtonInteraction,
    question: Question,
    index: number,
    total: number
  ): Promise<void> {
    // Progress bar visualization
    const progress = Math.round(((index + 1) / total) * 10);
    const progressBar = "▰".repeat(progress) + "▱".repeat(10 - progress);

    // Difficulty indicator
    const difficulty = question.difficulty ?? 1;
    const difficultyStars = "★".repeat(difficulty) + "☆".repeat(5 - difficulty);

    // Framework tags display
    const tags = question.framework_tags.length > 0 
      ? question.framework_tags.join(" • ") 
      : "General";

    const embed = new EmbedBuilder()
      .setTitle(`Drill ${index + 1} of ${total}`)
      .setDescription(
        `**${question.question_text}**\n\n` +
        `\`${progressBar}\` ${index + 1}/${total}`
      )
      .addFields(
        { name: "Difficulty", value: difficultyStars, inline: true },
        { name: "Framework", value: tags, inline: true }
      )
      .setColor(0x2f3136)
      .setFooter({ text: "NIGEL • Select your answer below" });

    const row = new ActionRowBuilder<ButtonBuilder>();
    const options = question.options || [];
    const labels = ["A", "B", "C", "D"];

    // Discord button labels max out at 80 characters - keep safe margin
    options.forEach((opt, i) => {
      const prefix = `${labels[i]}: `;
      const maxLength = 75 - prefix.length; // Conservative limit to prevent cutoff
      const truncated = opt.length > maxLength 
        ? opt.substring(0, maxLength - 3) + "..." 
        : opt;
      
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`drill_answer_${i}`)
          .setLabel(`${prefix}${truncated}`)
          .setStyle(ButtonStyle.Secondary)
      );
    });

    await interaction.editReply({ embeds: [embed], components: [row] });
  }

  /**
   * Builds the feedback embed after an answer.
   */
  private static buildFeedbackEmbed(result: {
    isCorrect: boolean;
    points: number;
    xp: number;
    streakBonus: number;
    explanation: string | null;
  }): EmbedBuilder {
    const { isCorrect, points, xp, streakBonus, explanation } = result;

    // NIGEL voice - direct, surgical feedback
    const title = isCorrect ? "✓ Correct" : "✗ Incorrect";
    const verdict = isCorrect
      ? "Sharp execution."
      : "Review required.";

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
   * Shows the final results after completing all questions.
   */
  private static async showFinalResults(
    interaction: ButtonInteraction,
    stats: {
      totalScore: number;
      totalXp: number;
      totalQuestions: number;
      correctCount: number;
      newStreak: number;
    }
  ): Promise<void> {
    const accuracy = Math.round((stats.correctCount / stats.totalQuestions) * 100);
    const { level, xpToNext, progress } = ScoringService.calculateLevel(stats.totalXp);

    // Performance assessment - NIGEL voice
    let assessment: string;
    if (accuracy >= 90) {
      assessment = "Exceptional performance. Your doctrine retention is precise.";
    } else if (accuracy >= 70) {
      assessment = "Solid execution. Minor calibration recommended.";
    } else if (accuracy >= 50) {
      assessment = "Adequate. Focused review of weak areas advised.";
    } else {
      assessment = "Significant gaps detected. Dedicated study required.";
    }

    const embed = new EmbedBuilder()
      .setTitle("Drill Complete")
      .setDescription(
        `${assessment}\n\n` +
        "**Performance Summary**"
      )
      .addFields(
        { 
          name: "Accuracy", 
          value: `${stats.correctCount}/${stats.totalQuestions} (${accuracy}%)`, 
          inline: true 
        },
        { 
          name: "Points Earned", 
          value: `+${stats.totalScore}`, 
          inline: true 
        },
        { 
          name: "XP Earned", 
          value: `+${stats.totalXp}`, 
          inline: true 
        },
        { 
          name: "Current Streak", 
          value: `${stats.newStreak} day${stats.newStreak !== 1 ? "s" : ""}`, 
          inline: true 
        },
        { 
          name: "Level", 
          value: `${level}`, 
          inline: true 
        },
        { 
          name: "XP to Next", 
          value: `${xpToNext}`, 
          inline: true 
        }
      )
      .setColor(accuracy >= 70 ? 0x43b581 : accuracy >= 50 ? 0xfaa61a : 0xf04747)
      .setFooter({ text: "NIGEL • Training logged" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed], components: [] });

    // Post results to public channel if configured
    await this.postResultsToChannel(interaction, stats, accuracy, level);
  }

  /**
   * Posts drill results to the configured results channel.
   */
  private static async postResultsToChannel(
    interaction: ButtonInteraction,
    stats: {
      totalScore: number;
      totalXp: number;
      totalQuestions: number;
      correctCount: number;
      newStreak: number;
    },
    accuracy: number,
    level: number
  ): Promise<void> {
    const channelId = process.env.DRILL_RESULTS_CHANNEL_ID;
    if (!channelId) {
      console.log("[DrillHandler] DRILL_RESULTS_CHANNEL_ID not configured, skipping public post");
      return;
    }

    try {
      const channel = await interaction.client.channels.fetch(channelId);
      if (!channel?.isTextBased() || channel.isDMBased()) {
        console.error("[DrillHandler] Results channel not found or not a guild text channel");
        return;
      }

      // Performance rank emoji
      let rankEmoji: string;
      if (accuracy >= 90) {
        rankEmoji = "🏆"; // Gold trophy for 90%+
      } else if (accuracy >= 80) {
        rankEmoji = "🥇"; // Gold medal for 80-89%
      } else if (accuracy >= 70) {
        rankEmoji = "🥈"; // Silver medal for 70-79%
      } else if (accuracy >= 60) {
        rankEmoji = "🥉"; // Bronze medal for 60-69%
      } else {
        rankEmoji = "📊"; // Chart for <60%
      }

      // Build concise results message
      const username = interaction.user.displayName || interaction.user.username;
      const streakText = stats.newStreak > 1 ? ` • ${stats.newStreak}🔥` : "";
      
      const resultsEmbed = new EmbedBuilder()
        .setAuthor({ 
          name: username, 
          iconURL: interaction.user.displayAvatarURL() 
        })
        .setDescription(
          `${rankEmoji} **${accuracy}%** accuracy (${stats.correctCount}/${stats.totalQuestions})\n` +
          `**+${stats.totalScore}** pts • **Lvl ${level}**${streakText}`
        )
        .setColor(accuracy >= 70 ? 0x43b581 : accuracy >= 50 ? 0xfaa61a : 0xf04747)
        .setFooter({ text: "Drill Completed" })
        .setTimestamp();

      await channel.send({ embeds: [resultsEmbed] });
    } catch (error) {
      console.error("[DrillHandler] Failed to post results to channel:", error);
      // Don't throw - this is a nice-to-have feature, not critical
    }
  }
}
