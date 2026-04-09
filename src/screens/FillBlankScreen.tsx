import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Text, Button, Card } from 'react-native-paper';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getStudyContent, createAttempt, saveAnswer, completeAttempt } from '../services/storage';
import { FillQuestion } from '../services/api';
import { filterByMode } from '../services/scheduler';
import { useSessionStore } from '../store/sessionStore';
import { useLanguageStore } from '../store/languageStore';
import { STRINGS } from '../i18n/strings';
import ProgressBar from '../components/ProgressBar';
import FeedbackModal from '../components/FeedbackModal';
import { fuzzyMatch } from '../services/scheduler';

type Props = NativeStackScreenProps<RootStackParamList, 'FillBlank'>;

type FeedbackState = {
  visible: boolean;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
};

export default function FillBlankScreen({ route, navigation }: Props) {
  const { sessionId, mode } = route.params;
  const [questions, setQuestions] = useState<FillQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    visible: false, isCorrect: false, correctAnswer: '', explanation: '',
  });
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);
  const { recordAnswer } = useSessionStore();
  const { lang } = useLanguageStore();
  const s = STRINGS[lang];

  useEffect(() => {
    async function load() {
      try {
        const row = await getStudyContent(sessionId);
        if (!row) { setLoading(false); return; }
        const allQs: FillQuestion[] = JSON.parse(row.fill_json);
        const qs = filterByMode(allQs, mode);
        setQuestions(qs);
        const aId = await createAttempt({ session_id: sessionId, attempt_type: 'fill' });
        setAttemptId(aId);
      } catch (err: any) {
        Alert.alert('Error', s.fillLoadError);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  const current = questions[currentIndex];

  function checkAnswer(): boolean {
    const correct = current.answer;
    const variants = current.acceptable_variants || [];
    if (fuzzyMatch(userInput, correct)) return true;
    return variants.some((v) => fuzzyMatch(userInput, v));
  }

  async function handleSubmit() {
    if (!userInput.trim() || !attemptId) return;

    const isCorrect = checkAnswer();
    try {
      await saveAnswer({
        attempt_id: attemptId,
        question_id: current.id,
        user_answer: userInput.trim(),
        is_correct: isCorrect,
      });
      recordAnswer({ questionId: current.id, userAnswer: userInput.trim(), isCorrect, timeSpentMs: 0 });
    } catch (err: any) {
      // Non-fatal: continue quiz even if DB write fails
    }
    setAnswers((prev) => [...prev, { correct: isCorrect }]);

    setFeedback({
      visible: true,
      isCorrect,
      correctAnswer: current.answer,
      explanation: isCorrect
        ? s.fillCorrect
        : `${s.fillWrongPrefix}"${current.answer}"`,
    });
  }

  async function handleNext() {
    setFeedback({ visible: false, isCorrect: false, correctAnswer: '', explanation: '' });
    setUserInput('');
    setShowHint(false);

    const isLast = currentIndex === questions.length - 1;
    if (isLast && attemptId) {
      try {
        const correct = answers.filter((a) => a.correct).length;
        const total = questions.length;
        const pct = total > 0 ? (correct / total) * 100 : 0;
        await completeAttempt(attemptId, pct);
      } catch (err: any) {
        // ignore
      } finally {
        navigation.replace('Score', { attemptId, sessionId });
      }
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#6c63ff" /></View>;
  }
  if (!questions.length || !current) {
    return <View style={styles.center}><Text>{s.fillNoQuestions}</Text></View>;
  }

  const parts = current.sentence_with_blank.split('___');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ProgressBar current={currentIndex + 1} total={questions.length} label={s.fillProgressLabel} />

      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text variant="bodyLarge" style={styles.sentence}>
              {parts[0]}
              <Text style={styles.blank}> ___________ </Text>
              {parts[1] ?? ''}
            </Text>

            {showHint && current.hint ? (
              <Text variant="bodySmall" style={styles.hint}>
                {s.fillHintPrefix}{current.hint}
              </Text>
            ) : null}

            <TextInput
              style={styles.input}
              value={userInput}
              onChangeText={setUserInput}
              placeholder={s.fillPlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            <View style={styles.actions}>
              {!showHint && current.hint ? (
                <Button mode="text" onPress={() => setShowHint(true)}>{s.fillShowHint}</Button>
              ) : <View />}
              <Button
                mode="contained"
                onPress={handleSubmit}
                disabled={!userInput.trim()}
                style={styles.submitBtn}
              >
                {s.fillSubmit}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>

      <FeedbackModal
        visible={feedback.visible}
        isCorrect={feedback.isCorrect}
        message={feedback.explanation}
        correctAnswer={feedback.isCorrect ? undefined : feedback.correctAnswer}
        onNext={handleNext}
        isLast={currentIndex === questions.length - 1}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 16, justifyContent: 'center' },
  card: { borderRadius: 16, elevation: 2 },
  cardContent: { padding: 8, gap: 16 },
  sentence: { fontSize: 17, lineHeight: 28, color: '#333' },
  blank: { color: '#6c63ff', fontWeight: 'bold' },
  hint: { color: '#666', fontStyle: 'italic', backgroundColor: '#fff9c4', padding: 8, borderRadius: 6 },
  input: {
    borderWidth: 2, borderColor: '#6c63ff', borderRadius: 8,
    padding: 12, fontSize: 16, backgroundColor: '#fff', color: '#333',
  },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  submitBtn: { borderRadius: 8, backgroundColor: '#6c63ff' },
});
