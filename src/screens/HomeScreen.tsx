import React, { useCallback, useState } from 'react';
import {
  View, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { Text, FAB, Card, Chip, IconButton, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';
import { getAllSessions, getPendingReviewCount, SessionRow } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [dueReviews, setDueReviews] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, d] = await Promise.all([getAllSessions(), getPendingReviewCount()]);
      setSessions(s);
      setDueReviews(d);
    } catch (err: any) {
      
      Alert.alert('Error', 'Failed to load sessions. Please restart the app.');
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function statusColor(status: SessionRow['status']): string {
    switch (status) {
      case 'ready': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'failed': return '#f44336';
      default: return '#9e9e9e';
    }
  }

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Fundamentals</Text>
        {dueReviews > 0 && (
          <Chip icon="bell" style={styles.reviewChip} textStyle={{ color: '#fff' }}>
            {dueReviews} due for review
          </Chip>
        )}
      </View>

      <Divider />

      {/* Session list */}
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={sessions.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="titleLarge" style={styles.emptyTitle}>No sessions yet</Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Tap the + button to upload a PDF and start studying.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              if (item.status === 'ready') {
                navigation.navigate('StudyNotes', { sessionId: item.id });
              }
            }}
            activeOpacity={0.7}
          >
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitle}>
                    {item.pdf_name}
                  </Text>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: statusColor(item.status) }]}
                    textStyle={{ color: '#fff', fontSize: 11 }}
                  >
                    {item.status}
                  </Chip>
                </View>
                <Text variant="bodySmall" style={styles.meta}>
                  {item.page_count} pages · {item.word_count.toLocaleString()} words ·{' '}
                  {formatDate(item.created_at)}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Upload')}
        label="New Session"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#6c63ff',
  },
  title: { color: '#fff', fontWeight: 'bold' },
  reviewChip: { backgroundColor: '#ff6584' },
  list: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 48, gap: 12 },
  emptyTitle: { fontWeight: 'bold', color: '#333' },
  emptyText: { textAlign: 'center', color: '#777', lineHeight: 22 },
  card: { borderRadius: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { flex: 1, fontWeight: '600', marginRight: 8 },
  statusChip: { borderRadius: 12 },
  meta: { color: '#777', marginTop: 6 },
  fab: { position: 'absolute', right: 16, bottom: 24, backgroundColor: '#6c63ff' },
});
