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

// In-memory session store
// MVP: For production, consider Redis or DB-backed sessions
const activeDrills = new Map<string, DrillSessionState>();

export class DrillService {
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

    // Create session record in database
    const { data: session } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        session_type: "drill",
        status: "active",
        metadata: { question_count: selectedQuestions.length },
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
      startTime: Date.now(),
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

    // Create session record
    const { data: session } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        session_type: "practice",
        status: "active",
        metadata: {
          question_count: selectedQuestions.length,
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
      startTime: Date.now(),
      answers: [],
    };

    activeDrills.set(discordUserId, state);
    return state;
  }

  /**
   * Gets the current session state for a user.
   */
  static getSession(discordUserId: string): DrillSessionState | undefined {
    return activeDrills.get(discordUserId);
  }

  /**
   * Checks if a user has an active session.
   */
  static hasActiveSession(discordUserId: string): boolean {
    return activeDrills.has(discordUserId);
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
    const state = activeDrills.get(discordUserId);
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
    const state = activeDrills.get(discordUserId);
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
   * Gets the current question for display.
   */
  static getCurrentQuestion(discordUserId: string): Question | null {
    const state = activeDrills.get(discordUserId);
    if (!state || state.currentIndex >= state.questions.length) {
      return null;
    }
    return state.questions[state.currentIndex];
  }

  /**
   * Gets session progress info.
   */
  static getProgress(discordUserId: string): { current: number; total: number; score: number } | null {
    const state = activeDrills.get(discordUserId);
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
