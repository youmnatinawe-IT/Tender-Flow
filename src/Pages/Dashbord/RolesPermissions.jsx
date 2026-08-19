import { useMemo, useState } from "react";
import {
  Plus,
  ShieldCheck,
  Search,
  KeyRound,
} from "lucide-react";

import RoleCard from "../../components/RolesPermissions/RoleCard";
import RoleDetails from "../../components/RolesPermissions/RoleDetails";
import CreateRoleModal from "../../components/RolesPermissions/CreateRoleModal";

import "../../components/RolesPermissions/style/rolePermission.css";

/* =========================================================
   Permissions
========================================================= */

const initialPermissions = [
  /* =========================
     Organizations
  ========================= */

  {
    id: "organizations.view",
    name: "View Organizations",
    description: "View organization information and profiles.",
    module: "Organizations",
  },
  {
    id: "organizations.create",
    name: "Create Organizations",
    description: "Create new organizations.",
    module: "Organizations",
  },
  {
    id: "organizations.edit",
    name: "Edit Organizations",
    description: "Modify organization information.",
    module: "Organizations",
  },
  {
    id: "organizations.approve",
    name: "Approve Organizations",
    description: "Approve pending organization registrations.",
    module: "Organizations",
  },
  {
    id: "organizations.reject",
    name: "Reject Organizations",
    description: "Reject organization registration requests.",
    module: "Organizations",
  },
  {
    id: "organizations.suspend",
    name: "Suspend Organizations",
    description: "Suspend or block organizations.",
    module: "Organizations",
  },

  /* =========================
     Users
  ========================= */

  {
    id: "users.view",
    name: "View Users",
    description: "View users and their information.",
    module: "Users",
  },
  {
    id: "users.create",
    name: "Create Users",
    description: "Create new platform users.",
    module: "Users",
  },
  {
    id: "users.edit",
    name: "Edit Users",
    description: "Modify user information.",
    module: "Users",
  },
  {
    id: "users.suspend",
    name: "Suspend Users",
    description: "Suspend or activate user accounts.",
    module: "Users",
  },
  {
    id: "users.delete",
    name: "Delete Users",
    description: "Delete user accounts.",
    module: "Users",
  },

  /* =========================
     Tenders
  ========================= */

  {
    id: "tenders.view",
    name: "View Tenders",
    description: "View tender information.",
    module: "Tenders",
  },
  {
    id: "tenders.create",
    name: "Create Tenders",
    description: "Create new tenders.",
    module: "Tenders",
  },
  {
    id: "tenders.edit",
    name: "Edit Tenders",
    description: "Edit draft tender information.",
    module: "Tenders",
  },
  {
    id: "tenders.delete",
    name: "Delete Tenders",
    description: "Delete tenders from the system.",
    module: "Tenders",
  },
  {
    id: "tenders.publish",
    name: "Publish Tenders",
    description: "Publish tenders to bidders.",
    module: "Tenders",
  },
  {
    id: "tenders.close",
    name: "Close Tenders",
    description: "Close tender submission periods.",
    module: "Tenders",
  },

  /* =========================
     Bids
  ========================= */

  {
    id: "bids.view",
    name: "View Bids",
    description: "View submitted bids.",
    module: "Bids",
  },
  {
    id: "bids.submit",
    name: "Submit Bids",
    description: "Submit bids to tenders.",
    module: "Bids",
  },
  {
    id: "bids.evaluate",
    name: "Evaluate Bids",
    description: "Evaluate submitted bids.",
    module: "Bids",
  },
  {
    id: "bids.manage",
    name: "Manage Bids",
    description: "Manage bid information and status.",
    module: "Bids",
  },

  /* =========================
     Evaluations
  ========================= */

  {
    id: "evaluations.view",
    name: "View Evaluations",
    description: "View evaluation results.",
    module: "Evaluations",
  },
  {
    id: "evaluations.create",
    name: "Create Evaluations",
    description: "Create evaluation records.",
    module: "Evaluations",
  },
  {
    id: "evaluations.edit",
    name: "Edit Evaluations",
    description: "Modify evaluation information.",
    module: "Evaluations",
  },
  {
    id: "evaluations.approve",
    name: "Approve Evaluations",
    description: "Approve completed evaluations.",
    module: "Evaluations",
  },

  /* =========================
     Committees
  ========================= */

  {
    id: "committees.view",
    name: "View Committees",
    description: "View evaluation committees.",
    module: "Committees",
  },
  {
    id: "committees.create",
    name: "Create Committees",
    description: "Create new committees.",
    module: "Committees",
  },
  {
    id: "committees.manage",
    name: "Manage Committees",
    description: "Manage committee members and settings.",
    module: "Committees",
  },

  /* =========================
     Contracts
  ========================= */

  {
    id: "contracts.view",
    name: "View Contracts",
    description: "View contracts.",
    module: "Contracts",
  },
  {
    id: "contracts.create",
    name: "Create Contracts",
    description: "Create new contracts.",
    module: "Contracts",
  },
  {
    id: "contracts.edit",
    name: "Edit Contracts",
    description: "Modify contract information.",
    module: "Contracts",
  },
  {
    id: "contracts.approve",
    name: "Approve Contracts",
    description: "Approve contracts.",
    module: "Contracts",
  },

  /* =========================
     Reports
  ========================= */

  {
    id: "reports.view",
    name: "View Reports",
    description: "View system reports.",
    module: "Reports",
  },
  {
    id: "reports.export",
    name: "Export Reports",
    description: "Export reports and analytics.",
    module: "Reports",
  },

  /* =========================
     System
  ========================= */

  {
    id: "system.settings",
    name: "Manage System Settings",
    description: "Manage system configuration.",
    module: "System",
  },
  {
    id: "system.audit",
    name: "View Audit Logs",
    description: "View system activity and audit logs.",
    module: "System",
  },
  {
    id: "system.permissions",
    name: "Manage Permissions",
    description: "Manage roles and permissions.",
    module: "System",
  },
];

