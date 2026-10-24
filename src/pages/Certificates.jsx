import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, Search, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import useCertificateStore from '../store/certificateStore';
import CertificateArt from '../components/CertificateArt';
import { LEVEL_LABELS, formatDate, namesOf } from '../utils/certificates';

const LEVELS = ['all', 'bronze', 'silver', 'gold', 'platinum', 'diamond'];

const Certificates = () => {
  const { certificates = [], fetchAllCertificates, downloadCertificate, isLoading } = useCertificateStore();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');

  useEffect(() => {
    fetchAllCertificates();
  }, [fetchAllCertificates]);

  const shown = certificates.filter((c) => {
    const text = `${c.title} ${c.description ?? ''} ${namesOf(c).join(' ')}`.toLowerCase();
    return (!query.trim() || text.includes(query.trim().toLowerCase())) && (level === 'all' || c.level === level);
  });

  const download = async (id) => {
    const result = await downloadCertificate(id);
    if (!result.success) toast.error(result.error || 'Failed to download certificate.');
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <header className="mb-5">
        <h1 className="page-title">Certificates</h1>
        <p className="page-sub mt-1">Proof of what you agreed together. Share one with a public verify link.</p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search certificates</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title or name" className="input pl-12" />
        </label>
        <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Filter by level">
          {LEVELS.map((l) => (
            <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)} className={`chip shrink-0 ${level === l ? 'chip-on' : ''}`}>{l === 'all' ? 'All' : LEVEL_LABELS[l]}</button>
          ))}
        </div>
      </div>

      {isLoading && certificates.length === 0 && <p className="text-gray-600 dark:text-gray-400">Loading…</p>}

      {!isLoading && shown.length === 0 && (
        <div className="card-soft p-8 text-center">
          <Award className="mx-auto mb-2 h-8 w-8 text-gray-500" aria-hidden="true" />
          <h2 className="text-lg">{certificates.length === 0 ? 'No certificates yet' : 'Nothing matches'}</h2>
          <p className="page-sub mx-auto mb-4 mt-1 max-w-sm">
            {certificates.length === 0 ? 'Open an active relationship and generate one when you are ready.' : 'Try a different search or level.'}
          </p>
          {certificates.length === 0 && <Link to="/relationships" className="btn btn-primary">Go to people</Link>}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <article key={c._id} className="card overflow-hidden">
            <Link to={`/certificates/${c._id}/display`} className="block">
              <CertificateArt id={c._id} alt={`${LEVEL_LABELS[c.level] ?? 'Bronze'} level certificate for ${namesOf(c).join(' and ')}`} className="rounded-none shadow-none ring-0" />
              <div className="p-4">
                <h2 className="text-base leading-snug hover:underline">{namesOf(c).join(' & ') || c.title}</h2>
                <p className="mt-0.5 line-clamp-1 text-sm text-gray-600 dark:text-gray-400">{c.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="badge badge-neutral gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />{LEVEL_LABELS[c.level] ?? 'Bronze'}</span>
                  {c.sharing?.isPublic && <span className="badge badge-ok">Link on</span>}
                  <span className="text-xs text-gray-600 dark:text-gray-400">Issued {formatDate(c.createdAt)}</span>
                </div>
              </div>
            </Link>
            <div className="flex gap-2 border-t border-gray-200 p-3 dark:border-gray-700">
              <Link to={`/certificates/${c._id}/display`} className="btn btn-secondary btn-sm flex-1">Open</Link>
              <button type="button" onClick={() => download(c._id)} className="btn btn-secondary btn-sm flex-1"><Download className="h-4 w-4" aria-hidden="true" />Download</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Certificates;
