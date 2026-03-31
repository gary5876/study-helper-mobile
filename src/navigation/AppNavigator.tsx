import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { hasPlanSelected, getPlan, hasApiKey } from '../services/api';

// Screens
import PlanSelectionScreen from '../screens/PlanSelectionScreen';
import ApiKeySetupScreen from '../screens/ApiKeySetupScreen';
import HomeScreen from '../screens/HomeScreen';
import UploadScreen from '../screens/UploadScreen';
import StudyNotesScreen from '../screens/StudyNotesScreen';
import MCQScreen from '../screens/MCQScreen';
import FillBlankScreen from '../screens/FillBlankScreen';
import ScoreScreen from '../screens/ScoreScreen';
import WrongAnswerScreen from '../screens/WrongAnswerScreen';
import ReviewConceptScreen from '../screens/ReviewConceptScreen';

export type RootStackParamList = {
  PlanSelection: undefined;
  ApiKeySetup: undefined;
  Home: undefined;
  Upload: undefined;
  StudyNotes: { sessionId: string };
  MCQ: { sessionId: string; retryIds?: string[] };
  FillBlank: { sessionId: string };
  Score: { attemptId: string; sessionId: string };
  WrongAnswer: { attemptId: string; sessionId: string };
  ReviewConcept: { conceptId: string; sessionId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<'PlanSelection' | 'ApiKeySetup' | 'Home' | null>(null);

  useEffect(() => {
    (async () => {
      const planSelected = await hasPlanSelected();
      if (!planSelected) {
        setInitialRoute('PlanSelection');
        return;
      }
      const plan = await getPlan();
      // non-free plans require an API key
      if (plan !== 'free') {
        const hasKey = await hasApiKey();
        setInitialRoute(hasKey ? 'Home' : 'ApiKeySetup');
      } else {
        setInitialRoute('Home');
      }
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
          options={{ title: 'Get Started', headerShown: false }}
        />
        <Stack.Screen
          name="ApiKeySetup"
          component={ApiKeySetupScreen}
          options={{ title: 'Setup', headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Fundamentals', headerShown: false }}
        />
        <Stack.Screen name="Upload" component={UploadScreen} options={{ title: 'New Session' }} />
        <Stack.Screen
          name="StudyNotes"
          component={StudyNotesScreen}
          options={{ title: 'Study Notes' }}
        />
        <Stack.Screen name="MCQ" component={MCQScreen} options={{ title: 'Multiple Choice' }} />
        <Stack.Screen
          name="FillBlank"
          component={FillBlankScreen}
          options={{ title: 'Fill in the Blank' }}
        />
        <Stack.Screen name="Score" component={ScoreScreen} options={{ title: 'Results' }} />
        <Stack.Screen
          name="WrongAnswer"
          component={WrongAnswerScreen}
          options={{ title: 'Review Mistakes' }}
        />
        <Stack.Screen
          name="ReviewConcept"
          component={ReviewConceptScreen}
          options={{ title: 'Concept Review' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
