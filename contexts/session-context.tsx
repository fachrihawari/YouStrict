import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import {
  ParentalSession,
  saveSession as saveSessionHelper,
  clearSession as clearSessionHelper,
  isSessionActive as isSessionActiveHelper,
  getRemainingSeconds as getRemainingSecondsHelper,
  computeExpiresAt,
} from '@/helpers/session';

type SessionContextValue = {
  active: boolean;
  remainingSeconds: number;
  reload: () => Promise<void>;
  startSession: (durationMinutes: number) => Promise<void>;
  endSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [active, setActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const clearIntervalRef = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const tick = async () => {
    const rem = await getRemainingSecondsHelper();
    setRemainingSeconds(rem);
    if (rem <= 0) {
      await clearSessionHelper();
      setActive(false);
      clearIntervalRef();
    }
  };

  const reload = async () => {
    const isActive = await isSessionActiveHelper();
    setActive(isActive);
    const rem = await getRemainingSecondsHelper();
    setRemainingSeconds(rem);

    clearIntervalRef();
    if (isActive) {
      intervalRef.current = setInterval(tick, 1000) as unknown as number;
    }
  };

  useEffect(() => {
    reload();
    return () => clearIntervalRef();
  }, []);

  // Reload on app foreground
  useEffect(() => {
    const handler = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        reload();
      }
    };
    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();
  }, []);

  // Navigation guard based on session state
  useEffect(() => {
    const currentRoute = segments[0];
    
    if (active) {
      // Active session: allow videos, redirect from root to videos
      if (currentRoute === undefined) {
        router.replace('/videos');
      }
    } else {
      // No active session: only allow root and select-duration
      const isProtectedRoute = currentRoute === 'videos';
      if (isProtectedRoute) {
        router.replace('/');
      }
    }
  }, [active, segments]);

  const startSession = async (durationMinutes: number) => {
    const startedAt = Date.now();
    const expiresAt = computeExpiresAt(startedAt, durationMinutes);
    const session: ParentalSession = { startedAt, durationMinutes, expiresAt };
    
    // Set active immediately to prevent race conditions with navigation guards
    setActive(true);
    setRemainingSeconds(durationMinutes * 60);
    
    await saveSessionHelper(session);
    await reload();
  };

  const endSession = async () => {
    await clearSessionHelper();
    setRemainingSeconds(0);
    clearIntervalRef();
    setActive(false);
  };

  const value: SessionContextValue = {
    active,
    remainingSeconds,
    reload,
    startSession,
    endSession,
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
