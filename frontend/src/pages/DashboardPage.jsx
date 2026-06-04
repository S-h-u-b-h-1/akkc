const metrics = [
  { label: 'Open tasks', value: '0', tone: 'blue' },
  { label: 'Due today', value: '0', tone: 'amber' },
  { label: 'Completed', value: '0', tone: 'green' },
  { label: 'Employees', value: '0', tone: 'violet' }
];

export function DashboardPage() {
  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric) => (
          <article className={`metric-card ${metric.tone}`} key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <section className="content-panel">
        <div className="panel-header">
          <h2>Daily task overview</h2>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Due date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" className="empty-cell">
                  No task records are available yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
