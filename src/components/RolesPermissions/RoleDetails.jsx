import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Search,
  Check,
  LockKeyhole,
  Users,
} from "lucide-react";

import PermissionGroup from "./PermissionGroup";

export default function RoleDetails({
  role,
  permissions,
  onTogglePermission,
}) {
  const [search, setSearch] = useState("");

  /* =========================================================
     Filter Permissions
  ========================================================= */

  const filteredPermissions = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return permissions;

    return permissions.filter(
      (permission) =>
        permission.name
          .toLowerCase()
          .includes(value) ||
        permission.description
          .toLowerCase()
          .includes(value) ||
        permission.module
          .toLowerCase()
          .includes(value),
    );
  }, [permissions, search]);

  /* =========================================================
     Group Permissions
  ========================================================= */

  const groupedPermissions = useMemo(() => {
    return filteredPermissions.reduce(
      (groups, permission) => {
        if (!groups[permission.module]) {
          groups[permission.module] = [];
        }

        groups[permission.module].push(permission);

        return groups;
      },
      {},
    );
  }, [filteredPermissions]);

  const enabledCount = role.permissions.length;

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
            className={`rp-large-role-icon ${role.color}`}
          >
            <ShieldCheck size={26} />
          </div>

          <div>

            <div className="rp-details-label">
              ROLE
            </div>

            <h2>{role.name}</h2>

            <p>{role.description}</p>

          </div>

        </div>

        <div className="rp-role-status">
          <span className="rp-active-dot" />
          Active
        </div>

      </div>

      {/* ===================================================
          Role Metrics
      =================================================== */}

      <div className="rp-role-metrics">

        <div>
          <div className="rp-metric-icon">
            <Check size={16} />
          </div>

          <div>
            <strong>{enabledCount}</strong>
            <span>Assigned Permissions</span>
          </div>
        </div>

        <div>
          <div className="rp-metric-icon">
            <LockKeyhole size={16} />
          </div>

          <div>
            <strong>{permissions.length}</strong>
            <span>Available Permissions</span>
          </div>
        </div>

        <div>
          <div className="rp-metric-icon">
            <Users size={16} />
          </div>

          <div>
            <strong>0</strong>
            <span>Assigned Users</span>
          </div>
        </div>

      </div>

      {/* ===================================================
          Permission Header
      =================================================== */}

      <div className="rp-permissions-header">

        <div>

          <span>ACCESS CONTROL</span>

          <h3>Permissions</h3>

          <p>
            Enable or disable permissions assigned
            to this role.
          </p>

        </div>

        <div className="rp-permission-search">

          <Search size={16} />

          <input
            type="text"
            placeholder="Search permissions..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

      </div>

      {/* ===================================================
          Permissions
      =================================================== */}

      <div className="rp-permissions-list">

        {Object.keys(groupedPermissions).length === 0 ? (
          <div className="rp-no-permissions">

            <Search size={30} />

            <h4>No permissions found</h4>

            <p>
              Try changing your search term.
            </p>

          </div>
        ) : (
          Object.entries(groupedPermissions).map(
            ([module, modulePermissions]) => (
              <PermissionGroup
                key={module}
                module={module}
                permissions={modulePermissions}
                assignedPermissions={
                  role.permissions
                }
                onToggle={
                  onTogglePermission
                }
              />
            ),
          )
        )}

      </div>

    </div>
  );
}