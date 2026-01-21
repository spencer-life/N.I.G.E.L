import { Collection } from "discord.js";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Command } from "../types/discord.js";

/**
 * Validates that an object conforms to the Command interface.
 */
function isValidCommand(obj: unknown): obj is Command {
  if (typeof obj !== "object" || obj === null) return false;
  const cmd = obj as Record<string, unknown>;
  return (
    "data" in cmd &&
    typeof cmd.data === "object" &&
    cmd.data !== null &&
    "name" in (cmd.data as Record<string, unknown>) &&
    "execute" in cmd &&
    typeof cmd.execute === "function"
  );
}

/**
 * Recursively loads all command files from the commands directory.
 * Each command file must export a default Command object.
 *
 * @param commandsDir - Absolute path to the commands directory
 * @returns Collection of commands keyed by command name
 */
export async function loadCommands(
  commandsDir: string
): Promise<Collection<string, Command>> {
  const commands = new Collection<string, Command>();

  async function scanDirectory(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        await scanDirectory(fullPath);
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".js")) {
        // Skip test files and type definitions
        if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".d.ts")) {
          continue;
        }

        try {
          const fileUrl = pathToFileURL(fullPath).href;
          const module = (await import(fileUrl)) as { default?: unknown };

          if (!module.default) {
            console.warn(`[Loader] No default export in ${fullPath}`);
            continue;
          }

          if (!isValidCommand(module.default)) {
            console.warn(`[Loader] Invalid command structure in ${fullPath}`);
            continue;
          }

          const command = module.default;
          const commandName = command.data.name;

          if (commands.has(commandName)) {
            console.warn(
              `[Loader] Duplicate command name "${commandName}" in ${fullPath}`
            );
            continue;
          }

          commands.set(commandName, command);
          console.log(`[Loader] Loaded command: ${commandName}`);
        } catch (error) {
          console.error(`[Loader] Failed to load ${fullPath}:`, error);
        }
      }
    }
  }

  await scanDirectory(commandsDir);
  console.log(`[Loader] Total commands loaded: ${commands.size}`);

  return commands;
}
