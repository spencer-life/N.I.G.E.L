// Database row types - aligned with schema.sql
// Note: Supabase returns bigint as number, dates as ISO strings

export interface User {
  id: number;
  discord_user_id: string; // Stored as bigint but handled as string for Discord.js compatibility
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  user_id: number;
  points: number;
  experience: number;
  current_streak: number;
  longest_streak: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  name: string;
  source: string | null;
  doc_type: string | null;
  content_hash: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Chunk {
  id: number;
  document_id: number;
  section: string | null;
  content: string;
  framework_tags: string[];
  token_count: number | null;
  embedding: number[]; // vector(768)
  created_at: string;
}

export interface Question {
  id: number;
  question_text: string;
  answer_text: string | null;
  options: string[] | null;
  correct_option_index: number | null;
  question_type: "drill" | "scenario" | "practice";
  difficulty: number | null;
  framework_tags: string[];
  source_document_id: number | null;
  is_active: boolean;
  explanation: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: number;
  user_id: number;
  session_type: "drill" | "practice" | "live";
  status: "active" | "completed" | "abandoned";
  metadata: SessionMetadata;
  started_at: string;
  ended_at: string | null;
}

export interface SessionMetadata {
  question_count?: number;
  framework_filter?: string[];
  difficulty_filter?: number;
}

export interface Attempt {
  id: number;
  session_id: number | null;
  user_id: number;
  question_id: number;
  answer_text: string | null;
  is_correct: boolean;
  points_awarded: number;
  response_time_ms: number | null;
  created_at: string;
}

export interface AuthorityEntry {
  id: number;
  user_id: number;
  entry_date: string;
  scores: AuthorityScores;
  notes: string | null;
  created_at: string;
}

export interface AuthorityScores {
  confidence?: number;
  discipline?: number;
  leadership?: number;
  gratitude?: number;
  enjoyment?: number;
}

export interface AuthorityStreak {
  user_id: number;
  current_streak: number;
  longest_streak: number;
  last_entry_date: string | null;
  updated_at: string;
}

export interface PeriodScore {
  id: number;
  user_id: number;
  period_type: "weekly" | "monthly" | "yearly";
  period_start: string;
  period_end: string;
  points: number;
  rank: number | null;
  created_at: string;
}

export interface Badge {
  id: number;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  criteria: Record<string, unknown>;
  created_at: string;
}

export interface UserBadge {
  id: number;
  user_id: number;
  badge_id: number;
  awarded_at: string;
}

export interface ConfigEntry {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

// Leaderboard result type
export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  discord_user_id: string;
  username: string | null;
  display_name: string | null;
  points: number;
  current_streak: number;
}

// Practice session filters
export interface PracticeFilters {
  frameworks?: string[];
  difficulty?: number;
  count: number;
}

// RAG system types
export interface ChunkSearchResult {
  chunk: Chunk;
  similarity: number;
}

export interface RagResponse {
  answer: string;
  sources: Array<{
    documentName: string;
    section: string | null;
    similarity: number;
  }>;
  confidence: number;
}

// Database function return types
export interface SearchChunksOptimizedResult {
  id: number;
  document_id: number;
  section: string | null;
  content: string;
  framework_tags: string[];
  token_count: number | null;
  embedding: number[];
  created_at: string;
  distance: number;
  boosted_score: number;
}

export interface HybridSearchResult {
  id: number;
  document_id: number;
  section: string | null;
  content: string;
  framework_tags: string[];
  token_count: number | null;
  embedding: number[];
  created_at: string;
  similarity: number;
  rank_score: number;
}

export interface QueryPerformanceLog {
  id: number;
  query_type: 'vector' | 'hybrid' | 'full_text';
  query_text: string | null;
  execution_time_ms: number;
  chunks_returned: number;
  model_used: string | null;
  user_id: number | null;
  created_at: string;
}

// Authority metrics aggregation
export interface AuthorityStats {
  averages: AuthorityScores;
  trends: {
    confidence?: number;
    discipline?: number;
    leadership?: number;
    gratitude?: number;
    enjoyment?: number;
  };
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  lastEntryDate: string | null;
}