import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types/discord.js";
import { UserRepository } from "../../database/UserRepository.js";
import { ScoringService } from "../../services/ScoringService.js";
import { formatPhoenixDate } from "../../utils/phoenix.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View your training statistics")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("View another operative's stats (optional)")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser("user") ?? interaction.user;
    const profile = await UserRepository.getFullProfile(targetUser.id);

    if (!profile) {
      const message = targetUser.id === interaction.user.id
        ? "No records found. Complete a drill to initialize your profile."
        : "That operative has no training records.";
      
      await interaction.editReply({ content: message });
      return;
    }

    const { user, stats } = profile;
    const { level, xpToNext, progress } = ScoringService.calculateLevel(stats.experience);

    // XP progress bar
    const progressPercent = Math.round(progress * 100);
    const progressFilled = Math.round(progress * 10);
    const progressBar = "▰".repeat(progressFilled) + "▱".repeat(10 - progressFilled);

    // Calculate time since last activity
    let lastActiveText = "Never";
    if (stats.last_activity_at) {
      lastActiveText = formatPhoenixDate(new Date(stats.last_activity_at));
    }

    const embed = new EmbedBuilder()
      .setTitle(`Operative Profile`)
      .setDescription(
        `**${user.display_name || user.username || "Unknown"}**\n` +
        `Level ${level} Operative`
      )
      .addFields(
        { 
          name: "Points", 
          value: stats.points.toLocaleString(), 
          inline: true 
        },
        { 
          name: "Experience", 
          value: `${stats.experience.toLocaleString()} XP`, 
          inline: true 
        },
        { 
          name: "Level Progress", 
          value: `\`${progressBar}\` ${progressPercent}%\n*${xpToNext} XP to Level ${level + 1}*`, 
          inline: false 
        },
        { 
          name: "Current Streak", 
          value: `${stats.current_streak} day${stats.current_streak !== 1 ? "s" : ""} 🔥`, 
          inline: true 
        },
        { 
          name: "Best Streak", 
          value: `${stats.longest_streak} day${stats.longest_streak !== 1 ? "s" : ""}`, 
          inline: true 
        },
        { 
          name: "Last Active", 
          value: lastActiveText, 
          inline: true 
        }
      )
      .setColor(0x2f3136)
      .setThumbnail(targetUser.displayAvatarURL())
      .setFooter({ text: "NIGEL • Operative Dossier" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

export default command;
