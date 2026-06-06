import { X } from 'lucide-react';
import { useState } from 'react';

import { CA_SERVICE_LINES } from '../../constants/firm.js';
import { TASK_STATUS_OPTIONS } from '../../constants/task.js';
import { toDateInputValue } from '../../utils/formatters.js';

const createFormState = (task) => ({
  employeeId: task.assignedEmployeeId ?? '',
  title: task.title ?? '',
  domain: task.domain ?? '',
  clientName: task.clientName ?? '',
  dueDate: toDateInputValue(task.dueDate),
  status: task.storedStatus ?? task.status
});

export function EditTaskModal({ employees, onClose, onSubmit, task }) {
  const [form, setForm] = useState(() => createFormState(task));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const serviceLineOptions = CA_SERVICE_LINES.includes(form.domain)
    ? CA_SERVICE_LINES
    : [form.domain, ...CA_SERVICE_LINES].filter(Boolean);

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
      await onSubmit(task.id, form);
      onClose();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="edit-task-title">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Client work</p>
            <h2 id="edit-task-title">Edit assignment</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Staff member</span>
            <select name="employeeId" value={form.employeeId} onChange={updateField} required>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Status</span>
            <select name="status" value={form.status} onChange={updateField} required>
              {TASK_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Assignment title</span>
            <input name="title" value={form.title} onChange={updateField} required />
          </label>

          <label>
            <span>Service line</span>
            <select name="domain" value={form.domain} onChange={updateField} required>
              {serviceLineOptions.map((serviceLine) => (
                <option key={serviceLine} value={serviceLine}>
                  {serviceLine}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Client / entity</span>
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
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
