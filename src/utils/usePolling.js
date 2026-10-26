import { useCallback, useEffect, useRef } from 'react';

// How long to wait before the next check: back to `base` when something changed, otherwise a bit longer each time up to `max`
export const nextDelay = (current, changed, { base, max, factor }) => (changed ? base : Math.min(max, Math.round(current * factor)));

// Runs `task` now and then again and again. `task` should resolve to true when it found something new.
// - waits `base` ms at first, and longer and longer (up to `max`) while nothing changes
// - does nothing while the tab is hidden, and checks right away when the person comes back
// - `reset()` returns to the fast pace, for example after the person sends a message
const usePolling = (task, { base = 30000, max = 120000, factor = 1.5, enabled = true, immediate = true } = {}) => {
  const taskRef = useRef(task);
  const controls = useRef({ reset: () => {} });

  useEffect(() => { taskRef.current = task; }, [task]);

  useEffect(() => {
    if (!enabled) return undefined;
    let timer;
    let delay = base;
    let stopped = false;
    let running = false;

    const run = async () => {
      clearTimeout(timer);
      if (stopped || running || document.hidden) return; // a hidden tab waits for visibilitychange
      running = true;
      let changed = false;
      try { changed = (await taskRef.current()) === true; } catch { /* try again later */ }
      running = false;
      const wait = changed ? base : delay; // this wait is the current pace; the one after it is a little longer
      delay = nextDelay(delay, changed, { base, max, factor });
      if (!stopped && !document.hidden) timer = setTimeout(run, wait);
    };

    const onVisibility = () => {
      if (!document.hidden) { delay = base; run(); }
    };

    controls.current.reset = () => { delay = base; clearTimeout(timer); timer = setTimeout(run, base); };
    document.addEventListener('visibilitychange', onVisibility);
    if (immediate) run();
    else timer = setTimeout(run, base);

    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, base, max, factor, immediate]);

  return { reset: useCallback(() => controls.current.reset(), []) };
};

export default usePolling;
