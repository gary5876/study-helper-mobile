import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import * as Linking from 'expo-linking';
import { hasPlanSelected, hasApiKey } from '../services/api';
import { useLanguageStore } from '../store/languageStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../services/supabase';
import { runFirstLoginSync } from '../services/migration';
import { STRINGS } from '../i18n/strings';

// Screens
import LoginScreen from '../screens/LoginScreen';
import PlanSelectionScreen from '../screens/PlanSelectionScreen';
import HomeScreen from '../screens/HomeScreen';
import UploadScreen from '../screens/UploadScreen';
import StudyNotesScreen from '../screens/StudyNotesScreen';
import QuizModeScreen from '../screens/QuizModeScreen';
import MCQScreen from '../screens/MCQScreen';
import FillBlankScreen from '../screens/FillBlankScreen';
import ScoreScreen from '../screens/ScoreScreen';
import WrongAnswerScreen from '../screens/WrongAnswerScreen';
import ReviewConceptScreen from '../screens/ReviewConceptScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import type { StudyMode } from '../services/api';

export type RootStackParamList = {
  Login: undefined;
  PlanSelection: undefined;
  Home: undefined;
  Upload: undefined;
  StudyNotes: { sessionId: string };
  QuizMode: { sessionId: string };
  MCQ: { sessionId: string; mode: StudyMode; retryIds?: string[] };
  FillBlank: { sessionId: string; mode: StudyMode };
  Score: { attemptId: string; sessionId: string };
  WrongAnswer: { attemptId: string; sessionId: string };
  ReviewConcept: { conceptId: string; sessionId: string };
  Privacy: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<'PlanSelection' | 'Home' | null>(null);
  const { lang } = useLanguageStore();
  const s = STRINGS[lang];
  const { session, initializing, init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  // Handle OAuth deep-link callbacks (studyhelper://auth/callback?code=...)
  useEffect(() => {
    const handleUrl = async (url: string) => {
      const parsed = Linking.parse(url);
      const code = (parsed.queryParams?.code as string | undefined) ?? undefined;
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
    };
    Linking.getInitialURL().then((url: string | null) => { if (url) handleUrl(url); });
    const sub = Linking.addEventListener('url', ({ url }: { url: string }) => handleUrl(url));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!session) {
      setInitialRoute(null);
      return;
    }
    runFirstLoginSync().catch((e) => {
      if (__DEV__) console.warn('[sync] first login sync failed:', e);
    });
    (async () => {
      const planSelected = await hasPlanSelected();
      if (!planSelected) {
        setInitialRoute('PlanSelection');
        return;
      }
      // 모든 플랜이 API 키를 요구 — 키가 없으면 설정 화면으로
      if (!(await hasApiKey())) {
        setInitialRoute('PlanSelection');
        return;
      }
      setInitialRoute('Home');
    })();
  }, [session]);

  if (initializing || (session && initialRoute === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute ?? 'Home'}
        screenOptions={{
          headerStyle: { backgroundColor: '#6c63ff' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="PlanSelection"
          component={PlanSelectionScreen}
          options={{ title: s.navGetStarted, headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Fundamentals', headerShown: false }}
        />
        <Stack.Screen name="Upload" component={UploadScreen} options={{ title: s.navNewSession }} />
        <Stack.Screen name="StudyNotes" component={StudyNotesScreen} options={{ title: s.navStudyNotes }} />
        <Stack.Screen name="QuizMode" component={QuizModeScreen} options={{ title: s.navQuizMode }} />
        <Stack.Screen name="MCQ" component={MCQScreen} options={{ title: s.navMCQ }} />
        <Stack.Screen name="FillBlank" component={FillBlankScreen} options={{ title: s.navFillBlank }} />
        <Stack.Screen name="Score" component={ScoreScreen} options={{ title: s.navResults }} />
        <Stack.Screen name="WrongAnswer" component={WrongAnswerScreen} options={{ title: s.navReviewMistakes }} />
        <Stack.Screen name="ReviewConcept" component={ReviewConceptScreen} options={{ title: s.navConceptReview }} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: s.privacyTitle }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
