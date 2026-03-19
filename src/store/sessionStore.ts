/**
 * Global Zustand store for the current study session and quiz state.
 * Persists nothing here — all persistence is through SQLite via storage.ts.
 */
import { create } from 'zustand';
import type { StudyContent, MCQQuestion, FillQuestion } from '../services/api';

export interface AnswerRecord {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpentMs: number;
}

export type QuizType = 'mcq' | 'fill' | 'retry';

interface QuizState {
  quizType: QuizType;
  questions: (MCQQuestion | FillQuestion)[];
  currentIndex: number;
  answers: AnswerRecord[];
  startedAt: number;
  attemptId: string | null;
}

interface SessionState {
  // Current session
  sessionId: string | null;
  studyContent: StudyContent | null;

  // Active quiz
  quiz: QuizState | null;

  // Wrong question IDs from the last scored attempt
  wrongQuestionIds: string[];

  // Actions
  setSession: (sessionId: string, content: StudyContent) => void;
  clearSession: () => void;

  startQuiz: (
    type: QuizType,
    questions: (MCQQuestion | FillQuestion)[],
    attemptId: string
  ) => void;
  recordAnswer: (record: AnswerRecord) => void;
  advanceQuestion: () => void;
  finishQuiz: () => void;

  setWrongQuestions: (ids: string[]) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: null,
  studyContent: null,
  quiz: null,
  wrongQuestionIds: [],

  setSession(sessionId, content) {
    set({ sessionId, studyContent: content });
  },

  clearSession() {
    set({ sessionId: null, studyContent: null, quiz: null, wrongQuestionIds: [] });
  },

  startQuiz(type, questions, attemptId) {
    set({
      quiz: {
        quizType: type,
        questions,
        currentIndex: 0,
        answers: [],
        startedAt: Date.now(),
        attemptId,
      },
    });
  },

  recordAnswer(record) {
    const { quiz } = get();
    if (!quiz) return;
    set({ quiz: { ...quiz, answers: [...quiz.answers, record] } });
  },

  advanceQuestion() {
    const { quiz } = get();
    if (!quiz) return;
    set({ quiz: { ...quiz, currentIndex: quiz.currentIndex + 1 } });
  },

  finishQuiz() {
    const { quiz } = get();
    if (!quiz) return;
    const wrongIds = quiz.answers
      .filter((a) => !a.isCorrect)
      .map((a) => a.questionId);
    set({ wrongQuestionIds: wrongIds, quiz: null });
  },

  setWrongQuestions(ids) {
    set({ wrongQuestionIds: ids });
  },
}));
