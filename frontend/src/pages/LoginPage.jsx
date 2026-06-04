import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '../constants/routes.js';
import { useAuth } from '../hooks/useAuth.js';
import { signIn } from '../services/authService.js';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? ROUTES.DASHBOARD;

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    try {
      const response = await signIn({ email, password });
      const accessToken = response.data?.accessToken;

      if (!accessToken) {
        throw new Error('Authentication token was not returned.');
      }

      login(accessToken);
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <div>
          <p className="eyebrow">Employee Daily Tasks</p>
          <h1 id="login-title">Sign in</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email address</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>

          <label>
            <span>Password</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
