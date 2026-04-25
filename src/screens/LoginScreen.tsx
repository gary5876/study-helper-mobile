import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../services/supabase';

type Mode = 'login' | 'signup';

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEmailAuth() {
    if (mode === 'signup' && !agreed) {
      Alert.alert('약관 동의 필요', '회원가입을 진행하려면 약관에 동의해 주세요.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { terms_accepted_at: new Date().toISOString() },
          },
        });
        if (error) throw error;
        Alert.alert('확인 이메일 발송', '받은 편지함을 확인해 주세요.');
      }
    } catch (err: any) {
      Alert.alert('오류', err.message ?? '처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (mode === 'signup' && !agreed) {
      Alert.alert('약관 동의 필요', '회원가입을 진행하려면 약관에 동의해 주세요.');
      return;
    }
    setLoading(true);
    try {
      const redirectTo = Linking.createURL('auth/callback');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('OAuth URL 생성에 실패했습니다.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success' || !result.url) {
        setLoading(false);
        return;
      }
      const parsed = Linking.parse(result.url);
      const code = (parsed.queryParams?.code as string) ?? undefined;
      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exErr) throw exErr;
      }
    } catch (err: any) {
      Alert.alert('Google 로그인 실패', err.message ?? '다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>공부 도우미</Text>
      <Text style={styles.subtitle}>
        {mode === 'login' ? '계정에 로그인하세요' : '새 계정을 만드세요'}
      </Text>

      <TouchableOpacity
        style={[styles.googleBtn, (loading || (mode === 'signup' && !agreed)) && styles.disabled]}
        onPress={handleGoogle}
        disabled={loading || (mode === 'signup' && !agreed)}
      >
        <Text style={styles.googleText}>Google로 {mode === 'login' ? '로그인' : '가입'}</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.dividerLine} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="이메일"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호 (6자 이상)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {mode === 'signup' && (
        <TouchableOpacity
          style={styles.consentRow}
          onPress={() => setAgreed((v) => !v)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.consentText}>
            가입하면 생성된 학습 자료가 서비스 품질 개선에 활용될 수 있음에 동의합니다.
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, (loading || (mode === 'signup' && !agreed)) && styles.disabled]}
        onPress={handleEmailAuth}
        disabled={loading || (mode === 'signup' && !agreed)}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>{mode === 'login' ? '로그인' : '회원가입'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setMode((m) => (m === 'login' ? 'signup' : 'login'));
          setAgreed(false);
        }}
      >
        <Text style={styles.toggleText}>
          {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f9fafb' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4f46e5', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8, marginBottom: 32 },
  googleBtn: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  googleText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { marginHorizontal: 12, fontSize: 12, color: '#6b7280' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 8,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  consentText: { flex: 1, fontSize: 12, color: '#4b5563', lineHeight: 18 },
  submitBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  disabled: { opacity: 0.5 },
  toggleText: { textAlign: 'center', color: '#4f46e5', marginTop: 20, fontSize: 14 },
});
