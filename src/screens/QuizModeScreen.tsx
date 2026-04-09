/**
 * Mode selection screen shown before a quiz begins.
 * User picks one of three study modes; the choice filters questions by level.
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguageStore } from '../store/languageStore';
import { STRINGS } from '../i18n/strings';
import type { StudyMode } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizMode'>;

interface ModeCard {
  mode: StudyMode;
  titleKey: keyof typeof STRINGS['ko'];
  descKey: keyof typeof STRINGS['ko'];
  levelTag: string;
  accentColor: string;
  bgColor: string;
}

const MODES: ModeCard[] = [
  {
    mode: 'light',
    titleKey: 'modeLight',
    descKey: 'modeLightDesc',
    levelTag: 'Lv.1–2',
    accentColor: '#00897b',
    bgColor: '#e0f2f1',
  },
  {
    mode: 'exam',
    titleKey: 'modeExam',
    descKey: 'modeExamDesc',
    levelTag: 'Lv.3–5',
    accentColor: '#e65100',
    bgColor: '#fff3e0',
  },
  {
    mode: 'max',
    titleKey: 'modeMax',
    descKey: 'modeMaxDesc',
    levelTag: 'Lv.5',
    accentColor: '#c62828',
    bgColor: '#fce4ec',
  },
];

export default function QuizModeScreen({ route, navigation }: Props) {
  const { sessionId } = route.params;
  const { lang } = useLanguageStore();
  const s = STRINGS[lang];

  function handleSelect(mode: StudyMode) {
    navigation.replace('MCQ', { sessionId, mode });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="titleLarge" style={styles.heading}>{s.modeSelectTitle}</Text>
      <Text variant="bodyMedium" style={styles.subheading}>{s.modeSelectSubtitle}</Text>

      {MODES.map(({ mode, titleKey, descKey, levelTag, accentColor, bgColor }) => (
        <TouchableOpacity
          key={mode}
          style={[styles.card, { borderColor: accentColor }]}
          onPress={() => handleSelect(mode)}
          activeOpacity={0.75}
        >
          <View style={[styles.levelTag, { backgroundColor: bgColor }]}>
            <Text style={[styles.levelTagText, { color: accentColor }]}>{levelTag}</Text>
          </View>
          <Text variant="titleMedium" style={[styles.cardTitle, { color: accentColor }]}>
            {s[titleKey] as string}
          </Text>
          <Text variant="bodySmall" style={styles.cardDesc}>
            {s[descKey] as string}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  heading: { fontWeight: 'bold', color: '#333', marginTop: 8 },
  subheading: { color: '#777', marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    gap: 8,
    elevation: 2,
  },
  levelTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 4,
  },
  levelTagText: { fontSize: 12, fontWeight: '700' },
  cardTitle: { fontWeight: '700', fontSize: 18 },
  cardDesc: { color: '#555', lineHeight: 20 },
});
