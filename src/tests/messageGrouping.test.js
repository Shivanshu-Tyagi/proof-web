import { describe, it, expect } from 'vitest';
import { groupMessages, dayLabel } from '../utils/messages';

describe('groupMessages', () => {
  const now = new Date('2026-10-23T12:00:00');
  const msg = (id, mine, iso) => ({ id, mine, createdAt: new Date(iso).toISOString(), text: id });

  it('groups a run from one sender and shows the time on its last message', () => {
    const items = groupMessages([
      msg('a', false, '2026-10-23T09:00:00'),
      msg('b', false, '2026-10-23T09:01:00'),
      msg('c', true, '2026-10-23T09:02:00'),
    ], now).filter((i) => i.type === 'message');
    expect(items.map((i) => [i.first, i.last])).toEqual([[true, false], [false, true], [true, true]]);
  });

  it('starts a new run after a long gap and adds day separators', () => {
    const items = groupMessages([
      msg('a', false, '2026-10-22T09:00:00'),
      msg('b', false, '2026-10-23T09:00:00'),
      msg('c', false, '2026-10-23T10:00:00'),
    ], now);
    expect(items.filter((i) => i.type === 'day').map((i) => i.label)).toEqual(['Yesterday', 'Today']);
    const runs = items.filter((i) => i.type === 'message').map((i) => [i.first, i.last]);
    expect(runs).toEqual([[true, true], [true, true], [true, true]]);
  });

  it('labels days', () => {
    expect(dayLabel('2026-10-23T01:00:00', now)).toBe('Today');
    expect(dayLabel('2026-10-10T01:00:00', now)).toMatch(/10 Oct/);
  });
});
