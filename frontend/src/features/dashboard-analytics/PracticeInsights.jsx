import {
  BriefcaseBusiness,
  CalendarDays,
  ChartBar,
  ClipboardCheck,
  UsersRound
} from 'lucide-react';

import { CA_COMPLIANCE_CHECKPOINTS, CA_SERVICE_LINES } from '../../constants/firm.js';
import { TASK_STATUSES } from '../../constants/task.js';
import { formatDate } from '../../utils/formatters.js';

const MAX_VISIBLE_ITEMS = 5;
const OPEN_STATUSES = new Set([TASK_STATUSES.PENDING, TASK_STATUSES.DELAYED]);

const createStatusSummary = (name, id = name) => ({
  id,
  name,
  totalTasks: 0,
  pendingTasks: 0,
  completedTasks: 0,
  notDoneTasks: 0,
  delayedTasks: 0
});

const incrementSummary = (summary, status) => {
  summary.totalTasks += 1;

  if (status === TASK_STATUSES.PENDING) {
    summary.pendingTasks += 1;
  }

  if (status === TASK_STATUSES.COMPLETED) {
    summary.completedTasks += 1;
  }

  if (status === TASK_STATUSES.NOT_DONE) {
    summary.notDoneTasks += 1;
  }

  if (status === TASK_STATUSES.DELAYED) {
    summary.delayedTasks += 1;
  }
};

const sortByTotalWork = (items) =>
  [...items].sort((left, right) => {
    if (right.totalTasks !== left.totalTasks) {
      return right.totalTasks - left.totalTasks;
    }

    return left.name.localeCompare(right.name);
  });

const deriveGroupsFromTasks = (tasks, getKey, getName) => {
  const groups = new Map();

  tasks.forEach((task) => {
    const key = getKey(task) || 'Unassigned';
    const name = getName(task) || 'Unassigned';

    if (!groups.has(key)) {
      groups.set(key, createStatusSummary(name, key));
    }

    incrementSummary(groups.get(key), task.status ?? TASK_STATUSES.PENDING);
  });

  return sortByTotalWork(Array.from(groups.values()));
};

const normalizeServerGroups = (groups = []) =>
  sortByTotalWork(
    groups.map((group) => ({
      id: group.id ?? group.name,
      name: group.name ?? 'Unknown',
      totalTasks: group.totalTasks ?? 0,
      pendingTasks: group.pendingTasks ?? 0,
      completedTasks: group.completedTasks ?? 0,
      notDoneTasks: group.notDoneTasks ?? 0,
      delayedTasks: group.delayedTasks ?? 0
    }))
  );

const createServiceSummary = (tasks) => {
  const serviceGroups = new Map(
    CA_SERVICE_LINES.map((serviceLine) => [
      serviceLine,
      createStatusSummary(serviceLine)
    ])
  );

  tasks.forEach((task) => {
    const serviceLine = task.domain || 'Other CA work';

    if (!serviceGroups.has(serviceLine)) {
      serviceGroups.set(serviceLine, createStatusSummary(serviceLine));
    }

    incrementSummary(serviceGroups.get(serviceLine), task.status ?? TASK_STATUSES.PENDING);
  });

  return sortByTotalWork(
    Array.from(serviceGroups.values()).filter((group) => group.totalTasks > 0)
  );
};

const getDueTimestamp = (task) => {
  const dueDate = new Date(task.dueDate);
  const timestamp = dueDate.getTime();

  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
};

const getDueSoonTasks = (tasks) =>
  [...tasks]
    .filter((task) => OPEN_STATUSES.has(task.status ?? TASK_STATUSES.PENDING))
    .sort((left, right) => getDueTimestamp(left) - getDueTimestamp(right))
    .slice(0, MAX_VISIBLE_ITEMS);

function InsightList({ emptyText, items, renderItem }) {
  if (items.length === 0) {
    return <p className="empty-note insight-empty">{emptyText}</p>;
  }

  return <div className="insight-list">{items.map(renderItem)}</div>;
}

function ProgressList({ emptyText, items }) {
  const maxTotal = Math.max(...items.map((item) => item.totalTasks), 1);

  return (
    <InsightList
      emptyText={emptyText}
      items={items}
      renderItem={(item) => {
        const width = `${Math.max((item.totalTasks / maxTotal) * 100, 8)}%`;

        return (
          <article className="insight-row progress-row" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>
                {item.totalTasks} total, {item.pendingTasks + item.delayedTasks} open
              </span>
            </div>
            <div className="progress-track" aria-hidden="true">
              <span className="progress-fill" style={{ width }} />
            </div>
          </article>
        );
      }}
    />
  );
}

