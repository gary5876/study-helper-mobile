import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Chip, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  getWrongAnswers, createAttempt, saveAnswer, completeAttempt, scheduleReview,
} from '../services/storage';
import { MCQQuestion, FillQuestion } from '../services/api';
import { useSessionStore } from '../store/sessionStore';
import {
  actionToQuality, computeNextState, INITIAL_SM2_STATE, describeInterval,
} from '../services/scheduler';
import { AnswerRow } from '../db/schema';

type Props = NativeStackScreenProps<RootStackParamList, 'WrongAnswer'>;
type ReviewAction = 'got_it' | 'got_it_with_hint' | 'still_confused';

interface WrongItem {
  answer: AnswerRow;
  question: MCQQuestion | FillQuestion | null;
  reviewed: boolean;
  action: ReviewAction | null;
}

export default function WrongAnswerScreen({ route, navigation }: Props) {
  const { attemptId, sessionId } = route.params;
  const [items, setItems] = useState<WrongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { studyContent } = useSessionStore();

  useEffect(() => {
    async function load() {
      const wrongAnswers = await getWrongAnswers(attemptId);
      const allQuestions = studyContent
        ? ([...studyContent.mcq_questions, ...studyContent.fill_questions] as (MCQQuestion | FillQuestion)[])
        : [];

      setItems(
        wrongAnswers.map((ans) => ({
          answer: ans,
          question: allQuestions.find((q) => q.id === ans.question_id) ?? null,
          reviewed: false,
          action: null,
        }))
      );
      setLoading(false);
    }
    load();
  }, [attemptId]);

  function setAction(index: number, action: ReviewAction) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, action, reviewed: true } : item
      )
    );
  }

  async function handleDone() {
    if (!studyContent) return;
    setSaving(true);

    // Schedule spaced repetition for each reviewed item
    for (const item of items) {
      if (!item.action || !item.question) continue;
      const quality = actionToQuality(item.action);
      const nextState = computeNextState(INITIAL_SM2_STATE, quality);
      const qType = studyContent.mcq_questions.find((q) => q.id === item.question!.id)
        ? 'mcq'
        : 'fill';

      await scheduleReview({
        session_id: sessionId,
        question_id: item.question.id,
        question_type: qType,
        interval_days: nextState.interval,
        ease_factor: nextState.easeFactor,
        repetitions: nextState.repetitions,
      });
    }

    // Items marked "still confused" go to retry
    const retryIds = items
      .filter((i) => i.action === 'still_confused')
      .map((i) => i.question?.id)
      .filter(Boolean) as string[];

    setSaving(false);

    if (retryIds.length > 0) {
      useSessionStore.getState().setWrongQuestions(retryIds);
      navigation.replace('MCQ', { sessionId });
    } else {
      navigation.navigate('Home');
    }
  }

  function getQuestionText(item: WrongItem): string {
    if (!item.question) return 'Question not found';
    if ('options' in item.question) return item.question.question;
    return item.question.sentence_with_blank;
  }

  function getCorrectAnswer(item: WrongItem): string {
    if (!item.question) return '';
    if ('options' in item.question) {
      const ans = item.question.correct_answer as 'A' | 'B' | 'C' | 'D';
      return `${ans}: ${item.question.options[ans]}`;
    }
    return item.question.answer;
  }

  function getExplanation(item: WrongItem): string {
    if (!item.question) return '';
    if ('explanation' in item.question) return item.question.explanation;
    return '';
  }

  if (loading) {
    return <View style={styles.center}><Text>Loading…</Text></View>;
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text variant="titleMedium">No mistakes — great work!</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Home')} style={{ marginTop: 16 }}>
          Back to Home
        </Button>
      </View>
    );
  }

  const allReviewed = items.every((i) => i.reviewed);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="bodyMedium" style={styles.intro}>
          Review each mistake and mark how well you understand it now.
        </Text>

        {items.map((item, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              {/* Question */}
              <Text variant="bodyMedium" style={styles.questionText}>
                {getQuestionText(item)}
              </Text>

              <Divider style={styles.divider} />

              {/* User's answer */}
              <Text variant="bodySmall" style={styles.wrongLabel}>Your answer:</Text>
              <Text variant="bodySmall" style={styles.wrongAnswer}>{item.answer.user_answer}</Text>

              {/* Correct answer */}
              <Text variant="bodySmall" style={styles.correctLabel}>Correct answer:</Text>
              <Text variant="bodySmall" style={styles.correctAnswer}>{getCorrectAnswer(item)}</Text>

              {/* Explanation */}
              {!!getExplanation(item) && (
                <>
                  <Text variant="bodySmall" style={styles.explLabel}>Why:</Text>
                  <Text variant="bodySmall" style={styles.explanation}>{getExplanation(item)}</Text>
                </>
              )}

              {/* Related concept button */}
              {item.question && (
                <Button
                  mode="text"
                  compact
                  onPress={() =>
                    navigation.navigate('ReviewConcept', {
                      conceptId: item.question!.concept_id,
                      sessionId,
                    })
                  }
                  style={styles.conceptBtn}
                >
                  View Related Concept
                </Button>
              )}

              <Divider style={styles.divider} />

              {/* Action buttons */}
              <Text variant="bodySmall" style={styles.rateLabel}>How do you feel now?</Text>
              <View style={styles.actionRow}>
                {(['got_it', 'got_it_with_hint', 'still_confused'] as ReviewAction[]).map((action) => {
                  const labels: Record<ReviewAction, string> = {
                    got_it: 'Got It ✓',
                    got_it_with_hint: 'Needs Hint',
                    still_confused: 'Still Confused',
                  };
                  const colors: Record<ReviewAction, string> = {
                    got_it: '#4caf50',
                    got_it_with_hint: '#ff9800',
                    still_confused: '#e53935',
                  };
                  const selected = item.action === action;
                  return (
                    <Chip
                      key={action}
                      selected={selected}
                      onPress={() => setAction(index, action)}
                      style={[styles.actionChip, selected && { backgroundColor: colors[action] }]}
                      textStyle={{ color: selected ? '#fff' : '#333', fontSize: 12 }}
                    >
                      {labels[action]}
                    </Chip>
                  );
                })}
              </View>
            </Card.Content>
          </Card>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.fabContainer}>
        <Button
          mode="contained"
          onPress={handleDone}
          disabled={!allReviewed || saving}
          loading={saving}
          style={styles.doneBtn}
          icon="check"
        >
          {items.some((i) => i.action === 'still_confused') ? 'Retry Confused Items' : 'All Done!'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  content: { padding: 16, gap: 16 },
  intro: { color: '#666', lineHeight: 20 },
  card: { borderRadius: 12, elevation: 2 },
  questionText: { fontSize: 15, lineHeight: 22, color: '#333', marginBottom: 8 },
  divider: { marginVertical: 8 },
  wrongLabel: { color: '#e53935', fontWeight: '600' },
  wrongAnswer: { color: '#e53935', marginBottom: 6 },
  correctLabel: { color: '#4caf50', fontWeight: '600' },
  correctAnswer: { color: '#4caf50', marginBottom: 6 },
  explLabel: { color: '#666', fontWeight: '600' },
  explanation: { color: '#555', lineHeight: 18 },
  conceptBtn: { alignSelf: 'flex-start', marginTop: 4 },
  rateLabel: { color: '#666', marginBottom: 8 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionChip: { borderRadius: 16 },
  fabContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: 'rgba(245,245,245,0.95)',
    borderTopWidth: 1, borderTopColor: '#e0e0e0',
  },
  doneBtn: { borderRadius: 8, backgroundColor: '#6c63ff' },
});
