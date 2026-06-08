import { Trash2 } from 'lucide-react';

import { formatDate } from '../../utils/formatters.js';

export function DataMaintenance({
  archivedAdmins,
  archivedEmployees,
  isLoading,
  onDeleteAdmin,
  onDeleteEmployee
}) {
  return (
    <div className="data-maintenance-grid">
      <CleanupPanel
        emptyText="No archived staff credentials are waiting for cleanup."
        eyebrow="Archived staff"
	        isLoading={isLoading}
	        records={archivedEmployees}
	        renderMeta={() => 'Staff credential'}
	        title="Staff database cleanup"
	        onDelete={onDeleteEmployee}
      />

      <CleanupPanel
        emptyText="No archived admin credentials are waiting for cleanup."
        eyebrow="Archived admins"
        isLoading={isLoading}
	        records={archivedAdmins}
	        renderMeta={(admin) =>
	          admin.createdByAdmin?.username ? `Created by @${admin.createdByAdmin.username}` : 'Admin account'
	        }
        title="Admin database cleanup"
        onDelete={onDeleteAdmin}
      />
    </div>
  );
}

function CleanupPanel({ emptyText, eyebrow, isLoading, records, renderMeta, title, onDelete }) {
  return (
    <section className="content-panel cleanup-panel" aria-busy={isLoading}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="cleanup-note">
        Permanent delete removes the archived login record from the online database. Existing
        assignment history stays visible.
      </div>

      <div className="cleanup-list">
        {isLoading ? <p className="empty-note">Loading archived records...</p> : null}

        {!isLoading && records.length === 0 ? <p className="empty-note">{emptyText}</p> : null}

        {!isLoading
          ? records.map((record) => (
	              <article className="cleanup-row" key={record.id}>
	                <div>
	                  <strong>{record.username ? `@${record.username}` : 'Archived login'}</strong>
	                  <span>Credential account</span>
	                </div>
                <small>
                  {renderMeta(record)} · Archived {record.deletedAt ? formatDate(record.deletedAt) : '-'}
                </small>
                <button
                  className="danger-action"
                  type="button"
                  onClick={() => onDelete(record)}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  <span>Delete permanently</span>
                </button>
              </article>
            ))
          : null}
      </div>
    </section>
  );
}
