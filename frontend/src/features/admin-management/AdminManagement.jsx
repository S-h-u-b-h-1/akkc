import { Pencil, ShieldPlus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

const initialForm = {
  username: '',
  password: ''
};

const createEditForm = (admin) => ({
  username: admin.username ?? '',
  password: ''
});

export function AdminManagement({
  admins,
  currentAdminId,
  onCreateAdmin,
  onDeleteAdmin,
  onUpdateAdmin
}) {
  const [adminBeingEdited, setAdminBeingEdited] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onCreateAdmin({
        username: form.username,
        password: form.password
      });
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="content-panel employee-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Firm administration</p>
          <h2>Admin access management</h2>
        </div>
      </div>

      <form className="employee-form" onSubmit={handleSubmit}>
        <label>
          <span>Username</span>
          <input
            autoComplete="username"
            name="username"
            value={form.username}
            onChange={updateField}
            required
          />
        </label>

        <label>
          <span>Password</span>
          <input
            autoComplete="new-password"
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            minLength="8"
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button fit-button" type="submit" disabled={isSubmitting}>
          <ShieldPlus size={17} aria-hidden="true" />
          <span>{isSubmitting ? 'Creating...' : 'Create admin login'}</span>
        </button>
      </form>

      <div className="employee-list">
        {admins.length === 0 ? <p className="empty-note">No admin accounts found.</p> : null}

        {admins.map((admin) => (
          <article className="employee-row" key={admin.id}>
            <div>
              <strong>@{admin.username}</strong>
              <span>Admin login</span>
            </div>
            <small>
              {admin.id === currentAdminId
                ? 'Current admin'
                : admin.createdByAdmin?.username
                  ? `Created by @${admin.createdByAdmin.username}`
                  : 'Admin account'}
            </small>
            <div className="row-actions">
              {admin.username !== 'admin' && (
                <>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Edit ${admin.username}`}
                    onClick={() => setAdminBeingEdited(admin)}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    className="icon-button danger"
                    type="button"
                    aria-label={`Delete ${admin.username}`}
                    disabled={admin.id === currentAdminId}
                    onClick={() => onDeleteAdmin(admin)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>

      {adminBeingEdited ? (
        <EditAdminModal
          admin={adminBeingEdited}
          onClose={() => setAdminBeingEdited(null)}
          onSubmit={onUpdateAdmin}
        />
      ) : null}
    </section>
  );
}

function EditAdminModal({ admin, onClose, onSubmit }) {
  const [error, setError] = useState('');
  const [form, setForm] = useState(() => createEditForm(admin));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload = {
      username: form.username
    };

    if (form.password.trim()) {
      payload.password = form.password;
    }

    try {
      await onSubmit(admin.id, payload);
      onClose();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="edit-admin-title">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Admin credentials</p>
            <h2 id="edit-admin-title">Edit admin login</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Username</span>
            <input
              autoComplete="username"
              name="username"
              value={form.username}
              onChange={updateField}
              required
            />
          </label>

          <label>
            <span>New password</span>
            <input
              autoComplete="new-password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              minLength="8"
              placeholder="Leave blank to keep current password"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button fit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save admin'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
