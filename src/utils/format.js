export const formatShortDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

export const formatLongDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

// 'conflict_resolution' -> 'conflict resolution'
export const pretty = (value = '') => String(value).replace(/_/g, ' ');

// "14:05" today, otherwise "3 Oct"
export const formatMessageTime = (value, now = new Date()) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toDateString() === now.toDateString()
    ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
