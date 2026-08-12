import { Search, RotateCcw } from "lucide-react";

export default function UserFilters({ filters, setFilters }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      role: "All",
      organization: "All",
      status: "All",
    });
  };

  return (
    <div className="user-filters">
      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          name="search"
          placeholder="Search user by name or email..."
          value={filters.search}
          onChange={handleChange}
        />
      </div>

      <div className="filter-selects">
        <select name="role" value={filters.role} onChange={handleChange}>
          <option value="All">All Roles</option>
          <option value="Super Admin">Super Admin</option>
          <option value="Publisher Admin">Publisher Admin</option>
          <option value="Publisher Manager">Publisher Manager</option>
          <option value="Bidder Admin">Bidder Admin</option>
          <option value="Bidder Manager">Bidder Manager</option>
          <option value="Support">Support</option>
          <option value="Auditor">Auditor</option>
        </select>

        <select
          name="organization"
          value={filters.organization}
          onChange={handleChange}
        >
          <option value="All">All Organizations</option>
          <option value="Ministry of ICT">Ministry of ICT</option>
          <option value="ABC Company">ABC Company</option>
          <option value="XYZ Ltd">XYZ Ltd</option>
        </select>

        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      <div className="filter-actions">
        <button
          className="reset-btn"
          onClick={resetFilters}
          title="Reset Filters"
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
