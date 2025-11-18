import { useEffect, useRef, useState } from 'react';
import {
  ParentalSession,
  saveSession as saveSessionHelper,
  getSession as getSessionHelper,
  clearSession as clearSessionHelper,
  isSessionActive as isSessionActiveHelper,
  getRemainingSeconds as getRemainingSecondsHelper,
  computeExpiresAt,
} from '@/helpers/session';

type UseSessionReturn = {
  active: boolean;
  remainingSeconds: number;
  reload: () => Promise<void>;
  startSession: (durationMinutes: number) => Promise<void>;
  endSession: () => Promise<void>;
  getSession: () => Promise<ParentalSession | null>;
};

export function useSession(): UseSessionReturn {
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

  const getSession = async () => {
    return getSessionHelper();
  };

  return { active, remainingSeconds, reload, startSession, endSession, getSession };
}
