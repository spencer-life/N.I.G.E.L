import {
  ChatInputCommandInteraction,
  Client,
  Collection,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

/**
 * Represents a slash command with its definition and execution logic.
 */
export interface Command {
  /** The slash command definition built with SlashCommandBuilder */
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

  /** Execute the command when invoked */
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

/**
 * Extended Discord.js Client with commands collection attached.
 */
export interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
}
