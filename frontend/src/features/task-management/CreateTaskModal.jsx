import { X } from 'lucide-react';
import { useState } from 'react';

import { CA_ASSIGNMENT_TEMPLATES, CA_SERVICE_LINES } from '../../constants/firm.js';

const initialForm = {
  employeeId: '',
  templateKey: '',
  title: '',
  domain: '',
  clientName: '',
  dueDate: '',
  isHighPriority: false
};

export function CreateTaskModal({ employees, isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const updateField = (event) => {
    const { checked, name, type, value } = event.target;

    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const updateTemplate = (event) => {
    const nextTemplateKey = event.target.value;
    const selectedTemplate = CA_ASSIGNMENT_TEMPLATES.find(
      (template) => template.label === nextTemplateKey
    );

    setForm({
      ...form,
      templateKey: nextTemplateKey,
      title: selectedTemplate?.title ?? form.title,
      domain: selectedTemplate?.domain ?? form.domain
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        employeeId: form.employeeId,
        title: form.title,
        domain: form.domain,
        clientName: form.clientName,
        dueDate: form.dueDate,
        isHighPriority: form.isHighPriority
      };
      await onSubmit(payload);
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
            <p className="eyebrow">Client work</p>
            <h2 id="create-task-title">Create assignment</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Staff member</span>
            <select name="employeeId" value={form.employeeId} onChange={updateField} required>
              <option value="">Select staff member</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  @{employee.username}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>CA workflow template</span>
            <select name="templateKey" value={form.templateKey} onChange={updateTemplate}>
              <option value="">Start from blank assignment</option>
              {CA_ASSIGNMENT_TEMPLATES.map((template) => (
                <option key={template.label} value={template.label}>
                  {template.label}
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
              <option value="">Select service line</option>
              {CA_SERVICE_LINES.map((serviceLine) => (
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

          <label className="checkbox-field">
            <input
              checked={form.isHighPriority}
              name="isHighPriority"
              type="checkbox"
              onChange={updateField}
            />
            <span>Mark as high priority</span>
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button fit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create assignment'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
