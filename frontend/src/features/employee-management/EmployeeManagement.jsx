import { UserPlus } from 'lucide-react';
import { useState } from 'react';

const initialForm = {
  name: '',
  username: '',
  password: '',
  department: ''
};

export function EmployeeManagement({ employees, onCreateEmployee }) {
  const [form, setForm] = useState(initialForm);
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
        name: form.name,
        username: form.username,
        password: form.password,
        department: form.department || null
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
      <div className="panel-header">
        <div>
          <p className="eyebrow">Firm team</p>
          <h2>Staff credential management</h2>
        </div>
      </div>

      <form className="employee-form" onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input name="name" value={form.name} onChange={updateField} required />
        </label>

        <label>
          <span>Username</span>
          <input name="username" value={form.username} onChange={updateField} required />
        </label>

        <label>
          <span>Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            minLength="8"
            required
          />
        </label>

        <label>
          <span>Practice area</span>
          <input name="department" value={form.department} onChange={updateField} />
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
              <strong>{employee.name}</strong>
              <span>@{employee.username}</span>
            </div>
            <small>{employee.department ?? 'No practice area'}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
