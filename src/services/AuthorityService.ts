import { supabase } from "../database/client.js";
import { UserRepository } from "../database/UserRepository.js";
import { getPhoenixDateString, getPhoenixDaysDiff, getPhoenixWeekStart } from "../utils/phoenix.js";
import type { 
  AuthorityEntry, 
  AuthorityScores, 
  AuthorityStreak,
  AuthorityStats 
} from "../types/database.js";

/**
 * Authority Metrics Service
 * Handles logging, streak tracking, and statistics for Authority metrics.
 */
export class AuthorityService {
  /**
   * Logs a new authority entry for a user.
   * Automatically updates streaks.
   */
  static async logEntry(
    discordUserId: string,
    scores: AuthorityScores,
    notes: string | null,
    username?: string,
    displayName?: string
  ): Promise<{ entry: AuthorityEntry; streak: AuthorityStreak }> {
    // Ensure user exists
    const user = await UserRepository.getOrCreate(discordUserId, username, displayName);
    
    // Use Phoenix timezone for entry date
    const entryDate = getPhoenixDateString();
    
    // Insert or update entry (unique constraint on user_id + entry_date)
    const { data: entry, error } = await supabase
      .from("authority_entries")
      .upsert({
        user_id: user.id,
        entry_date: entryDate,
        scores,
        notes,
      })
      .select()
      .single();
    
    if (error || !entry) {
      throw new Error(`Failed to log authority entry: ${error?.message}`);
    }
    
    // Update streak
    const streak = await this.updateStreak(user.id, entryDate);
    
    return { entry: entry as AuthorityEntry, streak };
  }

