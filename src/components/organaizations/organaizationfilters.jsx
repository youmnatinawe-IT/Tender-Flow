export default function OrganizationFilters({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="filters-card">

      <input
        className="search-input"
        type="text"
        placeholder="Search organization..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
      >
        <option value="All">All Types</option>
        <option value="Publisher">Publisher</option>
        <option value="Bidder">Bidder</option>
        <option value="System">System</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="All">All Status</option>
        <option value="Pending">Pending</option>
        <option value="Active">Active</option>
        <option value="Rejected">Rejected</option>
        <option value="Suspended">Suspended</option>
        <option value="Banned">Banned</option>
      </select>

      <button
        className="reset-btn"
        onClick={() => {
          setSearch("");
          setTypeFilter("All");
          setStatusFilter("All");
        }}
      >
        Reset Filters
      </button>

    </div>
  );
}