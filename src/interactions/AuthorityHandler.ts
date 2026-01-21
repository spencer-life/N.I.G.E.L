import {
  ModalSubmitInteraction,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import { AuthorityService } from "../services/AuthorityService.js";
import { successEmbed, errorEmbed, NIGELColors } from "../utils/embeds.js";
import type { AuthorityScores } from "../types/database.js";

/**
 * Handles authority metrics modal submissions.
 * Modal contains 5 score fields (1-10) for Confidence, Discipline, Leadership, Gratitude, Enjoyment.
 * Notes field omitted due to Discord's 5-field modal limit.
 */
export class AuthorityHandler {
  /**
   * Handles authority log modal submission.
   */
  static async handleModal(interaction: ModalSubmitInteraction): Promise<void> {
    const customId = interaction.customId;

    if (customId.startsWith("authority_log_")) {
      await this.handleLogSubmission(interaction);
    }
  }

  /**
   * Processes the authority log modal submission.
   */
  private static async handleLogSubmission(
    interaction: ModalSubmitInteraction
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Extract public flag from custom ID
      const isPublic = interaction.customId.includes("_public");

      // Get score values from modal fields
      const confidenceStr = interaction.fields.getTextInputValue("confidence");
      const disciplineStr = interaction.fields.getTextInputValue("discipline");
      const leadershipStr = interaction.fields.getTextInputValue("leadership");
      const gratitudeStr = interaction.fields.getTextInputValue("gratitude");
      const enjoymentStr = interaction.fields.getTextInputValue("enjoyment");

      // Validate and parse scores
      const scores: AuthorityScores = {};
      const errors: string[] = [];

      const parseScore = (value: string, name: string): number | undefined => {
        const trimmed = value.trim();
        if (trimmed === "" || trimmed === "-") return undefined;
        
        const num = parseInt(trimmed, 10);
        if (isNaN(num)) {
          errors.push(`${name} must be a number`);
          return undefined;
        }
        if (num < 1 || num > 10) {
          errors.push(`${name} must be between 1-10`);
          return undefined;
        }
        return num;
      };

      scores.confidence = parseScore(confidenceStr, "Confidence");
      scores.discipline = parseScore(disciplineStr, "Discipline");
      scores.leadership = parseScore(leadershipStr, "Leadership");
      scores.gratitude = parseScore(gratitudeStr, "Gratitude");
      scores.enjoyment = parseScore(enjoymentStr, "Enjoyment");

      // Check if at least one score is provided
      const hasAnyScore = Object.values(scores).some((v) => v !== undefined);
      if (!hasAnyScore) {
        errors.push("At least one score is required");
      }

      if (errors.length > 0) {
        const embed = errorEmbed("Invalid Input", errors.join("\n"));
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Log the entry
      const { entry, streak } = await AuthorityService.logEntry(
        interaction.user.id,
        scores,
        null, // Notes omitted due to modal field limit
        interaction.user.username,
        interaction.user.displayName
      );

      // Build response embed with user info
      const responseEmbed = this.buildLogEmbed(
        scores,
        streak.current_streak,
        interaction.user.username,
        interaction.user.displayAvatarURL()
      );

      if (isPublic && interaction.guild && interaction.channel) {
        // Post to channel
        await interaction.channel.send({ embeds: [responseEmbed] });
        
        // Ephemeral confirmation
        const confirmEmbed = successEmbed(
          "Authority Logged",
          `Public entry posted. Current streak: ${streak.current_streak} day${streak.current_streak !== 1 ? "s" : ""}.`
        );
        await interaction.editReply({ embeds: [confirmEmbed] });
      } else {
        // Private response (default)
        await interaction.editReply({ embeds: [responseEmbed] });
      }
    } catch (error) {
      console.error("[AuthorityHandler] Error:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to log authority entry";
      
      const embed = errorEmbed("Logging Failed", errorMessage);
      await interaction.editReply({ embeds: [embed] });
    }
  }

  /**
   * Builds the authority log embed.
   */
  private static buildLogEmbed(
    scores: AuthorityScores,
    streak: number,
    username: string,
    avatarUrl?: string
  ): EmbedBuilder {
    // Calculate average of provided scores
    const providedScores = Object.values(scores).filter(
      (v): v is number => v !== undefined
    );
    const average = providedScores.reduce((a, b) => a + b, 0) / providedScores.length;
    const avgRounded = Math.round(average * 10) / 10;

    // NIGEL voice assessment
    let assessment: string;
    if (avgRounded >= 8.5) {
      assessment = "Exceptional metrics. Your authority presence is surgical.";
    } else if (avgRounded >= 7.0) {
      assessment = "Solid baseline. Room for calibration exists.";
    } else if (avgRounded >= 5.5) {
      assessment = "Adequate. Focused improvement required.";
    } else {
      assessment = "Concerning metrics. Systematic rebuilding recommended.";
    }

    // Format scores
    const formatScore = (value: number | undefined): string => {
      if (value === undefined) return "-";
      return `${value}/10 ${"▰".repeat(value)}${"▱".repeat(10 - value)}`;
    };

    const description = `${assessment}\n\n**Daily Authority Metrics**`;

    const embed = new EmbedBuilder()
      .setTitle("Authority Logged")
      .setAuthor({ name: username, iconURL: avatarUrl })
      .setDescription(description)
      .addFields(
        { name: "Confidence", value: formatScore(scores.confidence), inline: false },
        { name: "Discipline", value: formatScore(scores.discipline), inline: false },
        { name: "Leadership", value: formatScore(scores.leadership), inline: false },
        { name: "Gratitude", value: formatScore(scores.gratitude), inline: false },
        { name: "Enjoyment", value: formatScore(scores.enjoyment), inline: false },
        { name: "Average", value: `${avgRounded}/10`, inline: true },
        { name: "Streak", value: `${streak} day${streak !== 1 ? "s" : ""}`, inline: true }
      )
      .setColor(NIGELColors.success)
      .setFooter({ text: "NIGEL • Logged. Accountability compounds." })
      .setTimestamp();

    return embed;
  }
}
