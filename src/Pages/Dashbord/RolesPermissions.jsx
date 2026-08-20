import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  ShieldCheck,
  Search,
  KeyRound,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import RoleCard from "../../components/RolesPermissions/RoleCard";
import RoleDetails from "../../components/RolesPermissions/RoleDetails";
import CreateRoleModal from "../../components/RolesPermissions/CreateRoleModal";

import {
  getAllRoles,
  createRole,
  updateRole,
} from "../../services/rolesService";

import {
  getAllPermissions,
  addPermissionToRole,
  removePermissionFromRole,
} from "../../services/permissionsService";

import "../../components/RolesPermissions/style/rolePermission.css";

/* =========================================================
   Normalize Permission
========================================================= */

const normalizePermission = (
  permission,
  index
) => {
  const code =
    permission?.code ||
    permission?.permission ||
    permission?.name ||
    `permission-${index}`;

  const module =
    permission?.module ||
    "SYSTEM";

  return {
    ...permission,

    id:
      permission?._id ||
      permission?.id ||
      permission?.permission_id ||
      code,

    code,

    name:
      permission?.name ||
      permission?.name_ar ||
      code,

    name_ar:
      permission?.name_ar ||
      permission?.name ||
      code,

    description:
      permission?.description ||
      "No description available.",

    module: String(module)
      .trim()
      .toUpperCase(),

    is_active:
      permission?.is_active !== false,
  };
};

/* =========================================================
   Normalize Role
========================================================= */

const normalizeRole = (
  role,
  index
) => {
  const roleName =
    role?.name ||
    role?.role_name ||
    role?.title ||
    role?.code ||
    `Role ${index + 1}`;

  const normalizedName =
    String(roleName).trim();

  const lowerName =
    normalizedName.toLowerCase();

  /* =======================================================
     Role Icon + Color
  ======================================================= */

  let icon = "shield";
  let color = "purple";

  if (
    lowerName.includes(
      "publisher"
    )
  ) {
    icon = "building";
    color = "blue";
  } else if (
    lowerName.includes(
      "executor"
    ) ||
    lowerName.includes(
      "exectuore"
    ) ||
    lowerName.includes(
      "bidder"
    )
  ) {
    icon = "users";
    color = "green";
  } else if (
    lowerName.includes(
      "admin"
    ) ||
    lowerName.includes(
      "super"
    )
  ) {
    icon = "shield";
    color = "purple";
  }

  /* =======================================================
     Role Permissions
  ======================================================= */

  const backendPermissions =
    Array.isArray(
      role?.permissions
    )
      ? role.permissions
      : [];

  const assignedPermissions =
    backendPermissions
      .map((permission) => {
        if (
          typeof permission ===
          "string"
        ) {
          return permission;
        }

        return (
          permission?.code ||
          permission?.permission ||
          permission?.permission_code ||
          permission?.id ||
          permission?._id ||
          permission?.permission_id ||
          null
        );
      })
      .filter(Boolean);

  return {
    ...role,

    id:
      role?._id ||
      role?.id ||
      role?.role_id ||
      role?.code ||
      `role-${index}`,

    code:
      role?.code ||
      normalizedName,

    name: normalizedName,

    name_ar:
      role?.name_ar ||
      normalizedName,

    description:
      role?.description ||
      role?.details ||
      role?.desc ||
      "No description available.",

    icon,
    color,

    is_active:
      role?.is_active !== false,

    permissions:
      assignedPermissions,
  };
};

/* =========================================================
   Component
========================================================= */

