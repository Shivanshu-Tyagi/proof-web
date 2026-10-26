import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import Brand from '../components/Brand';
import CertificateArt from '../components/CertificateArt';
import { LEVEL_LABELS, formatDate } from '../utils/certificates';

// Public page: no sign-in needed. Shows only what the certificate holders chose to share.
const VerifyCertificate = () => {
  const { number } = useParams();
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    // A plain request: the shared axios instance would attach a signed-in user's token
    axios.get(`/verify/${encodeURIComponent(number)}`, { headers: { Authorization: false } })
      .then((res) => { if (!cancelled) setState({ status: 'found', data: res.data }); })
      .catch(() => { if (!cancelled) setState({ status: 'missing' }); });
    return () => { cancelled = true; };
  }, [number]);

  const { status, data } = state;
  const ok = status === 'found' && data.verified;

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-3xl flex-col justify-center gap-6 px-5 py-10">
      <Link to="/" className="self-center" aria-label="Twogether home"><Brand /></Link>

      {status === 'loading' && <p className="text-center text-gray-600 dark:text-gray-400">Checking…</p>}

      {status === 'missing' && (
        <div className="card p-6 text-center">
          <ShieldAlert className="mx-auto mb-2 h-10 w-10 text-gray-500" aria-hidden="true" />
          <h1 className="text-xl">We could not find that certificate</h1>
          <p className="page-sub mt-2">Either the number is wrong or its owners have not shared it. Check the link you were given.</p>
        </div>
      )}

      {status === 'found' && (
        <>
          <p className={`mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold ${ok ? 'badge-ok' : 'badge-warn'}`} role="status">
            {ok ? <BadgeCheck className="h-5 w-5" aria-hidden="true" /> : <ShieldAlert className="h-5 w-5" aria-hidden="true" />}
            {ok ? 'Verified certificate' : data.revoked ? 'This certificate was revoked' : 'This certificate is no longer valid'}
          </p>
          <CertificateArt
            src={`${axios.defaults.baseURL}/verify/${encodeURIComponent(data.number)}/image`}
            dimmed={!ok}
            alt={`${LEVEL_LABELS[data.level] ?? ''} level certificate for ${data.people.join(' and ')}, issued ${formatDate(data.issuedAt)}. Certificate number ${data.number}.`}
          />
        </>
      )}

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">Only names, level and date are shown. Nothing else about these people is public.</p>
    </div>
  );
};

export default VerifyCertificate;
