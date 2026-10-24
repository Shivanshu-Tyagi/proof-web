import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Download, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import Profile from './Profile';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { Avatar } from '../components/Avatar';
import useAuthStore from '../store/authStore';
import useRelationshipStore from '../store/relationshipStore';
import useCertificateStore from '../store/certificateStore';
import DurationChoice from '../components/DurationChoice';
import { LEVEL_LABELS, namesOf } from '../utils/certificates';
import { otherPerson } from '../utils/people';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'security', label: 'Security' },
];

const idOf = (value) => value?._id ?? value;

const Privacy = () => {
  const { user } = useAuthStore();
  const { relationships = [], getRelationships, grantHistoryAccess } = useRelationshipStore();
  const { certificates = [], fetchAllCertificates, setCertificateSharing } = useCertificateStore();
  const [busy, setBusy] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    getRelationships();
    fetchAllCertificates();
  }, [getRelationships, fetchAllCertificates]);

  // Requests where someone else wants to see MY history, and grants I have received
  const mine = relationships.filter((r) => r.historyAccess?.requested && idOf(r.historyAccess.requestedBy) !== user?.id);
  const received = relationships.filter((r) => r.historyAccess?.granted && idOf(r.historyAccess.requestedBy) === user?.id && (!r.historyAccess.expiresAt || new Date(r.historyAccess.expiresAt) > new Date()));

  const decide = async (r, granted) => {
    setBusy(r._id);
    const result = await grantHistoryAccess(r._id, granted, granted ? days : null);
    setBusy(null);
    if (result.success) {
      toast.success(granted ? 'Access allowed' : 'Access removed');
      getRelationships();
    } else {
      toast.error(result.error);
    }
  };

  const toggleCertificate = async (c) => {
    const result = await setCertificateSharing(c._id, !c.sharing?.isPublic);
    if (!result.success) toast.error(result.error);
  };

  return (
    <div className="space-y-8">
      <section aria-labelledby="hist-h">
        <h2 id="hist-h" className="mb-1 text-xl">Who can see your history</h2>
        <p className="page-sub mb-4">Nobody sees your past relationships unless you allow it. You can change your mind any time.</p>
        {mine.length === 0 && <p className="card-soft p-5 text-[15px] text-gray-700 dark:text-gray-300">No one has asked, and no one has access.</p>}
        <ul className="space-y-3">
          {mine.map((r) => {
            const other = otherPerson(r, user?.id);
            const access = r.historyAccess;
            const granted = access.granted && (!access.expiresAt || new Date(access.expiresAt) > new Date());
            const expired = access.granted && !granted;
            const declined = !access.granted && access.grantedAt;
            const until = access.expiresAt ? new Date(access.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
            return (
              <li key={r._id} className="card flex flex-wrap items-center gap-3 p-4">
                <Avatar person={other} size="lg" />
                <div className="min-w-0 flex-1 basis-48 leading-snug">
                  <p className="font-extrabold">{other?.firstName} {other?.lastName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Via {r.title}{granted ? (until ? ` · until ${until}` : ' · until you stop it') : ''}</p>
                </div>
                <span className={`badge ${granted ? 'badge-ok' : declined || expired ? 'badge-neutral' : 'badge-warn'}`}>{granted ? 'Allowed' : expired ? 'Expired' : declined ? 'Declined' : 'Waiting for you'}</span>
                {granted ? (
                  <button type="button" disabled={busy === r._id} onClick={() => decide(r, false)} className="btn btn-danger">Revoke</button>
                ) : (
                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    <DurationChoice value={days} onChange={setDays} />
                    <button type="button" disabled={busy === r._id} onClick={() => decide(r, true)} className="btn btn-primary">Allow</button>
                    {!declined && !expired && <button type="button" disabled={busy === r._id} onClick={() => decide(r, false)} className="btn btn-secondary">Decline</button>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {received.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-2 text-base">History you can see</h3>
            <ul className="space-y-2">
              {received.map((r) => {
                const other = otherPerson(r, user?.id);
                return (
                  <li key={r._id} className="card flex items-center justify-between gap-3 p-3">
                    <span className="flex items-center gap-3"><Avatar person={other} /><span className="font-bold">{other?.firstName} {other?.lastName}</span></span>
                    <Link to={`/history/${other?._id}`} className="btn btn-secondary btn-sm">View</Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="cert-h">
        <h2 id="cert-h" className="mb-1 text-xl">Certificate links</h2>
        <p className="page-sub mb-4">A public link shows only names, level and date. Switch it off to make it private again.</p>
        {certificates.length === 0 && <p className="card-soft p-5 text-[15px] text-gray-700 dark:text-gray-300">You have no certificates yet.</p>}
        <ul className="space-y-3">
          {certificates.map((c) => (
            <li key={c._id} className="card flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1 leading-snug">
                <Link to={`/certificates/${c._id}/display`} className="font-extrabold hover:underline">{namesOf(c).join(' & ') || c.title}</Link>
                <p className="text-sm text-gray-600 dark:text-gray-400">{c.title} · {LEVEL_LABELS[c.level] ?? 'Bronze'}</p>
              </div>
              <button type="button" role="switch" aria-checked={c.sharing?.isPublic === true} aria-label={`Public link for ${c.title}`} onClick={() => toggleCertificate(c)} className="toggle" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

// Personal switches. Both are honoured by the server when it creates a notification.
const NOTIFY_ROWS = [
  ['milestones', 'Milestones', 'Due dates and completions in your relationships'],
  ['activities', 'Moments', 'When someone adds a moment to a relationship you share'],
];

const Notifications = () => {
  const { user, updateProfile } = useAuthStore();
  const [saving, setSaving] = useState(null);
  const prefs = user?.preferences?.notifications ?? {};

  const toggle = async (key) => {
    setSaving(key);
    const current = prefs[key] !== false;
    const result = await updateProfile({
      preferences: {
        ...user.preferences,
        notifications: { ...prefs, [key]: !current },
      },
    });
    setSaving(null);
    if (result.success) toast.success(current ? 'Turned off' : 'Turned on');
    else toast.error(result.error?.message ?? 'Could not save');
  };

  return (
    <section aria-labelledby="notif-h">
      <h2 id="notif-h" className="mb-1 text-xl">What should reach your inbox?</h2>
      <p className="page-sub mb-4">Things that need your answer, like invitations and requests, always arrive.</p>
      <div className="card divide-y divide-gray-200 dark:divide-gray-700">
        {NOTIFY_ROWS.map(([key, label, hint]) => (
          <div key={key} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="leading-snug">
              <p id={`n-${key}`} className="font-bold">{label}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{hint}</p>
            </div>
            <button type="button" role="switch" aria-checked={prefs[key] !== false} aria-labelledby={`n-${key}`} disabled={saving === key} onClick={() => toggle(key)} className="toggle" />
          </div>
        ))}
      </div>
    </section>
  );
};

const Security = () => {
  const { user, logout, exportData, deleteAccount } = useAuthStore();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setExporting(true);
    const result = await exportData();
    setExporting(false);
    if (result.success) toast.success('Your data has been downloaded');
    else toast.error(result.error);
  };

  const closeDelete = () => { setDeleting(false); setPassword(''); setUnderstood(false); };

  const confirmDelete = async () => {
    setBusy(true);
    const result = await deleteAccount(password);
    setBusy(false);
    if (result.success) {
      toast.success('Your account has been deleted.');
      navigate('/login', { replace: true });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <p className="eyebrow">Email</p>
        <p className="mt-1 font-bold">{user?.email}</p>
        <p className="eyebrow mt-4">Registration ID</p>
        <p className="mono mt-1 text-lg">{user?.registrationId}</p>
      </section>
      <ChangePasswordForm />

      <section aria-labelledby="data-h" className="card p-5">
        <h2 id="data-h" className="text-lg">Your data</h2>
        <p className="page-sub mb-4 mt-1">Download a copy of everything we hold about you: your profile, relationships, agreements, milestones, moments, certificates and private notes.</p>
        <button type="button" onClick={download} disabled={exporting} className="btn btn-secondary"><Download className="h-4 w-4" aria-hidden="true" />{exporting ? 'Preparing…' : 'Download my data'}</button>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={logout} className="btn btn-secondary"><LogOut className="h-4 w-4" aria-hidden="true" />Sign out of this device</button>
      </div>

      <section aria-labelledby="danger-h" className="rounded-[var(--radius-card)] border border-rose-200 p-5 dark:border-rose-900">
        <h2 id="danger-h" className="text-lg">Delete your account</h2>
        <p className="page-sub mb-4 mt-1">This removes your personal details and private notes. Your relationships end, and the people in them are told. Anything you shared with them stays for them, with your name removed. This cannot be undone.</p>
        <button type="button" onClick={() => setDeleting(true)} className="btn btn-danger">Delete my account</button>
      </section>

      {deleting && (
        <Modal
          title="Delete your account?"
          onClose={closeDelete}
          footer={<>
            <button type="button" className="btn btn-secondary flex-1" onClick={closeDelete}>Keep my account</button>
            <button type="button" className="btn btn-danger flex-1" disabled={busy || !understood || !password} onClick={confirmDelete}>{busy ? 'Deleting…' : 'Delete forever'}</button>
          </>}
        >
          <ul className="mb-4 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed">
            <li>Your relationships end and the other people are told.</li>
            <li>Your private notes, notifications and profile details are erased.</li>
            <li>Your comments and reactions on shared moments are removed.</li>
            <li>Shared records stay for the other person as &ldquo;Deleted user&rdquo;.</li>
            <li>Public certificate links you turned on stop working.</li>
          </ul>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Want a copy first? Close this and use Download my data.</p>
          <label htmlFor="delete-password" className="field-label">Your password</label>
          <input id="delete-password" type="password" autoComplete="current-password" className="input mb-4" value={password} onChange={(e) => setPassword(e.target.value)} />
          <label htmlFor="delete-understand" className="flex min-h-[44px] items-center gap-3 text-sm">
            <input id="delete-understand" type="checkbox" className="h-5 w-5 rounded accent-rose-500" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
            I understand this is permanent
          </label>
        </Modal>
      )}
    </div>
  );
};

const Account = () => {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'profile';

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <h1 className="page-title mb-4">You</h1>
      <div role="tablist" aria-label="Account sections" className="mb-6 flex border-b border-gray-200 dark:border-gray-700">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setParams(t.id === 'profile' ? {} : { tab: t.id })}
            className={`mr-6 min-h-[48px] border-b-[3px] px-1 text-sm font-bold ${tab === t.id ? 'border-rose-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === 'profile' && <Profile embedded />}
        {tab === 'notifications' && <Notifications />}
        {tab === 'privacy' && <Privacy />}
        {tab === 'security' && <Security />}
      </div>
    </div>
  );
};

export default Account;
