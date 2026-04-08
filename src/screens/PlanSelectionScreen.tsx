import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Linking,
} from 'react-native';
import { Text, Button, Card, Menu, TextInput, HelperText } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { savePlan, saveApiKey, getPlan, getApiKey, Plan } from '../services/api';
import { useModelStore, PLAN_MODELS, DEFAULT_MODELS } from '../store/modelStore';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanSelection'>;

interface ServiceOption {
  plan: Plan;
  label: string;
  needsKey: boolean;
  keyPlaceholder: string;
  keyHint: string;
  validate: (k: string) => boolean;
  validationMsg: string;
}

const SERVICES: ServiceOption[] = [
  {
    plan: 'timely',
    label: 'TimelyGPT',
    needsKey: true,
    keyPlaceholder: 'tgpt-sk-...',
    keyHint: 'timelygpt.co.kr → 설정 → 연동 키 관리',
    validate: (k) => k.length >= 10,
    validationMsg: '키가 너무 짧습니다. 올바른 키인지 확인해 주세요.',
  },
  {
    plan: 'paid',
    label: 'Anthropic Claude',
    needsKey: true,
    keyPlaceholder: 'sk-ant-api03-...',
    keyHint: 'console.anthropic.com에서 발급',
    validate: (k) => k.startsWith('sk-ant-'),
    validationMsg: 'Anthropic 키는 보통 sk-ant- 로 시작합니다.',
  },
  {
    plan: 'gpt',
    label: 'OpenAI GPT',
    needsKey: true,
    keyPlaceholder: 'sk-...',
    keyHint: 'platform.openai.com에서 발급',
    validate: (k) => k.startsWith('sk-'),
    validationMsg: 'OpenAI 키는 보통 sk- 로 시작합니다.',
  },
];

