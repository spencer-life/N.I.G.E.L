import { supabase } from "../database/client.js";
import { UserRepository } from "../database/UserRepository.js";
import { ScoringService } from "./ScoringService.js";
import { QuestionGeneratorService } from "./QuestionGeneratorService.js";
import type { Question, PracticeFilters } from "../types/database.js";

export interface DrillSessionState {
  sessionId: number | null; // DB session ID
  userId: string;
  internalUserId: number;
  questions: Question[];
  currentIndex: number;
  score: number;
  xpEarned: number;
  startTime: number;
  answers: Array<{
    questionId: number;
    isCorrect: boolean;
    points: number;
    xp: number;
  }>;
}

export interface AnswerResult {
  isCorrect: boolean;
  points: number;
  xp: number;
  streakBonus: number;
  isFinished: boolean;
  correctIndex: number;
  explanation: string | null;
  finalStats: {
    totalScore: number;
    totalXp: number;
    totalQuestions: number;
    correctCount: number;
    newStreak: number;
  } | null;
}

// In-memory cache of session state (backed by database for persistence)
// Sessions are stored in DB metadata column and loaded on demand
const activeDrills = new Map<string, DrillSessionState>();

// Session timeout (30 minutes of inactivity)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export class DrillService {
  /**
   * Loads an active session from the database if it exists.
   * Returns null if no active session found or if session has timed out.
   */
  private static async loadSessionFromDB(discordUserId: string): Promise<DrillSessionState | null> {
    // Get user ID first
    const user = await UserRepository.getByDiscordId(discordUserId);
    if (!user) return null;

    // Find active session
    const { data: session } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!session) return null;

    // Check if session has timed out (30 minutes of inactivity)
    const startTime = session.metadata?.startTime as number;
    if (startTime && Date.now() - startTime > SESSION_TIMEOUT_MS) {
      console.log(`[DrillService] Session ${session.id} timed out, abandoning`);
      await this.abandonSessionBySessionId(session.id);
      return null;
    }

    // Reconstruct state from metadata
    const state: DrillSessionState = {
      sessionId: session.id,
      userId: discordUserId,
      internalUserId: user.id,
      questions: session.metadata.questions || [],
      currentIndex: session.metadata.currentIndex || 0,
      score: session.metadata.score || 0,
      xpEarned: session.metadata.xpEarned || 0,
      startTime: startTime || Date.now(),
      answers: session.metadata.answers || [],
    };

    return state;
  }

  /**
   * Saves the current session state to the database.
   */
  private static async saveSessionToDB(state: DrillSessionState): Promise<void> {
    if (!state.sessionId) return;

    await supabase
      .from("sessions")
      .update({
        metadata: {
          questions: state.questions,
          currentIndex: state.currentIndex,
          score: state.score,
          xpEarned: state.xpEarned,
          startTime: state.startTime,
          answers: state.answers,
          lastActivity: Date.now(),
        },
      })
      .eq("id", state.sessionId);
  }

  /**
   * Starts a new drill session for a user.
   * Creates user if they don't exist.
   * Questions are generated dynamically from the knowledge base.
   */
  static async startSession(
    discordUserId: string,
    count: number = 10,
    username?: string,
    displayName?: string
  ): Promise<DrillSessionState> {
    // Ensure user exists
    const user = await UserRepository.getOrCreate(discordUserId, username, displayName);

    // Generate questions dynamically from knowledge base
    const selectedQuestions = await QuestionGeneratorService.generateQuestions(count);

    const startTime = Date.now();

    // Create session record in database with full state
    const { data: session } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        session_type: "drill",
        status: "active",
        metadata: {
          questions: selectedQuestions,
          currentIndex: 0,
          score: 0,
          xpEarned: 0,
          startTime,
          answers: [],
          lastActivity: startTime,
        },
      })
      .select()
      .single();

    const state: DrillSessionState = {
      sessionId: session?.id ?? null,
      userId: discordUserId,
      internalUserId: user.id,
      questions: selectedQuestions as Question[],
      currentIndex: 0,
      score: 0,
      xpEarned: 0,
      startTime,
      answers: [],
    };

    activeDrills.set(discordUserId, state);
    return state;
  }

  /**
   * Starts a practice session with filters.
   * Practice sessions count toward streaks like regular drills.
   * Questions are generated dynamically from the knowledge base.
   */
  static async startPracticeSession(
    discordUserId: string,
    filters: PracticeFilters,
    username?: string,
    displayName?: string
  ): Promise<DrillSessionState> {
    // Ensure user exists
    const user = await UserRepository.getOrCreate(discordUserId, username, displayName);

    // Generate questions dynamically with filters
    const selectedQuestions = await QuestionGeneratorService.generateQuestions(
      filters.count,
      filters.frameworks,
      filters.difficulty
    );

    const startTime = Date.now();

    // Create session record with full state
    const { data: session } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        session_type: "practice",
        status: "active",
        metadata: {
          questions: selectedQuestions,
          currentIndex: 0,
          score: 0,
          xpEarned: 0,
          startTime,
          answers: [],
          lastActivity: startTime,
          framework_filter: filters.frameworks,
          difficulty_filter: filters.difficulty,
        },
      })
      .select()
      .single();

    const state: DrillSessionState = {
      sessionId: session?.id ?? null,
      userId: discordUserId,
      internalUserId: user.id,
      questions: selectedQuestions as Question[],
      currentIndex: 0,
      score: 0,
      xpEarned: 0,
      startTime,
      answers: [],
    };

    activeDrills.set(discordUserId, state);
    return state;
  }

  /**
   * Gets the current session state for a user.
   * Loads from database if not in memory (survives container restarts).
   */
  static async getSession(discordUserId: string): Promise<DrillSessionState | undefined> {
    // Check memory first
    let state = activeDrills.get(discordUserId);
    if (state) return state;

    // Try loading from database
    state = await this.loadSessionFromDB(discordUserId);
    if (state) {
      activeDrills.set(discordUserId, state);
      console.log(`[DrillService] Restored session ${state.sessionId} from database`);
    }
    return state;
  }

  /**
   * Checks if a user has an active session.
   * Checks both memory and database.
   */
  static async hasActiveSession(discordUserId: string): Promise<boolean> {
    // Check memory first
    if (activeDrills.has(discordUserId)) return true;

    // Check database
    const state = await this.loadSessionFromDB(discordUserId);
    if (state) {
      activeDrills.set(discordUserId, state);
      return true;
    }
    return false;
  }

  /**
   * Processes an answer for the current question.
   */
  static async processAnswer(
    discordUserId: string,
    answerIndex: number,
    responseTimeMs: number,
    username?: string,
    displayName?: string
  ): Promise<AnswerResult> {
    // Try to get session (including from DB if needed)
    let state = await this.getSession(discordUserId);
    if (!state) {
      throw new Error("No active drill session. Start a new drill to continue.");
    }

    const question = state.questions[state.currentIndex];
    const isCorrect = question.correct_option_index === answerIndex;

    // Get current streak for bonus calculation
    const currentStreak = await ScoringService.getStreak(discordUserId);
    const { points, xp, streakBonus } = ScoringService.calculatePoints(
      isCorrect,
      question.difficulty ?? 1,
      responseTimeMs,
      currentStreak
    );

    // Record the answer
    state.answers.push({
      questionId: question.id,
      isCorrect,
      points,
      xp,
    });

    if (isCorrect) {
      state.score += points;
      state.xpEarned += xp;
    } else {
      state.xpEarned += xp; // Participation XP
    }

    // Record attempt in database
    await supabase.from("attempts").insert({
      session_id: state.sessionId,
      user_id: state.internalUserId,
      question_id: question.id,
      answer_text: String(answerIndex),
      is_correct: isCorrect,
      points_awarded: points,
      response_time_ms: responseTimeMs,
    });

    // Move to next question
    state.currentIndex++;
    const isFinished = state.currentIndex >= state.questions.length;

    let finalStats: AnswerResult["finalStats"] = null;

    if (isFinished) {
      // Record final activity and update streak
      const { newStreak } = await ScoringService.recordActivity(
        discordUserId,
        state.score,
        state.xpEarned,
        username,
        displayName
      );

      // Update session as completed
      if (state.sessionId) {
        await supabase
          .from("sessions")
          .update({
            status: "completed",
            ended_at: new Date().toISOString(),
          })
          .eq("id", state.sessionId);
      }

      finalStats = {
        totalScore: state.score,
        totalXp: state.xpEarned,
        totalQuestions: state.questions.length,
        correctCount: state.answers.filter((a) => a.isCorrect).length,
        newStreak,
      };

      // Clean up session
      activeDrills.delete(discordUserId);
    } else {
      // Save updated state to database (for persistence across restarts)
      await this.saveSessionToDB(state);
    }

    return {
      isCorrect,
      points,
      xp,
      streakBonus,
      isFinished,
      correctIndex: question.correct_option_index ?? 0,
      explanation: question.explanation,
      finalStats,
    };
  }

  /**
   * Abandons an active session.
   */
  static async abandonSession(discordUserId: string): Promise<void> {
    const state = await this.getSession(discordUserId);
    if (state?.sessionId) {
      await supabase
        .from("sessions")
        .update({
          status: "abandoned",
          ended_at: new Date().toISOString(),
        })
        .eq("id", state.sessionId);
    }
    activeDrills.delete(discordUserId);
  }

  /**
   * Abandons a session by session ID (used for timeout cleanup).
   */
  private static async abandonSessionBySessionId(sessionId: number): Promise<void> {
    await supabase
      .from("sessions")
      .update({
        status: "abandoned",
        ended_at: new Date().toISOString(),
      })
      .eq("id", sessionId);
  }

  /**
   * Gets the current question for display.
   */
  static async getCurrentQuestion(discordUserId: string): Promise<Question | null> {
    const state = await this.getSession(discordUserId);
    if (!state || state.currentIndex >= state.questions.length) {
      return null;
    }
    return state.questions[state.currentIndex];
  }

  /**
   * Gets session progress info.
   */
  static async getProgress(discordUserId: string): Promise<{ current: number; total: number; score: number } | null> {
    const state = await this.getSession(discordUserId);
    if (!state) return null;
    return {
      current: state.currentIndex + 1,
      total: state.questions.length,
      score: state.score,
    };
  }

  /**
   * Fisher-Yates shuffle for unbiased randomization.
   */
  private static shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
