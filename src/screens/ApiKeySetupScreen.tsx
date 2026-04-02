import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card, HelperText } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { saveApiKey, getPlan, Plan } from '../services/api';
import { useModelStore, PLAN_MODELS, DEFAULT_MODELS } from '../store/modelStore';
import { useLanguageStore } from '../store/languageStore';
import { STRINGS } from '../i18n/strings';

type Props = NativeStackScreenProps<RootStackParamList, 'ApiKeySetup'>;

interface PlanMeta {
  title: string;
  description: string;
  placeholder: string;
  link: string;
  validate: (key: string) => boolean;
  validationMsg: string;
}

const PLAN_META: Record<Exclude<Plan, 'free'>, PlanMeta> = {
  paid: {
    title: 'Anthropic API 키 입력',
    description: '키는 기기에 저장되며, 학습 자료 생성 요청 시 서버로 전송됩니다. 서버는 키를 저장하지 않습니다.',
    placeholder: 'sk-ant-api03-...',
    link: 'console.anthropic.com에서 발급',
    validate: (k) => k.startsWith('sk-ant-') && k.length > 20,
    validationMsg: 'Anthropic API 키는 sk-ant- 로 시작해야 합니다.',
  },
  gpt: {
    title: 'OpenAI API 키 입력',
    description: '키는 기기에 저장되며, 학습 자료 생성 요청 시 서버로 전송됩니다. 서버는 키를 저장하지 않습니다.',
    placeholder: 'sk-...',
    link: 'platform.openai.com에서 발급',
    validate: (k) => k.startsWith('sk-') && k.length > 20,
    validationMsg: 'OpenAI API 키는 sk- 로 시작해야 합니다.',
  },
  timely: {
    title: 'TimelyGPT API 키 입력',
    description: '키는 기기에 저장되며, 학습 자료 생성 요청 시 서버로 전송됩니다. 서버는 키를 저장하지 않습니다.',
    placeholder: 'tgpt-sk-...',
    link: 'timelygpt.co.kr에서 크레딧 및 키 관리',
    validate: (k) => k.length > 10,
    validationMsg: 'TimelyGPT API 키를 올바르게 입력해 주세요.',
  },
};

export default function ApiKeySetupScreen({ navigation }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<Plan>('paid');
  const { setModel, getModel } = useModelStore();
  const { lang } = useLanguageStore();
  const s = STRINGS[lang];

  useEffect(() => {
    getPlan().then((p) => { if (p && p !== 'free') setPlan(p); });
  }, []);

  const meta = PLAN_META[plan as Exclude<Plan, 'free'>] ?? PLAN_META.paid;
  const isValidKey = meta.validate(apiKey.trim());
  const selectedModel = getModel(plan);
  const modelList = PLAN_MODELS[plan];

  async function handleSave() {
    if (!isValidKey) {
      setError(meta.validationMsg);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await saveApiKey(apiKey.trim());
      navigation.replace('Home');
    } catch (e) {
      setError('설정 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>Fundamentals</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Your AI-powered study companion
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {meta.title}
            </Text>
            <Text variant="bodySmall" style={styles.description}>
              {meta.description}
            </Text>

            {plan === 'timely' && (
              <View style={styles.guideBox}>
                <Text variant="labelMedium" style={styles.guideTitle}>TimelyGPT 앱에서 API 키 발급하기</Text>
                <Text variant="bodySmall" style={styles.guideStep}>① 설정 탭으로 이동</Text>
                <Text variant="bodySmall" style={styles.guideStep}>② 연동 키 관리 선택</Text>
                <Text variant="bodySmall" style={styles.guideStep}>③ 재발급 버튼 탭</Text>
                <Text variant="bodySmall" style={styles.guideStep}>④ 복사 후 아래에 붙여넣기</Text>
                <Text variant="bodySmall" style={styles.guideNote}>
                  학습 콘텐츠 생성 시 본인 계정의 크레딧이 사용됩니다.
                </Text>
              </View>
            )}

            <TextInput
              label="API Key"
              value={apiKey}
              onChangeText={(t) => { setApiKey(t); setError(''); }}
              secureTextEntry
              mode="outlined"
              placeholder={meta.placeholder}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!!error && <HelperText type="error">{error}</HelperText>}

            <Text variant="labelMedium" style={styles.modelLabel}>{s.modelSelectLabel}</Text>
            <View style={styles.modelRow}>
              {modelList.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.modelChip, selectedModel === m && styles.modelChipSelected]}
                  onPress={() => setModel(plan, m)}
                >
                  <Text
                    variant="bodySmall"
                    style={[styles.modelChipText, selectedModel === m && styles.modelChipTextSelected]}
                    numberOfLines={1}
                  >
                    {m}{m === DEFAULT_MODELS[plan] ? ` ${s.modelSelectDefault}` : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={loading || !apiKey.trim()}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              시작하기
            </Button>
          </Card.Content>
        </Card>

        <Text variant="bodySmall" style={styles.footer}>
          {meta.link}
        </Text>
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
  sectionTitle: { fontWeight: 'bold', marginBottom: 8 },
  description: { color: '#666', marginBottom: 16, lineHeight: 18 },
  input: { marginBottom: 12 },
  modelLabel: { color: '#666', marginBottom: 8, marginTop: 4 },
  modelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  modelChip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
    borderWidth: 1, borderColor: '#ccc', backgroundColor: '#f5f5f5',
  },
  modelChipSelected: { borderColor: '#6c63ff', backgroundColor: '#ede9ff' },
  modelChipText: { color: '#555' },
  modelChipTextSelected: { color: '#6c63ff', fontWeight: '600' },
  button: { marginTop: 8, borderRadius: 8 },
  buttonContent: { paddingVertical: 6 },
  footer: { color: '#666', textAlign: 'center', marginTop: 24 },
  guideBox: {
    backgroundColor: '#ede9ff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    gap: 4,
  },
  guideTitle: { color: '#6c63ff', fontWeight: '700', marginBottom: 6 },
  guideStep: { color: '#444', lineHeight: 22 },
  guideNote: { color: '#6c63ff', marginTop: 8, fontWeight: '500' },
});
