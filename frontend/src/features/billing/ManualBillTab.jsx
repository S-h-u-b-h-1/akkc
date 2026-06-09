import { useState, useEffect } from 'react';
import { createManualBill } from '../../services/billingService.js';
import { PenTool, Plus, Trash2, Save, AlertCircle } from 'lucide-react';

export function ManualBillTab({ entities }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    billingEntityId: '',
    billDate: new Date().toISOString().slice(0, 10),
    clientName: '',
    clientEmail: '',
    notes: '',
    items: [
      { taskTitle: '', taskDomain: '', amount: 0, quantity: 1, remarks: '' }
    ]
  });

  useEffect(() => {
    if (entities.length > 0 && !formData.billingEntityId) {
      setFormData(prev => ({ ...prev, billingEntityId: entities[0].id }));
    }
  }, [entities, formData.billingEntityId]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { taskTitle: '', taskDomain: '', amount: 0, quantity: 1, remarks: '' }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Data cleanup/formatting before sending
      const payload = {
        ...formData,
        items: formData.items.map(item => ({
          ...item,
          amount: Number(item.amount),
          quantity: Number(item.quantity)
        }))
      };

      await createManualBill(payload);
      
      setSuccess('Manual bill created successfully!');
      setFormData({
        billingEntityId: entities[0]?.id || '',
        billDate: new Date().toISOString().slice(0, 10),
        clientName: '',
        clientEmail: '',
        notes: '',
        items: [
          { taskTitle: '', taskDomain: '', amount: 0, quantity: 1, remarks: '' }
        ]
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (Number(item.amount) * Number(item.quantity || 1)), 0);
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

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="client-group-header" style={{ marginBottom: '20px' }}>
            <h3>Create Manual Bill</h3>
            <p className="text-muted">Draft a custom invoice not linked to system tasks.</p>
          </div>

          <div className="form-group row">
            <div style={{ flex: 1 }}>
              <label>Billing Entity *</label>
              <select name="billingEntityId" value={formData.billingEntityId} onChange={handleInputChange} required>
                <option value="" disabled>Select an entity...</option>
                {entities.map(e => <option key={e.id} value={e.id}>{e.name} ({e.code})</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Bill Date *</label>
              <input type="date" name="billDate" value={formData.billDate} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="form-group row">
            <div style={{ flex: 1 }}>
              <label>Client Name *</label>
              <input name="clientName" value={formData.clientName} onChange={handleInputChange} required placeholder="Client or Company Name" />
            </div>
            <div style={{ flex: 1 }}>
              <label>Client Email (Optional)</label>
              <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleInputChange} placeholder="For sending PDF" />
            </div>
          </div>

          <div style={{ margin: '30px 0 10px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            <h4>Line Items</h4>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div className="form-group" style={{ flex: 3 }}>
                <label>Description *</label>
                <input 
                  value={item.taskTitle} 
                  onChange={(e) => handleItemChange(index, 'taskTitle', e.target.value)} 
                  required 
                  placeholder="Service description"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Qty *</label>
                <input 
                  type="number" 
                  min="1" 
                  value={item.quantity} 
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Rate (₹) *</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={item.amount} 
                  onChange={(e) => handleItemChange(index, 'amount', e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Total</label>
                <input 
                  type="text" 
                  readOnly 
                  value={(Number(item.amount) * Number(item.quantity)).toFixed(2)} 
                  className="read-only-input"
                  style={{ backgroundColor: '#f8fafc' }}
                />
              </div>
              <div style={{ paddingTop: '28px' }}>
                <button 
                  type="button" 
                  className="icon-button danger" 
                  onClick={() => removeItem(index)}
                  disabled={formData.items.length === 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <button type="button" className="secondary-button small" onClick={addItem}>
              <Plus size={16} /> Add Line Item
            </button>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              Grand Total: ₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="form-group">
            <label>Notes / Remarks (Optional)</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleInputChange} 
              rows="3" 
              placeholder="Will be visible on the generated PDF invoice."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="submit" className="primary-button" disabled={isLoading}>
              <Save size={16} /> {isLoading ? 'Saving...' : 'Create Manual Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
