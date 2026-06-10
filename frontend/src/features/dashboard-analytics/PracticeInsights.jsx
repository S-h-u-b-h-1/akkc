import {
  AlertTriangle,
  BriefcaseBusiness,
  ChartBar,
  Flag,
  ListChecks,
  UsersRound
} from 'lucide-react';

import { CA_SERVICE_LINES } from '../../constants/firm.js';
import { TASK_STATUSES } from '../../constants/task.js';
import { formatDate, formatStatus } from '../../utils/formatters.js';

const MAX_VISIBLE_ITEMS = 5;
const OPEN_STATUSES = new Set([TASK_STATUSES.PENDING, TASK_STATUSES.DELAYED]);
const FOLLOW_UP_STATUSES = new Set([TASK_STATUSES.NOT_DONE]);

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

const sortPriorityTasks = (tasks) =>
  [...tasks]
    .sort((left, right) => {
      if (Boolean(left.isHighPriority) !== Boolean(right.isHighPriority)) {
        return left.isHighPriority ? -1 : 1;
      }

      if (left.status !== right.status) {
        if (left.status === TASK_STATUSES.DELAYED) {
          return -1;
        }

        if (right.status === TASK_STATUSES.DELAYED) {
          return 1;
        }
      }

      return getDueTimestamp(left) - getDueTimestamp(right);
    });

const getOpenTasks = (tasks) =>
  tasks.filter((task) => OPEN_STATUSES.has(task.status ?? TASK_STATUSES.PENDING));

const getHighPriorityTasks = (tasks) =>
  sortPriorityTasks(getOpenTasks(tasks).filter((task) => task.isHighPriority)).slice(
    0,
    MAX_VISIBLE_ITEMS
  );

const getDelayedTasks = (tasks) =>
  sortPriorityTasks(tasks.filter((task) => task.status === TASK_STATUSES.DELAYED)).slice(
    0,
    MAX_VISIBLE_ITEMS
  );

const getFollowUpTasks = (tasks) =>
  sortPriorityTasks(tasks.filter((task) => FOLLOW_UP_STATUSES.has(task.status))).slice(
    0,
    MAX_VISIBLE_ITEMS
  );

const getDueSoonTasks = (tasks) =>
  sortPriorityTasks(getOpenTasks(tasks))
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
            <div className="progress-row-header">
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

function PriorityTaskList({ emptyText, isAdminView, tasks }) {
  if (tasks.length === 0) {
    return <p className="empty-note priority-empty">{emptyText}</p>;
  }

  return (
    <div className="priority-task-list">
      {tasks.map((task) => {
        const effectiveStatus = task.status ?? TASK_STATUSES.PENDING;

        return (
          <article className="priority-task-item" key={task.id}>
            <div>
              <strong>{task.title}</strong>
              <span>
                {task.clientName} | {task.domain}
	                {isAdminView && task.assignedEmployee?.username
	                  ? ` | @${task.assignedEmployee.username}`
                  : ''}
              </span>
            </div>
            <div className="priority-task-meta">
              {task.isHighPriority ? <span className="priority-pill high">High</span> : null}
              <span className={`status-pill ${effectiveStatus.toLowerCase()}`}>
                {formatStatus(effectiveStatus)}
              </span>
              <small>{formatDate(task.dueDate)}</small>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function PriorityLane({ description, emptyText, icon: Icon, isAdminView, tasks, title }) {
  return (
    <section className="priority-lane">
      <div className="priority-lane-header">
        <Icon size={17} aria-hidden="true" />
        <div>
          <h4>{title}</h4>
          <span>{description}</span>
        </div>
      </div>
      <PriorityTaskList emptyText={emptyText} isAdminView={isAdminView} tasks={tasks} />
    </section>
  );
}

export function PracticeInsights({ isLoading = false, scope = 'admin', stats, tasks = [] }) {
  const isAdminView = scope === 'admin';
  const highPriorityTasks = getHighPriorityTasks(tasks);
  const delayedTasks = getDelayedTasks(tasks);
  const followUpTasks = getFollowUpTasks(tasks);
  const dueSoonTasks = getDueSoonTasks(tasks);
  const openTasks = getOpenTasks(tasks);
  const openTaskCount = openTasks.length;
  const highPriorityOpenCount = openTasks.filter((task) => task.isHighPriority).length;
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
	        (task) => (task.assignedEmployee?.username ? `@${task.assignedEmployee.username}` : undefined)
	      ).slice(0, MAX_VISIBLE_ITEMS);

  return (
    <section className="practice-insights" aria-busy={isLoading}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">CA practice control</p>
          <h2>{isAdminView ? 'Firm workload insights' : 'My work priorities'}</h2>
        </div>
        <span>
          {isLoading
            ? 'Refreshing...'
            : `${highPriorityOpenCount} high priority | ${openTaskCount} open`}
        </span>
      </div>

      <div className="insights-grid">
        <article className="insight-panel wide">
          <div className="insight-panel-header">
            <Flag size={20} aria-hidden="true" />
            <div>
              <p className="eyebrow">Live priority board</p>
              <h3>{isAdminView ? 'Firm work that needs attention' : 'My next actions'}</h3>
            </div>
          </div>
          <div className="priority-lanes">
            <PriorityLane
              description="Urgent open assignments"
              emptyText="No high priority open work."
              icon={Flag}
              isAdminView={isAdminView}
              tasks={highPriorityTasks}
              title="High priority"
            />
            <PriorityLane
              description="Past due and still open"
              emptyText="No delayed assignments."
              icon={AlertTriangle}
              isAdminView={isAdminView}
              tasks={delayedTasks}
              title="Delayed"
            />
            <PriorityLane
              description="Needs admin or client follow-up"
              emptyText="No not-done follow-ups."
              icon={ListChecks}
              isAdminView={isAdminView}
              tasks={followUpTasks}
              title="Follow-ups"
            />
            <PriorityLane
              description="Sorted by priority and due date"
              emptyText="No open assignments."
              icon={BriefcaseBusiness}
              isAdminView={isAdminView}
              tasks={dueSoonTasks}
              title="Next due"
            />
          </div>
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
      </div>
    </section>
  );
}
