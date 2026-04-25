import * as SecureStore from 'expo-secure-store';
import { getAllSubjects, getAllSessions } from './storage';
import { syncUserData } from './api';

const SYNCED_FLAG_KEY = 'cloud_sync_completed_at';

export async function hasSyncedToCloud(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(SYNCED_FLAG_KEY);
  return !!v;
}

export async function runFirstLoginSync(): Promise<void> {
  if (await hasSyncedToCloud()) return;

  const [subjects, sessions] = await Promise.all([getAllSubjects(), getAllSessions()]);

  const normalizedStatus = (s: string): string =>
    s === 'complete' || s === 'ready' ? 'ready' : s === 'failed' ? 'failed' : 'pending';

  await syncUserData({
    subjects: subjects.map((s) => ({ name: s.name, color: s.color })),
    sessions: sessions.map((s) => ({
      id: s.id,
      pdf_name: s.pdf_name,
      subject_id: s.subject_id ?? null,
      page_count: s.page_count,
      word_count: s.word_count,
      status: normalizedStatus(s.status),
    })),
    review_schedule: [],
  });

  await SecureStore.setItemAsync(SYNCED_FLAG_KEY, new Date().toISOString());
}
