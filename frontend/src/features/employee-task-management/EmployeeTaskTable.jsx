import { CheckCircle2, XCircle } from 'lucide-react';

import { TASK_STATUSES } from '../../constants/task.js';
import { formatDate, formatStatus } from '../../utils/formatters.js';

const isDoneActionDisabled = (task) => task.storedStatus === TASK_STATUSES.COMPLETED;

const isNotDoneActionDisabled = (task) => task.storedStatus === TASK_STATUSES.NOT_DONE;

export function EmployeeTaskTable({ isLoading, onMarkDone, onMarkNotDone, tasks }) {
  return (
    <section className="content-panel" aria-busy={isLoading}>
      <div className="panel-header table-panel-header">
        <div>
          <p className="eyebrow">Client assignments</p>
          <h2>My work</h2>
        </div>
      </div>

      <div className="table-wrap">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Priority</th>
              <th>Service line</th>
              <th>Client / entity</th>
              <th>Status</th>
              <th>Due date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="empty-cell">
                  Loading assigned work...
                </td>
              </tr>
            ) : null}

            {!isLoading && tasks.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-cell">
                  No client work is assigned to you right now.
                </td>
              </tr>
            ) : null}

            {!isLoading
              ? tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="primary-cell" data-label="Assignment">
                      {task.title}
                    </td>
                    <td data-label="Priority">
                      <span className={`priority-pill ${task.isHighPriority ? 'high' : 'standard'}`}>
                        {task.isHighPriority ? 'High' : 'Standard'}
                      </span>
                    </td>
                    <td data-label="Service line">{task.domain}</td>
                    <td data-label="Client / entity">{task.clientName}</td>
                    <td data-label="Status">
                      <span className={`status-pill ${task.status?.toLowerCase()}`}>
                        {formatStatus(task.status ?? TASK_STATUSES.PENDING)}
                      </span>
                    </td>
                    <td
                      className={task.status === TASK_STATUSES.DELAYED ? 'delayed-date' : undefined}
                      data-label="Due date"
                    >
                      {formatDate(task.dueDate)}
                    </td>
                    <td data-label="Actions">
                      <div className="row-actions employee-row-actions">
                        <button
                          className="secondary-button action-button"
                          type="button"
                          disabled={isDoneActionDisabled(task)}
                          onClick={() => onMarkDone(task)}
                        >
                          <CheckCircle2 size={16} aria-hidden="true" />
                          <span>Done</span>
                        </button>
                        <button
                          className="secondary-button action-button danger-action"
                          type="button"
                          disabled={isNotDoneActionDisabled(task)}
                          onClick={() => onMarkNotDone(task)}
                        >
                          <XCircle size={16} aria-hidden="true" />
                          <span>Not done</span>
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
