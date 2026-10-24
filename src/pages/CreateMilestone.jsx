import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import useRelationshipStore from '../store/relationshipStore';
import useMilestoneStore from '../store/milestoneStore';
import RelationshipPicker from '../components/RelationshipPicker';
import FieldError from '../components/FieldError';
import useFormErrors from '../utils/useFormErrors';

const CATEGORIES = [
  { value: 'time_based', label: 'Time based' },
  { value: 'activity_based', label: 'Activity based' },
  { value: 'trust_based', label: 'Trust' },
  { value: 'communication', label: 'Communication' },
  { value: 'commitment', label: 'Commitment' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'celebration', label: 'Celebration' },
  { value: 'custom', label: 'Custom' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', points: 25 },
  { value: 'medium', label: 'Medium', points: 50 },
  { value: 'hard', label: 'Hard', points: 100 },
  { value: 'expert', label: 'Expert', points: 200 },
];

const CreateMilestone = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { relationships, getRelationships } = useRelationshipStore();
  const { createMilestone, isLoading } = useMilestoneStore();

  // Direct visits (for example from a link) have not loaded the list yet
  useEffect(() => {
    getRelationships();
  }, [getRelationships]);

  const [formData, setFormData] = useState({
    relationshipId: searchParams.get('relationshipId') || '',
    title: '',
    description: '',
    category: 'communication',
    type: 'manual',
    targetDate: '',
    difficulty: 'medium',
    rewards: { points: 50, certificate: false, badge: '' },
  });

  const { errors, clear, fail, aria } = useFormErrors();
  const set = (patch) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    Object.keys(patch).forEach(clear);
  };

  const chooseDifficulty = (d) =>
    setFormData((prev) => ({ ...prev, difficulty: d.value, rewards: { ...prev.rewards, points: d.points } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!formData.relationshipId) found.relationshipId = 'Choose which relationship this milestone is for.';
    if (!formData.title.trim()) found.title = 'Say what you are celebrating.';
    if (Object.keys(found).length) {
      fail(found);
      return;
    }
    const result = await createMilestone(formData);
    if (result.success) {
      toast.success('Milestone created successfully!');
      navigate('/milestones');
    } else {
      toast.error(result.error || 'Failed to create milestone');
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <Link to="/milestones" className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-bold hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />Milestones
      </Link>
      <h1 className="page-title">New milestone</h1>
      <p className="page-sub mb-6 mt-1">Something worth marking together. Both of you confirm it when it happens.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <RelationshipPicker relationships={relationships} value={formData.relationshipId} onChange={(id) => set({ relationshipId: id })} error={errors.relationshipId} />

        <div>
          <label htmlFor="title" className="field-label">What are you celebrating?</label>
          <input id="title" name="title" className="input" {...aria('title')} value={formData.title} onChange={(e) => set({ title: e.target.value })} maxLength={100} placeholder="First month together" />
          <FieldError name="title" errors={errors} />
        </div>

        <div>
          <label htmlFor="description" className="field-label">Description (optional)</label>
          <textarea id="description" name="description" className="input" rows={3} value={formData.description} onChange={(e) => set({ description: e.target.value })} />
        </div>

        <div>
          <label htmlFor="targetDate" className="field-label">Target date</label>
          <input id="targetDate" name="targetDate" type="date" className="input" value={formData.targetDate} onChange={(e) => set({ targetDate: e.target.value })} />
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
          <legend className="field-label">How big a deal?</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DIFFICULTIES.map((d) => {
              const on = formData.difficulty === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => chooseDifficulty(d)}
                  className={`flex min-h-[60px] flex-col items-center justify-center rounded-2xl border-2 px-2 text-sm font-extrabold ${
                    on ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
                  }`}
                >
                  {d.label}
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{d.points} pts</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="card flex items-center justify-between gap-4 p-4">
          <div className="leading-snug">
            <p id="cert-label" className="font-extrabold">Issue a certificate</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">When you both confirm it</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={formData.rewards.certificate}
            aria-labelledby="cert-label"
            onClick={() => set({ rewards: { ...formData.rewards, certificate: !formData.rewards.certificate } })}
            className="toggle"
          />
        </div>

        <div>
          <label htmlFor="badge" className="field-label">Badge name (optional)</label>
          <input id="badge" className="input" value={formData.rewards.badge} onChange={(e) => set({ rewards: { ...formData.rewards, badge: e.target.value } })} placeholder="Communication Champion" />
        </div>

        <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">{isLoading ? 'Creating…' : 'Create milestone'}</button>
      </form>
    </div>
  );
};

export default CreateMilestone;
