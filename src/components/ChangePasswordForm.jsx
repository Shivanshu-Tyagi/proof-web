import { useState } from 'react';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';

const ChangePasswordForm = () => {
  const { changePassword } = useAuthStore();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (form.newPassword !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    const result = await changePassword(form.currentPassword, form.newPassword);
    setSubmitting(false);
    if (result.success) {
      toast.success('Password changed. Other devices have been signed out.');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mt-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change password</h2>
      {[
        ['currentPassword', 'Current password', 'current-password'],
        ['newPassword', 'New password', 'new-password'],
        ['confirm', 'Confirm new password', 'new-password'],
      ].map(([name, label, autoComplete]) => (
        <div key={name}>
          <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
          <input id={name} name={name} type="password" required autoComplete={autoComplete} value={form[name]} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
        </div>
      ))}
      <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
        {submitting ? 'Saving…' : 'Update password'}
      </button>
    </form>
  );
};

export default ChangePasswordForm;
