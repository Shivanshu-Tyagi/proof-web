import { useState } from 'react';
import FieldError from './FieldError';

// Password field with a plain "Show" toggle. Paste is never blocked, so password managers work.
const PasswordInput = ({ id, label, error, ...props }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <div className="relative">
        <input id={id} type={visible ? 'text' : 'password'} className="input pr-20" aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="absolute inset-y-0 right-1 my-auto h-11 rounded-lg px-3 text-sm font-bold text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      <FieldError name={id} errors={{ [id]: error }} />
    </div>
  );
};

export default PasswordInput;
