import { AlertTriangle, CheckCircle2, Clock3, ClipboardList, Flag, XCircle, DollarSign, Wallet } from 'lucide-react';

const statCards = [
  { key: 'totalTasks', label: 'Total assignments', icon: ClipboardList, tone: 'blue' },
  { key: 'highPriorityTasks', label: 'High priority', icon: Flag, tone: 'rose' },
  { key: 'unbilledTasks', label: 'Unbilled ready', icon: Wallet, tone: 'amber' },
  { key: 'unbilledValue', label: 'Unbilled value', icon: DollarSign, tone: 'red' },
  { key: 'billedValue', label: 'Billed value', icon: CheckCircle2, tone: 'green' }
];

export function TaskStatsCards({ isLoading = false, stats }) {
  const formatValue = (key, value) => {
    if (key === 'unbilledValue' || key === 'billedValue') {
      return `₹${Number(value || 0).toLocaleString('en-IN')}`;
    }
    return value || 0;
  };
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
                {isLoading ? '...' : formatValue(stat.key, stats?.[stat.key])}
              </strong>
            </div>
          </article>
        );
      })}
    </section>
  );
}
