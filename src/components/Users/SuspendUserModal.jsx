import { useState } from "react";
import {
  X,
  ShieldAlert,
  CheckCircle,
  RotateCcw,
  XCircle,
  Ban,
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

export default function SuspendUserModal({
  user,
  onClose,
  onStatusChanged,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isRejectMode, setIsRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [isBanMode, setIsBanMode] = useState(false);
  const [banReason, setBanReason] = useState("");

  if (!user) return null;

  const userId = user.id || user._id;

  const currentStatus = String(user.status || "").toUpperCase();

  const userName =
    user.name ||
    `${user.f_name || ""} ${user.l_name || ""}`.trim() ||
    "Unknown User";

  /**
   * تنفيذ العملية المطلوبة
   */
  const handleExecuteAction = async (actionType) => {
    // -----------------------------
    // Validation
    // -----------------------------

    if (actionType === "REJECT" && !rejectReason.trim()) {
      setError({
        isApiError: false,
        message: "Please enter a rejection reason before submitting.",
      });
      return;
    }

    if (actionType === "BAN" && !banReason.trim()) {
      setError({
        isApiError: false,
        message: "Please enter a ban reason before submitting.",
      });
      return;
    }

    setLoading(true);
    setError(null);

    let result = null;
    let newStatus = currentStatus;

    try {
      // =========================
      // ACCEPT
      // PENDING → ACTIVE
      // =========================
      if (actionType === "ACCEPT") {
        result = await acceptUser(userId);
        newStatus = "ACTIVE";
      }

      // =========================
      // REJECT
      // PENDING → REJECTED
      // =========================
      else if (actionType === "REJECT") {
        result = await rejectUser(userId, rejectReason.trim());
        newStatus = "REJECTED";
      }

      // =========================
      // BAN
      // ACTIVE → BANNED
      // =========================
      else if (actionType === "BAN") {
        result = await banUser(userId, banReason.trim());
        newStatus = "BANNED";
      }

      // =========================
      // RESEND
      // REJECTED → PENDING
      // =========================
      else if (actionType === "RESEND") {
        result = await resendPendingUser(userId);
        newStatus = "PENDING";
      }

      // =========================
      // Success
      // =========================
      if (result?.success) {
        if (onStatusChanged) {
          onStatusChanged(userId, newStatus);
        }

        onClose();
        return;
      }

      // =========================
      // API Error
      // =========================
      setError(
        result?.error || {
          isApiError: true,
          message: "An error occurred while processing the request.",
        },
      );
    } catch (err) {
      setError({
        isApiError: true,
        message: err?.message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * إغلاق الـ Modal وإعادة الحالات
   */
  const handleClose = () => {
    if (loading) return;

    setError(null);
    setIsRejectMode(false);
    setIsBanMode(false);
    setRejectReason("");
    setBanReason("");

    onClose();
  };

  /**
   * الرجوع من وضع Reject
   */
  const cancelReject = () => {
    if (loading) return;

    setIsRejectMode(false);
    setRejectReason("");
    setError(null);
  };

  /**
   * الرجوع من وضع Ban
   */
  const cancelBan = () => {
    if (loading) return;

    setIsBanMode(false);
    setBanReason("");
    setError(null);
  };

  // ============================================================
  // تحديد العمليات المسموحة حسب حالة المستخدم
  // ============================================================

  const isPending = currentStatus === "PENDING";
  const isActive = currentStatus === "ACTIVE";
  const isRejected = currentStatus === "REJECTED";
  const isBanned = currentStatus === "BANNED";

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">

        {/* Close */}
        <button
          className="close-icon"
          onClick={handleClose}
          disabled={loading}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="suspend-icon">
          <ShieldAlert size={32} color="#dc2626" />
        </div>

        <h2>Manage Account</h2>

        <p>
          User: <b>{userName}</b>
        </p>

        {/* Current status */}
        <div
          style={{
            marginTop: "8px",
            marginBottom: "12px",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          Current Status:{" "}
          <strong>{currentStatus || "UNKNOWN"}</strong>
        </div>

        {/* =====================================================
            REJECT MODE
        ====================================================== */}

        {isRejectMode && (
          <div
            className="form-group"
            style={{
              textAlign: "left",
              marginTop: "12px",
            }}
          >
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "4px",
                display: "block",
              }}
            >
              Rejection Reason
            </label>

            <textarea
              rows={4}
              placeholder="Enter the reason for rejecting this account..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>
        )}

        {/* =====================================================
            BAN MODE
        ====================================================== */}

        {isBanMode && (
          <div
            className="form-group"
            style={{
              textAlign: "left",
              marginTop: "12px",
            }}
          >
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "4px",
                display: "block",
              }}
            >
              Ban Reason
            </label>

            <textarea
              rows={4}
              placeholder="Enter the reason for banning this account..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>
        )}

        {/* Error */}
        <ErrorAlert error={error} />

        {/* =====================================================
            ACTIONS
        ====================================================== */}

        <div
          className="modal-actions"
          style={{
            flexWrap: "wrap",
            gap: "8px",
            justifyContent: "center",
          }}
        >

          {/* ===================================================
              REJECT MODE BUTTONS
          ==================================================== */}

          {isRejectMode ? (
            <>
              <button
                className="cancel-btn"
                onClick={cancelReject}
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
                  <>
                    <XCircle size={16} />
                    Send & Reject Account
                  </>
                )}
              </button>
            </>
          ) : isBanMode ? (

          /* ===================================================
             BAN MODE BUTTONS
          ==================================================== */

            <>
              <button
                className="cancel-btn"
                onClick={cancelBan}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="delete-btn"
                style={{
                  backgroundColor: "#334155",
                }}
                onClick={() => handleExecuteAction("BAN")}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Ban size={16} />
                    Confirm & Ban Account
                  </>
                )}
              </button>
            </>
          ) : (

          /* ===================================================
             NORMAL MODE
          ==================================================== */

            <>

              {/* ---------------------------------------------
                  PENDING
                  PENDING → ACTIVE
              ---------------------------------------------- */}

              {isPending && (
                <>
                  <button
                    className="accept-btn"
                    onClick={() =>
                      handleExecuteAction("ACCEPT")
                    }
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Accept Account
                      </>
                    )}
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => {
                      setIsRejectMode(true);
                      setIsBanMode(false);
                      setError(null);
                    }}
                    disabled={loading}
                  >
                    <XCircle size={16} />
                    Reject Account
                  </button>
                </>
              )}

              {/* ---------------------------------------------
                  ACTIVE
                  ACTIVE → BANNED
              ---------------------------------------------- */}

              {isActive && (
                <button
                  className="delete-btn"
                  style={{
                    backgroundColor: "#334155",
                  }}
                  onClick={() => {
                    setIsBanMode(true);
                    setIsRejectMode(false);
                    setError(null);
                  }}
                  disabled={loading}
                >
                  <Ban size={16} />
                  Ban Account
                </button>
              )}

              {/* ---------------------------------------------
                  REJECTED
                  REJECTED → PENDING
              ---------------------------------------------- */}

              {isRejected && (
                <button
                  className="suspend-btn"
                  onClick={() =>
                    handleExecuteAction("RESEND")
                  }
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <>
                      <RotateCcw size={16} />
                      Send for Review Again
                    </>
                  )}
                </button>
              )}

              {/* ---------------------------------------------
                  BANNED
                  لا يوجد Unban API حاليًا
              ---------------------------------------------- */}

              {isBanned && (
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    padding: "10px",
                    fontSize: "13px",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderRadius: "8px",
                  }}
                >
                  This account is banned.
                  <br />
                  No unban action is available from the current API.
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
}