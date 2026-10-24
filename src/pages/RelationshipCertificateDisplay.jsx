import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Download, Maximize2, Minimize2, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';
import useCertificateStore from '../store/certificateStore';
import CertificateArt from '../components/CertificateArt';
import { LEVEL_LABELS, formatDate, namesOf, verifyUrl } from '../utils/certificates';

const RelationshipCertificateDisplay = () => {
  const { id } = useParams();
  const { getCertificate, downloadCertificate, shareCertificate, setCertificateSharing } = useCertificateStore();
  const [certificate, setCertificate] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | missing
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState(false); // phones: read the small print

  useEffect(() => {
    let cancelled = false;
    getCertificate(id).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setCertificate(result.certificate);
        setStatus('ready');
      } else {
        setStatus('missing');
      }
    });
    return () => { cancelled = true; };
  }, [id, getCertificate]);

  if (status === 'loading') {
    return <div className="flex min-h-[60vh] items-center justify-center text-gray-600 dark:text-gray-400">Loading…</div>;
  }
  if (status === 'missing' || !certificate) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl">Certificate not found</h1>
        <Link to="/certificates" className="btn btn-primary">Back to certificates</Link>
      </div>
    );
  }

  const names = namesOf(certificate);
  const number = certificate.metadata?.certificateNumber;
  const link = number ? verifyUrl(number) : '';
  const isPublic = certificate.sharing?.isPublic === true;
  const level = LEVEL_LABELS[certificate.level] ?? 'Bronze';

  const toggleLink = async () => {
    setBusy(true);
    const result = await setCertificateSharing(id, !isPublic);
    setBusy(false);
    if (result.success) {
      setCertificate((c) => ({ ...c, sharing: { ...c.sharing, isPublic: !isPublic } }));
      toast.success(!isPublic ? 'Verify link is on' : 'Verify link is off');
    } else {
      toast.error(result.error);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Verify link copied');
    } catch {
      toast.error('Could not copy. Select the link and copy it by hand.');
    }
  };

  const share = async () => {
    shareCertificate(id, 'web');
    if (navigator.share) {
      try {
        await navigator.share({ title: certificate.title, text: `${names.join(' & ')}: ${certificate.title}`, url: link });
        return;
      } catch {
        return; // dismissed
      }
    }
    copyLink();
  };

  const download = async () => {
    const result = await downloadCertificate(id);
    if (!result.success) toast.error(result.error || 'Failed to download certificate.');
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-6 md:pt-8">
      <Link to="/certificates" className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-bold hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />Certificates
      </Link>

      <div className={zoom ? 'overflow-x-auto rounded-2xl' : ''}>
        <CertificateArt
          id={id}
          className={zoom ? 'min-w-[900px]' : ''}
          alt={`${level} level certificate for ${names.join(' and ') || 'the certificate holders'}, issued ${formatDate(certificate.createdAt)}. Certificate number ${number ?? 'pending'}.`}
        />
      </div>
      <button type="button" onClick={() => setZoom((z) => !z)} aria-pressed={zoom} className="btn btn-ghost btn-sm mx-auto mt-2 flex md:hidden">
        {zoom ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
        {zoom ? 'Fit to screen' : 'Zoom in'}
      </button>

      <section aria-label="Sharing" className="card mt-5 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="leading-snug">
            <p id="verify-label" className="font-extrabold">Public verify link</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Anyone with it can confirm this is genuine. They see only names, level and date.</p>
          </div>
          <button type="button" role="switch" aria-checked={isPublic} aria-labelledby="verify-label" disabled={busy} onClick={toggleLink} className="toggle" />
        </div>
        {isPublic && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 py-1.5 pl-4 pr-1.5 dark:bg-gray-900">
            <input readOnly aria-label="Verify link" value={link} onFocus={(e) => e.target.select()} className="mono min-w-0 flex-1 bg-transparent text-xs outline-none" />
            <button type="button" onClick={copyLink} className="btn btn-secondary btn-sm"><Copy className="h-4 w-4" aria-hidden="true" />Copy</button>
          </div>
        )}
      </section>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={share} disabled={!isPublic} className="btn btn-primary btn-lg flex-1"><Share2 className="h-5 w-5" aria-hidden="true" />Share certificate</button>
        <button type="button" onClick={download} className="btn btn-secondary btn-lg flex-1"><Download className="h-5 w-5" aria-hidden="true" />Download</button>
      </div>
      {!isPublic && <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">Turn on the verify link to share this certificate.</p>}
    </div>
  );
};

export default RelationshipCertificateDisplay;
