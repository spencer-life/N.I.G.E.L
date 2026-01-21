import "dotenv/config";
import { REST, Routes } from "discord.js";

/**
 * Clears all Discord commands (both global and guild-specific).
 * Run this to remove duplicate commands.
 * 
 * Usage:
 *   npm run clear-commands        # Clear guild commands
 *   npm run clear-commands:global # Clear global commands
 *   npm run clear-commands:all    # Clear both
 */

async function clearCommands(): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token) {
    throw new Error("DISCORD_TOKEN is required");
  }

  if (!clientId) {
    throw new Error("CLIENT_ID is required");
  }

  const rest = new REST({ version: "10" }).setToken(token);

  // Check which scope to clear
  const isGlobal = process.argv.includes("--global");
  const isAll = process.argv.includes("--all");

  try {
    if (isAll) {
      // Clear both global and guild commands
      console.log("[Clear] Clearing ALL commands (global and guild)...");

      // Clear global
      await rest.put(Routes.applicationCommands(clientId), { body: [] });
      console.log("[Clear] ✅ Global commands cleared");

      // Clear guild if GUILD_ID is set
      if (guildId) {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
        console.log("[Clear] ✅ Guild commands cleared");
      }

      console.log("[Clear] All commands cleared successfully!");
    } else if (isGlobal) {
      // Clear only global commands
      console.log("[Clear] Clearing global commands...");
      await rest.put(Routes.applicationCommands(clientId), { body: [] });
      console.log("[Clear] ✅ Global commands cleared successfully!");
    } else {
      // Clear only guild commands (default)
      if (!guildId) {
        throw new Error("GUILD_ID is required to clear guild commands");
      }

      console.log(`[Clear] Clearing guild commands for ${guildId}...`);
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
      console.log("[Clear] ✅ Guild commands cleared successfully!");
    }

    console.log("\n[Clear] You can now re-register commands with:");
    console.log("  npm run deploy");
  } catch (error) {
    console.error("[Clear] Failed to clear commands:", error);
    process.exit(1);
  }
}

clearCommands();
