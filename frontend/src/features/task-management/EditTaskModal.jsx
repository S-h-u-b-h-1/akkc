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
  clientEmail: task.clientEmail ?? '',
  dueDate: toDateInputValue(task.dueDate),
  status: task.storedStatus ?? task.status,
  isHighPriority: Boolean(task.isHighPriority),
  isBillable: Boolean(task.isBillable),
  billAmount: task.billAmount ?? ''
});

export function EditTaskModal({ employees, onClose, onSubmit, task }) {
  const [form, setForm] = useState(() => createFormState(task));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const serviceLineOptions = CA_SERVICE_LINES.includes(form.domain)
    ? CA_SERVICE_LINES
    : [form.domain, ...CA_SERVICE_LINES].filter(Boolean);

  const updateField = (event) => {
    const { checked, name, type, value } = event.target;

    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = { ...form };
      if (!payload.isBillable) {
        payload.billAmount = undefined;
      } else if (payload.billAmount) {
        payload.billAmount = Number(payload.billAmount);
      }
      
      await onSubmit(task.id, payload);
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
                  @{employee.username}
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

          <label>
            <span>Client email (optional for billing)</span>
            <input name="clientEmail" type="email" value={form.clientEmail} onChange={updateField} />
          </label>

          <label className="checkbox-field">
            <input
              checked={form.isBillable}
              name="isBillable"
              type="checkbox"
              onChange={updateField}
            />
            <span>Is this task billable?</span>
          </label>

          {form.isBillable && (
            <label>
              <span>Bill amount (INR)</span>
              <input 
                name="billAmount" 
                type="number" 
                min="0" 
                step="0.01" 
                value={form.billAmount} 
                onChange={updateField} 
                required 
              />
            </label>
          )}

          <label className="checkbox-field">
            <input
              checked={form.isHighPriority}
              name="isHighPriority"
              type="checkbox"
              onChange={updateField}
            />
            <span>High priority assignment</span>
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
