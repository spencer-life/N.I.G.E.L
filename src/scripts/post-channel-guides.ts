import "dotenv/config";
import { Client, GatewayIntentBits, TextChannel, EmbedBuilder } from "discord.js";

/**
 * Posts informational guide embeds to each NIGEL channel.
 * Run once after channel setup to provide context.
 * 
 * Usage: npm run post-channel-guides
 */

interface ChannelGuide {
  channelName: string;
  title: string;
  description: string;
  commands?: string;
  tips?: string;
  color: number;
}

const CHANNEL_GUIDES: ChannelGuide[] = [
  {
    channelName: "🎯-daily-drill",
    title: "Daily Drill Protocol",
    description:
      "Every morning at **09:00 Phoenix time**, I post a 10-question tactical drill.\n\n" +
      "This is your daily cognitive assessment. Complete it to maintain your training streak and earn authority points.",
    commands:
      "**Commands:**\n" +
      "`/drill` — Start a manual drill anytime\n" +
      "`/stats` — View your training statistics\n" +
      "`/leaderboard` — Check current standings",
    tips:
      "**Scoring:**\n" +
      "• Speed bonus: Answer within 5 seconds\n" +
      "• Streak multiplier: Daily completion compounds\n" +
      "• Difficulty: Higher difficulty = more points\n\n" +
      "*Consistency separates operatives from tourists.*",
    color: 0x43b581, // Green
  },
  {
    channelName: "🔬-practice-lab",
    title: "Practice Lab",
    description:
      "Custom training sessions tailored to your focus areas.\n\n" +
      "Filter by specific frameworks (FATE, 6MX, BTE, etc.) and difficulty levels to sharpen targeted skills.",
    commands:
      "**Command:**\n" +
      "`/practice` — Start custom session\n\n" +
      "**Options:**\n" +
      "• Framework: Choose specific doctrine or 'All'\n" +
      "• Difficulty: 1-5 (scales point rewards)\n" +
      "• Length: 5, 10, or 20 questions",
    tips:
      "**Notes:**\n" +
      "• Practice sessions count toward your streak\n" +
      "• Framework-specific tips provided during sessions\n" +
      "• Use this to prepare for specific scenarios\n\n" +
      "*Targeted practice builds precision.*",
    color: 0x7289da, // Blue
  },
  {
    channelName: "🤖-ask-nigel",
    title: "Doctrine Retrieval (RAG)",
    description:
      "Query the complete S.P.A.R.K. knowledge base using vector search.\n\n" +
      "I retrieve answers from indexed doctrine—6MX, FATE, BTE, elicitation protocols, and all Chase Hughes materials.",
    commands:
      "**Command:**\n" +
      "`/ask query:<your question>`\n\n" +
      "**Examples:**\n" +
      "• `/ask query:What is the FATE framework?`\n" +
      "• `/ask query:How does the Needs Map work?`\n" +
      "• `/ask query:Explain baseline behavior in BTE`",
    tips:
      "**How It Works:**\n" +
      "• Responses grounded in actual doctrine\n" +
      "• Source citations provided with confidence scores\n" +
      "• If doctrine doesn't exist, I state it clearly\n" +
      "• No hallucination, no speculation\n\n" +
      "*I verify facts. I do not invent them.*",
    color: 0x2f3136, // Dark gray
  },
  {
    channelName: "📊-authority-metrics",
    title: "Authority Metrics Tracking",
    description:
      "Log your daily authority metrics publicly for accountability.\n\n" +
      "Track five core dimensions: **Confidence, Discipline, Leadership, Gratitude, Enjoyment** (1-10 scale).",
    commands:
      "**Commands:**\n" +
      "`/authority log` — Log today's metrics (public by default)\n" +
      "`/authority log --public:False` — Log privately\n" +
      "`/authority stats` — View trends and averages\n" +
      "`/authority week` — This week's entries",
    tips:
      "**Why Track:**\n" +
      "• Daily logging maintains your authority streak\n" +
      "• Public accountability compounds discipline\n" +
      "• Trends reveal patterns you can't see daily\n" +
      "• Data doesn't lie, but you might\n\n" +
      "*Accountability is the currency of authority.*",
    color: 0xfaa61a, // Amber
  },
  {
    channelName: "🏆-leaderboards",
    title: "Authority Rankings",
    description:
      "Weekly performance reports and all-time standings.\n\n" +
      "I post the weekly leaderboard every **Sunday at 20:00 Phoenix time**.",
    commands:
      "**Command:**\n" +
      "`/leaderboard` — View current all-time standings\n" +
      "`/stats` — View your personal statistics",
    tips:
      "**Ranking Factors:**\n" +
      "• Total authority points earned\n" +
      "• Current training streak\n" +
      "• Drill accuracy over time\n\n" +
      "*Competition reveals character. Use it.*",
    color: 0xf1c40f, // Gold
  },
  {
    channelName: "🔥-scenario-room",
    title: "Live Scenario Training",
    description:
      "**Status: Coming in V2**\n\n" +
      "Real-time scenario-based training with live feedback.\n\n" +
      "This channel will host interactive roleplay scenarios, live elicitation exercises, and group training events.",
    commands:
      "**Future Features:**\n" +
      "• Timed scenario challenges\n" +
      "• Multi-user training events\n" +
      "• Live instructor feedback\n" +
      "• Scenario leaderboards",
    tips:
      "*This space is reserved for future operations.*",
    color: 0x99aab5, // Gray (inactive)
  },
];

