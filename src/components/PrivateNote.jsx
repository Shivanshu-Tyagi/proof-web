import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import useRelationshipStore from '../store/relationshipStore';

// A note only you can read, kept for yourself about this relationship
const PrivateNote = ({ relationshipId }) => {
  const { getPrivateNote, savePrivateNote } = useRelationshipStore();
  const [saved, setSaved] = useState('');
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPrivateNote(relationshipId).then((result) => {
      if (cancelled) return;
      const value = result.note?.text ?? '';
      setSaved(value);
      setText(value);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [relationshipId, getPrivateNote]);

  const save = async () => {
    setSaving(true);
    const result = await savePrivateNote(relationshipId, text);
    setSaving(false);
    if (result.success) {
      setSaved(text.trim());
      setText(text.trim());
      toast.success(text.trim() ? 'Note saved' : 'Note removed');
    } else {
      toast.error(result.error);
    }
  };

  if (!loaded) return null;

  return (
    <section aria-labelledby="note-h" className="card p-5">
      <div className="mb-2 flex items-center gap-2">
        <Lock className="h-[18px] w-[18px] text-gray-600 dark:text-gray-400" aria-hidden="true" />
        <h2 id="note-h" className="text-lg">Your private note</h2>
      </div>
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">Only you can read this. The other person never sees it.</p>
      <label htmlFor="private-note" className="sr-only">Private note</label>
      <textarea id="private-note" className="input" rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-3 flex justify-end">
        <button type="button" onClick={save} disabled={saving || text.trim() === saved} className="btn btn-secondary btn-sm">{saving ? 'Saving…' : 'Save note'}</button>
      </div>
    </section>
  );
};

export default PrivateNote;
