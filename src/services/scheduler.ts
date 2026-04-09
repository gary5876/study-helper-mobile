/**
 * SM-2 Spaced Repetition Algorithm implementation.
 *
 * Reference: Piotr Wozniak's SuperMemo SM-2 algorithm
 * Quality scores:
 *   5 = perfect recall immediately
 *   4 = correct with minor hesitation
 *   3 = correct with hint ("Got It after hint")
 *   2 = incorrect but answer was easy to recall
 *   1 = incorrect, still confused ("Still Confused")
 *   0 = complete blackout
 */

export type QualityScore = 0 | 1 | 2 | 3 | 4 | 5;

export interface SM2State {
  interval: number;     // days until next review
  easeFactor: number;   // >= 1.3
  repetitions: number;  // successful reviews in a row
}

export const INITIAL_SM2_STATE: SM2State = {
  interval: 1,
  easeFactor: 2.5,
  repetitions: 0,
};

/**
 * Compute the next SM-2 state given the current state and a quality rating.
 * Returns a new SM2State — pure function, no side effects.
 */
export function computeNextState(current: SM2State, quality: QualityScore): SM2State {
  let { interval, easeFactor, repetitions } = current;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response — reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  return { interval, easeFactor, repetitions };
}

/**
 * Convert a user action to a quality score.
 */
export function actionToQuality(action: 'got_it' | 'got_it_with_hint' | 'still_confused'): QualityScore {
  switch (action) {
    case 'got_it':          return 5;
    case 'got_it_with_hint': return 3;
    case 'still_confused':  return 1;
  }
}

/**
 * Get the next review timestamp (Unix ms) from an SM2State.
 */
export function nextReviewTimestamp(state: SM2State): number {
  return Date.now() + state.interval * 24 * 60 * 60 * 1000;
}

/**
 * Describe how far away a review is in human-readable form.
 */
export function describeInterval(intervalDays: number): string {
  if (intervalDays <= 1)  return 'tomorrow';
  if (intervalDays <= 7)  return `in ${intervalDays} days`;
  if (intervalDays <= 14) return 'in 2 weeks';
  if (intervalDays <= 30) return 'in about a month';
  return `in ${Math.round(intervalDays / 30)} months`;
}

import type { StudyMode, MCQQuestion, FillQuestion } from './api';

/** Level ranges per study mode. */
const MODE_LEVELS: Record<StudyMode, number[]> = {
  light: [1, 2],
  exam:  [3, 4, 5],
  max:   [5],
};

/** Minimum question count before a mode falls back to adjacent levels. */
const MODE_MIN_COUNT = 3;

/**
 * Filter a question list to those matching the selected study mode.
 * Falls back to adjacent levels when the strict set has fewer than MODE_MIN_COUNT items.
 */
export function filterByMode<T extends MCQQuestion | FillQuestion>(
  questions: T[],
  mode: StudyMode,
): T[] {
  const primary = MODE_LEVELS[mode];
  const filtered = questions.filter((q) => primary.includes(q.level));

  if (filtered.length >= MODE_MIN_COUNT) return filtered;

  // Fallback: expand to next adjacent level(s)
  if (mode === 'max') {
    // L5 insufficient → include L4+L5
    return questions.filter((q) => q.level >= 4);
  }
  if (mode === 'light') {
    // L1-L2 insufficient → include up to L3
    return questions.filter((q) => q.level <= 3);
  }
  // exam mode: all L3-L5, no further fallback needed
  return filtered;
}

/**
 * Determine level weight distribution for adaptive retry sessions.
 * Returns proportions for levels 3, 4, 5 (sum = 1.0).
 */
export function getLevelWeights(lastScorePct: number): {
  level3: number;
  level4: number;
  level5: number;
} {
  if (lastScorePct >= 85) {
    return { level3: 0.00, level4: 0.35, level5: 0.65 };
  }
  if (lastScorePct <= 50) {
    return { level3: 0.35, level4: 0.50, level5: 0.15 };
  }
  return { level3: 0.15, level4: 0.50, level5: 0.35 };
}

/**
 * Calculate letter grade from score percentage.
 */
export function scoreToGrade(pct: number): string {
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A-';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B-';
  if (pct >= 77) return 'C+';
  if (pct >= 73) return 'C';
  if (pct >= 70) return 'C-';
  if (pct >= 67) return 'D+';
  if (pct >= 60) return 'D';
  return 'F';
}

/**
 * Fuzzy string match — returns true if similarity >= threshold.
 * Used for fill-in-the-blank answer checking.
 */
export function fuzzyMatch(userAnswer: string, correctAnswer: string, threshold = 0.8): boolean {
  const a = userAnswer.trim().toLowerCase();
  const b = correctAnswer.trim().toLowerCase();
  if (a === b) return true;

  // Levenshtein distance
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  const distance = dp[a.length][b.length];
  const maxLen = Math.max(a.length, b.length);
  const similarity = 1 - distance / maxLen;
  return similarity >= threshold;
}
