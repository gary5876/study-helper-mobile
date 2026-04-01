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
import { useLanguageStore } from '../store/languageStore';
import { STRINGS } from '../i18n/strings';

type Props = NativeStackScreenProps<RootStackParamList, 'Upload'>;

type Stage = 'idle' | 'uploading' | 'generating' | 'done' | 'error';

export default function UploadScreen({ navigation }: Props) {
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [fileName, setFileName] = useState('');
  const setSession = useSessionStore((state) => state.setSession);
  const { lang } = useLanguageStore();
  const s = STRINGS[lang];

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
      Alert.alert(s.uploadFileTooLarge, s.uploadFileTooLargeDesc);
      return;
    }

    const plan = (await getPlan()) ?? 'paid';
    const apiKey = plan !== 'free' ? (await getApiKey() ?? '') : '';
    if (plan !== 'free' && !apiKey) {
      Alert.alert(s.uploadNoApiKey, s.uploadNoApiKeyDesc);
      return;
    }

    try {
      setStage('uploading');
      setProgress(0.05);
      setStatusText(s.uploadUploading);

      const uploadRes = await uploadPDF(asset.uri, name, apiKey, plan);

      await createSession({
        id: uploadRes.session_id,
        pdf_name: name,
        page_count: uploadRes.page_count,
        word_count: uploadRes.word_count,
      });

      setStage('generating');
      setProgress(0.1);
      setStatusText(s.uploadAnalyzing);
      await startGeneration(uploadRes.session_id, apiKey, plan, lang);

      const content: StudyContent = await waitForCompletion(
        uploadRes.session_id,
        (pct, text) => {
          setProgress(pct / 100);
          setStatusText(text);
        }
      );

      await saveStudyContent({
        session_id: uploadRes.session_id,
        notes_json: JSON.stringify(content.notes),
        mcq_json: JSON.stringify(content.mcq_questions),
        fill_json: JSON.stringify(content.fill_questions),
      });
      await updateSessionStatus(uploadRes.session_id, 'ready');

      setSession(uploadRes.session_id, content);

      setStage('done');
      setProgress(1);
      setStatusText(s.uploadDone);

      navigation.replace('StudyNotes', { sessionId: uploadRes.session_id });
    } catch (err: any) {
      setStage('error');
      setStatusText(err?.message || s.uploadError);
      Alert.alert(s.uploadFailed, err?.message || s.uploadError);
    }
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          {stage === 'idle' && (
            <>
              <Text variant="titleLarge" style={styles.title}>{s.uploadTitle}</Text>
              <Text variant="bodyMedium" style={styles.description}>{s.uploadDesc}</Text>
              <Button
                mode="contained"
                onPress={handlePick}
                icon="file-pdf-box"
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                {s.uploadChoose}
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
              <Text variant="titleMedium" style={styles.errorTitle}>{s.uploadFailed}</Text>
              <Text variant="bodyMedium" style={styles.errorText}>{statusText}</Text>
              <Button mode="contained" onPress={() => setStage('idle')} style={styles.button}>
                {s.uploadTryAgain}
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
