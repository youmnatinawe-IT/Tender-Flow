import { useState } from "react";
import { X, ShieldAlert, CheckCircle, Loader2 } from "lucide-react";
import { acceptUser, banUser } from "../../services/userService";
import ErrorAlert from "../ErrorAlert";
import "./style/users.css";

export default function SuspendUserModal({ user, onClose, onStatusChanged }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!user) return null;

  const userId = user.id || user._id;
  const currentStatus = String(user.status || "").toUpperCase();

  // 🎯 تحديد نوع العملية: إذا كان PENDING أو BANNED أو SUSPENDED فالإجراء هو القبول/التفعيل
  const isActivateAction =
    currentStatus === "PENDING" ||
    currentStatus === "BANNED" ||
    currentStatus === "SUSPENDED";

  const handleToggleStatus = async () => {
    setLoading(true);
    setError(null);

    // استدعاء acceptUser في حالة القبول/التفعيل، و banUser في حالة الحظر
    const result = isActivateAction
      ? await acceptUser(userId)
      : await banUser(userId);

    setLoading(false);

    if (result.success) {
      const newStatus = isActivateAction ? "ACTIVE" : "BANNED";
      if (onStatusChanged) {
        onStatusChanged(userId, newStatus);
      }
      onClose();
    } else {
      setError(
        result.error || {
          message: `Failed to ${isActivateAction ? "activate" : "ban"} user. Please try again.`,
        }
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <button
          className="close-icon"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className={`suspend-icon ${isActivateAction ? "icon-green-bg" : ""}`}>
          {isActivateAction ? (
            <CheckCircle size={32} color="#16a34a" />
          ) : (
            <ShieldAlert size={32} color="#dc2626" />
          )}
        </div>

        <h2>
          {isActivateAction
            ? currentStatus === "PENDING"
              ? "Accept User?"
              : "Activate User?"
            : "Ban User?"}
        </h2>

        <p>
          {isActivateAction ? (
            <>
              You are about to accept and activate{" "}
              <b>{user.name || `${user.f_name || ""} ${user.l_name || ""}`.trim()}</b>
              's account access.
            </>
          ) : (
            <>
              You are about to ban{" "}
              <b>{user.name || `${user.f_name || ""} ${user.l_name || ""}`.trim()}</b>.
              The user will lose access to the platform.
            </>
          )}
        </p>

        <ErrorAlert error={error} />

        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className={isActivateAction ? "save-btn" : "delete-btn"}
            onClick={handleToggleStatus}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isActivateAction ? (
              currentStatus === "PENDING" ? "Accept Account" : "Activate Account"
            ) : (
              "Ban Account"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}