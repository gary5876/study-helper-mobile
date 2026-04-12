import React from 'react';
import { ScrollView, StyleSheet, View, Linking } from 'react-native';
import { Text, Card, Divider, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguageStore } from '../store/languageStore';
import { STRINGS } from '../i18n/strings';

type Props = NativeStackScreenProps<RootStackParamList, 'Privacy'>;

export default function PrivacyScreen({ navigation }: Props) {
  const { lang } = useLanguageStore();
  const s = STRINGS[lang];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>{s.privacyTitle}</Text>
      <Text variant="bodySmall" style={styles.date}>{s.privacyEffectiveDate}</Text>

      <Section title={s.privacyS1Title}>
        <Text style={styles.body}>{s.privacyS1Body}</Text>
      </Section>

      <Section title={s.privacyS2Title}>
        {s.privacyS2Items.map((item, i) => (
          <Text key={i} style={styles.listItem}>{'\u2022'} {item}</Text>
        ))}
        <View style={styles.note}>
          <Text style={styles.noteText}>{s.privacyS2Note}</Text>
        </View>
      </Section>

      <Section title={s.privacyS3Title}>
        {s.privacyS3Items.map((item, i) => (
          <Text key={i} style={styles.listItem}>{'\u2022'} {item}</Text>
        ))}
      </Section>

      <Section title={s.privacyS4Title}>
        <Text style={styles.body}>{s.privacyS4Body}</Text>
        <View style={styles.note}>
          <Text style={styles.noteText}>{s.privacyS4Note}</Text>
        </View>
      </Section>

      <Section title={s.privacyS5Title}>
        {s.privacyS5Items.map((item, i) => (
          <Text key={i} style={styles.listItem}>{'\u2022'} {item}</Text>
        ))}
      </Section>

      <Section title={s.privacyS6Title}>
        <Text style={styles.body}>{s.privacyS6Body}</Text>
      </Section>

      <Section title={s.privacyS7Title}>
        {s.privacyS7Items.map((item, i) => (
          <Text key={i} style={styles.listItem}>{'\u2022'} {item}</Text>
        ))}
      </Section>

      <Section title={s.privacyS8Title}>
        <Text style={styles.body}>{s.privacyS8Body}</Text>
      </Section>

      <Section title={s.privacyS9Title}>
        <Text style={styles.body}>{s.privacyS9Body}</Text>
      </Section>

      <Section title={s.privacyS10Title}>
        <Text style={styles.body}>{s.privacyS10Body}</Text>
        <Button
          mode="text"
          compact
          onPress={() => Linking.openURL('https://github.com/gary5876/study-helper-backend/issues')}
          style={styles.linkBtn}
        >
          GitHub Issues
        </Button>
      </Section>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>{title}</Text>
        <Divider style={styles.divider} />
        {children}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, gap: 12 },
  title: { fontWeight: 'bold', color: '#333', marginBottom: 2 },
  date: { color: '#999', marginBottom: 12 },
  sectionCard: { borderRadius: 12, elevation: 1 },
  sectionTitle: { fontWeight: '600', color: '#333', marginBottom: 4 },
  divider: { marginVertical: 8 },
  body: { color: '#555', lineHeight: 22 },
  listItem: { color: '#555', lineHeight: 22, marginBottom: 4, paddingLeft: 4 },
  note: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#ede7f6',
    borderRadius: 8,
  },
  noteText: { color: '#5e35b1', fontSize: 13, lineHeight: 18 },
  linkBtn: { alignSelf: 'flex-start', marginTop: 4 },
});
