import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text, Chip, Surface, Button } from 'react-native-paper';
import { KeyConcept } from '../services/api';

interface Props {
  concept: KeyConcept;
  onClose: () => void;
}

export default function ConceptHighlight({ concept, onClose }: Props) {
  const importanceColor = (imp: KeyConcept['importance']) => {
    switch (imp) {
      case 'high': return '#e53935';
      case 'medium': return '#fb8c00';
      default: return '#43a047';
    }
  };

  return (
    <Modal visible transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1}>
          <Surface style={styles.card} elevation={5}>
            <View style={styles.header}>
              <Text variant="titleLarge" style={styles.term}>{concept.term}</Text>
              <Chip
                style={[styles.chip, { backgroundColor: importanceColor(concept.importance) }]}
                textStyle={{ color: '#fff', fontSize: 11 }}
              >
                {concept.importance}
              </Chip>
            </View>
            <Text variant="bodyLarge" style={styles.definition}>{concept.definition}</Text>
            <Button mode="contained" onPress={onClose} style={styles.closeBtn}>
              Close
            </Button>
          </Surface>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: { borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  term: { fontWeight: 'bold', flex: 1, marginRight: 8 },
  chip: { borderRadius: 12 },
  definition: { color: '#444', lineHeight: 24 },
  closeBtn: { borderRadius: 8, backgroundColor: '#6c63ff' },
});
