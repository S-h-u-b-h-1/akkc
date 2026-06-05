import { ROUTES, USER_ROLES } from '../constants/routes.js';
import { AuthForm } from '../features/auth/AuthForm.jsx';
import { adminLogin } from '../services/authService.js';

export function AdminLoginPage() {
  return (
    <AuthForm
      alternateLink={{ label: 'Create an admin account', to: ROUTES.ADMIN_SIGNUP }}
      eyebrow="Admin workspace"
      onSubmit={adminLogin}
      role={USER_ROLES.ADMIN}
      submitLabel="Sign in as admin"
      title="Admin sign in"
    />
  );
}
