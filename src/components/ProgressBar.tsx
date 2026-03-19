import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar as PaperProgress } from 'react-native-paper';

interface Props {
  current: number;
  total: number;
  label?: string;
}

export default function ProgressBar({ current, total, label }: Props) {
  const progress = total > 0 ? current / total : 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {label && <Text variant="bodySmall" style={styles.label}>{label}</Text>}
        <Text variant="bodySmall" style={styles.counter}>
          {current} / {total}
        </Text>
      </View>
      <PaperProgress progress={progress} color="#6c63ff" style={styles.bar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: '#666', fontWeight: '500' },
  counter: { color: '#6c63ff', fontWeight: '600' },
  bar: { height: 6, borderRadius: 3 },
});
