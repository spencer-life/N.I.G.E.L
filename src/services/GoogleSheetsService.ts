import type { Question } from "../types/database.js";

/**
 * Service for logging drill data to Google Sheets via Apps Script webhook.
 * This provides historical tracking and analytics without requiring API keys.
 */
export class GoogleSheetsService {
  private static webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  /**
   * Logs the creation of a daily drill to Google Sheets.
   * This is best-effort - failures won't crash the bot.
   */
  static async logDrillCreation(
    date: string,
    threadId: string,
    questions: Question[]
  ): Promise<void> {
    if (!this.webhookUrl) {
      console.log("[GoogleSheets] GOOGLE_SHEETS_WEBHOOK_URL not configured, skipping log");
      return;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "logDrill",
          date,
          threadId,
          questions,
        }),
      });

      if (!response.ok) {
        console.error(
          `[GoogleSheets] Failed to log drill creation: ${response.status} ${response.statusText}`
        );
      } else {
        console.log(`[GoogleSheets] Successfully logged drill creation for ${date}`);
      }
    } catch (error) {
      console.error("[GoogleSheets] Error logging drill creation:", error);
      // Don't throw - logging is best-effort
    }
  }

  /**
   * Logs a user's drill completion results to Google Sheets.
   * This is best-effort - failures won't crash the bot.
   */
  static async logUserResult(result: {
    date: string;
    userId: string;
    username: string;
    accuracy: number;
    score: number;
    xp: number;
    level: number;
    streak: number;
  }): Promise<void> {
    if (!this.webhookUrl) {
      console.log("[GoogleSheets] GOOGLE_SHEETS_WEBHOOK_URL not configured, skipping log");
      return;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "logResult",
          ...result,
        }),
      });

      if (!response.ok) {
        console.error(
          `[GoogleSheets] Failed to log user result: ${response.status} ${response.statusText}`
        );
      } else {
        console.log(`[GoogleSheets] Successfully logged result for ${result.username}`);
      }
    } catch (error) {
      console.error("[GoogleSheets] Error logging user result:", error);
      // Don't throw - logging is best-effort
    }
  }
}
