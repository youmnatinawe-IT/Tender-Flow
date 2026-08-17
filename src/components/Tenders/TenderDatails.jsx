import { useState } from "react";

import {
  X,
  FileText,
  Download,
  Eye,
  CalendarDays,
  Building2,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Wallet,
  Clock3,
  Hash,
  Globe2,
  CircleCheck,
  Info,
  BadgeCheck,
  Landmark,
  FileCheck2,
} from "lucide-react";

/* =========================================================
   Helpers
========================================================= */

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

const formatDateTime = (date) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

const formatBudget = (value, currency) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "N/A";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "N/A";
  }

  return `${new Intl.NumberFormat("en-US").format(
    number
  )} ${currency || ""}`.trim();
};

const getDaysLeft = (deadline) => {
  if (!deadline) return null;

  const now = new Date();
  const endDate = new Date(deadline);

  if (Number.isNaN(endDate.getTime())) {
    return null;
  }

  const diff =
    endDate.getTime() - now.getTime();

  if (diff <= 0) return 0;

  return Math.ceil(
    diff / (1000 * 60 * 60 * 24)
  );
};

const getTenderId = (id) => {
  if (!id) return "N/A";

  return `#${id.slice(-6).toUpperCase()}`;
};

const getStatusClass = (status) => {
  const normalized =
    status?.toLowerCase().replace(/\s+/g, "-") ||
    "unknown";

  return `drawer-status-badge drawer-status-${normalized}`;
};

const getTypeClass = (type) => {
  const normalized =
    type?.toLowerCase().replace(/\s+/g, "-") ||
    "unknown";

  return `drawer-type-badge drawer-type-${normalized}`;
};

/* =========================================================
   Component
========================================================= */

