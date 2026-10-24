import { describe, expect, test } from 'bun:test';
import { parseChannel } from './yt';

const entry = (id: string, extra: Record<string, unknown> = {}) => ({
  id, title: `Title ${id}`, duration: 300, timestamp: 1_700_000_000, ...extra,
});

describe('parseChannel', () => {
  test('keeps valid videos and counts what it drops', () => {
    const result = parseChannel({
      channel_id: 'UC_A',
      channel: 'Channel A',
      entries: [
        entry('aaaaaaaaaaa'),
        entry('aaaaaaaaaaa'), // duplicate
        entry('bbbbbbbbbbb', { duration: 45 }), // shorts-length
        entry('ccccccccccc', { live_status: 'is_live' }),
        entry('ddddddddddd', { live_status: 'is_upcoming' }),
        entry('short'), // invalid id
        entry('eeeeeeeeeee', { timestamp: null }),
        entry('fffffffffff', { live_status: 'was_live' }), // finished streams are fine
      ],
    }, 'a');

    expect(result.id).toBe('UC_A');
    expect(result.name).toBe('Channel A');
    expect(result.videos.map((v) => v.id)).toEqual(['aaaaaaaaaaa', 'fffffffffff']);
    expect(result.dropped).toBe(6);
  });

  test('falls back to the handle for the name', () => {
    expect(parseChannel({ channel_id: 'UC_A', entries: [] }, 'handle').name).toBe('handle');
  });

  test('throws without a channel id', () => {
    expect(() => parseChannel({ entries: [] }, 'a')).toThrow('yt-dlp returned no channel_id');
  });
});
