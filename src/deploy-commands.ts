import "dotenv/config";
import { REST, Routes } from "discord.js";
import { loadCommands } from "./utils/loader.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function deploy(): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token) {
    throw new Error("DISCORD_TOKEN is required");
  }

  if (!clientId) {
    throw new Error("CLIENT_ID is required");
  }

  // Check for --global flag
  const isGlobal = process.argv.includes("--global");

  if (!isGlobal && !guildId) {
    throw new Error(
      "GUILD_ID is required for guild deployment. Use --global for global deployment."
    );
  }

  // Load all commands
  const commandsDir = join(__dirname, "commands");
  const commands = await loadCommands(commandsDir);

  // Convert to JSON for REST API
  const commandData = commands.map((cmd) => cmd.data.toJSON());

  console.log(`[Deploy] Preparing to register ${commandData.length} commands...`);

  const rest = new REST({ version: "10" }).setToken(token);

  try {
    if (isGlobal) {
      console.log("[Deploy] Registering commands globally (may take up to 1 hour)...");

      await rest.put(Routes.applicationCommands(clientId), {
        body: commandData,
      });

      console.log("[Deploy] Successfully registered global commands.");
    } else {
      console.log(`[Deploy] Registering commands to guild ${guildId}...`);

      await rest.put(Routes.applicationGuildCommands(clientId, guildId!), {
        body: commandData,
      });

      console.log("[Deploy] Successfully registered guild commands (instant).");
    }
  } catch (error) {
    console.error("[Deploy] Failed to register commands:", error);
    process.exit(1);
  }
}

deploy();
