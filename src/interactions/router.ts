import type {
  ButtonInteraction,
  Interaction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
} from "discord.js";
import type { ExtendedClient } from "../types/discord.js";
import { DrillHandler } from "./DrillHandler.js";
import { AuthorityHandler } from "./AuthorityHandler.js";
import { AddQuestionHandler } from "./AddQuestionHandler.js";

/**
 * Handles slash command interactions by routing to the appropriate command handler.
 */
async function handleCommand(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  const client = interaction.client as ExtendedClient;
  const commandName = interaction.commandName;
  
  // Debug logging
  console.log(`[Router] Received command: ${commandName}`);
  console.log(`[Router] Commands loaded: ${client.commands?.size ?? 0}`);
  
  const command = client.commands?.get(commandName);

  if (!command) {
    console.warn(`[Router] Unknown command: ${commandName}`);
    console.warn(`[Router] Available commands: ${[...client.commands?.keys() ?? []].join(", ")}`);
    await interaction.reply({
      content: "Unknown command. Try again or check /help.",
      ephemeral: true,
    });
    return;
  }

  console.log(`[Router] Executing: ${commandName}`);
  await command.execute(interaction);
}

/**
 * Handles button interactions.
 */
async function handleButton(interaction: ButtonInteraction): Promise<void> {
  console.log(`[Router] Button clicked: ${interaction.customId}`);

  if (interaction.customId.startsWith("drill_")) {
    await DrillHandler.handleButton(interaction);
    return;
  }

  await interaction.reply({
    content: "Button handler not yet fully implemented for this type.",
    ephemeral: true,
  });
}

/**
 * Handles modal submit interactions.
 */
async function handleModal(interaction: ModalSubmitInteraction): Promise<void> {
  console.log(`[Router] Modal submitted: ${interaction.customId}`);

  if (interaction.customId.startsWith("authority_log_")) {
    await AuthorityHandler.handleModal(interaction);
    return;
  }

  if (interaction.customId === "add_question_modal") {
    await AddQuestionHandler.handleModal(interaction);
    return;
  }

  // Future handlers can be added here
  await interaction.reply({
    content: "Modal handler not yet implemented.",
    ephemeral: true,
  });
}

/**
 * Handles string select menu interactions.
 * Placeholder for future implementation.
 */
async function handleSelectMenu(
  interaction: StringSelectMenuInteraction
): Promise<void> {
  console.log(`[Router] Select menu used: ${interaction.customId}`);

  // Future: Route based on customId prefix (e.g., "framework_", "difficulty_")
  await interaction.reply({
    content: "Select menu handler not yet implemented.",
    ephemeral: true,
  });
}

/**
 * Central interaction router. Attach this to the client's interactionCreate event.
 * Routes interactions to appropriate handlers and catches all errors.
 */
export async function routeInteraction(interaction: Interaction): Promise<void> {
  try {
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction);
    } else if (interaction.isButton()) {
      await handleButton(interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModal(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction);
    }
    // Autocomplete, context menus, etc. can be added here as needed
  } catch (error) {
    console.error("[Router] Interaction error:", error);

    // Attempt to send an error response to the user
    const errorMessage = "Something went wrong. Please try again.";

    try {
      if (interaction.isRepliable()) {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      }
    } catch (replyError) {
      // If we can't even reply, just log it
      console.error("[Router] Failed to send error response:", replyError);
    }
  }
}
