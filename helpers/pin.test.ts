import { beforeEach, describe, expect, test } from 'bun:test';
import { secureStore } from '@/test/setup';
import { hasPin, pinErrorMessage, setPin, verifyPin } from '@/helpers/pin';

beforeEach(() => secureStore.clear());

describe('PIN', () => {
  test('is stored salted and hashed, never in plain text', async () => {
    expect(await hasPin()).toBe(false);
    await setPin('1234');
    expect(await hasPin()).toBe(true);
    expect([...secureStore.values()].join()).not.toContain('1234');
  });

  test('accepts the right PIN and rejects a wrong one', async () => {
    await setPin('1234');
    expect(await verifyPin('1234')).toEqual({ ok: true, lockedForMs: 0 });
    expect(await verifyPin('4321')).toEqual({ ok: false, lockedForMs: 0 });
  });

  test('locks out after 5 wrong tries, even for the right PIN', async () => {
    await setPin('1234');
    for (let i = 0; i < 4; i++) expect((await verifyPin('0000')).lockedForMs).toBe(0);

    const fifth = await verifyPin('0000');
    expect(fifth.lockedForMs).toBe(30_000);
    expect(pinErrorMessage(fifth)).toBe('Too many tries. Wait 30 seconds');

    const right = await verifyPin('1234');
    expect(right.ok).toBe(false);
    expect(right.lockedForMs).toBeGreaterThan(0);
  });

  test('a correct PIN resets the failure count', async () => {
    await setPin('1234');
    for (let i = 0; i < 4; i++) await verifyPin('0000');
    expect((await verifyPin('1234')).ok).toBe(true);
    expect((await verifyPin('0000')).lockedForMs).toBe(0);
  });
});
