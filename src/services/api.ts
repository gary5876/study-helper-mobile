/**
 * HTTP client for the Fundamentals backend.
 * Base URL is read from environment or defaults to localhost for dev.
 * Includes automatic retry with exponential back-off via axios-retry.
 */
import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import * as SecureStore from 'expo-secure-store';
import { ENV } from '../config/env';
import { supabase } from './supabase';

export const API_KEY_STORAGE_KEY = 'anthropic_api_key';
export const BASE_URL_STORAGE_KEY = 'backend_base_url';
export const PLAN_STORAGE_KEY = 'selected_plan';

export type Plan = 'paid' | 'gpt' | 'timely';
const DEFAULT_BASE_URL = ENV.BACKEND_URL;

// ─────────────────────────────────────────
// Types (mirror backend schemas)
// ─────────────────────────────────────────

export interface UploadResponse {
  session_id: string;
  pdf_name: string;
  page_count: number;
  word_count: number;
  status: string;
}

export interface StatusResponse {
  session_id: string;
  status: 'processing' | 'complete' | 'failed';
  progress_pct: number;
  error_message?: string;
}

export interface StudyContent {
  session_id: string;
  notes: StudyNotes;
  mcq_questions: MCQQuestion[];
  fill_questions: FillQuestion[];
  metadata: ContentMetadata;
}

export interface StudyNotes {
  key_concepts: KeyConcept[];
  sections: StudySection[];
  glossary: GlossaryEntry[];
}

export interface KeyConcept {
  id: string;
  term: string;
  definition: string;
  importance: 'high' | 'medium' | 'low';
}

export interface StudySection {
  title: string;
  summary: string;
  bullets: string[];
}

export interface GlossaryEntry {
  term: string;
  brief_def: string;
}

export type StudyMode = 'light' | 'exam' | 'max';
export type QuestionType = 'concept' | 'application';

export interface MCQQuestion {
  id: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  concept_id: string;
  level: number;          // 1–5 (replaces difficulty)
  question_type: QuestionType;
}

export interface FillQuestion {
  id: string;
  sentence_with_blank: string;
  answer: string;
  acceptable_variants: string[];
  hint: string;
  concept_id: string;
  level: number;          // 1–5
  question_type: QuestionType;
}

export interface ContentMetadata {
  page_count: number;
  word_count: number;
  generated_at: string;
  model_used: string;
  section_count: number;
}

// ─────────────────────────────────────────
// API Key helpers
// ─────────────────────────────────────────

export async function saveApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key);
}

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
}

export async function hasApiKey(): Promise<boolean> {
  const key = await getApiKey();
  return !!key && key.length > 10;
}

// ─────────────────────────────────────────
// Plan helpers
// ─────────────────────────────────────────

export async function savePlan(plan: Plan): Promise<void> {
  await SecureStore.setItemAsync(PLAN_STORAGE_KEY, plan);
}

export async function getPlan(): Promise<Plan | null> {
  const stored = await SecureStore.getItemAsync(PLAN_STORAGE_KEY);
  if (stored === 'paid' || stored === 'gpt' || stored === 'timely') return stored;
  return null;
}

export async function hasPlanSelected(): Promise<boolean> {
  const plan = await getPlan();
  return plan !== null;
}

export async function saveBaseUrl(url: string): Promise<void> {
  await SecureStore.setItemAsync(BASE_URL_STORAGE_KEY, url);
}

export async function getBaseUrl(): Promise<string> {
  const stored = await SecureStore.getItemAsync(BASE_URL_STORAGE_KEY);
  if (stored && stored !== 'http://localhost:8000') return stored;
  return DEFAULT_BASE_URL;
}

// ─────────────────────────────────────────
// Axios instance factory
// ─────────────────────────────────────────