export default function TenderDetailsDrawer({
  tender,
  onClose,
}) {
  const [activeTab, setActiveTab] =
    useState("overview");

  if (!tender) return null;

  const publisher =
    tender?.publisher_org_id || {};

  const daysLeft = getDaysLeft(
    tender?.submission_deadline
  );

  /*
    Documents تظهر فقط إذا رجعت فعلياً من الـAPI.
  */

  const documents = Array.isArray(
    tender?.documents
  )
    ? tender.documents
    : [];

  const createdAt =
    tender?.createdAt;

  const updatedAt =
    tender?.updatedAt;

  return (
    <>
      {/* =====================================================
          Overlay
      ===================================================== */}

      <div
        className="modal-overlay"
        onClick={onClose}
      />

      {/* =====================================================
          Drawer
      ===================================================== */}

      <div
        className="modal-container tender-details-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* =================================================
            Header
        ================================================= */}

        <div className="drawer-header">

          <div className="drawer-header-title">
            <span>
              TENDER DETAILS
            </span>

            <strong>
              {getTenderId(tender?._id)}
            </strong>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={19} />
          </button>

        </div>

        {/* =================================================
            Hero
        ================================================= */}

        <div className="drawer-hero">

          <div className="drawer-hero-main">

            <div className="drawer-id">
              <Hash size={14} />

              {getTenderId(tender?._id)}
            </div>

            <h2>
              {tender?.title ||
                "Untitled Tender"}
            </h2>

            <p className="drawer-publisher">
              <Building2 size={15} />

              {publisher?.org_name ||
                "N/A"}
            </p>

          </div>

          <div className="drawer-status-group">

            <span
              className={getStatusClass(
                tender?.status
              )}
            >
              <span className="status-dot" />

              {tender?.status || "N/A"}
            </span>

            <span
              className={getTypeClass(
                tender?.type
              )}
            >
              {tender?.type || "N/A"}
            </span>

            <span
              className={`hero-days ${
                daysLeft === 0
                  ? "expired"
                  : daysLeft <= 7
                  ? "urgent"
                  : ""
              }`}
            >
              <Clock3 size={14} />

              {daysLeft !== null
                ? daysLeft > 0
                  ? `${daysLeft} Days Left`
                  : "Expired"
                : "N/A"}
            </span>

          </div>

        </div>

        {/* =================================================
            Tabs
        ================================================= */}

        <div className="drawer-tabs">

          <button
            className={
              activeTab === "overview"
                ? "active-tab"
                : ""
            }
            onClick={() =>
              setActiveTab("overview")
            }
          >
            <Info size={15} />
            Overview
          </button>

          <button
            className={
              activeTab === "documents"
                ? "active-tab"
                : ""
            }
            onClick={() =>
              setActiveTab("documents")
            }
          >
            <FileText size={15} />

            Documents

            {documents.length > 0 && (
              <span className="tab-count">
                {documents.length}
              </span>
            )}
          </button>

          <button
            className={
              activeTab === "timeline"
                ? "active-tab"
                : ""
            }
            onClick={() =>
              setActiveTab("timeline")
            }
          >
            <CalendarDays size={15} />

            Timeline
          </button>

        </div>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        {activeTab === "overview" && (
          <div className="drawer-scroll">

            <div className="drawer-section">

              {/* =================================================
                  Section Header
              ================================================= */}

              <div className="section-heading">

                <div>
                  <span className="section-eyebrow">
                    TENDER INFORMATION
                  </span>

                  <h3>
                    Tender Overview
                  </h3>
                </div>

                <span className="section-record">
                  {getTenderId(
                    tender?._id
                  )}
                </span>

              </div>

              {/* =================================================
                  Stats
              ================================================= */}

              <div className="overview-grid">

                <div className="overview-card">

                  <div className="overview-card-icon blue">
                    <Wallet size={19} />
                  </div>

                  <div>
                    <span>
                      Estimated Value
                    </span>

                    <strong>
                      {formatBudget(
                        tender?.estimated_value,
                        tender?.currency
                      )}
                    </strong>
                  </div>

                </div>

                <div className="overview-card">

                  <div className="overview-card-icon purple">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <span>
                      Submission Deadline
                    </span>

                    <strong>
                      {formatDate(
                        tender?.submission_deadline
                      )}
                    </strong>
                  </div>

                </div>

                <div className="overview-card">

                  <div className="overview-card-icon green">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <span>
                      Execution Location
                    </span>

                    <strong>
                      {tender?.execution_location ||
                        "N/A"}
                    </strong>
                  </div>

                </div>

              </div>

              {/* =================================================
                  Description
              ================================================= */}

              <div className="drawer-info-card description-card">

                <div className="info-card-title">

                  <div className="info-title-icon">
                    <FileText size={17} />
                  </div>

                  <div>
                    <span>
                      TENDER DESCRIPTION
                    </span>

                    <h4>
                      Description
                    </h4>
                  </div>

                </div>

                <p className="drawer-description">
                  {tender?.description ||
                    "No description provided."}
                </p>

              </div>

              {/* =================================================
                  Tender Details
              ================================================= */}

              <div className="drawer-info-card">

                <div className="info-card-title">

                  <div className="info-title-icon">
                    <ShieldCheck size={17} />
                  </div>

                  <div>
                    <span>
                      GENERAL INFORMATION
                    </span>

                    <h4>
                      Tender Details
                    </h4>
                  </div>

                </div>

                <div className="information-grid">

                  <div className="information-item">

                    <span>
                      Tender ID
                    </span>

                    <strong className="mono-value">
                      {tender?._id ||
                        "N/A"}
                    </strong>

                  </div>

                  <div className="information-item">

                    <span>
                      Tender Type
                    </span>

                    <strong>
                      {tender?.type ||
                        "N/A"}
                    </strong>

                  </div>

                  <div className="information-item">

                    <span>
                      Status
                    </span>

                    <strong>
                      {tender?.status ||
                        "N/A"}
                    </strong>

                  </div>

                  <div className="information-item">

                    <span>
                      Currency
                    </span>

                    <strong>
                      {tender?.currency ||
                        "N/A"}
                    </strong>

                  </div>

                  <div className="information-item">

                    <span>
                      Estimated Value
                    </span>

                    <strong>
                      {formatBudget(
                        tender?.estimated_value,
                        tender?.currency
                      )}
                    </strong>

                  </div>

                  <div className="information-item">

                    <span>
                      Execution Location
                    </span>

                    <strong>
                      {tender?.execution_location ||
                        "N/A"}
                    </strong>

                  </div>

                  <div className="information-item">

                    <span>
                      Submission Start
                    </span>

                    <strong>
                      {formatDateTime(
                        tender?.submission_start
                      )}
                    </strong>

                  </div>

                  <div className="information-item">

                    <span>
                      Submission Deadline
                    </span>

                    <strong>
                      {formatDateTime(
                        tender?.submission_deadline
                      )}
                    </strong>

                  </div>

                </div>

              </div>

              {/* =================================================
                  Publisher
              ================================================= */}

              <div className="drawer-info-card">

                <div className="info-card-title">

                  <div className="info-title-icon">
                    <Building2 size={17} />
                  </div>

                  <div>
                    <span>
                      ORGANIZATION
                    </span>

                    <h4>
                      Publisher Information
                    </h4>
                  </div>

                </div>

                {/* Publisher Header */}

                <div className="publisher-details-header">

                  <div className="publisher-avatar">
                    <Building2 size={23} />
                  </div>

                  <div className="publisher-header-content">

                    <strong>
                      {publisher?.org_name ||
                        "N/A"}
                    </strong>

                    <span>
                      {publisher?._type ||
                        "PUBLISHER"}
                    </span>

                  </div>

                  <div className="publisher-verified">
                    <BadgeCheck size={16} />

                    Verified Organization
                  </div>

                </div>

                {/* Publisher Information */}

                <div className="information-grid publisher-grid">

                  <div className="information-item">

                    <div className="info-label-with-icon">
                      <Mail size={14} />

                      <span>
                        Email
                      </span>
                    </div>

                    <strong>
                      {publisher?.email ||
                        "N/A"}
                    </strong>

                  </div>

                  <div className="information-item">

                    <div className="info-label-with-icon">
                      <Phone size={14} />

                      <span>
                        Phone
                      </span>
                    </div>

                    <strong>
                      {publisher?.phone_number ||
                        "N/A"}
                    </strong>

                  </div>

                  <div className="information-item">

                    <div className="info-label-with-icon">
                      <MapPin size={14} />

                      <span>
                        Address
                      </span>
                    </div>

                    <strong>
                      {publisher?._address ||
                        "N/A"}
                    </strong>

                  </div>

                  <div className="information-item">

                    <div className="info-label-with-icon">
                      <Globe2 size={14} />

                      <span>
                        Organization Type
                      </span>
                    </div>

                    <strong>
                      {publisher?._type ||
                        "N/A"}
                    </strong>

                  </div>

                  <div className="information-item">

                    <div className="info-label-with-icon">
                      <Landmark size={14} />

                      <span>
                        Commercial Register
                      </span>
                    </div>

                    <strong>
                      {publisher?.commercial_register_num ||
                        "N/A"}
                    </strong>

                  </div>

                  <div className="information-item">

                    <div className="info-label-with-icon">
                      <FileCheck2 size={14} />

                      <span>
                        License Number
                      </span>
                    </div>

                    <strong>
                      {publisher?.license_num ||
                        "N/A"}
                    </strong>

                  </div>

                  <div className="information-item">

                    <span>
                      Register Date
                    </span>

                    <strong>
                      {formatDate(
                        publisher?.commercial_register_date
                      )}
                    </strong>

                  </div>

                  <div className="information-item">

                    <span>
                      License Date
                    </span>

                    <strong>
                      {formatDate(
                        publisher?.license_date
                      )}
                    </strong>

                  </div>

                </div>

              </div>

              {/* =================================================
                  System Information
              ================================================= */}

              <div className="drawer-info-card">

                <div className="info-card-title">

                  <div className="info-title-icon">
                    <CalendarDays size={17} />
                  </div>

                  <div>
                    <span>
                      SYSTEM
                    </span>

                    <h4>
                      System Information
                    </h4>
                  </div>

                </div>

                <div className="information-grid">

                  <div className="information-item">

                    <span>
                      Created At
                    </span>

                    <strong>
                      {formatDateTime(
                        createdAt
                      )}
                    </strong>

                  </div>

                  <div className="information-item">

                    <span>
                      Last Updated
                    </span>

                    <strong>
                      {formatDateTime(
                        updatedAt
                      )}
                    </strong>

                  </div>

                  <div className="information-item">

                    <span>
                      Record Version
                    </span>

                    <strong>
                      {tender?.__v ??
                        "N/A"}
                    </strong>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            DOCUMENTS
        ================================================= */}

        {activeTab === "documents" && (
          <div className="drawer-scroll">

            <div className="drawer-section">

              <div className="section-heading">

                <div>
                  <span className="section-eyebrow">
                    ATTACHMENTS
                  </span>

                  <h3>
                    Tender Documents
                  </h3>
                </div>

              </div>

              {documents.length === 0 ? (

                <div className="empty-documents">

                  <div className="empty-documents-icon">
                    <FileText size={30} />
                  </div>

                  <h4>
                    No Documents Available
                  </h4>

                  <p>
                    The current API response
                    does not contain tender
                    documents.
                  </p>

                  <span>
                    Documents will appear here
                    when the backend provides
                    them.
                  </span>

                </div>

              ) : (

                <div className="documents-grid">

                  {documents.map(
                    (doc, index) => {

                      const documentName =
                        typeof doc === "string"
                          ? doc
                          : doc?.name ||
                            doc?.file_name ||
                            `Document ${
                              index + 1
                            }`;

                      const documentUrl =
                        typeof doc === "object"
                          ? doc?.url ||
                            doc?.file_url
                          : null;

                      return (
                        <div
                          className="drawer-document"
                          key={
                            doc?._id ||
                            index
                          }
                        >

                          <div className="doc-info">

                            <div className="document-icon-wrapper">
                              <FileText
                                size={21}
                              />
                            </div>

                            <div>

                              <span className="doc-name">
                                {documentName}
                              </span>

                              <small>
                                Tender Document
                              </small>

                            </div>

                          </div>

                          {documentUrl && (
                            <div className="doc-actions">

                              <button
                                type="button"
                                title="View"
                                onClick={() =>
                                  window.open(
                                    documentUrl,
                                    "_blank"
                                  )
                                }
                              >
                                <Eye size={16} />
                              </button>

                              <a
                                href={
                                  documentUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                title="Download"
                              >
                                <Download
                                  size={16}
                                />
                              </a>

                            </div>
                          )}

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </div>

          </div>
        )}

        {/* =================================================
            TIMELINE
        ================================================= */}

        {activeTab === "timeline" && (
          <div className="drawer-scroll">

            <div className="drawer-section">

              <div className="section-heading">

                <div>
                  <span className="section-eyebrow">
                    TENDER LIFECYCLE
                  </span>

                  <h3>
                    Tender Timeline
                  </h3>
                </div>

              </div>

              <div className="real-timeline">

                {/* Created */}

                <div className="real-timeline-item completed">

                  <div className="timeline-dot">
                    <CircleCheck size={14} />
                  </div>

                  <div className="timeline-content">

                    <div className="timeline-title-row">

                      <h4>
                        Tender Created
                      </h4>

                      <span>
                        {formatDateTime(
                          tender?.createdAt
                        )}
                      </span>

                    </div>

                    <p>
                      The tender was created
                      and registered in the
                      system.
                    </p>

                  </div>

                </div>

                {/* Submission Start */}

                <div
                  className={`real-timeline-item ${
                    new Date() >=
                    new Date(
                      tender?.submission_start
                    )
                      ? "completed"
                      : ""
                  }`}
                >

                  <div className="timeline-dot">
                    <CalendarDays size={14} />
                  </div>

                  <div className="timeline-content">

                    <div className="timeline-title-row">

                      <h4>
                        Submission Starts
                      </h4>

                      <span>
                        {formatDateTime(
                          tender?.submission_start
                        )}
                      </span>

                    </div>

                    <p>
                      Bid submissions become
                      available from this
                      date.
                    </p>

                  </div>

                </div>

                {/* Deadline */}

                <div
                  className={`real-timeline-item ${
                    daysLeft === 0
                      ? "completed"
                      : ""
                  }`}
                >

                  <div className="timeline-dot">
                    <Clock3 size={14} />
                  </div>

                  <div className="timeline-content">

                    <div className="timeline-title-row">

                      <h4>
                        Submission Deadline
                      </h4>

                      <span>
                        {formatDateTime(
                          tender?.submission_deadline
                        )}
                      </span>

                    </div>

                    <p>
                      Final deadline for
                      submitting bids.
                    </p>

                  </div>

                </div>

                {/* Updated */}

                <div className="real-timeline-item">

                  <div className="timeline-dot">
                    <CalendarDays size={14} />
                  </div>

                  <div className="timeline-content">

                    <div className="timeline-title-row">

                      <h4>
                        Last Updated
                      </h4>

                      <span>
                        {formatDateTime(
                          tender?.updatedAt
                        )}
                      </span>

                    </div>

                    <p>
                      Latest update recorded
                      by the system.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </>
  );
}