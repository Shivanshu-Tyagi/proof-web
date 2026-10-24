import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import FieldError from '../components/FieldError';
import useFormErrors from '../utils/useFormErrors';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  const from = location.state?.from?.pathname || '/dashboard';

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

  const { errors, clear, fail, aria } = useFormErrors();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clear(e.target.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const found = {};
    if (!formData.email.trim()) found.email = 'Enter your email address.';
    if (!formData.password) found.password = 'Enter your password.';
    if (Object.keys(found).length) {
      fail(found);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    }
  };

  return (
    <AuthLayout
      title="Make it official with the people you trust."
      subtitle="Agree on what matters, celebrate milestones, and keep a record only you two control."
      footer={<>New here? <Link to="/signup" className="font-bold text-rose-700 hover:underline dark:text-rose-300">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="input"
            {...aria('email')}
          />
          <FieldError name="email" errors={errors} />
        </div>
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          required
          error={errors.password}
          value={formData.password}
          onChange={handleChange}
        />
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-bold text-rose-700 hover:underline dark:text-rose-300">
            Forgot your password?
          </Link>
        </div>
        <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
