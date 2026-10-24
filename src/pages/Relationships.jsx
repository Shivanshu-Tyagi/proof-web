import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import useRelationshipStore from '../store/relationshipStore';
import Scene from '../components/Scene';
import { AvatarPair } from '../components/Avatar';
import EndRelationshipModal from '../components/EndRelationshipModal';
import { statusMeta, typeLabel } from '../utils/relationships';
import { otherPerson } from '../utils/people';

const idOf = (value) => value?._id ?? value;

const Relationships = () => {
  const { user } = useAuthStore();
  const { relationships = [], getRelationships, acceptRelationship, declineRelationship, isLoading } = useRelationshipStore();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [ending, setEnding] = useState(null); // { relationship, mode }

  useEffect(() => {
    getRelationships();
  }, [getRelationships]);

  const isInvitee = (r) => r.status === 'pending' && r.partner?._id === user?.id;

  const counts = useMemo(() => ({
    all: relationships.filter((r) => r.status !== 'declined').length,
    active: relationships.filter((r) => r.status === 'active').length,
    invitations: relationships.filter(isInvitee).length,
    sent: relationships.filter((r) => r.status === 'pending' && !isInvitee(r)).length,
    ending: relationships.filter((r) => r.status === 'requested_breakup').length,
    ended: relationships.filter((r) => r.status === 'ended').length,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [relationships, user?.id]);

  const matches = (r) => {
    if (filter === 'active' && r.status !== 'active') return false;
    if (filter === 'invitations' && !isInvitee(r)) return false;
    if (filter === 'sent' && !(r.status === 'pending' && !isInvitee(r))) return false;
    if (filter === 'ending' && r.status !== 'requested_breakup') return false;
    if (filter === 'ended' && r.status !== 'ended') return false;
    if (filter === 'all' && r.status === 'declined') return false;
    if (!query.trim()) return true;
    const other = otherPerson(r, user?.id);
    const hay = `${r.title} ${other?.firstName ?? ''} ${other?.lastName ?? ''} ${other?.username ?? ''}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  };

  const list = relationships.filter(matches);
  const invitations = list.filter(isInvitee);
  const rest = list.filter((r) => !isInvitee(r));

  const respond = async (id, accept) => {
    const result = accept ? await acceptRelationship(id) : await declineRelationship(id);
    if (result?.success) {
      toast.success(accept ? 'Relationship accepted successfully!' : 'Relationship declined');
    } else {
      toast.error(result?.error || 'Something went wrong');
    }
  };

  const FILTERS = [
    ['all', 'All'], ['active', 'Active'], ['invitations', 'Invitations'], ['sent', 'Sent'], ['ending', 'Ending'], ['ended', 'Ended'],
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="page-title">People</h1>
          <p className="page-sub mt-1">Every relationship you keep a record of.</p>
        </div>
        <Link to="/relationships/invite" className="btn btn-primary"><Plus className="h-4 w-4" aria-hidden="true" />Invite</Link>
      </header>

      <label className="relative mb-4 block">
        <span className="sr-only">Search relationships</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" aria-hidden="true" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or title" className="input pl-12" />
      </label>

      <div className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0" role="group" aria-label="Filter by status">
        {FILTERS.map(([key, label]) => (
          <button key={key} type="button" onClick={() => setFilter(key)} aria-pressed={filter === key} className={`chip shrink-0 ${filter === key ? 'chip-on' : ''}`}>
            {label} <span className="ml-1.5 opacity-70">{counts[key]}</span>
          </button>
        ))}
      </div>

      {isLoading && relationships.length === 0 && <p className="text-gray-600 dark:text-gray-400">Loading…</p>}

      {invitations.length > 0 && (
        <section aria-labelledby="inv-h" className="mb-8 space-y-3">
          <h2 id="inv-h" className="eyebrow">Invitations</h2>
          {invitations.map((r) => {
            const other = otherPerson(r, user?.id);
            return (
              <div key={r._id} className="rounded-[20px] border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-900/20">
                <div className="flex items-center gap-3">
                  <AvatarPair people={[other]} size="lg" />
                  <div className="min-w-0 leading-snug">
                    <p className="text-lg font-extrabold">{r.title}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{other?.firstName} invited you as {typeLabel(r.type).toLowerCase()}</p>
                  </div>
                </div>
                {r.description && <p className="mt-3 text-[15px] leading-relaxed">&ldquo;{r.description}&rdquo;</p>}
                <div className="mt-4 flex gap-3">
                  <button type="button" onClick={() => respond(r._id, true)} className="btn btn-primary flex-1">Accept</button>
                  <button type="button" onClick={() => respond(r._id, false)} className="btn btn-secondary flex-1">Decline</button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {rest.length > 0 && (
        <section aria-label="Relationships" className="space-y-3">
          {invitations.length > 0 && <h2 className="eyebrow">Everything else</h2>}
          {rest.map((r) => {
            const other = otherPerson(r, user?.id);
            const status = statusMeta(r.status);
            const requestedByMe = idOf(r.breakupRequestedBy) === user?.id;
            const note =
              r.status === 'requested_breakup'
                ? requestedByMe ? `Waiting for ${other?.firstName} to confirm` : `${other?.firstName} asked to end this`
                : r.status === 'pending' ? `Waiting for ${other?.firstName} to accept` : null;
            return (
              <article key={r._id} className="card p-4">
                <Link to={`/relationships/${r._id}`} className="group flex items-center gap-4">
                  <Scene seed={r._id} className="h-16 w-16 shrink-0 rounded-2xl" />
                  <div className="min-w-0 flex-1 leading-snug">
                    <p className="truncate text-base font-extrabold group-hover:underline">{r.title}</p>
                    <p className="truncate text-sm text-gray-600 dark:text-gray-400">with {other?.firstName} {other?.lastName} · {typeLabel(r.type)}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className={`badge ${status.cls}`}>{status.label}</span>
                      {note && <span className="text-xs text-gray-600 dark:text-gray-400">{note}</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-gray-500 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" />
                </Link>
                {r.status === 'requested_breakup' && (
                  <div className="mt-3 flex gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                    {requestedByMe ? (
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEnding({ relationship: r, mode: 'cancel' })}>Withdraw request</button>
                    ) : (
                      <button type="button" className="btn btn-dark btn-sm" onClick={() => setEnding({ relationship: r, mode: 'confirm' })}>Review request</button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {!isLoading && list.length === 0 && (
        <div className="card-soft p-8 text-center">
          <h2 className="text-xl">{relationships.length === 0 ? 'No relationships yet' : 'Nothing matches'}</h2>
          <p className="page-sub mx-auto mb-4 mt-1 max-w-sm">
            {relationships.length === 0 ? 'Invite someone to start your first shared record.' : 'Try a different filter or search.'}
          </p>
          {relationships.length === 0 && <Link to="/relationships/invite" className="btn btn-primary btn-lg">Invite someone</Link>}
        </div>
      )}

      {ending && (
        <EndRelationshipModal
          relationship={ending.relationship}
          other={otherPerson(ending.relationship, user?.id)}
          mode={ending.mode}
          onClose={() => setEnding(null)}
        />
      )}
    </div>
  );
};

export default Relationships;
