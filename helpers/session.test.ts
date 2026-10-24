import { describe, expect, test } from 'bun:test';
import { computeExpiresAt, getRemainingSeconds, type ParentalSession } from '@/helpers/session';

const startedAt = 1_000_000;
const session: ParentalSession = { startedAt, durationMinutes: 30, expiresAt: computeExpiresAt(startedAt, 30) };

describe('session', () => {
  test('expires durationMinutes after start', () => {
    expect(session.expiresAt).toBe(startedAt + 30 * 60_000);
  });

  test('remaining seconds round up and never go negative', () => {
    expect(getRemainingSeconds(session, startedAt)).toBe(1800);
    expect(getRemainingSeconds(session, session.expiresAt - 1)).toBe(1);
    expect(getRemainingSeconds(session, session.expiresAt + 5000)).toBe(0);
    expect(getRemainingSeconds(null, startedAt)).toBe(0);
  });
});
