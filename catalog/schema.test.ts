import { describe, expect, test } from 'bun:test';
import { isValidIndex, isValidVideo } from './schema';

describe('catalog validators', () => {
  const video = { id: 'aaaaaaaaaaa', title: 'T', duration: 10, timestamp: 1 };

  test('isValidVideo', () => {
    expect(isValidVideo(video)).toBe(true);
    expect(isValidVideo({ ...video, id: 'aaaa' })).toBe(false);
    expect(isValidVideo({ ...video, title: '' })).toBe(false);
    expect(isValidVideo({ ...video, duration: 0 })).toBe(false);
    expect(isValidVideo({ ...video, timestamp: NaN })).toBe(false);
    expect(isValidVideo(null)).toBe(false);
  });

  test('isValidIndex', () => {
    const channel = { id: 'UC', handle: 'h', name: 'n', hash: 'x', file: 'f.json', videoCount: 1 };
    expect(isValidIndex({ schema: 1, version: 'v', channels: [channel] })).toBe(true);
    expect(isValidIndex({ schema: 2, version: 'v', channels: [] })).toBe(false);
    expect(isValidIndex({ schema: 1, version: 'v', channels: [{ ...channel, videoCount: '1' }] })).toBe(false);
  });
});
