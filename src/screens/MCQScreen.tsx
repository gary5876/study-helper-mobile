import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Text } from 'react-native-paper';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getStudyContent, createAttempt, saveAnswer, completeAttempt } from '../services/storage';
import { MCQQuestion } from '../services/api';
import { filterByMode } from '../services/scheduler';
import { useSessionStore } from '../store/sessionStore';
import { useLanguageStore } from '../store/languageStore';
import { STRINGS } from '../i18n/strings';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';

type Props = NativeStackScreenProps<RootStackParamList, 'MCQ'>;

export default function MCQScreen({ route, navigation }: Props) {
  const { sessionId, mode, retryIds } = route.params;
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { startQuiz, recordAnswer, advanceQuestion, finishQuiz, quiz } = useSessionStore();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [localAnswers, setLocalAnswers] = useState<
    { questionId: string; correct: boolean; userAnswer: string }[]
  >([]);
  const { lang } = useLanguageStore();
  const s = STRINGS[lang];

  useEffect(() => {
    async function load() {
      try {
        const row = await getStudyContent(sessionId);
        if (!row) { setLoading(false); return; }

        let qs: MCQQuestion[] = JSON.parse(row.mcq_json);

        // Apply retry filter first (retry mode ignores study mode filter)
        if (retryIds && retryIds.length > 0) {
          qs = qs.filter((q) => retryIds.includes(q.id));
        } else {
          qs = filterByMode(qs, mode);
        }

        setQuestions(qs);

        const aId = await createAttempt({ session_id: sessionId, attempt_type: 'mcq' });
        setAttemptId(aId);
        startQuiz('mcq', qs, aId);
      } catch (err: any) {
        Alert.alert('Error', s.mcqLoadError);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  async function handleAnswer(questionId: string, choice: string, isCorrect: boolean) {
    if (!attemptId) return;
    try {
      await saveAnswer({
        attempt_id: attemptId,
        question_id: questionId,
        user_answer: choice,
        is_correct: isCorrect,
      });
      recordAnswer({ questionId, userAnswer: choice, isCorrect, timeSpentMs: 0 });
      setLocalAnswers((prev) => [...prev, { questionId, correct: isCorrect, userAnswer: choice }]);
    } catch (err: any) {
      // Non-fatal: answer wasn't saved to DB, but allow quiz to continue
    }
  }

  async function handleNext(isLast: boolean) {
    if (isLast && attemptId) {
      try {
        const correct = localAnswers.filter((a) => a.correct).length;
        const total = questions.length;
        const pct = total > 0 ? (correct / total) * 100 : 0;
        await completeAttempt(attemptId, pct);
        finishQuiz();
        navigation.replace('FillBlank', { sessionId, mode });
      } catch (err: any) {
        navigation.replace('FillBlank', { sessionId, mode });
      }
    } else {
      advanceQuestion();
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#6c63ff" /></View>;
  }

  if (!questions.length) {
    return <View style={styles.center}><Text>{s.mcqNoQuestions}</Text></View>;
  }

  const currentIndex = quiz?.currentIndex ?? 0;
  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  return (
    <View style={styles.container}>
      <ProgressBar current={currentIndex + 1} total={questions.length} label={s.mcqProgressLabel} />

      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          questionType="mcq"
          onAnswer={handleAnswer}
          onNext={() => handleNext(isLast)}
          isLast={isLast}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
