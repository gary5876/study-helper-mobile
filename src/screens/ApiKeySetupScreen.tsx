import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, HelperText } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { saveApiKey, saveBaseUrl, getPlan, Plan } from '../services/api';
import { ENV } from '../config/env';

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
    description: '키는 기기 내에만 안전하게 저장됩니다. 서버로 전송되지 않습니다.',
    placeholder: 'sk-ant-api03-...',
    link: 'console.anthropic.com에서 발급',
    validate: (k) => k.startsWith('sk-ant-') && k.length > 20,
    validationMsg: 'Anthropic API 키는 sk-ant- 로 시작해야 합니다.',
  },
  gpt: {
    title: 'OpenAI API 키 입력',
    description: '키는 기기 내에만 안전하게 저장됩니다. 서버로 전송되지 않습니다.',
    placeholder: 'sk-...',
    link: 'platform.openai.com에서 발급',
    validate: (k) => k.startsWith('sk-') && k.length > 20,
    validationMsg: 'OpenAI API 키는 sk- 로 시작해야 합니다.',
  },
  timely: {
    title: 'TimelyGPT API 키 입력',
    description: '키는 기기 내에만 안전하게 저장됩니다. 서버로 전송되지 않습니다.',
    placeholder: 'tgpt-sk-...',
    link: 'timelygpt.co.kr에서 발급',
    validate: (k) => k.length > 10,
    validationMsg: 'TimelyGPT API 키를 올바르게 입력해 주세요.',
  },
};

export default function ApiKeySetupScreen({ navigation }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(ENV.BACKEND_URL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [plan, setPlan] = useState<Plan>('paid');

  useEffect(() => {
    getPlan().then((p) => { if (p && p !== 'free') setPlan(p); });
  }, []);

  const meta = PLAN_META[plan as Exclude<Plan, 'free'>] ?? PLAN_META.paid;
  const isValidKey = meta.validate(apiKey.trim());

  async function handleSave() {
    if (!isValidKey) {
      setError(meta.validationMsg);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await saveApiKey(apiKey.trim());
      await saveBaseUrl(baseUrl.trim() || ENV.BACKEND_URL);
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

            <Button
              mode="text"
              onPress={() => setShowAdvanced(!showAdvanced)}
              style={styles.advancedToggle}
            >
              {showAdvanced ? '고급 설정 숨기기' : '고급 설정'}
            </Button>

            {showAdvanced && (
              <TextInput
                label="Backend URL"
                value={baseUrl}
                onChangeText={setBaseUrl}
                mode="outlined"
                placeholder={ENV.BACKEND_URL}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}

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
  advancedToggle: { alignSelf: 'flex-start', marginBottom: 4 },
  button: { marginTop: 8, borderRadius: 8 },
  buttonContent: { paddingVertical: 6 },
  footer: { color: '#666', textAlign: 'center', marginTop: 24 },
});
