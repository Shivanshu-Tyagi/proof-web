import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import FieldError from '../components/FieldError';
import SlowHint from '../components/SlowHint';
import useFormErrors from '../utils/useFormErrors';

const Field = ({ id, label, error, ...props }) => (
  <div>
    <label htmlFor={id} className="field-label">{label}</label>
    <input id={id} name={id} className="input" aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...props} />
    <FieldError name={id} errors={{ [id]: error }} />
  </div>
);

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard'; // an invite link sends people back to it after sign-up
  const { signup, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const [agreed, setAgreed] = useState(false);
  const { errors, clear, fail } = useFormErrors();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clear(e.target.name);
    if (e.target.name === 'password') clear('confirmPassword');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const found = {};
    if (!formData.firstName.trim()) found.firstName = 'Enter your first name.';
    if (!formData.lastName.trim()) found.lastName = 'Enter your last name.';
    if (!formData.username.trim()) found.username = 'Choose a username.';
    if (!formData.email.trim()) found.email = 'Enter your email address.';
    else if (!/^\S+@\S+\.\S{2,}$/.test(formData.email.trim())) found.email = 'That does not look like an email address.';
    if (!formData.password) found.password = 'Choose a password.';
    else if (formData.password.length < 8) found.password = 'Use at least 8 characters.';
    if (!formData.confirmPassword) found.confirmPassword = 'Type the password again to confirm it.';
    else if (formData.password && formData.password !== formData.confirmPassword) found.confirmPassword = 'The passwords do not match.';
    if (!agreed) found['agree-terms'] = 'Tick this to continue.';
    if (Object.keys(found).length) {
      fail(found);
      return;
    }

    const signupData = { ...formData };
    delete signupData.confirmPassword;
    const result = await signup(signupData);

    if (result.success) {
      const currentUser = useAuthStore.getState().user;
      toast.success(`Account created. Your Registration ID is ${currentUser.registrationId || 'ready on your home screen'}.`);
      navigate(from, { replace: true });
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes a minute. You get a Registration ID so people can find you without your email."
      footer={<>Already have an account? <Link to="/login" className="font-bold text-rose-700 hover:underline dark:text-rose-300">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Field id="firstName" label="First name" autoComplete="given-name" value={formData.firstName} onChange={handleChange} error={errors.firstName} />
          <Field id="lastName" label="Last name" autoComplete="family-name" value={formData.lastName} onChange={handleChange} error={errors.lastName} />
        </div>
        <Field id="username" label="Username" autoComplete="username" value={formData.username} onChange={handleChange} error={errors.username} />
        <Field id="email" label="Email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} error={errors.email} />
        <PasswordInput id="password" name="password" label="Password (8 or more characters)" autoComplete="new-password" value={formData.password} onChange={handleChange} error={errors.password} />
        <PasswordInput id="confirmPassword" name="confirmPassword" label="Confirm password" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />

        <label htmlFor="agree-terms" className="flex min-h-[44px] items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
          <input id="agree-terms" name="agree-terms" type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); clear('agree-terms'); }} aria-invalid={errors['agree-terms'] ? true : undefined} aria-describedby={errors['agree-terms'] ? 'agree-terms-error' : undefined} className="h-5 w-5 rounded border-gray-300 accent-rose-500" />
          <span>
            I agree to the <Link to="/terms-and-conditions" className="font-bold text-rose-700 hover:underline dark:text-rose-300">Terms</Link> and{' '}
            <Link to="/privacy-policy" className="font-bold text-rose-700 hover:underline dark:text-rose-300">Privacy Policy</Link>
          </span>
        </label>
        <FieldError name="agree-terms" errors={errors} />

        <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">
          {isLoading ? 'Creating account…' : 'Create account'}
        </button>
        <SlowHint active={isLoading} />
      </form>
    </AuthLayout>
  );
};

export default Signup;
