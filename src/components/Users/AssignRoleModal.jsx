import { useEffect, useState } from "react";

import {
  X,
  ShieldCheck,
  Loader2,
  Save,
  AlertCircle,
} from "lucide-react";

import {
  getAllRoles,
  assignRoleToUser,
} from "../../services/rolesService";

import ErrorAlert from "../ErrorAlert";

import "./style/users.css";

export default function AssignRoleModal({
  user,
  onClose,
  onRoleAssigned,
}) {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const [loadingRoles, setLoadingRoles] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);

  /* =========================================================
     Helpers
  ========================================================= */

  const getRoleId = (role) => {
    return (
      role?.id ||
      role?._id ||
      role?.role_id
    );
  };

  const getRoleName = (role) => {
    return (
      role?.name ||
      role?.name_en ||
      role?.name_ar ||
      role?.code ||
      role?.role_name ||
      "Unnamed Role"
    );
  };

  const getCurrentRole = () => {
    if (!user) return null;

    // role object
    if (
      user.role &&
      typeof user.role === "object"
    ) {
      return user.role;
    }

    // roles array
    if (
      Array.isArray(user.roles) &&
      user.roles.length > 0
    ) {
      if (
        typeof user.roles[0] === "object"
      ) {
        return user.roles[0];
      }
    }

    return null;
  };

  /* =========================================================
     Load Roles
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadRoles = async () => {
      try {
        setLoadingRoles(true);
        setError(null);

        const result = await getAllRoles();

        if (!mounted) return;

        /*
          getAllRoles() يرجع Array مباشرة:

          [
            {
              _id: "...",
              code: "PUBLISHER",
              name: "Publisher"
            }
          ]

          لذلك لا نبحث عن result.success هنا.
        */

        let roleList = [];

        if (Array.isArray(result)) {
          roleList = result;
        } else if (
          Array.isArray(result?.data)
        ) {
          roleList = result.data;
        } else if (
          Array.isArray(result?.roles)
        ) {
          roleList = result.roles;
        } else if (
          Array.isArray(result?.data?.data)
        ) {
          roleList = result.data.data;
        } else if (
          Array.isArray(result?.data?.roles)
        ) {
          roleList = result.data.roles;
        }

        setRoles(roleList);

        /* =====================================================
           Detect Current Role
        ===================================================== */

        const currentRole =
          getCurrentRole();

        const currentRoleId =
          getRoleId(currentRole);

        if (currentRoleId) {
          setSelectedRoleId(
            String(currentRoleId)
          );
        }
      } catch (err) {
        console.error(
          "Failed to load roles:",
          err
        );

        if (!mounted) return;

        setError({
          isApiError: true,
          message:
            err?.response?.data?.message ||
            err?.message ||
            "Failed to load roles.",
        });
      } finally {
        if (mounted) {
          setLoadingRoles(false);
        }
      }
    };

    loadRoles();

    return () => {
      mounted = false;
    };
  }, [user]);

  /* =========================================================
     Submit / Assign Role
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId =
      user?.id ||
      user?._id ||
      user?.user_id;

    if (!userId) {
      setError({
        isApiError: true,
        message:
          "User ID is missing.",
      });

      return;
    }

    if (!selectedRoleId) {
      setError({
        isApiError: true,
        message:
          "Please select a role.",
      });

      return;
    }

    try {
      setSaving(true);
      setError(null);

      /*
        PATCH

        /api/users_role/{user_id}/role

        Body:

        {
          role_id: "ROLE_ID"
        }
      */

      const result =
        await assignRoleToUser(
          userId,
          selectedRoleId
        );

      if (result?.success) {
        /*
          Find selected role locally
        */

        const selectedRole =
          roles.find(
            (role) =>
              String(
                getRoleId(role)
              ) ===
              String(selectedRoleId)
          );

        /*
          Update UserTable
        */

        if (onRoleAssigned) {
          onRoleAssigned({
            role:
              selectedRole || {
                id: selectedRoleId,
                _id: selectedRoleId,
                role_id: selectedRoleId,
                name:
                  "Assigned Role",
              },

            role_id:
              selectedRoleId,
          });
        }

        onClose();

        return;
      }

      setError(
        result?.error || {
          isApiError: true,
          message:
            "Failed to assign role.",
        }
      );
    } catch (err) {
      console.error(
        "Assign role error:",
        err
      );

      setError({
        isApiError: true,
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to assign role.",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     Current Role
  ========================================================= */

  const currentRole =
    getCurrentRole();

  /* =========================================================
     User Name
  ========================================================= */

  const userName =
    user?.name ||
    user?.fullName ||
    `${user?.f_name || ""} ${
      user?.l_name || ""
    }`.trim() ||
    "Unknown User";

  /* =========================================================
     Render
  ========================================================= */

  return (
    <div className="modal-overlay">
      <div
        className="user-modal"
        style={{
          maxWidth: "520px",
        }}
      >
        {/* =====================================================
            Header
        ===================================================== */}

        <div className="modal-header">
          <div>
            <h2>
              Assign Role
            </h2>

            <p>
              Manage the role assigned
              to this user
            </p>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
            disabled={saving}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* =====================================================
            User Info
        ===================================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 16px",
            marginBottom: "20px",
            borderRadius: "12px",
            background: "#f8fafc",
            border:
              "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              background: "#eef2ff",
              color: "#4f46e5",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {userName
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>
              {userName}
            </strong>

            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginTop: "3px",
              }}
            >
              {user?.email ||
                "No email"}
            </div>
          </div>
        </div>

        {/* =====================================================
            Current Role
        ===================================================== */}

        {currentRole && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 14px",
              marginBottom: "18px",
              borderRadius: "10px",
              background: "#f0fdf4",
              border:
                "1px solid #bbf7d0",
            }}
          >
            <ShieldCheck
              size={18}
              style={{
                color: "#16a34a",
                flexShrink: 0,
              }}
            />

            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  marginBottom: "2px",
                }}
              >
                Current Role
              </div>

              <strong
                style={{
                  color: "#166534",
                }}
              >
                {getRoleName(
                  currentRole
                )}
              </strong>
            </div>
          </div>
        )}

        {/* =====================================================
            Form
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label>
              Select Role
            </label>

            {loadingRoles ? (
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "8px",
                  padding: "12px",
                  color: "#64748b",
                }}
              >
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Loading roles...
              </div>
            ) : roles.length ===
              0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "8px",
                  padding: "14px",
                  borderRadius: "8px",
                  background:
                    "#fff7ed",
                  color: "#c2410c",
                  fontSize: "14px",
                }}
              >
                <AlertCircle
                  size={18}
                />

                No roles available.
              </div>
            ) : (
              <select
                value={
                  selectedRoleId
                }
                onChange={(e) =>
                  setSelectedRoleId(
                    e.target.value
                  )
                }
                disabled={saving}
                required
              >
                <option value="">
                  Select a role...
                </option>

                {roles.map(
                  (role) => {
                    const roleId =
                      getRoleId(
                        role
                      );

                    if (!roleId)
                      return null;

                    return (
                      <option
                        key={roleId}
                        value={roleId}
                      >
                        {getRoleName(
                          role
                        )}

                        {role?.code
                          ? ` (${role.code})`
                          : ""}
                      </option>
                    );
                  }
                )}
              </select>
            )}
          </div>

          {/* ===================================================
              Error
          =================================================== */}

          <ErrorAlert
            error={error}
          />

          {/* ===================================================
              Actions
          =================================================== */}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={
                saving ||
                loadingRoles ||
                !selectedRoleId ||
                roles.length === 0
              }
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Assigning...
                </>
              ) : (
                <>
                  <Save
                    size={18}
                  />

                  Assign Role
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}