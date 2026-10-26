import { useEffect, useState } from 'react';
import { Bug, ChevronDown, Lightbulb, MessageCircle, MessageSquarePlus, Search, ThumbsUp, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import useFeedbackStore from '../store/feedbackStore';
import useFormErrors from '../utils/useFormErrors';
import FieldError from '../components/FieldError';
import ConfirmModal from '../components/ConfirmModal';
import { timeAgo } from '../utils/timeAgo';

const TYPES = [
  { value: 'problem', label: 'Problem', plural: 'Problems', icon: Bug, tint: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200', hint: 'Something is broken or confusing' },
  { value: 'idea', label: 'Idea', plural: 'Ideas', icon: Lightbulb, tint: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200', hint: 'Something you would like to see' },
  { value: 'other', label: 'Other', plural: 'Other', icon: MessageCircle, tint: 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200', hint: 'A question or anything else' },
];
const typeOf = (value) => TYPES.find((t) => t.value === value) ?? TYPES[2];

const STATUSES = [
  { value: 'open', label: 'New' },
  { value: 'planned', label: 'Planned', badge: 'badge-warn' },
  { value: 'in_progress', label: 'In progress', badge: 'badge-rose' },
  { value: 'done', label: 'Done', badge: 'badge-ok' },
  { value: 'declined', label: 'Not planned', badge: 'badge-neutral' },
];

// "Me too": the button that says you have the same problem or want the same thing
const MeToo = ({ item, onToggle, compact = false }) => (
  <button
    type="button"
    aria-pressed={item.supported}
    aria-label={`Me too. ${item.supportCount} ${item.supportCount === 1 ? 'person has' : 'people have'} said it.`}
    onClick={() => onToggle(item.id)}
    className={`inline-flex items-center gap-2 rounded-xl border-2 px-3.5 font-extrabold transition-colors ${compact ? 'min-h-[40px] text-sm' : 'min-h-[44px]'} ${
      item.supported
        ? 'border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-400 dark:bg-rose-900/30 dark:text-rose-200'
        : 'border-gray-300 bg-white text-gray-900 hover:border-rose-400 hover:bg-rose-50 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
    }`}
  >
    <ThumbsUp className={`h-4 w-4 ${item.supported ? 'fill-current' : ''}`} aria-hidden="true" />
    Me too
    <span className="mono rounded-md bg-black/5 px-1.5 text-sm dark:bg-white/10">{item.supportCount}</span>
  </button>
);

const ShareForm = ({ onPosted }) => {
  const { create, findSimilar, support } = useFeedbackStore();
  const { errors, clear, fail, aria } = useFormErrors();
  const [form, setForm] = useState({ type: 'idea', title: '', body: '', anonymous: false });
  const [similar, setSimilar] = useState([]);
  const [sending, setSending] = useState(false);
  const set = (patch) => { setForm((f) => ({ ...f, ...patch })); Object.keys(patch).forEach((k) => clear(`fb-${k}`)); };

  // While the title is typed, show posts that sound the same, so people add their voice instead of repeating
  useEffect(() => {
    const title = form.title.trim();
    if (title.length < 4) { setSimilar([]); return undefined; }
    let cancelled = false;
    const timer = setTimeout(async () => { const found = await findSimilar(title); if (!cancelled) setSimilar(found); }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [form.title, findSimilar]);

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const found = {};
    if (form.title.trim().length < 4) found['fb-title'] = 'Give it a short title, at least 4 characters.';
    if (form.body.trim().length < 10) found['fb-body'] = 'Add a few details, at least 10 characters.';
    if (Object.keys(found).length) { fail(found); return; }
    setSending(true);
    const result = await create({ ...form, title: form.title.trim(), body: form.body.trim() });
    setSending(false);
    if (result.success) {
      toast.success('Thank you! Your feedback is posted.');
      setForm({ type: 'idea', title: '', body: '', anonymous: false });
      setSimilar([]);
      onPosted();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={submit} className="card mb-6 space-y-5 p-5 sm:p-6" noValidate aria-label="Share feedback">
      <fieldset>
        <legend className="field-label">What kind of feedback?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {TYPES.map((t) => {
            const Icon = t.icon;
            const on = form.type === t.value;
            return (
              <button key={t.value} type="button" aria-pressed={on} onClick={() => set({ type: t.value })}
                className={`flex min-h-[56px] items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors ${on ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${t.tint}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <span className="leading-tight"><span className="block font-extrabold">{t.label}</span><span className="block text-xs text-gray-600 dark:text-gray-400">{t.hint}</span></span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="fb-title" className="field-label">Title</label>
        <input id="fb-title" className="input" maxLength={100} value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="For example: remind me before a milestone is due" {...aria('fb-title')} />
        <FieldError name="fb-title" errors={errors} />
        {similar.length > 0 && (
          <div className="mt-3 rounded-2xl bg-amber-50 p-3 dark:bg-amber-900/20" role="status">
            <p className="text-sm font-extrabold text-amber-900 dark:text-amber-200">Someone may have said this already. If so, add your voice instead.</p>
            <ul className="mt-2 space-y-2">
              {similar.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-xl bg-white p-2.5 dark:bg-gray-800">
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">{s.title}</span>
                  <MeToo item={s} onToggle={async (id) => { const r = await support(id); if (r.success) setSimilar((prev) => prev.map((p) => (p.id === id ? { ...p, supported: r.supported, supportCount: r.supportCount } : p))); else toast.error(r.error); }} compact />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="fb-body" className="field-label">Details</label>
        <textarea id="fb-body" className="input" rows={4} maxLength={1000} value={form.body} onChange={(e) => set({ body: e.target.value })} placeholder="What happened, or what would you like? The more specific, the better." {...aria('fb-body')} />
        <div className="flex justify-between gap-3">
          <FieldError name="fb-body" errors={errors} />
          <span className="mt-1.5 shrink-0 text-xs text-gray-600 dark:text-gray-400">{form.body.length}/1000</span>
        </div>
      </div>

      <label htmlFor="fb-anonymous" className="flex min-h-[44px] items-center gap-3 text-sm">
        <input id="fb-anonymous" type="checkbox" checked={form.anonymous} onChange={(e) => set({ anonymous: e.target.checked })} className="h-5 w-5 rounded border-gray-300 accent-rose-500" />
        <span><span className="font-bold">Hide my name.</span> Other people will see “Anonymous”. Otherwise they see your first name.</span>
      </label>

      <button type="submit" disabled={sending} className="btn btn-primary btn-lg w-full sm:w-auto">{sending ? 'Posting…' : 'Post feedback'}</button>
    </form>
  );
};

const Card = ({ item, canModerate }) => {
  const { toggleSupport, remove, setStatus } = useFeedbackStore();
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState({ status: item.status, response: item.response });
  const [busy, setBusy] = useState(false);
  const type = typeOf(item.type);
  const TypeIcon = type.icon;
  const status = STATUSES.find((s) => s.value === item.status);
  const long = item.body.length > 220;

  const tap = async (id) => { const r = await toggleSupport(id); if (!r.success && r.error) toast.error(r.error); };
  const doRemove = async () => {
    setBusy(true);
    const r = await remove(item.id);
    setBusy(false);
    setConfirming(false);
    if (r.success) toast.success('Removed'); else toast.error(r.error);
  };
  const saveReply = async () => {
    setBusy(true);
    const r = await setStatus(item.id, draft);
    setBusy(false);
    if (r.success) { toast.success('Saved'); setReplying(false); } else toast.error(r.error);
  };

  return (
    <li className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold ${type.tint}`}><TypeIcon className="h-3.5 w-3.5" aria-hidden="true" />{type.label}</span>
        {status?.badge && <span className={`badge ${status.badge}`}>{status.label}</span>}
        <span className="ml-auto text-xs text-gray-600 dark:text-gray-400">{item.mine ? 'You' : item.authorName} · {timeAgo(item.createdAt)}</span>
      </div>

      <h3 className="mt-2 text-lg leading-snug">{item.title}</h3>
      <p className={`mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 ${long && !expanded ? 'line-clamp-3' : ''}`}>{item.body}</p>
      {long && <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-1 inline-flex min-h-[36px] items-center gap-1 text-sm font-bold text-rose-700 dark:text-rose-300">{expanded ? 'Show less' : 'Read more'}<ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" /></button>}

      {item.response && (
        <div className="mt-3 rounded-xl bg-gray-100 px-4 py-3 text-sm dark:bg-gray-700">
          <p className="font-extrabold">From the Twogether team</p>
          <p className="mt-0.5 whitespace-pre-wrap break-words text-gray-700 dark:text-gray-200">{item.response}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <MeToo item={item} onToggle={tap} />
        <span className="text-sm text-gray-600 dark:text-gray-400">{item.supportCount === 1 ? '1 person' : `${item.supportCount} people`} said this</span>
        <span className="flex-1" />
        {canModerate && <button type="button" onClick={() => setReplying((v) => !v)} aria-expanded={replying} className="btn btn-secondary btn-sm">Reply or set status</button>}
        {item.canDelete && <button type="button" onClick={() => setConfirming(true)} className="btn btn-ghost btn-icon" aria-label={`Remove “${item.title}”`}><Trash2 className="h-4 w-4" aria-hidden="true" /></button>}
      </div>

      {replying && (
        <div className="mt-3 space-y-3 rounded-2xl border border-gray-200 p-3 dark:border-gray-600">
          <label className="block text-sm font-bold">Status
            <select className="input mt-1" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-bold">Reply everyone can see
            <textarea className="input mt-1" rows={2} maxLength={500} value={draft.response} onChange={(e) => setDraft({ ...draft, response: e.target.value })} />
          </label>
          <button type="button" disabled={busy} onClick={saveReply} className="btn btn-primary btn-sm">{busy ? 'Saving…' : 'Save'}</button>
        </div>
      )}

      {confirming && <ConfirmModal title="Remove this feedback?" text={`“${item.title}” and everyone's “me too” on it will be gone.`} confirmLabel="Remove" busy={busy} onConfirm={doRemove} onClose={() => setConfirming(false)} />}
    </li>
  );
};

const Feedback = () => {
  const { items, total, hasMore, canModerate, filters, isLoading, error, load, loadMore } = useFeedbackStore();
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState(filters.q);

  useEffect(() => { load({ ...useFeedbackStore.getState().filters }); }, [load]);

  // Search waits for a short pause in typing
  useEffect(() => {
    if (query === filters.q) return undefined;
    const timer = setTimeout(() => load({ ...filters, q: query }), 350);
    return () => clearTimeout(timer);
  }, [query, filters, load]);

  const change = (patch) => load({ ...filters, ...patch });
  const searching = filters.q.trim() || filters.type || filters.mine;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Feedback</h1>
          <p className="page-sub mt-1">Tell us what is not working, or what you would love. See what others said, and add your voice with “Me too”.</p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} aria-expanded={showForm} className="btn btn-primary"><MessageSquarePlus className="h-4 w-4" aria-hidden="true" />{showForm ? 'Close' : 'Share feedback'}</button>
      </header>

      {showForm && <ShareForm onPosted={() => { setShowForm(false); if (filters.sort === 'new' || !searching) load({ ...filters }); }} />}

      <div className="mb-4 space-y-3">
        <label className="relative block">
          <span className="sr-only">Search feedback</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input type="search" className="input pl-12" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search feedback" />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-2xl bg-gray-100 p-1 dark:bg-gray-800" role="group" aria-label="Sort by">
            {[['top', 'Most wanted'], ['new', 'Newest']].map(([value, label]) => (
              <button key={value} type="button" aria-pressed={filters.sort === value} onClick={() => change({ sort: value })}
                className={`min-h-[40px] rounded-xl px-3.5 text-sm font-extrabold ${filters.sort === value ? 'bg-white shadow-sm dark:bg-gray-700' : 'text-gray-600 dark:text-gray-400'}`}>{label}</button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Filter">
            <button type="button" aria-pressed={!filters.type} onClick={() => change({ type: '' })} className={`chip shrink-0 ${!filters.type ? 'chip-on' : ''}`}>All</button>
            {TYPES.map((t) => <button key={t.value} type="button" aria-pressed={filters.type === t.value} onClick={() => change({ type: t.value })} className={`chip shrink-0 ${filters.type === t.value ? 'chip-on' : ''}`}>{t.plural}</button>)}
            <button type="button" aria-pressed={filters.mine} onClick={() => change({ mine: !filters.mine })} className={`chip shrink-0 ${filters.mine ? 'chip-on' : ''}`}>My posts</button>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-800 dark:bg-rose-900/30 dark:text-rose-200">
          {error} <button type="button" className="underline" onClick={() => load({ ...filters })}>Try again</button>
        </div>
      )}

      {isLoading && items.length === 0 && !error && <p className="py-8 text-center text-gray-600 dark:text-gray-400">Loading feedback…</p>}

      {!isLoading && !error && items.length === 0 && (
        <div className="card-soft p-8 text-center">
          <MessageCircle className="mx-auto mb-2 h-8 w-8 text-gray-500" aria-hidden="true" />
          <h2 className="text-lg">{searching ? 'Nothing matches' : 'No feedback yet'}</h2>
          <p className="page-sub mx-auto mt-1 max-w-sm">{searching ? 'Try different words, or share it yourself.' : 'Be the first to share a thought. It helps more than you think.'}</p>
          <button type="button" className="btn btn-primary mt-4" onClick={() => setShowForm(true)}>Share feedback</button>
        </div>
      )}

      {items.length > 0 && (
        <>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400" aria-live="polite">{total} {total === 1 ? 'post' : 'posts'}</p>
          <ul className="space-y-4" aria-label="Feedback">
            {items.map((item) => <Card key={item.id} item={item} canModerate={canModerate} />)}
          </ul>
          {hasMore && <button type="button" onClick={loadMore} disabled={isLoading} className="btn btn-secondary mx-auto mt-5 flex">{isLoading ? 'Loading…' : 'Show more'}</button>}
        </>
      )}
    </div>
  );
};

export default Feedback;
