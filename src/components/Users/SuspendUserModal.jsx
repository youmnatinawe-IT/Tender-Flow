import { useState } from "react";
import {
  X,
  ShieldAlert,
  CheckCircle,
  RotateCcw,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  acceptUser,
  banUser,
  rejectUser,
  resendPendingUser,
} from "../../services/userService";
import ErrorAlert from "../ErrorAlert";
import "./style/users.css";

export default function SuspendUserModal({ user, onClose, onStatusChanged }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State to determine selected action ('REJECT' for rejection, or NULL for general actions)
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (!user) return null;

  const userId = user.id || user._id;
  const currentStatus = String(user.status || "").toUpperCase();

  // Handle all actions (Accept, Ban, Suspend/Pending, Reject)
  const handleExecuteAction = async (actionType) => {
    if (actionType === "REJECT" && !rejectReason.trim()) {
      setError({
        isApiError: false,
        message: "Please enter a rejection reason before submitting.",
      });
      return;
    }

    setLoading(true);
    setError(null);

    let result;
    let newStatus = currentStatus;

    if (actionType === "ACCEPT") {
      result = await acceptUser(userId);
      newStatus = "ACTIVE";
    } else if (actionType === "BAN") {
      result = await banUser(userId);
      newStatus = "BANNED";
    } else if (actionType === "RESEND") {
      result = await resendPendingUser(userId);
      newStatus = "PENDING";
    } else if (actionType === "REJECT") {
      result = await rejectUser(userId, rejectReason.trim());
      newStatus = "REJECTED";
    }

    setLoading(false);

    if (result && result.success) {
      if (onStatusChanged) {
        onStatusChanged(userId, newStatus);
      }
      onClose();
    } else {
      setError(
        result?.error || {
          isApiError: true,
          message: "An error occurred while processing the request.",
        },
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

        <div className="suspend-icon">
          <ShieldAlert size={32} color="#dc2626" />
        </div>

        <h2>Manage Account</h2>
        <p>
          User:{" "}
          <b>
            {user.name || `${user.f_name || ""} ${user.l_name || ""}`.trim()}
          </b>
        </p>

        {/* Input field for rejection reason when in rejection mode */}
        {isRejectMode && (
          <div
            className="form-group"
            style={{ textAlign: "left", marginTop: "12px" }}
          >
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "4px",
                display: "block",
              }}
            >
              Rejection Reason (will be sent in the message):
            </label>

            <textarea
              rows={3}
              placeholder="Enter the reason for rejecting this account..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>
        )}

        <ErrorAlert error={error} />

        <div
          className="modal-actions"
          style={{ flexWrap: "wrap", gap: "8px", justifyContent: "center" }}
        >
          {isRejectMode ? (
            <>
              <button
                className="cancel-btn"
                onClick={() => {
                  setIsRejectMode(false);
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="delete-btn"
                onClick={() => handleExecuteAction("REJECT")}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Send & Reject Account"
                )}
              </button>
            </>
          ) : (
            <>
              {currentStatus !== "ACTIVE" && (
                <button
                  className="accept-btn" 
                  onClick={() => handleExecuteAction("ACCEPT")}
                  disabled={loading}
                >
                  <CheckCircle size={16} /> Accept Account
                </button>
              )}
              {/* 2. Suspend / Set Pending Button */}
              {currentStatus !== "PENDING" && (
                <button
                  className="suspend-btn"
                  onClick={() => handleExecuteAction("RESEND")}
                  disabled={loading}
                >
                  <RotateCcw size={16} /> Suspend Account
                </button>
              )}

              {/* 3. Reject Account Button */}
              {currentStatus !== "REJECTED" && (
                <button
                  className="delete-btn"
                  onClick={() => setIsRejectMode(true)}
                  disabled={loading}
                >
                  <XCircle size={16} /> Reject Account
                </button>
              )}

              {/* 4. Ban Account Button */}
              {currentStatus !== "BANNED" && (
                <button
                  className="delete-btn"
                  style={{ backgroundColor: "#334155" }}
                  onClick={() => handleExecuteAction("BAN")}
                  disabled={loading}
                >
                  Ban Account
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
