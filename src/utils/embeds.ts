import { EmbedBuilder, ColorResolvable } from "discord.js";

/**
 * NIGEL color palette.
 */
export const NIGELColors = {
  primary: 0x2f3136,    // Dark, professional
  success: 0x43b581,    // Green for correct/positive
  warning: 0xfaa61a,    // Amber for caution
  error: 0xf04747,      // Red for incorrect/errors
  info: 0x7289da,       // Blue for informational
  muted: 0x4f545c,      // Gray for secondary info
} as const;

/**
 * Creates a standardized NIGEL embed.
 */
export function createEmbed(
  title: string,
  description: string,
  color: ColorResolvable = NIGELColors.primary
): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setFooter({ text: "NIGEL" })
    .setTimestamp();
}

/**
 * Creates a success embed (green).
 */
export function successEmbed(title: string, description: string): EmbedBuilder {
  return createEmbed(title, description, NIGELColors.success);
}

/**
 * Creates an error embed (red).
 */
export function errorEmbed(title: string, description: string): EmbedBuilder {
  return createEmbed(title, description, NIGELColors.error);
}

/**
 * Creates a warning embed (amber).
 */
export function warningEmbed(title: string, description: string): EmbedBuilder {
  return createEmbed(title, description, NIGELColors.warning);
}

/**
 * Creates an info embed (blue).
 */
export function infoEmbed(title: string, description: string): EmbedBuilder {
  return createEmbed(title, description, NIGELColors.info);
}

/**
 * Generates a text-based progress bar.
 */
export function progressBar(
  current: number,
  total: number,
  length: number = 10
): string {
  const filled = Math.round((current / total) * length);
  return "▰".repeat(filled) + "▱".repeat(length - filled);
}

/**
 * Truncates text to a max length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Formats a number with locale separators.
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Converts difficulty number to visual representation.
 */
export function difficultyStars(difficulty: number): string {
  const clamped = Math.max(1, Math.min(5, difficulty));
  return "★".repeat(clamped) + "☆".repeat(5 - clamped);
}
