import {
  useState,
} from "react";

import {
  X,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function CreateRoleModal({
  onClose,
  onCreate,
  creating = false,
}) {
  const [code, setCode] =
    useState("");

  const [name, setName] =
    useState("");

  const [nameAr, setNameAr] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [error, setError] =
    useState("");

  /* =========================================================
     Normalize Role Code

     Example:
     Tender Manager
     =>
     TENDER_MANAGER
  ========================================================= */

  const normalizeRoleCode = (
    value
  ) => {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9_ ]/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  /* =========================================================
     Code Change
  ========================================================= */

  const handleCodeChange = (
    event
  ) => {
    const normalized =
      normalizeRoleCode(
        event.target.value
      );

    setCode(normalized);
  };

  /* =========================================================
     Submit
  ========================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    const trimmedCode =
      code.trim();

    const trimmedName =
      name.trim();

    const trimmedNameAr =
      nameAr.trim();

    const trimmedDescription =
      description.trim();

    /* =======================================================
       Validation
    ======================================================= */

    if (!trimmedCode) {
      setError(
        "Role code is required."
      );
      return;
    }

    if (!/^[A-Z0-9_]+$/.test(trimmedCode)) {
      setError(
        "Role code must contain only uppercase English letters, numbers, and underscores."
      );
      return;
    }

    if (!trimmedName) {
      setError(
        "Role name is required."
      );
      return;
    }

    if (!trimmedNameAr) {
      setError(
        "Arabic role name is required."
      );
      return;
    }

    try {
      await onCreate({
        code: trimmedCode,
        name: trimmedName,
        name_ar: trimmedNameAr,
        description:
          trimmedDescription ||
          "Custom system role.",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create role."
      );
    }
  };

  return (
    <div
      className="rp-modal-overlay"
      onClick={() => {
        if (!creating) {
          onClose();
        }
      }}
    >
      <div
        className="rp-create-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* ===================================================
            Header
        =================================================== */}

        <div className="rp-modal-header">

          <div className="rp-modal-title">

            <div className="rp-modal-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <span>
                ACCESS CONTROL
              </span>

              <h2>
                Create New Role
              </h2>
            </div>

          </div>

          <button
            type="button"
            className="rp-modal-close"
            onClick={onClose}
            disabled={creating}
          >
            <X size={19} />
          </button>

        </div>

        {/* ===================================================
            Body
        =================================================== */}

        <form
          className="rp-modal-body"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              Error
          ================================================= */}

          {error && (
            <div
              className="rp-error-message"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <AlertCircle size={17} />

              <span>
                {error}
              </span>
            </div>
          )}

          {/* =================================================
              Role Code
          ================================================= */}

          <div className="rp-form-field">

            <label>
              Role Code
              <span>*</span>
            </label>

            <input
              type="text"
              placeholder="e.g. TENDER_MANAGER"
              value={code}
              onChange={handleCodeChange}
              disabled={creating}
              maxLength={50}
            />

            <small
              style={{
                display: "block",
                marginTop: "6px",
                opacity: 0.6,
                fontSize: "12px",
              }}
            >
              Use uppercase English letters,
              numbers, and underscores only.
            </small>

          </div>

          {/* =================================================
              Role Name
          ================================================= */}

          <div className="rp-form-field">

            <label>
              Role Name
              <span>*</span>
            </label>

            <input
              type="text"
              placeholder="e.g. Tender Manager"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              disabled={creating}
            />

          </div>

          {/* =================================================
              Arabic Name
          ================================================= */}

          <div className="rp-form-field">

            <label>
              Arabic Role Name
              <span>*</span>
            </label>

            <input
              type="text"
              placeholder="مثال: مدير المناقصات"
              value={nameAr}
              onChange={(event) =>
                setNameAr(
                  event.target.value
                )
              }
              disabled={creating}
              dir="rtl"
            />

          </div>

          {/* =================================================
              Description
          ================================================= */}

          <div className="rp-form-field">

            <label>
              Description
            </label>

            <textarea
              placeholder="Describe what this role is responsible for..."
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              rows={4}
              disabled={creating}
            />

          </div>

          {/* =================================================
              Permissions Information
          ================================================= */}

          <div
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              background:
                "rgba(99, 102, 241, 0.07)",
              border:
                "1px solid rgba(99, 102, 241, 0.15)",
              fontSize: "13px",
              lineHeight: "1.6",
            }}
          >
            <strong>
              Permissions
            </strong>

            <p
              style={{
                margin:
                  "4px 0 0",
                opacity: 0.7,
              }}
            >
              Permissions are not assigned
              when creating a role. You can
              assign them after the role is
              created.
            </p>
          </div>

          {/* =================================================
              Footer
          ================================================= */}

          <div className="rp-modal-footer">

            <button
              type="button"
              className="rp-secondary-btn"
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rp-primary-btn"
              disabled={
                creating ||
                !code.trim() ||
                !name.trim() ||
                !nameAr.trim()
              }
            >
              {creating ? (
                <>
                  <span
                    className="rp-spin"
                    style={{
                      display: "inline-flex",
                    }}
                  >
                    <ShieldCheck
                      size={17}
                    />
                  </span>

                  Creating...
                </>
              ) : (
                <>
                  <ShieldCheck
                    size={17}
                  />

                  Create Role
                </>
              )}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}