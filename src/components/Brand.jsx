// Wordmark used in the sidebar and on the sign-in screens: two interlocking circles, for two people
const Brand = ({ light = false, size = 'md' }) => {
  const box = size === 'lg' ? 'h-10 w-10 rounded-xl' : 'h-9 w-9 rounded-xl';
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`${box} inline-flex items-center justify-center ${light ? 'bg-white' : 'bg-rose-500'}`}>
        <svg viewBox="0 0 24 24" className={`h-6 w-6 ${light ? 'text-rose-500' : 'text-white'}`} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><circle cx="8.8" cy="12" r="5.2" /><circle cx="15.2" cy="12" r="5.2" /></svg>
      </span>
      <span className={`text-2xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-gray-900 dark:text-white'}`}>twogether</span>
    </span>
  );
};

export default Brand;
