import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Card, Chip } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { savePlan } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanSelection'>;

export default function PlanSelectionScreen({ navigation }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Study Helper</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>플랜을 선택해주세요</Text>
      </View>

      {/* TimelyGPT — 추천 플랜 */}
      <Card style={styles.recommendedCard} mode="elevated">
        <Card.Content>
          <View style={styles.planTitleRow}>
            <Text variant="titleLarge" style={styles.planTitle}>TimelyGPT</Text>
            <Chip style={styles.recommendedBadge} textStyle={styles.recommendedBadgeText}>추천</Chip>
          </View>
          <Text variant="bodyMedium" style={styles.planDesc}>
            Claude, GPT, Gemini 중 원하는 AI로 학습 자료를 분석하고,{'\n'}
            TimelyGPT 크레딧으로 나만의 공부법을 완성하세요.
          </Text>
          <Text variant="bodySmall" style={styles.planNote}>
            • TimelyGPT API 키 필요{'\n'}
            • Claude, GPT, Gemini 등 50+ 모델 지원{'\n'}
            • timelygpt.co.kr에서 크레딧 및 키 관리
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={handleSelectTimely} style={styles.button} buttonColor="#6c63ff">
            TimelyGPT로 시작
          </Button>
        </Card.Actions>
      </Card>

      {/* 무료 플랜 */}
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

      {/* 고급 옵션 토글 */}
      <TouchableOpacity onPress={() => setShowAdvanced(!showAdvanced)} style={styles.advancedToggle}>
        <Text variant="bodySmall" style={styles.advancedToggleText}>
          {showAdvanced ? '▲ 고급 옵션 접기' : '▼ 직접 API 키 사용하기 (Anthropic / OpenAI)'}
        </Text>
      </TouchableOpacity>

      {showAdvanced && (
        <>
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
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.6,
  },
  recommendedCard: {
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#6c63ff',
    borderRadius: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  planTitle: {
    fontWeight: '600',
  },
  recommendedBadge: {
    backgroundColor: '#6c63ff',
    height: 24,
  },
  recommendedBadgeText: {
    color: '#fff',
    fontSize: 11,
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
  advancedToggle: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  advancedToggleText: {
    color: '#6c63ff',
    fontWeight: '500',
  },
});
