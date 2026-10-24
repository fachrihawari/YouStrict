import { describe, expect, test } from 'bun:test';
import { activeWarning, computeExpiresAt, computeGraceUntil, getRemainingSeconds, GRACE_MAX_MS, type ParentalSession } from '@/helpers/session';

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

describe('computeGraceUntil', () => {
  const expiresAt = 1_000_000;

  test('extends to the end of the playing video', () => {
    expect(computeGraceUntil(expiresAt, expiresAt + 90_000, true)).toBe(expiresAt + 90_000);
  });

  test('is capped at 10 minutes', () => {
    expect(computeGraceUntil(expiresAt, expiresAt + 60 * 60_000, true)).toBe(expiresAt + GRACE_MAX_MS);
  });

  test('does nothing when off, when nothing plays, or when the video ends in time', () => {
    expect(computeGraceUntil(expiresAt, expiresAt + 90_000, false)).toBeNull();
    expect(computeGraceUntil(expiresAt, null, true)).toBeNull();
    expect(computeGraceUntil(expiresAt, expiresAt, true)).toBeNull();
  });
});

describe('activeWarning', () => {
  const hour = 3600;

  test('shows each warning for 8 seconds after its threshold', () => {
    expect(activeWarning(301, hour)).toBeNull();
    expect(activeWarning(300, hour)).toBe(300);
    expect(activeWarning(293, hour)).toBe(300);
    expect(activeWarning(292, hour)).toBeNull();
    expect(activeWarning(60, hour)).toBe(60);
    expect(activeWarning(53, hour)).toBe(60);
    expect(activeWarning(52, hour)).toBeNull();
    expect(activeWarning(0, hour)).toBeNull();
  });

  test('skips warnings longer than the session', () => {
    expect(activeWarning(300, 300)).toBeNull();
    expect(activeWarning(60, 300)).toBe(60);
  });
});
