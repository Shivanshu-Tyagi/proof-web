import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Check, FileText, Lock } from 'lucide-react';
import axios from 'axios';
import Brand from '../components/Brand';
import useAuthStore from '../store/authStore';

// What a friend lands on when they open someone's invite link.
// Signed out: who invited them and how to join. Signed in: straight to a ready-made request.
const Connect = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, searchUserByRegistrationId } = useAuthStore();
  const signedIn = isAuthenticated();
  const [state, setState] = useState({ status: 'loading' }); // loading | invited | invalid | self

  useEffect(() => {
    let cancelled = false;
    if (signedIn) {
      if (user?.registrationId === registrationId) { setState({ status: 'self' }); return undefined; }
      searchUserByRegistrationId(registrationId).then((result) => {
        if (cancelled) return;
        if (result.success) navigate('/relationships/invite', { replace: true, state: { prefilledPartner: result.user } });
        else setState({ status: 'invalid' });
      });
    } else {
      axios.get(`/auth/connect/${encodeURIComponent(registrationId)}`)
        .then((res) => { if (!cancelled) setState({ status: 'invited', name: res.data.firstName }); })
        .catch(() => { if (!cancelled) setState({ status: 'invalid' }); });
    }
    return () => { cancelled = true; };
  }, [registrationId, signedIn, user?.registrationId, navigate, searchUserByRegistrationId]);

  const back = { from: { pathname: location.pathname } };
  const { status, name } = state;

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
      <Link to="/" className="self-center" aria-label="Proof home"><Brand /></Link>

      {status === 'loading' && <p className="text-center text-gray-600 dark:text-gray-400">Opening your invite…</p>}

      {status === 'invalid' && (
        <div className="card p-6 text-center">
          <h1 className="text-xl">This invite link is not valid</h1>
          <p className="page-sub mt-2">It may have been copied wrongly, or the person has left Proof. Ask them to send it again.</p>
          <Link to={signedIn ? '/dashboard' : '/'} className="btn btn-secondary mt-4">{signedIn ? 'Go to your home' : 'See what Proof is'}</Link>
        </div>
      )}

      {status === 'self' && (
        <div className="card p-6 text-center">
          <h1 className="text-xl">This is your own invite link</h1>
          <p className="page-sub mt-2">Send it to a friend. When they open it, they can sign up and send you a request.</p>
          <Link to="/dashboard" className="btn btn-primary mt-4">Back to home</Link>
        </div>
      )}

      {status === 'invited' && (
        <div className="card p-6 sm:p-8">
          <h1 className="text-center text-3xl leading-tight">{name} invited you to Proof</h1>
          <p className="page-sub mt-3 text-center">A private space for two people to write down promises, save memories and celebrate milestones.</p>
          <ul className="mt-5 space-y-3 text-[15px]">
            <li className="flex items-start gap-3"><Lock className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" aria-hidden="true" />Only the two of you can see it. Nothing is public.</li>
            <li className="flex items-start gap-3"><FileText className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" aria-hidden="true" />Agreements count once you both say yes.</li>
            <li className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" aria-hidden="true" />Setting up takes about a minute.</li>
          </ul>
          <Link to="/signup" state={back} className="btn btn-primary btn-lg mt-6 w-full">Create your account</Link>
          <Link to="/login" state={back} className="btn btn-secondary btn-lg mt-3 w-full">I already have an account</Link>
        </div>
      )}
    </div>
  );
};

export default Connect;
