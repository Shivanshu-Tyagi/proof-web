import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Heart, Lock, UserCheck, UserX } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import { Avatar } from '../components/Avatar';
import { typeLabel } from '../utils/relationships';

const EVENTS = {
  created: { label: 'Started', icon: Heart, tone: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' },
  accepted: { label: 'Accepted', icon: UserCheck, tone: 'bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200' },
  declined: { label: 'Declined', icon: UserX, tone: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' },
  updated: { label: 'Updated', icon: Clock, tone: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' },
  breakup_requested: { label: 'Ending requested', icon: Clock, tone: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200' },
  breakup_request_canceled: { label: 'Ending request withdrawn', icon: Clock, tone: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' },
  breakup_confirmed: { label: 'Ended', icon: UserX, tone: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' },
  ended: { label: 'Ended', icon: UserX, tone: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' },
  rekindled: { label: 'Started again', icon: Heart, tone: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' },
};

const monthKey = (value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
const dayLabel = (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const History = () => {
  const { userId } = useParams();
  const { user: me } = useAuthStore();
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    api.get(`/relationships/history/${userId}`)
      .then((res) => { if (!cancelled) setState({ status: 'ready', ...res.data }); })
      .catch((err) => { if (!cancelled) setState({ status: 'error', error: err.response?.data?.message || 'Failed to load history' }); });
    return () => { cancelled = true; };
  }, [userId]);

  const groups = useMemo(() => {
    const map = new Map();
    (state.history ?? []).forEach((event) => {
      const key = monthKey(event.eventDate);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(event);
    });
    return [...map.entries()];
  }, [state.history]);

  const isSelf = state.access?.self;
  const owner = state.user;
  const expires = state.access?.expiresAt
    ? new Date(state.access.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <Link to="/relationships" className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-bold hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" />People</Link>

      {state.status === 'loading' && <p className="text-gray-600 dark:text-gray-400">Loading history…</p>}

      {state.status === 'error' && (
        <div className="card-soft p-8 text-center">
          <Lock className="mx-auto mb-2 h-8 w-8 text-gray-500" aria-hidden="true" />
          <h1 className="text-xl">{state.error}</h1>
          <p className="page-sub mx-auto mt-2 max-w-sm">History is private until the person it belongs to allows it. You can ask from a relationship you share with them.</p>
          <Link to="/relationships" className="btn btn-primary mt-4">Back to people</Link>
        </div>
      )}

      {state.status === 'ready' && (
        <>
          <header className="mb-6 flex items-center gap-4">
            <Avatar person={owner} size="xl" />
            <div className="min-w-0">
              <h1 className="text-2xl leading-tight md:text-3xl">{isSelf || owner?._id === me?.id ? 'Your history' : `${owner?.firstName}'s history`}</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {isSelf ? 'Only you can see this page.' : expires ? `${owner?.firstName} is letting you see this until ${expires}.` : `${owner?.firstName} is letting you see this until they stop it.`}
              </p>
            </div>
          </header>

          <p className="card-soft mb-6 flex items-start gap-2 p-4 text-sm leading-relaxed">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>This shows titles, types and dates only. Other people in these relationships appear as &ldquo;Someone&rdquo;, and notes and details stay private.</span>
          </p>

          {groups.length === 0 && (
            <div className="card-soft p-8 text-center">
              <h2 className="text-lg">No history yet</h2>
              <p className="page-sub mt-1">New relationships and changes will show up here.</p>
            </div>
          )}

          {groups.map(([month, events]) => (
            <section key={month} aria-label={month} className="mb-8">
              <h2 className="eyebrow mb-3">{month}</h2>
              <ol className="space-y-3">
                {events.map((event) => {
                  const meta = EVENTS[event.eventType] ?? { label: event.eventType, icon: Clock, tone: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' };
                  const Icon = meta.icon;
                  return (
                    <li key={event._id} className="card flex items-center gap-3 p-4">
                      <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.tone}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                      <div className="min-w-0 flex-1 leading-snug">
                        <p className="font-extrabold">{meta.label}{event.relationship?.title ? ` · ${event.relationship.title}` : ''}</p>
                        <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                          {event.relationship?.type ? `${typeLabel(event.relationship.type)} · ` : ''}
                          {event.actor ?? 'Someone'}{event.targetUser ? ` and ${event.targetUser}` : ''}
                        </p>
                      </div>
                      <time dateTime={event.eventDate} className="shrink-0 text-sm text-gray-600 dark:text-gray-400">{dayLabel(event.eventDate)}</time>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </>
      )}
    </div>
  );
};

export default History;
