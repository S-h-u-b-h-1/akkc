import { useState, useEffect } from 'react';
import { createManualBill } from '../../services/billingService.js';
import { PenTool, Plus, Trash2, Save, AlertCircle, FileText, User, Settings, List, Calculator } from 'lucide-react';

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

      <div className="card" style={{ padding: '0' }}>
        <div className="client-group-header" style={{ padding: '24px 30px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} className="text-primary" /> Create Manual Bill
          </h3>
          <p className="text-muted" style={{ margin: '8px 0 0 0' }}>Draft a custom professional invoice directly from the dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
          
          {/* Main Info Section */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <div className="form-group row" style={{ marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label className="fw-600">Billing Entity *</label>
                <select name="billingEntityId" value={formData.billingEntityId} onChange={handleInputChange} required className="large-input">
                  <option value="" disabled>Select an entity...</option>
                  {entities.map(e => <option key={e.id} value={e.id}>{e.name} ({e.invoicePrefix || e.code})</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="fw-600">Bill Date *</label>
                <input type="date" name="billDate" value={formData.billDate} onChange={handleInputChange} required className="large-input" />
              </div>
            </div>

            <div className="form-group row" style={{ marginBottom: 0 }}>
              <div style={{ flex: 1 }}>
                <label className="fw-600">Client Name *</label>
                <input name="clientName" value={formData.clientName} onChange={handleInputChange} required placeholder="Client or Company Name" className="large-input" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="fw-600">Client Email</label>
                <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleInputChange} placeholder="For sending PDF directly" className="large-input" />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Client Details Card */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: '#fafafa' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, marginBottom: '16px', color: '#334155' }}>
                <User size={18} /> Additional Client Details
              </h4>
              <div className="form-group">
                <label>Billing Address</label>
                <textarea value={formData.clientDetails.address} onChange={(e) => handleNestedChange('clientDetails', 'address', e.target.value)} rows="2" placeholder="Full postal address" />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>State</label>
                  <input value={formData.clientDetails.state} onChange={(e) => handleNestedChange('clientDetails', 'state', e.target.value)} placeholder="e.g. Maharashtra" />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>GSTIN</label>
                  <input value={formData.clientDetails.gstNumber} onChange={(e) => handleNestedChange('clientDetails', 'gstNumber', e.target.value)} placeholder="27XXXXX0000X1Z5" />
                </div>
              </div>
            </div>

            {/* Invoice Details Card */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: '#fafafa' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, marginBottom: '16px', color: '#334155' }}>
                <Settings size={18} /> Invoice Settings
              </h4>
              <div className="form-group">
                <label>Mode of Payment</label>
                <input value={formData.invoiceDetails.modeOfPayment} onChange={(e) => handleNestedChange('invoiceDetails', 'modeOfPayment', e.target.value)} placeholder="e.g. Bank Transfer" />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Delivery Note</label>
                  <input value={formData.invoiceDetails.deliveryNote} onChange={(e) => handleNestedChange('invoiceDetails', 'deliveryNote', e.target.value)} placeholder="Optional" />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Reference No.</label>
                  <input value={formData.invoiceDetails.referenceNumber} onChange={(e) => handleNestedChange('invoiceDetails', 'referenceNumber', e.target.value)} placeholder="PO-12345" />
                </div>
              </div>
            </div>
          </div>

          <div className="manual-items-section mt-4" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: '#ffffff', marginBottom: '24px' }}>
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#334155' }}>
                <List size={18} /> Line Items
              </h4>
              <button type="button" className="secondary-button small" onClick={addItem} style={{ borderRadius: '8px' }}>
                <Plus size={14} /> Add Line Item
              </button>
            </div>
            
            <div className="table-container" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table className="data-table small" style={{ margin: 0 }}>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th>Description *</th>
                    <th width="120px">HSN/SAC</th>
                    <th width="80px">Qty *</th>
                    <th width="120px">Rate (₹) *</th>
                    <th width="80px">Per</th>
                    <th width="140px">Total</th>
                    <th width="50px"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input 
                          value={item.taskTitle} 
                          onChange={(e) => handleItemChange(index, 'taskTitle', e.target.value)} 
                          placeholder="Service description" 
                          required 
                          style={{ border: '1px solid transparent', backgroundColor: '#f1f5f9' }}
                          onFocus={(e) => e.target.style.border = '1px solid #3b82f6'}
                          onBlur={(e) => e.target.style.border = '1px solid transparent'}
                        />
                      </td>
                      <td>
                        <input 
                          value={item.hsnSac} 
                          onChange={(e) => handleItemChange(index, 'hsnSac', e.target.value)} 
                          style={{ border: '1px solid transparent', backgroundColor: '#f1f5f9' }}
                          onFocus={(e) => e.target.style.border = '1px solid #3b82f6'}
                          onBlur={(e) => e.target.style.border = '1px solid transparent'}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          min="1" 
                          value={item.quantity} 
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                          required 
                          style={{ border: '1px solid transparent', backgroundColor: '#f1f5f9' }}
                          onFocus={(e) => e.target.style.border = '1px solid #3b82f6'}
                          onBlur={(e) => e.target.style.border = '1px solid transparent'}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          value={item.rate} 
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)} 
                          required 
                          style={{ border: '1px solid transparent', backgroundColor: '#f1f5f9' }}
                          onFocus={(e) => e.target.style.border = '1px solid #3b82f6'}
                          onBlur={(e) => e.target.style.border = '1px solid transparent'}
                        />
                      </td>
                      <td>
                        <input 
                          value={item.per} 
                          onChange={(e) => handleItemChange(index, 'per', e.target.value)} 
                          style={{ border: '1px solid transparent', backgroundColor: '#f1f5f9' }}
                          onFocus={(e) => e.target.style.border = '1px solid #3b82f6'}
                          onBlur={(e) => e.target.style.border = '1px solid transparent'}
                        />
                      </td>
                      <td style={{ background: '#f8fafc', fontWeight: '600', color: '#1e293b', fontSize: '1.05rem' }}>
                        ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td>
                        <button 
                          type="button" 
                          className="icon-button danger" 
                          onClick={() => removeItem(index)} 
                          disabled={formData.items.length === 1}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, marginBottom: '16px', color: '#334155' }}>
                <Calculator size={18} /> Tax Options (%)
              </h4>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>CGST %</label>
                  <input type="number" min="0" step="0.1" value={formData.taxDetails.cgstPercentage} onChange={(e) => handleNestedChange('taxDetails', 'cgstPercentage', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>SGST %</label>
                  <input type="number" min="0" step="0.1" value={formData.taxDetails.sgstPercentage} onChange={(e) => handleNestedChange('taxDetails', 'sgstPercentage', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>IGST %</label>
                  <input type="number" min="0" step="0.1" value={formData.taxDetails.igstPercentage} onChange={(e) => handleNestedChange('taxDetails', 'igstPercentage', e.target.value)} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '24px', marginBottom: 0 }}>
                <label>Notes / Remarks (Optional)</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="2" placeholder="Will be visible on the generated PDF invoice." />
              </div>
            </div>
            
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: '500' }}>₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {(totals.cgst > 0) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <span>CGST:</span>
                  <span style={{ fontWeight: '500' }}>₹{totals.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              {(totals.sgst > 0) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <span>SGST:</span>
                  <span style={{ fontWeight: '500' }}>₹{totals.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              {(totals.igst > 0) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <span>IGST:</span>
                  <span style={{ fontWeight: '500' }}>₹{totals.igst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0 0', marginTop: '8px', fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a' }}>
                <span>Grand Total:</span>
                <span style={{ color: '#10b981' }}>₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <button type="submit" className="primary-button" disabled={isLoading} style={{ padding: '12px 24px', fontSize: '1.1rem', borderRadius: '8px' }}>
              <Save size={20} /> {isLoading ? 'Generating Invoice...' : 'Generate Manual Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
