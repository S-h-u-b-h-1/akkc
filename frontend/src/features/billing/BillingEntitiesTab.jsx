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
                      <div className="form-grid" style={{ padding: '0 8px' }}>
                        <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #eef1f5', paddingBottom: '8px', marginBottom: '8px' }}>
                          <h4 style={{ margin: 0, color: '#172033', fontSize: '1rem' }}>Basic Info</h4>
                        </div>
                        <label><span>Name</span><input name="name" value={formData.name || ''} onChange={handleChange} /></label>
                        <label><span>Invoice Prefix</span><input name="invoicePrefix" value={formData.invoicePrefix || ''} onChange={handleChange} /></label>
                        <label><span>Email</span><input name="email" value={formData.email || ''} onChange={handleChange} /></label>
                        <label><span>Phone</span><input name="phone" value={formData.phone || ''} onChange={handleChange} /></label>
                        <label style={{ gridColumn: '1 / -1' }}><span>Address</span><textarea name="address" value={formData.address || ''} onChange={handleChange} rows="2" /></label>
                        <label><span>City</span><input name="city" placeholder="City" value={formData.city || ''} onChange={handleChange} /></label>
                        <label><span>State</span><input name="state" placeholder="State" value={formData.state || ''} onChange={handleChange} /></label>
                        <label><span>Pincode</span><input name="pincode" placeholder="Pincode" value={formData.pincode || ''} onChange={handleChange} /></label>
                        <label><span>Country</span><input name="country" placeholder="Country" value={formData.country || ''} onChange={handleChange} /></label>
                        
                        <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #eef1f5', paddingBottom: '8px', marginBottom: '8px', marginTop: '16px' }}>
                          <h4 style={{ margin: 0, color: '#172033', fontSize: '1rem' }}>Tax & Bank Info</h4>
                        </div>
                        <label><span>GST Number</span><input name="gstNumber" value={formData.gstNumber || ''} onChange={handleChange} /></label>
                        <label><span>PAN Number</span><input name="panNumber" value={formData.panNumber || ''} onChange={handleChange} /></label>
                        <label><span>Bank Name</span><input name="bankName" value={formData.bankName || ''} onChange={handleChange} /></label>
                        <label><span>Account Holder Name</span><input name="accountHolderName" value={formData.accountHolderName || ''} onChange={handleChange} /></label>
                        <label><span>A/C Number</span><input name="bankAccountNumber" value={formData.bankAccountNumber || ''} onChange={handleChange} /></label>
                        <label><span>IFSC Code</span><input name="ifscCode" value={formData.ifscCode || ''} onChange={handleChange} /></label>
                        <label><span>Branch Name</span><input name="branchName" value={formData.branchName || ''} onChange={handleChange} /></label>
                        <label style={{ gridColumn: '1 / -1' }}><span>Declaration Text</span><textarea name="declarationText" value={formData.declarationText || ''} onChange={handleChange} rows="2" /></label>
                      </div>
                      <div className="action-buttons-row" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #eef1f5', justifyContent: 'flex-end', display: 'flex', gap: '10px' }}>
                        <button className="secondary-button" onClick={handleCancel} disabled={isLoading}>Cancel</button>
                        <button className="primary-button fit-button" onClick={() => handleSave(entity.id)} disabled={isLoading}><Save size={16} /> Save Changes</button>
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
