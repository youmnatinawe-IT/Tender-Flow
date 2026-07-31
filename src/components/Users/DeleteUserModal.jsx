
import { AlertTriangle, X, Trash2 } from "lucide-react";
import "./style/users.css";

export default function DeleteUserModal({ user, onClose, onDelete }) {
  if (!user) return null;

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <button className="close-icon" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="warning-icon">
          <AlertTriangle size={32} />
        </div>

        <h2>Delete User?</h2>
        <p>
          Are you sure you want to delete <b>{user.name || user.fullName}</b>?
          This action cannot be undone.
        </p>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="delete-btn" onClick={() => onDelete(user)}>
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}