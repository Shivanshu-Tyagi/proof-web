import useAuthStore from '../store/authStore';
import { AvatarPair } from './Avatar';
import { otherPerson } from '../utils/people';
import FieldError from './FieldError';

// "Which relationship is this for?" as a radio group of cards. Only active ones qualify.
const RelationshipPicker = ({ relationships = [], value, onChange, id = 'relationshipId', error }) => {
  const { user } = useAuthStore();
  const options = relationships.filter((r) => r.status === 'active');

  if (options.length === 0) {
    return <p className="card-soft p-4 text-sm text-gray-700 dark:text-gray-300">You need an active relationship first. Invite someone and wait for them to accept.</p>;
  }

  return (
    <fieldset id={id} aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="field-label">Which relationship?</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((r) => {
          const other = otherPerson(r, user?.id);
          const selected = value === r._id;
          return (
            <button
              key={r._id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(r._id)}
              className={`flex min-h-[64px] items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors ${
                selected ? 'border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-800' : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
              }`}
            >
              <AvatarPair people={[user, other]} size="sm" />
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-extrabold">{r.title}</span>
                <span className="block truncate text-sm text-gray-600 dark:text-gray-400">with {other?.firstName}</span>
              </span>
            </button>
          );
        })}
      </div>
      <FieldError name={id} errors={{ [id]: error }} />
    </fieldset>
  );
};

export default RelationshipPicker;
