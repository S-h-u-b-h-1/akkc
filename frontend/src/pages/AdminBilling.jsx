import { useEffect, useState } from 'react';
import { getEligibleTasksForBilling, createBill, getBills, deleteBill, sendBillEmail } from '../services/billingService.js';
import { getEmployees } from '../services/employeeService.js';

export function AdminBilling() {
  const [activeTab, setActiveTab] = useState('eligible');
  
  const [tasks, setTasks] = useState([]);
  const [bills, setBills] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Eligible task filters
  const [taskFilters, setTaskFilters] = useState({ clientName: '', employeeId: '' });
  // Selected tasks for creating bill
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  
  // Bill filters
  const [billFilters, setBillFilters] = useState({ clientName: '', status: '' });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (activeTab === 'eligible') {
      loadEligibleTasks();
    } else {
      loadBills();
    }
  }, [activeTab, taskFilters, billFilters]);

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
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

  const loadBills = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getBills(billFilters);
      setBills(res.data?.bills || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBill = async () => {
    if (selectedTaskIds.length === 0) return;
    setIsLoading(true);
    setError('');
    try {
      await createBill(selectedTaskIds);
      setSelectedTaskIds([]);
      loadEligibleTasks();
      setActiveTab('bills');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async (billId) => {
    setIsLoading(true);
    setError('');
    try {
      await sendBillEmail(billId);
      loadBills();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBill = async (billId) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    setIsLoading(true);
    setError('');
    try {
      await deleteBill(billId);
      loadBills();
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

  return (
    <section className="page-stack admin-billing">
      <div className="page-header">
        <div>
          <p className="eyebrow">A K Kataruka and Company</p>
          <h1>Billing Management</h1>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="tabs">
        <button 
          className={activeTab === 'eligible' ? 'active' : ''} 
          onClick={() => setActiveTab('eligible')}
        >
          Eligible Tasks
        </button>
        <button 
          className={activeTab === 'bills' ? 'active' : ''} 
          onClick={() => setActiveTab('bills')}
        >
          Bills
        </button>
      </div>

      {activeTab === 'eligible' && (
        <div className="billing-eligible-section">
          <div className="filters card">
            <input 
              placeholder="Filter by Client Name" 
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
            <button className="primary-button" onClick={handleCreateBill} disabled={selectedTaskIds.length === 0 || isLoading}>
              Create Bill from Selected
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Client</th>
                  <th>Task Title</th>
                  <th>Amount</th>
                  <th>Staff</th>
                  <th>Employee Remarks</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedTaskIds.includes(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                      />
                    </td>
                    <td>{task.clientName}</td>
                    <td>{task.title}</td>
                    <td>₹{task.billAmount}</td>
                    <td>@{task.assignedEmployee?.username}</td>
                    <td>{task.billingRemarks || '-'}</td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr><td colSpan="6" style={{textAlign: 'center'}}>No eligible tasks found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bills' && (
        <div className="billing-bills-section">
          <div className="filters card">
            <input 
              placeholder="Filter by Client Name" 
              value={billFilters.clientName} 
              onChange={e => setBillFilters(prev => ({ ...prev, clientName: e.target.value }))}
            />
            <select 
              value={billFilters.status} 
              onChange={e => setBillFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="GENERATED">GENERATED</option>
              <option value="EMAILED">EMAILED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill.id}>
                    <td>{bill.billNumber}</td>
                    <td>{bill.clientName}</td>
                    <td>₹{bill.totalAmount}</td>
                    <td><span className={`status-badge ${bill.status.toLowerCase()}`}>{bill.status}</span></td>
                    <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="icon-button" onClick={() => handleSendEmail(bill.id)} disabled={isLoading}>
                        Email
                      </button>
                      {bill.status === 'DRAFT' && (
                        <button className="icon-button danger" onClick={() => handleDeleteBill(bill.id)} disabled={isLoading}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {bills.length === 0 && (
                  <tr><td colSpan="6" style={{textAlign: 'center'}}>No bills found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