async function createClient() {
  const baseURL = await getBaseUrl();
  const client = axios.create({ baseURL, timeout: 120_000 });

  // Automatic retry with exponential back-off
  // Retries on network errors and 5xx responses (not 4xx — those are client errors)
  axiosRetry(client, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,   // 1s → 2s → 4s
    retryCondition: (error: AxiosError) => {
      // Retry on network failures or server errors, NOT on 4xx
      const isNetworkError = !error.response;
      const isServerError = (error.response?.status ?? 0) >= 500;
      // Never retry rate-limit errors — wait and let the user retry
      const isRateLimit = error.response?.status === 429;
      return (isNetworkError || isServerError) && !isRateLimit;
    },
    onRetry: (retryCount, error) => {
      if (__DEV__) {
        console.warn(`[API] Retry #${retryCount} after error: ${error.message}`);
      }
    },
  });

  // Inject Supabase access token (if signed in) on every request
  client.interceptors.request.use(async (cfg) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      cfg.headers = cfg.headers ?? {};
      (cfg.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
    return cfg;
  });

  // Error normaliser interceptor
  client.interceptors.response.use(
    (res) => res,
    (err: AxiosError<{ detail?: string; message?: string }>) => {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Unknown error';
      if (__DEV__) {
        const attemptedUrl = err.config?.baseURL
          ? `${err.config.baseURL}${err.config.url ?? ''}`
          : 'unknown URL';
        console.error(`[API Error] ${detail} (tried: ${attemptedUrl})`);
      }
      return Promise.reject(new Error(detail));
    }
  );
  return client;
}

// ─────────────────────────────────────────
// API functions
// ─────────────────────────────────────────

export async function uploadPDF(
  fileUri: string,
  fileName: string,
  apiKey: string,
  plan: Plan = 'paid'
): Promise<UploadResponse> {
  const client = await createClient();
  const form = new FormData();
  form.append('file', { uri: fileUri, name: fileName, type: 'application/pdf' } as any);
  form.append('plan', plan);

  const headers: Record<string, string> = { 'Content-Type': 'multipart/form-data' };
  if (apiKey) headers['X-API-Key'] = apiKey;

  const res = await client.post<UploadResponse>('/upload', form, { headers });
  return res.data;
}

export async function startGeneration(
  sessionId: string,
  apiKey: string,
  plan: Plan = 'paid',
  lang: 'ko' | 'en' = 'ko',
  model?: string,
): Promise<void> {
  const client = await createClient();
  const headers: Record<string, string> = {};
  if (apiKey) headers['X-API-Key'] = apiKey;

  const body: Record<string, unknown> = { session_id: sessionId, plan, lang };
  if (model) body.options = { model };

  await client.post('/generate', body, { headers });
}

export async function pollStatus(sessionId: string): Promise<StatusResponse> {
  const client = await createClient();
  const res = await client.get<StatusResponse>(`/status/${sessionId}`);
  return res.data;
}

export async function fetchResult(sessionId: string): Promise<StudyContent> {
  const client = await createClient();
  const res = await client.get<StudyContent>(`/result/${sessionId}`);
  return res.data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const client = await createClient();
  await client.delete(`/session/${sessionId}`);
}

// ─────────────────────────────────────────
// User data sync (로컬 → 클라우드 최초 업로드)
// ─────────────────────────────────────────

export interface SyncPayload {
  subjects: { name: string; color: string }[];
  sessions: {
    id: string;
    pdf_name: string;
    subject_id?: string | null;
    page_count: number;
    word_count: number;
    status: string;
  }[];
  review_schedule: {
    session_id: string;
    question_id: string;
    question_type: 'mcq' | 'fill';
    interval_days: number;
  }[];
}

export async function syncUserData(payload: SyncPayload): Promise<void> {
  const client = await createClient();
  await client.post('/user/sync', payload);
}

// ─────────────────────────────────────────
// Polling helper (used by UploadScreen)
// ─────────────────────────────────────────

export async function waitForCompletion(
  sessionId: string,
  onProgress: (pct: number, stage: string) => void,
  intervalMs = 3000,
  timeoutMs = 300_000
): Promise<StudyContent> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const status = await pollStatus(sessionId);
    onProgress(status.progress_pct, `Generating… (${status.progress_pct}%)`);

    if (status.status === 'complete') {
      return fetchResult(sessionId);
    }
    if (status.status === 'failed') {
      throw new Error(status.error_message || 'Generation failed on the server.');
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Generation timed out. Please try again.');
}
