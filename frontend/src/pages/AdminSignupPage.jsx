import { ROUTES, USER_ROLES } from '../constants/routes.js';
import { AuthForm } from '../features/auth/AuthForm.jsx';
import { adminSignup } from '../services/authService.js';

export function AdminSignupPage() {
  return (
    <AuthForm
      alternateLink={{ label: 'Already have an admin account?', to: ROUTES.ADMIN_LOGIN }}
      eyebrow="Firm administrator setup"
      includeName
      onSubmit={adminSignup}
      role={USER_ROLES.ADMIN}
      submitLabel="Create firm admin"
      title="Create admin account"
    />
  );
}
