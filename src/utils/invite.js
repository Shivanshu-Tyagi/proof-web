// The link someone shares so a friend can connect with them without knowing any ID
export const inviteLink = (registrationId) => (registrationId ? `${window.location.origin}/connect/${encodeURIComponent(registrationId)}` : '');
