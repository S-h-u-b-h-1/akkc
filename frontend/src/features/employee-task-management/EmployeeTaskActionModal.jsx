import { X } from 'lucide-react';
import { useState } from 'react';

const actionContent = Object.freeze({
  done: {
    eyebrow: 'Complete task',
    title: 'Mark as done',
    fieldLabel: 'Remark',
    placeholder: 'Add a completion remark',
    requiredMessage: 'Remark is required.',
    submitLabel: 'Submit remark',
    submittingLabel: 'Submitting...'
  },
  notDone: {
    eyebrow: 'Task outcome',
    title: 'Mark as not done',
    fieldLabel: 'Reason',
    placeholder: 'Explain why this task was not completed',
    requiredMessage: 'Reason is required.',
    submitLabel: 'Submit reason',
    submittingLabel: 'Submitting...'
  }
});

export function EmployeeTaskActionModal({ action, onClose, onSubmit, task }) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [value, setValue] = useState('');
  const content = actionContent[action];

  if (!task || !content) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setError(content.requiredMessage);
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit(trimmedValue);
      onClose();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="employee-task-action-title">
        <div className="modal-header">
          <div>
            <p className="eyebrow">{content.eyebrow}</p>
            <h2 id="employee-task-action-title">{content.title}</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="form-grid task-action-form" onSubmit={handleSubmit}>
          <div className="task-action-context">
            <strong>{task.title}</strong>
            <span>{task.clientName}</span>
          </div>

          <label>
            <span>{content.fieldLabel}</span>
            <textarea
              minLength="1"
              name="taskOutcome"
              placeholder={content.placeholder}
              required
              rows="5"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button fit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? content.submittingLabel : content.submitLabel}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
