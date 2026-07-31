import './style/vendor.css';

export default function VendorDetails({ vendor, onClose, onUpdateStatus }) {
  if (!vendor) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2>Vendor Details: {vendor.companyName}</h2>
            <p className="sub-title">Vendor ID: {vendor.id} | IP: {vendor.ipAddress}</p>
          </div>
          <button onClick={onClose} className="btn-close">&times;</button>
        </div>

        <div className="modal-body">
          {/* Trust Alert & Risk Assessment Section */}
          {vendor.riskScore === 'High' && (
            <div className="alert-box-warning">
              ⚠️ <strong>Trust Alert:</strong> This vendor has been flagged with a high risk score (similar IP address or expired documents). Please verify thoroughly before approval.
            </div>
          )}

          {/* Company Information */}
          <div className="details-section">
            <h3>Basic Details</h3>
            <div className="details-grid">
              <div><span>Email:</span> {vendor.email}</div>
              <div><span>Phone:</span> {vendor.phone}</div>
              <div><span>CR Number:</span> {vendor.crNumber}</div>
              <div><span>Tax Number:</span> {vendor.taxNumber}</div>
            </div>
          </div>

          {/* Verification Documents */}
          <div className="details-section">
            <h3>Official Documents (KYB)</h3>
            <ul className="docs-list">
              {vendor.documents.map((doc) => (
                <li key={doc.id} className="doc-item">
                  <div>
                    <strong>{doc.name}</strong> ({doc.type})
                  </div>
                  <span className={`doc-status ${doc.status === 'valid' ? 'valid' : 'expired'}`}>
                    {doc.status === 'valid' ? 'Valid' : 'Expired / Incomplete'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Activity Logs / Audit Log */}
          <div className="details-section">
            <h3>Vendor Activity Log (Audit Trail)</h3>
            <div className="logs-container">
              {vendor.activityLogs.map((log) => (
                <div key={log.id} className="log-item">
                  <span className="log-action">{log.action}</span>
                  <span className="log-meta">{log.timestamp} | IP: {log.ip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Decision Actions */}
        <div className="modal-footer">
          <div className="action-buttons">
            <button
              onClick={() => onUpdateStatus(vendor.id, 'approved')}
              className="btn-approve"
            >
              Approve Vendor
            </button>
            <button
              onClick={() => onUpdateStatus(vendor.id, 'rejected')}
              className="btn-reject"
            >
              Reject Request
            </button>
            <button
              onClick={() => onUpdateStatus(vendor.id, 'suspended')}
              className="btn-suspend"
            >
              Suspend Vendor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}