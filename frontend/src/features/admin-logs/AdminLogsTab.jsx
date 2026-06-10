import { AlertCircle, History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLogs } from '../../services/adminService.js';

export function AdminLogsTab() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await getLogs();
        setLogs(response.data?.logs ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (isLoading) {
    return <p className="loading-state">Loading admin logs...</p>;
  }

  return (
    <section className="content-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">System Auditing</p>
          <h2>Admin Activity Logs</h2>
        </div>
      </div>

      {error ? (
        <div className="error-toast">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button className="icon-button" onClick={() => setError('')}>&times;</button>
        </div>
      ) : null}

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  No activity logs found.
                </td>
              </tr>
            ) : null}

            {logs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td><strong>@{log.admin.username}</strong></td>
                <td><span className="status-badge" data-status={log.action}>{log.action}</span></td>
                <td>{log.entity} {log.entityId ? `(#${log.entityId.slice(0, 8)})` : ''}</td>
                <td>
                  <pre style={{ margin: 0, fontSize: '0.8rem', whiteSpace: 'pre-wrap', color: '#657287' }}>
                    {log.details ? JSON.stringify(JSON.parse(log.details), null, 2) : '-'}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
