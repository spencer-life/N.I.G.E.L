import "dotenv/config";
import { 
  Client, 
  GatewayIntentBits, 
  ChannelType,
  PermissionFlagsBits,
  CategoryChannel,
  TextChannel
} from "discord.js";

/**
 * One-time setup script to create NIGEL's Discord channels.
 * Creates category and channels with proper emojis and permissions.
 * 
 * Usage: npm run setup-channels
 */

const CATEGORY_NAME = "N.I.G.E.L's Domain";

interface ChannelConfig {
  name: string;
  emoji: string;
  topic: string;
  readOnly?: boolean;
  envKey?: string;
}

const CHANNELS: ChannelConfig[] = [
  {
    name: "nigel-guide",
    emoji: "📖",
    topic: "NIGEL System Manual & Operating Procedures",
    readOnly: true,
  },
  {
    name: "daily-drill",
    emoji: "🎯",
    topic: "Daily training drills - 9 AM Phoenix time",
    envKey: "DAILY_DRILL_CHANNEL_ID",
  },
  {
    name: "practice-lab",
    emoji: "🔬",
    topic: "Custom practice sessions with filters",
  },
  {
    name: "ask-nigel",
    emoji: "🤖",
    topic: "RAG-powered doctrine queries",
  },
  {
    name: "authority-metrics",
    emoji: "📊",
    topic: "Public authority metric logs",
    envKey: "AUTHORITY_CHANNEL_ID",
  },
  {
    name: "leaderboards",
    emoji: "🏆",
    topic: "Weekly rankings and reports",
    envKey: "LEADERBOARD_CHANNEL_ID",
  },
  {
    name: "scenario-room",
    emoji: "🔥",
    topic: "Live scenario training (V2 feature)",
  },
];

async function main() {
  console.log("🚀 NIGEL Channel Setup\n");

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error("❌ DISCORD_TOKEN not found in environment");
    process.exit(1);
  }

  const guildId = process.env.GUILD_ID;
  if (!guildId) {
    console.error("❌ GUILD_ID not found in environment");
    process.exit(1);
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  await client.login(token);
  console.log(`✅ Logged in as ${client.user?.tag}\n`);

  // Fetch guild
  const guild = await client.guilds.fetch(guildId);
  if (!guild) {
    console.error("❌ Could not find guild with ID:", guildId);
    process.exit(1);
  }

  console.log(`📍 Guild: ${guild.name}\n`);

  // Find or create category
  let category = guild.channels.cache.find(
    (c) => c.name === CATEGORY_NAME && c.type === ChannelType.GuildCategory
  ) as CategoryChannel | undefined;

  if (!category) {
    console.log(`📁 Creating category: ${CATEGORY_NAME}`);
    category = await guild.channels.create({
      name: CATEGORY_NAME,
      type: ChannelType.GuildCategory,
    });
    console.log(`   ✅ Created (ID: ${category.id})\n`);
  } else {
    console.log(`   ⚠️  Category already exists (ID: ${category.id})\n`);
  }

  // Create channels
  const envOutput: string[] = [];

  for (const config of CHANNELS) {
    const channelName = `${config.emoji}-${config.name}`;
    
    // Check if channel exists
    const existing = guild.channels.cache.find(
      (c) => c.name === channelName && c.type === ChannelType.GuildText
    ) as TextChannel | undefined;

    if (existing) {
      console.log(`⚠️  Channel #${channelName} already exists`);
      console.log(`   ID: ${existing.id}`);
      
      if (config.envKey) {
        envOutput.push(`${config.envKey}=${existing.id}`);
      }
      continue;
    }

    // Create channel with permissions
    const permissions = config.readOnly
      ? [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.SendMessages],
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
        ]
      : [];

    console.log(`📝 Creating channel: #${channelName}`);
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      topic: config.topic,
      parent: category.id,
      permissionOverwrites: permissions,
    });

    console.log(`   ✅ Created (ID: ${channel.id})`);
    if (config.readOnly) {
      console.log(`   🔒 Read-only permissions applied`);
    }

    if (config.envKey) {
      envOutput.push(`${config.envKey}=${channel.id}`);
    }
  }

  // Output env vars
  if (envOutput.length > 0) {
    console.log("\n" + "=".repeat(60));
    console.log("📋 Add these to your .env file:\n");
    envOutput.forEach((line) => console.log(line));
    console.log("=".repeat(60));
  }

  console.log("\n✅ Channel setup complete!");
  console.log("\nNext steps:");
  console.log("1. Copy the channel IDs above to your .env file");
  console.log("2. Run: npm run send-guide");
  console.log("3. Run: npm run deploy (if commands changed)\n");

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
