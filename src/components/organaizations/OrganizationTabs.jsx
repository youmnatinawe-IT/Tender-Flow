import { Building, ShieldCheck } from "lucide-react";

export default function OrganizationTabs({ activeTab, setActiveTab }) {
  return (
    <div className="org-tabs-container">
      <button
        className={`org-tab-btn ${activeTab === "PUBLISHER" ? "active" : ""}`}
        onClick={() => setActiveTab("PUBLISHER")}
      >
        <Building size={18} />
        Publishers
      </button>

      <button
        className={`org-tab-btn ${activeTab === "EXECUTOR" ? "active" : ""}`}
        onClick={() => setActiveTab("EXECUTOR")}
      >
        <ShieldCheck size={18} />
        Executors
      </button>
    </div>
  );
}
