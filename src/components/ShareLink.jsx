import { Copy, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { inviteLink } from '../utils/invite';

// "Send this to someone you trust." The friend opens it, signs up, and the request to connect is ready for them.
const ShareLink = ({ user }) => {
  const link = inviteLink(user?.registrationId);
  if (!link) return null;
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const copy = async (text, done) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(done);
    } catch {
      toast.error('Could not copy. Select the text and copy it by hand.');
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: 'Connect with me on Proof', text: `${user.firstName} invited you to Proof, a private space for two.`, url: link });
    } catch { /* dismissed */ }
  };

  return (
    <div>
      <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-900">
        <p className="mono truncate text-sm" aria-label="Your invite link">{link}</p>
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => copy(link, 'Invite link copied')} className="btn btn-secondary flex-1"><Copy className="h-4 w-4" aria-hidden="true" />Copy link</button>
        {canShare && <button type="button" onClick={share} className="btn btn-primary flex-1"><Share2 className="h-4 w-4" aria-hidden="true" />Share</button>}
      </div>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Prefer to give out a code? Your Registration ID is{' '}
        <button type="button" onClick={() => copy(user.registrationId, 'Registration ID copied')} className="mono rounded bg-gray-100 px-1.5 py-0.5 font-bold hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600" aria-label={`Copy Registration ID ${user.registrationId}`}>{user.registrationId}</button>.
      </p>
    </div>
  );
};

export default ShareLink;
