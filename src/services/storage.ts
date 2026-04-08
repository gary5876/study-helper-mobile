/**
 * All SQLite read/write operations.
 * Every function is a thin wrapper — no business logic here.
 */
import * as Crypto from 'expo-crypto';
import {
  getDb,
  SubjectRow,
  SessionRow,
  StudyContentRow,
  AttemptRow,
  AnswerRow,
  ReviewScheduleRow,
} from '../db/schema';

export type { SubjectRow, SessionRow, StudyContentRow, AttemptRow, AnswerRow, ReviewScheduleRow };

function uuid(): string {
  return Crypto.randomUUID();
}

// ─────────────────────────────────────────
// Subjects
// ─────────────────────────────────────────

const SUBJECT_COLORS = [
  '#6c63ff', '#f50057', '#43a047', '#fb8c00',
  '#039be5', '#8e24aa', '#e53935', '#00897b',
];

export async function createSubject(name: string): Promise<SubjectRow> {
  const db = getDb();
  const existing = await getAllSubjects();
  const color = SUBJECT_COLORS[existing.length % SUBJECT_COLORS.length];
  const id = uuid();
  const created_at = Date.now();
  await db.runAsync(
    `INSERT INTO subjects (id, name, color, created_at) VALUES (?, ?, ?, ?)`,
    [id, name.trim(), color, created_at]
  );
  return { id, name: name.trim(), color, created_at };
}

export async function getAllSubjects(): Promise<SubjectRow[]> {
  const db = getDb();
  return db.getAllAsync<SubjectRow>(
    `SELECT * FROM subjects ORDER BY created_at ASC`
  );
}

export async function deleteSubject(id: string): Promise<void> {
  const db = getDb();
  // Detach sessions before deleting to avoid FK violation
  await db.runAsync(`UPDATE sessions SET subject_id = NULL WHERE subject_id = ?`, [id]);
  await db.runAsync(`DELETE FROM subjects WHERE id = ?`, [id]);
}

// ─────────────────────────────────────────
// Sessions
// ─────────────────────────────────────────

export async function createSession(params: {
  id: string;
  pdf_name: string;
  page_count: number;
  word_count: number;
  subject_id?: string | null;
}): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `INSERT INTO sessions (id, pdf_name, created_at, page_count, word_count, status, last_accessed, subject_id)
     VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [
      params.id,
      params.pdf_name,
      Date.now(),
      params.page_count,
      params.word_count,
      Date.now(),
      params.subject_id ?? null,
    ]
  );
}

export async function updateSessionStatus(
  id: string,
  status: SessionRow['status']
): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `UPDATE sessions SET status = ?, last_accessed = ? WHERE id = ?`,
    [status, Date.now(), id]
  );
}

export async function getAllSessions(): Promise<SessionRow[]> {
  const db = getDb();
  return db.getAllAsync<SessionRow>(
    `SELECT * FROM sessions ORDER BY last_accessed DESC`
  );
}

export async function getSession(id: string): Promise<SessionRow | null> {
  const db = getDb();
  return db.getFirstAsync<SessionRow>(
    `SELECT * FROM sessions WHERE id = ?`,
    [id]
  );
}

export async function deleteSession(id: string): Promise<void> {
  const db = getDb();
  await db.runAsync(`DELETE FROM sessions WHERE id = ?`, [id]);
}

// ─────────────────────────────────────────
// Study Content
// ─────────────────────────────────────────

export async function saveStudyContent(params: {
  session_id: string;
  notes_json: string;
  mcq_json: string;
  fill_json: string;
}): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO study_content
       (session_id, notes_json, mcq_json, fill_json, generated_at)
     VALUES (?, ?, ?, ?, ?)`,
    [params.session_id, params.notes_json, params.mcq_json, params.fill_json, Date.now()]
  );
}

export async function getStudyContent(sessionId: string): Promise<StudyContentRow | null> {
  const db = getDb();
  return db.getFirstAsync<StudyContentRow>(
    `SELECT * FROM study_content WHERE session_id = ?`,
    [sessionId]
  );
}

// ─────────────────────────────────────────
// Attempts
// ─────────────────────────────────────────

