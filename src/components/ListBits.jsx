import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';

export const PageHeader = ({ title, subtitle, action }) => (
  <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-sub mt-1">{subtitle}</p>}
    </div>
    {action && (
      <Link to={action.to} className="btn btn-primary"><Plus className="h-4 w-4" aria-hidden="true" />{action.label}</Link>
    )}
  </header>
);

// Search box plus one or more groups of filter chips
export const FilterBar = ({ query, onQuery, placeholder, groups = [] }) => (
  <div className="mb-6 space-y-3">
    <label className="relative block">
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" aria-hidden="true" />
      <input type="search" value={query} onChange={(e) => onQuery(e.target.value)} placeholder={placeholder} className="input pl-12" />
    </label>
    {groups.map((g) => (
      <div key={g.label} className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0" role="group" aria-label={g.label}>
        {g.options.map(([value, label]) => (
          <button key={value} type="button" aria-pressed={g.value === value} onClick={() => g.onChange(value)} className={`chip shrink-0 ${g.value === value ? 'chip-on' : ''}`}>{label}</button>
        ))}
      </div>
    ))}
  </div>
);

export const EmptyState = ({ title, text, action }) => (
  <div className="card-soft p-8 text-center">
    <h2 className="text-lg">{title}</h2>
    <p className="page-sub mx-auto mb-4 mt-1 max-w-sm">{text}</p>
    {action && <Link to={action.to} className="btn btn-primary">{action.label}</Link>}
  </div>
);
