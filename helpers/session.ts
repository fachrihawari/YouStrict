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

// "Let the last video finish": when time runs out mid-video, watching may run
// on until that video ends, capped so a long video can't add much.
export const GRACE_MAX_MS = 10 * 60 * 1000;

// `playingUntil` is when the video that is playing right now will end (null
// when nothing is playing). Returns the end of the grace period, or null when
// the session should lock at `expiresAt` as usual.
export function computeGraceUntil(expiresAt: number, playingUntil: number | null, enabled: boolean): number | null {
  if (!enabled || playingUntil === null || playingUntil <= expiresAt) return null;
  return Math.min(playingUntil, expiresAt + GRACE_MAX_MS);
}

// Warnings shown to the child before time runs out, in seconds remaining.
export const WARNING_THRESHOLDS = [5 * 60, 60];
export const WARNING_VISIBLE_SECONDS = 8;

// The warning to show right now, if any. A warning is skipped when the whole
// session is shorter than its threshold (a 5-minute session shouldn't open
// with "5 more minutes").
export function activeWarning(remainingSeconds: number, sessionSeconds: number): number | null {
  for (const threshold of WARNING_THRESHOLDS) {
    if (sessionSeconds > threshold && remainingSeconds <= threshold && remainingSeconds > threshold - WARNING_VISIBLE_SECONDS) {
      return threshold;
    }
  }
  return null;
}
