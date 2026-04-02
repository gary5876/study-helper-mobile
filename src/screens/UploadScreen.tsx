import React, { useState } from 'react';
import { View, StyleSheet, Alert, Modal, ScrollView } from 'react-native';
import { Text, Button, Card, ProgressBar, ActivityIndicator, Divider } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  getApiKey, getPlan, uploadPDF, startGeneration, waitForCompletion, StudyContent,
} from '../services/api';
import {
  createSession, updateSessionStatus, saveStudyContent, getSetting, setSetting,
} from '../services/storage';
import { useSessionStore } from '../store/sessionStore';
import { useLanguageStore } from '../store/languageStore';
import { useModelStore } from '../store/modelStore';
import { STRINGS } from '../i18n/strings';

type Props = NativeStackScreenProps<RootStackParamList, 'Upload'>;

type Stage = 'idle' | 'uploading' | 'generating' | 'done' | 'error';

const CONSENT_KEY = 'upload_consent_given';

export default function UploadScreen({ navigation }: Props) {
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [fileName, setFileName] = useState('');
  const [showConsent, setShowConsent] = useState(false);
  const setSession = useSessionStore((state) => state.setSession);
  const { lang } = useLanguageStore();
  const { getModel } = useModelStore();
  const s = STRINGS[lang];

  async function handlePick() {
    const consented = await getSetting(CONSENT_KEY);
    if (!consented) {
      setShowConsent(true);
      return;
    }
    await pickAndUpload();
  }

  async function handleConsentAgree() {
    await setSetting(CONSENT_KEY, '1');
    setShowConsent(false);
    await pickAndUpload();
  }

  async function pickAndUpload() {
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
      const model = getModel(plan);
      await startGeneration(uploadRes.session_id, apiKey, plan, lang, model);

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
      {/* 동의 모달 — 최초 업로드 시 1회만 표시 */}
      <Modal visible={showConsent} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text variant="titleLarge" style={styles.modalTitle}>업로드 전 확인해 주세요</Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text variant="labelMedium" style={styles.consentSectionTitle}>PDF 내용 외부 전송</Text>
              <Text variant="bodySmall" style={styles.consentBody}>
                업로드한 PDF의 텍스트는 선택하신 AI 서비스(Anthropic, OpenAI, Google, TimelyGPT)의
                서버로 전송되어 학습 자료 생성에 사용됩니다. 각 서비스의 개인정보처리방침이 적용되므로
                개인정보나 기밀이 포함된 파일은 업로드하지 않도록 주의해 주세요.
              </Text>

              <Divider style={styles.consentDivider} />

              <Text variant="labelMedium" style={styles.consentSectionTitle}>생성된 자료의 공유 가능성</Text>
              <Text variant="bodySmall" style={styles.consentBody}>
                동일한 PDF로 생성된 학습 자료(문제, 노트)는 서버의 문제은행에 저장되며,
                같은 파일을 업로드한 다른 사용자에게도 제공될 수 있습니다.
              </Text>

              <Divider style={styles.consentDivider} />

              <Text variant="labelMedium" style={styles.consentSectionTitle}>API 키 처리</Text>
              <Text variant="bodySmall" style={styles.consentBody}>
                입력한 API 키는 기기에 저장되며, 학습 자료 생성 요청 시 서버로 전송됩니다.
                서버는 API 키를 저장하지 않습니다.
              </Text>
            </ScrollView>

            <Button
              mode="contained"
              onPress={handleConsentAgree}
              style={styles.consentAgreeBtn}
              buttonColor="#6c63ff"
            >
              확인하고 계속하기
            </Button>
            <Button mode="text" onPress={() => setShowConsent(false)} textColor="#999">
              취소
            </Button>
          </View>
        </View>
      </Modal>

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
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, gap: 12,
  },
  modalTitle: { fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  modalScroll: { maxHeight: 320 },
  consentSectionTitle: { color: '#6c63ff', fontWeight: '700', marginBottom: 4 },
  consentBody: { color: '#444', lineHeight: 20, marginBottom: 8 },
  consentDivider: { marginVertical: 12 },
  consentAgreeBtn: { marginTop: 8, borderRadius: 8 },
});
