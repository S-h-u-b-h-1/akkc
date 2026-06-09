import { useState, useEffect } from 'react';
import { updateBill } from '../../services/billingService.js';
import { X, Save, Plus, Trash2 } from 'lucide-react';

export function EditBillModal({ bill, onClose, onSave }) {
  const [clientName, setClientName] = useState(bill.clientName || '');
  const [clientEmail, setClientEmail] = useState(bill.clientEmail || '');
  const [notes, setNotes] = useState(bill.notes || '');
  
  // Only manual bills can edit items
  const [items, setItems] = useState(
    bill.sourceType === 'MANUAL' && bill.items 
      ? bill.items.map(item => ({
          id: item.id || Math.random().toString(36).substring(7),
          taskTitle: item.taskTitle || '',
          amount: item.amount || 0,
          quantity: item.quantity || 1,
          remarks: item.remarks || ''
        }))
      : []
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Math.random().toString(36).substring(7), taskTitle: '', amount: 0, quantity: 1, remarks: '' }
    ]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const updateData = {
        clientName,
        clientEmail: clientEmail || null,
        notes: notes || null
      };

      if (bill.sourceType === 'MANUAL') {
        if (items.length === 0) throw new Error('At least one item is required for manual bills.');
        if (items.some(i => !i.taskTitle || i.amount < 0 || i.quantity < 1)) {
          throw new Error('Please ensure all items have a valid title, amount, and quantity.');
        }
        updateData.items = items.map(i => ({
          taskTitle: i.taskTitle,
          amount: Number(i.amount),
          quantity: Number(i.quantity),
          remarks: i.remarks || null
        }));
      }

      await updateBill(bill.id, updateData);
      onSave();
    } catch (err) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount || 0) * Number(item.quantity || 1)), 0);

  return (
    <div className="modal-overlay">
      <div className="modal-content large" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2>Edit Bill {bill.billNumber}</h2>
          <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>
        
        {error && <div className="error-toast">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group row">
            <div style={{ flex: 1 }}>
              <label>Client Name *</label>
              <input value={clientName} onChange={e => setClientName(e.target.value)} required />
            </div>
            <div style={{ flex: 1 }}>
              <label>Client Email</label>
              <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
            </div>
          </div>
          
          <div className="form-group">
            <label>Internal Notes</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Follow up next week..." />
          </div>

          {bill.sourceType === 'MANUAL' && (
            <div className="manual-items-section mt-4">
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Bill Items</h3>
                <button type="button" className="secondary-button small" onClick={handleAddItem}>
                  <Plus size={14} /> Add Item
                </button>
              </div>
              
              <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table className="data-table small">
                  <thead>
                    <tr>
                      <th>Description *</th>
                      <th width="100px">Amount *</th>
                      <th width="80px">Qty *</th>
                      <th>Remarks</th>
                      <th width="50px"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id}>
                        <td>
                          <input 
                            value={item.taskTitle} 
                            onChange={e => handleItemChange(item.id, 'taskTitle', e.target.value)} 
                            placeholder="Service name..." 
                            required 
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            min="0"
                            step="0.01"
                            value={item.amount} 
                            onChange={e => handleItemChange(item.id, 'amount', e.target.value)} 
                            required 
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            min="1"
                            value={item.quantity} 
                            onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} 
                            required 
                          />
                        </td>
                        <td>
                          <input 
                            value={item.remarks} 
                            onChange={e => handleItemChange(item.id, 'remarks', e.target.value)} 
                            placeholder="Optional..." 
                          />
                        </td>
                        <td>
                          <button 
                            type="button" 
                            className="icon-button danger" 
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={items.length === 1}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="total-summary" style={{ textAlign: 'right', marginTop: '12px', fontWeight: 'bold' }}>
                Subtotal: ₹{subtotal.toLocaleString('en-IN')}
              </div>
            </div>
          )}

          {!bill.sourceType.includes('MANUAL') && (
            <div className="info-box mt-4" style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#64748b' }}>
              <strong>Note:</strong> Because this bill was {bill.sourceType === 'TASK_BASED' ? 'generated from tasks' : 'uploaded by an employee'}, its line items and total amount are locked. You can only update the client's information.
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
