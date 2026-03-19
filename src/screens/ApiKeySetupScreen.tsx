import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, HelperText } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { saveApiKey, saveBaseUrl } from '../services/api';
import { ENV } from '../config/env';

type Props = NativeStackScreenProps<RootStackParamList, 'ApiKeySetup'>;

export default function ApiKeySetupScreen({ navigation }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(ENV.BACKEND_URL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isValidKey = apiKey.trim().startsWith('sk-ant-') && apiKey.trim().length > 20;

  async function handleSave() {
    if (!isValidKey) {
      setError('Please enter a valid Anthropic API key (starts with sk-ant-).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await saveApiKey(apiKey.trim());
      await saveBaseUrl(baseUrl.trim() || ENV.BACKEND_URL);
      navigation.replace('Home');
    } catch (e) {
      setError('Failed to save settings. Please try again.');
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
              Enter Your Anthropic API Key
            </Text>
            <Text variant="bodySmall" style={styles.description}>
              Your key is stored securely on your device only. It is never sent to our servers.
            </Text>

            <TextInput
              label="Anthropic API Key"
              value={apiKey}
              onChangeText={(t) => { setApiKey(t); setError(''); }}
              secureTextEntry
              mode="outlined"
              placeholder="sk-ant-api03-..."
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
              {showAdvanced ? 'Hide advanced settings' : 'Advanced settings'}
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
              Get Started
            </Button>
          </Card.Content>
        </Card>

        <Text variant="bodySmall" style={styles.footer}>
          Get your key at console.anthropic.com
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
