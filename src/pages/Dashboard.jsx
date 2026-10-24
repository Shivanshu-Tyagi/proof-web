import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight, Clock, Copy, Lock, Plus, Search, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import useRelationshipStore from '../store/relationshipStore';
import Scene from '../components/Scene';
import { AvatarPair } from '../components/Avatar';
import { attentionItems, greeting, statusMeta, typeLabel } from '../utils/relationships';
import { otherPerson } from '../utils/people';

const KIND_ICON = { invite: Users, type: Clock, end: Clock, history: Lock };
const KIND_TINT = {
  invite: 'bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200',
  type: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200',
  end: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
  history: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const { relationships = [], getRelationships, acceptRelationship, declineRelationship, isLoading } = useRelationshipStore();

  useEffect(() => {
    getRelationships();
  }, [getRelationships]);

  const needs = attentionItems(relationships, user?.id);
  const visible = relationships.filter((r) => ['active', 'pending', 'requested_breakup'].includes(r.status));

  const handleCopyRegistrationId = async () => {
    if (!user?.registrationId) return;
    try {
      await navigator.clipboard.writeText(user.registrationId);
      toast.success('Registration ID copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy Registration ID.');
      console.error('Failed to copy: ', err);
    }
  };

  const respondToInvite = async (id, accept) => {
    const result = accept ? await acceptRelationship(id) : await declineRelationship(id);
    if (result?.success) {
      toast.success(accept ? 'Invitation accepted' : 'Invitation declined');
      getRelationships();
    } else if (result?.error) {
      toast.error(result.error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">{greeting()}, {user?.firstName}</h1>
          <p className="page-sub mt-1">
            {needs.length > 0
              ? `${needs.length} ${needs.length === 1 ? 'thing needs' : 'things need'} you. Everything else is up to date.`
              : 'You are all caught up.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/find-someone" className="btn btn-secondary"><Search className="h-4 w-4" aria-hidden="true" />Find someone</Link>
          <Link to="/relationships/invite" className="btn btn-primary"><Plus className="h-4 w-4" aria-hidden="true" />Invite someone</Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-8">
          {needs.length > 0 && (
            <section aria-labelledby="needs-heading">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 id="needs-heading" className="text-xl">Needs you</h2>
                <span className="text-sm font-bold text-rose-700 dark:text-rose-300">{needs.length} open</span>
              </div>
              <ul className="space-y-3">
                {needs.map((n) => {
                  const Icon = KIND_ICON[n.kind] ?? Bell;
                  return (
                    <li key={n.key} className="card flex flex-wrap items-center gap-3 p-4">
                      <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${KIND_TINT[n.kind]}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1 basis-48">
                        <p className="font-extrabold leading-snug">{n.title}</p>
                        <p className="truncate text-sm text-gray-600 dark:text-gray-400">{n.sub}</p>
                      </div>
                      {n.kind === 'invite' ? (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => respondToInvite(n.relationship._id, true)} className="btn btn-primary">Accept</button>
                          <button type="button" onClick={() => respondToInvite(n.relationship._id, false)} className="btn btn-secondary">Decline</button>
                        </div>
                      ) : (
                        <Link to={`/relationships/${n.relationship._id}`} className="btn btn-dark">Review</Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section aria-labelledby="rel-heading">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 id="rel-heading" className="text-xl">Your relationships</h2>
              {visible.length > 0 && (
                <Link to="/relationships" className="inline-flex min-h-[44px] items-center gap-1 text-sm font-bold hover:underline">
                  See all <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>

            {isLoading && visible.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Loading…</p>
            ) : visible.length === 0 ? (
              <div className="card overflow-hidden">
                <Scene seed="empty" className="h-40" />
                <div className="p-6">
                  <h3 className="text-xl">Start with one person</h3>
                  <p className="page-sub mb-4 mt-1">Invite a friend, family member or partner. You agree on what matters, and both confirm it.</p>
                  <Link to="/relationships/invite" className="btn btn-primary btn-lg">Invite someone</Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visible.slice(0, 6).map((r) => {
                  const other = otherPerson(r, user?.id);
                  const status = statusMeta(r.status);
                  return (
                    <Link key={r._id} to={`/relationships/${r._id}`} className="group block">
                      <Scene seed={r._id} className="h-40 rounded-[20px]">
                        <span className={`badge ${status.cls} absolute left-3 top-3 bg-white text-gray-900`}>{status.label}</span>
                      </Scene>
                      <div className="mt-3 flex items-center gap-3">
                        <AvatarPair people={[user, other]} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-extrabold group-hover:underline">{r.title}</p>
                          <p className="truncate text-sm text-gray-600 dark:text-gray-400">with {other?.firstName} · {typeLabel(r.type)}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          {user?.registrationId && (
            <section aria-label="Registration ID" className="card p-5">
              <p className="eyebrow">Your Registration ID</p>
              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-gray-50 py-2 pl-4 pr-2 dark:bg-gray-900">
                <span className="mono text-lg">{user.registrationId}</span>
                <button type="button" onClick={handleCopyRegistrationId} title="Copy Registration ID" aria-label="Copy Registration ID" className="btn btn-secondary btn-icon">
                  <Copy className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">Share it so someone can invite you without needing your email.</p>
            </section>
          )}

          <section aria-label="Shortcuts" className="card p-5">
            <h2 className="mb-3 text-base">Shortcuts</h2>
            <ul className="space-y-1">
              {[
                { to: '/milestones/create', label: 'New milestone' },
                { to: '/terms/create', label: 'New agreement' },
                { to: '/activities/create', label: 'Add a moment' },
              ].map((s) => (
                <li key={s.to}>
                  <Link to={s.to} className="flex min-h-[44px] items-center justify-between rounded-lg px-2 text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700">
                    {s.label}<ChevronRight className="h-4 w-4 text-gray-500" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
