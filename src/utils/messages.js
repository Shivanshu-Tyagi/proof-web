const GROUP_GAP_MS = 5 * 60 * 1000;

export const dayLabel = (value, now = new Date()) => {
  const d = new Date(value);
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

// Turns a flat message list into day separators plus messages marked as first/last of a run
// (same sender, within five minutes), so bubbles can group and show the time once per run.
export const groupMessages = (messages, now = new Date()) => {
  const items = [];
  messages.forEach((m, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const label = dayLabel(m.createdAt, now);
    if (!prev || dayLabel(prev.createdAt, now) !== label) items.push({ type: 'day', key: `day-${m.id}`, label });
    const joins = (a, b) => a && b && a.mine === b.mine
      && dayLabel(a.createdAt, now) === dayLabel(b.createdAt, now)
      && Math.abs(new Date(b.createdAt) - new Date(a.createdAt)) <= GROUP_GAP_MS;
    items.push({ type: 'message', key: m.id, message: m, first: !joins(prev, m), last: !joins(m, next) });
  });
  return items;
};
