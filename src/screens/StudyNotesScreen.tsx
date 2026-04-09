import React, { useEffect, useState } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Text, Card, Chip, Divider, Button, List } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getStudyContent } from '../services/storage';
import { StudyNotes, KeyConcept } from '../services/api';
import { useSessionStore } from '../store/sessionStore';
import { useLanguageStore } from '../store/languageStore';
import { STRINGS } from '../i18n/strings';
import ConceptHighlight from '../components/ConceptHighlight';

type Props = NativeStackScreenProps<RootStackParamList, 'StudyNotes'>;

export default function StudyNotesScreen({ route, navigation }: Props) {
  const { sessionId } = route.params;
  const [notes, setNotes] = useState<StudyNotes | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedConcept, setSelectedConcept] = useState<KeyConcept | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const { studyContent, setSession } = useSessionStore();
  const { lang } = useLanguageStore();
  const s = STRINGS[lang];

  useEffect(() => {
    async function load() {
      if (studyContent?.session_id === sessionId) {
        setNotes(studyContent.notes);
        setLoading(false);
        return;
      }
      const row = await getStudyContent(sessionId);
      if (row) {
        const parsedNotes: StudyNotes = JSON.parse(row.notes_json);
        setNotes(parsedNotes);
      }
      setLoading(false);
    }
    load();
  }, [sessionId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6c63ff" />
      </View>
    );
  }

  if (!notes) {
    return (
      <View style={styles.center}>
        <Text>{s.studyNotesLoadError}</Text>
      </View>
    );
  }

  function toggleSection(index: number) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  const importanceColor = (imp: KeyConcept['importance']) => {
    switch (imp) {
      case 'high': return '#e53935';
      case 'medium': return '#fb8c00';
      default: return '#43a047';
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Key Concepts */}
        <Text variant="titleLarge" style={styles.sectionHeader}>{s.studyNotesKeyConcepts}</Text>
        <View style={styles.conceptGrid}>
          {notes.key_concepts.map((concept) => (
            <TouchableOpacity
              key={concept.id}
              onPress={() => setSelectedConcept(concept)}
              activeOpacity={0.7}
            >
              <Chip
                style={[styles.conceptChip, { borderColor: importanceColor(concept.importance) }]}
                mode="outlined"
                textStyle={styles.conceptChipText}
              >
                {concept.term}
              </Chip>
            </TouchableOpacity>
          ))}
        </View>

        <Divider style={styles.divider} />

        {/* Sections */}
        <Text variant="titleLarge" style={styles.sectionHeader}>{s.studyNotesSummaries}</Text>
        {notes.sections.map((section, index) => (
          <Card key={index} style={styles.sectionCard}>
            <TouchableOpacity onPress={() => toggleSection(index)} activeOpacity={0.8}>
              <Card.Title
                title={section.title}
                titleStyle={styles.sectionTitle}
                right={(props) => (
                  <Text {...props} style={styles.chevron}>
                    {expandedSections.has(index) ? '▲' : '▼'}
                  </Text>
                )}
              />
            </TouchableOpacity>
            {expandedSections.has(index) && (
              <Card.Content>
                <Text variant="bodyMedium" style={styles.summary}>{section.summary}</Text>
                {section.bullets.map((bullet, bi) => (
                  <Text key={bi} variant="bodySmall" style={styles.bullet}>
                    • {bullet}
                  </Text>
                ))}
              </Card.Content>
            )}
          </Card>
        ))}

        <Divider style={styles.divider} />

        {/* Glossary */}
        <Text variant="titleLarge" style={styles.sectionHeader}>{s.studyNotesGlossary}</Text>
        {notes.glossary.map((entry, index) => (
          <View key={index} style={styles.glossaryRow}>
            <Text variant="bodyMedium" style={styles.glossaryTerm}>{entry.term}</Text>
            <Text variant="bodySmall" style={styles.glossaryDef}>{entry.brief_def}</Text>
          </View>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.fabContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('QuizMode', { sessionId })}
          style={styles.startButton}
          contentStyle={styles.startButtonContent}
          icon="pencil"
        >
          {s.studyNotesStartTest}
        </Button>
      </View>

      {selectedConcept && (
        <ConceptHighlight
          concept={selectedConcept}
          onClose={() => setSelectedConcept(null)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, gap: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionHeader: { fontWeight: 'bold', color: '#333', marginTop: 8 },
  conceptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  conceptChip: { borderWidth: 1.5 },
  conceptChipText: { fontSize: 13 },
  divider: { marginVertical: 16 },
  sectionCard: { marginBottom: 8, borderRadius: 12 },
  sectionTitle: { fontWeight: '600', fontSize: 15 },
  chevron: { paddingRight: 16, fontSize: 12, color: '#999' },
  summary: { color: '#555', marginBottom: 8, lineHeight: 20 },
  bullet: { color: '#444', marginBottom: 4, lineHeight: 18, paddingLeft: 4 },
  glossaryRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  glossaryTerm: { fontWeight: '600', color: '#333' },
  glossaryDef: { color: '#666', marginTop: 2 },
  fabContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: 'rgba(245,245,245,0.95)',
    borderTopWidth: 1, borderTopColor: '#e0e0e0',
  },
  startButton: { borderRadius: 8, backgroundColor: '#6c63ff' },
  startButtonContent: { paddingVertical: 6 },
});