async function main() {
  console.log("📋 NIGEL Channel Guides Deployment\n");

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error("❌ DISCORD_TOKEN not found");
    process.exit(1);
  }

  const guildId = process.env.GUILD_ID;
  if (!guildId) {
    console.error("❌ GUILD_ID not found");
    process.exit(1);
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  await client.login(token);
  console.log(`✅ Logged in as ${client.user?.tag}\n`);

  const guild = await client.guilds.fetch(guildId);
  if (!guild) {
    console.error("❌ Could not find guild");
    process.exit(1);
  }

  console.log(`📍 Guild: ${guild.name}\n`);

  // Fetch all channels to populate cache
  await guild.channels.fetch();

  // Post guides to each channel
  for (const guide of CHANNEL_GUIDES) {
    try {
      const channel = guild.channels.cache.find(
        (c) => c.name === guide.channelName && c.isTextBased()
      ) as TextChannel | undefined;

      if (!channel) {
        console.log(`⚠️  Channel ${guide.channelName} not found, skipping...`);
        continue;
      }

      // Delete old messages (clean slate)
      try {
        const messages = await channel.messages.fetch({ limit: 10 });
        if (messages.size > 0) {
          await channel.bulkDelete(messages);
          console.log(`   🗑️  Deleted ${messages.size} old messages`);
        }
      } catch (error) {
        console.log(`   ⚠️  Could not delete old messages (may be >14 days old)`);
        // Try individual deletion
        try {
          const messages = await channel.messages.fetch({ limit: 10 });
          for (const msg of messages.values()) {
            await msg.delete().catch(() => {});
          }
        } catch {}
      }

      // Build embed
      const embed = new EmbedBuilder()
        .setTitle(guide.title)
        .setDescription(guide.description)
        .setColor(guide.color)
        .setFooter({ text: "NIGEL • System Guide" })
        .setTimestamp();

      if (guide.commands) {
        embed.addFields({ name: "\u200B", value: guide.commands, inline: false });
      }

      if (guide.tips) {
        embed.addFields({ name: "\u200B", value: guide.tips, inline: false });
      }

      // Post embed
      const message = await channel.send({ embeds: [embed] });
      
      // Pin the message
      try {
        await message.pin();
        console.log(`✅ Posted and pinned guide in ${guide.channelName}`);
      } catch (error) {
        console.log(`✅ Posted guide in ${guide.channelName} (couldn't pin - may need permissions)`);
      }

    } catch (error) {
      console.error(`❌ Error with ${guide.channelName}:`, error);
    }
  }

  console.log("\n✅ All channel guides posted successfully!");
  console.log("\nNote: Guides are pinned for easy reference.\n");

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
