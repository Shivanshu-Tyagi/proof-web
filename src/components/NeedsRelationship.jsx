import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';

// Shown instead of a form that cannot work yet
const NeedsRelationship = ({ back, backLabel, what }) => (
  <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
    <Link to={back} className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-bold hover:underline">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />{backLabel}
    </Link>
    <div className="card p-6 text-center sm:p-8">
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200"><UserPlus className="h-6 w-6" aria-hidden="true" /></span>
      <h1 className="text-2xl">First, connect with someone</h1>
      <p className="page-sub mx-auto mt-2 max-w-md">{what} always belongs to a relationship between two people. Invite someone, and once they accept you can add it together.</p>
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <Link to="/relationships/invite" className="btn btn-primary btn-lg">Invite someone</Link>
        <Link to="/relationships" className="btn btn-secondary btn-lg">See my invitations</Link>
      </div>
    </div>
  </div>
);

export default NeedsRelationship;
