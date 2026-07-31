import './style/vendor.css'; // Import stylesheet

export default function VendorTable({ vendors, onSelectVendor }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="vendor-badge badge-approved">Approved</span>;
      case 'pending':
        return <span className="vendor-badge badge-pending">Under Review</span>;
      case 'rejected':
        return <span className="vendor-badge badge-rejected">Rejected</span>;
      case 'suspended':
        return <span className="vendor-badge badge-suspended">Suspended</span>;
      default:
        return null;
    }
  };

  return (
    <div className="vendor-table-container">
      <table className="vendor-table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>CR Number</th>
            <th>Tax Number</th>
            <th>Account Status</th>
            <th>Risk Score</th>
            <th>Registration Date</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.length > 0 ? (
            vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td className="font-bold">{vendor.companyName}</td>
                <td className="font-mono">{vendor.crNumber}</td>
                <td className="font-mono">{vendor.taxNumber}</td>
                <td>{getStatusBadge(vendor.status)}</td>
                <td>
                  <span className={`risk-tag ${vendor.riskScore === 'High' ? 'risk-high' : 'risk-low'}`}>
                    {vendor.riskScore === 'High' ? '⚠️ Security Alert' : 'Normal'}
                  </span>
                </td>
                <td>{vendor.registrationDate}</td>
                <td className="text-center">
                  <button
                    onClick={() => onSelectVendor(vendor)}
                    className="btn-inspect"
                  >
                    Inspect & Verify
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-data">No vendors match these criteria.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}