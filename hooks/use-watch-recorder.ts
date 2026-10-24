import { useEffect, useRef } from 'react';
import { addWatchedSeconds, startWatch } from '@/lib/history';

const FLUSH_EVERY_SECONDS = 15;

// Records watch history for the player: an entry starts the first time the
// video actually plays, and only seconds spent playing (not loading, buffering
// or paused) are counted. Writes are batched every 15 s and on pause/leave.
export function useWatchRecorder(videoId: string, playing: boolean) {
  const entry = useRef<number | null>(null);
  const pending = useRef(0);

  const flush = useRef(() => {
    if (entry.current !== null && pending.current > 0) addWatchedSeconds(entry.current, pending.current);
    pending.current = 0;
  }).current;

  // A new video (router.replace to the next one) gets its own entry.
  useEffect(() => () => {
    flush();
    entry.current = null;
  }, [videoId, flush]);

  useEffect(() => {
    if (!playing) return;
    entry.current ??= startWatch(videoId);
    const id = setInterval(() => {
      pending.current += 1;
      if (pending.current >= FLUSH_EVERY_SECONDS) flush();
    }, 1000);
    return () => {
      clearInterval(id);
      flush();
    };
  }, [playing, videoId, flush]);
}
