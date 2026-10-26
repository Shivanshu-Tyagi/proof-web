import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import usePolling, { nextDelay } from '../utils/usePolling';

const opts = { base: 1000, max: 4000, factor: 2 };
const setHidden = (hidden) => {
  Object.defineProperty(document, 'hidden', { configurable: true, value: hidden });
  document.dispatchEvent(new Event('visibilitychange'));
};
const tick = (ms) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

describe('nextDelay', () => {
  it('grows while nothing changes, stops at the maximum, and snaps back when something changes', () => {
    expect(nextDelay(1000, false, opts)).toBe(2000);
    expect(nextDelay(2000, false, opts)).toBe(4000);
    expect(nextDelay(4000, false, opts)).toBe(4000);
    expect(nextDelay(4000, true, opts)).toBe(1000);
  });
});

describe('usePolling', () => {
  beforeEach(() => { vi.useFakeTimers(); setHidden(false); });
  afterEach(() => { vi.useRealTimers(); setHidden(false); });

  it('checks straight away, then less and less often while nothing changes', async () => {
    const task = vi.fn().mockResolvedValue(false);
    renderHook(() => usePolling(task, opts));
    await tick(0);
    expect(task).toHaveBeenCalledTimes(1);
    await tick(1000); // after 1s
    expect(task).toHaveBeenCalledTimes(2);
    await tick(2000); // then 2s later
    expect(task).toHaveBeenCalledTimes(3);
    await tick(4000); // then 4s
    expect(task).toHaveBeenCalledTimes(4);
    await tick(3999); // never faster than the maximum pace again, and not yet due
    expect(task).toHaveBeenCalledTimes(4);
    await tick(1);
    expect(task).toHaveBeenCalledTimes(5);
  });

  it('goes back to the fast pace when it finds something new', async () => {
    const task = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValueOnce(true).mockResolvedValue(false);
    renderHook(() => usePolling(task, opts));
    await tick(0); await tick(1000); await tick(2000); // third call finds something
    expect(task).toHaveBeenCalledTimes(3);
    await tick(1000); // so the next one comes after the short delay
    expect(task).toHaveBeenCalledTimes(4);
  });

  it('does nothing in a hidden tab and checks as soon as the person is back', async () => {
    const task = vi.fn().mockResolvedValue(false);
    renderHook(() => usePolling(task, opts));
    await tick(0);
    setHidden(true);
    await tick(60000);
    expect(task).toHaveBeenCalledTimes(1);
    setHidden(false);
    await tick(0);
    expect(task).toHaveBeenCalledTimes(2);
  });

  it('keeps going if a check fails, and stops when it is switched off', async () => {
    const task = vi.fn().mockRejectedValue(new Error('offline'));
    const { rerender, unmount } = renderHook(({ enabled }) => usePolling(task, { ...opts, enabled }), { initialProps: { enabled: true } });
    await tick(0); await tick(1000);
    expect(task).toHaveBeenCalledTimes(2);
    rerender({ enabled: false });
    await tick(60000);
    expect(task).toHaveBeenCalledTimes(2);
    unmount();
  });
});
