import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { AppState } from 'react-native';
import {
  ParentalSession,
  saveSession,
  getSession,
  clearSession,
  computeExpiresAt,
  computeGraceUntil,
} from '@/helpers/session';
import { hasPin } from '@/helpers/pin';
import { getFinishVideoOnTimeUp } from '@/lib/settings';

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
  // Set while the last video is allowed to finish after time ran out.
  graceUntil: number | null;
  // The player reports when the playing video will end, or null when nothing
  // is playing (paused, ended, left). Null during grace ends it immediately.
  reportPlayback: (playingUntil: number | null) => void;
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
  const [graceUntil, setGraceUntil] = useState<number | null>(null);
  const playingUntil = useRef<number | null>(null);
  const inGrace = useRef(false);
  inGrace.current = graceUntil !== null;

  useEffect(() => {
    Promise.all([getSession(), hasPin()]).then(([s, p]) => {
      setSession(s);
      setPinSet(p);
      setNow(Date.now());
      setHydrated(true);
    });
  }, []);

  const endsAt = session ? Math.max(session.expiresAt, graceUntil ?? 0) : 0;
  const watching = session !== null && now < endsAt;

  // Re-render once at expiry (the visible countdown lives in SessionTimer). If a
  // video is playing at that moment, it may finish first. Grace lives only in
  // memory: restarting the app after expiry lands on time-up.
  useEffect(() => {
    if (!watching || !session) return;
    const id = setTimeout(() => {
      if (graceUntil === null) {
        const until = computeGraceUntil(session.expiresAt, playingUntil.current, getFinishVideoOnTimeUp());
        if (until !== null && until > Date.now()) setGraceUntil(until);
      }
      setNow(Date.now());
    }, endsAt - Date.now() + 50);
    return () => clearTimeout(id);
  }, [watching, session, now, endsAt, graceUntil]);

  const reportPlayback = useCallback((until: number | null) => {
    playingUntil.current = until;
    if (until === null && inGrace.current) {
      setGraceUntil(null);
      setNow(Date.now());
    }
  }, []);

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
    setGraceUntil(null);
    setPinSet(true);
    setParentUnlocked(true);
  }, []);

  const lock = useCallback(() => setParentUnlocked(false), []);

  const startSession = useCallback(async (durationMinutes: number) => {
    const startedAt = Date.now();
    const next = { startedAt, durationMinutes, expiresAt: computeExpiresAt(startedAt, durationMinutes) };
    await saveSession(next);
    setNow(startedAt);
    setGraceUntil(null);
    setSession(next);
    setParentUnlocked(false);
  }, []);

  const value: SessionContextValue = {
    hydrated,
    mode,
    session,
    graceUntil,
    reportPlayback,
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
