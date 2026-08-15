import {
  Eye,
  Check,
  X,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  ChevronDown,
  CheckCircle,
  UserPlus,
} from "lucide-react";

import { useState } from "react";

export default function OrganizationsTable({
  
  organizations,
  onUpdateStatus,
  onViewDetails,
  onCreateAdmin,
  activeTab,
}) {
  console.log("Data received by table:", organizations);
  const [openStatusMenu, setOpenStatusMenu] = useState(null);

  // دالة مساعدة لفحص هل تملك المنظمة حساباً أم لا بأي شكل من أشكال الـ API
  const hasAccountCreated = (org) => {
    return Boolean(
      org.hasAdmin ||
      org.has_admin ||
      org.hasAccounts ||
      (org.accounts && org.accounts.length > 0) ||
      org.adminUser
    );
  };

  const renderActionButtons = (org) => {
    switch (org.status) {
      case "Pending":
        return (
          <>
            <button
              className="action-btn approve"
              title="Approve"
              onClick={() => onUpdateStatus(org.id, "Active")}
            >
              <Check size={14} />
              <span>Approve</span>
            </button>

            <button
              className="action-btn reject"
              title="Reject"
              onClick={() => onUpdateStatus(org.id, "Rejected")}
            >
              <X size={14} />
              <span>Reject</span>
            </button>
          </>
        );

      case "Active":
        return (
          <div className="status-action-dropdown">
            <button
              className="action-btn manage-status"
              title="Manage organization status"
              onClick={() =>
                setOpenStatusMenu(openStatusMenu === org.id ? null : org.id)
              }
            >
              <ShieldAlert size={14} />
              <span>Manage Status</span>
              <ChevronDown
                size={14}
                className={
                  openStatusMenu === org.id ? "status-chevron-open" : ""
                }
              />
            </button>

            {openStatusMenu === org.id && (
              <div className="status-action-menu">
                <button
                  className="status-action-item suspend"
                  onClick={() => {
                    onUpdateStatus(org.id, "Suspended");
                    setOpenStatusMenu(null);
                  }}
                >
                  <AlertTriangle size={15} />
                  <span>Suspend</span>
                </button>

                <div className="status-action-divider" />

                <button
                  className="status-action-item ban"
                  onClick={() => {
                    onUpdateStatus(org.id, "Banned");
                    setOpenStatusMenu(null);
                  }}
                >
                  <ShieldAlert size={15} />
                  <span>Ban</span>
                </button>
              </div>
            )}
          </div>
        );

      case "Suspended":
      case "Rejected":
      case "Banned":
        return (
          <button
            className="action-btn reactivate"
            title="Reactivate"
            onClick={() => onUpdateStatus(org.id, "Active")}
          >
            <RefreshCw size={14} />
            <span>Reactivate</span>
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2>
          {activeTab === "PUBLISHER"
            ? "Publisher Organizations"
            : "Executor Organizations"}
        </h2>

        <span>{organizations.length} organizations</span>
      </div>

      <div className="organizations-table-wrapper">
        <table className="organizations-table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Type</th>
              <th>Tax / Reg Number</th>

              {activeTab === "PUBLISHER" && <th>Admin Account</th>}

              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {organizations.map((org) => {
              const isAccountExist = hasAccountCreated(org);

              return (
                <tr key={org.id}>
                  {/* Organization */}
                  <td>
                    <div className="organization-cell">
                      <div>
                        <h4>{org.name}</h4>
                        <span>{org.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td>
                    <span className={`type-badge ${org.type.toLowerCase()}`}>
                      {org.type}
                    </span>
                  </td>

                  {/* Tax / Registration Number */}
                  <td>{org.taxNumber}</td>

                  {/* Admin Account - Publishers only */}
                  {activeTab === "PUBLISHER" && (
                    <td>
                      {isAccountExist ? (
                        <span className="admin-status-badge created">
                          <CheckCircle size={14} />
                          Created
                        </span>
                      ) : (
                        <span className="admin-status-badge missing">
                          No Admin Account
                        </span>
                      )}
                    </td>
                  )}

                  {/* Status */}
                  <td>
                    <span
                      className={`status-badge ${org.status.toLowerCase()}`}
                    >
                      {org.status}
                    </span>
                  </td>

                  {/* Created */}
                  <td>{org.createdAt}</td>

                  {/* Actions */}
                  <td className="actions-cell">
                    <div className="actions-wrapper">
                      {/* View */}
                      <button
                        className="action-btn view"
                        title="View organization details"
                        onClick={() => onViewDetails(org.id)}
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>

                      {/* Status actions (Approve, Reject, Manage) */}
                      {renderActionButtons(org)}

                      {/* زر إنشاء حساب أدمن للمنظمات الناقصة فقط */}
                      {activeTab === "PUBLISHER" && !isAccountExist && (
                        <button
                          className="action-btn create-admin"
                          title="Create Admin Account"
                          onClick={() => onCreateAdmin && onCreateAdmin(org)}
                        >
                          <UserPlus size={14} />
                          <span>Admin</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}