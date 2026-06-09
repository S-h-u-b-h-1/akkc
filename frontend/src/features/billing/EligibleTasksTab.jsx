import { useState, useEffect } from 'react';
import { getEligibleTasksForBilling, createBill } from '../../services/billingService.js';
import { getAdminEmployees } from '../../services/adminService.js';
import { FilePlus, FileText, AlertCircle, RefreshCcw, Eye } from 'lucide-react';

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

    // Verify all selected tasks belong to the same client
    const selectedTasks = tasks.filter(t => selectedTaskIds.includes(t.id));
    const firstClient = selectedTasks[0].clientName;
    if (selectedTasks.some(t => t.clientName !== firstClient)) {
      setError('You can only generate a bill for one client at a time. Please select tasks from the same client.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await createBill(selectedTaskIds, selectedEntityId, billDate);
      setSelectedTaskIds([]);
      setSuccess(`Bill created successfully for ${firstClient}!`);
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

  const toggleClientGroupSelection = (clientTasks, isSelected) => {
    const taskIds = clientTasks.map(t => t.id);
    if (isSelected) {
      // Add all client tasks
      setSelectedTaskIds(prev => [...new Set([...prev, ...taskIds])]);
    } else {
      // Remove all client tasks
      setSelectedTaskIds(prev => prev.filter(id => !taskIds.includes(id)));
    }
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

      <div className="card billing-creation-bar" style={{ position: 'sticky', top: '20px', zIndex: 10, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
        <div className="form-group row" style={{ marginBottom: 0, alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'none' }}>
            <label>Billing Entity</label>
            <select value={selectedEntityId} onChange={e => setSelectedEntityId(e.target.value)} style={{ margin: 0 }}>
              {entities.map(e => <option key={e.id} value={e.id}>{e.name} ({e.code})</option>)}
            </select>
          </div>
          <div style={{ width: '200px', marginLeft: 'auto' }}>
            <label>Bill Date</label>
            <input type="date" value={billDate} onChange={e => setBillDate(e.target.value)} style={{ margin: 0 }} />
          </div>
          <div style={{ paddingTop: '20px' }}>
            <button className="primary-button" onClick={handleCreateBill} disabled={selectedTaskIds.length === 0 || isLoading}>
              {isLoading ? <RefreshCcw size={16} className="spin" /> : <FilePlus size={16} />}
              Create Bill ({selectedTaskIds.length} selected)
            </button>
          </div>
        </div>
      </div>

      <div className="grouped-tasks-container mt-4">
        {Object.keys(groupedTasks).length === 0 && !isLoading && (
          <div className="empty-state card" style={{ padding: '40px' }}>
            <FileText size={48} className="empty-icon" />
            <h3>No eligible tasks found</h3>
            <p>Tasks must be marked "Completed", approved for billing, and not previously billed.</p>
          </div>
        )}

        {Object.entries(groupedTasks).map(([clientName, clientTasks]) => {
          const clientTaskIds = clientTasks.map(t => t.id);
          const isAllSelected = clientTaskIds.every(id => selectedTaskIds.includes(id));
          const isSomeSelected = clientTaskIds.some(id => selectedTaskIds.includes(id)) && !isAllSelected;

          return (
            <div key={clientName} className="client-group card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="client-group-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px', background: '#f8fafc' }}>
                <input 
                  type="checkbox"
                  className="custom-checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isSomeSelected;
                  }}
                  onChange={(e) => toggleClientGroupSelection(clientTasks, e.target.checked)}
                />
                <h3 style={{ margin: 0 }}>{clientName}</h3>
                <span className="task-count" style={{ marginLeft: 'auto' }}>{clientTasks.length} task(s)</span>
              </div>
              <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th width="50px"></th>
                      <th>Task Title</th>
                      <th>Amount</th>
                      <th>Staff</th>
                      <th>Remarks</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientTasks.map(task => (
                      <tr key={task.id} className={selectedTaskIds.includes(task.id) ? 'selected-row' : ''} onClick={() => toggleTaskSelection(task.id)} style={{ cursor: 'pointer' }}>
                        <td onClick={(e) => e.stopPropagation()}>
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
                        <td>
                          {task.uploadedBillPdfUrl ? (
                            <button 
                              className="action-button view"
                              onClick={(e) => { e.stopPropagation(); window.open(`${import.meta.env.VITE_API_URL}${task.uploadedBillPdfUrl}`, '_blank'); }}
                              title="Preview Uploaded Bill"
                            >
                              <Eye size={16} />
                            </button>
                          ) : (
                            <span className="empty-text">No PDF</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
