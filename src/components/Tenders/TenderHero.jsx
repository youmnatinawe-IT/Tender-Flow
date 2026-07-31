import { FileText, BarChart3 } from "lucide-react";

export default function TenderHero() {
  return (
    <div className="Page-hero">
      <div className="hero-content">
        <h1>Tender Operations Center</h1>
        <p>Monitor, manage and analyze all tenders across the platform.</p>
      </div>

      <div className="hero-actions">
        <button className="hero-btn secondary">
          <FileText size={16} />
          <span>Drafts</span>
        </button>

        <button className="hero-btn secondary">
          <BarChart3 size={16} />
          <span>Reports</span>
        </button>

    
      </div>
    </div>
  );
}