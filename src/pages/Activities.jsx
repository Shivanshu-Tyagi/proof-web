import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useActivityStore from '../store/activityStore';
import { EmptyState, FilterBar, PageHeader } from '../components/ListBits';
import { formatShortDate, pretty } from '../utils/format';
import { relationshipLabel } from '../utils/people';

const TYPES = ['conversation', 'date', 'gift', 'achievement', 'conflict', 'resolution', 'milestone', 'memory', 'goal', 'other'];
const MOOD_LABELS = { very_positive: 'Great', positive: 'Good', neutral: 'Okay', negative: 'Rough', very_negative: 'Hard' };
const MOOD_CLS = { very_positive: 'badge-ok', positive: 'badge-ok', neutral: 'badge-neutral', negative: 'badge-warn', very_negative: 'badge-rose' };

const Activities = () => {
  const { user } = useAuthStore();
  const { activities = [], getAllActivities, isLoading } = useActivityStore();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');

  useEffect(() => {
    getAllActivities();
  }, [getAllActivities]);

  const shown = activities.filter((a) => {
    const text = `${a.title} ${a.description ?? ''}`.toLowerCase();
    return (!query.trim() || text.includes(query.trim().toLowerCase())) && (type === 'all' || a.type === type);
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <PageHeader title="Moments" subtitle="Memories and plans you have shared." action={{ to: '/activities/create', label: 'Add a moment' }} />
      <FilterBar query={query} onQuery={setQuery} placeholder="Search moments" groups={[{ label: 'Kind', value: type, onChange: setType, options: [['all', 'All'], ...TYPES.map((t) => [t, pretty(t)])] }]} />

      {isLoading && activities.length === 0 && <p className="text-gray-600 dark:text-gray-400">Loading…</p>}
      {!isLoading && shown.length === 0 && (
        <EmptyState
          title={activities.length === 0 ? 'No moments yet' : 'Nothing matches'}
          text={activities.length === 0 ? 'Add a memory, a plan or something you did together.' : 'Try a different search or kind.'}
          action={activities.length === 0 ? { to: '/activities/create', label: 'Add a moment' } : undefined}
        />
      )}

      <ul className="space-y-3">
        {shown.map((a) => (
          <li key={a._id}>
            <Link to={`/activities/${a._id}`} className="card block p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 leading-snug">
                  <p className="text-base font-extrabold">{a.title}</p>
                  <p className="truncate text-sm text-gray-600 dark:text-gray-400">{relationshipLabel(a.relationship, user?.id)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="badge badge-neutral capitalize">{a.type}</span>
                  {a.mood && <span className={`badge ${MOOD_CLS[a.mood] ?? 'badge-neutral'}`}>{MOOD_LABELS[a.mood] ?? pretty(a.mood)}</span>}
                </div>
              </div>
              {a.description && <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">{a.description}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                <span>{a.createdBy?.firstName ? `by ${a.createdBy.firstName} · ` : ''}{formatShortDate(a.createdAt)}</span>
                {a.location?.name && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{a.location.name}</span>}
                {(a.comments?.length ?? 0) > 0 && <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />{a.comments.length}</span>}
                {(a.reactions?.length ?? 0) > 0 && <span>{a.reactions.length} {a.reactions.length === 1 ? 'reaction' : 'reactions'}</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Activities;
