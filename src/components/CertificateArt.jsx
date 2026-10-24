import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

// The certificate itself. Holders get it by id (needs sign-in); the public verify page passes `src`.
// Both are the same artwork the PNG download is made from, so what you see is what you keep.
const CertificateArt = ({ id, src, alt, className = '', dimmed = false }) => {
  const [url, setUrl] = useState(src ?? null);
  const [status, setStatus] = useState(src ? 'ready' : 'loading'); // loading | ready | error
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (src) { setUrl(src); setStatus('ready'); return undefined; }
    let cancelled = false;
    let objectUrl = null;
    setStatus('loading');
    axios.get(`/certificates/${id}/image`, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setUrl(objectUrl);
        setStatus('ready');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id, src, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const frame = `relative aspect-[1400/990] w-full overflow-hidden rounded-2xl bg-[#faf5ea] shadow-lift ring-1 ring-black/10 dark:ring-white/10 ${className}`;

  if (status === 'error') {
    return (
      <div className={`${frame} flex flex-col items-center justify-center gap-2 p-4 text-center`} role="alert">
        <p className="text-sm font-bold text-gray-800">The certificate preview did not load.</p>
        <button type="button" onClick={retry} className="btn btn-secondary btn-sm">Try again</button>
      </div>
    );
  }
  return (
    <div className={frame} aria-busy={status === 'loading'}>
      {status === 'loading' && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#fffefb] to-[#efe6d2]" aria-hidden="true" />}
      {status === 'ready' && (
        <img
          src={url}
          alt={alt}
          onError={() => setStatus('error')}
          className={`h-full w-full object-contain transition-opacity ${dimmed ? 'opacity-50 grayscale' : ''}`}
        />
      )}
    </div>
  );
};

export default CertificateArt;
