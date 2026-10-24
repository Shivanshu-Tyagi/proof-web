import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award, Check, ChevronRight, Clock, History, Lock, MessagesSquare, Plus, Settings, Unlock } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import useRelationshipStore from '../store/relationshipStore';
import useTermStore from '../store/termStore';
import useMilestoneStore from '../store/milestoneStore';
import useActivityStore from '../store/activityStore';
import useCertificateStore from '../store/certificateStore';
import Scene from '../components/Scene';
import Modal from '../components/Modal';
import EndRelationshipModal from '../components/EndRelationshipModal';
import DurationChoice from '../components/DurationChoice';
import PrivateNote from '../components/PrivateNote';
import { AvatarPair } from '../components/Avatar';
import { TYPE_LABELS, statusMeta, typeLabel } from '../utils/relationships';
import { otherPerson } from '../utils/people';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'terms', label: 'Agreements' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'activities', label: 'Moments' },
  { id: 'certificates', label: 'Certificates' },
];

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

const idOf = (value) => value?._id ?? value;

const AddLink = ({ to, children }) => (
  <Link to={to} className="btn btn-secondary btn-sm"><Plus className="h-4 w-4" aria-hidden="true" />{children}</Link>
);

const Empty = ({ title, text, to, cta }) => (
  <div className="card-soft p-8 text-center">
    <h3 className="text-lg">{title}</h3>
    <p className="page-sub mx-auto mb-4 mt-1 max-w-sm">{text}</p>
    {to && <Link to={to} className="btn btn-primary">{cta}</Link>}
  </div>
);

const RelationshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentRelationship, getRelationship, isLoading, generateRelationshipCertificate,
    requestHistoryAccess, grantHistoryAccess, requestTypeChange, acceptTypeChange, declineTypeChange, cancelTypeChange,
  } = useRelationshipStore();
  const { terms, getTerms, agreeTerm } = useTermStore();
  const { milestones, getAllMilestones } = useMilestoneStore();
  const { activities, getActivities } = useActivityStore();
  const { certificates, getCertificates } = useCertificateStore();

  const [tab, setTab] = useState('overview');
  const [typeModal, setTypeModal] = useState(false);
  const [newType, setNewType] = useState('');
  const [typeMessage, setTypeMessage] = useState('');
  const [endMode, setEndMode] = useState(null);
  const [busy, setBusy] = useState(false);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!id) return;
    getRelationship(id);
    getTerms(id);
    getAllMilestones(id);
    getActivities(id);
    getCertificates(id);
  }, [id, getRelationship, getTerms, getAllMilestones, getActivities, getCertificates]);

  const relationship = currentRelationship?._id === id ? currentRelationship : null;

  if (!relationship) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading…</p>
        ) : (
          <div>
            <h1 className="text-2xl">Relationship not found</h1>
            <Link to="/relationships" className="btn btn-primary mt-4">Back to people</Link>
          </div>
        )}
      </div>
    );
  }

  const other = otherPerson(relationship, user?.id);
  const status = statusMeta(relationship.status);
  const isActive = relationship.status === 'active';
  const latestCertificate = relationship.latestCertificate;

  const typeRequest = relationship.typeChangeRequest?.requested ? relationship.typeChangeRequest : null;
  const iRequestedType = typeRequest && idOf(typeRequest.requestedBy) === user?.id;

  const access = relationship.historyAccess;
  const requesterId = idOf(access?.requestedBy);
  const grantActive = access?.granted && (!access.expiresAt || new Date(access.expiresAt) > new Date());
  const unanswered = access?.requested && !access?.granted && !access?.grantedAt;
  const hasHistoryAccess = grantActive && requesterId === user?.id;
  const requestedByMe = unanswered && requesterId === user?.id;
  const declinedForMe = access?.requested && !access?.granted && access?.grantedAt && requesterId === user?.id;
  const expiredForMe = access?.granted && !grantActive && requesterId === user?.id;
  const requestedByPartner = access?.requested && !grantActive && requesterId === other?._id && (unanswered || !access?.granted);
  const grantDays = access?.expiresAt ? Math.max(1, Math.ceil((new Date(access.expiresAt) - Date.now()) / 86400000)) : null;

  const breakupRequestedByMe = idOf(relationship.breakupRequestedBy) === user?.id;

  const run = async (fn, success) => {
    setBusy(true);
    const result = await fn();
    setBusy(false);
    if (result?.success) {
      if (success) toast.success(success);
      getRelationship(id);
    } else {
      toast.error(result?.error ?? 'Something went wrong');
    }
    return result;
  };

  const agreedCount = terms.filter((t) => (t.agreedBy?.length ?? 0) >= 2).length;
  const doneMilestones = milestones.filter((m) => m.status === 'completed').length;

  const handleGenerate = async () => {
    const result = await generateRelationshipCertificate(id);
    if (result.success) {
      toast.success('Certificate generated');
      navigate(`/certificates/${result.certificate._id}/display`);
    } else {
      toast.error(result.error || 'Failed to generate certificate.');
    }
  };

  const sendTypeChange = async () => {
    if (!newType || newType === relationship.type) {
      toast.error('Please select a different relationship type');
      return;
    }
    const result = await requestTypeChange(id, { newType, message: typeMessage || undefined });
    if (result.success) {
      toast.success('Type change request sent');
      setTypeModal(false);
      setTypeMessage('');
    } else {
      toast.error(result.error);
    }
  };

  const agree = async (termId) => {
    const result = await agreeTerm(termId);
    if (result.success) {
      toast.success('You agreed');
      getTerms(id);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      {/* Hero */}
      <Scene seed={relationship._id} className="h-40 md:h-52 md:rounded-b-[28px]">
        <Link to="/relationships" aria-label="Back to people" className="btn btn-icon absolute left-4 top-4 border-white bg-white text-gray-900 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
      </Scene>

      <div className="relative -mt-5 rounded-t-3xl bg-white px-5 pt-5 dark:bg-gray-900 md:mt-0 md:rounded-none md:px-10 md:pt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <AvatarPair people={[user, other]} size="lg" />
            <div className="min-w-0">
              <h1 className="text-2xl leading-tight md:text-3xl">{relationship.title || 'Untitled relationship'}</h1>
              <p className="text-gray-600 dark:text-gray-400">with {other?.firstName} {other?.lastName}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`badge ${status.cls}`}>{status.label}</span>
                <span className="badge badge-neutral">{typeLabel(relationship.type)}</span>
                {typeRequest && <span className="badge badge-warn">Type change pending</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isActive && (
              latestCertificate ? (
                <Link to={`/certificates/${latestCertificate._id}/display`} className="btn btn-primary"><Award className="h-4 w-4" aria-hidden="true" />View certificate</Link>
              ) : (
                <button type="button" onClick={handleGenerate} className="btn btn-primary"><Award className="h-4 w-4" aria-hidden="true" />Generate Relationship Certificate</button>
              )
            )}
            {(isActive || relationship.status === 'requested_breakup') && (
              <Link to={`/messages/${id}`} className="btn btn-secondary"><MessagesSquare className="h-4 w-4" aria-hidden="true" />Message</Link>
            )}
            <Link to={`/relationships/${id}/settings`} className="btn btn-secondary"><Settings className="h-4 w-4" aria-hidden="true" />Settings</Link>
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Relationship sections" className="-mx-5 mt-6 flex overflow-x-auto border-b border-gray-200 px-5 dark:border-gray-700 md:mx-0 md:px-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`shrink-0 border-b-[3px] px-1 py-3 mr-6 min-h-[48px] text-sm font-bold ${
                tab === t.id ? 'border-rose-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="py-6">
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { l: 'Agreements', v: `${agreedCount} of ${terms.length}`, n: 'agreed by both' },
                  { l: 'Milestones', v: `${doneMilestones} of ${milestones.length}`, n: 'completed' },
                  { l: 'Moments', v: activities.length, n: 'shared' },
                  { l: 'Together', v: `${relationship.duration ?? 0}`, n: 'days' },
                ].map((s) => (
                  <div key={s.l} className="card p-4">
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{s.l}</p>
                    <p className="text-2xl font-extrabold tracking-tight">{s.v}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{s.n}</p>
                  </div>
                ))}
              </div>

              {typeRequest && (
                <section aria-label="Type change request" className="rounded-[20px] border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-900/20">
                  <h3 className="text-lg">Type change requested</h3>
                  <p className="mt-1 text-[15px]">
                    {iRequestedType ? 'You asked to change' : `${other?.firstName} asked to change`} this from <strong>{typeLabel(relationship.type)}</strong> to <strong>{typeLabel(typeRequest.newType)}</strong>.
                  </p>
                  {typeRequest.message && <p className="mt-1 text-sm italic text-gray-700 dark:text-gray-300">&ldquo;{typeRequest.message}&rdquo;</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {iRequestedType ? (
                      <button type="button" disabled={busy} className="btn btn-secondary" onClick={() => run(() => cancelTypeChange(id), 'Request withdrawn')}>Withdraw request</button>
                    ) : (
                      <>
                        <button type="button" disabled={busy} className="btn btn-primary" onClick={() => run(() => acceptTypeChange(id), 'Type updated')}>Accept</button>
                        <button type="button" disabled={busy} className="btn btn-secondary" onClick={() => run(() => declineTypeChange(id), 'Request declined')}>Decline</button>
                      </>
                    )}
                  </div>
                </section>
              )}

              {/* Privacy and history */}
              <section aria-labelledby="priv-h" className="card p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200"><Lock className="h-[18px] w-[18px]" aria-hidden="true" /></span>
                  <h2 id="priv-h" className="text-lg">Privacy and history</h2>
                </div>
                <p className="mb-4 text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">
                  You can ask {other?.firstName} to let you see their relationship history. They decide, and can take it back any time.
                </p>
                <div className="flex flex-wrap gap-2">
                  {hasHistoryAccess ? (
                    <>
                      <Link to={`/history/${other?._id}`} className="btn btn-secondary"><History className="h-4 w-4" aria-hidden="true" />View History</Link>
                      {grantDays && <span className="self-center text-sm text-gray-600 dark:text-gray-400">Access ends in {grantDays} {grantDays === 1 ? 'day' : 'days'}</span>}
                    </>
                  ) : requestedByMe ? (
                    <span className="btn btn-secondary cursor-default text-amber-900 dark:text-amber-200" aria-disabled="true"><Clock className="h-4 w-4" aria-hidden="true" />History Request Sent</span>
                  ) : requestedByPartner ? (
                    <>
                      <div className="w-full"><p className="field-label">How long?</p><DurationChoice value={days} onChange={setDays} /></div>
                      <button type="button" disabled={busy} className="btn btn-primary" onClick={() => run(() => grantHistoryAccess(id, true, days), 'History access granted!')}><Unlock className="h-4 w-4" aria-hidden="true" />Grant Access</button>
                      <button type="button" disabled={busy} className="btn btn-secondary" onClick={() => run(() => grantHistoryAccess(id, false), 'History access denied!')}><Lock className="h-4 w-4" aria-hidden="true" />Deny Access</button>
                    </>
                  ) : (
                    <>
                      {(declinedForMe || expiredForMe) && (
                        <span className="self-center text-sm text-gray-600 dark:text-gray-400">{expiredForMe ? 'Your access has ended.' : `${other?.firstName} declined.`}</span>
                      )}
                      <button type="button" disabled={busy} className="btn btn-secondary" onClick={() => run(() => requestHistoryAccess(id), 'History access request sent!')}><History className="h-4 w-4" aria-hidden="true" />Request History Access</button>
                    </>
                  )}
                </div>
              </section>

              <section aria-label="Details" className="card divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  ['Started', formatDate(relationship.startDate)],
                  ['Accepted', formatDate(relationship.acceptedDate)],
                  ['Last interaction', formatDate(relationship.stats?.lastInteraction)],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between px-5 py-3.5 text-[15px]"><span className="text-gray-600 dark:text-gray-400">{k}</span><span className="font-bold">{v}</span></div>
                ))}
                {relationship.description && <p className="px-5 py-3.5 text-[15px] leading-relaxed">{relationship.description}</p>}
              </section>

              {['requested_breakup', 'ended'].includes(relationship.status) && <PrivateNote relationshipId={id} />}

              {(isActive || relationship.status === 'requested_breakup') && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {isActive && !typeRequest && (
                      <button type="button" className="btn btn-secondary" onClick={() => { setNewType(''); setTypeModal(true); }}>Change type</button>
                    )}
                  </div>
                  {isActive && <button type="button" className="btn btn-danger" onClick={() => setEndMode('ask')}>End relationship</button>}
                  {relationship.status === 'requested_breakup' && (
                    breakupRequestedByMe
                      ? <button type="button" className="btn btn-secondary" onClick={() => setEndMode('cancel')}>Withdraw request to end</button>
                      : <button type="button" className="btn btn-dark" onClick={() => setEndMode('confirm')}>Review request to end</button>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'terms' && (
            <div className="space-y-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="font-extrabold">{agreedCount} of {terms.length} agreed</p>
                {isActive && <AddLink to={`/terms/create?relationshipId=${id}`}>Add agreement</AddLink>}
              </div>
              {terms.length > 0 && (
                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700" role="progressbar" aria-valuenow={agreedCount} aria-valuemin={0} aria-valuemax={terms.length} aria-label="Agreements agreed by both">
                  <div className="h-full rounded-full bg-rose-500" style={{ width: `${terms.length ? (agreedCount / terms.length) * 100 : 0}%` }} />
                </div>
              )}
              {terms.length === 0 && <Empty title="No agreements yet" text="Write down what you both expect. Each of you confirms it." to={isActive ? `/terms/create?relationshipId=${id}` : undefined} cta="Add agreement" />}
              {terms.map((t) => {
                const mine = t.agreedBy?.some((a) => idOf(a.user) === user?.id);
                const both = (t.agreedBy?.length ?? 0) >= 2;
                return (
                  <div key={t._id} className="card flex flex-wrap items-center gap-3 p-4">
                    <Link to={`/terms/${t._id}`} className="min-w-0 flex-1 basis-56 leading-snug">
                      <p className="font-extrabold hover:underline">{t.title}</p>
                      <p className="text-sm capitalize text-gray-600 dark:text-gray-400">{String(t.category).replace('_', ' ')}</p>
                    </Link>
                    <span className={`badge ${both ? 'badge-ok' : mine ? 'badge-warn' : 'badge-rose'}`}>
                      {both ? 'Agreed by both' : mine ? `Waiting for ${other?.firstName}` : 'Needs you'}
                    </span>
                    {!mine && <button type="button" className="btn btn-primary btn-sm" onClick={() => agree(t._id)}>Agree</button>}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'milestones' && (
            <div className="space-y-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="font-extrabold">{doneMilestones} of {milestones.length} completed</p>
                {isActive && <AddLink to={`/milestones/create?relationshipId=${id}`}>Add milestone</AddLink>}
              </div>
              {milestones.length === 0 && <Empty title="No milestones yet" text="Pick something worth celebrating together." to={isActive ? `/milestones/create?relationshipId=${id}` : undefined} cta="Add milestone" />}
              {milestones.map((m) => (
                <Link key={m._id} to={`/milestones/${m._id}`} className="card flex items-center gap-3 p-4">
                  <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${m.status === 'completed' ? 'bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}>
                    {m.status === 'completed' ? <Check className="h-5 w-5" aria-hidden="true" /> : <Clock className="h-5 w-5" aria-hidden="true" />}
                  </span>
                  <div className="min-w-0 flex-1 leading-snug">
                    <p className="font-extrabold">{m.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{m.targetDate ? `Due ${formatDate(m.targetDate)}` : 'No date'}{m.rewards?.points ? ` · ${m.rewards.points} pts` : ''}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-500" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}

          {tab === 'activities' && (
            <div className="space-y-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="font-extrabold">{activities.length} {activities.length === 1 ? 'moment' : 'moments'}</p>
                {isActive && <AddLink to={`/activities/create?relationshipId=${id}`}>Add a moment</AddLink>}
              </div>
              {activities.length === 0 && <Empty title="No moments yet" text="Add a memory, a plan or something you did together." to={isActive ? `/activities/create?relationshipId=${id}` : undefined} cta="Add a moment" />}
              {activities.map((a) => (
                <Link key={a._id} to={`/activities/${a._id}`} className="card flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1 leading-snug">
                    <p className="font-extrabold">{a.title}</p>
                    <p className="text-sm capitalize text-gray-600 dark:text-gray-400">{a.type} · {formatDate(a.createdAt)}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-500" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}

          {tab === 'certificates' && (
            <div className="space-y-3">
              {certificates.length === 0 && (
                <Empty
                  title="No certificates yet"
                  text="Once you both agree, you can issue a certificate to share."
                  to={undefined}
                />
              )}
              {certificates.length === 0 && isActive && (
                <div className="text-center"><button type="button" onClick={handleGenerate} className="btn btn-primary">Generate Relationship Certificate</button></div>
              )}
              {certificates.map((c) => (
                <Link key={c._id} to={`/certificates/${c._id}/display`} className="card flex items-center gap-3 p-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"><Award className="h-5 w-5" aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1 leading-snug">
                    <p className="font-extrabold">{c.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(c.createdAt)}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-500" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {typeModal && (
        <Modal
          title="Suggest a different type"
          onClose={() => setTypeModal(false)}
          footer={<>
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setTypeModal(false)}>Cancel</button>
            <button type="button" className="btn btn-primary flex-1" onClick={sendTypeChange}>Send request</button>
          </>}
        >
          <p className="page-sub mb-4">{other?.firstName} needs to agree before anything changes. Today you are: <strong>{typeLabel(relationship.type)}</strong>.</p>
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="New type">
            {Object.entries(TYPE_LABELS).filter(([k]) => k !== relationship.type).map(([key, label]) => (
              <button key={key} type="button" aria-pressed={newType === key} onClick={() => setNewType(key)} className={`chip ${newType === key ? 'chip-on' : ''}`}>{label}</button>
            ))}
          </div>
          <label htmlFor="type-note" className="field-label">Add a note (optional)</label>
          <textarea id="type-note" className="input" rows={3} value={typeMessage} onChange={(e) => setTypeMessage(e.target.value)} />
        </Modal>
      )}

      {endMode && (
        <EndRelationshipModal relationship={relationship} other={other} mode={endMode === 'ask' ? undefined : endMode} onClose={() => setEndMode(null)} />
      )}
    </div>
  );
};

export default RelationshipDetail;
