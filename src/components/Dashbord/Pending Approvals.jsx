import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, FileText, ArrowRight, Eye } from "lucide-react";
import { getPublisherOrgs, getExecutorOrgs } from "../../services/organizationService";
import "./Pending Approvals.css";

export default function PendingApprovalsTable({ initialTenders = [] }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tenders");

  const [tenders] = useState(initialTenders);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true);
      try {
        const [publishersRes, executorsRes] = await Promise.all([
          getPublisherOrgs(),
          getExecutorOrgs(),
        ]);

        let combinedOrgs = [];

        if (publishersRes.success && publishersRes.data) {
          const pubList = Array.isArray(publishersRes.data)
            ? publishersRes.data
            : publishersRes.data.publishers || publishersRes.data.data || [];

          const publishers = pubList.map((org) => ({
            ...org,
            type: "Publisher",
          }));
          combinedOrgs = [...combinedOrgs, ...publishers];
        }

        if (executorsRes.success && executorsRes.data) {
          const execList = Array.isArray(executorsRes.data)
            ? executorsRes.data
            : executorsRes.data.executors || executorsRes.data.data || [];

          const executors = execList.map((org) => ({
            ...org,
            type: org.type || "Bidder",
          }));
          combinedOrgs = [...combinedOrgs, ...executors];
        }

        setOrganizations(combinedOrgs);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleNavigateToReview = (id) => {
    if (activeTab === "tenders") {
      navigate(id ? `/tenders/${id}` : "/tenders?status=Pending");
    } else {
      navigate(id ? `/organizations/${id}` : "/organizations");
    }
  };

  // أخذ آخر/أول مناقصتين فقط للعرض السريع بالداشبورد
  const pendingTenders = tenders.filter((t) => t.status === "Pending").slice(0, 2);

  // أخذ أول منظمتين فقط للداشبورد
  const displayOrgs = organizations.slice(0, 2);

  return (
    <div className="table-container">
      {/* Header */}
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
            Organizations ({organizations.length})
          </button>
        </div>
      </div>

      {/* Table */}
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
          {activeTab === "tenders" ? (
            pendingTenders.map((item) => (
              <tr key={item.id}>
                <td className="bold-text">{item.title}</td>
                <td>{item.publisher}</td>
                <td className="bold-text">{item.budget}</td>
                <td>{item.submissionDate}</td>
                <td>
                  <span className={`status-badge ${item.status?.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>
                  <button
                    className="review-btn"
                    onClick={() => handleNavigateToReview(item.id)}
                    title="Review Tender"
                  >
                    <Eye size={14} /> Review
                  </button>
                </td>
              </tr>
            ))
          ) : loading ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                Loading organizations...
              </td>
            </tr>
          ) : displayOrgs.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No pending organizations found.
              </td>
            </tr>
          ) : (
            displayOrgs.map((item) => (
              <tr key={item._id || item.id}>
                {/* اسم المنظمة */}
                <td className="bold-text">
                  {item.org_name || item.name || "N/A"}
                </td>

                {/* نوع المنظمة */}
                <td>
                  <span className="type-badge">
                    {item._type || item.type || "Bidder"}
                  </span>
                </td>

                {/* الرقم الضريبي أو رقم الهاتف المتاح */}
                <td>
                  {item.taxNumber || item.tax_number || item.phone_number || "N/A"}
                </td>

                {/* تاريخ الإنشاء أو التقديم */}
                <td>
                  {item.createdAt
                    ? item.createdAt.split("T")[0]
                    : item.submissionDate || "N/A"}
                </td>

                {/* الحالة */}
                <td>
                  <span
                    className={`status-badge ${
                      item.status ? item.status.toLowerCase() : "pending"
                    }`}
                  >
                    {item.status || "Pending"}
                  </span>
                </td>

                {/* زر التفاصيل/المراجعة */}
                <td style={{ textAlign: "center" }}>
                  <button
                    className="review-btn"
                    onClick={() => handleNavigateToReview(item._id || item.id)}
                    title="Review Organization"
                  >
                    <Eye size={14} /> Review
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Footer */}
      <div className="table-footer">
        <button className="view-all-btn" onClick={() => handleNavigateToReview()}>
          {activeTab === "tenders"
            ? "View All Tenders"
            : "View All Organizations"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}