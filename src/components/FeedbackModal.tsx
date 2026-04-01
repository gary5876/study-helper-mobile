import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useLanguageStore } from '../store/languageStore';
import { STRINGS } from '../i18n/strings';

interface Props {
  visible: boolean;
  isCorrect: boolean;
  message: string;
  correctAnswer?: string;
  onNext: () => void;
  isLast?: boolean;
}

export default function FeedbackModal({
  visible, isCorrect, message, correctAnswer, onNext, isLast,
}: Props) {
  const { lang } = useLanguageStore();
  const s = STRINGS[lang];

  const bgColor = isCorrect ? '#e8f5e9' : '#ffebee';
  const accentColor = isCorrect ? '#4caf50' : '#e53935';
  const icon = isCorrect ? '✓' : '✗';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Surface style={[styles.container, { backgroundColor: bgColor, borderTopColor: accentColor }]}>
          <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>

          <Text variant="titleMedium" style={[styles.result, { color: accentColor }]}>
            {isCorrect ? s.feedbackCorrect : s.feedbackWrong}
          </Text>

          {!isCorrect && correctAnswer && (
            <View style={styles.correctAnswerBox}>
              <Text variant="bodySmall" style={styles.correctLabel}>{s.feedbackCorrectAnswer}</Text>
              <Text variant="bodyMedium" style={[styles.correctAnswer, { color: accentColor }]}>
                {correctAnswer}
              </Text>
            </View>
          )}

          <Text variant="bodyMedium" style={styles.message}>{message}</Text>

          <Button
            mode="contained"
            onPress={onNext}
            style={[styles.button, { backgroundColor: accentColor }]}
            contentStyle={styles.buttonContent}
          >
            {isLast ? s.feedbackSeeResults : s.feedbackNextQuestion}
          </Button>
        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 4,
    padding: 24,
    gap: 16,
    alignItems: 'center',
    elevation: 8,
  },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
  },
  icon: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  result: { fontWeight: 'bold' },
  correctAnswerBox: { alignItems: 'center', gap: 4 },
  correctLabel: { color: '#666' },
  correctAnswer: { fontWeight: '600', textAlign: 'center' },
  message: { textAlign: 'center', color: '#555', lineHeight: 20 },
  button: { borderRadius: 8, minWidth: 200 },
  buttonContent: { paddingVertical: 6 },
});
