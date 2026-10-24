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

// An expired session stays stored until a parent unlocks, so restarting the
// app after time is up still lands on the "time's up" screen.
export async function getSession(): Promise<ParentalSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as ParentalSession;
    return Number.isFinite(s.expiresAt) ? s : null;
  } catch (e) {
    return null;
  }
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export function getRemainingSeconds(session: ParentalSession | null, now = Date.now()) {
  if (!session) return 0;
  return Math.ceil(Math.max(0, session.expiresAt - now) / 1000);
}
