import { supabase } from "./client.js";
import type { User, UserStats } from "../types/database.js";

/**
 * Repository for user-related database operations.
 * Handles user registration, lookup, and stats management.
 */
export class UserRepository {
  /**
   * Gets or creates a user by their Discord ID.
   * Also ensures user_stats row exists.
   */
  static async getOrCreate(
    discordUserId: string,
    username?: string,
    displayName?: string,
    avatarUrl?: string
  ): Promise<User> {
    // Try to find existing user
    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("discord_user_id", discordUserId)
      .single();

    if (existing) {
      // Update if info changed
      if (username || displayName || avatarUrl) {
        await supabase
          .from("users")
          .update({
            username: username ?? existing.username,
            display_name: displayName ?? existing.display_name,
            avatar_url: avatarUrl ?? existing.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      }
      return existing as User;
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        discord_user_id: discordUserId,
        username: username ?? null,
        display_name: displayName ?? null,
        avatar_url: avatarUrl ?? null,
      })
      .select()
      .single();

    if (error || !newUser) {
      throw new Error(`Failed to create user: ${error?.message}`);
    }

    // Create initial stats row
    await supabase.from("user_stats").insert({
      user_id: newUser.id,
      points: 0,
      experience: 0,
      current_streak: 0,
      longest_streak: 0,
    });

    return newUser as User;
  }

  /**
   * Gets a user by Discord ID. Returns null if not found.
   */
  static async getByDiscordId(discordUserId: string): Promise<User | null> {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("discord_user_id", discordUserId)
      .single();

    return data as User | null;
  }

  /**
   * Gets a user by internal ID.
   */
  static async getById(userId: number): Promise<User | null> {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    return data as User | null;
  }

  /**
   * Gets user stats by Discord ID.
   */
  static async getStats(discordUserId: string): Promise<UserStats | null> {
    const user = await this.getByDiscordId(discordUserId);
    if (!user) return null;

    const { data } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    return data as UserStats | null;
  }

  /**
   * Gets combined user and stats data.
   */
  static async getFullProfile(
    discordUserId: string
  ): Promise<{ user: User; stats: UserStats } | null> {
    const { data } = await supabase
      .from("users")
      .select(`
        *,
        user_stats (*)
      `)
      .eq("discord_user_id", discordUserId)
      .single();

    if (!data || !data.user_stats) return null;

    return {
      user: data as unknown as User,
      stats: data.user_stats as unknown as UserStats,
    };
  }

  /**
   * Gets the top users by points for leaderboard.
   */
  static async getLeaderboard(
    limit: number = 10
  ): Promise<Array<{ user: User; stats: UserStats }>> {
    const { data } = await supabase
      .from("user_stats")
      .select(`
        *,
        users!inner (*)
      `)
      .order("points", { ascending: false })
      .limit(limit);

    if (!data) return [];

    return data.map((row) => ({
      user: row.users as unknown as User,
      stats: row as unknown as UserStats,
    }));
  }
}
