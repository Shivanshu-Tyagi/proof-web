import { useCallback, useState } from 'react';

// Per-field form errors. `fail` shows them under their fields and moves focus to the first one.
// Field keys match element ids (a group such as the relationship picker uses the id of its container).
const useFormErrors = () => {
  const [errors, setErrors] = useState({});

  const clear = useCallback((name) => {
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }, []);

  const fail = useCallback((found) => {
    setErrors(found);
    const first = Object.keys(found)[0];
    if (!first) return;
    const el = document.getElementById(first);
    const target = el?.matches('input,textarea,select,button') ? el : el?.querySelector('input,textarea,select,button');
    target?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    target?.focus?.({ preventScroll: true });
  }, []);

  // Attributes for an input: marks it invalid and ties it to its message
  const aria = (name) => (errors[name] ? { 'aria-invalid': true, 'aria-describedby': `${name}-error` } : {});

  return { errors, clear, fail, aria };
};

export default useFormErrors;
