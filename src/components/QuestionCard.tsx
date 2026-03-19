/**
 * Renders a single MCQ question with four option buttons.
 * Handles selection state, visual feedback, and triggers onAnswer callback.
 */
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MCQQuestion, FillQuestion } from '../services/api';
import FeedbackModal from './FeedbackModal';

type Option = 'A' | 'B' | 'C' | 'D';

interface MCQCardProps {
  question: MCQQuestion;
  questionType: 'mcq';
  onAnswer: (questionId: string, choice: string, isCorrect: boolean) => Promise<void>;
  onNext: () => void;
  isLast: boolean;
}

type Props = MCQCardProps;

export default function QuestionCard({ question, onAnswer, onNext, isLast }: Props) {
  const [selected, setSelected] = useState<Option | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const mcq = question as MCQQuestion;
  const options: Option[] = ['A', 'B', 'C', 'D'];

  async function handleSelect(opt: Option) {
    if (submitted) return;
    setSelected(opt);
    const correct = opt === mcq.correct_answer;
    setIsCorrect(correct);
    setSubmitted(true);
    await onAnswer(mcq.id, opt, correct);
    setFeedbackVisible(true);
  }

  function optionStyle(opt: Option) {
    if (!submitted) {
      return selected === opt ? styles.optionSelected : styles.option;
    }
    if (opt === mcq.correct_answer) return styles.optionCorrect;
    if (opt === selected && opt !== mcq.correct_answer) return styles.optionWrong;
    return styles.optionDimmed;
  }

  function optionTextStyle(opt: Option) {
    if (!submitted) return selected === opt ? styles.optionTextSelected : styles.optionText;
    if (opt === mcq.correct_answer) return styles.optionTextCorrect;
    if (opt === selected && opt !== mcq.correct_answer) return styles.optionTextWrong;
    return styles.optionTextDimmed;
  }

  function handleNext() {
    setFeedbackVisible(false);
    setSelected(null);
    setSubmitted(false);
    setIsCorrect(false);
    onNext();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Difficulty badge */}
      <View style={[styles.difficultyBadge, styles[`diff_${mcq.difficulty}`]]}>
        <Text style={styles.difficultyText}>{mcq.difficulty}</Text>
      </View>

      {/* Question */}
      <Text variant="titleMedium" style={styles.question}>{mcq.question}</Text>

      {/* Options */}
      <View style={styles.options}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={optionStyle(opt)}
            onPress={() => handleSelect(opt)}
            disabled={submitted}
            activeOpacity={0.7}
          >
            <View style={styles.optionLabel}>
              <Text style={[styles.optionLetter, submitted && opt === mcq.correct_answer && { color: '#4caf50' }]}>
                {opt}
              </Text>
            </View>
            <Text style={optionTextStyle(opt)} numberOfLines={3}>
              {mcq.options[opt]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FeedbackModal
        visible={feedbackVisible}
        isCorrect={isCorrect}
        message={mcq.explanation}
        correctAnswer={!isCorrect ? `${mcq.correct_answer}: ${mcq.options[mcq.correct_answer]}` : undefined}
        onNext={handleNext}
        isLast={isLast}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  difficultyBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 12,
  },
  diff_easy: { backgroundColor: '#e8f5e9' },
  diff_medium: { backgroundColor: '#fff3e0' },
  diff_hard: { backgroundColor: '#ffebee' },
  difficultyText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize', color: '#555' },
  question: { fontSize: 17, lineHeight: 26, color: '#333', fontWeight: '600' },
  options: { gap: 10 },
  option: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 12, backgroundColor: '#fff', borderWidth: 2, borderColor: '#e0e0e0',
  },
  optionSelected: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 12, backgroundColor: '#ede7ff', borderWidth: 2, borderColor: '#6c63ff',
  },
  optionCorrect: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 12, backgroundColor: '#e8f5e9', borderWidth: 2, borderColor: '#4caf50',
  },
  optionWrong: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 12, backgroundColor: '#ffebee', borderWidth: 2, borderColor: '#e53935',
  },
  optionDimmed: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 12, backgroundColor: '#fafafa', borderWidth: 2, borderColor: '#e0e0e0', opacity: 0.5,
  },
  optionLabel: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#f5f5f5',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  optionLetter: { fontWeight: 'bold', fontSize: 14, color: '#555' },
  optionText: { flex: 1, color: '#333', fontSize: 14, lineHeight: 20 },
  optionTextSelected: { flex: 1, color: '#6c63ff', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  optionTextCorrect: { flex: 1, color: '#4caf50', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  optionTextWrong: { flex: 1, color: '#e53935', fontSize: 14, lineHeight: 20 },
  optionTextDimmed: { flex: 1, color: '#bbb', fontSize: 14, lineHeight: 20 },
} as any);
