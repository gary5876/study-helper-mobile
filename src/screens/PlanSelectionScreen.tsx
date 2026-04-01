import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { savePlan } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanSelection'>;

export default function PlanSelectionScreen({ navigation }: Props) {
  // 초기 온보딩: replace 사용 / 홈에서 설정 진입: 스택 초기화
  function goTo(screen: keyof RootStackParamList) {
    if (navigation.canGoBack()) {
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: screen }] }));
    } else {
      navigation.replace(screen as any);
    }
  }

  async function handleSelectFree() {
    await savePlan('free');
    goTo('Home');
  }

  async function handleSelectPaid() {
    await savePlan('paid');
    goTo('ApiKeySetup');
  }

  async function handleSelectGpt() {
    await savePlan('gpt');
    goTo('ApiKeySetup');
  }

  async function handleSelectTimely() {
    await savePlan('timely');
    goTo('ApiKeySetup');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Study Helper
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        플랜을 선택해주세요
      </Text>

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text variant="titleLarge" style={styles.planTitle}>무료 플랜</Text>
          <Text variant="bodyMedium" style={styles.planDesc}>
            API 키 없이 바로 시작할 수 있습니다.{'\n'}
            Google Gemini 모델로 학습 콘텐츠를 생성합니다.
          </Text>
          <Text variant="bodySmall" style={styles.planNote}>
            • API 키 불필요{'\n'}
            • Google Gemini 2.0 Flash 사용{'\n'}
            • 서버 트래픽에 따라 속도 차이 있을 수 있음
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={handleSelectFree} style={styles.button}>
            무료로 시작
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text variant="titleLarge" style={styles.planTitle}>Anthropic Claude</Text>
          <Text variant="bodyMedium" style={styles.planDesc}>
            본인의 Anthropic API 키를 사용합니다.{'\n'}
            Claude Sonnet 모델로 높은 품질의 콘텐츠를 생성합니다.
          </Text>
          <Text variant="bodySmall" style={styles.planNote}>
            • Anthropic API 키 필요 (sk-ant-...){'\n'}
            • Claude Sonnet 사용{'\n'}
            • console.anthropic.com에서 발급
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="outlined" onPress={handleSelectPaid} style={styles.button}>
            Anthropic 키로 시작
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text variant="titleLarge" style={styles.planTitle}>OpenAI GPT</Text>
          <Text variant="bodyMedium" style={styles.planDesc}>
            본인의 OpenAI API 키를 사용합니다.{'\n'}
            GPT-4o-mini 모델로 학습 콘텐츠를 생성합니다.
          </Text>
          <Text variant="bodySmall" style={styles.planNote}>
            • OpenAI API 키 필요 (sk-...){'\n'}
            • GPT-4o-mini 사용{'\n'}
            • platform.openai.com에서 발급
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="outlined" onPress={handleSelectGpt} style={styles.button}>
            OpenAI 키로 시작
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Text variant="titleLarge" style={styles.planTitle}>TimelyGPT</Text>
          <Text variant="bodyMedium" style={styles.planDesc}>
            TimelyGPT API 키로 GPT·Claude·Gemini 등{'\n'}
            50개 이상의 모델 중 선택해 사용합니다.
          </Text>
          <Text variant="bodySmall" style={styles.planNote}>
            • TimelyGPT API 키 필요 (timelygpt.co.kr 발급){'\n'}
            • 50+ 모델 지원{'\n'}
            • timelygpt.co.kr에서 발급
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="outlined" onPress={handleSelectTimely} style={styles.button}>
            TimelyGPT 키로 시작
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.6,
  },
  card: {
    marginBottom: 16,
  },
  planTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  planDesc: {
    marginBottom: 12,
    lineHeight: 22,
  },
  planNote: {
    opacity: 0.6,
    lineHeight: 20,
  },
  button: {
    marginTop: 4,
  },
});
