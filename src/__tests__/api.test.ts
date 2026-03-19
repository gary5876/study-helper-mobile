/**
 * Tests for the API client layer.
 * All network calls are mocked — no real HTTP is made.
 */
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  saveApiKey, getApiKey, hasApiKey,
  saveBaseUrl, getBaseUrl,
} from '../services/api';

jest.mock('expo-secure-store');

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

// ─────────────────────────────────────────
// API key helpers
// ─────────────────────────────────────────

describe('API key helpers', () => {
  beforeEach(() => jest.clearAllMocks());

  it('saveApiKey stores the key', async () => {
    mockSecureStore.setItemAsync.mockResolvedValueOnce(undefined);
    await saveApiKey('sk-ant-test-key-abc123');
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
      'anthropic_api_key', 'sk-ant-test-key-abc123'
    );
  });

  it('getApiKey retrieves the stored key', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce('sk-ant-test-key-abc123');
    const key = await getApiKey();
    expect(key).toBe('sk-ant-test-key-abc123');
  });

  it('hasApiKey returns true when key is present and long enough', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce('sk-ant-key-12345');
    expect(await hasApiKey()).toBe(true);
  });

  it('hasApiKey returns false when key is null', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce(null);
    expect(await hasApiKey()).toBe(false);
  });

  it('hasApiKey returns false when key is too short', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce('short');
    expect(await hasApiKey()).toBe(false);
  });
});

// ─────────────────────────────────────────
// Base URL helpers
// ─────────────────────────────────────────

describe('Base URL helpers', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getBaseUrl returns stored URL when available', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce('https://api.myapp.com');
    expect(await getBaseUrl()).toBe('https://api.myapp.com');
  });

  it('getBaseUrl returns default when nothing stored', async () => {
    mockSecureStore.getItemAsync.mockResolvedValueOnce(null);
    expect(await getBaseUrl()).toBe('http://localhost:8000');
  });

  it('saveBaseUrl persists the URL', async () => {
    mockSecureStore.setItemAsync.mockResolvedValueOnce(undefined);
    await saveBaseUrl('https://api.myapp.com');
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
      'backend_base_url', 'https://api.myapp.com'
    );
  });
});
