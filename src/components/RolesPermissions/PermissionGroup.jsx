import {
  Building2,
  Users,
  FileText,
  Gavel,
  UserRoundCog,
  FileSignature,
  BarChart3,
  Settings,
  Check,
} from "lucide-react";

const moduleIcons = {
  Organizations: Building2,
  Users: Users,
  Tenders: FileText,
  Bids: Gavel,
  Committees: UserRoundCog,
  Contracts: FileSignature,
  Reports: BarChart3,
  System: Settings,
};

export default function PermissionGroup({
  module,
  permissions,
  assignedPermissions,
  onToggle,
}) {
  const Icon =
    moduleIcons[module] || Settings;

  const enabledCount = permissions.filter(
    (permission) =>
      assignedPermissions.includes(permission.id),
  ).length;

  return (
    <section className="rp-permission-group">

      {/* Header */}

      <div className="rp-permission-group-header">

        <div className="rp-module-title">

          <div className="rp-module-icon">
            <Icon size={17} />
          </div>

          <div>
            <h4>{module}</h4>

            <span>
              {enabledCount} of {permissions.length}{" "}
              enabled
            </span>
          </div>

        </div>

        <div className="rp-module-progress">

          <div>
            <span
              style={{
                width: `${
                  permissions.length
                    ? (enabledCount /
                        permissions.length) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>

        </div>

      </div>

      {/* Permissions */}

      <div className="rp-permission-items">

        {permissions.map((permission) => {
          const enabled =
            assignedPermissions.includes(
              permission.id,
            );

          return (
            <div
              className={`rp-permission-item ${
                enabled ? "enabled" : ""
              }`}
              key={permission.id}
            >

              <div className="rp-permission-info">

                <div
                  className={`rp-permission-check ${
                    enabled ? "checked" : ""
                  }`}
                >
                  {enabled && <Check size={14} />}
                </div>

                <div>

                  <strong>
                    {permission.name}
                  </strong>

                  <span>
                    {permission.description}
                  </span>

                </div>

              </div>

              <button
                type="button"
                className={`rp-toggle ${
                  enabled ? "on" : ""
                }`}
                onClick={() =>
                  onToggle(permission.id)
                }
                aria-label={`Toggle ${permission.name}`}
              >
                <span />
              </button>

            </div>
          );
        })}

      </div>

    </section>
  );
}