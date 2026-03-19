/**
 * SQLite schema definitions and database initialisation.
 * All user data is stored exclusively on-device.
 */
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('fundamentals.db');
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = getDb();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Core session records
    CREATE TABLE IF NOT EXISTS sessions (
      id            TEXT PRIMARY KEY,
      pdf_name      TEXT NOT NULL,
      created_at    INTEGER NOT NULL,
      page_count    INTEGER DEFAULT 0,
      word_count    INTEGER DEFAULT 0,
      status        TEXT DEFAULT 'pending',
      last_accessed INTEGER
    );

    -- Generated study content (JSON blobs for flexibility)
    CREATE TABLE IF NOT EXISTS study_content (
      session_id    TEXT PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
      notes_json    TEXT NOT NULL,
      mcq_json      TEXT NOT NULL,
      fill_json     TEXT NOT NULL,
      generated_at  INTEGER NOT NULL
    );

    -- Individual quiz attempts
    CREATE TABLE IF NOT EXISTS attempts (
      id            TEXT PRIMARY KEY,
      session_id    TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      attempt_type  TEXT NOT NULL,
      started_at    INTEGER NOT NULL,
      completed_at  INTEGER,
      score_pct     REAL
    );

    -- Per-question answer records
    CREATE TABLE IF NOT EXISTS answers (
      id             TEXT PRIMARY KEY,
      attempt_id     TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
      question_id    TEXT NOT NULL,
      user_answer    TEXT NOT NULL,
      is_correct     INTEGER NOT NULL,
      time_spent_ms  INTEGER DEFAULT 0,
      answered_at    INTEGER NOT NULL
    );

    -- Spaced repetition schedule (SM-2)
    CREATE TABLE IF NOT EXISTS review_schedule (
      id             TEXT PRIMARY KEY,
      session_id     TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      question_id    TEXT NOT NULL,
      question_type  TEXT NOT NULL,
      interval_days  INTEGER DEFAULT 1,
      next_review_at INTEGER NOT NULL,
      ease_factor    REAL DEFAULT 2.5,
      repetitions    INTEGER DEFAULT 0,
      status         TEXT DEFAULT 'pending'
    );

    -- User settings (single row)
    CREATE TABLE IF NOT EXISTS user_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

// ─────────────────────────────────────────
// TypeScript types (mirror DB schema)
// ─────────────────────────────────────────

export interface SessionRow {
  id: string;
  pdf_name: string;
  created_at: number;
  page_count: number;
  word_count: number;
  status: 'pending' | 'ready' | 'failed';
  last_accessed: number | null;
}

export interface StudyContentRow {
  session_id: string;
  notes_json: string;
  mcq_json: string;
  fill_json: string;
  generated_at: number;
}

export interface AttemptRow {
  id: string;
  session_id: string;
  attempt_type: 'mcq' | 'fill' | 'retry';
  started_at: number;
  completed_at: number | null;
  score_pct: number | null;
}

export interface AnswerRow {
  id: string;
  attempt_id: string;
  question_id: string;
  user_answer: string;
  is_correct: 0 | 1;
  time_spent_ms: number;
  answered_at: number;
}

export interface ReviewScheduleRow {
  id: string;
  session_id: string;
  question_id: string;
  question_type: 'mcq' | 'fill';
  interval_days: number;
  next_review_at: number;
  ease_factor: number;
  repetitions: number;
  status: 'pending' | 'mastered';
}
