import { supabase } from "../database/client.js";
import { UserRepository } from "../database/UserRepository.js";
import { getPhoenixDaysDiff } from "../utils/phoenix.js";

export interface PointCalculation {
  points: number;
  xp: number;
  streakBonus: number;
}

export class ScoringService {
  // Point values
  private static readonly BASE_POINTS = 10;
  private static readonly SPEED_BONUS_THRESHOLD_MS = 5000;
  private static readonly SPEED_BONUS = 5;
  private static readonly PARTICIPATION_XP = 5;
  private static readonly XP_MULTIPLIER = 2;
  private static readonly STREAK_BONUS_PER_DAY = 0.1; // 10% per day, max 50%
  private static readonly MAX_STREAK_MULTIPLIER = 1.5;

  /**
   * Calculates points for a question attempt.
   * Factors in difficulty, response time, and streak.
   */
  static calculatePoints(
    isCorrect: boolean,
    difficulty: number = 1,
    responseTimeMs: number = 0,
    currentStreak: number = 0
  ): PointCalculation {
    if (!isCorrect) {
      return { points: 0, xp: this.PARTICIPATION_XP, streakBonus: 0 };
    }

    // Base calculation
    const basePoints = this.BASE_POINTS * Math.max(1, Math.min(5, difficulty));
    
    // Speed bonus (under 5 seconds)
    const speedBonus = responseTimeMs > 0 && responseTimeMs < this.SPEED_BONUS_THRESHOLD_MS 
      ? this.SPEED_BONUS 
      : 0;

    // Streak multiplier (10% per day, max 50% bonus)
    const streakMultiplier = Math.min(
      this.MAX_STREAK_MULTIPLIER,
      1 + (currentStreak * this.STREAK_BONUS_PER_DAY)
    );

    const rawPoints = basePoints + speedBonus;
    const points = Math.round(rawPoints * streakMultiplier);
    const streakBonus = points - rawPoints;

    return {
      points,
      xp: points * this.XP_MULTIPLIER,
      streakBonus,
    };
  }

  /**
   * Records a user's activity and updates their points, XP, and streak.
   * Creates user if they don't exist.
   */
  static async recordActivity(
    discordUserId: string,
    points: number,
    xp: number,
    username?: string,
    displayName?: string
  ): Promise<{ newStreak: number; longestStreak: number }> {
    // Ensure user exists
    const user = await UserRepository.getOrCreate(discordUserId, username, displayName);

    // Get current stats
    const { data: stats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!stats) {
      // Create stats if somehow missing
      const { data: newStats } = await supabase
        .from("user_stats")
        .insert({
          user_id: user.id,
          points,
          experience: xp,
          current_streak: 1,
          longest_streak: 1,
          last_activity_at: new Date().toISOString(),
        })
        .select()
        .single();

      return { newStreak: 1, longestStreak: 1 };
    }

    // Calculate streak based on Phoenix timezone
    const lastActivity = stats.last_activity_at ? new Date(stats.last_activity_at) : null;
    const now = new Date();
    let newStreak = stats.current_streak;

    if (lastActivity) {
      const daysDiff = getPhoenixDaysDiff(lastActivity, now);
      
      if (daysDiff === 0) {
        // Same day - streak stays the same, just update points
      } else if (daysDiff === 1) {
        // Consecutive day - increment streak
        newStreak += 1;
      } else {
        // Missed days - reset streak
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, stats.longest_streak);

    // Update stats atomically
    await supabase
      .from("user_stats")
      .update({
        points: stats.points + points,
        experience: stats.experience + xp,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("user_id", user.id);

    return { newStreak, longestStreak };
  }

  /**
   * Gets the current streak for a user.
   */
  static async getStreak(discordUserId: string): Promise<number> {
    const stats = await UserRepository.getStats(discordUserId);
    return stats?.current_streak ?? 0;
  }

  /**
   * Calculates experience level from total XP.
   * Uses a simple quadratic formula: level = floor(sqrt(xp / 100))
   */
  static calculateLevel(experience: number): { level: number; xpToNext: number; progress: number } {
    const level = Math.floor(Math.sqrt(experience / 100));
    const xpForCurrentLevel = level * level * 100;
    const xpForNextLevel = (level + 1) * (level + 1) * 100;
    const xpToNext = xpForNextLevel - experience;
    const progress = (experience - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel);

    return { level, xpToNext, progress };
  }
}
