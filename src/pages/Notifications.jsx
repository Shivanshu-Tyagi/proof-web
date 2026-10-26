import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import useNotificationStore from '../store/notificationStore';
import { Avatar } from '../components/Avatar';
import { timeAgo } from '../utils/timeAgo';

// The buttons on a request come from the server as web addresses of the form /relationships/<id>/<action>.
// Those are server actions, not pages, so opening them shows "page not found". Accept and decline are done right here instead.
const REPLY_ACTION = /^\/relationships\/[a-f0-9]{24}\/(accept|decline|accept-type-change|decline-type-change)$/;
const BREAKUP_ACTION = /^\/relationships\/([a-f0-9]{24})\/(confirm-breakup|cancel-breakup-request)$/;
const DONE_TEXT = {
  accept: 'Invitation accepted',
  decline: 'Invitation declined',
  'accept-type-change': 'Change accepted',
  'decline-type-change': 'Change declined',
};

const FILTERS = [
  ['all', 'All'],
  ['needs', 'Needs you'],
  ['unread', 'Unread'],
];

const Notifications = () => {
  const { notifications = [], unreadCount, getNotifications, markAsRead, markAllAsRead, deleteNotification, isLoading } = useNotificationStore();
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(null); // the notification being answered
  const [answered, setAnswered] = useState(() => new Set()); // answered here, so its buttons go away at once

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const needsYou = (n) => n.actionRequired && n.status === 'unread';
  const shown = notifications.filter((n) => {
    if (filter === 'needs') return needsYou(n);
    if (filter === 'unread') return n.status === 'unread';
    return true;
  });
  const needsCount = notifications.filter(needsYou).length;

  const onRead = async (id) => {
    await markAsRead(id);
  };

  const onReadAll = async () => {
    const result = await markAllAsRead();
    if (result?.success) toast.success('All notifications marked as read');
  };

  const reply = async (n, action) => {
    if (busy) return;
    setBusy(n._id);
    try {
      await axios.post(action.url);
      toast.success(DONE_TEXT[action.url.split('/').pop()] ?? 'Done');
      setAnswered((prev) => new Set(prev).add(n._id));
      await markAsRead(n._id);
      getNotifications();
    } catch (error) {
      const status = error.response?.status;
      // 400, 404 or 409 here means the request is no longer open: answered on another page or device, or withdrawn
      const outOfDate = status === 400 || status === 404 || status === 409;
      toast.error(outOfDate ? 'That request has already been answered.' : (error.response?.data?.message ?? 'Could not do that. Please try again.'));
      // Stop offering it
      if (status && status < 500) { setAnswered((prev) => new Set(prev).add(n._id)); getNotifications(); }
    } finally {
      setBusy(null);
    }
  };

  const onDelete = async (id) => {
    const result = await deleteNotification(id);
    if (result?.success) toast.success('Notification deleted');
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Inbox</h1>
          <p className="page-sub mt-1">{unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up.'}</p>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={onReadAll} className="btn btn-secondary"><CheckCheck className="h-4 w-4" aria-hidden="true" />Mark all read</button>
        )}
      </header>

      <div className="mb-4 flex gap-2" role="group" aria-label="Filter">
        {FILTERS.map(([key, label]) => (
          <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={`chip ${filter === key ? 'chip-on' : ''}`}>
            {label}{key === 'needs' && needsCount > 0 && <span className="ml-1.5 opacity-70">{needsCount}</span>}
          </button>
        ))}
      </div>

      {isLoading && notifications.length === 0 && <p className="text-gray-600 dark:text-gray-400">Loading…</p>}

      {!isLoading && shown.length === 0 && (
        <div className="card-soft p-8 text-center">
          <Bell className="mx-auto mb-2 h-8 w-8 text-gray-500" aria-hidden="true" />
          <h2 className="text-lg">{filter === 'all' ? 'Nothing here yet' : 'Nothing in this view'}</h2>
          <p className="page-sub mt-1">Invitations, agreements and milestones show up here.</p>
        </div>
      )}

      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {shown.map((n) => {
          const unread = n.status === 'unread';
          const requested = n.actionRequired && !answered.has(n._id) ? (n.actions ?? []) : [];
          const breakup = requested.map((a) => a.url.match(BREAKUP_ACTION)).find(Boolean);
          // Ending a relationship has its own screen with the full choice, so send people there
          const actions = breakup ? [] : requested;
          const fallback = n.metadata?.relationshipId?._id ? `/relationships/${n.metadata.relationshipId._id}` : null;
          return (
            <li key={n._id} className="flex gap-3 py-4">
              <span className="relative shrink-0">
                {n.sender ? (
                  <Avatar person={n.sender} size="lg" />
                ) : (
                  <span className="avatar h-14 w-14 bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200"><Bell className="h-5 w-5" aria-hidden="true" /></span>
                )}
                {unread && <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-rose-500 dark:border-gray-900" aria-label="Unread" />}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-[15px] leading-snug ${unread ? 'font-extrabold' : 'font-semibold'}`}>{n.title}</p>
                  <span className="shrink-0 text-xs text-gray-600 dark:text-gray-400">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="mt-0.5 text-sm leading-snug text-gray-600 dark:text-gray-400">{n.message}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {actions.map((a, i) => (REPLY_ACTION.test(a.url) ? (
                    <button key={`${a.type}-${i}`} type="button" disabled={busy === n._id} onClick={() => reply(n, a)} className={`btn btn-sm ${i === 0 ? 'btn-primary' : 'btn-secondary'}`}>
                      {busy === n._id ? 'Working…' : a.label}
                    </button>
                  ) : (
                    <Link key={`${a.type}-${i}`} to={a.url} onClick={() => unread && onRead(n._id)} className={`btn btn-sm ${i === 0 ? 'btn-primary' : 'btn-secondary'}`}>{a.label}</Link>
                  )))}
                  {breakup && <Link to={`/relationships/${breakup[1]}`} onClick={() => unread && onRead(n._id)} className="btn btn-primary btn-sm">Review request</Link>}
                  {actions.length === 0 && !breakup && fallback && <Link to={fallback} onClick={() => unread && onRead(n._id)} className="btn btn-secondary btn-sm">Open</Link>}
                  {unread && <button type="button" onClick={() => onRead(n._id)} className="btn btn-ghost btn-sm">Mark read</button>}
                  <button type="button" onClick={() => onDelete(n._id)} className="btn btn-ghost btn-sm" aria-label="Delete notification"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Notifications;
