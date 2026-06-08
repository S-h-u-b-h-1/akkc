import { useEffect, useState } from 'react';
import { FileText, Mail, Trash2, AlertCircle, FilePlus, RefreshCcw, Eye, Download } from 'lucide-react';
import { getEligibleTasksForBilling, createBill, getBills, deleteBill, sendBillEmail } from '../services/billingService.js';
import { getAdminEmployees } from '../services/adminService.js';
import { API_BASE_URL } from '../api/httpClient.js';
import { STORAGE_KEYS } from '../constants/routes.js';

export function AdminBilling() {
  const [activeTab, setActiveTab] = useState('eligible');
  
  const [tasks, setTasks] = useState([]);
  const [bills, setBills] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [taskFilters, setTaskFilters] = useState({ clientName: '', employeeId: '' });
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  
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
      // Graceful error display
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBill = async (billId) => {
    if (!window.confirm('Are you sure you want to delete this draft bill?')) return;
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

  const handleViewPdf = async (billId) => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(`${API_BASE_URL}/admin/billing/bills/${billId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load PDF');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // refresh status since generating PDF might have changed it
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

  // Group tasks by client for better UX
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.clientName]) acc[task.clientName] = [];
    acc[task.clientName].push(task);
    return acc;
  }, {});

  return (
    <section className="page-stack admin-billing">
      <div className="page-header">
        <div>
          <p className="eyebrow">A K Kataruka and Company</p>
          <h1>Billing & Invoices</h1>
        </div>
      </div>

      {error && (
        <div className="error-toast">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button className="icon-button" onClick={() => setError('')}>&times;</button>
        </div>
      )}

      <div className="tabs">
        <button 
          className={activeTab === 'eligible' ? 'active' : ''} 
          onClick={() => { setActiveTab('eligible'); setError(''); }}
        >
          <FilePlus size={16} /> Eligible Tasks
        </button>
        <button 
          className={activeTab === 'bills' ? 'active' : ''} 
          onClick={() => { setActiveTab('bills'); setError(''); }}
        >
          <FileText size={16} /> Generated Bills
        </button>
      </div>

      {activeTab === 'eligible' && (
        <div className="billing-section">
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
            <button className="primary-button" onClick={handleCreateBill} disabled={selectedTaskIds.length === 0 || isLoading}>
              {isLoading ? <RefreshCcw size={16} className="spin" /> : <FilePlus size={16} />}
              Create Bill ({selectedTaskIds.length})
            </button>
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
      )}

      {activeTab === 'bills' && (
        <div className="billing-section">
          <div className="filters card">
            <input 
              className="search-input"
              placeholder="Search by Client Name..." 
              value={billFilters.clientName} 
              onChange={e => setBillFilters(prev => ({ ...prev, clientName: e.target.value }))}
            />
            <select 
              value={billFilters.status} 
              onChange={e => setBillFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="GENERATED">Generated</option>
              <option value="EMAILED">Emailed</option>
            </select>
          </div>

          <div className="card table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill.id}>
                    <td className="mono-cell">{bill.billNumber}</td>
                    <td><strong>{bill.clientName}</strong></td>
                    <td className="amount-cell">₹{Number(bill.totalAmount).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`status-badge status-${bill.status.toLowerCase()}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td>{new Date(bill.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button className="icon-button" title="View PDF" onClick={() => handleViewPdf(bill.id)} disabled={isLoading}>
                          <Eye size={18} />
                        </button>
                        <button className="icon-button" title="Send Email" onClick={() => handleSendEmail(bill.id)} disabled={isLoading}>
                          <Mail size={18} />
                        </button>
                        {bill.status === 'DRAFT' && (
                          <button className="icon-button danger" title="Delete Draft" onClick={() => handleDeleteBill(bill.id)} disabled={isLoading}>
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {bills.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <FileText size={48} className="empty-icon" />
                        <h3>No bills found</h3>
                        <p>Adjust filters or create a new bill from the Eligible Tasks tab.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
