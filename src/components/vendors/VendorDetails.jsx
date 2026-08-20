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
   Helpers
========================================================= */

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  return Number.isNaN(number) ? value : new Intl.NumberFormat("en-US").format(number);
};

// بناء URL الملف مع الباك-إند
const getFileUrl = (filePath) => {
  if (!filePath) return "";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  const baseUrl = API?.defaults?.baseURL || "";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${cleanBase}${cleanPath}`;
};

/* =========================================================
   Status Helper
========================================================= */

const getStatusInfo = (status) => {
  const normalized = String(status || "").toUpperCase();

  switch (normalized) {
    case "SUBMITTED":
      return { label: "Submitted", className: "bid-status-submitted", icon: <CheckCircle2 size={16} /> };
    case "UNDER_REVIEW":
      return { label: "Under Review", className: "bid-status-review", icon: <Clock3 size={16} /> };
    case "ACCEPTED":
    case "APPROVED":
      return { label: "Accepted", className: "bid-status-accepted", icon: <CheckCircle2 size={16} /> };
    case "REJECTED":
      return { label: "Rejected", className: "bid-status-rejected", icon: <XCircle size={16} /> };
    case "WITHDRAWN":
      return { label: "Withdrawn", className: "bid-status-withdrawn", icon: <AlertCircle size={16} /> };
    default:
      return { label: status || "Unknown", className: "bid-status-default", icon: <AlertCircle size={16} /> };
  }
};

/* =========================================================
   Organization Helper
========================================================= */

const getOrganizationName = (bid) => {
  if (!bid) return "—";
  const org = bid.executor_org_id || bid.executor_org || bid.organization;

  if (typeof org === "object" && org !== null) {
    return org.org_name || org.name || org.organization_name || "—";
  }
  if (typeof org === "string") return org;
  return bid.executor_org_name || bid.organization_name || "—";
};

/* =========================================================
   File Helpers
========================================================= */

const getFileName = (filePath) => {
  if (!filePath) return "Document.pdf";
  const parts = filePath.split("/");
  return parts[parts.length - 1] || "Document.pdf";
};

const getFileExtension = (filePath) => {
  if (!filePath || !filePath.includes(".")) return "";
  return "." + filePath.split(".").pop()?.toLowerCase();
};

/* =========================================================
   Component
========================================================= */

export default function VendorDetails({ vendor, onClose }) {
  const [previewFile, setPreviewFile] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  if (!vendor) return null;

  const statusInfo = getStatusInfo(vendor.status);
  const bidId = vendor._id || vendor.id || "—";
  const tenderId = vendor.tender_id || "—";
  const organizationName = getOrganizationName(vendor);
  const technicalFile = vendor.technical_proposal_file;
  const fileName = getFileName(technicalFile);

  /* =========================================================
     Handle Open File (PDF, Presentation, Image)
  ========================================================= */
  const handleOpenFile = async (filePath, customFileName) => {
    if (!filePath) return;

    try {
      setPreviewLoading(true);
      setPreviewError(null);
      setPreviewFile(null);

      const rawUrl = getFileUrl(filePath);

      if (!rawUrl) {
        throw new Error("File URL is missing.");
      }

      const extension = getFileExtension(filePath);

      let contentType = "application/octet-stream";
      let displayUrl = rawUrl;

      // 1. ملفات العروض التقديمية (PPT / PPTX)
      if (extension === ".pptx" || extension === ".ppt") {
        contentType = "presentation";
        // تجميع رابط Google Viewer لمعاينة ملف العروض مباشرة
        displayUrl = `https://docs.google.com/gview?url=${encodeURIComponent(rawUrl)}&embedded=true`;
      } 
      // 2. ملفات PDF
      else if (extension === ".pdf") {
        contentType = "application/pdf";
      } 
      // 3. الصور
      else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(extension)) {
        contentType = extension === ".jpg" || extension === ".jpeg" 
          ? "image/jpeg" 
          : `image/${extension.replace(".", "")}`;
      }

      console.log("Opening attachment:", {
        filePath,
        rawUrl,
        displayUrl,
        extension,
        contentType,
      });

      setPreviewFile({
        url: displayUrl,
        downloadUrl: rawUrl, // نحفظ الرابط الأصلي للتنزيل عند الحاجة
        name: customFileName || getFileName(filePath),
        type: contentType,
        isObjectUrl: false,
      });

    } catch (error) {
      console.error("Failed to preview file:", error);
      setPreviewFile(null);
      setPreviewError(error?.message || "Unable to preview this file.");
    } finally {
      setPreviewLoading(false);
    }
  };

  /* =========================================================
     Close Preview & Cleanup Memory
  ========================================================= */

  const closeFilePreview = () => {
    if (previewFile?.url && previewFile.url.startsWith("blob:")) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
    setPreviewError("");
    setPreviewLoading(false);
  };

  return (
    <>
      {/* BID DETAILS MODAL */}
      <div className="bid-modal-overlay" onClick={onClose}>
        <div className="bid-details-modal" onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div className="bid-modal-header">
            <div className="bid-header-info">
              <div className="bid-header-icon">
                <FileText size={24} />
              </div>
              <div>
                <span className="bid-header-label">BID DETAILS</span>
                <h2>Submitted Offer</h2>
                <p>Review the submitted bid information</p>
              </div>
            </div>

            <button type="button" className="bid-close-btn" onClick={onClose} aria-label="Close">
              <X size={21} />
            </button>
          </div>

          {/* Summary */}
          <div className="bid-summary">
            <div className="bid-summary-main">
              <div className="bid-summary-label">OFFERED VALUE</div>
              <div className="bid-summary-value">
                {formatNumber(vendor.offered_value)} <span>{vendor.currency || "USD"}</span>
              </div>
              <div className="bid-summary-caption">Submitted offer amount</div>
            </div>

            <div className="bid-summary-status">
              <span className="bid-summary-label">STATUS</span>
              <div className={`bid-status ${statusInfo.className}`}>
                {statusInfo.icon}
                <span>{statusInfo.label}</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="bid-details-body">
            {/* Identity */}
            <section className="bid-section">
              <div className="bid-section-title">
                <div className="bid-section-icon blue">
                  <FileText size={18} />
                </div>
                <div>
                  <h3>Tender & Bid Identity</h3>
                  <p>System identifiers for tracking</p>
                </div>
              </div>

              <div className="bid-info-grid">
                <div className="bid-info-card">
                  <span className="bid-info-label"><Hash size={14} /> Bid ID</span>
                  <strong className="bid-mono">{bidId}</strong>
                </div>

                <div className="bid-info-card">
                  <span className="bid-info-label"><FileText size={14} /> Tender ID</span>
                  <strong className="bid-mono">{tenderId}</strong>
                </div>
              </div>
            </section>

            {/* Organization */}
            <section className="bid-section">
              <div className="bid-section-title">
                <div className="bid-section-icon purple">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3>Participating Organization</h3>
                  <p>Organization that submitted this bid</p>
                </div>
              </div>

              <div className="bid-organization-card">
                <div className="bid-org-icon">
                  <Building2 size={21} />
                </div>
                <div>
                  <span>Executor Organization</span>
                  <strong>{organizationName}</strong>
                </div>
              </div>
            </section>

            {/* Timestamps */}
            <section className="bid-section">
              <div className="bid-section-title">
                <div className="bid-section-icon orange">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <h3>Timestamps</h3>
                  <p>Submission and system records</p>
                </div>
              </div>

              <div className="bid-info-grid">
                <div className="bid-info-card">
                  <span className="bid-info-label"><CalendarDays size={14} /> Submitted At</span>
                  <strong>{formatDate(vendor.submitted_at)}</strong>
                </div>

                <div className="bid-info-card">
                  <span className="bid-info-label"><Clock3 size={14} /> Created At</span>
                  <strong>{formatDate(vendor.createdAt || vendor.created_at)}</strong>
                </div>
              </div>
            </section>

            {/* Technical Proposal */}
            {technicalFile && (
              <section className="bid-section">
                <div className="bid-section-title">
                  <div className="bid-section-icon green">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3>Technical Proposal</h3>
                    <p>Submitted technical proposal document</p>
                  </div>
                </div>

                <div className="bid-document-card">
                  <div className="bid-document-left">
                    <div className="bid-document-icon">
                      {getFileExtension(technicalFile).includes("ppt") ? (
                        <Presentation size={21} />
                      ) : (
                        <FileText size={21} />
                      )}
                    </div>
                    <div>
                      <strong>Technical Proposal Document</strong>
                      <span>{fileName}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="bid-view-document"
                    onClick={() => handleOpenFile(technicalFile, fileName)}
                    disabled={previewLoading}
                    title="Preview File"
                  >
                    {previewLoading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                    {previewLoading ? "Loading..." : "View Document"}
                  </button>
                </div>

                {previewError && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#b91c1c",
                      fontSize: "13px",
                    }}
                  >
                    {previewError}
                  </div>
                )}
              </section>
            )}

            {/* Notes */}
            {vendor.notes && (
              <section className="bid-section">
                <div className="bid-section-title">
                  <div className="bid-section-icon yellow">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3>Notes</h3>
                    <p>Additional details from vendor</p>
                  </div>
                </div>

                <div className="bid-notes">
                  <MessageSquare size={17} />
                  <p>{vendor.notes}</p>
                </div>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="bid-modal-footer">
            <span>Bid information loaded from backend.</span>
            <button type="button" className="bid-close-footer-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      {/* FILE PREVIEW MODAL */}
      {(previewFile || previewLoading || previewError) && (
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
            background: "rgba(15, 23, 42, 0.72)",
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(1100px, 95vw)",
              height: "min(850px, 92vh)",
              display: "flex",
              flexDirection: "column",
              background: "#ffffff",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Header */}
            <div
              style={{
                minHeight: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "15px",
                padding: "0 20px",
                borderBottom: "1px solid #e5e7eb",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#172033",
                  fontSize: "15px",
                  fontWeight: 700,
                }}
              >
                {previewFile?.type === "presentation" ? (
                  <Presentation size={18} color="#2563eb" />
                ) : (
                  <FileText size={18} color="#2563eb" />
                )}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {previewFile?.name || "File Preview"}
                </span>
              </div>

              <button
                type="button"
                onClick={closeFilePreview}
                aria-label="Close preview"
                style={{
                  width: "38px",
                  height: "38px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  background: "#ffffff",
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
                alignItems: "center",
                justifyContent: "center",
                background: "#f8fafc",
              }}
            >
              {previewLoading && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#64748b", fontSize: "14px" }}>
                  <Loader2 size={32} className="animate-spin" />
                  <span>Loading secure file...</span>
                </div>
              )}

              {!previewLoading && previewError && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "30px", textAlign: "center" }}>
                  <AlertCircle size={34} color="#64748b" />
                  <h4 style={{ margin: 0, color: "#172033", fontSize: "18px" }}>Unable to Preview File</h4>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>{previewError}</p>
                  <button
                    type="button"
                    onClick={closeFilePreview}
                    style={{
                      marginTop: "8px",
                      padding: "9px 18px",
                      border: 0,
                      borderRadius: "9px",
                      background: "#2563eb",
                      color: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    Close
                  </button>
                </div>
              )}

              {/* PDF + PPTX/PPT Viewers inside iFrame */}
              {!previewLoading && !previewError && (previewFile?.type?.includes("pdf") || previewFile?.type === "presentation") && (
                <iframe
                  src={previewFile.url}
                  title={previewFile.name}
                  style={{ width: "100%", height: "100%", border: 0, background: "#ffffff" }}
                />
              )}

              {/* Images Viewer */}
              {!previewLoading && !previewError && previewFile?.type?.startsWith("image/") && (
                <div style={{ width: "100%", height: "100%", padding: "25px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto" }}>
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "8px" }}
                  />
                </div>
              )}

              {/* Unsupported Types Fallback */}
              {!previewLoading && !previewError && previewFile && !previewFile.type?.includes("pdf") && !previewFile.type?.startsWith("image/") && previewFile.type !== "presentation" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "30px", textAlign: "center" }}>
                  <FileText size={34} color="#64748b" />
                  <h4 style={{ margin: 0, color: "#172033", fontSize: "18px" }}>Preview Not Available</h4>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                    This file type cannot be previewed directly inside the application.
                  </p>
                  <a
                    href={previewFile.downloadUrl || previewFile.url}
                    download={previewFile.name}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "8px",
                      padding: "10px 16px",
                      border: 0,
                      borderRadius: "9px",
                      background: "#2563eb",
                      color: "#ffffff",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <Download size={16} />
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