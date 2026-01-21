import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { DrillService } from "../../services/DrillService.js";
import { infoEmbed, errorEmbed, NIGELColors } from "../../utils/embeds.js";
import type { Command } from "../../types/discord.js";

// Framework options matching knowledge base
const FRAMEWORK_CHOICES = [
  { name: "All Frameworks", value: "all" },
  { name: "6MX (Six-Minute X-Ray)", value: "6MX" },
  { name: "FATE (Focus/Authority/Tribe/Emotion)", value: "FATE" },
  { name: "BTE (Baseline/Trigger/Exception)", value: "BTE" },
  { name: "Elicitation", value: "Elicitation" },
  { name: "Rapport", value: "Rapport" },
  { name: "Influence", value: "Influence" },
  { name: "Body Language", value: "Body Language" },
  { name: "Cognitive Biases", value: "Cognitive Biases" },
  { name: "Profiling", value: "Profiling" },
  { name: "Interrogation", value: "Interrogation" },
];

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("practice")
    .setDescription("Custom practice session with framework and difficulty filters")
    .addStringOption((option) =>
      option
        .setName("framework")
        .setDescription("Filter by framework")
        .setRequired(true)
        .addChoices(...FRAMEWORK_CHOICES)
    )
    .addIntegerOption((option) =>
      option
        .setName("difficulty")
        .setDescription("Difficulty level (1-5)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(5)
    )
    .addIntegerOption((option) =>
      option
        .setName("length")
        .setDescription("Number of questions")
        .setRequired(true)
        .addChoices(
          { name: "5 questions", value: 5 },
          { name: "10 questions", value: 10 },
          { name: "20 questions", value: 20 }
        )
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const framework = interaction.options.getString("framework", true);
    const difficulty = interaction.options.getInteger("difficulty", true);
    const length = interaction.options.getInteger("length", true);

    // Check for existing session
    if (DrillService.hasActiveSession(interaction.user.id)) {
      const embed = errorEmbed(
        "Active Session",
        "You have an unfinished session. Complete it first, or it will be abandoned."
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      await DrillService.abandonSession(interaction.user.id);
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      // Start practice session with filters
      const filters = {
        frameworks: framework === "all" ? undefined : [framework],
        difficulty,
        count: length,
      };

      const state = await DrillService.startPracticeSession(
        interaction.user.id,
        filters,
        interaction.user.username,
        interaction.user.displayName
      );

      // Get framework-specific tip
      const tip = getFrameworkTip(framework);

      // Build start embed
      const filterText = framework === "all" ? "All Frameworks" : framework;
      const description = 
        `**Practice Session Initialized**\n\n` +
        `Framework: ${filterText}\n` +
        `Difficulty: ${"★".repeat(difficulty)}${"☆".repeat(5 - difficulty)}\n` +
        `Questions: ${state.questions.length}\n\n` +
        `${tip}`;

      const embed = infoEmbed("Practice Mode", description)
        .setColor(NIGELColors.primary);

      const startButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("drill_start")
          .setLabel("Begin")
          .setStyle(ButtonStyle.Success)
          .setEmoji("▶️")
      );

      await interaction.editReply({
        embeds: [embed],
        components: [startButton],
      });
    } catch (error) {
      console.error("[Practice Command] Error:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to start practice session";
      
      const embed = errorEmbed("Practice Failed", errorMessage);
      await interaction.editReply({ embeds: [embed] });
    }
  },
};

/**
 * Returns framework-specific tips for practice sessions.
 * Corrected BTE to Baseline/Trigger/Exception.
 */
function getFrameworkTip(framework: string): string {
  const tips: Record<string, string> = {
    "6MX": "Profile first, then calibrate language to the subject's Needs Map.",
    "FATE": "Remember: Without Focus, the rest is noise. Authority, Tribe, and Emotion follow.",
    "BTE": "Baseline → Trigger → Exception. Establish normal before detecting deviation.",
    "Elicitation": "Questions are surgical. Extract without alerting the target.",
    "Rapport": "Mirror first, lead second. Pace before you guide.",
    "Influence": "Reciprocity, scarcity, authority. Leverage triggers, not force.",
    "Body Language": "Context determines meaning. Clusters matter more than single cues.",
    "Cognitive Biases": "Everyone has exploitable heuristics. Awareness is the first defense.",
    "Profiling": "Patterns reveal motive. Look for consistency across domains.",
    "Interrogation": "Control the narrative. Establish baseline, then apply pressure.",
    "all": "Doctrine is precision. Execute.",
  };

  return tips[framework] || "Execute with precision.";
}

export default command;
