import React, { useCallback, useMemo, useState } from 'react';
import {
  View, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert, Modal, TextInput,
} from 'react-native';
import { Text, FAB, Card, Chip, IconButton, Divider, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';
import {
  getAllSessions, getAllSubjects, createSubject, getPendingReviewCount,
  deleteSession as deleteSessionLocal,
  SessionRow, SubjectRow,
} from '../services/storage';
import { useLanguageStore } from '../store/languageStore';
import { useAuthStore } from '../store/authStore';
import { STRINGS } from '../i18n/strings';
import SubjectTabBar, { UNCATEGORIZED_ID } from '../components/SubjectTabBar';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [dueReviews, setDueReviews] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [saving, setSaving] = useState(false);
  const { lang, toggle } = useLanguageStore();
  const signOut = useAuthStore((st) => st.signOut);
  const s = STRINGS[lang];

  function handleLogout() {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  const load = useCallback(async () => {
    try {
      const [sess, subj, d] = await Promise.all([
        getAllSessions(),
        getAllSubjects(),
        getPendingReviewCount(),
      ]);
      setSessions(sess);
      setSubjects(subj);
      setDueReviews(d);
    } catch {
      Alert.alert('Error', 'Failed to load sessions. Please restart the app.');
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleAddSubject() {
    const name = newSubjectName.trim();
    if (!name) return;
    setSaving(true);
    try {
      await createSubject(name);
      await load();
      setNewSubjectName('');
      setShowAddModal(false);
    } catch {
      Alert.alert('오류', '과목을 만들지 못했습니다. 이미 같은 이름의 과목이 있을 수 있습니다.');
    } finally {
      setSaving(false);
    }
  }

  function handleLongPressSession(session: SessionRow) {
    Alert.alert(
      s.homeDeleteTitle,
      s.homeDeleteMessage,
      [
        { text: s.subjectCancel, style: 'cancel' },
        {
          text: s.homeDelete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSessionLocal(session.id);
              await load();
            } catch {
              Alert.alert('Error', 'Failed to delete session.');
            }
          },
        },
      ],
    );
  }

  function statusColor(status: SessionRow['status']): string {
    switch (status) {
      case 'ready': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'failed': return '#f44336';
      default: return '#9e9e9e';
    }
  }

  function statusLabel(status: SessionRow['status']): string {
    switch (status) {
      case 'ready': return s.homeStatusReady;
      case 'pending': return s.homeStatusPending;
      case 'failed': return s.homeStatusFailed;
      default: return status;
    }
  }

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const filteredSessions = useMemo(() => {
    if (selectedSubjectId === null) return sessions;
    if (selectedSubjectId === UNCATEGORIZED_ID) return sessions.filter((s) => !s.subject_id);
    return sessions.filter((s) => s.subject_id === selectedSubjectId);
  }, [sessions, selectedSubjectId]);

  const selectedSubjectColor = useMemo(() => {
    if (!selectedSubjectId || selectedSubjectId === UNCATEGORIZED_ID) return '#6c63ff';
    return subjects.find((s) => s.id === selectedSubjectId)?.color ?? '#6c63ff';
  }, [selectedSubjectId, subjects]);

  return (
    <View style={styles.container}>
      {/* Add Subject Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text variant="titleMedium" style={styles.modalTitle}>{s.subjectAdd}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={s.subjectNamePlaceholder}
              value={newSubjectName}
              onChangeText={setNewSubjectName}
              autoFocus
              maxLength={30}
              onSubmitEditing={handleAddSubject}
            />
            <View style={styles.modalButtons}>
              <Button
                mode="text"
                onPress={() => { setShowAddModal(false); setNewSubjectName(''); }}
                textColor="#999"
              >
                {s.subjectCancel}
              </Button>
              <Button
                mode="contained"
                onPress={handleAddSubject}
                loading={saving}
                disabled={!newSubjectName.trim() || saving}
                buttonColor="#6c63ff"
              >
                {s.subjectCreate}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Fundamentals</Text>
        <View style={styles.headerRight}>
          {dueReviews > 0 && (
            <Chip icon="bell" style={styles.reviewChip} textStyle={{ color: '#fff' }}>
              {dueReviews} {s.homeDueReview}
            </Chip>
          )}
          <Button
            mode="text"
            compact
            onPress={toggle}
            textColor="#fff"
            style={styles.langBtn}
          >
            {lang === 'ko' ? 'EN' : '한'}
          </Button>
          <IconButton
            icon="cog"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.navigate('PlanSelection')}
          />
          <IconButton
            icon="logout"
            iconColor="#fff"
            size={24}
            onPress={handleLogout}
          />
        </View>
      </View>

      {/* Subject Tab Bar */}
      <SubjectTabBar
        subjects={subjects}
        selectedId={selectedSubjectId}
        onSelect={setSelectedSubjectId}
        onAdd={() => setShowAddModal(true)}
        allLabel={s.subjectAll}
        uncategorizedLabel={s.subjectUncategorized}
        addLabel={s.subjectAdd}
      />

      <Divider />

      {/* Session list */}
      <FlatList
        data={filteredSessions}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={filteredSessions.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="titleLarge" style={styles.emptyTitle}>{s.homeNoSessions}</Text>
            <Text variant="bodyMedium" style={styles.emptyText}>{s.homeNoSessionsDesc}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const subjectColor = item.subject_id
            ? (subjects.find((sub) => sub.id === item.subject_id)?.color ?? '#9e9e9e')
            : '#9e9e9e';
          const subjectName = item.subject_id
            ? (subjects.find((sub) => sub.id === item.subject_id)?.name ?? s.subjectUncategorized)
            : s.subjectUncategorized;

          return (
            <TouchableOpacity
              onPress={() => {
                if (item.status === 'ready') {
                  navigation.navigate('StudyNotes', { sessionId: item.id });
                }
              }}
              onLongPress={() => handleLongPressSession(item)}
              delayLongPress={400}
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
                      {statusLabel(item.status)}
                    </Chip>
                  </View>
                  <View style={styles.cardMeta}>
                    <View style={[styles.subjectBadge, { backgroundColor: subjectColor + '22' }]}>
                      <View style={[styles.subjectDot, { backgroundColor: subjectColor }]} />
                      <Text style={[styles.subjectName, { color: subjectColor }]} numberOfLines={1}>
                        {subjectName}
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={styles.meta}>
                      {item.page_count} pages · {item.word_count.toLocaleString()} words ·{' '}
                      {formatDate(item.created_at)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          );
        }}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: selectedSubjectColor }]}
        onPress={() => navigation.navigate('Upload')}
        label={s.homeNewSession}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#6c63ff',
  },
  title: { color: '#fff', fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewChip: { backgroundColor: '#ff6584' },
  langBtn: { minWidth: 0 },
  list: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 48, gap: 12 },
  emptyTitle: { fontWeight: 'bold', color: '#333' },
  emptyText: { textAlign: 'center', color: '#777', lineHeight: 22 },
  card: { borderRadius: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { flex: 1, fontWeight: '600', marginRight: 8 },
  statusChip: { borderRadius: 12 },
  cardMeta: { marginTop: 8, gap: 4 },
  subjectBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  subjectDot: { width: 6, height: 6, borderRadius: 3 },
  subjectName: { fontSize: 11, fontWeight: '600' },
  meta: { color: '#777' },
  fab: { position: 'absolute', right: 16, bottom: 24 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 24, width: '100%', gap: 16,
  },
  modalTitle: { fontWeight: 'bold', textAlign: 'center' },
  modalInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 16,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
