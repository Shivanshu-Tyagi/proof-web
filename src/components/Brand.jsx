import { ShieldCheck } from 'lucide-react';

// Wordmark used in the sidebar and on the sign-in screens
const Brand = ({ light = false, size = 'md' }) => {
  const box = size === 'lg' ? 'h-10 w-10 rounded-xl' : 'h-9 w-9 rounded-xl';
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`${box} inline-flex items-center justify-center ${light ? 'bg-white' : 'bg-rose-500'}`}>
        <ShieldCheck className={`h-5 w-5 ${light ? 'text-rose-500' : 'text-white'}`} aria-hidden="true" />
      </span>
      <span className={`text-2xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-gray-900 dark:text-white'}`}>proof</span>
    </span>
  );
};

export default Brand;
