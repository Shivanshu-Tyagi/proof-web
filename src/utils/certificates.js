export const LEVEL_LABELS = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', platinum: 'Platinum', diamond: 'Diamond' };

export const verifyUrl = (number) => `${window.location.origin}/verify/${encodeURIComponent(number)}`;

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

export const namesOf = (certificate) =>
  (certificate?.recipients ?? [])
    .map((r) => `${r.user?.firstName ?? ''} ${r.user?.lastName ?? ''}`.trim())
    .filter(Boolean);
