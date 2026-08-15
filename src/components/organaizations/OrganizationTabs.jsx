
import { Building, ShieldCheck } from "lucide-react";

export default function OrganizationTabs({ activeTab, setActiveTab }) {
  return (
    <div className="org-tabs-container">
      <button
        className={`tab-btn ${activeTab === "PUBLISHER" ? "active" : ""}`}
        onClick={() => setActiveTab("PUBLISHER")}
      >
        <Building size={18} />
        Publishers 
      </button>

      <button
        className={`tab-btn ${activeTab === "BIDDER" ? "active" : ""}`}
        onClick={() => setActiveTab("BIDDER")}
      >
        <ShieldCheck size={18} />
        Executors / Bidders
      </button>
    </div>
  );
}