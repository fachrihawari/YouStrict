import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'parental_session_v1';

export type ParentalSession = {
  startedAt: number;
  durationMinutes: number;
  expiresAt: number;
};

export function computeExpiresAt(startedAt: number, durationMinutes: number) {
  return startedAt + durationMinutes * 60 * 1000;
}

export async function saveSession(session: ParentalSession) {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<ParentalSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ParentalSession;
  } catch (e) {
    return null;
  }
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function isSessionActive(): Promise<boolean> {
  const s = await getSession();
  if (!s) return false;
  return Date.now() < s.expiresAt;
}

export async function getRemainingSeconds(): Promise<number> {
  const s = await getSession();
  if (!s) return 0;
  const remainingMs = Math.max(0, s.expiresAt - Date.now());
  return Math.ceil(remainingMs / 1000);
}
