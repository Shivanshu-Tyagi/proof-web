import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    const result = await resetPassword(token, password);
    setSubmitting(false);
    if (result.success) {
      toast.success('Password updated. You are now signed in.');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Pick something you have not used before. We will sign you in afterwards."
      footer={<Link to="/forgot-password" className="font-bold text-rose-700 hover:underline dark:text-rose-300">Request a new link</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput id="password" label="New password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <PasswordInput id="confirm" label="Confirm new password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full">
          {submitting ? 'Saving…' : 'Reset password'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
