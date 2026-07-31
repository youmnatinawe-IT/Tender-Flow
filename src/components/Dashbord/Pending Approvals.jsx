import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, FileText, ArrowRight, Eye } from "lucide-react";
import "./Pending Approvals.css";

export default function PendingApprovalsTable({
  initialTenders = [
    {
      id: "TN-2026-004",
      title: "Smart Traffic Lights Installation",
      publisher: "Ministry of Transport",
      budget: "$1,200,000",
      submissionDate: "2026-07-04",
      status: "Pending",
    },
    {
      id: "TN-2026-005",
      title: "Hospital IT Infrastructure Expansion",
      publisher: "Ministry of Health",
      budget: "$850,000",
      submissionDate: "2026-07-03",
      status: "Pending",
    },
  ],
  initialOrganizations = [
    {
      id: "ORG-101",
      name: "Al-Emar Construction Co.",
      type: "Bidder",
      taxNumber: "987654321",
      submissionDate: "2026-07-01",
      status: "Pending",
    },
  ],
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tenders");

  const [tenders] = useState(initialTenders);
  const [organizations] = useState(initialOrganizations);

  // التوجيه المباشر لصفحة التحكم الرئيسية بوضع الفلتر تلقائياً على Pending
  const handleNavigateToReview = () => {
    if (activeTab === "tenders") {
      navigate("/tenders?status=Pending");
    } else {
      navigate("/organizations?status=Pending");
    }
  };

  const pendingTenders = tenders.filter((t) => t.status === "Pending");
  const pendingOrgs = organizations.filter((o) => o.status === "Pending");

  return (
    <div className="table-container">
      {/* Header مع التبويبات */}
      <div className="table-header-flex">
        <h2 className="table-title">Pending Approvals</h2>

        <div className="approval-tabs">
          <button
            className={`tab-btn ${activeTab === "tenders" ? "active" : ""}`}
            onClick={() => setActiveTab("tenders")}
          >
            <FileText size={15} />
            Tenders ({pendingTenders.length})
          </button>

          <button
            className={`tab-btn ${activeTab === "orgs" ? "active" : ""}`}
            onClick={() => setActiveTab("orgs")}
          >
            <Building2 size={15} />
            Organizations ({pendingOrgs.length})
          </button>
        </div>
      </div>

      {/* الجدول المشترك بدون أزرار اتخاذ القرار المباشرة */}
      <table className="approval-table">
        <thead>
          {activeTab === "tenders" ? (
            <tr>
              <th>Tender Title</th>
              <th>Publisher</th>
              <th>Budget</th>
              <th>Date</th>
              <th>Status</th>
              <th style={{ textAlign: "center" }}>Review</th>
            </tr>
          ) : (
            <tr>
              <th>Organization</th>
              <th>Type</th>
              <th>Tax Number</th>
              <th>Submission Date</th>
              <th>Status</th>
              <th style={{ textAlign: "center" }}>Review</th>
            </tr>
          )}
        </thead>
        <tbody>
          {activeTab === "tenders"
            ? pendingTenders.map((item) => (
                <tr key={item.id}>
                  <td className="bold-text">{item.title}</td>
                  <td>{item.publisher}</td>
                  <td className="bold-text">{item.budget}</td>
                  <td>{item.submissionDate}</td>
                  <td>
                    <span className={`status-badge ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="review-btn"
                      onClick={handleNavigateToReview}
                      title="Review Tender"
                    >
                      <Eye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))
            : pendingOrgs.map((item) => (
                <tr key={item.id}>
                  <td className="bold-text">{item.name}</td>
                  <td>
                    <span className="type-badge">{item.type}</span>
                  </td>
                  <td>{item.taxNumber}</td>
                  <td>{item.submissionDate}</td>
                  <td>
                    <span className={`status-badge ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="review-btn"
                      onClick={handleNavigateToReview}
                      title="Review Organization"
                    >
                      <Eye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>

      {/* زر التوجيه الديناميكي */}
      <div className="table-footer">
        <button className="view-all-btn" onClick={handleNavigateToReview}>
          {activeTab === "tenders"
            ? "View All Tenders"
            : "View All Organizations"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}