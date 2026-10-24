import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const ContactUs = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email ?? '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const change = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post('/contact', formData);
      toast.success(response.data.message || 'Your message has been sent successfully!');
      setSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send your message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-5 pb-12 pt-6 md:pt-8">
      <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost -ml-3 mb-2"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back</button>
      <h1 className="page-title">Contact us</h1>
      <p className="page-sub mb-6 mt-1">Questions, feedback, or a request about your data. We read everything.</p>

      {sent ? (
        <div className="card p-8 text-center" role="status">
          <span className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200"><Check className="h-6 w-6" aria-hidden="true" /></span>
          <h2 className="text-xl">Message sent</h2>
          <p className="page-sub mt-1">Thanks. If you asked for something, we will reply by email.</p>
          <button type="button" className="btn btn-secondary mt-5" onClick={() => { setSent(false); setFormData({ ...formData, subject: '', message: '' }); }}>Send another</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="name" className="field-label">Your name</label><input id="name" name="name" className="input" required autoComplete="name" value={formData.name} onChange={change} /></div>
            <div><label htmlFor="email" className="field-label">Your email</label><input id="email" name="email" type="email" className="input" required autoComplete="email" value={formData.email} onChange={change} /></div>
          </div>
          <div><label htmlFor="subject" className="field-label">Subject</label><input id="subject" name="subject" className="input" required maxLength={150} value={formData.subject} onChange={change} /></div>
          <div><label htmlFor="message" className="field-label">Message</label><textarea id="message" name="message" className="input" rows={6} required maxLength={2000} value={formData.message} onChange={change} /></div>
          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full">{submitting ? 'Sending…' : 'Send message'}</button>
        </form>
      )}
    </div>
  );
};

export default ContactUs;
