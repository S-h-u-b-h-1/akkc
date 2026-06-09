import { useState } from 'react';
import { updateEntity } from '../../services/billingService.js';
import { Save, AlertCircle, Building2 } from 'lucide-react';

export function BillingEntitiesTab({ entities, reloadEntities }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = (entity) => {
    setEditingId(entity.id);
    setFormData(entity);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
    setError('');
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (id) => {
    setIsLoading(true);
    setError('');
    try {
      await updateEntity(id, formData);
      await reloadEntities();
      setEditingId(null);
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

      <div className="card table-container">
        <div className="client-group-header">
          <h3>Manage Billing Entities</h3>
          <p className="text-muted">Edit addresses, contact details, and bank information for PDF generation.</p>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Code / Name</th>
              <th>Contact Info</th>
              <th>Tax Info</th>
              <th>Bank Info</th>
              <th className="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entities.map(entity => {
              const isEditing = editingId === entity.id;

              if (isEditing) {
                return (
                  <tr key={entity.id} className="editing-row">
                    <td colSpan="5" style={{ padding: '15px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <h4 style={{ marginBottom: '10px' }}>Basic Info</h4>
                          <div className="form-group"><label>Name</label><input name="name" value={formData.name || ''} onChange={handleChange} /></div>
                          <div className="form-group"><label>Invoice Prefix</label><input name="invoicePrefix" value={formData.invoicePrefix || ''} onChange={handleChange} /></div>
                          <div className="form-group"><label>Email</label><input name="email" value={formData.email || ''} onChange={handleChange} /></div>
                          <div className="form-group"><label>Phone</label><input name="phone" value={formData.phone || ''} onChange={handleChange} /></div>
                          <div className="form-group"><label>Address</label><textarea name="address" value={formData.address || ''} onChange={handleChange} rows="2" /></div>
                          <div className="form-group"><label>City / State</label><div style={{ display: 'flex', gap: '10px' }}><input name="city" placeholder="City" value={formData.city || ''} onChange={handleChange} /><input name="state" placeholder="State" value={formData.state || ''} onChange={handleChange} /></div></div>
                          <div className="form-group"><label>Pincode / Country</label><div style={{ display: 'flex', gap: '10px' }}><input name="pincode" placeholder="Pincode" value={formData.pincode || ''} onChange={handleChange} /><input name="country" placeholder="Country" value={formData.country || ''} onChange={handleChange} /></div></div>
                        </div>
                        <div>
                          <h4 style={{ marginBottom: '10px' }}>Tax & Bank Info</h4>
                          <div className="form-group"><label>GST Number</label><input name="gstNumber" value={formData.gstNumber || ''} onChange={handleChange} /></div>
                          <div className="form-group"><label>PAN Number</label><input name="panNumber" value={formData.panNumber || ''} onChange={handleChange} /></div>
                          <div className="form-group"><label>Bank Name</label><input name="bankName" value={formData.bankName || ''} onChange={handleChange} /></div>
                          <div className="form-group"><label>Account Holder Name</label><input name="accountHolderName" value={formData.accountHolderName || ''} onChange={handleChange} /></div>
                          <div className="form-group"><label>A/C Number</label><input name="bankAccountNumber" value={formData.bankAccountNumber || ''} onChange={handleChange} /></div>
                          <div className="form-group"><label>IFSC Code</label><input name="ifscCode" value={formData.ifscCode || ''} onChange={handleChange} /></div>
                          <div className="form-group"><label>Branch Name</label><input name="branchName" value={formData.branchName || ''} onChange={handleChange} /></div>
                          <div className="form-group"><label>Declaration Text</label><textarea name="declarationText" value={formData.declarationText || ''} onChange={handleChange} rows="2" /></div>
                        </div>
                      </div>
                      <div className="action-buttons-row" style={{ marginTop: '15px', justifyContent: 'flex-end', display: 'flex', gap: '10px' }}>
                        <button className="secondary-button" onClick={handleCancel} disabled={isLoading}>Cancel</button>
                        <button className="primary-button" onClick={() => handleSave(entity.id)} disabled={isLoading}><Save size={16} /> Save Changes</button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={entity.id}>
                  <td>
                    <strong>{entity.invoicePrefix}</strong> - {entity.name}
                    <div className="cell-subtext">{entity.address ? `${entity.address}, ${entity.city || ''} ${entity.state || ''}` : 'No address set'}</div>
                  </td>
                  <td>
                    <div>{entity.email || 'No email set'}</div>
                    <div className="cell-subtext">{entity.phone || 'No phone set'}</div>
                  </td>
                  <td>
                    <div>GST: {entity.gstNumber || 'N/A'}</div>
                    <div className="cell-subtext">PAN: {entity.panNumber || 'N/A'}</div>
                  </td>
                  <td>
                    <div>{entity.bankName || 'No bank set'}</div>
                    <div className="cell-subtext">{entity.bankAccountNumber ? `A/C: ${entity.bankAccountNumber}` : ''}</div>
                  </td>
                  <td className="actions-cell">
                    <button className="secondary-button small" onClick={() => handleEdit(entity)}>
                      Edit Details
                    </button>
                  </td>
                </tr>
              );
            })}
            
            {entities.length === 0 && (
              <tr>
                <td colSpan="5">
                  <div className="empty-state">
                    <Building2 size={48} className="empty-icon" />
                    <h3>No entities found</h3>
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
