import { ROUTES, USER_ROLES } from '../constants/routes.js';
import { AuthForm } from '../features/auth/AuthForm.jsx';
import { employeeLogin } from '../services/authService.js';

export function EmployeeLoginPage() {
  return (
    <AuthForm
      alternateLink={{ label: 'Admin sign in', to: ROUTES.ADMIN_LOGIN }}
      credentialField={{
        autoComplete: 'username',
        label: 'Username',
        name: 'username',
        type: 'text'
      }}
      eyebrow="A K Kataruka and Company"
      onSubmit={employeeLogin}
      role={USER_ROLES.EMPLOYEE}
      submitLabel="Sign in to staff workspace"
      title="Staff sign in"
    />
  );
}
