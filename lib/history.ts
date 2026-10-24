import { desc, eq, gt, gte, lt, sql } from 'drizzle-orm';
import { db } from '@/db';
import { channels, videos, watchHistory } from '@/db/schema';

export const HISTORY_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

// Starts an entry when a video actually begins playing. Returns null if the
// video is no longer in the catalog.
export function startWatch(videoId: string, now = Date.now()): number | null {
  const video = db
    .select({ title: videos.title, channelId: videos.channelId, channelName: channels.name })
    .from(videos)
    .innerJoin(channels, eq(channels.id, videos.channelId))
    .where(eq(videos.id, videoId))
    .get();
  if (!video) return null;

  return db.insert(watchHistory)
    .values({ videoId, ...video, startedAt: now })
    .returning({ id: watchHistory.id })
    .get().id;
}

export function addWatchedSeconds(id: number, seconds: number) {
  db.update(watchHistory)
    .set({ watchedSeconds: sql`${watchHistory.watchedSeconds} + ${seconds}` })
    .where(eq(watchHistory.id, id))
    .run();
}

export function pruneHistory(now = Date.now()) {
  db.delete(watchHistory).where(lt(watchHistory.startedAt, now - HISTORY_DAYS * DAY_MS)).run();
}

function startOfDay(ms: number) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function secondsWatchedToday(now = Date.now()) {
  return db
    .select({ total: sql<number>`coalesce(sum(${watchHistory.watchedSeconds}), 0)` })
    .from(watchHistory)
    .where(gte(watchHistory.startedAt, startOfDay(now)))
    .get()!.total;
}

// History newest first, with the video's and channel's current state so the
// parent can act on an entry (null when it has left the catalog).
export function getHistory() {
  return db
    .select({
      id: watchHistory.id,
      videoId: watchHistory.videoId,
      channelId: watchHistory.channelId,
      title: watchHistory.title,
      channelName: watchHistory.channelName,
      startedAt: watchHistory.startedAt,
      watchedSeconds: watchHistory.watchedSeconds,
      videoHidden: videos.hidden,
      channelEnabled: channels.enabled,
    })
    .from(watchHistory)
    .leftJoin(videos, eq(videos.id, watchHistory.videoId))
    .leftJoin(channels, eq(channels.id, watchHistory.channelId))
    .where(gt(watchHistory.watchedSeconds, 0))
    .orderBy(desc(watchHistory.startedAt), desc(watchHistory.id))
    .all();
}

export type HistoryItem = ReturnType<typeof getHistory>[number];

export type HistoryDay = { title: string; totalSeconds: number; data: HistoryItem[] };

// Groups newest-first entries into local calendar days for a SectionList.
export function groupByDay(items: HistoryItem[], now = Date.now()): HistoryDay[] {
  const today = startOfDay(now);
  const days = new Map<number, HistoryDay>(); // keeps insertion (newest-first) order

  for (const item of items) {
    const start = startOfDay(item.startedAt);
    let day = days.get(start);
    if (!day) {
      day = { title: dayTitle(start, today), totalSeconds: 0, data: [] };
      days.set(start, day);
    }
    day.totalSeconds += item.watchedSeconds;
    day.data.push(item);
  }
  return [...days.values()];
}

function dayTitle(start: number, today: number) {
  if (start === today) return 'Today';
  // Days can be 23 or 25 hours around DST changes, so compare calendar days.
  if (start === startOfDay(today - DAY_MS / 2)) return 'Yesterday';
  return new Date(start).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}
