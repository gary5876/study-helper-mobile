/**
 * Jest unit tests for the SM-2 spaced repetition scheduler.
 * These are pure logic tests — no React Native required.
 */
import {
  computeNextState,
  INITIAL_SM2_STATE,
  actionToQuality,
  fuzzyMatch,
  scoreToGrade,
  getDifficultyWeights,
  describeInterval,
} from '../services/scheduler';

// ─────────────────────────────────────────
// computeNextState
// ─────────────────────────────────────────

describe('computeNextState', () => {
  test('first correct answer: interval = 1', () => {
    const next = computeNextState(INITIAL_SM2_STATE, 5);
    expect(next.interval).toBe(1);
    expect(next.repetitions).toBe(1);
    expect(next.easeFactor).toBeGreaterThan(2.5);
  });

  test('second correct answer: interval = 6', () => {
    const afterFirst = computeNextState(INITIAL_SM2_STATE, 5);
    const afterSecond = computeNextState(afterFirst, 5);
    expect(afterSecond.interval).toBe(6);
    expect(afterSecond.repetitions).toBe(2);
  });

  test('third correct answer: interval = round(6 * easeFactor)', () => {
    let state = INITIAL_SM2_STATE;
    state = computeNextState(state, 5);
    state = computeNextState(state, 5);
    const prevInterval = state.interval;
    const prevEf = state.easeFactor;
    state = computeNextState(state, 5);
    expect(state.interval).toBe(Math.round(prevInterval * prevEf));
    expect(state.repetitions).toBe(3);
  });

  test('wrong answer resets to interval=1 and repetitions=0', () => {
    let state = INITIAL_SM2_STATE;
    state = computeNextState(state, 5);
    state = computeNextState(state, 5);
    // Now get wrong
    state = computeNextState(state, 1);
    expect(state.interval).toBe(1);
    expect(state.repetitions).toBe(0);
  });

  test('ease factor never goes below 1.3', () => {
    let state = INITIAL_SM2_STATE;
    for (let i = 0; i < 10; i++) {
      state = computeNextState(state, 0); // worst quality
    }
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  test('quality 3 is treated as correct (got it with hint)', () => {
    const next = computeNextState(INITIAL_SM2_STATE, 3);
    expect(next.repetitions).toBe(1);
  });

  test('quality 2 is treated as wrong (barely missed)', () => {
    const next = computeNextState(INITIAL_SM2_STATE, 2);
    expect(next.repetitions).toBe(0);
    expect(next.interval).toBe(1);
  });
});

// ─────────────────────────────────────────
// actionToQuality
// ─────────────────────────────────────────

describe('actionToQuality', () => {
  test('got_it → 5', () => expect(actionToQuality('got_it')).toBe(5));
  test('got_it_with_hint → 3', () => expect(actionToQuality('got_it_with_hint')).toBe(3));
  test('still_confused → 1', () => expect(actionToQuality('still_confused')).toBe(1));
});

// ─────────────────────────────────────────
// fuzzyMatch
// ─────────────────────────────────────────

describe('fuzzyMatch', () => {
  test('exact match', () => expect(fuzzyMatch('neural network', 'neural network')).toBe(true));
  test('case insensitive', () => expect(fuzzyMatch('Neural Network', 'neural network')).toBe(true));
  test('typo within threshold', () => expect(fuzzyMatch('nural network', 'neural network')).toBe(true));
  test('completely wrong', () => expect(fuzzyMatch('wrong answer', 'neural network')).toBe(false));
  test('extra space trimmed', () => expect(fuzzyMatch('  gradient descent ', 'gradient descent')).toBe(true));
});

// ─────────────────────────────────────────
// scoreToGrade
// ─────────────────────────────────────────

describe('scoreToGrade', () => {
  test('95% → A', () => expect(scoreToGrade(95)).toBe('A'));
  test('90% → A-', () => expect(scoreToGrade(90)).toBe('A-'));
  test('83% → B', () => expect(scoreToGrade(83)).toBe('B'));
  test('73% → C', () => expect(scoreToGrade(73)).toBe('C'));
  test('55% → F', () => expect(scoreToGrade(55)).toBe('F'));
  test('70% → C-', () => expect(scoreToGrade(70)).toBe('C-'));
  test('7/10 = 70% → C-', () => expect(scoreToGrade((7 / 10) * 100)).toBe('C-'));
});

// ─────────────────────────────────────────
// getDifficultyWeights
// ─────────────────────────────────────────

describe('getDifficultyWeights', () => {
  test('high score → more hard questions', () => {
    const w = getDifficultyWeights(90);
    expect(w.hard).toBeGreaterThan(0.3);
  });

  test('low score → more easy questions', () => {
    const w = getDifficultyWeights(40);
    expect(w.easy).toBeGreaterThanOrEqual(0.5);
  });

  test('weights sum to 1', () => {
    const w = getDifficultyWeights(70);
    expect(w.easy + w.medium + w.hard).toBeCloseTo(1.0);
  });
});

// ─────────────────────────────────────────
// describeInterval
// ─────────────────────────────────────────

describe('describeInterval', () => {
  test('1 day → tomorrow', () => expect(describeInterval(1)).toBe('tomorrow'));
  test('3 days → in 3 days', () => expect(describeInterval(3)).toBe('in 3 days'));
  test('7 days → in 7 days', () => expect(describeInterval(7)).toBe('in 7 days'));
  test('14 days → in 2 weeks', () => expect(describeInterval(14)).toBe('in 2 weeks'));
});
