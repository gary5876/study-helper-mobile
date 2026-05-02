import React, { useState } from 'react';
import {
  View, StyleSheet, Alert, Modal, ScrollView, TextInput, TouchableOpacity,
} from 'react-native';
import { Text, Button, Card, ProgressBar, ActivityIndicator, Divider, Chip } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  getApiKey, getPlan, uploadPDF, startGeneration, waitForCompletion, StudyContent,
} from '../services/api';
import {
  createSession, updateSessionStatus, saveStudyContent, getSetting, setSetting,
  getAllSubjects, createSubject, SubjectRow,
} from '../services/storage';
import { useSessionStore } from '../store/sessionStore';
import { useLanguageStore } from '../store/languageStore';
import { useModelStore } from '../store/modelStore';
import { STRINGS } from '../i18n/strings';

type Props = NativeStackScreenProps<RootStackParamList, 'Upload'>;

type Stage = 'idle' | 'subject_select' | 'uploading' | 'generating' | 'done' | 'error';

const CONSENT_KEY = 'upload_consent_given';

export default function UploadScreen({ navigation }: Props) {
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUri, setFileUri] = useState('');
  const [showConsent, setShowConsent] = useState(false);

  // Subject selection state
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [showNewSubjectInput, setShowNewSubjectInput] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

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
    await pickAndSelectSubject();
  }

  async function handleConsentAgree() {
    await setSetting(CONSENT_KEY, '1');
    setShowConsent(false);
    await pickAndSelectSubject();
  }

  async function pickAndSelectSubject() {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    if (!asset.uri) return;

    const name = asset.name || 'document.pdf';
    const fileSizeMB = (asset.size ?? 0) / (1024 * 1024);
    if (fileSizeMB > 20) {
      Alert.alert(s.uploadFileTooLarge, s.uploadFileTooLargeDesc);
      return;
    }

    const loadedSubjects = await getAllSubjects();
    setSubjects(loadedSubjects);
    setFileName(name);
    setFileUri(asset.uri);
    setSelectedSubjectId(null); // default: uncategorized
    setShowNewSubjectInput(false);
    setNewSubjectName('');
    setStage('subject_select');
  }

  async function handleConfirmSubject() {
    let subjectId: string | null = null;

    if (showNewSubjectInput && newSubjectName.trim()) {
      try {
        const created = await createSubject(newSubjectName.trim());
        subjectId = created.id;
      } catch {
        Alert.alert('오류', '과목 생성에 실패했습니다. 이미 같은 이름이 있을 수 있습니다.');
        return;
      }
    } else {
      subjectId = selectedSubjectId;
    }

    await doUpload(subjectId);
  }

  async function doUpload(subjectId: string | null) {
    const plan = (await getPlan()) ?? 'paid';
    const apiKey = (await getApiKey()) ?? '';
    if (!apiKey) {
      Alert.alert(s.uploadNoApiKey, s.uploadNoApiKeyDesc);
      return;
    }

    try {
      setStage('uploading');
      setProgress(0.05);
      setStatusText(s.uploadUploading);

      const uploadRes = await uploadPDF(fileUri, fileName, apiKey, plan);

      await createSession({
        id: uploadRes.session_id,
        pdf_name: fileName,
        page_count: uploadRes.page_count,
        word_count: uploadRes.word_count,
        subject_id: subjectId,
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

  function selectExistingSubject(id: string | null) {
    setSelectedSubjectId(id);
    setShowNewSubjectInput(false);
    setNewSubjectName('');
  }

  function openNewSubjectInput() {
    setShowNewSubjectInput(true);
    setSelectedSubjectId(null);
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

              <Divider style={styles.consentDivider} />

              <Text variant="labelMedium" style={styles.consentSectionTitle}>저작권 준수</Text>
              <Text variant="bodySmall" style={styles.consentBody}>
                업로드하는 파일에 대한 적법한 사용 권한은 사용자 본인에게 있습니다.
                저작권법에 의해 보호되는 자료를 권한 없이 업로드하는 행위는 이용약관 위반이며,
                그에 따른 법적 책임은 사용자 본인이 부담합니다.
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
          {/* ── Idle: PDF 선택 ── */}
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

          {/* ── Subject Select: 과목 선택 ── */}
          {stage === 'subject_select' && (
            <>
              <Text variant="titleLarge" style={styles.title}>{s.subjectSelectStep}</Text>
              <Text variant="bodySmall" style={styles.fileName} numberOfLines={1}>{fileName}</Text>
              <Text variant="bodyMedium" style={styles.description}>{s.subjectSelectDesc}</Text>

              <ScrollView
                style={styles.chipsScroll}
                contentContainerStyle={styles.chipsContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* 미분류 chip */}
                <TouchableOpacity
                  onPress={() => selectExistingSubject(null)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.subjectChip,
                    (!selectedSubjectId && !showNewSubjectInput) && styles.subjectChipSelected,
                  ]}>
                    <Text style={[
                      styles.subjectChipText,
                      (!selectedSubjectId && !showNewSubjectInput) && styles.subjectChipTextSelected,
                    ]}>
                      {s.subjectUncategorized}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 기존 과목 chips */}
                {subjects.map((sub) => {
                  const isSelected = selectedSubjectId === sub.id && !showNewSubjectInput;
                  return (
                    <TouchableOpacity
                      key={sub.id}
                      onPress={() => selectExistingSubject(sub.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.subjectChip,
                        isSelected && { backgroundColor: sub.color, borderColor: sub.color },
                      ]}>
                        <Text style={[
                          styles.subjectChipText,
                          isSelected && styles.subjectChipTextSelected,
                        ]}>
                          {sub.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* 새 과목 chip */}
                <TouchableOpacity onPress={openNewSubjectInput} activeOpacity={0.7}>
                  <View style={[
                    styles.subjectChip,
                    styles.newSubjectChip,
                    showNewSubjectInput && styles.newSubjectChipActive,
                  ]}>
                    <Text style={[
                      styles.subjectChipText,
                      styles.newSubjectChipText,
                      showNewSubjectInput && styles.newSubjectChipTextActive,
                    ]}>
                      {s.subjectNewLabel}
                    </Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>

              {/* 새 과목 입력창 */}
              {showNewSubjectInput && (
                <TextInput
                  style={styles.subjectInput}
                  placeholder={s.subjectNamePlaceholder}
                  value={newSubjectName}
                  onChangeText={setNewSubjectName}
                  autoFocus
                  maxLength={30}
                />
              )}

              <Button
                mode="contained"
                onPress={handleConfirmSubject}
                style={styles.button}
                contentStyle={styles.buttonContent}
                buttonColor="#6c63ff"
                disabled={showNewSubjectInput && !newSubjectName.trim()}
              >
                {s.uploadStartBtn}
              </Button>

              <Button
                mode="text"
                onPress={() => setStage('idle')}
                textColor="#999"
              >
                {s.subjectCancel}
              </Button>
            </>
          )}

          {/* ── Uploading / Generating ── */}
          {(stage === 'uploading' || stage === 'generating') && (
            <>
              <ActivityIndicator animating size="large" color="#6c63ff" />
              <Text variant="titleMedium" style={styles.fileName}>{fileName}</Text>
              <Text variant="bodyMedium" style={styles.statusText}>{statusText}</Text>
              <ProgressBar progress={progress} color="#6c63ff" style={styles.progressBar} />
              <Text variant="bodySmall" style={styles.pct}>{Math.round(progress * 100)}%</Text>
            </>
          )}

          {/* ── Error ── */}
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
  title: { fontWeight: 'bold', textAlign: 'center' },
  description: { textAlign: 'center', color: '#666', lineHeight: 22 },
  button: { marginTop: 8, borderRadius: 8, minWidth: 180 },
  buttonContent: { paddingVertical: 6 },
  fileName: { fontWeight: '600', textAlign: 'center', color: '#333' },
  statusText: { color: '#666', textAlign: 'center' },
  progressBar: { width: '100%', height: 8, borderRadius: 4 },
  pct: { color: '#999' },
  errorTitle: { fontWeight: 'bold', color: '#e53935' },
  errorText: { textAlign: 'center', color: '#666' },

  // Subject chips
  chipsScroll: { maxHeight: 140, width: '100%' },
  chipsContainer: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingVertical: 4,
  },
  subjectChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  subjectChipSelected: {
    backgroundColor: '#9e9e9e', borderColor: '#9e9e9e',
  },
  subjectChipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  subjectChipTextSelected: { color: '#fff', fontWeight: '700' },
  newSubjectChip: { borderColor: '#6c63ff', borderStyle: 'dashed' },
  newSubjectChipActive: { backgroundColor: '#6c63ff', borderColor: '#6c63ff' },
  newSubjectChipText: { color: '#6c63ff' },
  newSubjectChipTextActive: { color: '#fff' },
  subjectInput: {
    width: '100%', borderWidth: 1, borderColor: '#6c63ff',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 15,
  },

  // Consent modal
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
