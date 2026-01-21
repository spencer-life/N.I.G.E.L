import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  GuildMember,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import type { Command } from "../../types/discord.js";
import { isAdmin } from "../../utils/admin.js";
import { errorEmbed } from "../../utils/embeds.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("add-question")
    .setDescription("Add a new drill question to the bank (Admin only)"),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Permission check
    if (!isAdmin(interaction.member as GuildMember)) {
      await interaction.reply({
        embeds: [errorEmbed("Access Denied", "Insufficient clearance for this operation.")],
        ephemeral: true,
      });
      return;
    }

    // Build the modal
    const modal = new ModalBuilder()
      .setCustomId("add_question_modal")
      .setTitle("Add Drill Question");

    // Question text
    const questionInput = new TextInputBuilder()
      .setCustomId("question_text")
      .setLabel("Question")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Enter the question text")
      .setRequired(true)
      .setMaxLength(1000);

    // Options (comma-separated)
    const optionsInput = new TextInputBuilder()
      .setCustomId("options")
      .setLabel("Options (comma-separated, 4 required)")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Option A, Option B, Option C, Option D")
      .setRequired(true)
      .setMaxLength(1000);

    // Correct index and difficulty on same conceptual row (but Discord requires separate rows)
    const correctIndexInput = new TextInputBuilder()
      .setCustomId("correct_index")
      .setLabel("Correct answer index (0-3)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("0")
      .setRequired(true)
      .setMaxLength(1);

    const difficultyInput = new TextInputBuilder()
      .setCustomId("difficulty")
      .setLabel("Difficulty (1-5)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("3")
      .setRequired(true)
      .setMaxLength(1);

    // Framework tags
    const frameworkInput = new TextInputBuilder()
      .setCustomId("framework_tags")
      .setLabel("Framework tags (comma-separated)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("FATE, 6MX, rapport")
      .setRequired(false)
      .setMaxLength(200);

    // Build action rows (each input needs its own row in Discord modals)
    const rows = [
      new ActionRowBuilder<TextInputBuilder>().addComponents(questionInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(optionsInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(correctIndexInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(difficultyInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(frameworkInput),
    ];

    modal.addComponents(...rows);

    await interaction.showModal(modal);
  },
};

export default command;
