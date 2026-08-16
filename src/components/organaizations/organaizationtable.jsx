import { Eye, CheckCircle } from "lucide-react";

export default function OrganizationsTable({
  organizations,
  onViewDetails,
  activeTab,
}) {
  const hasAccountCreated = (org) => {
    return Boolean(
      org.hasAdmin ||
      org.has_admin ||
      org.hasAccounts ||
      (org.accounts && org.accounts.length > 0) ||
      org.adminUser
    );
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
              <th>Tax Number</th>
              {activeTab === "PUBLISHER" && <th>Admin Account</th>}
             
              <th>Created</th>
              <th className="actions-cell">Actions</th>
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

                  {/* Tax Number */}
                  <td>{org.taxNumber}</td>

                  {/* Admin Account Status */}
                  {activeTab === "PUBLISHER" && (
                    <td>
                      {isAccountExist ? (
                        <span className="admin-status-badge created">
                          <CheckCircle size={14} /> Created
                        </span>
                      ) : (
                        <span className="admin-status-badge missing">
                          No Admin Account
                        </span>
                      )}
                    </td>
                  )}

                 

                  {/* Created */}
                  <td>{org.createdAt}</td>

                  {/* Action - Single Button */}
                  <td className="actions-cell">
                    <button
                      className="org-action-btn"
                      title="View full details"
                      onClick={() => onViewDetails(org.id)}
                    >
                      <Eye size={15} />
                      <span>View Details</span>
                    </button>
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
