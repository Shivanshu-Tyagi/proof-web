import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import useTermStore from '../store/termStore';
import { EmptyState, FilterBar, PageHeader } from '../components/ListBits';
import { pretty } from '../utils/format';
import { relationshipLabel } from '../utils/people';

const STATUSES = [['all', 'All'], ['proposed', 'Proposed'], ['agreed', 'Agreed'], ['rejected', 'Rejected']];
const CATEGORIES = ['communication', 'boundaries', 'expectations', 'goals', 'activities', 'conflict_resolution', 'commitment', 'other'];
const PRIORITY_CLS = { low: 'badge-ok', medium: 'badge-warn', high: 'badge-rose', critical: 'badge-rose' };

const idOf = (value) => value?._id ?? value;

const Terms = () => {
  const { user } = useAuthStore();
  const { terms = [], getAllTerms, agreeTerm, isLoading } = useTermStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    getAllTerms();
  }, [getAllTerms]);

  const agree = async (id) => {
    const result = await agreeTerm(id);
    if (result.success) toast.success('You agreed');
    else toast.error(result.error);
  };

  const shown = terms.filter((t) => {
    const text = `${t.title} ${t.description ?? ''}`.toLowerCase();
    return (!query.trim() || text.includes(query.trim().toLowerCase()))
      && (status === 'all' || t.status === status)
      && (category === 'all' || t.category === category);
  });
  const needsMe = terms.filter((t) => !t.agreedBy?.some((a) => idOf(a.user) === user?.id) && t.status !== 'rejected').length;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <PageHeader
        title="Agreements"
        subtitle={needsMe > 0 ? `${needsMe} ${needsMe === 1 ? 'agreement needs' : 'agreements need'} your answer.` : 'What you and the people you trust have agreed.'}
        action={{ to: '/terms/create', label: 'New agreement' }}
      />
      <FilterBar
        query={query}
        onQuery={setQuery}
        placeholder="Search agreements"
        groups={[
          { label: 'Status', value: status, onChange: setStatus, options: STATUSES },
          { label: 'Category', value: category, onChange: setCategory, options: [['all', 'Any category'], ...CATEGORIES.map((c) => [c, pretty(c)])] },
        ]}
      />

      {isLoading && terms.length === 0 && <p className="text-gray-600 dark:text-gray-400">Loading…</p>}
      {!isLoading && shown.length === 0 && (
        <EmptyState
          title={terms.length === 0 ? 'No agreements yet' : 'Nothing matches'}
          text={terms.length === 0 ? 'Write down what you both expect from each other.' : 'Try a different search or filter.'}
          action={terms.length === 0 ? { to: '/terms/create', label: 'New agreement' } : undefined}
        />
      )}

      <ul className="space-y-3">
        {shown.map((t) => {
          const mine = t.agreedBy?.some((a) => idOf(a.user) === user?.id);
          const count = t.agreedBy?.length ?? 0;
          return (
            <li key={t._id} className="card flex flex-wrap items-center gap-3 p-4">
              <Link to={`/terms/${t._id}`} className="min-w-0 flex-1 basis-60 leading-snug">
                <p className="text-base font-extrabold hover:underline">{t.title}</p>
                <p className="truncate text-sm text-gray-600 dark:text-gray-400">{relationshipLabel(t.relationship, user?.id)} · <span className="capitalize">{pretty(t.category)}</span></p>
                <p className="mt-1 line-clamp-1 text-sm text-gray-700 dark:text-gray-300">{t.description}</p>
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                {t.priority && <span className={`badge ${PRIORITY_CLS[t.priority] ?? 'badge-neutral'} capitalize`}>{t.priority}</span>}
                <span className={`badge ${count >= 2 ? 'badge-ok' : mine ? 'badge-warn' : 'badge-rose'}`}><Users className="mr-1 h-3.5 w-3.5" aria-hidden="true" />{count >= 2 ? 'Agreed by both' : mine ? 'Waiting for them' : 'Needs you'}</span>
                {!mine && t.status !== 'rejected' && <button type="button" onClick={() => agree(t._id)} className="btn btn-primary btn-sm">Agree</button>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Terms;
