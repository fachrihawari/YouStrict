import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const PIN_KEY = 'parent_pin_v1';
const LOCKOUT_KEY = 'parent_pin_lockout_v1';

export const PIN_MIN_LENGTH = 4;
export const PIN_MAX_LENGTH = 6;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

type StoredPin = { salt: string; hash: string };
type Lockout = { failures: number; until: number };

async function hash(pin: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

export async function hasPin() {
  return (await SecureStore.getItemAsync(PIN_KEY)) !== null;
}

export async function setPin(pin: string) {
  const salt = Crypto.randomUUID();
  const stored: StoredPin = { salt, hash: await hash(pin, salt) };
  await SecureStore.setItemAsync(PIN_KEY, JSON.stringify(stored));
}

export type VerifyResult = { ok: boolean; lockedForMs: number };

// Persisted lockout so restarting the app doesn't reset the attempt counter.
export async function verifyPin(pin: string): Promise<VerifyResult> {
  const lockout = await getLockout();
  if (lockout.until > Date.now()) return { ok: false, lockedForMs: lockout.until - Date.now() };

  const raw = await SecureStore.getItemAsync(PIN_KEY);
  if (!raw) return { ok: false, lockedForMs: 0 };
  const stored: StoredPin = JSON.parse(raw);

  if ((await hash(pin, stored.salt)) === stored.hash) {
    await SecureStore.deleteItemAsync(LOCKOUT_KEY);
    return { ok: true, lockedForMs: 0 };
  }

  const failures = lockout.failures + 1;
  const until = failures >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0;
  await SecureStore.setItemAsync(LOCKOUT_KEY, JSON.stringify({ failures: until ? 0 : failures, until }));
  return { ok: false, lockedForMs: until ? LOCKOUT_MS : 0 };
}

async function getLockout(): Promise<Lockout> {
  const raw = await SecureStore.getItemAsync(LOCKOUT_KEY);
  try {
    return raw ? JSON.parse(raw) : { failures: 0, until: 0 };
  } catch {
    return { failures: 0, until: 0 };
  }
}

export function pinErrorMessage({ lockedForMs }: VerifyResult) {
  return lockedForMs > 0 ? `Too many tries. Wait ${Math.ceil(lockedForMs / 1000)} seconds` : 'Wrong PIN';
}
