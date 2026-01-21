import { ModalSubmitInteraction, GuildMember } from "discord.js";
import { supabase } from "../database/client.js";
import { isAdmin } from "../utils/admin.js";
import { successEmbed, errorEmbed, difficultyStars } from "../utils/embeds.js";

/**
 * Handles the add-question modal submission.
 */
export class AddQuestionHandler {
  /**
   * Processes the add-question modal submission.
   */
  static async handleModal(interaction: ModalSubmitInteraction): Promise<void> {
    // Double-check admin permission (defense in depth)
    if (!isAdmin(interaction.member as GuildMember)) {
      await interaction.reply({
        embeds: [errorEmbed("Access Denied", "Insufficient clearance for this operation.")],
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      // Extract values from modal
      const questionText = interaction.fields.getTextInputValue("question_text").trim();
      const optionsRaw = interaction.fields.getTextInputValue("options").trim();
      const correctIndexStr = interaction.fields.getTextInputValue("correct_index").trim();
      const difficultyStr = interaction.fields.getTextInputValue("difficulty").trim();
      const frameworksRaw = interaction.fields.getTextInputValue("framework_tags").trim();

      // Validate and parse options
      const options = optionsRaw.split(",").map((o) => o.trim()).filter((o) => o.length > 0);
      if (options.length !== 4) {
        await interaction.editReply({
          embeds: [
            errorEmbed(
              "Validation Failed",
              `Expected 4 options, received ${options.length}. Separate with commas.`
            ),
          ],
        });
        return;
      }

      // Validate correct index
      const correctIndex = parseInt(correctIndexStr, 10);
      if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
        await interaction.editReply({
          embeds: [
            errorEmbed(
              "Validation Failed",
              "Correct index must be 0, 1, 2, or 3."
            ),
          ],
        });
        return;
      }

      // Validate difficulty
      const difficulty = parseInt(difficultyStr, 10);
      if (isNaN(difficulty) || difficulty < 1 || difficulty > 5) {
        await interaction.editReply({
          embeds: [
            errorEmbed(
              "Validation Failed",
              "Difficulty must be between 1 and 5."
            ),
          ],
        });
        return;
      }

      // Parse framework tags (optional)
      const frameworkTags = frameworksRaw
        ? frameworksRaw.split(",").map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0)
        : [];

      // Insert into database
      const { data: question, error } = await supabase
        .from("questions")
        .insert({
          question_text: questionText,
          options: options,
          correct_option_index: correctIndex,
          question_type: "drill",
          difficulty,
          framework_tags: frameworkTags,
          is_active: true,
          explanation: null,
        })
        .select()
        .single();

      if (error || !question) {
        throw new Error(error?.message || "Unknown database error");
      }

      // Build confirmation message
      const frameworkDisplay = frameworkTags.length > 0
        ? frameworkTags.map((t) => t.toUpperCase()).join(", ")
        : "None";

      await interaction.editReply({
        embeds: [
          successEmbed(
            "Question Banked",
            `**ID:** ${question.id}\n` +
              `**Difficulty:** ${difficultyStars(difficulty)}\n` +
              `**Frameworks:** ${frameworkDisplay}\n\n` +
              `*Question indexed and active.*`
          ),
        ],
      });
    } catch (error) {
      console.error("[AddQuestionHandler] Error:", error);
      await interaction.editReply({
        embeds: [
          errorEmbed(
            "Database Error",
            "Failed to insert question. Check logs."
          ),
        ],
      });
    }
  }
}
