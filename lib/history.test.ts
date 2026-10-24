import { beforeEach, describe, expect, test } from 'bun:test';
import { db, resetDb } from '@/test/setup';
import { insertChannel, insertVideo } from '@/test/fixtures';
import { channels, watchHistory } from '@/db/schema';
import { addWatchedSeconds, getHistory, groupByDay, pruneHistory, secondsWatchedToday, startWatch } from '@/lib/history';
import { setChannelEnabled, setVideoHidden, syncCatalog } from '@/lib/catalog';
import { formatWatchTime } from '@/helpers/video';

const NOW = new Date(2026, 9, 24, 15, 0).getTime(); // local time
const at = (day: number, hour: number) => new Date(2026, 9, day, hour, 0).getTime();

beforeEach(resetDb);

describe('recording', () => {
  test('copies title and channel, then accumulates seconds', () => {
    const channel = insertChannel({ name: 'Tayo' });
    const video = insertVideo(channel, { title: 'Zombie Car Song' });

    const id = startWatch(video.id, NOW)!;
    addWatchedSeconds(id, 15);
    addWatchedSeconds(id, 15);

    expect(db.select().from(watchHistory).all()).toEqual([
      { id, videoId: video.id, channelId: channel, title: 'Zombie Car Song', channelName: 'Tayo', startedAt: NOW, watchedSeconds: 30 },
    ]);
  });

  test('ignores videos that are not in the catalog', () => {
    expect(startWatch('missing0000', NOW)).toBeNull();
  });

  test('survives the video and channel leaving the catalog', async () => {
    const channel = insertChannel();
    const id = startWatch(insertVideo(channel).id, NOW)!;
    addWatchedSeconds(id, 60);
    db.delete(channels).run(); // videos cascade, history must not

    const [entry] = getHistory();
    expect(entry.watchedSeconds).toBe(60);
    expect(entry.videoHidden).toBeNull();
    expect(entry.channelEnabled).toBeNull();
  });
});

describe('getHistory', () => {
  test('is newest first, skips empty entries, and reflects current parent choices', () => {
    const channel = insertChannel();
    const a = insertVideo(channel);
    const b = insertVideo(channel);
    addWatchedSeconds(startWatch(a.id, at(23, 10))!, 120);
    addWatchedSeconds(startWatch(b.id, at(24, 9))!, 60);
    startWatch(b.id, at(24, 11)); // started but never reached a flush

    setVideoHidden([a.id], true);
    setChannelEnabled(channel, false);

    expect(getHistory().map((e) => [e.videoId, e.videoHidden, e.channelEnabled])).toEqual([
      [b.id, false, false],
      [a.id, true, false],
    ]);
  });
});

describe('days', () => {
  test('group by local day with totals', () => {
    const channel = insertChannel();
    const v = insertVideo(channel);
    for (const [startedAt, seconds] of [[at(24, 14), 600], [at(24, 9), 300], [at(23, 20), 1200], [at(20, 8), 60]]) {
      addWatchedSeconds(startWatch(v.id, startedAt)!, seconds);
    }

    const days = groupByDay(getHistory(), NOW);
    expect(days.map((d) => [d.title, d.totalSeconds, d.data.length])).toEqual([
      ['Today', 900, 2],
      ['Yesterday', 1200, 1],
      [new Date(at(20, 0)).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }), 60, 1],
    ]);
    expect(secondsWatchedToday(NOW)).toBe(900);
  });

  test('prune drops entries older than 30 days', () => {
    const v = insertVideo(insertChannel());
    addWatchedSeconds(startWatch(v.id, NOW - 31 * 86_400_000)!, 60);
    addWatchedSeconds(startWatch(v.id, NOW - 29 * 86_400_000)!, 60);

    pruneHistory(NOW);
    expect(getHistory()).toHaveLength(1);
  });
});

test('formatWatchTime', () => {
  expect(formatWatchTime(30)).toBe('<1 min');
  expect(formatWatchTime(42 * 60 + 59)).toBe('42 min');
  expect(formatWatchTime(65 * 60)).toBe('1 h 5 min');
});

test('a catalog sync leaves history alone', async () => {
  const v = insertVideo(insertChannel());
  addWatchedSeconds(startWatch(v.id, NOW)!, 60);
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async () => Response.json({ schema: 1, version: 'v9', generatedAt: '', channels: [] })) as unknown as typeof fetch;
  try {
    await syncCatalog(); // an empty catalog removes every channel and video
  } finally {
    globalThis.fetch = realFetch;
  }
  expect(getHistory()).toHaveLength(1);
});
