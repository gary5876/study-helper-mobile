import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Chip, Divider, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getStudyContent } from '../services/storage';
import { KeyConcept, StudyNotes } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewConcept'>;

export default function ReviewConceptScreen({ route, navigation }: Props) {
  const { conceptId, sessionId } = route.params;
  const [concept, setConcept] = useState<KeyConcept | null>(null);
  const [notes, setNotes] = useState<StudyNotes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const row = await getStudyContent(sessionId);
      if (row) {
        const n: StudyNotes = JSON.parse(row.notes_json);
        setNotes(n);
        const c = n.key_concepts.find((kc) => kc.id === conceptId) ?? null;
        setConcept(c);
      }
      setLoading(false);
    }
    load();
  }, [conceptId, sessionId]);

  if (loading) return <View style={styles.center}><Text>Loading…</Text></View>;

  if (!concept) {
    return (
      <View style={styles.center}>
        <Text>Concept not found.</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  // Find sections that mention this concept
  const relatedSections = notes?.sections.filter((s) =>
    s.title.toLowerCase().includes(concept.term.toLowerCase()) ||
    s.summary.toLowerCase().includes(concept.term.toLowerCase()) ||
    s.bullets.some((b) => b.toLowerCase().includes(concept.term.toLowerCase()))
  ) ?? [];

  const importanceColor = (imp: KeyConcept['importance']) => {
    switch (imp) {
      case 'high': return '#e53935';
      case 'medium': return '#fb8c00';
      default: return '#43a047';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Concept Header */}
      <Card style={styles.conceptCard}>
        <Card.Content>
          <View style={styles.conceptHeader}>
            <Text variant="headlineSmall" style={styles.term}>{concept.term}</Text>
            <Chip
              style={[styles.importanceChip, { backgroundColor: importanceColor(concept.importance) }]}
              textStyle={{ color: '#fff', fontSize: 11 }}
            >
              {concept.importance} importance
            </Chip>
          </View>
          <Text variant="bodyLarge" style={styles.definition}>{concept.definition}</Text>
        </Card.Content>
      </Card>

      {/* Related Sections */}
      {relatedSections.length > 0 && (
        <>
          <Text variant="titleMedium" style={styles.sectionHeader}>Related Sections</Text>
          {relatedSections.map((section, index) => (
            <Card key={index} style={styles.sectionCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.sectionTitle}>{section.title}</Text>
                <Divider style={styles.divider} />
                <Text variant="bodyMedium" style={styles.summary}>{section.summary}</Text>
                {section.bullets.map((bullet, bi) => (
                  <Text key={bi} variant="bodySmall" style={styles.bullet}>• {bullet}</Text>
                ))}
              </Card.Content>
            </Card>
          ))}
        </>
      )}

      {/* Glossary entry if exists */}
      {notes?.glossary.find((g) => g.term.toLowerCase() === concept.term.toLowerCase()) && (
        <>
          <Text variant="titleMedium" style={styles.sectionHeader}>Glossary</Text>
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.glossaryDef}>
                {notes.glossary.find((g) => g.term.toLowerCase() === concept.term.toLowerCase())?.brief_def}
              </Text>
            </Card.Content>
          </Card>
        </>
      )}

      <Button
        mode="contained"
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
        icon="arrow-left"
      >
        Back to Review
      </Button>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, gap: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  conceptCard: { borderRadius: 16, elevation: 3 },
  conceptHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  term: { fontWeight: 'bold', color: '#333', flex: 1, marginRight: 8 },
  importanceChip: { borderRadius: 12 },
  definition: { color: '#444', lineHeight: 24 },
  sectionHeader: { fontWeight: 'bold', color: '#333' },
  sectionCard: { borderRadius: 12 },
  sectionTitle: { fontWeight: '600', color: '#6c63ff' },
  divider: { marginVertical: 8 },
  summary: { color: '#555', lineHeight: 20, marginBottom: 8 },
  bullet: { color: '#444', lineHeight: 18, marginBottom: 4, paddingLeft: 4 },
  glossaryDef: { color: '#555', lineHeight: 22 },
  backBtn: { borderRadius: 8, backgroundColor: '#6c63ff' },
});
