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
                    <td>
                      <div className="form-group">
                        <label>Name</label>
                        <input name="name" value={formData.name || ''} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Address</label>
                        <textarea name="address" value={formData.address || ''} onChange={handleChange} rows="2" />
                      </div>
                    </td>
                    <td>
                      <div className="form-group">
                        <label>Email</label>
                        <input name="email" value={formData.email || ''} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input name="phone" value={formData.phone || ''} onChange={handleChange} />
                      </div>
                    </td>
                    <td>
                      <div className="form-group">
                        <label>GST Number</label>
                        <input name="gstNumber" value={formData.gstNumber || ''} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>PAN Number</label>
                        <input name="panNumber" value={formData.panNumber || ''} onChange={handleChange} />
                      </div>
                    </td>
                    <td>
                      <div className="form-group">
                        <label>Bank Name</label>
                        <input name="bankName" value={formData.bankName || ''} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>A/C Number</label>
                        <input name="bankAccountNumber" value={formData.bankAccountNumber || ''} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>IFSC</label>
                        <input name="ifscCode" value={formData.ifscCode || ''} onChange={handleChange} />
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons-column">
                        <button className="primary-button small" onClick={() => handleSave(entity.id)} disabled={isLoading}>
                          <Save size={14} /> Save
                        </button>
                        <button className="secondary-button small" onClick={handleCancel} disabled={isLoading}>
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={entity.id}>
                  <td>
                    <strong>{entity.code}</strong> - {entity.name}
                    <div className="cell-subtext">{entity.address || 'No address set'}</div>
                  </td>
                  <td>
                    <div>{entity.email}</div>
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
