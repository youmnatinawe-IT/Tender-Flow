import Navbar from "../Navbar";
import { useParams, useNavigate } from "react-router-dom";
import {
  Eye,
  Download,
  FileText,
  AlertCircle,
  Phone,
  Mail,
  FileCheck,
  HelpCircle,
} from "lucide-react";

export default function OrganizationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const organizations = [
    {
      id: 1,
      name: "Modern Technology Company",
      type: "Publisher",
      taxNumber: "123456789",
      email: "info@modern.com",
      phone: "+963 933 111 222",
      status: "Active",
      createdAt: "2026-07-02",
      documents: [
        {
          id: 101,
          type: "Commercial Register",
          name: "commercial_register_modern.pdf",
        },
        {
          id: 102,
          type: "Tax Card",
          name: "tax_card_modern.pdf",
        },
      ],
    },
    {
      id: 2,
      name: "Al-Emar Foundation",
      type: "Bidder",
      taxNumber: "987654321",
      email: "contact@alemar.com",
      phone: "+963 944 555 666",
      status: "Pending",
      createdAt: "2026-07-01",
      documents: [
        {
          id: 201,
          type: "Commercial Register",
          name: "alemar_register.pdf",
        },
      ],
    },
    {
      id: 3,
      name: "Future Systems",
      type: "Publisher",
      taxNumber: "111222333",
      email: "future@test.com",
      phone: "+963 955 777 888",
      status: "Suspended",
      createdAt: "2026-06-20",
      documents: [
        {
          id: 301,
          type: "Commercial Register",
          name: "future_systems_reg.pdf",
        },
        {
          id: 302,
          type: "License",
          name: "future_license.pdf",
        },
      ],
    },
    {
      id: 4,
      name: "Global Security Ltd",
      type: "System",
      taxNumber: "555666777",
      email: "security@global.com",
      phone: "+963 911 222 333",
      status: "Banned",
      createdAt: "2026-05-15",
      documents: [
        {
          id: 401,
          type: "Commercial Register",
          name: "global_security_docs.pdf",
        },
      ],
    },
  ];

  const orgData = organizations.find((org) => org.id === Number(id));

  if (!orgData) {
    return (
      <div
        className="error-box"
        style={{
          padding: "40px",
          textAlign: "center",
          background: "#fef2f2",
          borderRadius: "12px",
          border: "1px solid #fca5a5",
        }}
      >
        <AlertCircle
          size={40}
          color="#dc2626"
          style={{ marginBottom: "12px" }}
        />
        <h3 style={{ color: "#991b1b" }}>Data Fetch Error</h3>
        <p style={{ color: "#7f1d1d" }}>
          No organization found matching the selected identifier.
        </p>
        <button
          className="back-btn-modern"
          onClick={() => navigate("/organizations")}
          style={{
            marginTop: "16px",
            marginInline: "auto",
          }}
        >
          Back to Organizations
        </button>
      </div>
    );
  }

  return (
    <div className="organizations-container" dir="ltr">
      <div className="details-header-nav">
        {/* الناف بار أصبح بسيطاً ونظيفاً بدون الـ Badge العلوي */}
        <Navbar
          title="Organization Details"
          showBackButton={true}
          showSearch={false}
          showProfile={false}
          showNotifications={true}
          showLanguage={false}
          showTheme={false}
        />
      </div>

      <div className="details-dashboard-layout">
        <div className="details-main-section">
          <div className="section-card-title">
            <HelpCircle size={18} className="icon-blue" />
            <h3>General Organization Information</h3>
          </div>

          <div className="org-profile-top">
            <div className="profile-avatar">{orgData.name.charAt(0)}</div>

            <div className="profile-info-wrapper">
              <div className="name-status-container">
                <h2>{orgData.name}</h2>
                <span
                  className={`status-badge-modern ${orgData.status.toLowerCase()}`}
                >
                  {orgData.status}
                </span>
              </div>

              <span className="tax-label">Tax Number: {orgData.taxNumber}</span>
            </div>
          </div>

          <div className="info-cards-grid">
            <div className="mini-info-card">
              <Mail size={16} />
              <div>
                <label>Email Address</label>
                <p>
                  <a href={`mailto:${orgData.email}`} className="email-link">
                    {orgData.email}
                  </a>
                </p>
              </div>
            </div>

            <div className="mini-info-card">
              <Phone size={16} />
              <div>
                <label>Phone Number</label>
                <p>{orgData.phone}</p>
              </div>
            </div>

            <div className="mini-info-card">
              <FileCheck size={16} />
              <div>
                <label>Organization Type</label>
                <p>
                  <span className={`type-tag ${orgData.type.toLowerCase()}`}>
                    {orgData.type}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="documents-card-box">
          <div className="section-card-title">
            <FileText size={18} className="icon-blue" />
            <h3>Uploaded Documents</h3>
          </div>

          <div className="docs-list-wrapper">
            {(orgData.documents || []).map((doc) => (
              <div key={doc.id} className="modern-doc-row">
                <div className="doc-meta-info">
                  <FileText size={20} className="doc-icon-file" />
                  <div>
                    <h4>{doc.type}</h4>
                    <span>{doc.name}</span>
                  </div>
                </div>

                <div className="doc-row-actions">
                  <button className="icon-action-btn" title="Preview">
                    <Eye size={14} />
                  </button>
                  <button className="icon-action-btn" title="Download">
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
