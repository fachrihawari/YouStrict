import { beforeEach, describe, expect, test } from 'bun:test';
import { and } from 'drizzle-orm';
import { db, resetDb } from '@/test/setup';
import { insertChannel, insertVideo } from '@/test/fixtures';
import { videos } from '@/db/schema';
import { addKeyword, blockedReason, filterConditions, normalizeKeyword, parseFilters, type VideoFilters } from '@/helpers/filters';
import { getFilters, setFilters } from '@/lib/settings';
import { getNextVideo } from '@/hooks/use-videos';

beforeEach(resetDb);

describe('keywords', () => {
  test('are trimmed, collapsed, lowercased and deduped', () => {
    expect(normalizeKeyword('  Zombie   CAR ')).toBe('zombie car');
    expect(addKeyword(['zombie'], ' ZOMBIE ')).toEqual(['zombie']);
    expect(addKeyword(['zombie'], '   ')).toEqual(['zombie']);
    expect(addKeyword(['zombie'], 'Prank')).toEqual(['zombie', 'prank']);
  });
});

describe('blockedReason', () => {
  const filters: VideoFilters = { keywords: ['zombie'], maxDurationMinutes: 30 };

  test('matches keywords anywhere in the title, case-insensitively', () => {
    expect(blockedReason({ title: 'Zombie Car Song! 🧟', duration: 60 }, filters)).toBe('keyword');
    expect(blockedReason({ title: 'The ZOMBIES are back', duration: 60 }, filters)).toBe('keyword');
    expect(blockedReason({ title: 'Wheels on the bus', duration: 60 }, filters)).toBeNull();
  });

  test('blocks videos longer than the max duration', () => {
    expect(blockedReason({ title: 'Compilation', duration: 30 * 60 + 1 }, filters)).toBe('duration');
    expect(blockedReason({ title: 'Compilation', duration: 30 * 60 }, filters)).toBeNull();
  });
});

describe('filterConditions', () => {
  test('agrees with blockedReason on every video', () => {
    const channel = insertChannel();
    const titles = ['Zombie Car Song', 'zOmBiE party', 'Bus song', '100% fun_time', 'Prank time', 'Lagu Anak'];
    for (const [i, title] of titles.entries()) insertVideo(channel, { title, duration: (i + 1) * 10 * 60 });

    for (const filters of [
      { keywords: ['zombie'], maxDurationMinutes: null },
      { keywords: ['%', '_time'], maxDurationMinutes: null }, // LIKE wildcards must be literal
      { keywords: ['prank', 'zombie'], maxDurationMinutes: 30 },
      { keywords: [], maxDurationMinutes: 15 },
    ] satisfies VideoFilters[]) {
      const allowed = db.select().from(videos).where(and(...filterConditions(filters))).all().map((v) => v.title);
      const expected = titles.filter((title, i) => blockedReason({ title, duration: (i + 1) * 10 * 60 }, filters) === null);
      expect(allowed.sort()).toEqual(expected.sort());
    }
  });
});

describe('stored filters', () => {
  test('round-trip through settings, and clear back to none', () => {
    expect(getFilters()).toEqual({ keywords: [], maxDurationMinutes: null });
    setFilters({ keywords: ['zombie', 'prank'], maxDurationMinutes: 20 });
    expect(getFilters()).toEqual({ keywords: ['zombie', 'prank'], maxDurationMinutes: 20 });
    setFilters({ keywords: [], maxDurationMinutes: null });
    expect(getFilters()).toEqual({ keywords: [], maxDurationMinutes: null });
  });

  test('ignore corrupt values', () => {
    expect(parseFilters('not json', 'abc')).toEqual({ keywords: [], maxDurationMinutes: null });
    expect(parseFilters('[1, "ok", ""]', '0')).toEqual({ keywords: ['ok'], maxDurationMinutes: null });
  });
});

describe('getNextVideo', () => {
  test('skips hidden and filtered videos', () => {
    const channel = insertChannel();
    const oldest = insertVideo(channel, { title: 'Bus song' });
    insertVideo(channel, { title: 'Zombie song' });
    insertVideo(channel, { title: 'Hidden song', hidden: true });
    const newest = insertVideo(channel, { title: 'Train song' });
    setFilters({ keywords: ['zombie'], maxDurationMinutes: null });

    expect(getNextVideo(newest.id)?.id).toBe(oldest.id);
    expect(getNextVideo(oldest.id)?.id).toBe(newest.id); // wraps around
  });
});
