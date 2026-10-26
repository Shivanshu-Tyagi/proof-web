import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import useRelationshipStore from '../store/relationshipStore';
import useAuthStore from '../store/authStore';
import { Avatar } from '../components/Avatar';
import { TYPE_LABELS } from '../utils/relationships';
import { debounce } from '../utils/debounce';
import ShareLink from '../components/ShareLink';
import FieldError from '../components/FieldError';
import useFormErrors from '../utils/useFormErrors';

const InviteRelationship = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createRelationship, isLoading } = useRelationshipStore();
  const { user, searchUserByRegistrationId, searchUsersByEmail } = useAuthStore();

  const prefilledPartner = location.state?.prefilledPartner; // chosen on the Find someone page
  const [mode, setMode] = useState('registrationId'); // how we find them
  const [identifier, setIdentifier] = useState('');
  const [found, setFound] = useState(prefilledPartner ?? null);
  const [locked, setLocked] = useState(Boolean(prefilledPartner));
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'friend', description: '' });

  const emailMode = mode === 'email';
  const { errors, clear, fail, aria } = useFormErrors();

  // Only a complete email address is looked up, and it is matched exactly.
  const debouncedLookup = useRef(
    debounce(async (query) => {
      if (!/^\S+@\S+\.\S+$/.test(query.trim())) return;
      setSearching(true);
      const result = await searchUsersByEmail(query.trim());
      setSearching(false);
      if (result.success && result.users[0]) {
        setFound(result.users[0]);
        setSearchError(null);
      } else {
        setSearchError('No one has an account with that email yet.');
      }
    }, 400)
  ).current;

  const switchMode = (next) => {
    setMode(next);
    setIdentifier('');
    setFound(null);
    setSearchError(null);
  };

  const onIdentifierChange = (e) => {
    const value = e.target.value;
    setIdentifier(value);
    setFound(null);
    setSearchError(null);
    clear('partnerIdentifier');
    if (emailMode) debouncedLookup(value);
  };

  const findByRegistrationId = async () => {
    setFound(null);
    setSearchError(null);
    if (!identifier.trim()) {
      setSearchError('Enter their Registration ID');
      return;
    }
    setSearching(true);
    const result = await searchUserByRegistrationId(identifier.trim());
    setSearching(false);
    if (!result.success) {
      setSearchError(result.error || 'We could not find that person');
    } else if (result.user._id === user?.id) {
      setSearchError('That is your own ID. Invite someone else.');
    } else {
      setFound(result.user);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Once someone is found we invite them by ID; an email that matched no account is still tried as typed
    const partnerEmail = !found && emailMode ? identifier.trim() : '';
    const missing = {};
    if (!found && !partnerEmail) {
      if (emailMode) missing.partnerIdentifier = 'Enter their email address.';
      else missing.partnerIdentifier = identifier.trim() ? 'Press Find to look them up first.' : 'Enter their Registration ID, then press Find.';
    }
    if (!form.title.trim()) missing.title = 'Give this relationship a name.';
    if (Object.keys(missing).length) {
      fail(missing);
      return;
    }

    const result = await createRelationship({
      ...(found ? { partnerId: found._id } : { partnerEmail }),
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim(),
    });

    if (result.success) {
      toast.success('Relationship invitation sent successfully!');
      navigate('/relationships');
    } else {
      toast.error(result.error || 'Failed to send invitation');
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <Link to="/relationships" className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-bold hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />People
      </Link>
      <h1 className="page-title">Who is it with?</h1>
      <p className="page-sub mb-6 mt-1">They get a request and decide. Nothing is public.</p>

      {!locked && (
        <section aria-label="Send your invite link" className="card-soft mb-6 p-4">
          <p className="font-extrabold">Do not have their ID? Send them your link instead.</p>
          <p className="mb-3 mt-0.5 text-sm text-gray-600 dark:text-gray-400">They open it, sign up, and the request to connect with you is ready for them.</p>
          <ShareLink user={user} />
        </section>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {locked ? (
          <div>
            <p className="field-label">Inviting</p>
            <div className="flex items-center gap-3 rounded-2xl bg-green-100 p-3 dark:bg-green-900/30">
              <Avatar person={found} size="lg" />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate font-extrabold">{found.firstName} {found.lastName}</p>
                <p className="truncate text-sm text-green-900 dark:text-green-200">@{found.username}</p>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setLocked(false); setFound(null); }}>Change</button>
            </div>
          </div>
        ) : (
          <>
        <div className="flex rounded-2xl bg-gray-100 p-1 dark:bg-gray-800" role="group" aria-label="Find them by">
          {[['registrationId', 'Registration ID'], ['email', 'Email']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={mode === key}
              onClick={() => switchMode(key)}
              className={`min-h-[44px] flex-1 rounded-xl px-3 text-sm font-extrabold transition-colors ${
                mode === key ? 'bg-white shadow-sm dark:bg-gray-700' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="partnerIdentifier" className="field-label">{emailMode ? 'Their email address' : 'Their Registration ID'}</label>
          <div className="flex gap-2">
            <input
              id="partnerIdentifier"
              name="partnerIdentifier"
              type={emailMode ? 'email' : 'text'}
              autoComplete="off"
              value={identifier}
              onChange={onIdentifierChange}
              placeholder={emailMode ? 'friend@example.com' : '8 to 12 characters'}
              className={`input ${emailMode ? '' : 'mono'}`}
              {...aria('partnerIdentifier')}
            />
            {!emailMode && (
              <button type="button" onClick={findByRegistrationId} disabled={searching} className="btn btn-dark shrink-0">
                {searching ? 'Finding…' : 'Find'}
              </button>
            )}
          </div>
          <FieldError name="partnerIdentifier" errors={errors} />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Only know their name? <Link to="/find-someone" className="font-bold text-rose-700 underline dark:text-rose-300">Search by name</Link>.</p>
          {searchError && <p role="alert" className="mt-2 text-sm font-bold text-rose-700 dark:text-rose-300">{searchError}</p>}


          {found && (
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-green-100 p-3 dark:bg-green-900/30">
              <Avatar person={found} size="lg" />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate font-extrabold">{found.firstName} {found.lastName}</p>
                <p className="truncate text-sm text-green-900 dark:text-green-200">@{found.username} · found</p>
              </div>
              <Check className="h-6 w-6 text-green-800 dark:text-green-300" aria-label="Found" />
            </div>
          )}
        </div>

          </>
        )}

        <div>
          <label htmlFor="title" className="field-label">Give it a name</label>
          <input id="title" name="title" className="input" {...aria('title')} value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); clear('title'); }} placeholder="Weekend hikers, Study partners…" maxLength={100} />
          <FieldError name="title" errors={errors} />
        </div>

        <fieldset>
          <legend className="field-label">What are you to each other?</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <button key={key} type="button" aria-pressed={form.type === key} onClick={() => setForm({ ...form, type: key })} className={`chip ${form.type === key ? 'chip-on' : ''}`}>{label}</button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="description" className="field-label">A note for them (optional)</label>
          <textarea id="description" name="description" className="input" rows={3} maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Say what this relationship means to you." />
        </div>

        <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">{isLoading ? 'Sending…' : 'Send invitation'}</button>
      </form>
    </div>
  );
};

export default InviteRelationship;
