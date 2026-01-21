import "dotenv/config";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Command, ExtendedClient } from "./types/discord.js";
import { loadCommands } from "./utils/loader.js";
import { routeInteraction } from "./interactions/router.js";
import { SchedulerService } from "./services/SchedulerService.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create client with required intents
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
}) as ExtendedClient;

// Initialize commands collection
client.commands = new Collection<string, Command>();

client.once("ready", async () => {
  const tag = client.user?.tag ?? "unknown";
  console.log(`NIGEL online as ${tag}`);

  // Initialize scheduler
  SchedulerService.init(client);

  // Load commands after client is ready
  try {
    const commandsDir = join(__dirname, "commands");
    client.commands = await loadCommands(commandsDir);
  } catch (error) {
    console.error("Failed to load commands:", error);
  }
});

// Route all interactions through the central router
client.on("interactionCreate", (interaction) => {
  void routeInteraction(interaction);
});

// Validate environment
const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error("DISCORD_TOKEN is required");
}

// Connect to Discord
void client.login(token);
