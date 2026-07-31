import { useState } from "react";
import "../Tenders/style/tender.css";
import TenderDetailsDrawer from "./TenderDatails";
import { Users, Eye, ChevronDown, ChevronUp } from "lucide-react";

export default function TenderTable({ filters }) {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedTender, setSelectedTender] = useState(null);

  const tenders = [
    {
      id: "TN-2026-001",
      title: "National Fiber Network Project",
      publisher: "Ministry of ICT",
      budget: "$15,000ٍ",
      bids: 54,
      progress: 80,
      status: "Evaluating",
      daysLeft: 12,
      description:
        "Implementing high-speed fiber-optic connectivity across 15 national districts to enhance municipal public services.",
      createdDate: "2026-05-10",
      time: "15-11-2026",
    },
    {
      id: "TN-2026-002",
      title: "Power Transformers Supply",
      publisher: "Ministry of Energy",
      budget: "$2,500",
      bids: 37,
      progress: 65,
      status: "Published",
      daysLeft: 1,
      description:
        "Procurement and quality testing of heavy-duty power transformers for Eastern Grid expansion project.",
      createdDate: "2026-06-01",
      time: "15-11-2026",
    },
    {
      id: "TN-2026-004",
      title: "Smart Traffic Lights Installation",
      publisher: "Ministry of Transport",
      budget: "$1,200",
      bids: 37,
      progress: 10,
      status: "Published",
      daysLeft: 50,
      description:
        "Procurement and quality testing of heavy-duty power transformers for Eastern Grid expansion project.",
      createdDate: "2026-07-04",
      time: "15-11-2026",
    },
    {
      id: "TN-2026-003",
      title: "Hospital Equipment Procurement",
      publisher: "Ministry of Health",
      budget: "$8,400",
      bids: 22,
      progress: 100,
      status: "Awarded",
      daysLeft: 0,
      description:
        "Equipping three regional intensive care units with modern ventilators and monitoring systems.",
      createdDate: "2026-04-15",
      time: "15-11-2026",
    },
  ];
  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch =
      tender.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      tender.id.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus =
      filters.status === "" || tender.status === filters.status;

    const matchesPublisher =
      filters.publisher === "" || tender.publisher.includes(filters.publisher);
    const matchesDate =
      filters.date === "" || tender.createdDate === filters.date;

    const numericBudget = Number(tender.budget.replace(/[^0-9.-]+/g, ""));

    const matchesMinBudget =
      !filters.minBudget || numericBudget >= Number(filters.minBudget);

    const matchesMaxBudget =
      !filters.maxBudget || numericBudget <= Number(filters.maxBudget);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPublisher &&
      matchesDate &&
      matchesMinBudget &&
      matchesMaxBudget
    );
  });
  const toggleRow = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusClass = (status) => {
    return `status-badge ${status.toLowerCase()}`;
  };

  const getProgressColor = (progress, daysLeft) => {
    if (progress === 100 || daysLeft === 0) return "progress-fill-success";
    if (daysLeft === 1) return "progress-fill-danger";
    return "progress-fill-primary";
  };

  return (
    <div className="tender-table-container">
      <table className="tender-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tender Title</th>
            <th>Publisher</th>
            <th>Budget</th>
            <th>Bids</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Days Left</th>
            <th style={{ textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTenders.map((tender) => {
            const isExpanded = expandedId === tender.id;
            return (
              <>
                {/* الصف الأساسي */}
                <tr
                  key={tender.id}
                  className={`table-row-main ${isExpanded ? "active-row" : ""}`}
                  onClick={() => toggleRow(tender.id)}
                >
                  <td className="bold-text">{tender.id}</td>
                  <td className="tender-title-cell">{tender.title}</td>
                  <td>{tender.publisher}</td>
                  <td className="bold-text">{tender.budget}</td>
                  <td>
                    <span className="bids-badge">
                      <Users size={12} style={{ marginRight: "4px" }} />
                      {tender.bids}
                    </span>
                  </td>
                  <td>
                    <div className="table-progress-container">
                      <span className="progress-text">{tender.progress}%</span>
                      <div className="table-progress-bar">
                        <div
                          className={`table-progress-fill ${getProgressColor(tender.progress, tender.daysLeft)}`}
                          style={{ width: `${tender.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={getStatusClass(tender.status)}>
                      {tender.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`days-badge ${tender.daysLeft === 1 ? "danger" : tender.daysLeft === 0 ? "success" : ""}`}
                    >
                      {tender.daysLeft > 0
                        ? `${tender.daysLeft} Days`
                        : "Completed"}
                    </span>
                  </td>
                  <td
                    style={{ textAlign: "center" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="table-row-actions">
                      <button
                        className="icon-btn"
                        onClick={() => toggleRow(tender.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* صف التفاصيل المتمدد */}
                {isExpanded && (
                  <tr className="details-expanded-row">
                    <td colSpan="9">
                      <div className="details-content-box">
                        <div className="details-grid">
                          <div className="details-text-section">
                            <h4>Tender Full Description</h4>
                            <p>{tender.description}</p>
                            <div className="details-meta">
                              <span>
                                <strong>Published Date:</strong>{" "}
                                {tender.createdDate}
                              </span>
                              <span>
                                <strong> Impliminted period:</strong>{" "}
                                {tender.time}
                              </span>
                              <span>
                                <strong>Authority:</strong> {tender.publisher}
                              </span>
                            </div>
                          </div>

                          <div className="details-controls-section">
                            <div className="admin-actions-grid">
                              <button
                                className="admin-action-btn view-btn"
                                onClick={() => setSelectedTender(tender)}
                              >
                                <Eye size={16} />
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
      <TenderDetailsDrawer
        tender={selectedTender}
        onClose={() => setSelectedTender(null)}
      />
    </div>
  );
}
