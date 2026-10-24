export const TYPE_LABELS = {
  acquaintance: 'Acquaintance',
  friend: 'Friend',
  close_friend: 'Close friend',
  best_friend: 'Best friend',
  romantic_interest: 'Romantic interest',
  partner: 'Partner',
  engaged: 'Engaged',
  married: 'Married',
  family: 'Family',
  mentor: 'Mentor',
  mentee: 'Mentee',
};

export const typeLabel = (type) => TYPE_LABELS[type] ?? 'Relationship';

const STATUS = {
  pending: { label: 'Pending', cls: 'badge-warn' },
  active: { label: 'Active', cls: 'badge-ok' },
  requested_breakup: { label: 'Ending', cls: 'badge-neutral' },
  ended: { label: 'Ended', cls: 'badge-neutral' },
  declined: { label: 'Declined', cls: 'badge-neutral' },
};

export const statusMeta = (status) => STATUS[status] ?? { label: status ?? '', cls: 'badge-neutral' };

export const initials = (person) =>
  `${person?.firstName?.[0] ?? ''}${person?.lastName?.[0] ?? ''}`.toUpperCase() || '?';

export const greeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// Things waiting on this person, derived from the relationship list
export const attentionItems = (relationships, userId) => {
  const items = [];
  relationships.forEach((r) => {
    const other = r.initiator?._id === userId ? r.partner : r.initiator;
    const name = other?.firstName ?? 'Someone';

    if (r.status === 'pending' && r.partner?._id === userId) {
      items.push({ key: `invite-${r._id}`, kind: 'invite', relationship: r, other, title: `${name} invited you`, sub: r.title });
    }
    if (r.typeChangeRequest?.requested && r.typeChangeRequest?.requestedBy !== userId) {
      items.push({ key: `type-${r._id}`, kind: 'type', relationship: r, other, title: `${name} suggested a new type`, sub: r.title });
    }
    if (r.status === 'requested_breakup' && r.breakupRequestedBy && r.breakupRequestedBy !== userId && r.breakupRequestedBy?._id !== userId) {
      items.push({ key: `end-${r._id}`, kind: 'end', relationship: r, other, title: `${name} asked to end this`, sub: r.title });
    }
    const access = r.historyAccess;
    if (access?.requested && !access.granted && access.requestedBy?._id && access.requestedBy._id !== userId) {
      items.push({ key: `history-${r._id}`, kind: 'history', relationship: r, other, title: `${name} asked to see your history`, sub: 'You decide what they see' });
    }
  });
  return items;
};
