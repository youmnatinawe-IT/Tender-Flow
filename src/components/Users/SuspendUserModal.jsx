
import { X, UserX, ShieldAlert } from "lucide-react";
import "./style/users.css";

export default function SuspendUserModal({ user, onClose, onSuspend }) {
  if (!user) return null;

  const isSuspended = user.status === "Suspended";

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <button className="close-icon" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="suspend-icon">
          <ShieldAlert size={32} />
        </div>

        <h2>{isSuspended ? "Unsuspend User?" : "Suspend User?"}</h2>
        <p>
          {isSuspended ? (
            <>You are about to reactivate <b>{user.name || user.fullName}</b>'s account access.</>
          ) : (
            <>You are about to suspend <b>{user.name || user.fullName}</b>. The user will lose access to the system.</>
          )}
        </p>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="suspend-btn" onClick={() => onSuspend(user)}>
            <UserX size={18} />
            {isSuspended ? "Reactivate" : "Suspend"}
          </button>
        </div>
      </div>
    </div>
  );
}