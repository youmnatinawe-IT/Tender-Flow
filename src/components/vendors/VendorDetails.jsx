import { useState } from "react";

import "./style/Bids.css";

import {
  X,
  FileText,
  Building2,
  Hash,
  CalendarDays,
  Clock3,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  Loader2,
  Download,
  Presentation,
} from "lucide-react";

import API from "../../services/api";

/* =========================================================
   Format Date
========================================================= */

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   Format Number
========================================================= */

const formatNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  return Number.isNaN(number)
    ? value
    : new Intl.NumberFormat("en-US").format(number);
};

/* =========================================================
   Normalize ID
========================================================= */

const normalizeId = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    return (
      value?._id ||
      value?.id ||
      value?.tender_id ||
      value?.code ||
      "—"
    );
  }

  return String(value);
};

/* =========================================================
   Get File URL
========================================================= */

const getFileUrl = (filePath) => {
  if (!filePath) return "";

  if (
    filePath.startsWith("http://") ||
    filePath.startsWith("https://")
  ) {
    return filePath;
  }

  const baseUrl =
    API?.defaults?.baseURL || "";

  const cleanBase = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;

  const cleanPath = filePath.startsWith("/")
    ? filePath
    : `/${filePath}`;

  return `${cleanBase}${cleanPath}`;
};

/* =========================================================
   Status Helper
========================================================= */

const getStatusInfo = (status) => {
  const normalized = String(
    status || ""
  ).toUpperCase();

  switch (normalized) {
    case "SUBMITTED":
      return {
        label: "Submitted",
        className: "bid-status-submitted",
        icon: (
          <CheckCircle2 size={16} />
        ),
      };

    case "UNDER_REVIEW":
      return {
        label: "Under Review",
        className: "bid-status-review",
        icon: (
          <Clock3 size={16} />
        ),
      };

    case "ACCEPTED":
    case "APPROVED":
      return {
        label: "Accepted",
        className: "bid-status-accepted",
        icon: (
          <CheckCircle2 size={16} />
        ),
      };

    case "REJECTED":
      return {
        label: "Rejected",
        className: "bid-status-rejected",
        icon: (
          <XCircle size={16} />
        ),
      };

    case "WITHDRAWN":
      return {
        label: "Withdrawn",
        className: "bid-status-withdrawn",
        icon: (
          <AlertCircle size={16} />
        ),
      };

    default:
      return {
        label: status || "Unknown",
        className: "bid-status-default",
        icon: (
          <AlertCircle size={16} />
        ),
      };
  }
};

/* =========================================================
   Organization Helper
========================================================= */

const getOrganization = (bid) => {
  if (!bid) {
    return null;
  }

  const org =
    bid.executor_org_id ||
    bid.executor_org ||
    bid.organization ||
    bid.organization_id;

  if (
    typeof org === "object" &&
    org !== null
  ) {
    return org;
  }

  return null;
};

const getOrganizationName = (bid) => {
  if (!bid) return "—";

  const org = getOrganization(bid);

  if (org) {
    return (
      org.org_name ||
      org.name ||
      org.organization_name ||
      org.title ||
      "—"
    );
  }

  if (
    typeof bid.executor_org_id ===
    "string"
  ) {
    return bid.executor_org_id;
  }

  return (
    bid.executor_org_name ||
    bid.organization_name ||
    bid.org_name ||
    "—"
  );
};

/* =========================================================
   File Helpers
========================================================= */

const getFileName = (filePath) => {
  if (!filePath) {
    return "Document";
  }

  const parts = String(filePath).split("/");

  return (
    parts[parts.length - 1] ||
    "Document"
  );
};

const getFileExtension = (filePath) => {
  if (
    !filePath ||
    !String(filePath).includes(".")
  ) {
    return "";
  }

  return (
    "." +
    String(filePath)
      .split(".")
      .pop()
      ?.toLowerCase()
  );
};

/* =========================================================
   Component
========================================================= */