export default function PlanSelectionScreen({ navigation }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('timely');
  const [selectedModel, setSelectedModelLocal] = useState(DEFAULT_MODELS['timely']);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [editingKey, setEditingKey] = useState(false);
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false); // 이미 설정이 있는 경우
  const { setModel } = useModelStore();

  useEffect(() => {
    (async () => {
      const plan = await getPlan();
      if (plan) {
        setIsEditing(true);
        setSelectedPlan(plan);
        setSelectedModelLocal(DEFAULT_MODELS[plan]);
        const key = await getApiKey();
        if (key) setApiKeySaved(true);
      }
    })();
  }, []);

  const service = SERVICES.find((s) => s.plan === selectedPlan)!;
  const models = PLAN_MODELS[selectedPlan];

  function handleSelectService(plan: Plan) {
    setSelectedPlan(plan);
    setSelectedModelLocal(DEFAULT_MODELS[plan]);
    setApiKey('');
    setApiKeySaved(false);
    setEditingKey(false);
    setError('');
    setServiceMenuOpen(false);
  }

  function handleSelectModel(model: string) {
    setSelectedModelLocal(model);
    setModelMenuOpen(false);
  }

  async function handleSave() {
    if (service.needsKey && !apiKeySaved && !apiKey.trim()) {
      setError('API 키를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await savePlan(selectedPlan);
      setModel(selectedPlan, selectedModel);
      if (service.needsKey && (editingKey || !apiKeySaved) && apiKey.trim()) {
        await saveApiKey(apiKey.trim());
      }
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));
    } catch {
      setError('설정 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  const canSave = !service.needsKey || apiKeySaved || apiKey.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>Fundamentals</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>Your AI-powered study companion</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.cardTitle}>AI 서비스 설정</Text>

            {/* ── 서비스 드롭다운 ── */}
            <Text variant="labelMedium" style={styles.label}>서비스</Text>
            <Menu
              visible={serviceMenuOpen}
              onDismiss={() => setServiceMenuOpen(false)}
              anchor={
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setServiceMenuOpen(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText}>{service.label}</Text>
                  <Text style={styles.dropdownArrow}>▾</Text>
                </TouchableOpacity>
              }
            >
              {SERVICES.map((s) => (
                <Menu.Item
                  key={s.plan}
                  title={s.label}
                  onPress={() => handleSelectService(s.plan)}
                  titleStyle={selectedPlan === s.plan ? styles.menuItemSelected : undefined}
                />
              ))}
            </Menu>

            {/* ── 모델 드롭다운 ── */}
            <Text variant="labelMedium" style={[styles.label, styles.labelGap]}>모델</Text>
            <Menu
              visible={modelMenuOpen}
              onDismiss={() => setModelMenuOpen(false)}
              anchor={
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setModelMenuOpen(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText} numberOfLines={1}>{selectedModel}</Text>
                  <Text style={styles.dropdownArrow}>▾</Text>
                </TouchableOpacity>
              }
            >
              {models.map((m) => (
                <Menu.Item
                  key={m}
                  title={m + (m === DEFAULT_MODELS[selectedPlan] ? '  (기본값)' : '')}
                  onPress={() => handleSelectModel(m)}
                  titleStyle={selectedModel === m ? styles.menuItemSelected : undefined}
                />
              ))}
            </Menu>

            {/* ── API Key ── */}
            {service.needsKey && (
              <>
                <Text variant="labelMedium" style={[styles.label, styles.labelGap]}>API Key</Text>
                {apiKeySaved && !editingKey ? (
                  <View style={styles.savedRow}>
                    <Text style={styles.savedText}>●●●●●●●●●●●●  저장됨</Text>
                    <Button
                      mode="text"
                      compact
                      textColor="#6c63ff"
                      onPress={() => { setEditingKey(true); setApiKey(''); }}
                    >
                      변경
                    </Button>
                  </View>
                ) : (
                  <TextInput
                    value={apiKey}
                    onChangeText={(t) => { setApiKey(t); setError(''); }}
                    secureTextEntry
                    mode="outlined"
                    placeholder={service.keyPlaceholder}
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
                {/* 형식 경고 — 저장은 가능 */}
                {apiKey.trim().length > 0 && !service.validate(apiKey.trim()) && (
                  <Text style={styles.warning}>⚠ {service.validationMsg}</Text>
                )}
              </>
            )}

            {/* ── 힌트 ── */}
            <Text variant="bodySmall" style={styles.hint}>{service.keyHint}</Text>

            {/* ── TimelyGPT 가이드 ── */}
            {selectedPlan === 'timely' && (
              <View style={styles.guideBox}>
                <Text variant="labelSmall" style={styles.guideTitle}>키 발급 방법</Text>
                <Text variant="bodySmall" style={styles.guideStep}>① TimelyGPT 앱 → 설정 탭</Text>
                <Text variant="bodySmall" style={styles.guideStep}>② 연동 키 관리 → 재발급</Text>
                <Text variant="bodySmall" style={styles.guideStep}>③ 복사 후 위에 붙여넣기</Text>
                <Text variant="bodySmall" style={styles.guideNote}>
                  콘텐츠 생성 시 본인 계정 크레딧이 사용됩니다.
                </Text>
              </View>
            )}

            {!!error && <HelperText type="error">{error}</HelperText>}

            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={loading || !canSave}
              style={styles.button}
              contentStyle={styles.buttonContent}
              buttonColor="#6c63ff"
            >
              {isEditing ? '저장' : '시작하기'}
            </Button>
          </Card.Content>
        </Card>

        <TouchableOpacity
          onPress={() => Linking.openURL('https://study-helper-web.vercel.app/privacy')}
          style={styles.privacyLink}
        >
          <Text variant="bodySmall" style={styles.privacyLinkText}>개인정보처리방침</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { color: '#fff', fontWeight: 'bold' },
  subtitle: { color: '#aaa', marginTop: 8 },

  card: { borderRadius: 16 },
  cardContent: { gap: 4 },
  cardTitle: { fontWeight: 'bold', marginBottom: 12 },

  label: { color: '#555', marginBottom: 6 },
  labelGap: { marginTop: 14 },

  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#fff',
  },
  dropdownText: { fontSize: 16, color: '#222', flex: 1 },
  dropdownArrow: { fontSize: 14, color: '#888', marginLeft: 8 },
  menuItemSelected: { color: '#6c63ff', fontWeight: '700' },

  input: { backgroundColor: '#fff' },

  savedRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#ccc', borderRadius: 4,
    paddingHorizontal: 14, paddingVertical: 4,
    backgroundColor: '#f9f9f9',
  },
  savedText: { color: '#888', fontSize: 15, letterSpacing: 1 },

  hint: { color: '#999', marginTop: 6 },
  warning: { color: '#f59e0b', fontSize: 12, marginTop: 4 },

  guideBox: {
    backgroundColor: '#ede9ff', borderRadius: 10,
    padding: 12, marginTop: 10, gap: 3,
  },
  guideTitle: { color: '#6c63ff', fontWeight: '700', marginBottom: 4 },
  guideStep: { color: '#444', lineHeight: 20 },
  guideNote: { color: '#6c63ff', fontWeight: '500', marginTop: 6 },

  button: { marginTop: 20, borderRadius: 8 },
  buttonContent: { paddingVertical: 6 },

  privacyLink: { alignItems: 'center', marginTop: 16 },
  privacyLinkText: { color: '#aaa', textDecorationLine: 'underline' },
});