  /**
   * Updates authority streak based on entry date.
   * Follows same logic as drill streaks (Phoenix timezone).
   */
  static async updateStreak(
    userId: number,
    entryDate: string
  ): Promise<AuthorityStreak> {
    // Get existing streak record
    const { data: existing } = await supabase
      .from("authority_streaks")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    const entryDateObj = new Date(entryDate + "T00:00:00Z");
    
    let currentStreak = 1;
    let longestStreak = 1;
    
    if (existing) {
      if (existing.last_entry_date) {
        const lastEntryDate = new Date(existing.last_entry_date + "T00:00:00Z");
        const daysDiff = getPhoenixDaysDiff(lastEntryDate, entryDateObj);
        
        if (daysDiff === 0) {
          // Same day - keep current streak
          currentStreak = existing.current_streak;
        } else if (daysDiff === 1) {
          // Consecutive day - increment
          currentStreak = existing.current_streak + 1;
        } else {
          // Missed days - reset
          currentStreak = 1;
        }
      }
      
      longestStreak = Math.max(currentStreak, existing.longest_streak);
    }
    
    // Upsert streak record
    const { data: streak } = await supabase
      .from("authority_streaks")
      .upsert({
        user_id: userId,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_entry_date: entryDate,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    return streak as AuthorityStreak;
  }

  /**
   * Gets aggregated statistics for a user.
   */
  static async getPersonalStats(discordUserId: string): Promise<AuthorityStats | null> {
    const user = await UserRepository.getByDiscordId(discordUserId);
    if (!user) return null;
    
    // Get all entries
    const { data: entries } = await supabase
      .from("authority_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: true });
    
    if (!entries || entries.length === 0) return null;
    
    // Get streak info
    const { data: streak } = await supabase
      .from("authority_streaks")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    // Calculate averages
    const totals = {
      confidence: 0,
      discipline: 0,
      leadership: 0,
      gratitude: 0,
      enjoyment: 0,
    };
    
    const counts = {
      confidence: 0,
      discipline: 0,
      leadership: 0,
      gratitude: 0,
      enjoyment: 0,
    };
    
    entries.forEach((entry: AuthorityEntry) => {
      const scores = entry.scores;
      if (scores.confidence) { totals.confidence += scores.confidence; counts.confidence++; }
      if (scores.discipline) { totals.discipline += scores.discipline; counts.discipline++; }
      if (scores.leadership) { totals.leadership += scores.leadership; counts.leadership++; }
      if (scores.gratitude) { totals.gratitude += scores.gratitude; counts.gratitude++; }
      if (scores.enjoyment) { totals.enjoyment += scores.enjoyment; counts.enjoyment++; }
    });
    
    const averages: AuthorityScores = {
      confidence: counts.confidence > 0 ? Math.round((totals.confidence / counts.confidence) * 10) / 10 : undefined,
      discipline: counts.discipline > 0 ? Math.round((totals.discipline / counts.discipline) * 10) / 10 : undefined,
      leadership: counts.leadership > 0 ? Math.round((totals.leadership / counts.leadership) * 10) / 10 : undefined,
      gratitude: counts.gratitude > 0 ? Math.round((totals.gratitude / counts.gratitude) * 10) / 10 : undefined,
      enjoyment: counts.enjoyment > 0 ? Math.round((totals.enjoyment / counts.enjoyment) * 10) / 10 : undefined,
    };
    
    // Calculate trends (last 7 days vs previous 7 days)
    const trends = {
      confidence: 0,
      discipline: 0,
      leadership: 0,
      gratitude: 0,
      enjoyment: 0,
    };
    
    if (entries.length >= 2) {
      const recentEntries = entries.slice(-7);
      const previousEntries = entries.slice(-14, -7);
      
      const calcAvg = (arr: AuthorityEntry[], key: keyof AuthorityScores): number => {
        const values = arr.map(e => e.scores[key]).filter((v): v is number => v !== undefined);
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      };
      
      if (recentEntries.length > 0 && previousEntries.length > 0) {
        trends.confidence = calcAvg(recentEntries, "confidence") - calcAvg(previousEntries, "confidence");
        trends.discipline = calcAvg(recentEntries, "discipline") - calcAvg(previousEntries, "discipline");
        trends.leadership = calcAvg(recentEntries, "leadership") - calcAvg(previousEntries, "leadership");
        trends.gratitude = calcAvg(recentEntries, "gratitude") - calcAvg(previousEntries, "gratitude");
        trends.enjoyment = calcAvg(recentEntries, "enjoyment") - calcAvg(previousEntries, "enjoyment");
      }
    }
    
    return {
      averages,
      trends,
      currentStreak: streak?.current_streak || 0,
      longestStreak: streak?.longest_streak || 0,
      totalEntries: entries.length,
      lastEntryDate: streak?.last_entry_date || null,
    };
  }

  /**
   * Gets entries for the current week (Monday-Sunday, Phoenix timezone).
   */
  static async getWeekEntries(discordUserId: string): Promise<AuthorityEntry[]> {
    const user = await UserRepository.getByDiscordId(discordUserId);
    if (!user) return [];
    
    const weekStart = getPhoenixWeekStart();
    
    const { data: entries } = await supabase
      .from("authority_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("entry_date", weekStart)
      .order("entry_date", { ascending: true });
    
    return (entries as AuthorityEntry[]) || [];
  }

  /**
   * Checks if a user has logged authority today.
   */
  static async hasLoggedToday(discordUserId: string): Promise<boolean> {
    const user = await UserRepository.getByDiscordId(discordUserId);
    if (!user) return false;
    
    const today = getPhoenixDateString();
    
    const { data } = await supabase
      .from("authority_entries")
      .select("id")
      .eq("user_id", user.id)
      .eq("entry_date", today)
      .single();
    
    return !!data;
  }

  /**
   * Gets the authority leaderboard for a given period.
   * 
   * @param period - "week", "month", or "all"
   * @param limit - Number of top users to return (default 10)
   */
  static async getLeaderboard(
    period: "week" | "month" | "all" = "week",
    limit: number = 10
  ): Promise<Array<{
    username: string;
    displayName: string | null;
    averageScore: number;
    currentStreak: number;
    totalEntries: number;
  }>> {
    // Calculate period start date
    let periodStart: string | null = null;
    const now = new Date();
    
    if (period === "week") {
      periodStart = getPhoenixWeekStart();
    } else if (period === "month") {
      // First day of current month in Phoenix timezone
      const phoenixNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Phoenix" }));
      const year = phoenixNow.getFullYear();
      const month = phoenixNow.getMonth();
      const firstDay = new Date(year, month, 1);
      periodStart = firstDay.toISOString().split("T")[0];
    }
    // If "all", periodStart remains null (no filter)

    // Build query
    let query = supabase
      .from("authority_entries")
      .select(`
        user_id,
        scores,
        users!inner (
          username,
          display_name
        )
      `);

    if (periodStart) {
      query = query.gte("entry_date", periodStart);
    }

    const { data: entries, error } = await query;

    if (error) {
      console.error("[AuthorityService] Leaderboard query error:", error);
      throw new Error(`Failed to fetch leaderboard: ${error.message}`);
    }

    if (!entries || entries.length === 0) {
      return [];
    }

    // Group by user and calculate averages
    const userStats = new Map<number, {
      username: string;
      displayName: string | null;
      scores: number[];
      entryCount: number;
    }>();

    entries.forEach((entry: any) => {
      const userId = entry.user_id;
      const scores = entry.scores;
      const user = entry.users;

      if (!userStats.has(userId)) {
        userStats.set(userId, {
          username: user.username || "Unknown",
          displayName: user.display_name,
          scores: [],
          entryCount: 0,
        });
      }

      const stats = userStats.get(userId)!;
      stats.entryCount++;

      // Calculate average score for this entry (excluding undefined values)
      const scoreValues = Object.values(scores).filter((v): v is number => v !== undefined);
      if (scoreValues.length > 0) {
        const entryAvg = scoreValues.reduce((a: number, b: number) => a + b, 0) / scoreValues.length;
        stats.scores.push(entryAvg);
      }
    });

    // Get streaks for all users
    const userIds = Array.from(userStats.keys());
    const { data: streaks } = await supabase
      .from("authority_streaks")
      .select("user_id, current_streak")
      .in("user_id", userIds);

    const streakMap = new Map<number, number>();
    if (streaks) {
      streaks.forEach((s: any) => {
        streakMap.set(s.user_id, s.current_streak || 0);
      });
    }

    // Calculate final averages and build result
    const leaderboard = Array.from(userStats.entries()).map(([userId, stats]) => ({
      username: stats.username,
      displayName: stats.displayName,
      averageScore: stats.scores.length > 0
        ? Math.round((stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length) * 10) / 10
        : 0,
      currentStreak: streakMap.get(userId) || 0,
      totalEntries: stats.entryCount,
    }));

    // Sort by average score (descending), then by streak
    leaderboard.sort((a, b) => {
      if (b.averageScore !== a.averageScore) {
        return b.averageScore - a.averageScore;
      }
      return b.currentStreak - a.currentStreak;
    });

    return leaderboard.slice(0, limit);
  }
}
