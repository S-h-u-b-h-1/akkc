import { CheckCircle2, XCircle } from 'lucide-react';

import { TASK_STATUSES } from '../../constants/task.js';
import { formatDate, formatStatus } from '../../utils/formatters.js';

const isDoneActionDisabled = (task) => task.storedStatus === TASK_STATUSES.COMPLETED;

const isNotDoneActionDisabled = (task) => task.storedStatus === TASK_STATUSES.NOT_DONE;

export function EmployeeTaskTable({ isLoading, onMarkDone, onMarkNotDone, tasks }) {
  return (
    <section className="content-panel">
      <div className="panel-header table-panel-header">
        <div>
          <p className="eyebrow">Assigned work</p>
          <h2>My tasks</h2>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Domain</th>
              <th>Client name</th>
              <th>Status</th>
              <th>Due date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="empty-cell">
                  Loading assigned tasks...
                </td>
              </tr>
            ) : null}

            {!isLoading && tasks.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">
                  No tasks are assigned to you right now.
                </td>
              </tr>
            ) : null}

            {!isLoading
              ? tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="primary-cell">{task.title}</td>
                    <td>{task.domain}</td>
                    <td>{task.clientName}</td>
                    <td>
                      <span className={`status-pill ${task.status?.toLowerCase()}`}>
                        {formatStatus(task.status ?? TASK_STATUSES.PENDING)}
                      </span>
                    </td>
                    <td className={task.status === TASK_STATUSES.DELAYED ? 'delayed-date' : undefined}>
                      {formatDate(task.dueDate)}
                    </td>
                    <td>
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
