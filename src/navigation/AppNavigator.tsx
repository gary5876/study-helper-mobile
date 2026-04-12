import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { hasPlanSelected, getPlan, hasApiKey } from '../services/api';
import { useLanguageStore } from '../store/languageStore';
import { STRINGS } from '../i18n/strings';

// Screens
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

  useEffect(() => {
    (async () => {
      const planSelected = await hasPlanSelected();
      if (!planSelected) {
        setInitialRoute('PlanSelection');
        return;
      }
      const plan = await getPlan();
      // 유료 플랜인데 API 키가 없으면 다시 설정 화면으로
      if (plan !== 'free' && !(await hasApiKey())) {
        setInitialRoute('PlanSelection');
        return;
      }
      setInitialRoute('Home');
    })();
  }, []);

  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
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
