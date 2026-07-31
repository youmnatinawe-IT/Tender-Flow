import {
  Eye,
  Check,
  X,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

export default function OrganizationsTable({
  organizations,
  onUpdateStatus,
  onViewDetails,
}) {
  // دالة لإنشاء الأزرار بشكل ديناميكي تماشياً مع الـ Business Logic الخاص بك
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
              <Check size={14} /> Approve
            </button>
            <button
              className="action-btn reject"
              title="Reject"
              onClick={() => onUpdateStatus(org.id, "Rejected")}
            >
              <X size={14} /> Reject
            </button>
          </>
        );
      case "Active":
        return (
          <>
            <button
              className="action-btn suspend"
              title="Suspend"
              onClick={() => onUpdateStatus(org.id, "Suspended")}
            >
              <AlertTriangle size={14} /> Suspend
            </button>
            <button
              className="action-btn ban"
              title="Ban"
              onClick={() => onUpdateStatus(org.id, "Banned")}
            >
              <ShieldAlert size={14} /> Ban
            </button>
          </>
        );
      case "Suspended":
        return (
          <button
            className="action-btn reactivate"
            title="Reactivate"
            onClick={() => onUpdateStatus(org.id, "Active")}
          >
            <RefreshCw size={14} /> Reactivate
          </button>
        );
      case "Rejected":
      case "Banned":
        return (
          <button
            className="action-btn reactivate text-xs"
            title="Reconsider / Activate"
            onClick={() => onUpdateStatus(org.id, "Active")}
          >
            <RefreshCw size={14} /> Reactivate
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2>Organizations</h2>
        <span>{organizations.length} organizations</span>
      </div>

      <table className="organizations-table">
        <thead>
          <tr>
            <th>Organization</th>
            <th>Type</th>
            <th>Tax Number</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {organizations.map((org) => (
            <tr key={org.id}>
              <td>
                <div className="organization-cell">
                  <div>
                    <h4>{org.name}</h4>
                    <span>{org.email}</span>
                  </div>
                </div>
              </td>

              <td>
                <span className={`type-badge ${org.type.toLowerCase()}`}>
                  {org.type}
                </span>
              </td>

              <td>{org.taxNumber}</td>

              <td>
                <span className={`status-badge ${org.status.toLowerCase()}`}>
                  {org.status}
                </span>
              </td>

              <td>{org.createdAt}</td>

              <td>
                <div className="actions-wrapper">
                  <button
                    className="view-btn"
                    onClick={() => onViewDetails(org.id)}
                  >
                    <Eye size={16} />
                    View
                  </button>
                  {renderActionButtons(org)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