export default function RolesPermissions() {
  /* =========================================================
     State
  ========================================================= */

  const [roles, setRoles] =
    useState([]);

  const [permissions, setPermissions] =
    useState([]);

  const [
    selectedRoleId,
    setSelectedRoleId,
  ] = useState(null);

  const [search, setSearch] =
    useState("");

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [
    creatingRole,
    setCreatingRole,
  ] = useState(false);

  const [
    updatingRole,
    setUpdatingRole,
  ] = useState(false);

  /* =========================================================
     Permission Updating State

     Contains the permission ID currently being added/removed.
  ========================================================= */

  const [
    updatingPermissionId,
    setUpdatingPermissionId,
  ] = useState(null);

  const [error, setError] =
    useState("");

  /* =========================================================
     Fetch Roles + Permissions
  ========================================================= */

  const fetchData = async (
    keepSelectedRole = true
  ) => {
    try {
      setLoading(true);
      setError("");

      const [
        rolesResponse,
        permissionsResponse,
      ] = await Promise.all([
        getAllRoles(),
        getAllPermissions(),
      ]);

      /* =====================================================
         Normalize Roles
      ===================================================== */

      const normalizedRoles =
        Array.isArray(
          rolesResponse
        )
          ? rolesResponse.map(
              normalizeRole
            )
          : [];

      /* =====================================================
         Normalize Permissions
      ===================================================== */

      const normalizedPermissions =
        Array.isArray(
          permissionsResponse
        )
          ? permissionsResponse
              .map(
                normalizePermission
              )
              .filter(
                (permission) =>
                  permission.is_active
              )
          : [];

      setRoles(
        normalizedRoles
      );

      setPermissions(
        normalizedPermissions
      );

      /* =====================================================
         Selection
      ===================================================== */

      if (
        normalizedRoles.length ===
        0
      ) {
        setSelectedRoleId(null);
        return;
      }

      if (keepSelectedRole) {
        const selectedStillExists =
          normalizedRoles.some(
            (role) =>
              role.id ===
              selectedRoleId
          );

        if (
          selectedStillExists
        ) {
          return;
        }
      }

      setSelectedRoleId(
        normalizedRoles[0].id
      );
    } catch (err) {
      console.error(
        "Get roles and permissions error:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
          err?.response?.data
            ?.error ||
          err?.message ||
          "Failed to load roles and permissions."
      );

      setRoles([]);
      setPermissions([]);
      setSelectedRoleId(null);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     Load Data On Mount
  ========================================================= */

  useEffect(() => {
    fetchData(false);
  }, []);

  /* =========================================================
     Selected Role
  ========================================================= */

  const selectedRole =
    roles.find(
      (role) =>
        role.id ===
        selectedRoleId
    );

  /* =========================================================
     Filter Roles
  ========================================================= */

  const filteredRoles =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return roles;
      }

      return roles.filter(
        (role) =>
          role.name
            .toLowerCase()
            .includes(value) ||
          role.description
            .toLowerCase()
            .includes(value) ||
          role.code
            ?.toLowerCase()
            .includes(value)
      );
    }, [roles, search]);

  /* =========================================================
     Toggle Permission

     If permission exists:
       DELETE

     If permission does not exist:
       POST
  ========================================================= */

  const handleTogglePermission =
    async (permission) => {
      if (!selectedRole) {
        return;
      }

      const permissionId =
        permission?.id ||
        permission?._id ||
        permission?.permission_id;

      if (!permissionId) {
        setError(
          "Permission ID is missing. Cannot update permission."
        );

        return;
      }

      const roleId =
        selectedRole.id;

      if (!roleId) {
        setError(
          "Role ID is missing. Cannot update permission."
        );

        return;
      }

      /* =====================================================
         Check Current State
      ===================================================== */

      const isCurrentlyAssigned =
        selectedRole.permissions.includes(
          permission.code
        );

      try {
        setUpdatingPermissionId(
          permissionId
        );

        setError("");

        /* ===================================================
           REMOVE PERMISSION
        =================================================== */

        if (
          isCurrentlyAssigned
        ) {
          console.log(
            "Removing permission:",
            {
              roleId,
              permissionId,
              permissionCode:
                permission.code,
            }
          );

          await removePermissionFromRole(
            roleId,
            permissionId
          );
        }

        /* ===================================================
           ADD PERMISSION
        =================================================== */

        else {
          console.log(
            "Adding permission:",
            {
              roleId,
              permissionId,
              permissionCode:
                permission.code,
            }
          );

          await addPermissionToRole(
            roleId,
            permissionId
          );
        }

        /* ===================================================
           Reload From Backend

           This is important because the Backend remains
           the source of truth.
        =================================================== */

        const rolesResponse =
          await getAllRoles();

        const normalizedRoles =
          Array.isArray(
            rolesResponse
          )
            ? rolesResponse.map(
                normalizeRole
              )
            : [];

        setRoles(
          normalizedRoles
        );

        /* ===================================================
           Keep Same Role Selected
        =================================================== */

        const updatedRole =
          normalizedRoles.find(
            (role) =>
              role.id ===
              roleId
          );

        if (updatedRole) {
          setSelectedRoleId(
            updatedRole.id
          );
        }

        console.log(
          isCurrentlyAssigned
            ? "Permission removed successfully."
            : "Permission added successfully."
        );
      } catch (err) {
        console.error(
          "Toggle permission error:",
          err
        );

        const message =
          err?.response?.data
            ?.message ||
          err?.response?.data
            ?.error ||
          err?.message ||
          (isCurrentlyAssigned
            ? "Failed to remove permission."
            : "Failed to add permission.");

        setError(message);
      } finally {
        setUpdatingPermissionId(
          null
        );
      }
    };

  /* =========================================================
     Create Role
  ========================================================= */

  const handleCreateRole =
    async (roleData) => {
      try {
        setCreatingRole(true);
        setError("");

        const createdRole =
          await createRole({
            code:
              roleData.code,
            name:
              roleData.name,
            name_ar:
              roleData.name_ar,
            description:
              roleData.description,
          });

        console.log(
          "Role created successfully:",
          createdRole
        );

        setShowCreateModal(
          false
        );

        /* ===================================================
           Reload Roles
        =================================================== */

        const rolesResponse =
          await getAllRoles();

        const normalizedRoles =
          Array.isArray(
            rolesResponse
          )
            ? rolesResponse.map(
                normalizeRole
              )
            : [];

        setRoles(
          normalizedRoles
        );

        /* ===================================================
           Select Created Role
        =================================================== */

        const createdRoleCode =
          createdRole?.code ||
          roleData.code;

        const newlyCreatedRole =
          normalizedRoles.find(
            (role) =>
              role.code ===
              createdRoleCode
          );

        if (
          newlyCreatedRole
        ) {
          setSelectedRoleId(
            newlyCreatedRole.id
          );
        } else if (
          normalizedRoles.length >
          0
        ) {
          setSelectedRoleId(
            normalizedRoles[0].id
          );
        } else {
          setSelectedRoleId(
            null
          );
        }
      } catch (err) {
        console.error(
          "Create role error:",
          err
        );

        const message =
          err?.response?.data
            ?.message ||
          err?.response?.data
            ?.error ||
          err?.message ||
          "Failed to create role.";

        setError(message);

        throw err;
      } finally {
        setCreatingRole(
          false
        );
      }
    };

  /* =========================================================
     Update Role
  ========================================================= */

  const handleUpdateRole =
    async (
      roleId,
      changes
    ) => {
      try {
        if (!roleId) {
          throw new Error(
            "Role ID is missing."
          );
        }

        setUpdatingRole(true);
        setError("");

        console.log(
          "Updating role:",
          roleId,
          changes
        );

        const updatedRole =
          await updateRole(
            roleId,
            changes
          );

        console.log(
          "Role updated successfully:",
          updatedRole
        );

        /* ===================================================
           Reload Roles
        =================================================== */

        const rolesResponse =
          await getAllRoles();

        const normalizedRoles =
          Array.isArray(
            rolesResponse
          )
            ? rolesResponse.map(
                normalizeRole
              )
            : [];

        setRoles(
          normalizedRoles
        );

        /* ===================================================
           Keep Same Role Selected
        =================================================== */

        const updatedRoleFromList =
          normalizedRoles.find(
            (role) =>
              role.id ===
              roleId
          );

        if (
          updatedRoleFromList
        ) {
          setSelectedRoleId(
            updatedRoleFromList.id
          );
        }

        return updatedRoleFromList;
      } catch (err) {
        console.error(
          "Update role error:",
          err
        );

        const message =
          err?.response?.data
            ?.message ||
          err?.response?.data
            ?.error ||
          err?.message ||
          "Failed to update role.";

        setError(message);

        throw err;
      } finally {
        setUpdatingRole(
          false
        );
      }
    };

  /* =========================================================
     Loading
  ========================================================= */

  if (loading) {
    return (
      <div className="roles-permissions-page">
        <div
          className="rp-loading-state"
          style={{
            minHeight:
              "500px",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            flexDirection:
              "column",
            gap: "12px",
          }}
        >
          <Loader2
            size={32}
            className="rp-spin"
          />

          <p>
            Loading roles and
            permissions...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     Render
  ========================================================= */

  return (
    <div className="roles-permissions-page">
      {/* =====================================================
          Header
      ===================================================== */}

      <div className="rp-page-header">
        <div className="rp-header-content">
          <div className="rp-header-icon">
            <ShieldCheck
              size={25}
            />
          </div>

          <div>
            <div className="rp-breadcrumb">
              Administration

              <span>/</span>

              Roles &
              Permissions
            </div>

            <h1>
              Roles &
              Permissions
            </h1>

            <p>
              Manage system
              roles and
              control access
              to Tender Flow
              resources.
            </p>
          </div>
        </div>

        <button
          className="rp-primary-btn"
          onClick={() => {
            setError("");
            setShowCreateModal(
              true
            );
          }}
          disabled={
            creatingRole ||
            updatingRole ||
            updatingPermissionId !==
              null
          }
        >
          <Plus size={18} />

          Create Role
        </button>
      </div>

      {/* =====================================================
          Error
      ===================================================== */}

      {error && (
        <div
          className="rp-error-message"
          style={{
            marginBottom:
              "18px",
            padding:
              "14px 16px",
            borderRadius:
              "10px",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            gap: "12px",
          }}
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "10px",
            }}
          >
            <AlertCircle
              size={18}
            />

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchData(true)
            }
            style={{
              border:
                "none",
              background:
                "transparent",
              cursor:
                "pointer",
              display:
                "flex",
              alignItems:
                "center",
              gap: "6px",
            }}
          >
            <RefreshCw
              size={16}
            />

            Retry
          </button>
        </div>
      )}

      {/* =====================================================
          Main Workspace
      ===================================================== */}

      <div className="rp-workspace">
        {/* ===================================================
            Roles Sidebar
        =================================================== */}

        <aside className="rp-roles-panel">
          <div className="rp-panel-header">
            <div>
              <span>
                ACCESS CONTROL
              </span>

              <h2>
                Roles
              </h2>
            </div>

            <span className="rp-count-badge">
              {roles.length}
            </span>
          </div>

          {/* Search */}

          <div className="rp-search">
            <Search
              size={17}
            />

            <input
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
            />
          </div>

          {/* Role List */}

          <div className="rp-role-list">
            {filteredRoles.length ===
            0 ? (
              <div className="rp-no-roles">
                <Search
                  size={28}
                />

                <p>
                  {search
                    ? "No roles found."
                    : "No roles available."}
                </p>
              </div>
            ) : (
              filteredRoles.map(
                (role) => (
                  <RoleCard
                    key={
                      role.id
                    }
                    role={
                      role
                    }
                    selected={
                      role.id ===
                      selectedRoleId
                    }
                    onClick={() =>
                      setSelectedRoleId(
                        role.id
                      )
                    }
                  />
                )
              )
            )}
          </div>
        </aside>

        {/* ===================================================
            Details
        =================================================== */}

        <main className="rp-details-panel">
          {selectedRole ? (
            <RoleDetails
              role={
                selectedRole
              }
              permissions={
                permissions
              }
              onTogglePermission={
                handleTogglePermission
              }
              updatingPermissionId={
                updatingPermissionId
              }
              onUpdateRole={
                handleUpdateRole
              }
              updatingRole={
                updatingRole
              }
            />
          ) : (
            <div className="rp-empty-details">
              <div>
                <KeyRound
                  size={35}
                />
              </div>

              <h3>
                Select a role
              </h3>

              <p>
                Select a role
                from the left
                to manage its
                permissions.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* =====================================================
          Create Role Modal
      ===================================================== */}

      {showCreateModal && (
        <CreateRoleModal
          onClose={() => {
            if (
              !creatingRole
            ) {
              setShowCreateModal(
                false
              );
            }
          }}
          onCreate={
            handleCreateRole
          }
          creating={
            creatingRole
          }
        />
      )}
    </div>
  );
}