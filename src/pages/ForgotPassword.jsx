import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import AuthLayout from '../components/AuthLayout';

const ForgotPassword = () => {
  const { forgotPassword } = useAuthStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await forgotPassword(email);
    setSubmitting(false);
    if (result.success) {
      setSent(true);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={sent ? undefined : 'Enter your email and we will send you a link. It works for one hour.'}
      footer={<Link to="/login" className="font-bold text-rose-700 hover:underline dark:text-rose-300">Back to sign in</Link>}
    >
      {sent ? (
        <p className="card-soft mt-4 p-4 text-[15px] leading-relaxed">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to reset your password. It expires in 1 hour.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="field-label">Email address</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full">
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
