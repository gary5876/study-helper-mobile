import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SubjectRow } from '../db/schema';

export const UNCATEGORIZED_ID = '__uncategorized__';

interface Tab {
  id: string | null;
  label: string;
  color: string;
}

interface Props {
  subjects: SubjectRow[];
  selectedId: string | null; // null = All, UNCATEGORIZED_ID = Unclassified, UUID = specific subject
  onSelect: (id: string | null) => void;
  onAdd: () => void;
  allLabel: string;
  uncategorizedLabel: string;
  addLabel: string;
}

export default function SubjectTabBar({
  subjects,
  selectedId,
  onSelect,
  onAdd,
  allLabel,
  uncategorizedLabel,
  addLabel,
}: Props) {
  const tabs: Tab[] = [
    { id: null, label: allLabel, color: '#6c63ff' },
    { id: UNCATEGORIZED_ID, label: uncategorizedLabel, color: '#9e9e9e' },
    ...subjects.map((s) => ({ id: s.id, label: s.name, color: s.color })),
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {tabs.map((tab) => {
          const isSelected = selectedId === tab.id;
          return (
            <TouchableOpacity
              key={tab.id ?? '__all__'}
              style={[
                styles.tab,
                isSelected && { backgroundColor: tab.color, borderColor: tab.color },
              ]}
              onPress={() => onSelect(tab.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, isSelected && styles.labelSelected]} numberOfLines={1}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.7}>
          <Text style={styles.addLabel}>{addLabel}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  label: { fontSize: 13, color: '#555', fontWeight: '500' },
  labelSelected: { color: '#fff', fontWeight: '700' },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6c63ff',
    backgroundColor: '#fff',
  },
  addLabel: { fontSize: 13, color: '#6c63ff', fontWeight: '600' },
});
