import {
  useMemo,
  useState,
} from "react";

import {
  ShieldCheck,
  Search,
  Check,
  LockKeyhole,
  Users,
  Pencil,
  X,
  Save,
  Loader2,
} from "lucide-react";

import PermissionGroup from "./PermissionGroup";
import { normalizeRoleCode } from "../../utils/format";

/* =========================================================
   Module Labels
========================================================= */

const moduleLabels = {
  TENDER: "Tenders",
  BID: "Bids",
  USER: "Users",
  ORG: "Organizations",
  REPORT: "Reports",
  SYSTEM: "System",
  COMMITTEE: "Committees",
  CONTRACT: "Contracts",
  EVALUATION: "Evaluations",
};

/* =========================================================
   Component
========================================================= */

export default function RoleDetails({
  role,
  permissions,
  onTogglePermission,
  updatingPermissionId,
  onUpdateRole,
  updatingRole = false,
}) {
  const [search, setSearch] =
    useState("");

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [editData, setEditData] =
    useState({
      code: "",
      name: "",
      name_ar: "",
      description: "",
      is_active: true,
    });

  const [editError, setEditError] =
    useState("");

  /* =========================================================
     Assigned Permission Codes
  ========================================================= */

  const assignedPermissions =
    Array.isArray(
      role?.permissions
    )
      ? role.permissions
      : [];

  /* =========================================================
     Start Editing
  ========================================================= */

  const handleStartEdit = () => {
    setEditError("");

    setEditData({
      code:
        role?.code || "",

      name:
        role?.name || "",

      name_ar:
        role?.name_ar || "",

      description:
        role?.description ||
        "",

      is_active:
        role?.is_active !==
        false,
    });

    setEditing(true);
  };

  /* =========================================================
     Cancel Editing
  ========================================================= */

  const handleCancelEdit = () => {
    if (saving) {
      return;
    }

    setEditing(false);
    setEditError("");
  };

  /* =========================================================
     Change Input
  ========================================================= */

  const handleChange = (
    field,
    value
  ) => {
    setEditData(
      (current) => ({
        ...current,

        [field]:
          field === "code"
            ? normalizeRoleCode(
                value
              )
            : value,
      })
    );
  };

  /* =========================================================
     Save Role
  ========================================================= */

  const handleSave =
    async () => {
      setEditError("");

      const code =
        editData.code.trim();

      const name =
        editData.name.trim();

      const nameAr =
        editData.name_ar.trim();

      const description =
        editData.description.trim();

      /* =======================================================
         Validation
      ======================================================= */

      if (!code) {
        setEditError(
          "Role code is required."
        );
        return;
      }

      if (
        !/^[A-Z0-9_]+$/.test(
          code
        )
      ) {
        setEditError(
          "Role code must contain only uppercase English letters, numbers, and underscores."
        );
        return;
      }

      if (!name) {
        setEditError(
          "Role name is required."
        );
        return;
      }

      if (!nameAr) {
        setEditError(
          "Arabic role name is required."
        );
        return;
      }

      /* =======================================================
         Detect Changed Fields
      ======================================================= */

      const changes = {};

      if (
        code !==
        (role?.code || "")
      ) {
        changes.code =
          code;
      }

      if (
        name !==
        (role?.name || "")
      ) {
        changes.name =
          name;
      }

      if (
        nameAr !==
        (role?.name_ar || "")
      ) {
        changes.name_ar =
          nameAr;
      }

      if (
        description !==
        (role?.description ||
          "")
      ) {
        changes.description =
          description;
      }

      const currentActive =
        role?.is_active !==
        false;

      if (
        editData.is_active !==
        currentActive
      ) {
        changes.is_active =
          editData.is_active;
      }

      /* =======================================================
         Nothing Changed
      ======================================================= */

      if (
        Object.keys(changes)
          .length === 0
      ) {
        setEditing(false);
        return;
      }

      /* =======================================================
         Send PATCH
      ======================================================= */

      try {
        setSaving(true);

        await onUpdateRole(
          role.id,
          changes
        );

        setEditing(false);
        setEditError("");
      } catch (error) {
        console.error(
          "Save role error:",
          error
        );

        setEditError(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Failed to update role."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =========================================================
     Filter Permissions
  ========================================================= */

  const filteredPermissions =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return permissions;
      }

      return permissions.filter(
        (permission) =>
          permission.name
            ?.toLowerCase()
            .includes(value) ||
          permission.code
            ?.toLowerCase()
            .includes(value) ||
          permission.description
            ?.toLowerCase()
            .includes(value) ||
          permission.module
            ?.toLowerCase()
            .includes(value)
      );
    }, [
      permissions,
      search,
    ]);

  /* =========================================================
     Group Permissions By Module
  ========================================================= */

  const groupedPermissions =
    useMemo(() => {
      return filteredPermissions.reduce(
        (
          groups,
          permission
        ) => {
          const module =
            permission.module ||
            "SYSTEM";

          if (
            !groups[module]
          ) {
            groups[module] =
              [];
          }

          groups[module].push(
            permission
          );

          return groups;
        },
        {}
      );
    }, [
      filteredPermissions,
    ]);

  /* =========================================================
     Metrics
  ========================================================= */

  const enabledCount =
    assignedPermissions.length;

  const availableCount =
    permissions.length;

  /* =========================================================
     Render
  ========================================================= */

  return (
    <div className="rp-details">
      {/* ===================================================
          Details Header
      =================================================== */}

      <div className="rp-details-header">
        <div className="rp-details-title">
          <div
            className={`rp-large-role-icon ${
              role.color ||
              "purple"
            }`}
          >
            <ShieldCheck
              size={26}
            />
          </div>

          <div
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <div className="rp-details-label">
              ROLE
            </div>

            {!editing ? (
              <>
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "8px",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                    }}
                  >
                    {role.name}
                  </h2>

                  <button
                    type="button"
                    onClick={
                      handleStartEdit
                    }
                    disabled={
                      updatingRole ||
                      saving ||
                      updatingPermissionId !==
                        null
                    }
                    title="Edit role"
                    aria-label="Edit role"
                    style={{
                      width:
                        "30px",
                      height:
                        "30px",
                      borderRadius:
                        "8px",
                      border:
                        "1px solid rgba(100, 116, 139, 0.2)",
                      background:
                        "transparent",
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      cursor:
                        "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <Pencil
                      size={14}
                    />
                  </button>
                </div>

                <p>
                  {
                    role.description
                  }
                </p>
              </>
            ) : (
              <div
                style={{
                  marginTop:
                    "10px",
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  gap: "10px",
                  maxWidth:
                    "620px",
                }}
              >
                {/* Code */}

                <div className="rp-form-field">
                  <label>
                    Role Code
                    <span>
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      editData.code
                    }
                    onChange={(
                      event
                    ) =>
                      handleChange(
                        "code",
                        event
                          .target
                          .value
                      )
                    }
                    disabled={
                      saving
                    }
                    placeholder="TENDER_MANAGER"
                  />
                </div>

                {/* Name */}

                <div className="rp-form-field">
                  <label>
                    Role Name
                    <span>
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      editData.name
                    }
                    onChange={(
                      event
                    ) =>
                      handleChange(
                        "name",
                        event
                          .target
                          .value
                      )
                    }
                    disabled={
                      saving
                    }
                  />
                </div>

                {/* Arabic Name */}

                <div className="rp-form-field">
                  <label>
                    Arabic Role Name
                    <span>
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      editData.name_ar
                    }
                    onChange={(
                      event
                    ) =>
                      handleChange(
                        "name_ar",
                        event
                          .target
                          .value
                      )
                    }
                    disabled={
                      saving
                    }
                    dir="rtl"
                  />
                </div>

                {/* Description */}

                <div className="rp-form-field">
                  <label>
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={
                      editData.description
                    }
                    onChange={(
                      event
                    ) =>
                      handleChange(
                        "description",
                        event
                          .target
                          .value
                      )
                    }
                    disabled={
                      saving
                    }
                  />
                </div>

                {/* Status */}

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "space-between",
                    padding:
                      "10px 12px",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid rgba(100, 116, 139, 0.15)",
                  }}
                >
                  <div>
                    <strong>
                      Role Status
                    </strong>

                    <p
                      style={{
                        margin:
                          "3px 0 0",
                        fontSize:
                          "12px",
                        opacity:
                          0.6,
                      }}
                    >
                      Enable or
                      disable
                      this role.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={`rp-toggle ${
                      editData.is_active
                        ? "on"
                        : ""
                    }`}
                    onClick={() =>
                      handleChange(
                        "is_active",
                        !editData.is_active
                      )
                    }
                    disabled={
                      saving
                    }
                    aria-label="Toggle role status"
                  >
                    <span />
                  </button>
                </div>

                {/* Error */}

                {editError && (
                  <div
                    className="rp-error-message"
                    style={{
                      padding:
                        "9px 12px",
                      borderRadius:
                        "8px",
                      fontSize:
                        "13px",
                    }}
                  >
                    {
                      editError
                    }
                  </div>
                )}

                {/* Actions */}

                <div
                  style={{
                    display:
                      "flex",
                    gap: "8px",
                    marginTop:
                      "4px",
                  }}
                >
                  <button
                    type="button"
                    className="rp-secondary-btn"
                    onClick={
                      handleCancelEdit
                    }
                    disabled={
                      saving
                    }
                  >
                    <X
                      size={15}
                    />
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="rp-primary-btn"
                    onClick={
                      handleSave
                    }
                    disabled={
                      saving ||
                      updatingRole
                    }
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={15}
                          className="rp-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save
                          size={15}
                        />
                        Save
                        Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status */}

    {!editing && (
  <div
    className={`rp-role-status ${
      role.is_active ? "active" : "inactive"
    }`}
  >
    <span className="rp-active-dot" />

    {role.is_active ? "Active" : "Inactive"}
  </div>
)}
      </div>

      {/* ===================================================
          Role Metrics
      =================================================== */}

      <div className="rp-role-metrics">
        {/* Assigned */}

        <div>
          <div className="rp-metric-icon">
            <Check
              size={16}
            />
          </div>

          <div>
            <strong>
              {
                enabledCount
              }
            </strong>

            <span>
              Assigned
              Permissions
            </span>
          </div>
        </div>

        {/* Available */}

        <div>
          <div className="rp-metric-icon">
            <LockKeyhole
              size={16}
            />
          </div>

          <div>
            <strong>
              {
                availableCount
              }
            </strong>

            <span>
              Available
              Permissions
            </span>
          </div>
        </div>

        {/* Users */}

        <div>
          <div className="rp-metric-icon">
            <Users
              size={16}
            />
          </div>

          <div>
            <strong>
              0
            </strong>

            <span>
              Assigned
              Users
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================
          Permission Header
      =================================================== */}

      <div className="rp-permissions-header">
        <div>
          <span>
            ACCESS CONTROL
          </span>

          <h3>
            Permissions
          </h3>

          <p>
            Enable or disable
            permissions
            assigned to this
            role.
          </p>
        </div>

      
      </div>

      {/* ===================================================
          Permission Groups
      =================================================== */}

      <div className="rp-permissions-list">
        {Object.keys(
          groupedPermissions
        ).length === 0 ? (
          <div className="rp-no-permissions">
            <Search
              size={30}
            />

            <h4>
              No permissions
              found
            </h4>

            <p>
              Try changing
              your search
              term.
            </p>
          </div>
        ) : (
          Object.entries(
            groupedPermissions
          ).map(
            ([
              module,
              modulePermissions,
            ]) => (
              <PermissionGroup
                key={module}
                module={
                  moduleLabels[
                    module
                  ] ||
                  module
                }
                permissions={
                  modulePermissions
                }
                assignedPermissions={
                  assignedPermissions
                }
                onToggle={
                  onTogglePermission
                }
                updatingPermissionId={
                  updatingPermissionId
                }
              />
            )
          )
        )}
      </div>
    </div>
  );
}