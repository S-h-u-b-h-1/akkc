import { X } from 'lucide-react';
import { useState } from 'react';

const initialForm = {
  employeeId: '',
  title: '',
  domain: '',
  clientName: '',
  dueDate: ''
};

export function CreateTaskModal({ employees, isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

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
      await onSubmit(form);
      setForm(initialForm);
      onClose();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="create-task-title">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Task assignment</p>
            <h2 id="create-task-title">Create task</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Employee</span>
            <select name="employeeId" value={form.employeeId} onChange={updateField} required>
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Title</span>
            <input name="title" value={form.title} onChange={updateField} required />
          </label>

          <label>
            <span>Domain</span>
            <input name="domain" value={form.domain} onChange={updateField} required />
          </label>

          <label>
            <span>Client name</span>
            <input name="clientName" value={form.clientName} onChange={updateField} required />
          </label>

          <label>
            <span>Due date</span>
            <input name="dueDate" type="date" value={form.dueDate} onChange={updateField} required />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button fit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create task'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
