import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { BrandLogo } from '../../components/BrandLogo.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { getDashboardRouteForRole } from '../../utils/authRedirects.js';

export function AuthForm({
  alternateLink,
  credentialField = {
    autoComplete: 'username',
    label: 'Username',
    name: 'username',
    type: 'text'
  },
  eyebrow,
  onSubmit,
  role,
  submitLabel,
  title
}) {
  const { completeAuth, isAuthenticated, role: currentRole } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dashboardRoute = getDashboardRouteForRole(role);
  const requestedPath = location.state?.from?.pathname;
  const roleBasePath = dashboardRoute.split('/dashboard')[0];
  const redirectTo = requestedPath?.startsWith(roleBasePath) ? requestedPath : dashboardRoute;

  if (isAuthenticated) {
    return <Navigate to={getDashboardRouteForRole(currentRole)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      [credentialField.name]: String(formData.get(credentialField.name) ?? '').trim(),
      password: String(formData.get('password') ?? '')
    };

    try {
      const response = await onSubmit(payload);
      const token = response.data?.token;
      const user = response.data?.user;

      if (!token || !user?.role) {
        throw new Error('Authentication response was incomplete.');
      }

      completeAuth({ token, user });
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      if (submitError.errors && submitError.errors.length > 0) {
        const details = submitError.errors
          .map((err) => `${err.field.replace('body.', '')}: ${err.message}`)
          .join(', ');
        setError(`${submitError.message} (${details})`);
      } else {
        setError(submitError.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-heading">
          <BrandLogo className="auth-logo" showText={false} />
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 id="auth-title">{title}</h1>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>{credentialField.label}</span>
            <input
              name={credentialField.name}
              type={credentialField.type}
              autoComplete={credentialField.autoComplete}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength="8"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Please wait...' : submitLabel}</span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </form>

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          {alternateLink ? (
            <Link className="auth-switch-link" to={alternateLink.to}>
              {alternateLink.label}
            </Link>
          ) : null}
          <Link className="auth-switch-link" to="/">
            Go back to home page
          </Link>
        </div>
      </section>
    </main>
  );
}
