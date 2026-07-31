import "./style/vendor.css";

export default function VendorFilter({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) {
  return (
    <div className="filter-container">
      {/* Search Input */}
      <div className="w-full md:w-80">
        <input
          type="text"
          placeholder="Search by company name or CR number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Filter Dropdown */}
      <div className="w-full md:w-auto flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
    </div>
  );
}