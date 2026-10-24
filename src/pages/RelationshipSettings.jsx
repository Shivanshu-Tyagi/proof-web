import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import useRelationshipStore from '../store/relationshipStore';
import ConfirmModal from '../components/ConfirmModal';

// Only settings the server enforces are shown here: who may add shared items.
const ROWS = [
  ['createActivities', 'Add moments', 'Memories and plans in this relationship'],
  ['createMilestones', 'Add milestones', 'Goals and celebrations to confirm together'],
  ['createTerms', 'Propose agreements', 'New things you both need to agree to'],
];

const RelationshipSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRelationship, getRelationship, updateRelationship, deleteRelationship, isLoading } = useRelationshipStore();
  const [allowed, setAllowed] = useState({ createActivities: true, createMilestones: true, createTerms: true });
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (id) getRelationship(id);
  }, [id, getRelationship]);

  useEffect(() => {
    if (currentRelationship?._id === id) {
      const p = currentRelationship.settings?.permissions ?? {};
      setAllowed({ createActivities: p.createActivities !== false, createMilestones: p.createMilestones !== false, createTerms: p.createTerms !== false });
      setDirty(false);
    }
  }, [currentRelationship, id]);

  const relationship = currentRelationship?._id === id ? currentRelationship : null;

  if (!relationship) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
        {isLoading ? <p className="text-gray-600 dark:text-gray-400">Loading…</p> : (
          <div><h1 className="text-2xl">Relationship not found</h1><Link to="/relationships" className="btn btn-primary mt-4">Back to people</Link></div>
        )}
      </div>
    );
  }

  const isActive = relationship.status === 'active';

  const save = async () => {
    const result = await updateRelationship(id, { settings: { permissions: allowed } });
    if (result.success) {
      toast.success('Settings saved');
      setDirty(false);
    } else {
      toast.error(result.error);
    }
  };

  const remove = async () => {
    const result = await deleteRelationship(id);
    if (result.success) {
      toast.success('Relationship deleted');
      navigate('/relationships');
    } else {
      toast.error(result.error);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-28 pt-6 md:px-10 md:pt-8">
      <Link to={`/relationships/${id}`} className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-bold hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" />{relationship.title}</Link>
      <h1 className="page-title">Settings</h1>
      <p className="page-sub mb-6 mt-1">These apply to both of you, and either of you can change them.</p>

      <section aria-label="Who can add" className="mb-8">
        <h2 className="eyebrow mb-2">Adding to this relationship</h2>
        <div className="card divide-y divide-gray-200 dark:divide-gray-700">
          {ROWS.map(([key, label, hint]) => (
            <div key={key} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="leading-snug">
                <p id={`perm-${key}`} className="font-bold">{label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{hint}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={allowed[key]}
                aria-labelledby={`perm-${key}`}
                disabled={!isActive}
                onClick={() => { setAllowed({ ...allowed, [key]: !allowed[key] }); setDirty(true); }}
                className="toggle"
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {isActive ? 'Turn one off to pause it for both of you. Existing items stay.' : 'Settings can only change while the relationship is active.'}
        </p>
      </section>

      <section className="card-soft p-5 text-[15px] leading-relaxed">
        <p><strong>Looking for notifications or privacy?</strong> Those are personal, so they live in your account: <Link to="/profile?tab=notifications" className="font-bold text-rose-700 underline dark:text-rose-300">notification choices</Link> and <Link to="/profile?tab=privacy" className="font-bold text-rose-700 underline dark:text-rose-300">who can see your history</Link>.</p>
      </section>

      {relationship.status !== 'active' && (
        <section className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
          <h2 className="text-lg">Delete this relationship</h2>
          <p className="page-sub mb-3 mt-1">Removes the record for both of you. This can&apos;t be undone.</p>
          <button type="button" onClick={() => setConfirmDelete(true)} className="btn btn-danger">Delete relationship</button>
        </section>
      )}

      <div className={`fixed inset-x-0 bottom-[68px] z-20 border-t border-gray-200 bg-white/95 px-5 py-3 backdrop-blur transition-opacity dark:border-gray-700 dark:bg-gray-900/95 md:bottom-0 md:left-64 ${dirty ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!dirty}>
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <p className="text-sm font-bold">You have unsaved changes</p>
          <button type="button" onClick={save} tabIndex={dirty ? 0 : -1} className="btn btn-primary">Save settings</button>
        </div>
      </div>

      {confirmDelete && <ConfirmModal title="Delete this relationship?" text="This removes it, with its agreements and milestones, for both of you." onConfirm={remove} onClose={() => setConfirmDelete(false)} />}
    </div>
  );
};

export default RelationshipSettings;
