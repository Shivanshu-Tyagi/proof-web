import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import useMilestoneStore from '../store/milestoneStore';
import { EmptyState, FilterBar, PageHeader } from '../components/ListBits';
import { formatShortDate, pretty } from '../utils/format';
import { relationshipLabel } from '../utils/people';

const STATUSES = [['all', 'All'], ['pending', 'To do'], ['in_progress', 'In progress'], ['completed', 'Completed']];
const DIFFICULTY_CLS = { easy: 'badge-ok', medium: 'badge-warn', hard: 'badge-rose', expert: 'badge-rose' };

const Milestones = () => {
  const { user } = useAuthStore();
  const { milestones = [], getAllMilestones, completeMilestone, isLoading } = useMilestoneStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    getAllMilestones();
  }, [getAllMilestones]);

  const overdue = (m) => m.targetDate && new Date(m.targetDate) < new Date() && m.status !== 'completed';

  const complete = async (id) => {
    const result = await completeMilestone(id);
    if (result.success) toast.success('Milestone completed!');
    else toast.error(result.error);
  };

  const shown = milestones.filter((m) => {
    const text = `${m.title} ${m.description ?? ''}`.toLowerCase();
    return (!query.trim() || text.includes(query.trim().toLowerCase())) && (status === 'all' || m.status === status);
  });

  const stats = [
    { l: 'Total', v: milestones.length },
    { l: 'Completed', v: milestones.filter((m) => m.status === 'completed').length },
    { l: 'In progress', v: milestones.filter((m) => m.status === 'in_progress').length },
    { l: 'Overdue', v: milestones.filter(overdue).length },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <PageHeader title="Milestones" subtitle="Moments worth marking together." action={{ to: '/milestones/create', label: 'New milestone' }} />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="card p-4">
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{s.l}</p>
            <p className="text-2xl font-extrabold tracking-tight">{s.v}</p>
          </div>
        ))}
      </div>

      <FilterBar query={query} onQuery={setQuery} placeholder="Search milestones" groups={[{ label: 'Status', value: status, onChange: setStatus, options: STATUSES }]} />

      {isLoading && milestones.length === 0 && <p className="text-gray-600 dark:text-gray-400">Loading…</p>}
      {!isLoading && shown.length === 0 && (
        <EmptyState
          title={milestones.length === 0 ? 'No milestones yet' : 'Nothing matches'}
          text={milestones.length === 0 ? 'Pick something worth celebrating together.' : 'Try a different search or filter.'}
          action={milestones.length === 0 ? { to: '/milestones/create', label: 'New milestone' } : undefined}
        />
      )}

      <ul className="space-y-3">
        {shown.map((m) => {
          const done = m.status === 'completed';
          return (
            <li key={m._id} className="card flex flex-wrap items-center gap-3 p-4">
              <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${done ? 'bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200' : overdue(m) ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}>
                {done ? <Check className="h-5 w-5" aria-hidden="true" /> : <Clock className="h-5 w-5" aria-hidden="true" />}
              </span>
              <Link to={`/milestones/${m._id}`} className="min-w-0 flex-1 basis-56 leading-snug">
                <p className="text-base font-extrabold hover:underline">{m.title}</p>
                <p className="truncate text-sm text-gray-600 dark:text-gray-400">{relationshipLabel(m.relationship, user?.id)}</p>
                <p className={`text-sm ${overdue(m) ? 'font-bold text-rose-700 dark:text-rose-300' : 'text-gray-600 dark:text-gray-400'}`}>
                  {m.targetDate ? `${overdue(m) ? 'Overdue · ' : 'Due '}${formatShortDate(m.targetDate)}` : 'No date'}
                </p>
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge badge-neutral capitalize">{pretty(m.status)}</span>
                {m.difficulty && <span className={`badge capitalize ${DIFFICULTY_CLS[m.difficulty] ?? 'badge-neutral'}`}>{m.difficulty}{m.rewards?.points ? ` · ${m.rewards.points} pts` : ''}</span>}
                {!done && <button type="button" onClick={() => complete(m._id)} className="btn btn-secondary btn-sm">Mark done</button>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Milestones;