export default function VendorDetails({
  vendor,
  onClose,
}) {
  const [previewFile, setPreviewFile] =
    useState(null);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  const [previewError, setPreviewError] =
    useState("");

  if (!vendor) {
    return null;
  }

  /* =========================================================
     Basic Data
  ========================================================= */

  const statusInfo = getStatusInfo(
    vendor.status ||
      vendor.bid_status
  );

  const bidId =
    vendor._id ||
    vendor.id ||
    "—";

  const tenderId =
    normalizeId(
      vendor.tender_id ||
        vendor.tenderId ||
        vendor.tender
    );

  const organizationName =
    getOrganizationName(vendor);

  const organization =
    getOrganization(vendor);

  const offeredValue =
    vendor.offered_value ??
    vendor.offeredValue ??
    vendor.bid_value ??
    vendor.amount ??
    vendor.value;

  const currency =
    vendor.currency ||
    vendor.offered_currency ||
    vendor.bid_currency ||
    "USD";

  const technicalFile =
    vendor.technical_proposal_file ||
    vendor.technicalProposalFile ||
    vendor.technical_proposal ||
    null;

  const fileName =
    getFileName(technicalFile);

  const submittedAt =
    vendor.submitted_at ||
    vendor.submittedAt ||
    null;

  const createdAt =
    vendor.createdAt ||
    vendor.created_at ||
    null;

  /* =========================================================
     Handle Open File
  ========================================================= */

  const handleOpenFile = async (
    filePath,
    customFileName
  ) => {
    if (!filePath) {
      return;
    }

    try {
      setPreviewLoading(true);
      setPreviewError("");
      setPreviewFile(null);

      const rawUrl =
        getFileUrl(filePath);

      if (!rawUrl) {
        throw new Error(
          "File URL is missing."
        );
      }

      const extension =
        getFileExtension(filePath);

      let contentType =
        "application/octet-stream";

      let displayUrl = rawUrl;

      /* PPT / PPTX */

      if (
        extension === ".pptx" ||
        extension === ".ppt"
      ) {
        contentType =
          "presentation";

        displayUrl =
          `https://docs.google.com/gview?url=${encodeURIComponent(
            rawUrl
          )}&embedded=true`;
      }

      /* PDF */

      else if (
        extension === ".pdf"
      ) {
        contentType =
          "application/pdf";
      }

      /* Images */

      else if (
        [
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".webp",
        ].includes(extension)
      ) {
        contentType =
          extension === ".jpg" ||
          extension === ".jpeg"
            ? "image/jpeg"
            : `image/${extension.replace(
                ".",
                ""
              )}`;
      }

      console.log(
        "Opening attachment:",
        {
          filePath,
          rawUrl,
          displayUrl,
          extension,
          contentType,
        }
      );

      setPreviewFile({
        url: displayUrl,
        downloadUrl: rawUrl,
        name:
          customFileName ||
          getFileName(filePath),
        type: contentType,
        isObjectUrl: false,
      });
    } catch (error) {
      console.error(
        "Failed to preview file:",
        error
      );

      setPreviewFile(null);

      setPreviewError(
        error?.message ||
          "Unable to preview this file."
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  /* =========================================================
     Close File Preview
  ========================================================= */

  const closeFilePreview = () => {
    if (
      previewFile?.url &&
      previewFile.url.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        previewFile.url
      );
    }

    setPreviewFile(null);
    setPreviewError("");
    setPreviewLoading(false);
  };

  /* =========================================================
     Render
  ========================================================= */

  return (
    <>
      {/* =====================================================
          BID DETAILS MODAL
      ===================================================== */}

      <div
        className="bid-modal-overlay"
        onClick={onClose}
      >
        <div
          className="bid-details-modal"
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          {/* Header */}

          <div className="bid-modal-header">
            <div className="bid-header-info">
              <div className="bid-header-icon">
                <FileText size={24} />
              </div>

              <div>
                <span className="bid-header-label">
                  BID DETAILS
                </span>

                <h2>
                  Submitted Offer
                </h2>

                <p>
                  Review the submitted bid information
                </p>
              </div>
            </div>

            <button
              type="button"
              className="bid-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={21} />
            </button>
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="bid-summary">
            <div className="bid-summary-main">
              <div className="bid-summary-label">
                OFFERED VALUE
              </div>

              <div className="bid-summary-value">
                {formatNumber(
                  offeredValue
                )}

                <span>
                  {currency}
                </span>
              </div>

              <div className="bid-summary-caption">
                Submitted offer amount
              </div>
            </div>

            <div className="bid-summary-status">
              <span className="bid-summary-label">
                STATUS
              </span>

              <div
                className={`bid-status ${statusInfo.className}`}
              >
                {statusInfo.icon}

                <span>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              BODY
          ================================================= */}

          <div className="bid-details-body">

            {/* =================================================
                IDENTITY
            ================================================= */}

            <section className="bid-section">
              <div className="bid-section-title">
                <div className="bid-section-icon blue">
                  <FileText size={18} />
                </div>

                <div>
                  <h3>
                    Tender & Bid Identity
                  </h3>

                  <p>
                    System identifiers for tracking
                  </p>
                </div>
              </div>

              <div className="bid-info-grid">

                <div className="bid-info-card">
                  <span className="bid-info-label">
                    <Hash size={14} />
                    Bid ID
                  </span>

                  <strong className="bid-mono">
                    {bidId}
                  </strong>
                </div>

                <div className="bid-info-card">
                  <span className="bid-info-label">
                    <FileText size={14} />
                    Tender ID
                  </span>

                  <strong className="bid-mono">
                    {tenderId}
                  </strong>
                </div>

              </div>
            </section>

            {/* =================================================
                ORGANIZATION
            ================================================= */}

            <section className="bid-section">
              <div className="bid-section-title">
                <div className="bid-section-icon purple">
                  <Building2 size={18} />
                </div>

                <div>
                  <h3>
                    Participating Organization
                  </h3>

                  <p>
                    Organization that submitted this bid
                  </p>
                </div>
              </div>

              <div className="bid-organization-card">
                <div className="bid-org-icon">
                  <Building2 size={21} />
                </div>

                <div>
                  <span>
                    Executor Organization
                  </span>

                  <strong>
                    {organizationName}
                  </strong>
                </div>
              </div>

              {/* Organization ID if available */}

              {organization && (
                <div
                  className="bid-info-grid"
                  style={{
                    marginTop: "12px",
                  }}
                >
                  <div className="bid-info-card">
                    <span className="bid-info-label">
                      <Hash size={14} />
                      Organization ID
                    </span>

                    <strong className="bid-mono">
                      {normalizeId(
                        organization
                      )}
                    </strong>
                  </div>
                </div>
              )}
            </section>

            {/* =================================================
                OFFER DETAILS
            ================================================= */}

            <section className="bid-section">
              <div className="bid-section-title">
                <div className="bid-section-icon green">
                  <FileText size={18} />
                </div>

                <div>
                  <h3>
                    Offer Details
                  </h3>

                  <p>
                    Financial information submitted with the bid
                  </p>
                </div>
              </div>

              <div className="bid-info-grid">

                <div className="bid-info-card">
                  <span className="bid-info-label">
                    Offered Value
                  </span>

                  <strong>
                    {formatNumber(
                      offeredValue
                    )}
                  </strong>
                </div>

                <div className="bid-info-card">
                  <span className="bid-info-label">
                    Currency
                  </span>

                  <strong>
                    {currency}
                  </strong>
                </div>

                <div className="bid-info-card">
                  <span className="bid-info-label">
                    Status
                  </span>

                  <strong>
                    {statusInfo.label}
                  </strong>
                </div>

              </div>
            </section>

            {/* =================================================
                TIMESTAMPS
            ================================================= */}

            <section className="bid-section">
              <div className="bid-section-title">
                <div className="bid-section-icon orange">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <h3>
                    Timestamps
                  </h3>

                  <p>
                    Submission and system records
                  </p>
                </div>
              </div>

              <div className="bid-info-grid">

                <div className="bid-info-card">
                  <span className="bid-info-label">
                    <CalendarDays size={14} />
                    Submitted At
                  </span>

                  <strong>
                    {formatDate(
                      submittedAt
                    )}
                  </strong>
                </div>

                <div className="bid-info-card">
                  <span className="bid-info-label">
                    <Clock3 size={14} />
                    Created At
                  </span>

                  <strong>
                    {formatDate(
                      createdAt
                    )}
                  </strong>
                </div>

              </div>
            </section>

            {/* =================================================
                TECHNICAL PROPOSAL
            ================================================= */}

            {technicalFile && (
              <section className="bid-section">
                <div className="bid-section-title">
                  <div className="bid-section-icon green">
                    <FileText size={18} />
                  </div>

                  <div>
                    <h3>
                      Technical Proposal
                    </h3>

                    <p>
                      Submitted technical proposal document
                    </p>
                  </div>
                </div>

                <div className="bid-document-card">
                  <div className="bid-document-left">
                    <div className="bid-document-icon">
                      {getFileExtension(
                        technicalFile
                      ).includes("ppt") ? (
                        <Presentation size={21} />
                      ) : (
                        <FileText size={21} />
                      )}
                    </div>

                    <div>
                      <strong>
                        Technical Proposal Document
                      </strong>

                      <span>
                        {fileName}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="bid-view-document"
                    onClick={() =>
                      handleOpenFile(
                        technicalFile,
                        fileName
                      )
                    }
                    disabled={
                      previewLoading
                    }
                    title="Preview File"
                  >
                    {previewLoading ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Eye size={16} />
                    )}

                    {previewLoading
                      ? "Loading..."
                      : "View Document"}
                  </button>
                </div>

                {previewError && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "#fef2f2",
                      border:
                        "1px solid #fecaca",
                      color: "#b91c1c",
                      fontSize: "13px",
                    }}
                  >
                    {previewError}
                  </div>
                )}
              </section>
            )}

            {/* =================================================
                NOTES
            ================================================= */}

            {vendor.notes && (
              <section className="bid-section">
                <div className="bid-section-title">
                  <div className="bid-section-icon yellow">
                    <MessageSquare size={18} />
                  </div>

                  <div>
                    <h3>
                      Notes
                    </h3>

                    <p>
                      Additional details from vendor
                    </p>
                  </div>
                </div>

                <div className="bid-notes">
                  <MessageSquare size={17} />

                  <p>
                    {vendor.notes}
                  </p>
                </div>
              </section>
            )}

            {/* =================================================
                ADDITIONAL BID DETAILS
            ================================================= */}

            <section className="bid-section">
              <div className="bid-section-title">
                <div className="bid-section-icon blue">
                  <FileText size={18} />
                </div>

                <div>
                  <h3>
                    Additional Bid Details
                  </h3>

                  <p>
                    Other information returned by the backend
                  </p>
                </div>
              </div>

              <div className="bid-info-grid">

                {vendor.type && (
                  <div className="bid-info-card">
                    <span className="bid-info-label">
                      Type
                    </span>

                    <strong>
                      {vendor.type}
                    </strong>
                  </div>
                )}

                {vendor.bid_number && (
                  <div className="bid-info-card">
                    <span className="bid-info-label">
                      Bid Number
                    </span>

                    <strong>
                      {vendor.bid_number}
                    </strong>
                  </div>
                )}

                {vendor.reference_number && (
                  <div className="bid-info-card">
                    <span className="bid-info-label">
                      Reference Number
                    </span>

                    <strong>
                      {vendor.reference_number}
                    </strong>
                  </div>
                )}

                {vendor.evaluation_status && (
                  <div className="bid-info-card">
                    <span className="bid-info-label">
                      Evaluation Status
                    </span>

                    <strong>
                      {vendor.evaluation_status}
                    </strong>
                  </div>
                )}

                {vendor.submission_status && (
                  <div className="bid-info-card">
                    <span className="bid-info-label">
                      Submission Status
                    </span>

                    <strong>
                      {vendor.submission_status}
                    </strong>
                  </div>
                )}

              </div>
            </section>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="bid-modal-footer">
            <span>
              Bid information loaded from backend.
            </span>

            <button
              type="button"
              className="bid-close-footer-btn"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          FILE PREVIEW MODAL
      ===================================================== */}

      {(previewFile ||
        previewLoading ||
        previewError) && (
        <div
          onClick={closeFilePreview}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background:
              "rgba(15, 23, 42, 0.72)",
            backdropFilter:
              "blur(5px)",
          }}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "min(1100px, 95vw)",
              height: "min(850px, 92vh)",
              display: "flex",
              flexDirection: "column",
              background: "#ffffff",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow:
                "0 25px 60px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Header */}

            <div
              style={{
                minHeight: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: "15px",
                padding: "0 20px",
                borderBottom:
                  "1px solid #e5e7eb",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  minWidth: 0,
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                  color: "#172033",
                  fontSize: "15px",
                  fontWeight: 700,
                }}
              >
                {previewFile?.type ===
                "presentation" ? (
                  <Presentation
                    size={18}
                    color="#2563eb"
                  />
                ) : (
                  <FileText
                    size={18}
                    color="#2563eb"
                  />
                )}

                <span
                  style={{
                    overflow: "hidden",
                    textOverflow:
                      "ellipsis",
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {previewFile?.name ||
                    "File Preview"}
                </span>
              </div>

              <button
                type="button"
                onClick={
                  closeFilePreview
                }
                aria-label="Close preview"
                style={{
                  width: "38px",
                  height: "38px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "10px",
                  background:
                    "#ffffff",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Viewer Body */}

            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                background:
                  "#f8fafc",
              }}
            >
              {previewLoading && (
                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    alignItems:
                      "center",
                    gap: "12px",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  <Loader2
                    size={32}
                    className="animate-spin"
                  />

                  <span>
                    Loading secure file...
                  </span>
                </div>
              )}

              {!previewLoading &&
                previewError && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection:
                        "column",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap: "10px",
                      padding: "30px",
                      textAlign:
                        "center",
                    }}
                  >
                    <AlertCircle
                      size={34}
                      color="#64748b"
                    />

                    <h4
                      style={{
                        margin: 0,
                        color:
                          "#172033",
                        fontSize:
                          "18px",
                      }}
                    >
                      Unable to Preview File
                    </h4>

                    <p
                      style={{
                        margin: 0,
                        color:
                          "#64748b",
                        fontSize:
                          "14px",
                      }}
                    >
                      {previewError}
                    </p>

                    <button
                      type="button"
                      onClick={
                        closeFilePreview
                      }
                      style={{
                        marginTop:
                          "8px",
                        padding:
                          "9px 18px",
                        border: 0,
                        borderRadius:
                          "9px",
                        background:
                          "#2563eb",
                        color:
                          "#ffffff",
                        cursor:
                          "pointer",
                      }}
                    >
                      Close
                    </button>
                  </div>
                )}

              {!previewLoading &&
                !previewError &&
                (
                  previewFile?.type?.includes(
                    "pdf"
                  ) ||
                  previewFile?.type ===
                    "presentation"
                ) && (
                  <iframe
                    src={
                      previewFile.url
                    }
                    title={
                      previewFile.name
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      border: 0,
                      background:
                        "#ffffff",
                    }}
                  />
                )}

              {!previewLoading &&
                !previewError &&
                previewFile?.type?.startsWith(
                  "image/"
                ) && (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      padding:
                        "25px",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      overflow:
                        "auto",
                    }}
                  >
                    <img
                      src={
                        previewFile.url
                      }
                      alt={
                        previewFile.name
                      }
                      style={{
                        maxWidth:
                          "100%",
                        maxHeight:
                          "100%",
                        objectFit:
                          "contain",
                        borderRadius:
                          "8px",
                      }}
                    />
                  </div>
                )}

              {!previewLoading &&
                !previewError &&
                previewFile &&
                !previewFile.type?.includes(
                  "pdf"
                ) &&
                !previewFile.type?.startsWith(
                  "image/"
                ) &&
                previewFile.type !==
                  "presentation" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection:
                        "column",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap: "10px",
                      padding:
                        "30px",
                      textAlign:
                        "center",
                    }}
                  >
                    <FileText
                      size={34}
                      color="#64748b"
                    />

                    <h4
                      style={{
                        margin: 0,
                        color:
                          "#172033",
                        fontSize:
                          "18px",
                      }}
                    >
                      Preview Not Available
                    </h4>

                    <p
                      style={{
                        margin: 0,
                        color:
                          "#64748b",
                        fontSize:
                          "14px",
                      }}
                    >
                      This file type cannot be previewed directly inside the application.
                    </p>

                    <a
                      href={
                        previewFile.downloadUrl ||
                        previewFile.url
                      }
                      download={
                        previewFile.name
                      }
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: "8px",
                        marginTop:
                          "8px",
                        padding:
                          "10px 16px",
                        border: 0,
                        borderRadius:
                          "9px",
                        background:
                          "#2563eb",
                        color:
                          "#ffffff",
                        cursor:
                          "pointer",
                        fontSize:
                          "14px",
                        fontWeight:
                          600,
                        textDecoration:
                          "none",
                      }}
                    >
                      <Download
                        size={16}
                      />

                      Download File
                    </a>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}