/* =========================================================
   Initial Roles
========================================================= */

const initialRoles = [
  {
    id: "system-admin",
    name: "System Admin",
    description: "Full access to the Tender Flow platform.",
    icon: "shield",
    color: "purple",
    permissions: initialPermissions.map((permission) => permission.id),
  },

  {
    id: "publisher",
    name: "Publisher",
    description: "Manage organization tenders and submissions.",
    icon: "building",
    color: "blue",
    permissions: [
      "organizations.view",
      "organizations.edit",
      "tenders.view",
      "tenders.create",
      "tenders.edit",
      "tenders.publish",
      "tenders.close",
      "bids.view",
      "reports.view",
    ],
  },

  {
    id: "Exectuore",
    name: "Exectuore",
    description: "Participate in tenders and manage submitted bids.",
    icon: "users",
    color: "green",
    permissions: [
      "organizations.view",
      "tenders.view",
      "bids.view",
      "bids.submit",
    ],
  },

];

/* =========================================================
   Component
========================================================= */

export default function RolesPermissions() {
  const [roles, setRoles] = useState(initialRoles);

  const [permissions] = useState(initialPermissions);

  const [selectedRoleId, setSelectedRoleId] = useState(
    initialRoles[0]?.id,
  );

  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const selectedRole = roles.find(
    (role) => role.id === selectedRoleId,
  );



  /* =========================================================
     Filter Roles
  ========================================================= */

  const filteredRoles = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return roles;

    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(value) ||
        role.description.toLowerCase().includes(value),
    );
  }, [roles, search]);

  /* =========================================================
     Toggle Permission
  ========================================================= */

  const handleTogglePermission = (permissionId) => {
    if (!selectedRole) return;

    setRoles((currentRoles) =>
      currentRoles.map((role) => {
        if (role.id !== selectedRole.id) {
          return role;
        }

        const hasPermission =
          role.permissions.includes(permissionId);

        return {
          ...role,
          permissions: hasPermission
            ? role.permissions.filter(
                (id) => id !== permissionId,
              )
            : [...role.permissions, permissionId],
        };
      }),
    );
  };

  /* =========================================================
     Create Role
  ========================================================= */

  const handleCreateRole = (roleData) => {
    const newRole = {
      id: `role-${Date.now()}`,
      name: roleData.name,
      description: roleData.description,
      icon: "shield",
      color: "blue",
      permissions: roleData.permissions || [],
    };

    setRoles((currentRoles) => [
      ...currentRoles,
      newRole,
    ]);

    setSelectedRoleId(newRole.id);

    setShowCreateModal(false);
  };

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
            <ShieldCheck size={25} />
          </div>

          <div>
            <div className="rp-breadcrumb">
              Administration
              <span>/</span>
              Roles & Permissions
            </div>

            <h1>Roles & Permissions</h1>

            <p>
              Manage system roles and control access
              to Tender Flow resources.
            </p>
          </div>

        </div>

        <button
          className="rp-primary-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          Create Role
        </button>

      </div>

     

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
              <span>ACCESS CONTROL</span>
              <h2>Roles</h2>
            </div>

            <span className="rp-count-badge">
              {roles.length}
            </span>

          </div>

          {/* Search */}

          <div className="rp-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

          {/* Role List */}

          <div className="rp-role-list">

            {filteredRoles.length === 0 ? (
              <div className="rp-no-roles">
                <Search size={28} />
                <p>No roles found.</p>
              </div>
            ) : (
              filteredRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  selected={role.id === selectedRoleId}
                  onClick={() =>
                    setSelectedRoleId(role.id)
                  }
                />
              ))
            )}

          </div>

        </aside>

        {/* ===================================================
            Details
        =================================================== */}

        <main className="rp-details-panel">

          {selectedRole ? (
            <RoleDetails
              role={selectedRole}
              permissions={permissions}
              onTogglePermission={
                handleTogglePermission
              }
            />
          ) : (
            <div className="rp-empty-details">

              <div>
                <KeyRound size={35} />
              </div>

              <h3>Select a role</h3>

              <p>
                Select a role from the left to manage
                its permissions.
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
          permissions={permissions}
          onClose={() =>
            setShowCreateModal(false)
          }
          onCreate={handleCreateRole}
        />
      )}

    </div>
  );
}