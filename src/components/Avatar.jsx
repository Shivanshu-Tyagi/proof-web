import { initials } from '../utils/relationships';

const TINTS = ['bg-teal-200', 'bg-orange-200', 'bg-violet-200', 'bg-yellow-200', 'bg-sky-200', 'bg-pink-200'];

const tintFor = (key = '') => {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length];
};

const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base', xl: 'h-24 w-24 text-2xl' };

// Initials on a soft colour, always readable (dark text on light tints)
export const Avatar = ({ person, size = 'md', className = '' }) => (
  <span
    className={`avatar ${SIZES[size]} ${tintFor(person?._id ?? person?.username)} dark:text-gray-900 ${className}`}
    aria-hidden="true"
  >
    {initials(person)}
  </span>
);

export const AvatarPair = ({ people = [], size = 'md' }) => (
  <span className="inline-flex" aria-hidden="true">
    {people.map((p, i) => (
      <Avatar key={p?._id ?? i} person={p} size={size} className={`ring-2 ring-white dark:ring-gray-800 ${i > 0 ? (size === 'sm' ? '-ml-2' : '-ml-2.5') : ''}`} />
    ))}
  </span>
);

export default Avatar;
