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
  Loader2,
} from "lucide-react";

/* =========================================================
   Module Icons
========================================================= */

const moduleIcons = {
  Tenders: FileText,
  Bids: Gavel,
  Users: Users,
  Organizations: Building2,
  Committees: UserRoundCog,
  Contracts: FileSignature,
  Reports: BarChart3,
  System: Settings,

  TENDER: FileText,
  BID: Gavel,
  USER: Users,
  ORG: Building2,
  COMMITTEE: UserRoundCog,
  CONTRACT: FileSignature,
  REPORT: BarChart3,
  SYSTEM: Settings,
};

/* =========================================================
   Component
========================================================= */

export default function PermissionGroup({
  module,
  permissions,
  assignedPermissions,
  onToggle,
  updatingPermissionId = null,
}) {
  const Icon =
    moduleIcons[module] || Settings;

  /* =======================================================
     Count Enabled
  ======================================================= */

  const enabledCount =
    permissions.filter((permission) =>
      assignedPermissions.includes(
        permission.code
      )
    ).length;

  /* =======================================================
     Progress
  ======================================================= */

  const progress = permissions.length
    ? (enabledCount /
        permissions.length) *
      100
    : 0;

  return (
    <section className="rp-permission-group">
      {/* ===================================================
          Header
      =================================================== */}

      <div className="rp-permission-group-header">
        <div className="rp-module-title">
          <div className="rp-module-icon">
            <Icon size={17} />
          </div>

          <div>
            <h4>{module}</h4>

            <span>
              {enabledCount} of{" "}
              {permissions.length} enabled
            </span>
          </div>
        </div>

        {/* Progress */}

        <div className="rp-module-progress">
          <div>
            <span
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ===================================================
          Permissions
      =================================================== */}

      <div className="rp-permission-items">
        {permissions.map(
          (permission) => {
            /* =================================================
               Get Real Permission ID

               Backend permission may return:

               {
                 "_id": "...",
                 "code": "TENDER_CREATE"
               }

               or:

               {
                 "id": "...",
                 "code": "TENDER_CREATE"
               }
            ================================================= */

            const permissionId =
              permission?.id ||
              permission?._id ||
              permission?.permission_id;

            /* =================================================
               Is Permission Assigned?
            ================================================= */

            const enabled =
              assignedPermissions.includes(
                permission.code
              );

            /* =================================================
               Is This Permission Currently Loading?
            ================================================= */

            const isUpdating =
              updatingPermissionId &&
              String(
                updatingPermissionId
              ) ===
                String(permissionId);

            return (
              <div
                className={`rp-permission-item ${
                  enabled
                    ? "enabled"
                    : ""
                }`}
                key={
                  permissionId ||
                  permission.code
                }
              >
                {/* =================================================
                    Permission Info
                ================================================= */}

                <div className="rp-permission-info">
                  <div
                    className={`rp-permission-check ${
                      enabled
                        ? "checked"
                        : ""
                    }`}
                  >
                    {enabled && (
                      <Check size={14} />
                    )}
                  </div>

                  <div>
                    <strong>
                      {permission.name}
                    </strong>

                    <span>
                      {
                        permission.description
                      }
                    </span>

                    {/* Permission Code */}

                    <small
                      style={{
                        display:
                          "block",
                        marginTop:
                          "3px",
                        opacity:
                          0.55,
                        fontSize:
                          "11px",
                      }}
                    >
                      {
                        permission.code
                      }
                    </small>
                  </div>
                </div>

                {/* =================================================
                    Toggle
                ================================================= */}

                <button
                  type="button"
                  className={`rp-toggle ${
                    enabled
                      ? "on"
                      : ""
                  }`}
                  onClick={() => {
                    if (
                      isUpdating
                    ) {
                      return;
                    }

                    if (
                      !permissionId
                    ) {
                      console.error(
                        "Permission ID is missing:",
                        permission
                      );

                      return;
                    }

                    /*
                      Send the COMPLETE permission object.

                      Parent decides:

                      enabled === false
                      -> POST

                      enabled === true
                      -> DELETE
                    */

                    onToggle(
                      permission
                    );
                  }}
                  disabled={
                    isUpdating ||
                    !permissionId
                  }
                  aria-label={`Toggle ${permission.name}`}
                  title={
                    !permissionId
                      ? "Permission ID is missing"
                      : enabled
                      ? "Remove permission"
                      : "Assign permission"
                  }
                >
                  {isUpdating ? (
                    <Loader2
                      size={13}
                      className="rp-spin"
                    />
                  ) : (
                    <span />
                  )}
                </button>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}