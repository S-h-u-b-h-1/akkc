import { useState, useEffect } from 'react';
import { getBills, deleteBill, sendBillEmail, createClubbedBill } from '../../services/billingService.js';
import { API_BASE_URL } from '../../api/httpClient.js';
import { STORAGE_KEYS } from '../../constants/routes.js';
import { FileText, Eye, Mail, Trash2, Layers, AlertCircle, RefreshCcw } from 'lucide-react';

export function GeneratedBillsTab({ entities }) {
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [billFilters, setBillFilters] = useState({ clientName: '', status: '', isUnclubbed: 'true' });
  const [selectedBillIds, setSelectedBillIds] = useState([]);

  // For clubbing
  const [isClubbing, setIsClubbing] = useState(false);
  const [clubbingEntityId, setClubbingEntityId] = useState('');
  const [clubbingDate, setClubbingDate] = useState(new Date().toISOString().slice(0, 10));
  const [clubbingNotes, setClubbingNotes] = useState('');

  useEffect(() => {
    loadBills();
  }, [billFilters]);

  useEffect(() => {
    if (entities.length > 0 && !clubbingEntityId) {
      setClubbingEntityId(entities[0].id);
    }
  }, [entities, clubbingEntityId]);

  const loadBills = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getBills(billFilters);
      setBills(res.data?.bills || []);
      setSelectedBillIds([]); // Reset selection on reload
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
      setSuccess('Email sent successfully!');
      loadBills();
    } catch (err) {
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
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load PDF');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      loadBills(); 
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBillSelection = (billId) => {
    setSelectedBillIds(prev => {
      if (prev.includes(billId)) return prev.filter(id => id !== billId);
      return [...prev, billId];
    });
  };

  const handleClubBills = async () => {
    if (selectedBillIds.length < 2) {
      setError('Select at least two bills to club.');
      return;
    }
    const selectedBills = bills.filter(b => selectedBillIds.includes(b.id));
    const firstClient = selectedBills[0].clientName;
    if (selectedBills.some(b => b.clientName !== firstClient)) {
      setError('All selected bills must belong to the same client to be clubbed.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await createClubbedBill({
        billingEntityId: clubbingEntityId,
        billDate: clubbingDate,
        billIds: selectedBillIds,
        notes: clubbingNotes
      });
      setSuccess('Bills clubbed successfully!');
      setIsClubbing(false);
      setSelectedBillIds([]);
      loadBills();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          placeholder="Search by Client Name..." 
          value={billFilters.clientName} 
          onChange={e => setBillFilters(prev => ({ ...prev, clientName: e.target.value }))}
        />
        <select value={billFilters.status} onChange={e => setBillFilters(prev => ({ ...prev, status: e.target.value }))}>
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="GENERATED">Generated</option>
          <option value="EMAILED">Emailed</option>
        </select>
        <select value={billFilters.isUnclubbed} onChange={e => setBillFilters(prev => ({ ...prev, isUnclubbed: e.target.value }))}>
          <option value="true">Unclubbed Bills</option>
          <option value="">All Bills (Including Clubbed)</option>
        </select>
        {selectedBillIds.length > 1 && (
          <button className="primary-button" onClick={() => setIsClubbing(!isClubbing)}>
            <Layers size={16} /> {isClubbing ? 'Cancel Clubbing' : `Club Selected (${selectedBillIds.length})`}
          </button>
        )}
      </div>

      {isClubbing && (
        <div className="card billing-creation-bar">
          <h3>Club Bills</h3>
          <div className="form-group row">
            <div style={{ flex: 1 }}>
              <label>Billing Entity</label>
              <select value={clubbingEntityId} onChange={e => setClubbingEntityId(e.target.value)}>
                {entities.map(e => <option key={e.id} value={e.id}>{e.name} ({e.code})</option>)}
              </select>
            </div>
            <div style={{ width: '200px' }}>
              <label>Bill Date</label>
              <input type="date" value={clubbingDate} onChange={e => setClubbingDate(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Notes (Optional)</label>
            <input value={clubbingNotes} onChange={e => setClubbingNotes(e.target.value)} placeholder="Consolidated bill for Q3" />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="primary-button" onClick={handleClubBills} disabled={isLoading}>
              {isLoading ? <RefreshCcw size={16} className="spin" /> : <Layers size={16} />} Confirm Clubbing
            </button>
          </div>
        </div>
      )}

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th width="50px">Select</th>
              <th>Bill No</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Source</th>
              <th>Created At</th>
              <th className="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map(bill => (
              <tr key={bill.id} className={selectedBillIds.includes(bill.id) ? 'selected-row' : ''}>
                <td>
                  {!bill.clubbedIntoId && bill.status === 'DRAFT' && (
                    <input 
                      type="checkbox" 
                      className="custom-checkbox"
                      checked={selectedBillIds.includes(bill.id)}
                      onChange={() => toggleBillSelection(bill.id)}
                    />
                  )}
                </td>
                <td className="mono-cell">
                  {bill.billNumber}
                  {bill.clubbedIntoId && <div className="cell-subtext">Clubbed</div>}
                </td>
                <td><strong>{bill.clientName}</strong></td>
                <td className="amount-cell">₹{Number(bill.totalAmount).toLocaleString('en-IN')}</td>
                <td>
                  <span className={`status-badge status-${bill.status.toLowerCase()}`}>
                    {bill.status}
                  </span>
                </td>
                <td>
                  <span className="status-badge" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                    {bill.sourceType.replace('_', ' ')}
                  </span>
                </td>
                <td>{new Date(bill.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button className="icon-button" title="View PDF" onClick={() => handleViewPdf(bill.id)} disabled={isLoading}>
                      <Eye size={18} />
                    </button>
                    {!bill.clubbedIntoId && (
                      <button className="icon-button" title="Send Email" onClick={() => handleSendEmail(bill.id)} disabled={isLoading}>
                        <Mail size={18} />
                      </button>
                    )}
                    {bill.status === 'DRAFT' && !bill.clubbedIntoId && (
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
                <td colSpan="8">
                  <div className="empty-state">
                    <FileText size={48} className="empty-icon" />
                    <h3>No bills found</h3>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
