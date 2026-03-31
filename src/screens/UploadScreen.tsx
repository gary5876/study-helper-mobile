import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card, ProgressBar, ActivityIndicator } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  getApiKey, getPlan, uploadPDF, startGeneration, waitForCompletion, StudyContent,
} from '../services/api';
import {
  createSession, updateSessionStatus, saveStudyContent,
} from '../services/storage';
import { useSessionStore } from '../store/sessionStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Upload'>;

type Stage = 'idle' | 'uploading' | 'generating' | 'done' | 'error';

export default function UploadScreen({ navigation }: Props) {
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [fileName, setFileName] = useState('');
  const setSession = useSessionStore((s) => s.setSession);

  async function handlePick() {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    if (!asset.uri) return;

    const name = asset.name || 'document.pdf';
    setFileName(name);

    const fileSizeMB = (asset.size ?? 0) / (1024 * 1024);
    if (fileSizeMB > 20) {
      Alert.alert('File too large', 'Please select a PDF under 20MB.');
      return;
    }

    const plan = (await getPlan()) ?? 'paid';
    const apiKey = plan === 'paid' ? (await getApiKey() ?? '') : '';
    if (plan === 'paid' && !apiKey) {
      Alert.alert('API Key missing', 'Please set your Anthropic API key in settings.');
      return;
    }

    try {
      // Upload
      setStage('uploading');
      setProgress(0.05);
      setStatusText('Uploading PDF…');

      const uploadRes = await uploadPDF(asset.uri, name, apiKey, plan);

      // Save session record locally
      await createSession({
        id: uploadRes.session_id,
        pdf_name: name,
        page_count: uploadRes.page_count,
        word_count: uploadRes.word_count,
      });

      // Start generation
      setStage('generating');
      setProgress(0.1);
      setStatusText('Analyzing PDF…');
      await startGeneration(uploadRes.session_id, apiKey, plan);

      // Poll until complete
      const content: StudyContent = await waitForCompletion(
        uploadRes.session_id,
        (pct, text) => {
          setProgress(pct / 100);
          setStatusText(text);
        }
      );

      // Persist full content to SQLite
      await saveStudyContent({
        session_id: uploadRes.session_id,
        notes_json: JSON.stringify(content.notes),
        mcq_json: JSON.stringify(content.mcq_questions),
        fill_json: JSON.stringify(content.fill_questions),
      });
      await updateSessionStatus(uploadRes.session_id, 'ready');

      // Load into global store
      setSession(uploadRes.session_id, content);

      setStage('done');
      setProgress(1);
      setStatusText('Ready!');

      // Navigate to study notes
      navigation.replace('StudyNotes', { sessionId: uploadRes.session_id });
    } catch (err: any) {
      setStage('error');
      setStatusText(err?.message || 'Something went wrong.');
      Alert.alert('Error', err?.message || 'Something went wrong.');
    }
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          {stage === 'idle' && (
            <>
              <Text variant="titleLarge" style={styles.title}>Upload a PDF</Text>
              <Text variant="bodyMedium" style={styles.description}>
                Choose a text-based PDF (lecture slides, textbook chapters, notes).{'\n'}
                Maximum size: 20MB · Up to 50 pages processed.
              </Text>
              <Button
                mode="contained"
                onPress={handlePick}
                icon="file-pdf-box"
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Choose PDF
              </Button>
            </>
          )}

          {(stage === 'uploading' || stage === 'generating') && (
            <>
              <ActivityIndicator animating size="large" color="#6c63ff" />
              <Text variant="titleMedium" style={styles.fileName}>{fileName}</Text>
              <Text variant="bodyMedium" style={styles.statusText}>{statusText}</Text>
              <ProgressBar progress={progress} color="#6c63ff" style={styles.progressBar} />
              <Text variant="bodySmall" style={styles.pct}>{Math.round(progress * 100)}%</Text>
            </>
          )}

          {stage === 'error' && (
            <>
              <Text variant="titleMedium" style={styles.errorTitle}>Upload failed</Text>
              <Text variant="bodyMedium" style={styles.errorText}>{statusText}</Text>
              <Button mode="contained" onPress={() => setStage('idle')} style={styles.button}>
                Try Again
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f5f5f5' },
  card: { borderRadius: 16 },
  content: { alignItems: 'center', padding: 16, gap: 16 },
  title: { fontWeight: 'bold' },
  description: { textAlign: 'center', color: '#666', lineHeight: 22 },
  button: { marginTop: 8, borderRadius: 8, minWidth: 180 },
  buttonContent: { paddingVertical: 6 },
  fileName: { fontWeight: '600', textAlign: 'center' },
  statusText: { color: '#666', textAlign: 'center' },
  progressBar: { width: '100%', height: 8, borderRadius: 4 },
  pct: { color: '#999' },
  errorTitle: { fontWeight: 'bold', color: '#e53935' },
  errorText: { textAlign: 'center', color: '#666' },
});
