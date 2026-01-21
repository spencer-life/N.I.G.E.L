import "dotenv/config";
import { Client, GatewayIntentBits, TextChannel, EmbedBuilder } from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const GUIDE_CHANNEL_NAME = "📖-nigel-guide";

async function main() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) throw new Error("DISCORD_TOKEN is required");

  await client.login(token);
  console.log(`Logged in as ${client.user?.tag}`);

  // Find the guild (assuming the bot is in one main guild for now, or use env var)
  const guildId = process.env.GUILD_ID;
  if (!guildId) throw new Error("GUILD_ID is required");

  const guild = await client.channels.fetch(guildId).catch(() => null) 
    ? await client.guilds.fetch(guildId) 
    : client.guilds.cache.first();

  if (!guild) {
    console.error("Could not find guild.");
    process.exit(1);
  }

  // Find or create the channel
  let channel = guild.channels.cache.find(
    (c) => c.name === GUIDE_CHANNEL_NAME && c.isTextBased()
  ) as TextChannel;

  if (!channel) {
    console.log(`Creating channel #${GUIDE_CHANNEL_NAME}...`);
    channel = await guild.channels.create({
      name: GUIDE_CHANNEL_NAME,
      topic: "NIGEL System Manual & Operating Procedures",
    });
  } else {
    console.log(`Found channel #${GUIDE_CHANNEL_NAME}`);
  }

  // Delete previous guide messages
  try {
    const messages = await channel.messages.fetch({ limit: 10 });
    if (messages.size > 0) {
      await channel.bulkDelete(messages);
      console.log(`Deleted ${messages.size} old messages`);
    }
  } catch (error) {
    console.log("Could not bulk delete (messages may be >14 days old)");
    // Try deleting individually if bulk fails
    try {
      const messages = await channel.messages.fetch({ limit: 10 });
      for (const msg of messages.values()) {
        await msg.delete().catch(() => {});
      }
      console.log("Deleted messages individually");
    } catch {
      console.log("Could not delete old messages");
    }
  }

  // Create Embeds
  const headerEmbed = new EmbedBuilder()
    .setTitle("NIGEL System // Operating Manual")
    .setDescription(
      "**Neural Interactive Guide for Elicitation & Learning**\n\n" +
      "I am NIGEL. I am the central training interface for the S.P.A.R.K. initiative.\n" +
      "My purpose is to drill, instruct, and evaluate operatives on behavioral engineering doctrine."
    )
    .setColor("#2f3136")
    .setThumbnail(client.user?.displayAvatarURL() || "");

  const drillEmbed = new EmbedBuilder()
    .setTitle("1. Daily Drills")
    .setDescription(
      "**Status: ACTIVE**\n" +
      "Every morning at **09:00 Phoenix**, I will transmit a tactical drill.\n\n" +
      "• **Protocol**: Complete immediately to maintain cognitive readiness\n" +
      "• **Scoring**: Accuracy + Speed = Authority Points\n" +
      "• **Streaks**: Daily participation builds your streak multiplier"
    )
    .setColor("#43b581");

  const ragEmbed = new EmbedBuilder()
    .setTitle("2. Doctrine Retrieval (RAG)")
    .setDescription(
      "**Status: ACTIVE**\n" +
      "I have indexed the complete S.P.A.R.K. knowledge base using vector search.\n\n" +
      "• **Usage**: `/ask <query>`\n" +
      "• **Accuracy**: Responses grounded in 6MX and Chase Hughes doctrine\n" +
      "• **Sources**: Citations provided with confidence scores\n" +
      "• **No Hallucination**: If doctrine doesn't exist, I state it clearly"
    )
    .setColor("#43b581");

  const metricsEmbed = new EmbedBuilder()
    .setTitle("3. Authority Metrics")
    .setDescription(
      "**Status: ACTIVE**\n" +
      "Accountability is the currency of authority.\n\n" +
      "• **Usage**: `/authority log` (posts publicly by default)\n" +
      "• **Tracking**: Confidence, Discipline, Leadership, Gratitude, Enjoyment (1-10)\n" +
      "• **Analytics**: `/authority stats` for trends, `/authority week` for current week\n" +
      "• **Streaks**: Daily logging maintains your authority streak\n" +
      "• **Private**: Use `--public:False` to log privately"
    )
    .setColor("#43b581");

  const practiceEmbed = new EmbedBuilder()
    .setTitle("4. Practice Lab")
    .setDescription(
      "**Status: ACTIVE**\n" +
      "Custom training sessions with framework and difficulty filters.\n\n" +
      "• **Usage**: `/practice`\n" +
      "• **Filters**: Choose framework (FATE, 6MX, BTE, etc.) and difficulty (1-5)\n" +
      "• **Length**: 5, 10, or 20 questions\n" +
      "• **Streaks**: Practice sessions maintain your training streak\n" +
      "• **Tips**: Framework-specific guidance provided"
    )
    .setColor("#43b581");

  const footerEmbed = new EmbedBuilder()
    .setDescription(
      "**System Status: Operational**\n\n" +
      "All core systems online.\n" +
      "Daily drills: **09:00 Phoenix**\n" +
      "Weekly leaderboard: **Sunday 20:00 Phoenix**\n\n" +
      "*Consistency compounds. Execute.*"
    )
    .setFooter({ text: "NIGEL v1.0.0" })
    .setTimestamp();

  await channel.send({ 
    embeds: [
      headerEmbed, 
      drillEmbed, 
      ragEmbed, 
      metricsEmbed, 
      practiceEmbed,
      footerEmbed
    ] 
  });

  console.log("Manual posted successfully.");
  process.exit(0);
}

main().catch(console.error);
