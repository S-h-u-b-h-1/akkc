import { Pencil, Trash2 } from 'lucide-react';

import { TASK_STATUSES } from '../../constants/task.js';
import { formatDate, formatStatus } from '../../utils/formatters.js';

const getLatestRemark = (task) => {
  const latestUpdate = task.updates?.[0];

  if (!latestUpdate) {
    return '-';
  }

  return latestUpdate.remark || latestUpdate.reason || '-';
};

export function TaskTable({ isLoading, onDelete, onEdit, tasks }) {
  return (
    <section className="content-panel" aria-busy={isLoading}>
      <div className="panel-header table-panel-header">
        <div>
          <p className="eyebrow">Client work</p>
          <h2>Assignments</h2>
        </div>
      </div>

      <div className="table-wrap">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Service line</th>
              <th>Client / entity</th>
              <th>Staff member</th>
              <th>Status</th>
              <th>Latest note / reason</th>
              <th>Due date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" className="empty-cell">
                  Loading tasks...
                </td>
              </tr>
            ) : null}

            {!isLoading && tasks.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-cell">
                  No assignments match the current view.
                </td>
              </tr>
            ) : null}

            {!isLoading
              ? tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="primary-cell" data-label="Assignment">
                      {task.title}
                    </td>
                    <td data-label="Service line">{task.domain}</td>
                    <td data-label="Client / entity">{task.clientName}</td>
                    <td data-label="Staff member">{task.assignedEmployee?.name ?? '-'}</td>
                    <td data-label="Status">
                      <span className={`status-pill ${task.status?.toLowerCase()}`}>
                        {formatStatus(task.status ?? TASK_STATUSES.PENDING)}
                      </span>
                    </td>
                    <td className="wrap-cell" data-label="Latest note / reason">
                      {getLatestRemark(task)}
                    </td>
                    <td data-label="Due date">{formatDate(task.dueDate)}</td>
                    <td data-label="Actions">
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          type="button"
                          aria-label={`Edit ${task.title}`}
                          onClick={() => onEdit(task)}
                        >
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                        <button
                          className="icon-button danger"
                          type="button"
                          aria-label={`Delete ${task.title}`}
                          onClick={() => onDelete(task)}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
