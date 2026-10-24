import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState } from 'react-native';
import {
  ParentalSession,
  saveSession,
  getSession,
  clearSession,
  getRemainingSeconds,
  computeExpiresAt,
} from '@/helpers/session';
import { hasPin } from '@/helpers/pin';

// Every screen belongs to exactly one mode; app/_layout.tsx guards routes with
// Stack.Protected, so there is never a "back" into another mode.
//   setup    → no PIN yet (first launch)
//   locked   → PIN gate
//   time-up  → session expired; PIN gate with a "time's up" message
//   parent   → unlocked parent area (in memory only; re-locks when backgrounded)
//   watching → kid grid + player
export type Mode = 'setup' | 'locked' | 'time-up' | 'parent' | 'watching';

type SessionContextValue = {
  hydrated: boolean;
  mode: Mode;
  session: ParentalSession | null;
  unlock: () => Promise<void>;
  lock: () => void;
  startSession: (durationMinutes: number) => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [pinSet, setPinSet] = useState(false);
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [session, setSession] = useState<ParentalSession | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    Promise.all([getSession(), hasPin()]).then(([s, p]) => {
      setSession(s);
      setPinSet(p);
      setNow(Date.now());
      setHydrated(true);
    });
  }, []);

  const remainingSeconds = getRemainingSeconds(session, now);
  const watching = session !== null && remainingSeconds > 0;

  // Re-render once at expiry (the visible countdown lives in SessionTimer).
  useEffect(() => {
    if (!watching || !session) return;
    const id = setTimeout(() => setNow(Date.now()), session.expiresAt - Date.now() + 50);
    return () => clearTimeout(id);
  }, [watching, session, now]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') setNow(Date.now());
      if (next === 'background') setParentUnlocked(false);
    });
    return () => sub.remove();
  }, []);

  let mode: Mode;
  if (!pinSet) mode = 'setup';
  else if (watching) mode = 'watching';
  else if (session) mode = 'time-up';
  else if (parentUnlocked) mode = 'parent';
  else mode = 'locked';

  // Called after a correct (or newly created) PIN. Ends any session, including
  // an active one when a parent interrupts watching.
  const unlock = useCallback(async () => {
    await clearSession();
    setSession(null);
    setPinSet(true);
    setParentUnlocked(true);
  }, []);

  const lock = useCallback(() => setParentUnlocked(false), []);

  const startSession = useCallback(async (durationMinutes: number) => {
    const startedAt = Date.now();
    const next = { startedAt, durationMinutes, expiresAt: computeExpiresAt(startedAt, durationMinutes) };
    await saveSession(next);
    setNow(startedAt);
    setSession(next);
    setParentUnlocked(false);
  }, []);

  const value: SessionContextValue = {
    hydrated,
    mode,
    session,
    unlock,
    lock,
    startSession,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
