import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import useTermStore from '../store/termStore';
import useAuthStore from '../store/authStore';
import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';
import { Avatar } from '../components/Avatar';
import { formatLongDate, pretty } from '../utils/format';
import FieldError from '../components/FieldError';
import useFormErrors from '../utils/useFormErrors';

const SEVERITIES = ['minor', 'moderate', 'major', 'severe'];
const idOf = (value) => value?._id ?? value;

const TermDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentTerm, getTerm, agreeTerm, deleteTerm, reportViolation, isLoading } = useTermStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [violationOpen, setViolationOpen] = useState(false);
  const [violation, setViolation] = useState({ description: '', severity: 'minor' });
  const { errors, clear, fail, aria } = useFormErrors();

  useEffect(() => {
    if (id) getTerm(id);
  }, [id, getTerm]);

  const term = currentTerm?._id === id ? currentTerm : null;

  if (!term) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
        {isLoading ? <p className="text-gray-600 dark:text-gray-400">Loading…</p> : (
          <div><h1 className="text-2xl">Agreement not found</h1><Link to="/terms" className="btn btn-primary mt-4">Back to agreements</Link></div>
        )}
      </div>
    );
  }

  const mine = term.agreedBy?.some((a) => idOf(a.user) === user?.id);
  const both = (term.agreedBy?.length ?? 0) >= 2;
  const isCreator = idOf(term.createdBy) === user?.id;

  const agree = async () => {
    const result = await agreeTerm(id, `${user?.firstName} ${user?.lastName}`);
    if (result.success) toast.success('You have agreed to this term!');
    else toast.error(result.error);
  };

  const remove = async () => {
    const result = await deleteTerm(id);
    if (result.success) {
      toast.success('Agreement deleted');
      navigate('/terms');
    } else {
      toast.error(result.error);
      setConfirmDelete(false);
    }
  };

  const report = async () => {
    if (!violation.description.trim()) {
      fail({ 'viol-text': 'Describe what happened.' });
      return;
    }
    const result = await reportViolation(id, violation);
    if (result.success) {
      toast.success('Reported');
      setViolationOpen(false);
      setViolation({ description: '', severity: 'minor' });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <Link to="/terms" className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-bold hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Agreements</Link>

      <header className="mb-6">
        <div className="mb-2 flex flex-wrap gap-2">
          <span className={`badge ${both ? 'badge-ok' : 'badge-warn'}`}>{both ? 'Agreed by both' : pretty(term.status)}</span>
          <span className="badge badge-neutral capitalize">{pretty(term.category)}</span>
          {term.priority && <span className="badge badge-neutral capitalize">{term.priority} priority</span>}
        </div>
        <h1 className="page-title">{term.title}</h1>
        <p className="page-sub mt-1">In <Link to={`/relationships/${idOf(term.relationship)}`} className="font-bold underline">{term.relationship?.title ?? 'this relationship'}</Link>{term.createdBy?.firstName ? ` · written by ${idOf(term.createdBy) === user?.id ? 'you' : term.createdBy.firstName}` : ''}</p>
      </header>

      <section className="card mb-5 p-5">
        <p className="whitespace-pre-wrap text-[16px] leading-relaxed">{term.description}</p>
        {term.expiresAt && <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Review on {formatLongDate(term.expiresAt)}</p>}
      </section>

      <section aria-labelledby="who-h" className="card mb-5 p-5">
        <h2 id="who-h" className="mb-3 text-lg">Who has agreed</h2>
        {term.agreedBy?.length === 0 && <p className="text-gray-600 dark:text-gray-400">Nobody yet.</p>}
        <ul className="space-y-3">
          {term.agreedBy?.map((a) => (
            <li key={idOf(a.user)} className="flex items-center gap-3">
              <Avatar person={a.user} />
              <div className="min-w-0 flex-1 leading-snug">
                <p className="font-extrabold">{idOf(a.user) === user?.id ? 'You' : `${a.user?.firstName ?? ''} ${a.user?.lastName ?? ''}`}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formatLongDate(a.agreedAt)}</p>
              </div>
              <Check className="h-5 w-5 text-green-700 dark:text-green-300" aria-label="Agreed" />
            </li>
          ))}
        </ul>
        {!mine && (
          <button type="button" onClick={agree} className="btn btn-primary btn-lg mt-4 w-full">I agree</button>
        )}
      </section>

      {term.violations?.length > 0 && (
        <section aria-labelledby="viol-h" className="card mb-5 p-5">
          <h2 id="viol-h" className="mb-3 text-lg">Reported</h2>
          <ul className="space-y-3">
            {term.violations.map((v) => (
              <li key={v._id} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                <div className="flex items-center justify-between gap-2"><span className="badge badge-warn capitalize">{v.severity}</span><span className="text-xs text-gray-600 dark:text-gray-400">{formatLongDate(v.reportedAt)}</span></div>
                <p className="mt-2 text-[15px]">{v.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        {both && <button type="button" onClick={() => setViolationOpen(true)} className="btn btn-secondary">Report a problem</button>}
        {isCreator && <button type="button" onClick={() => setConfirmDelete(true)} className="btn btn-danger">Delete agreement</button>}
      </div>

      {confirmDelete && <ConfirmModal title="Delete this agreement?" text="This removes it for both of you. It can't be undone." onConfirm={remove} onClose={() => setConfirmDelete(false)} />}

      {violationOpen && (
        <Modal
          title="Report a problem"
          onClose={() => setViolationOpen(false)}
          footer={<>
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setViolationOpen(false)}>Cancel</button>
            <button type="button" className="btn btn-primary flex-1" onClick={report}>Send report</button>
          </>}
        >
          <label htmlFor="viol-text" className="field-label">What happened?</label>
          <textarea id="viol-text" className="input" {...aria('viol-text')} rows={3} value={violation.description} onChange={(e) => { setViolation({ ...violation, description: e.target.value }); clear('viol-text'); }} />
          <FieldError name="viol-text" errors={errors} />
          <div className="mb-4" />
          <p className="field-label">How serious was it?</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Severity">
            {SEVERITIES.map((s) => <button key={s} type="button" aria-pressed={violation.severity === s} onClick={() => setViolation({ ...violation, severity: s })} className={`chip capitalize ${violation.severity === s ? 'chip-on' : ''}`}>{s}</button>)}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TermDetail;
