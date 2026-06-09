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
    clientDetails: { address: '', state: '', gstNumber: '', panNumber: '' },
    invoiceDetails: { deliveryNote: '', modeOfPayment: '', referenceNumber: '' },
    taxDetails: { cgstPercentage: 0, sgstPercentage: 0, igstPercentage: 0 },
    items: [
      { taskTitle: '', taskDomain: '', hsnSac: '', rate: 0, quantity: 1, per: 'Nos', amount: 0, remarks: '' }
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

  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({ ...prev, [category]: { ...prev[category], [field]: value } }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === 'rate' || field === 'quantity') {
      newItems[index].amount = Number(newItems[index].rate || 0) * Number(newItems[index].quantity || 1);
    }
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { taskTitle: '', taskDomain: '', hsnSac: '', rate: 0, quantity: 1, per: 'Nos', amount: 0, remarks: '' }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((total, item) => total + (Number(item.amount) || 0), 0);
    const cgst = (subtotal * (Number(formData.taxDetails.cgstPercentage) || 0)) / 100;
    const sgst = (subtotal * (Number(formData.taxDetails.sgstPercentage) || 0)) / 100;
    const igst = (subtotal * (Number(formData.taxDetails.igstPercentage) || 0)) / 100;
    const totalTaxAmount = cgst + sgst + igst;
    const grandTotal = subtotal + totalTaxAmount;
    return { subtotal, cgst, sgst, igst, totalTaxAmount, grandTotal };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const totals = calculateTotals();
      const payload = {
        ...formData,
        taxDetails: {
          ...formData.taxDetails,
          cgstAmount: totals.cgst,
          sgstAmount: totals.sgst,
          igstAmount: totals.igst,
          totalTaxAmount: totals.totalTaxAmount
        },
        items: formData.items.map(item => ({
          ...item,
          amount: Number(item.amount),
          quantity: Number(item.quantity),
          rate: Number(item.rate)
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
        clientDetails: { address: '', state: '', gstNumber: '', panNumber: '' },
        invoiceDetails: { deliveryNote: '', modeOfPayment: '', referenceNumber: '' },
        taxDetails: { cgstPercentage: 0, sgstPercentage: 0, igstPercentage: 0 },
        items: [
          { taskTitle: '', taskDomain: '', hsnSac: '', rate: 0, quantity: 1, per: 'Nos', amount: 0, remarks: '' }
        ]
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const totals = calculateTotals();

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
            <p className="text-muted">Draft a custom professional invoice.</p>
          </div>

          <div className="form-group row">
            <div style={{ flex: 1 }}>
              <label>Billing Entity *</label>
              <select name="billingEntityId" value={formData.billingEntityId} onChange={handleInputChange} required>
                <option value="" disabled>Select an entity...</option>
                {entities.map(e => <option key={e.id} value={e.id}>{e.name} ({e.invoicePrefix || e.code})</option>)}
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
              <label>Client Email</label>
              <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleInputChange} placeholder="For sending PDF" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
            <div>
              <h4>Client Details</h4>
              <div className="form-group"><label>Address</label><textarea value={formData.clientDetails.address} onChange={(e) => handleNestedChange('clientDetails', 'address', e.target.value)} rows="2" /></div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}><label>State</label><input value={formData.clientDetails.state} onChange={(e) => handleNestedChange('clientDetails', 'state', e.target.value)} /></div>
                <div className="form-group" style={{ flex: 1 }}><label>GSTIN</label><input value={formData.clientDetails.gstNumber} onChange={(e) => handleNestedChange('clientDetails', 'gstNumber', e.target.value)} /></div>
              </div>
            </div>
            <div>
              <h4>Invoice Details</h4>
              <div className="form-group"><label>Mode of Payment</label><input value={formData.invoiceDetails.modeOfPayment} onChange={(e) => handleNestedChange('invoiceDetails', 'modeOfPayment', e.target.value)} /></div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}><label>Delivery Note</label><input value={formData.invoiceDetails.deliveryNote} onChange={(e) => handleNestedChange('invoiceDetails', 'deliveryNote', e.target.value)} /></div>
                <div className="form-group" style={{ flex: 1 }}><label>Reference No</label><input value={formData.invoiceDetails.referenceNumber} onChange={(e) => handleNestedChange('invoiceDetails', 'referenceNumber', e.target.value)} /></div>
              </div>
            </div>
          </div>

          <div style={{ margin: '30px 0 10px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            <h4>Line Items</h4>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div className="form-group" style={{ flex: 3 }}>
                <label>Description *</label>
                <input value={item.taskTitle} onChange={(e) => handleItemChange(index, 'taskTitle', e.target.value)} required placeholder="Service description" />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>HSN/SAC</label>
                <input value={item.hsnSac} onChange={(e) => handleItemChange(index, 'hsnSac', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Qty *</label>
                <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Rate (₹) *</label>
                <input type="number" min="0" step="0.01" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Per</label>
                <input value={item.per} onChange={(e) => handleItemChange(index, 'per', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Total</label>
                <input type="text" readOnly value={item.amount.toFixed(2)} className="read-only-input" style={{ backgroundColor: '#f8fafc' }} />
              </div>
              <div style={{ paddingTop: '28px' }}>
                <button type="button" className="icon-button danger" onClick={() => removeItem(index)} disabled={formData.items.length === 1}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <button type="button" className="secondary-button small" onClick={addItem} style={{ marginBottom: '20px' }}>
            <Plus size={16} /> Add Line Item
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
            <div>
              <h4>Tax Options (%)</h4>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <div className="form-group"><label>CGST</label><input type="number" min="0" step="0.1" value={formData.taxDetails.cgstPercentage} onChange={(e) => handleNestedChange('taxDetails', 'cgstPercentage', e.target.value)} /></div>
                <div className="form-group"><label>SGST</label><input type="number" min="0" step="0.1" value={formData.taxDetails.sgstPercentage} onChange={(e) => handleNestedChange('taxDetails', 'sgstPercentage', e.target.value)} /></div>
                <div className="form-group"><label>IGST</label><input type="number" min="0" step="0.1" value={formData.taxDetails.igstPercentage} onChange={(e) => handleNestedChange('taxDetails', 'igstPercentage', e.target.value)} /></div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>Subtotal: ₹{totals.subtotal.toFixed(2)}</div>
              {(totals.cgst > 0) && <div>CGST: ₹{totals.cgst.toFixed(2)}</div>}
              {(totals.sgst > 0) && <div>SGST: ₹{totals.sgst.toFixed(2)}</div>}
              {(totals.igst > 0) && <div>IGST: ₹{totals.igst.toFixed(2)}</div>}
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '10px' }}>
                Grand Total: ₹{totals.grandTotal.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>Notes / Remarks (Optional)</label>
            <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="2" placeholder="Will be visible on the generated PDF invoice." />
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
