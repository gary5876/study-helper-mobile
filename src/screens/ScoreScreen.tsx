import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Divider, ProgressBar as PaperProgress } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  getAllAnswersForAttempt, getAttemptsForSession, getStudyContent,
} from '../services/storage';
import { MCQQuestion, FillQuestion, StudyContent } from '../services/api';
import { scoreToGrade } from '../services/scheduler';
import { useSessionStore } from '../store/sessionStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Score'>;

interface WeakArea {
  conceptId: string;
  term: string;
  wrongCount: number;
  totalCount: number;
}

export default function ScoreScreen({ route, navigation }: Props) {
  const { attemptId, sessionId } = route.params;
  const [loading, setLoading] = useState(true);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const { studyContent } = useSessionStore();

  useEffect(() => {
    async function load() {
      const answers = await getAllAnswersForAttempt(attemptId);
      const correct = answers.filter((a) => a.is_correct === 1).length;
      setTotalCorrect(correct);
      setTotalCount(answers.length);

      // Compute weak areas
      if (studyContent) {
        const allQuestions = [
          ...studyContent.mcq_questions,
          ...studyContent.fill_questions,
        ] as (MCQQuestion | FillQuestion)[];
        const conceptMap: Record<string, WeakArea> = {};

        for (const ans of answers) {
          const q = allQuestions.find((q) => q.id === ans.question_id);
          if (!q) continue;
          const concept = studyContent.notes.key_concepts.find((c) => c.id === q.concept_id);
          const cid = q.concept_id;
          if (!conceptMap[cid]) {
            conceptMap[cid] = { conceptId: cid, term: concept?.term ?? cid, wrongCount: 0, totalCount: 0 };
          }
          conceptMap[cid].totalCount++;
          if (!ans.is_correct) conceptMap[cid].wrongCount++;
        }

        const weak = Object.values(conceptMap)
          .filter((c) => c.wrongCount / c.totalCount > 0.5)
          .sort((a, b) => b.wrongCount - a.wrongCount);
        setWeakAreas(weak);
      }
      setLoading(false);
    }
    load();
  }, [attemptId]);

  if (loading) {
    return <View style={styles.center}><Text>Loading results…</Text></View>;
  }

  const pct = totalCount > 0 ? (totalCorrect / totalCount) * 100 : 0;
  const grade = scoreToGrade(pct);
  const gradeColor = pct >= 80 ? '#4caf50' : pct >= 60 ? '#ff9800' : '#e53935';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Big score */}
      <Card style={styles.scoreCard}>
        <Card.Content style={styles.scoreContent}>
          <Text variant="displayMedium" style={[styles.grade, { color: gradeColor }]}>
            {grade}
          </Text>
          <Text variant="headlineMedium" style={styles.scorePct}>
            {Math.round(pct)}%
          </Text>
          <Text variant="bodyLarge" style={styles.scoreDetail}>
            {totalCorrect} / {totalCount} correct
          </Text>
          <PaperProgress
            progress={pct / 100}
            color={gradeColor}
            style={styles.progressBar}
          />
        </Card.Content>
      </Card>

      {/* Weak areas */}
      {weakAreas.length > 0 && (
        <>
          <Text variant="titleMedium" style={styles.sectionTitle}>Areas to Strengthen</Text>
          {weakAreas.map((area) => (
            <Card key={area.conceptId} style={styles.weakCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.weakTerm}>{area.term}</Text>
                <Text variant="bodySmall" style={styles.weakDetail}>
                  {area.wrongCount}/{area.totalCount} questions wrong
                </Text>
              </Card.Content>
            </Card>
          ))}
          <Divider style={styles.divider} />
        </>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('WrongAnswer', { attemptId, sessionId })}
          style={[styles.btn, { backgroundColor: '#e53935' }]}
          icon="close-circle"
        >
          Review Mistakes
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('StudyNotes', { sessionId })}
          style={styles.btn}
          icon="book-open-variant"
        >
          Study Notes Again
        </Button>
        <Button
          mode="text"
          onPress={() => navigation.navigate('Home')}
          style={styles.btn}
        >
          Done
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, gap: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scoreCard: { borderRadius: 16, elevation: 3 },
  scoreContent: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  grade: { fontWeight: 'bold' },
  scorePct: { fontWeight: '600', color: '#333' },
  scoreDetail: { color: '#666' },
  progressBar: { width: '100%', height: 10, borderRadius: 5, marginTop: 8 },
  sectionTitle: { fontWeight: 'bold', color: '#333', marginTop: 8 },
  weakCard: { borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#e53935' },
  weakTerm: { fontWeight: '600', color: '#333' },
  weakDetail: { color: '#e53935', marginTop: 2 },
  divider: { marginVertical: 8 },
  actions: { gap: 12, marginBottom: 32 },
  btn: { borderRadius: 8 },
});
