import { useState } from 'react';
import { toast } from 'react-toastify';
import Modal from './Modal';
import useRelationshipStore from '../store/relationshipStore';

const STEPS = [
  { n: 1, t: 'You send the request', d: 'They get a plain, kind message. No reason is shared.' },
  { n: 2, t: 'They confirm', d: 'Until then the relationship stays active. You can take it back.' },
  { n: 3, t: 'It moves to Ended', d: 'Kept in your records, closed to new agreements.' },
];

// Three modes: ask to end, confirm someone else's request, or withdraw your own request
const EndRelationshipModal = ({ relationship, other, mode, onClose }) => {
  const { requestBreakup, confirmBreakup, cancelBreakupRequest, savePrivateNote, isLoading } = useRelationshipStore();
  const [note, setNote] = useState('');
  const name = other?.firstName ?? 'them';

  const run = async (action, success) => {
    const result = await action(relationship._id);
    if (result?.success) {
      toast.success(success);
      onClose();
    } else {
      toast.error(result?.error ?? 'Something went wrong');
    }
  };

  if (mode === 'confirm') {
    return (
      <Modal
        title={`${name} asked to end this`}
        onClose={onClose}
        footer={<>
          <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>Not now</button>
          <button type="button" disabled={isLoading} className="btn btn-dark flex-1" onClick={() => run(confirmBreakup, 'The relationship has ended.')}>Confirm ending</button>
        </>}
      >
        <p className="page-sub">Once you confirm, <strong>{relationship.title}</strong> moves to Ended for both of you. The record and any certificates stay in your accounts.</p>
      </Modal>
    );
  }

  if (mode === 'cancel') {
    return (
      <Modal
        title="Take back your request?"
        onClose={onClose}
        footer={<>
          <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>Leave it</button>
          <button type="button" disabled={isLoading} className="btn btn-dark flex-1" onClick={() => run(cancelBreakupRequest, 'Request withdrawn. The relationship is active again.')}>Withdraw request</button>
        </>}
      >
        <p className="page-sub">{name} has not confirmed yet. If you withdraw, <strong>{relationship.title}</strong> stays active as if nothing happened.</p>
      </Modal>
    );
  }

  return (
    <Modal
      title={`Ask ${name} to end this together?`}
      onClose={onClose}
      footer={<>
        <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>Keep it</button>
        <button type="button" disabled={isLoading} className="btn btn-dark flex-1" onClick={() => run(async (id) => {
          const result = await requestBreakup(id);
          if (result?.success && note.trim()) await savePrivateNote(id, note);
          return result;
        }, 'Request sent. It ends once they confirm.')}>Send request</button>
      </>}
    >
      <p className="page-sub mb-4">Both of you need to confirm. Nothing changes until they do, and you can take the request back before then.</p>
      <ol className="card divide-y divide-gray-200 overflow-hidden dark:divide-gray-700">
        {STEPS.map((s) => (
          <li key={s.n} className="flex items-start gap-3 p-4">
            <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${s.n === 1 ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'}`}>{s.n}</span>
            <div className="leading-snug"><p className="text-sm font-extrabold">{s.t}</p><p className="text-sm text-gray-600 dark:text-gray-400">{s.d}</p></div>
          </li>
        ))}
      </ol>
      <p className="card-soft mt-4 p-4 text-sm leading-relaxed"><strong>What you keep:</strong> the record stays as &ldquo;Ended&rdquo; for both of you, and certificates you earned stay in your account.</p>
      <label htmlFor="end-note" className="field-label mt-4">A private note to yourself (optional)</label>
      <textarea id="end-note" className="input" rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Only you can read this." />
    </Modal>
  );
};

export default EndRelationshipModal;
