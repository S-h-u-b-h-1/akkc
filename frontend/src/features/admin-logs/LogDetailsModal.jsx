import { X } from 'lucide-react';

export function LogDetailsModal({ log, onClose }) {
  if (!log) return null;

  const adminName = log.admin.username;
  let parsedDetails = {};
  
  try {
    if (log.details) {
      parsedDetails = JSON.parse(log.details);
    }
  } catch (err) {
    // ignore
  }

  const getNaturalDescription = () => {
    switch (log.action) {
      case 'CREATE_TASK':
        if (parsedDetails.title) {
          let desc = `${adminName} created ${parsedDetails.title} task`;
          if (parsedDetails.assigneeUsername) {
            desc += ` for ${parsedDetails.assigneeUsername}`;
          }
          if (parsedDetails.isHighPriority) {
            desc += ` and marked as high priority`;
          }
          return desc;
        }
        return `${adminName} created a new task.`;

      case 'UPDATE_TASK':
        if (parsedDetails.updatedFields) {
          let desc = `${adminName} updated a task`;
          if (parsedDetails.title) desc += ` (${parsedDetails.title})`;
          if (parsedDetails.assigneeUsername) {
            desc += ` and reassigned it to ${parsedDetails.assigneeUsername}`;
          }
          desc += `. Changed fields: ${parsedDetails.updatedFields.join(', ')}`;
          return desc;
        }
        return `${adminName} updated a task.`;

      case 'DELETE_TASK':
        if (parsedDetails.title) {
          return `${adminName} deleted the task: ${parsedDetails.title}`;
        }
        return `${adminName} deleted a task.`;

      case 'CREATE_ADMIN':
        if (parsedDetails.username) {
          return `${adminName} created a new admin account for ${parsedDetails.username}`;
        }
        return `${adminName} created a new admin account.`;

      case 'CREATE_BILL':
      case 'CREATE_MANUAL_BILL':
      case 'CREATE_CLUBBED_BILL':
        if (parsedDetails.billNumber) {
          return `${adminName} generated a new bill (${parsedDetails.billNumber}) of type ${parsedDetails.type || 'unknown'}`;
        }
        return `${adminName} generated a new bill.`;

      case 'UPDATE_BILL':
        if (parsedDetails.updatedFields) {
          return `${adminName} updated a bill. Changed fields: ${parsedDetails.updatedFields.join(', ')}`;
        }
        return `${adminName} updated a bill.`;

      case 'CANCEL_BILL':
        if (parsedDetails.billNumber) {
          return `${adminName} canceled bill ${parsedDetails.billNumber}`;
        }
        return `${adminName} canceled a bill.`;

      case 'EMAIL_BILL':
        if (parsedDetails.billNumber) {
          return `${adminName} emailed bill ${parsedDetails.billNumber} to the client`;
        }
        return `${adminName} emailed a bill.`;

      case 'UPDATE_BILLING_ENTITY':
        if (parsedDetails.name) {
          return `${adminName} updated the billing entity '${parsedDetails.name}'`;
        }
        return `${adminName} updated a billing entity.`;

      default:
        return `${adminName} performed ${log.action} on ${log.entity}`;
    }
  };

  const description = getNaturalDescription();

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="log-details-title">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Log Description</p>
            <h2 id="log-details-title">Activity Details</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.5', color: '#0f172a' }}>
              {description}
            </p>
          </div>
          
          <div>
            <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Raw Data</p>
            <pre style={{ 
              margin: 0, 
              padding: '1rem', 
              fontSize: '0.85rem', 
              whiteSpace: 'pre-wrap', 
              color: '#334155',
              background: '#f1f5f9',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0'
            }}>
              {log.details ? JSON.stringify(parsedDetails, null, 2) : 'No details available'}
            </pre>
          </div>

          <div className="modal-actions" style={{ marginTop: '0.5rem' }}>
            <button className="secondary-button" type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
