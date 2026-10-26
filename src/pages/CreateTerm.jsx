import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import useActiveRelationships from '../utils/useActiveRelationships';
import NeedsRelationship from '../components/NeedsRelationship';
import useTermStore from '../store/termStore';
import RelationshipPicker from '../components/RelationshipPicker';
import FieldError from '../components/FieldError';
import useFormErrors from '../utils/useFormErrors';

const CATEGORIES = [
  { value: 'communication', label: 'Communication' },
  { value: 'boundaries', label: 'Boundaries' },
  { value: 'expectations', label: 'Expectations' },
  { value: 'goals', label: 'Goals' },
  { value: 'activities', label: 'Activities' },
  { value: 'conflict_resolution', label: 'Conflict resolution' },
  { value: 'commitment', label: 'Commitment' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const CreateTerm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { relationships, loaded, hasActive } = useActiveRelationships();
  const { createTerm, isLoading } = useTermStore();

  const [formData, setFormData] = useState({
    relationshipId: searchParams.get('relationshipId') || '',
    title: '',
    description: '',
    category: 'communication',
    priority: 'medium',
    expiresAt: '',
  });
  const { errors, clear, fail, aria } = useFormErrors();
  const set = (patch) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    Object.keys(patch).forEach(clear);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!formData.relationshipId) found.relationshipId = 'Choose which relationship this agreement is for.';
    if (!formData.title.trim()) found.title = 'Write what the agreement is.';
    if (!formData.description.trim()) found.description = 'Add the details: what does each of you commit to?';
    if (Object.keys(found).length) {
      fail(found);
      return;
    }
    const payload = { ...formData };
    if (!payload.expiresAt) delete payload.expiresAt;
    const result = await createTerm(payload);
    if (result.success) {
      toast.success('Agreement created successfully!');
      navigate(`/relationships/${formData.relationshipId}`);
    } else {
      toast.error(result.error || 'Failed to create agreement');
    }
  };

  if (loaded && !hasActive) return <NeedsRelationship back="/terms" backLabel="Agreements" what="An agreement" />;

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <Link to="/terms" className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-bold hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />Agreements
      </Link>
      <h1 className="page-title">New agreement</h1>
      <p className="page-sub mb-6 mt-1">Write down something you both expect. Each of you confirms it before it counts.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <RelationshipPicker relationships={relationships} value={formData.relationshipId} onChange={(id) => set({ relationshipId: id })} error={errors.relationshipId} />

        <div>
          <label htmlFor="title" className="field-label">What is the agreement?</label>
          <input id="title" className="input" {...aria('title')} maxLength={100} value={formData.title} onChange={(e) => set({ title: e.target.value })} placeholder="Call every Sunday" />
          <FieldError name="title" errors={errors} />
        </div>

        <div>
          <label htmlFor="description" className="field-label">The details</label>
          <textarea id="description" className="input" {...aria('description')} rows={4} maxLength={1000} value={formData.description} onChange={(e) => set({ description: e.target.value })} placeholder="What does each of you commit to?" />
          <FieldError name="description" errors={errors} />
        </div>

        <fieldset>
          <legend className="field-label">Category</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.value} type="button" aria-pressed={formData.category === c.value} onClick={() => set({ category: c.value })} className={`chip ${formData.category === c.value ? 'chip-on' : ''}`}>{c.label}</button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="field-label">How important is it?</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRIORITIES.map((p) => (
              <button key={p.value} type="button" aria-pressed={formData.priority === p.value} onClick={() => set({ priority: p.value })} className={`chip justify-center ${formData.priority === p.value ? 'chip-on' : ''}`}>{p.label}</button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="expiresAt" className="field-label">Review on (optional)</label>
          <input id="expiresAt" type="date" className="input" value={formData.expiresAt} onChange={(e) => set({ expiresAt: e.target.value })} />
        </div>

        <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">{isLoading ? 'Creating…' : 'Create agreement'}</button>
      </form>
    </div>
  );
};

export default CreateTerm;
