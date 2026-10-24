import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { debounce } from '../utils/debounce';
import { Avatar } from '../components/Avatar';

const FindSomeone = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null); // null until the first search
  const [loading, setLoading] = useState(false);

  const search = async (text) => {
    if (text.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/auth/search', { params: { q: text.trim() } });
      setResults(response.data.users);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to search users.');
    } finally {
      setLoading(false);
    }
  };

  const debounced = useRef(debounce(search, 350)).current;

  const onChange = (e) => {
    setQuery(e.target.value);
    debounced(e.target.value);
  };

  const invite = (person) => navigate('/relationships/invite', { state: { prefilledPartner: person } });

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <Link to="/relationships" className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-bold hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" />People</Link>
      <h1 className="page-title">Find someone</h1>
      <p className="page-sub mb-6 mt-1">Search by name, username or email. If you know their Registration ID, use Invite instead.</p>

      <form onSubmit={(e) => { e.preventDefault(); search(query); }} role="search" className="relative mb-6">
        <label htmlFor="find-q" className="sr-only">Search people</label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" aria-hidden="true" />
        <input id="find-q" type="search" value={query} onChange={onChange} placeholder="Start typing a name" className="input pl-12" autoComplete="off" />
      </form>

      {loading && <p className="text-gray-600 dark:text-gray-400">Searching…</p>}

      {!loading && results && results.length === 0 && (
        <div className="card-soft p-8 text-center">
          <h2 className="text-lg">No one found</h2>
          <p className="page-sub mt-1">Check the spelling, or invite them by email.</p>
          <Link to="/relationships/invite" className="btn btn-primary mt-4">Invite by email</Link>
        </div>
      )}

      <ul className="space-y-3">
        {results?.map((p) => (
          <li key={p._id} className="card flex items-center gap-3 p-4">
            <Avatar person={p} size="lg" />
            <div className="min-w-0 flex-1 leading-snug">
              <p className="truncate font-extrabold">{p.firstName} {p.lastName}</p>
              <p className="truncate text-sm text-gray-600 dark:text-gray-400">@{p.username}</p>
            </div>
            <button type="button" onClick={() => invite(p)} className="btn btn-primary btn-sm"><UserPlus className="h-4 w-4" aria-hidden="true" />Invite</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FindSomeone;
