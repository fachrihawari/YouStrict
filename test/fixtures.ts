import { db } from '@/test/setup';
import { channels, videos } from '@/db/schema';

let n = 0;

// Inserts a channel (enabled unless told otherwise) and returns its id.
export function insertChannel(overrides: Partial<typeof channels.$inferInsert> = {}) {
  const id = overrides.id ?? `UC_${++n}`;
  db.insert(channels).values({ id, handle: id, name: `Channel ${id}`, videoCount: 0, hash: '', enabled: true, ...overrides }).run();
  return id;
}

// Inserts a video; ids are 11 chars like YouTube's, timestamps increase.
export function insertVideo(channelId: string, overrides: Partial<typeof videos.$inferInsert> = {}) {
  const i = ++n;
  const row = { id: `v${String(i).padStart(10, '0')}`, channelId, title: `Video ${i}`, duration: 300, timestamp: 1_700_000_000 + i, ...overrides };
  db.insert(videos).values(row).run();
  return row;
}
