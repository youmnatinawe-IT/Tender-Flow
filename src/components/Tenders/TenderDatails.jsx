import { useState } from "react";
import {
  X,
  FileText,
  Download,
  Eye,
  Calendar,
  Users,
  Building2,
} from "lucide-react";

export default function TenderDetailsDrawer({ tender, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!tender) return null;

  const documents = [
    "Terms & Conditions.pdf",
    "Technical Specifications.pdf",
    "BOQ.xlsx",
    "Project Drawings.pdf",
  ];

  return (
    <>
      {/* Overlay */}
      <div className="modal-overlay" onClick={onClose} />

      {/* Drawer */}
      <div className="modal-container">
        {/* Header */}
        <div className="drawer-header">
          <button className="close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Hero Section */}
        <div className="drawer-hero">
          <div>
            <h2>{tender.title}</h2>
            <p>{tender.id}</p>
          </div>

          <div className="drawer-status">
            <span className="hero-status">{tender.status}</span>

            <span className="hero-days">{tender.daysLeft} Days</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="drawer-tabs">
          <button
            className={activeTab === "overview" ? "active-tab" : ""}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>

          <button
            className={activeTab === "documents" ? "active-tab" : ""}
            onClick={() => setActiveTab("documents")}
          >
            Documents
          </button>

          <button
            className={activeTab === "timeline" ? "active-tab" : ""}
            onClick={() => setActiveTab("timeline")}
          >
            Timeline
          </button>
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="drawer-section">
            <h3>Overview</h3>

            <div className="overview-grid">
              <div>
                <Building2 size={16} />
                <span>{tender.publisher}</span>
              </div>

              <div>
                <Users size={16} />
                <span>{tender.bids} Bids</span>
              </div>

              <div>
                <Calendar size={16} />
                <span>{tender.daysLeft} Days Left</span>
              </div>
            </div>
          </div>
        )}

        {/* Documents */}
        {activeTab === "documents" && (
          <div className="drawer-section">
            <h3>Documents</h3>

            <div className="documents-grid">
              {documents.map((doc, index) => (
                <div className="drawer-document" key={index}>
                  <div className="doc-info">
                    <FileText size={22} className="file-icon" />
                    <span className="doc-name">{doc}</span>
                  </div>

                  <div className="doc-actions">
                    <button>
                      <Eye size={16} />
                    </button>
                    <button>
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {activeTab === "timeline" && tender && (
          <div className="drawer-section">
            <h3>Tender Timeline</h3>

            <div className="timeline">
              {(() => {
                const steps = [
                  "Draft",
                  "Published",
                  "Closed",
                  "Evaluating",
                  "Awarded",
                ];

                const currentStepIndex = steps.findIndex(
                  (step) => step.toLowerCase() === tender.status?.toLowerCase(),
                );

                return steps.map((step, index) => {
                  const isActive = index <= currentStepIndex;

                  return (
                    <div
                      key={step}
                      className={`timeline-item ${isActive ? "active" : ""}`}
                    >
                      {step}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