export async function createAttempt(params: {
  session_id: string;
  attempt_type: AttemptRow['attempt_type'];
}): Promise<string> {
  const id = uuid();
  const db = getDb();
  await db.runAsync(
    `INSERT INTO attempts (id, session_id, attempt_type, started_at)
     VALUES (?, ?, ?, ?)`,
    [id, params.session_id, params.attempt_type, Date.now()]
  );
  return id;
}

export async function completeAttempt(id: string, score_pct: number): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `UPDATE attempts SET completed_at = ?, score_pct = ? WHERE id = ?`,
    [Date.now(), score_pct, id]
  );
}

export async function getAttemptsForSession(sessionId: string): Promise<AttemptRow[]> {
  const db = getDb();
  return db.getAllAsync<AttemptRow>(
    `SELECT * FROM attempts WHERE session_id = ? ORDER BY started_at DESC`,
    [sessionId]
  );
}

// ─────────────────────────────────────────
// Answers
// ─────────────────────────────────────────

export async function saveAnswer(params: {
  attempt_id: string;
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  time_spent_ms?: number;
}): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `INSERT INTO answers (id, attempt_id, question_id, user_answer, is_correct, time_spent_ms, answered_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      uuid(),
      params.attempt_id,
      params.question_id,
      params.user_answer,
      params.is_correct ? 1 : 0,
      params.time_spent_ms ?? 0,
      Date.now(),
    ]
  );
}

export async function getWrongAnswers(attemptId: string): Promise<AnswerRow[]> {
  const db = getDb();
  return db.getAllAsync<AnswerRow>(
    `SELECT * FROM answers WHERE attempt_id = ? AND is_correct = 0`,
    [attemptId]
  );
}

export async function getAllAnswersForAttempt(attemptId: string): Promise<AnswerRow[]> {
  const db = getDb();
  return db.getAllAsync<AnswerRow>(
    `SELECT * FROM answers WHERE attempt_id = ?`,
    [attemptId]
  );
}

// ─────────────────────────────────────────
// Review Schedule (Spaced Repetition)
// ─────────────────────────────────────────

export async function scheduleReview(params: {
  session_id: string;
  question_id: string;
  question_type: ReviewScheduleRow['question_type'];
  interval_days: number;
  ease_factor: number;
  repetitions: number;
}): Promise<void> {
  const db = getDb();
  const next_review_at = Date.now() + params.interval_days * 86400000;
  // Upsert: if a schedule entry already exists for this question, update it
  const existing = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM review_schedule WHERE session_id = ? AND question_id = ?`,
    [params.session_id, params.question_id]
  );
  if (existing) {
    await db.runAsync(
      `UPDATE review_schedule
         SET interval_days = ?, next_review_at = ?, ease_factor = ?, repetitions = ?, status = 'pending'
       WHERE id = ?`,
      [params.interval_days, next_review_at, params.ease_factor, params.repetitions, existing.id]
    );
  } else {
    await db.runAsync(
      `INSERT INTO review_schedule
         (id, session_id, question_id, question_type, interval_days, next_review_at, ease_factor, repetitions, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        uuid(),
        params.session_id,
        params.question_id,
        params.question_type,
        params.interval_days,
        next_review_at,
        params.ease_factor,
        params.repetitions,
      ]
    );
  }
}

export async function getDueReviews(): Promise<ReviewScheduleRow[]> {
  const db = getDb();
  return db.getAllAsync<ReviewScheduleRow>(
    `SELECT * FROM review_schedule WHERE next_review_at <= ? AND status = 'pending' ORDER BY next_review_at ASC`,
    [Date.now()]
  );
}

export async function markReviewMastered(id: string): Promise<void> {
  const db = getDb();
  await db.runAsync(`UPDATE review_schedule SET status = 'mastered' WHERE id = ?`, [id]);
}

export async function getPendingReviewCount(): Promise<number> {
  const db = getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM review_schedule WHERE next_review_at <= ? AND status = 'pending'`,
    [Date.now()]
  );
  return row?.count ?? 0;
}

// ─────────────────────────────────────────
// User Settings
// ─────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  const db = getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM user_settings WHERE key = ?`,
    [key]
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)`,
    [key, value]
  );
}
