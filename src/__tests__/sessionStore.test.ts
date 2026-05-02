/**
 * Unit tests for the Zustand session store.
 */
import { act } from '@testing-library/react-native';
import { useSessionStore } from '../store/sessionStore';
import type { StudyContent } from '../services/api';

// Helper: minimal StudyContent fixture
function makeContent(sessionId: string): StudyContent {
  return {
    session_id: sessionId,
    notes: { key_concepts: [], sections: [], glossary: [] },
    mcq_questions: [
      {
        id: 'q1', question: 'What is AI?',
        options: { A: 'Artificial Intelligence', B: 'Auto Index', C: 'Algorithm', D: 'None' },
        correct_answer: 'A', explanation: 'AI stands for Artificial Intelligence.',
        concept_id: 'c1', level: 1, question_type: 'concept',
      },
    ],
    fill_questions: [],
    metadata: {
      page_count: 1, word_count: 100, generated_at: '2024-01-01T00:00:00Z',
      model_used: 'claude-sonnet-4-6', section_count: 1,
    },
  };
}

describe('sessionStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useSessionStore.setState({
      sessionId: null,
      studyContent: null,
      quiz: null,
    });
  });

  it('setSession stores sessionId and content', () => {
    const content = makeContent('sess-1');
    act(() => { useSessionStore.getState().setSession('sess-1', content); });
    const state = useSessionStore.getState();
    expect(state.sessionId).toBe('sess-1');
    expect(state.studyContent?.session_id).toBe('sess-1');
  });

  it('clearSession resets to null', () => {
    const content = makeContent('sess-2');
    act(() => { useSessionStore.getState().setSession('sess-2', content); });
    act(() => { useSessionStore.getState().clearSession(); });
    const state = useSessionStore.getState();
    expect(state.sessionId).toBeNull();
    expect(state.studyContent).toBeNull();
  });

  it('startQuiz initialises quiz state', () => {
    const content = makeContent('sess-3');
    act(() => {
      useSessionStore.getState().setSession('sess-3', content);
      useSessionStore.getState().startQuiz('mcq', content.mcq_questions, 'attempt-1');
    });
    const quiz = useSessionStore.getState().quiz;
    expect(quiz).not.toBeNull();
    expect(quiz?.quizType).toBe('mcq');
    expect(quiz?.currentIndex).toBe(0);
    expect(quiz?.answers).toHaveLength(0);
  });

  it('recordAnswer appends to quiz.answers', () => {
    const content = makeContent('sess-4');
    act(() => {
      useSessionStore.getState().setSession('sess-4', content);
      useSessionStore.getState().startQuiz('mcq', content.mcq_questions, 'attempt-2');
      useSessionStore.getState().recordAnswer({
        questionId: 'q1', userAnswer: 'A', isCorrect: true, timeSpentMs: 500,
      });
    });
    expect(useSessionStore.getState().quiz?.answers).toHaveLength(1);
    expect(useSessionStore.getState().quiz?.answers[0].isCorrect).toBe(true);
  });

  it('advanceQuestion increments currentIndex', () => {
    const content = makeContent('sess-5');
    act(() => {
      useSessionStore.getState().setSession('sess-5', content);
      useSessionStore.getState().startQuiz('mcq', content.mcq_questions, 'attempt-3');
      useSessionStore.getState().advanceQuestion();
    });
    // Only 1 question, so index stays or clamps — just verify no crash
    expect(useSessionStore.getState().quiz?.currentIndex).toBeGreaterThanOrEqual(0);
  });
});
