import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Chip, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getWrongAnswers, getReviewSchedule, scheduleReview } from '../services/storage';
import { MCQQuestion, FillQuestion } from '../services/api';
import { useSessionStore } from '../store/sessionStore';
import { useLanguageStore } from '../store/languageStore';
import { STRINGS } from '../i18n/strings';
import {
  actionToQuality, computeNextState, INITIAL_SM2_STATE, SM2State,
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
  const { lang } = useLanguageStore();
  const s = STRINGS[lang];

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

    for (const item of items) {
      if (!item.action || !item.question) continue;
      try {
        const quality = actionToQuality(item.action);
        // Load existing SM2 state instead of always resetting to initial
        const existing = await getReviewSchedule(sessionId, item.question.id);
        const currentState: SM2State = existing
          ? {
              interval: existing.interval_days,
              easeFactor: existing.ease_factor,
              repetitions: existing.repetitions,
            }
          : INITIAL_SM2_STATE;
        const nextState = computeNextState(currentState, quality);
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
      } catch (err) {
        console.error(`Failed to schedule review for question ${item.question.id}:`, err);
      }
    }

    const retryIds = items
      .filter((i) => i.action === 'still_confused')
      .map((i) => i.question?.id)
      .filter(Boolean) as string[];

    setSaving(false);

    if (retryIds.length > 0) {
      // retryIds 가 mode 필터보다 우선하므로 mode 는 placeholder
      navigation.replace('MCQ', { sessionId, mode: 'exam', retryIds });
    } else {
      navigation.navigate('Home');
    }
  }

  function getQuestionText(item: WrongItem): string {
    if (!item.question) return '—';
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

  const actionLabels: Record<ReviewAction, string> = {
    got_it: s.wrongGotIt,
    got_it_with_hint: s.wrongNeedsHint,
    still_confused: s.wrongStillConfused,
  };
  const actionColors: Record<ReviewAction, string> = {
    got_it: '#4caf50',
    got_it_with_hint: '#ff9800',
    still_confused: '#e53935',
  };

  if (loading) {
    return <View style={styles.center}><Text>{s.wrongLoading}</Text></View>;
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text variant="titleMedium">{s.wrongNoMistakes}</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Home')} style={{ marginTop: 16 }}>
          {s.wrongBackHome}
        </Button>
      </View>
    );
  }

  const allReviewed = items.every((i) => i.reviewed);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="bodyMedium" style={styles.intro}>{s.wrongIntro}</Text>

        {items.map((item, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.questionText}>
                {getQuestionText(item)}
              </Text>

              <Divider style={styles.divider} />

              <Text variant="bodySmall" style={styles.wrongLabel}>{s.wrongYourAnswer}</Text>
              <Text variant="bodySmall" style={styles.wrongAnswer}>{item.answer.user_answer}</Text>

              <Text variant="bodySmall" style={styles.correctLabel}>{s.wrongCorrectAnswer}</Text>
              <Text variant="bodySmall" style={styles.correctAnswer}>{getCorrectAnswer(item)}</Text>

              {!!getExplanation(item) && (
                <>
                  <Text variant="bodySmall" style={styles.explLabel}>{s.wrongWhy}</Text>
                  <Text variant="bodySmall" style={styles.explanation}>{getExplanation(item)}</Text>
                </>
              )}

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
                  {s.wrongViewConcept}
                </Button>
              )}

              <Divider style={styles.divider} />

              <Text variant="bodySmall" style={styles.rateLabel}>{s.wrongHowDoYouFeel}</Text>
              <View style={styles.actionRow}>
                {(['got_it', 'got_it_with_hint', 'still_confused'] as ReviewAction[]).map((action) => {
                  const selected = item.action === action;
                  return (
                    <Chip
                      key={action}
                      selected={selected}
                      onPress={() => setAction(index, action)}
                      style={[styles.actionChip, selected && { backgroundColor: actionColors[action] }]}
                      textStyle={{ color: selected ? '#fff' : '#333', fontSize: 12 }}
                    >
                      {actionLabels[action]}
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
          {items.some((i) => i.action === 'still_confused') ? s.wrongRetryConfused : s.wrongAllDone}
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
  wrongLabel: { color: '#c62828', fontWeight: '600' },
  wrongAnswer: { color: '#c62828', marginBottom: 6 },
  correctLabel: { color: '#2e7d32', fontWeight: '600' },
  correctAnswer: { color: '#2e7d32', marginBottom: 6 },
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
