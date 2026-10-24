import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Bottom sheet on phones, centred dialog on larger screens. Esc and backdrop click close it.
const Modal = ({ title, onClose, children, footer }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    panelRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/55 md:items-center md:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-[28px] bg-white shadow-lift outline-none dark:bg-gray-800 md:rounded-[28px]"
      >
        <div className="flex items-center justify-between px-6 pb-2 pt-5">
          <h2 className="text-xl">{title}</h2>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto px-6 pb-4">{children}</div>
        {footer && <div className="flex gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
