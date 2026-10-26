import { useEffect, useState } from 'react';

// On free hosting the server sleeps when quiet and takes up to a minute to wake. Say so, instead of leaving a spinner.
const SlowHint = ({ active, after = 4000 }) => {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!active) { setSlow(false); return undefined; }
    const timer = setTimeout(() => setSlow(true), after);
    return () => clearTimeout(timer);
  }, [active, after]);

  if (!active || !slow) return null;
  return (
    <p role="status" className="rounded-xl bg-amber-100 px-4 py-3 text-sm font-bold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
      Still working. The server was asleep and is waking up, which can take up to a minute the first time. Please keep this page open.
    </p>
  );
};

export default SlowHint;
