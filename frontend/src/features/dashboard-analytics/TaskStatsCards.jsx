import { AlertTriangle, CheckCircle2, Clock3, ClipboardList, XCircle } from 'lucide-react';

const statCards = [
  { key: 'totalTasks', label: 'Total assignments', icon: ClipboardList, tone: 'blue' },
  { key: 'pendingTasks', label: 'Pending', icon: Clock3, tone: 'amber' },
  { key: 'completedTasks', label: 'Completed', icon: CheckCircle2, tone: 'green' },
  { key: 'notDoneTasks', label: 'Not done', icon: XCircle, tone: 'red' },
  { key: 'delayedTasks', label: 'Delayed', icon: AlertTriangle, tone: 'violet' }
];

export function TaskStatsCards({ isLoading = false, stats }) {
  return (
    <section className="stats-grid" aria-busy={isLoading} aria-label="Task statistics">
      {statCards.map((stat) => {
        const Icon = stat.icon;

        return (
          <article className={`stat-card ${stat.tone}`} key={stat.key}>
            <div className="stat-card-icon">
              <Icon size={20} aria-hidden="true" />
            </div>
            <div>
              <span>{stat.label}</span>
              <strong className={isLoading ? 'loading-value' : undefined}>
                {isLoading ? '...' : (stats?.[stat.key] ?? 0)}
              </strong>
            </div>
          </article>
        );
      })}
    </section>
  );
}
