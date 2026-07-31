import { Search, RotateCcw, Filter } from "lucide-react";
import "./style/tender.css";

export default function TenderFilters({ filters, setFilters }) {
  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      publisher: "",
      date: "",
      minBudget: "",
      maxBudget: "",
    });
  };

  return (
    <div className="tender-filter-container">
      <div className="filter-header">
        <Filter size={16} />
        <h3>Tender Filters</h3>
      </div>

      <div className="filters-grid">
        {/* Search Field */}
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            name="search"
            placeholder="Search tender name or ID..."
            value={filters.search}
            onChange={handleChange}
          />
        </div>

        {/* Status */}
        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Published">Published</option>
          <option value="Open for Bidding">Open for Bidding</option>
          <option value="Under Evaluation">Under Evaluation</option>
          <option value="Awarded">Awarded</option>
          <option value="Closed">Closed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Publisher */}
        <select
          name="publisher"
          value={filters.publisher}
          onChange={handleChange}
        >
          <option value="">All Publishers</option>
          <option value="Ministry">Ministry of Transport</option>
          <option value="Municipality">Municipality</option>
          <option value="Company">Construction Company</option>
        </select>

        {/* Date */}
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleChange}
        />

        {/* 🟢 Budget Range Inputs (Min - Max) */}
        <div className="budget-range-group">
          <input
            type="number"
            name="minBudget"
            placeholder="Min Budget $"
            value={filters.minBudget}
            onChange={handleChange}
          />
          <span className="range-separator">-</span>
          <input
            type="number"
            name="maxBudget"
            placeholder="Max Budget $"
            value={filters.maxBudget}
            onChange={handleChange}
          />
        </div>

        {/* Reset Button */}
        <button className="reset-btn" onClick={resetFilters}>
          <RotateCcw size={15} />
          Reset
        </button>
      </div>
    </div>
  );
}