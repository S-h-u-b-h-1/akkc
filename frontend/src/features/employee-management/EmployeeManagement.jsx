import { Pencil, Trash2, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

const initialForm = {
  username: '',
  password: ''
};

const createEditForm = (employee) => ({
  username: employee.username ?? '',
  password: ''
});

export function EmployeeManagement({
  employees,
  onCreateEmployee,
  onDeleteEmployee,
  onUpdateEmployee
}) {
  const [form, setForm] = useState(initialForm);
  const [employeeBeingEdited, setEmployeeBeingEdited] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        username: form.username,
        password: form.password
      };

      await onCreateEmployee(payload);
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="content-panel employee-panel">
      <div className="panel-header section-heading">
        <div>
          <p className="eyebrow">Firm team</p>
          <h2>Staff credential management</h2>
        </div>
        <span className="use-case-chip">Total Team Size: {employees.length}</span>
      </div>

      <form className="employee-form" onSubmit={handleSubmit}>
        <label>
          <span>Username</span>
          <input
            autoComplete="username"
            name="username"
            value={form.username}
            onChange={updateField}
            required
          />
        </label>

        <label>
          <span>Password</span>
          <input
            autoComplete="new-password"
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            minLength="8"
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button fit-button" type="submit" disabled={isSubmitting}>
          <UserPlus size={17} aria-hidden="true" />
          <span>{isSubmitting ? 'Creating...' : 'Create staff login'}</span>
        </button>
      </form>

      <div className="employee-list">
        {employees.length === 0 ? (
          <p className="empty-note">No staff credentials have been created yet.</p>
        ) : null}

        {employees.map((employee) => (
          <article className="employee-row" key={employee.id}>
            <div>
              <strong>@{employee.username}</strong>
              <span>Staff login</span>
            </div>
            <small>Credential account</small>
            <div className="row-actions">
              <button
                className="icon-button"
                type="button"
                aria-label={`Edit ${employee.username}`}
                onClick={() => setEmployeeBeingEdited(employee)}
              >
                <Pencil size={16} aria-hidden="true" />
              </button>
              <button
                className="icon-button danger"
                type="button"
                aria-label={`Delete ${employee.username}`}
                onClick={() => onDeleteEmployee(employee)}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {employeeBeingEdited ? (
        <EditEmployeeModal
          employee={employeeBeingEdited}
          onClose={() => setEmployeeBeingEdited(null)}
          onSubmit={onUpdateEmployee}
        />
      ) : null}
    </section>
  );
}

function EditEmployeeModal({ employee, onClose, onSubmit }) {
  const [form, setForm] = useState(() => createEditForm(employee));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload = {
      username: form.username
    };

    if (form.password.trim()) {
      payload.password = form.password;
    }

    try {
      await onSubmit(employee.id, payload);
      onClose();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="edit-employee-title">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Staff credentials</p>
            <h2 id="edit-employee-title">Edit login credentials</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Username</span>
            <input
              autoComplete="username"
              name="username"
              value={form.username}
              onChange={updateField}
              required
            />
          </label>

          <label>
            <span>New password</span>
            <input
              autoComplete="new-password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              minLength="8"
              placeholder="Leave blank to keep current password"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button fit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save credentials'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
