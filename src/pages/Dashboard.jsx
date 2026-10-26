import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight, Clock, Lock, Plus, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import ShareLink from '../components/ShareLink';
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
  // Nothing yet: the page becomes a short guide instead of a list of empty boxes
  const isNew = !isLoading && relationships.length === 0;

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
              : isNew ? 'Welcome to Twogether. Three steps and you are set up.' : 'You are all caught up.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/relationships/invite" className="btn btn-primary"><Plus className="h-4 w-4" aria-hidden="true" />Invite someone</Link>
        </div>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
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
              <div className="card p-5 sm:p-6">
                <h3 className="text-xl">Get started in three steps</h3>
                <ol className="mt-4 space-y-5">
                  <li className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500 font-extrabold text-white" aria-hidden="true">1</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold">Send your invite link to someone you trust</p>
                      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">They open it, create an account in about a minute, and send you a request.</p>
                      <ShareLink user={user} />
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 font-extrabold text-gray-700 dark:bg-gray-700 dark:text-gray-200" aria-hidden="true">2</span>
                    <div>
                      <p className="font-extrabold">Accept their request</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">It appears here under “Needs you”. Or invite someone yourself with their Registration ID or email.</p>
                      <Link to="/relationships/invite" className="mt-2 inline-flex min-h-[44px] items-center text-sm font-bold text-rose-700 underline dark:text-rose-300">Invite someone directly</Link>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 font-extrabold text-gray-700 dark:bg-gray-700 dark:text-gray-200" aria-hidden="true">3</span>
                    <div>
                      <p className="font-extrabold">Write your first agreement together</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Something you both expect, like “call every Sunday”. It counts once you both tap Agree.</p>
                    </div>
                  </li>
                </ol>
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
          {!isNew && user?.registrationId && (
            <section aria-label="Invite link" className="card p-5">
              <p className="eyebrow mb-3">Invite someone</p>
              <ShareLink user={user} />
            </section>
          )}

          <section aria-label="Shortcuts" className="card p-5">
            <h2 className="mb-3 text-base">Shortcuts</h2>
            <ul className="space-y-1">
              {[
                { to: '/certificates', label: 'Certificates' },
                { to: '/feedback', label: 'Give feedback' },
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
