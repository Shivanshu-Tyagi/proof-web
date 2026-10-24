import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import useActivityStore from '../store/activityStore';
import useAuthStore from '../store/authStore';
import ConfirmModal from '../components/ConfirmModal';
import { Avatar } from '../components/Avatar';
import { formatLongDate, pretty } from '../utils/format';

const REACTIONS = [['love', 'Love'], ['like', 'Like'], ['laugh', 'Haha'], ['wow', 'Wow'], ['sad', 'Sad'], ['angry', 'Angry']];
const MOOD_LABELS = { very_positive: 'Great', positive: 'Good', neutral: 'Okay', negative: 'Rough', very_negative: 'Hard' };
const idOf = (value) => value?._id ?? value;

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentActivity, getActivity, deleteActivity, addReaction, addComment, isLoading } = useActivityStore();
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (id) getActivity(id);
  }, [id, getActivity]);

  const activity = currentActivity?._id === id ? currentActivity : null;

  if (!activity) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
        {isLoading ? <p className="text-gray-600 dark:text-gray-400">Loading…</p> : (
          <div><h1 className="text-2xl">Moment not found</h1><Link to="/activities" className="btn btn-primary mt-4">Back to moments</Link></div>
        )}
      </div>
    );
  }

  const myReaction = activity.reactions?.find((r) => idOf(r.user) === user?.id)?.type;
  const countOf = (type) => activity.reactions?.filter((r) => r.type === type).length ?? 0;
  const isCreator = idOf(activity.createdBy) === user?.id;

  const react = async (type) => {
    const result = await addReaction(id, type);
    if (!result.success) toast.error(result.error);
  };

  const post = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    const result = await addComment(id, comment.trim());
    setPosting(false);
    if (result.success) setComment('');
    else toast.error(result.error);
  };

  const remove = async () => {
    const result = await deleteActivity(id);
    if (result.success) {
      toast.success('Moment deleted');
      navigate('/activities');
    } else {
      toast.error(result.error);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-6 md:px-10 md:pt-8">
      <Link to="/activities" className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-bold hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Moments</Link>

      <header className="mb-6">
        <div className="mb-2 flex flex-wrap gap-2">
          <span className="badge badge-neutral capitalize">{activity.type}</span>
          {activity.mood && <span className="badge badge-neutral">{MOOD_LABELS[activity.mood] ?? pretty(activity.mood)}</span>}
        </div>
        <h1 className="page-title">{activity.title}</h1>
        <p className="page-sub mt-1">
          In <Link to={`/relationships/${idOf(activity.relationship)}`} className="font-bold underline">{activity.relationship?.title ?? 'this relationship'}</Link>
          {activity.createdBy?.firstName ? ` · ${isCreator ? 'you' : activity.createdBy.firstName}, ${formatLongDate(activity.createdAt)}` : ''}
        </p>
      </header>

      <section className="card mb-5 p-5">
        {activity.description ? <p className="whitespace-pre-wrap text-[16px] leading-relaxed">{activity.description}</p> : <p className="text-gray-600 dark:text-gray-400">No story added.</p>}
        {(activity.location?.name || activity.duration) && (
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
            {activity.location?.name && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden="true" />{activity.location.name}</span>}
            {activity.duration ? <span>{activity.duration} minutes</span> : null}
          </p>
        )}
      </section>

      <section aria-label="Reactions" className="mb-5 flex flex-wrap gap-2">
        {REACTIONS.map(([type, label]) => (
          <button key={type} type="button" aria-pressed={myReaction === type} onClick={() => react(type)} className={`chip ${myReaction === type ? 'chip-on' : ''}`}>
            {label}{countOf(type) > 0 && <span className="ml-1.5 opacity-70">{countOf(type)}</span>}
          </button>
        ))}
      </section>

      <section aria-labelledby="com-h" className="card mb-5 p-5">
        <h2 id="com-h" className="mb-3 text-lg">Comments</h2>
        {(activity.comments?.length ?? 0) === 0 && <p className="mb-3 text-gray-600 dark:text-gray-400">Be the first to say something.</p>}
        <ul className="mb-4 space-y-4">
          {activity.comments?.map((c) => (
            <li key={c._id} className="flex gap-3">
              <Avatar person={c.user} size="sm" />
              <div className="min-w-0 leading-snug">
                <p className="text-sm"><span className="font-extrabold">{idOf(c.user) === user?.id ? 'You' : c.user?.firstName}</span> <span className="text-gray-600 dark:text-gray-400">· {formatLongDate(c.createdAt)}</span></p>
                <p className="text-[15px]">{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={post} className="flex gap-2">
          <label htmlFor="comment" className="sr-only">Add a comment</label>
          <input id="comment" className="input" placeholder="Say something nice" maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} />
          <button type="submit" disabled={posting || !comment.trim()} className="btn btn-primary shrink-0">Post</button>
        </form>
      </section>

      {isCreator && <button type="button" onClick={() => setConfirmDelete(true)} className="btn btn-danger">Delete moment</button>}
      {confirmDelete && <ConfirmModal title="Delete this moment?" text="This removes it for both of you. It can't be undone." onConfirm={remove} onClose={() => setConfirmDelete(false)} />}
    </div>
  );
};

export default ActivityDetail;
