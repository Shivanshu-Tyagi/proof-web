import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, FileText, Image, Link as LinkIcon, Video } from 'lucide-react';
import { toast } from 'react-toastify';
import useMilestoneStore from '../store/milestoneStore';
import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';
import { formatLongDate, pretty } from '../utils/format';

const EVIDENCE_TYPES = ['note', 'photo', 'video', 'document', 'link'];
const EVIDENCE_ICON = { photo: Image, video: Video, document: FileText, link: LinkIcon, note: FileText };
const idOf = (value) => value?._id ?? value;

const MilestoneDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentMilestone, getMilestone, completeMilestone, deleteMilestone, addEvidence, isLoading } = useMilestoneStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evidence, setEvidence] = useState({ type: 'note', url: '', description: '' });

  useEffect(() => {
    if (id) getMilestone(id);
  }, [id, getMilestone]);

  const milestone = currentMilestone?._id === id ? currentMilestone : null;

  if (!milestone) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
        {isLoading ? <p className="text-gray-600 dark:text-gray-400">Loading…</p> : (
          <div><h1 className="text-2xl">Milestone not found</h1><Link to="/milestones" className="btn btn-primary mt-4">Back to milestones</Link></div>
        )}
      </div>
    );
  }

  const done = milestone.status === 'completed';
  const overdue = milestone.targetDate && !done && new Date(milestone.targetDate) < new Date();

  const complete = async () => {
    const result = await completeMilestone(id);
    if (result.success) toast.success('Milestone completed!');
    else toast.error(result.error);
  };

  const remove = async () => {
    const result = await deleteMilestone(id);
    if (result.success) {
      toast.success('Milestone deleted');
      navigate('/milestones');
    } else {
      toast.error(result.error);
      setConfirmDelete(false);
    }
  };

  const submitEvidence = async () => {
    const result = await addEvidence(id, evidence);
    if (result.success) {
      toast.success('Evidence added');
      setEvidenceOpen(false);
      setEvidence({ type: 'note', url: '', description: '' });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <Link to="/milestones" className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-bold hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Milestones</Link>

      <header className="mb-6">
        <div className="mb-2 flex flex-wrap gap-2">
          <span className={`badge ${done ? 'badge-ok' : overdue ? 'badge-rose' : 'badge-warn'}`}>{done ? 'Completed' : overdue ? 'Overdue' : pretty(milestone.status)}</span>
          <span className="badge badge-neutral capitalize">{pretty(milestone.category)}</span>
          {milestone.difficulty && <span className="badge badge-neutral capitalize">{milestone.difficulty}</span>}
        </div>
        <h1 className="page-title">{milestone.title}</h1>
        <p className="page-sub mt-1">In <Link to={`/relationships/${idOf(milestone.relationship)}`} className="font-bold underline">{milestone.relationship?.title ?? 'this relationship'}</Link></p>
      </header>

      {milestone.description && <section className="card mb-5 p-5"><p className="whitespace-pre-wrap text-[16px] leading-relaxed">{milestone.description}</p></section>}

      <section aria-label="Details" className="card mb-5 divide-y divide-gray-200 dark:divide-gray-700">
        {[
          ['Target date', formatLongDate(milestone.targetDate) || 'Not set'],
          ['Points', milestone.rewards?.points ?? 0],
          ['Certificate', milestone.rewards?.certificate ? 'Issued when completed' : 'None'],
          milestone.rewards?.badge ? ['Badge', milestone.rewards.badge] : null,
          done && milestone.completedAt ? ['Completed', formatLongDate(milestone.completedAt)] : null,
        ].filter(Boolean).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-5 py-3.5 text-[15px]"><span className="text-gray-600 dark:text-gray-400">{k}</span><span className="font-bold">{v}</span></div>
        ))}
      </section>

      <section aria-labelledby="ev-h" className="card mb-5 p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="ev-h" className="text-lg">Evidence</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEvidenceOpen(true)}>Add evidence</button>
        </div>
        {(milestone.evidence?.length ?? 0) === 0 && <p className="text-gray-600 dark:text-gray-400">A note, link or photo that shows it happened.</p>}
        <ul className="space-y-3">
          {milestone.evidence?.map((e) => {
            const Icon = EVIDENCE_ICON[e.type] ?? FileText;
            return (
              <li key={e._id} className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                <div className="min-w-0 leading-snug">
                  <p className="font-bold capitalize">{e.type}</p>
                  {e.description && <p className="text-[15px]">{e.description}</p>}
                  {e.url && <a href={e.url} target="_blank" rel="noreferrer" className="break-all text-sm font-bold text-rose-700 underline dark:text-rose-300">{e.url}</a>}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        {!done && <button type="button" onClick={complete} className="btn btn-primary"><Check className="h-4 w-4" aria-hidden="true" />Mark as done</button>}
        <button type="button" onClick={() => setConfirmDelete(true)} className="btn btn-danger">Delete milestone</button>
      </div>

      {confirmDelete && <ConfirmModal title="Delete this milestone?" text="This removes it for both of you. It can't be undone." onConfirm={remove} onClose={() => setConfirmDelete(false)} />}

      {evidenceOpen && (
        <Modal
          title="Add evidence"
          onClose={() => setEvidenceOpen(false)}
          footer={<>
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setEvidenceOpen(false)}>Cancel</button>
            <button type="button" className="btn btn-primary flex-1" onClick={submitEvidence}>Add</button>
          </>}
        >
          <p className="field-label">What kind?</p>
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Evidence type">
            {EVIDENCE_TYPES.map((t) => <button key={t} type="button" aria-pressed={evidence.type === t} onClick={() => setEvidence({ ...evidence, type: t })} className={`chip capitalize ${evidence.type === t ? 'chip-on' : ''}`}>{t}</button>)}
          </div>
          {evidence.type !== 'note' && (
            <>
              <label htmlFor="ev-url" className="field-label">Link</label>
              <input id="ev-url" type="url" className="input mb-4" placeholder="https://" value={evidence.url} onChange={(e) => setEvidence({ ...evidence, url: e.target.value })} />
            </>
          )}
          <label htmlFor="ev-desc" className="field-label">Description</label>
          <textarea id="ev-desc" className="input" rows={3} value={evidence.description} onChange={(e) => setEvidence({ ...evidence, description: e.target.value })} />
        </Modal>
      )}
    </div>
  );
};

export default MilestoneDetail;
