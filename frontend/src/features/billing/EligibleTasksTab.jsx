import { useState, useEffect } from 'react';
import { getEligibleTasksForBilling, createBill } from '../../services/billingService.js';
import { getAdminEmployees } from '../../services/adminService.js';
import { FilePlus, FileText, AlertCircle, RefreshCcw } from 'lucide-react';

export function EligibleTasksTab({ entities }) {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [taskFilters, setTaskFilters] = useState({ clientName: '', employeeId: '' });
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadEligibleTasks();
  }, [taskFilters]);

  // Set default entity
  useEffect(() => {
    if (entities.length > 0 && !selectedEntityId) {
      setSelectedEntityId(entities[0].id);
    }
  }, [entities, selectedEntityId]);

  const loadEmployees = async () => {
    try {
      const res = await getAdminEmployees();
      setEmployees(res.data?.employees || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEligibleTasks = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getEligibleTasksForBilling(taskFilters);
      setTasks(res.data?.tasks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBill = async () => {
    if (selectedTaskIds.length === 0) return;
    if (!selectedEntityId) {
      setError('Please select a Billing Entity');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await createBill(selectedTaskIds, selectedEntityId, billDate);
      setSelectedTaskIds([]);
      setSuccess('Bill created successfully!');
      loadEligibleTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTaskIds(prev => {
      if (prev.includes(taskId)) return prev.filter(id => id !== taskId);
      return [...prev, taskId];
    });
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.clientName]) acc[task.clientName] = [];
    acc[task.clientName].push(task);
    return acc;
  }, {});

  return (
    <div className="billing-section">
      {error && (
        <div className="error-toast">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button className="icon-button" onClick={() => setError('')}>&times;</button>
        </div>
      )}
      {success && (
        <div className="success-toast">
          <span>{success}</span>
          <button className="icon-button" onClick={() => setSuccess('')}>&times;</button>
        </div>
      )}

      <div className="filters card">
        <input 
          className="search-input"
          placeholder="Filter by Client Name..." 
          value={taskFilters.clientName} 
          onChange={e => setTaskFilters(prev => ({ ...prev, clientName: e.target.value }))}
        />
        <select 
          value={taskFilters.employeeId} 
          onChange={e => setTaskFilters(prev => ({ ...prev, employeeId: e.target.value }))}
        >
          <option value="">All Staff</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>@{emp.username}</option>
          ))}
        </select>
      </div>

      <div className="card billing-creation-bar">
        <div className="form-group row">
          <div style={{ flex: 1 }}>
            <label>Billing Entity</label>
            <select value={selectedEntityId} onChange={e => setSelectedEntityId(e.target.value)}>
              {entities.map(e => <option key={e.id} value={e.id}>{e.name} ({e.code})</option>)}
            </select>
          </div>
          <div style={{ width: '200px' }}>
            <label>Bill Date</label>
            <input type="date" value={billDate} onChange={e => setBillDate(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="primary-button" onClick={handleCreateBill} disabled={selectedTaskIds.length === 0 || isLoading}>
            {isLoading ? <RefreshCcw size={16} className="spin" /> : <FilePlus size={16} />}
            Create Bill ({selectedTaskIds.length} tasks)
          </button>
        </div>
      </div>

      <div className="grouped-tasks-container">
        {Object.keys(groupedTasks).length === 0 && !isLoading && (
          <div className="empty-state">
            <FileText size={48} className="empty-icon" />
            <h3>No eligible tasks found</h3>
            <p>Tasks must be marked "Completed", approved for billing, and not previously billed.</p>
          </div>
        )}

        {Object.entries(groupedTasks).map(([clientName, clientTasks]) => (
          <div key={clientName} className="client-group card">
            <div className="client-group-header">
              <h3>{clientName}</h3>
              <span className="task-count">{clientTasks.length} task(s)</span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th width="50px">Select</th>
                    <th>Task Title</th>
                    <th>Amount</th>
                    <th>Staff</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {clientTasks.map(task => (
                    <tr key={task.id} className={selectedTaskIds.includes(task.id) ? 'selected-row' : ''}>
                      <td>
                        <input 
                          type="checkbox" 
                          className="custom-checkbox"
                          checked={selectedTaskIds.includes(task.id)}
                          onChange={() => toggleTaskSelection(task.id)}
                        />
                      </td>
                      <td>
                        <strong>{task.title}</strong>
                        <div className="cell-subtext">{task.domain}</div>
                      </td>
                      <td className="amount-cell">₹{Number(task.billAmount).toLocaleString('en-IN')}</td>
                      <td>@{task.assignedEmployee?.username}</td>
                      <td className="remarks-cell">{task.billingRemarks || <span className="empty-text">None</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
