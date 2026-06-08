import { X } from 'lucide-react';
import { useState } from 'react';

const actionContent = Object.freeze({
  done: {
    eyebrow: 'Complete assignment',
    title: 'Mark as done',
    fieldLabel: 'Completion note',
    placeholder: 'Add a brief note about the filing, review, or client follow-up completed',
    requiredMessage: 'Completion note is required.',
    submitLabel: 'Submit note',
    submittingLabel: 'Submitting...'
  },
  notDone: {
    eyebrow: 'Assignment outcome',
    title: 'Mark as not done',
    fieldLabel: 'Blocker reason',
    placeholder: 'Explain what is blocking this client work',
    requiredMessage: 'Reason is required.',
    submitLabel: 'Submit reason',
    submittingLabel: 'Submitting...'
  }
});

export function EmployeeTaskActionModal({ action, onClose, onSubmit, task }) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [value, setValue] = useState('');
  const [shouldProceedForBilling, setShouldProceedForBilling] = useState(null);
  const [billingRemarks, setBillingRemarks] = useState('');
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

    const showBillingConfirmation =
      action === 'done' &&
      task.isBillable &&
      task.billingApprovalStatus === 'PENDING_EMPLOYEE_CONFIRMATION';

    if (showBillingConfirmation && shouldProceedForBilling === null) {
      setError('Please select if this task should proceed for billing.');
      return;
    }

    if (showBillingConfirmation && shouldProceedForBilling === false && !billingRemarks.trim()) {
      setError('Please provide a reason why this task should not proceed for billing.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const payload = showBillingConfirmation 
        ? { remark: trimmedValue, shouldProceedForBilling, billingRemarks: billingRemarks.trim() } 
        : trimmedValue;
        
      await onSubmit(payload);
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

          {action === 'done' && task.isBillable && task.billingApprovalStatus === 'PENDING_EMPLOYEE_CONFIRMATION' && (
            <div className="billing-confirmation">
              <fieldset>
                <legend>Should this task proceed for billing?</legend>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="shouldProceedForBilling"
                    value="yes"
                    checked={shouldProceedForBilling === true}
                    onChange={() => setShouldProceedForBilling(true)}
                  />
                  Yes
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="shouldProceedForBilling"
                    value="no"
                    checked={shouldProceedForBilling === false}
                    onChange={() => setShouldProceedForBilling(false)}
                  />
                  No
                </label>
              </fieldset>

              <label>
                <span>Billing remarks {shouldProceedForBilling === false ? '(Required)' : '(Optional)'}</span>
                <input
                  name="billingRemarks"
                  value={billingRemarks}
                  onChange={(e) => setBillingRemarks(e.target.value)}
                  placeholder="Any notes regarding billing"
                />
              </label>
            </div>
          )}

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
