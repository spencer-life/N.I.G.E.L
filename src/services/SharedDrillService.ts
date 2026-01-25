import type { Question } from "../types/database.js";
import { QuestionGeneratorService } from "./QuestionGeneratorService.js";
import { GoogleSheetsService } from "./GoogleSheetsService.js";

/**
 * Represents a daily shared drill that all users participate in.
 */
export interface DailyDrill {
  date: string; // YYYY-MM-DD format
  threadId: string;
  questions: Question[];
  participants: Set<string>; // Discord user IDs who have started
}

/**
 * Manages shared daily drills - one drill per day that everyone participates in.
 * Questions are generated once at 9 AM and stored for the day.
 */
export class SharedDrillService {
  private static currentDrill: DailyDrill | null = null;

  /**
   * Creates a new daily drill with generated questions.
   * Called by the scheduler at 9 AM.
   */
  static async createDailyDrill(
    threadId: string,
    questionCount: number = 10
  ): Promise<DailyDrill> {
    const date = this.getTodayDate();

    // Generate questions for the day
    const questions = await QuestionGeneratorService.generateQuestions(questionCount);

    // Create drill instance
    const drill: DailyDrill = {
      date,
      threadId,
      questions,
      participants: new Set(),
    };

    // Store as current drill
    this.currentDrill = drill;

    // Log to Google Sheets (best-effort, non-blocking)
    void GoogleSheetsService.logDrillCreation(date, threadId, questions);

    console.log(`[SharedDrill] Created daily drill for ${date} with ${questions.length} questions`);
    return drill;
  }

  /**
   * Gets the current daily drill.
   * Returns null if no drill exists for today.
   */
  static getCurrentDrill(): DailyDrill | null {
    // Check if current drill is still for today
    if (this.currentDrill && this.currentDrill.date === this.getTodayDate()) {
      return this.currentDrill;
    }

    // Drill is stale or doesn't exist
    return null;
  }

  /**
   * Checks if a drill exists for today.
   */
  static hasDrillForToday(): boolean {
    return this.getCurrentDrill() !== null;
  }

  /**
   * Marks a user as a participant in today's drill.
   */
  static addParticipant(userId: string): void {
    const drill = this.getCurrentDrill();
    if (drill) {
      drill.participants.add(userId);
      console.log(`[SharedDrill] User ${userId} joined drill, total participants: ${drill.participants.size}`);
    }
  }

  /**
   * Gets a specific question by index from today's drill.
   */
  static getQuestion(index: number): Question | null {
    const drill = this.getCurrentDrill();
    if (!drill || index < 0 || index >= drill.questions.length) {
      return null;
    }
    return drill.questions[index];
  }

  /**
   * Gets all questions for today's drill.
   */
  static getAllQuestions(): Question[] {
    const drill = this.getCurrentDrill();
    return drill ? drill.questions : [];
  }

  /**
   * Gets the thread ID for today's drill.
   */
  static getThreadId(): string | null {
    const drill = this.getCurrentDrill();
    return drill ? drill.threadId : null;
  }

  /**
   * Gets today's date in YYYY-MM-DD format (Phoenix timezone).
   */
  private static getTodayDate(): string {
    const now = new Date();
    // Convert to Phoenix timezone
    const phoenixTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Phoenix" })
    );
    return phoenixTime.toISOString().split("T")[0];
  }

  /**
   * Clears the current drill (useful for testing).
   */
  static clearDrill(): void {
    this.currentDrill = null;
    console.log("[SharedDrill] Cleared current drill");
  }
}
