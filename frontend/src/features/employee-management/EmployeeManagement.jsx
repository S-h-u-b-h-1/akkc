import { UserPlus } from 'lucide-react';
import { useState } from 'react';

const initialForm = {
  name: '',
  email: '',
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
        email: form.email,
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
          <p className="eyebrow">Team access</p>
          <h2>Employee management</h2>
        </div>
      </div>

      <form className="employee-form" onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input name="name" value={form.name} onChange={updateField} required />
        </label>

        <label>
          <span>Email</span>
          <input name="email" type="email" value={form.email} onChange={updateField} required />
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
          <span>Department</span>
          <input name="department" value={form.department} onChange={updateField} />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button fit-button" type="submit" disabled={isSubmitting}>
          <UserPlus size={17} aria-hidden="true" />
          <span>{isSubmitting ? 'Creating...' : 'Create credentials'}</span>
        </button>
      </form>

      <div className="employee-list">
        {employees.length === 0 ? (
          <p className="empty-note">No employees have been created yet.</p>
        ) : null}

        {employees.map((employee) => (
          <article className="employee-row" key={employee.id}>
            <div>
              <strong>{employee.name}</strong>
              <span>{employee.email}</span>
            </div>
            <small>{employee.department ?? 'No department'}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
