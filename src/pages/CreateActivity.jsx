import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import useRelationshipStore from '../store/relationshipStore';
import useActivityStore from '../store/activityStore';
import RelationshipPicker from '../components/RelationshipPicker';
import FieldError from '../components/FieldError';
import useFormErrors from '../utils/useFormErrors';

const TYPES = [
  ['conversation', 'Conversation'], ['date', 'Date'], ['gift', 'Gift'], ['achievement', 'Achievement'], ['conflict', 'Conflict'],
  ['resolution', 'Resolution'], ['milestone', 'Milestone'], ['memory', 'Memory'], ['goal', 'Goal'], ['other', 'Other'],
];

const MOODS = [
  ['very_positive', 'Great'], ['positive', 'Good'], ['neutral', 'Okay'], ['negative', 'Rough'], ['very_negative', 'Hard'],
];

const CreateActivity = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { relationships, getRelationships } = useRelationshipStore();
  const { createActivity, isLoading } = useActivityStore();

  // Direct visits (for example from a link) have not loaded the list yet
  useEffect(() => {
    getRelationships();
  }, [getRelationships]);

  const [formData, setFormData] = useState({
    relationshipId: searchParams.get('relationshipId') || '',
    title: '',
    description: '',
    type: 'conversation',
    category: 'shared_activities',
    mood: 'positive',
    location: { name: '', address: '' },
    duration: '',
    tags: [],
  });
  const { errors, clear, fail, aria } = useFormErrors();
  const set = (patch) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    Object.keys(patch).forEach(clear);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!formData.relationshipId) found.relationshipId = 'Choose which relationship this moment is for.';
    if (!formData.title.trim()) found.title = 'Say what happened.';
    if (Object.keys(found).length) {
      fail(found);
      return;
    }
    const payload = { ...formData };
    if (!payload.duration) delete payload.duration;
    const result = await createActivity(payload);
    if (result.success) {
      toast.success('Moment added');
      navigate(`/relationships/${formData.relationshipId}`);
    } else {
      toast.error(result.error || 'Failed to add the moment');
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <Link to="/activities" className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-bold hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />Moments
      </Link>
      <h1 className="page-title">Add a moment</h1>
      <p className="page-sub mb-6 mt-1">A memory, a plan, something you did together.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <RelationshipPicker relationships={relationships} value={formData.relationshipId} onChange={(id) => set({ relationshipId: id })} error={errors.relationshipId} />

        <div>
          <label htmlFor="title" className="field-label">What happened?</label>
          <input id="title" className="input" {...aria('title')} maxLength={100} value={formData.title} onChange={(e) => set({ title: e.target.value })} placeholder="Found the loop we missed last time" />
          <FieldError name="title" errors={errors} />
        </div>

        <div>
          <label htmlFor="description" className="field-label">The story (optional)</label>
          <textarea id="description" className="input" rows={3} value={formData.description} onChange={(e) => set({ description: e.target.value })} />
        </div>

        <fieldset>
          <legend className="field-label">Kind of moment</legend>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(([value, label]) => (
              <button key={value} type="button" aria-pressed={formData.type === value} onClick={() => set({ type: value })} className={`chip ${formData.type === value ? 'chip-on' : ''}`}>{label}</button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="field-label">How did it feel?</legend>
          <div className="grid grid-cols-5 gap-2">
            {MOODS.map(([value, label]) => (
              <button key={value} type="button" aria-pressed={formData.mood === value} onClick={() => set({ mood: value })} className={`chip justify-center px-2 ${formData.mood === value ? 'chip-on' : ''}`}>{label}</button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="where" className="field-label">Where (optional)</label>
            <input id="where" className="input" value={formData.location.name} onChange={(e) => set({ location: { ...formData.location, name: e.target.value } })} />
          </div>
          <div>
            <label htmlFor="duration" className="field-label">Minutes (optional)</label>
            <input id="duration" type="number" min="0" className="input" value={formData.duration} onChange={(e) => set({ duration: e.target.value })} />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">{isLoading ? 'Adding…' : 'Add moment'}</button>
      </form>
    </div>
  );
};

export default CreateActivity;