export function PracticeInsights({ isLoading = false, scope = 'admin', stats, tasks = [] }) {
  const isAdminView = scope === 'admin';
  const dueSoonTasks = getDueSoonTasks(tasks);
  const serviceSummary = createServiceSummary(tasks).slice(0, MAX_VISIBLE_ITEMS);
  const clientSummary = normalizeServerGroups(stats?.tasksByClient?.length ? stats.tasksByClient : []).slice(
    0,
    MAX_VISIBLE_ITEMS
  );
  const derivedClientSummary = clientSummary.length
    ? clientSummary
    : deriveGroupsFromTasks(tasks, (task) => task.clientName, (task) => task.clientName).slice(
        0,
        MAX_VISIBLE_ITEMS
      );
  const employeeSummary = normalizeServerGroups(
    stats?.tasksByEmployee?.length ? stats.tasksByEmployee : []
  ).slice(0, MAX_VISIBLE_ITEMS);
  const derivedEmployeeSummary = employeeSummary.length
    ? employeeSummary
    : deriveGroupsFromTasks(
        tasks,
        (task) => task.assignedEmployeeId,
        (task) => task.assignedEmployee?.name
      ).slice(0, MAX_VISIBLE_ITEMS);

  return (
    <section className="practice-insights" aria-busy={isLoading}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">CA practice control</p>
          <h2>{isAdminView ? 'Firm workload insights' : 'My work priorities'}</h2>
        </div>
        <span>{isLoading ? 'Refreshing...' : `${tasks.length} assignments in view`}</span>
      </div>

      <div className="insights-grid">
        <article className="insight-panel wide">
          <div className="insight-panel-header">
            <ClipboardCheck size={20} aria-hidden="true" />
            <div>
              <p className="eyebrow">Priority queue</p>
              <h3>Due soon and delayed</h3>
            </div>
          </div>
          <InsightList
            emptyText="No pending or delayed assignments in this view."
            items={dueSoonTasks}
            renderItem={(task) => {
              const effectiveStatus = task.status ?? TASK_STATUSES.PENDING;

              return (
                <article className="insight-row due-row" key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <span>
                      {task.clientName} | {task.domain}
                    </span>
                  </div>
                  <div className="due-meta">
                    <span className={`status-pill ${effectiveStatus.toLowerCase()}`}>
                      {effectiveStatus === TASK_STATUSES.DELAYED ? 'Delayed' : 'Pending'}
                    </span>
                    <small>{formatDate(task.dueDate)}</small>
                  </div>
                </article>
              );
            }}
          />
        </article>

        <article className="insight-panel">
          <div className="insight-panel-header">
            <ChartBar size={20} aria-hidden="true" />
            <div>
              <p className="eyebrow">Practice mix</p>
              <h3>Service-line load</h3>
            </div>
          </div>
          <ProgressList emptyText="No service-line workload yet." items={serviceSummary} />
        </article>

        <article className="insight-panel">
          <div className="insight-panel-header">
            <BriefcaseBusiness size={20} aria-hidden="true" />
            <div>
              <p className="eyebrow">Clients</p>
              <h3>Client workload</h3>
            </div>
          </div>
          <ProgressList emptyText="No client workload yet." items={derivedClientSummary} />
        </article>

        {isAdminView ? (
          <article className="insight-panel">
            <div className="insight-panel-header">
              <UsersRound size={20} aria-hidden="true" />
              <div>
                <p className="eyebrow">Capacity</p>
                <h3>Staff workload</h3>
              </div>
            </div>
            <ProgressList emptyText="No staff workload yet." items={derivedEmployeeSummary} />
          </article>
        ) : null}

        <article className="insight-panel calendar-panel">
          <div className="insight-panel-header">
            <CalendarDays size={20} aria-hidden="true" />
            <div>
              <p className="eyebrow">Compliance rhythm</p>
              <h3>Statutory checkpoints</h3>
            </div>
          </div>
          <div className="calendar-list">
            {CA_COMPLIANCE_CHECKPOINTS.slice(0, MAX_VISIBLE_ITEMS).map((checkpoint) => (
              <article className="calendar-item" key={`${checkpoint.title}-${checkpoint.due}`}>
                <strong>{checkpoint.title}</strong>
                <span>{checkpoint.domain}</span>
                <small>
                  {checkpoint.cadence} | {checkpoint.due}
                </small>
              </article>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
