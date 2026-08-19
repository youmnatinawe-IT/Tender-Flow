import { useEffect, useState } from "react";

import {
  X,
  FileText,
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
  Loader2,
  RefreshCw,
  AlertCircle,
  Eye,
  Download,
  Pencil,
  Save,
  RotateCcw,
  Tag,
} from "lucide-react";

import API from "../../services/api";
import {
  getTenderAttachments,
  updateTender,
} from "../../services/tenderService";

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
    number,
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
    diff / (1000 * 60 * 60 * 24),
  );
};

const getTenderId = (id) => {
  if (!id) return "N/A";

  return `#${id.slice(-6).toUpperCase()}`;
};

const getStatusClass = (status) => {
  const normalized =
    status
      ?.toLowerCase()
      .replace(/\s+/g, "-") || "unknown";

  return `drawer-status-badge drawer-status-${normalized}`;
};

const getTypeClass = (type) => {
  const normalized =
    type
      ?.toLowerCase()
      .replace(/\s+/g, "-") || "unknown";

  return `drawer-type-badge drawer-type-${normalized}`;
};

/* =========================================================
   Attachment Helpers
========================================================= */

const getAttachmentTypeLabel = (type) => {
  const labels = {
    TECHNICAL_CONDITIONS:
      "Technical Conditions",
    FINANCIAL_CONDITIONS:
      "Financial Conditions",
    ADMINISTRATIVE_CONDITIONS:
      "Administrative Conditions",
    QUANTITY_SCHEDULE:
      "Quantity Schedule",
    OTHER: "Other",
  };

  return labels[type] || type || "Other";
};

const getAttachmentTypeClass = (type) => {
  const normalized =
    type
      ?.toLowerCase()
      .replace(/_/g, "-") || "other";

  return `attachment-type attachment-type-${normalized}`;
};

const getAttachmentFileName = (filePath) => {
  if (!filePath) return "Attachment";

  const parts = filePath.split("/");

  return (
    parts[parts.length - 1] ||
    "Attachment"
  );
};
const getAttachmentExtension = (filePath) => {
  const fileName = getAttachmentFileName(filePath);

  if (!fileName.includes(".")) {
    return "";
  }

  return (
    "." +
    fileName
      .split(".")
      .pop()
      ?.toLowerCase()
  );
};
const getFileUrl = (filePath) => {
  if (!filePath) return null;

  // إذا الباك رجع URL كامل
  if (
    filePath.startsWith("http://") ||
    filePath.startsWith("https://")
  ) {
    return filePath;
  }

  const baseURL =
    API?.defaults?.baseURL ||
    import.meta.env.VITE_API_BASE_URL ||
    "";

  if (!baseURL) {
    console.error("Backend base URL is missing");
    return null;
  }

  const cleanBaseURL =
    baseURL.replace(/\/+$/, "");

  const cleanPath =
    filePath.replace(/^\/+/, "");

  return `${cleanBaseURL}/${cleanPath}`;
};
/* =========================================================
   Date Helpers For Edit Form
========================================================= */

const formatDateTimeLocal = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (
    Number.isNaN(parsedDate.getTime())
  ) {
    return "";
  }

  const year =
    parsedDate.getFullYear();

  const month = String(
    parsedDate.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    parsedDate.getDate(),
  ).padStart(2, "0");

  const hours = String(
    parsedDate.getHours(),
  ).padStart(2, "0");

  const minutes = String(
    parsedDate.getMinutes(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/* =========================================================
   Component
========================================================= */

export default function TenderDetailsDrawer({
  tender,
  onClose,
  onTenderUpdated,
}) {
  const [activeTab, setActiveTab] =
    useState("overview");

  /* =========================================================
     Attachments State
  ========================================================= */

  const [documents, setDocuments] =
    useState([]);

  const [documentsLoading, setDocumentsLoading] =
    useState(false);

  const [documentsError, setDocumentsError] =
    useState(null);

  /* =========================================================
     File Preview State
  ========================================================= */

  const [previewFile, setPreviewFile] =
    useState(null);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  const [previewError, setPreviewError] =
    useState(null);

  /* =========================================================
     Edit State
  ========================================================= */

  const [isEditMode, setIsEditMode] =
    useState(false);

  const [editLoading, setEditLoading] =
    useState(false);

  const [editError, setEditError] =
    useState(null);

  const [editSuccess, setEditSuccess] =
    useState(null);

  const [editForm, setEditForm] =
    useState({
      title: "",
      description: "",
      type: "",
      category: "",
      submission_start: "",
      submission_deadline: "",
      estimated_value: "",
      currency: "",
      execution_location: "",
    });

  /* =========================================================
     Is Draft?
  ========================================================= */

  const isDraft =
    tender?.status?.toUpperCase() ===
    "DRAFT";

  /* =========================================================
     Start Edit
  ========================================================= */

  const handleStartEdit = () => {
    if (!tender || !isDraft) {
      return;
    }

    setEditError(null);
    setEditSuccess(null);

    setEditForm({
      title: tender?.title || "",
      description:
        tender?.description || "",
      type: tender?.type || "",
      category:
        tender?.category || "",
      submission_start:
        formatDateTimeLocal(
          tender?.submission_start,
        ),
      submission_deadline:
        formatDateTimeLocal(
          tender?.submission_deadline,
        ),
      estimated_value:
        tender?.estimated_value ??
        "",
      currency:
        tender?.currency || "",
      execution_location:
        tender?.execution_location || "",
    });

    setIsEditMode(true);
  };

  /* =========================================================
     Cancel Edit
  ========================================================= */

  const handleCancelEdit = () => {
    if (editLoading) {
      return;
    }

    setIsEditMode(false);
    setEditError(null);
    setEditSuccess(null);
  };

  /* =========================================================
     Form Change
  ========================================================= */

  const handleEditChange = (event) => {
    const { name, value } =
      event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (editError) {
      setEditError(null);
    }

    if (editSuccess) {
      setEditSuccess(null);
    }
  };

  /* =========================================================
     Submit Edit
  ========================================================= */

  const handleSubmitEdit = async (
    event,
  ) => {
    event.preventDefault();

    if (!tender?._id) {
      setEditError(
        "Tender ID is missing.",
      );
      return;
    }

    if (!isDraft) {
      setEditError(
        "Only draft tenders can be edited.",
      );
      return;
    }

    /* =======================================================
       Basic Validation
    ======================================================= */

    if (!editForm.title.trim()) {
      setEditError(
        "Tender title is required.",
      );
      return;
    }

    if (
      editForm.submission_start &&
      editForm.submission_deadline
    ) {
      const start = new Date(
        editForm.submission_start,
      );

      const deadline = new Date(
        editForm.submission_deadline,
      );

      if (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(
          deadline.getTime(),
        ) &&
        deadline <= start
      ) {
        setEditError(
          "Submission deadline must be after submission start.",
        );
        return;
      }
    }

    try {
      setEditLoading(true);
      setEditError(null);
      setEditSuccess(null);

      /* =====================================================
         Prepare ONLY allowed backend fields
      ===================================================== */

      const payload = {
        title: editForm.title.trim(),

        description:
          editForm.description.trim(),

        type: editForm.type.trim(),

        category:
          editForm.category.trim(),

        submission_start:
          editForm.submission_start
            ? new Date(
                editForm.submission_start,
              ).toISOString()
            : null,

        submission_deadline:
          editForm.submission_deadline
            ? new Date(
                editForm.submission_deadline,
              ).toISOString()
            : null,

        estimated_value:
          editForm.estimated_value === ""
            ? null
            : Number(
                editForm.estimated_value,
              ),

        currency:
          editForm.currency.trim(),

        execution_location:
          editForm.execution_location.trim(),
      };

      console.log(
        "Submitting tender update:",
        payload,
      );

      const updatedTender =
        await updateTender(
          tender._id,
          payload,
        );

      /* =====================================================
         Merge backend response with current tender
      ===================================================== */

      const mergedTender = {
        ...tender,
        ...(updatedTender || {}),
        ...payload,
      };

      /* =====================================================
         Update Parent Table
      ===================================================== */

      if (
        typeof onTenderUpdated ===
        "function"
      ) {
        onTenderUpdated(
          mergedTender,
        );
      }

      setEditSuccess(
        "Tender information updated successfully.",
      );

      /* =====================================================
         Exit edit mode
      ===================================================== */

      setTimeout(() => {
        setIsEditMode(false);
        setEditSuccess(null);
      }, 900);
    } catch (error) {
      console.error(
        "Failed to update tender:",
        error,
      );

      const backendMessage =
        error?.response?.data?.message;

      const backendError =
        error?.response?.data?.error;

      const status =
        error?.response?.status;

      let message =
        backendMessage ||
        backendError ||
        error?.message ||
        "Unable to update tender.";

      if (status === 401) {
        message =
          "Your session has expired or you are not authorized to perform this action.";
      }

      if (status === 403) {
        message =
          "You do not have permission to edit this tender. The API requires a PUBLISHER account type.";
      }

      if (status === 404) {
        message =
          "Tender was not found.";
      }

      if (status === 400) {
        message =
          backendMessage ||
          "The submitted tender information is invalid.";
      }

      setEditError(message);
    } finally {
      setEditLoading(false);
    }
  };

  /* =========================================================
     File Preview
  ========================================================= */
const handleOpenFile = async (
  filePath,
  fileName,
) => {
  if (!filePath) return;

  try {
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewFile(null);

    const url = getFileUrl(filePath);

    if (!url) {
      throw new Error(
        "File URL is missing."
      );
    }

    const extension =
      getAttachmentExtension(filePath);

    let contentType =
      "application/octet-stream";

    if (extension === ".pdf") {
      contentType =
        "application/pdf";
    } else if (
      [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(
        extension
      )
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
        url,
        extension,
        contentType,
      }
    );

    setPreviewFile({
      url,
      name:
        fileName ||
        getAttachmentFileName(
          filePath
        ),
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
     File Download
  ========================================================= */
const handleDownloadFile = (
  filePath,
  fileName,
) => {
  if (!filePath) return;

  const url = getFileUrl(filePath);

  if (!url) {
    setPreviewError(
      "File URL is missing."
    );
    return;
  }

  const link =
    document.createElement("a");

  link.href = url;
  link.download =
    fileName ||
    getAttachmentFileName(filePath);

  link.target = "_blank";

  document.body.appendChild(link);

  link.click();

  link.remove();
};

  /* =========================================================
     Close Preview
  ========================================================= */
const closeFilePreview = () => {
  if (
    previewFile?.url &&
    previewFile?.isObjectUrl
  ) {
    URL.revokeObjectURL(
      previewFile.url
    );
  }

  setPreviewFile(null);
  setPreviewError(null);
  setPreviewLoading(false);
};

  /* =========================================================
     Preview Cleanup
  ========================================================= */

  useEffect(() => {
  return () => {
    if (
      previewFile?.url &&
      previewFile?.isObjectUrl
    ) {
      URL.revokeObjectURL(
        previewFile.url
      );
    }
  };
}, [
  previewFile?.url,
  previewFile?.isObjectUrl,
]);

  /* =========================================================
     Fetch Attachments
  ========================================================= */

  const fetchAttachments = async (
    tenderId,
  ) => {
    if (!tenderId) {
      setDocuments([]);
      return;
    }

    try {
      setDocumentsLoading(true);
      setDocumentsError(null);

      const attachments =
        await getTenderAttachments(
          tenderId,
        );

      setDocuments(
        Array.isArray(
          attachments,
        )
          ? attachments
          : [],
      );
    } catch (error) {
      console.error(
        "Failed to fetch tender attachments:",
        error,
      );

      setDocuments([]);

      setDocumentsError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load tender attachments.",
      );
    } finally {
      setDocumentsLoading(false);
    }
  };

  /* =========================================================
     Fetch When Tender Changes
  ========================================================= */

  useEffect(() => {
    if (!tender?._id) {
      setDocuments([]);
      setDocumentsError(null);
      return;
    }

    fetchAttachments(
      tender._id,
    );

    setIsEditMode(false);
    setEditError(null);
    setEditSuccess(null);
  }, [tender?._id]);

  /* =========================================================
     Empty
  ========================================================= */

  if (!tender) {
    return null;
  }

  const publisher =
    tender?.publisher_org_id || {};

  const daysLeft =
    getDaysLeft(
      tender?.submission_deadline,
    );

  const createdAt =
    tender?.createdAt;

  const updatedAt =
    tender?.updatedAt;

  /* =========================================================
     Render
  ========================================================= */

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
              {getTenderId(
                tender?._id,
              )}
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >

            {/* =================================================
                Edit Button - Draft Only
            ================================================= */}

            {isDraft &&
              !isEditMode && (
                <button
                  type="button"
                  onClick={
                    handleStartEdit
                  }
                  title="Edit Draft Tender"
                  style={{
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    gap: "7px",
                    height: "38px",
                    padding:
                      "0 13px",
                    border:
                      "1px solid #dbeafe",
                    borderRadius:
                      "10px",
                    background:
                      "#eff6ff",
                    color:
                      "#2563eb",
                    fontSize:
                      "13px",
                    fontWeight: 700,
                    cursor:
                      "pointer",
                  }}
                >
                  <Pencil
                    size={15}
                  />

                  Edit Tender
                </button>
              )}

            <button
              className="close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* =================================================
            Hero
        ================================================= */}

        <div className="drawer-hero">
          <div className="drawer-hero-main">

            <div className="drawer-id">
              <Hash size={14} />

              {getTenderId(
                tender?._id,
              )}
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
                tender?.status,
              )}
            >
              <span className="status-dot" />

              {tender?.status ||
                "N/A"}
            </span>

            <span
              className={getTypeClass(
                tender?.type,
              )}
            >
              {tender?.type ||
                "N/A"}
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

        {!isEditMode && (
          <div className="drawer-tabs">

            <button
              className={
                activeTab ===
                "overview"
                  ? "active-tab"
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  "overview",
                )
              }
            >
              <Info size={15} />

              Overview
            </button>

            <button
              className={
                activeTab ===
                "documents"
                  ? "active-tab"
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  "documents",
                )
              }
            >
              <FileText size={15} />

              Documents

              {documents.length >
                0 && (
                <span className="tab-count">
                  {documents.length}
                </span>
              )}
            </button>

            <button
              className={
                activeTab ===
                "timeline"
                  ? "active-tab"
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  "timeline",
                )
              }
            >
              <CalendarDays
                size={15}
              />

              Timeline
            </button>

          </div>
        )}

        {/* =================================================
            EDIT FORM
        ================================================= */}

        {isEditMode && (
          <div className="drawer-scroll">
            <div
              className="drawer-section"
              style={{
                paddingBottom:
                  "30px",
              }}
            >

              {/* Edit Header */}

              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">
                    DRAFT TENDER
                  </span>

                  <h3>
                    Edit Tender
                  </h3>
                </div>

                <span className="section-record">
                  {getTenderId(
                    tender?._id,
                  )}
                </span>
              </div>

              {/* Information Alert */}

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "flex-start",
                  gap: "10px",
                  marginBottom:
                    "22px",
                  padding:
                    "13px 15px",
                  border:
                    "1px solid #bfdbfe",
                  borderRadius:
                    "12px",
                  background:
                    "#eff6ff",
                  color:
                    "#1e40af",
                  fontSize:
                    "13px",
                  lineHeight:
                    "1.5",
                }}
              >
                <Info
                  size={17}
                  style={{
                    flexShrink: 0,
                    marginTop:
                      "1px",
                  }}
                />

                <span>
                  You can edit the
                  allowed tender
                  information while
                  the tender is in
                  <strong>
                    {" "}
                    DRAFT
                  </strong>{" "}
                  status.
                </span>
              </div>

              {/* Error */}

              {editError && (
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "flex-start",
                    gap: "10px",
                    marginBottom:
                      "18px",
                    padding:
                      "13px 15px",
                    border:
                      "1px solid #fecaca",
                    borderRadius:
                      "12px",
                    background:
                      "#fef2f2",
                    color:
                      "#b91c1c",
                    fontSize:
                      "13px",
                    lineHeight:
                      "1.5",
                  }}
                >
                  <AlertCircle
                    size={17}
                    style={{
                      flexShrink: 0,
                    }}
                  />

                  <span>
                    {editError}
                  </span>
                </div>
              )}

              {/* Success */}

              {editSuccess && (
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "10px",
                    marginBottom:
                      "18px",
                    padding:
                      "13px 15px",
                    border:
                      "1px solid #bbf7d0",
                    borderRadius:
                      "12px",
                    background:
                      "#f0fdf4",
                    color:
                      "#15803d",
                    fontSize:
                      "13px",
                    fontWeight:
                      600,
                  }}
                >
                  <CircleCheck
                    size={17}
                  />

                  {editSuccess}
                </div>
              )}

              <form
                onSubmit={
                  handleSubmitEdit
                }
              >

                {/* =================================================
                    Basic Information
                ================================================= */}

                <div
                  className="drawer-info-card"
                  style={{
                    marginBottom:
                      "18px",
                  }}
                >

                  <div className="info-card-title">
                    <div className="info-title-icon">
                      <FileText
                        size={17}
                      />
                    </div>

                    <div>
                      <span>
                        BASIC INFORMATION
                      </span>

                      <h4>
                        Tender Details
                      </h4>
                    </div>
                  </div>

                  {/* Title */}

                  <div
                    style={{
                      marginBottom:
                        "16px",
                    }}
                  >
                    <label
                      htmlFor="edit-title"
                      style={{
                        display:
                          "block",
                        marginBottom:
                          "7px",
                        fontSize:
                          "12px",
                        fontWeight:
                          700,
                        color:
                          "#475569",
                      }}
                    >
                      Tender Title
                      <span
                        style={{
                          color:
                            "#dc2626",
                        }}
                      >
                        {" "}
                        *
                      </span>
                    </label>

                    <input
                      id="edit-title"
                      name="title"
                      type="text"
                      value={
                        editForm.title
                      }
                      onChange={
                        handleEditChange
                      }
                      disabled={
                        editLoading
                      }
                      placeholder="Enter tender title"
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                        height:
                          "44px",
                        padding:
                          "0 13px",
                        border:
                          "1px solid #dbe2ea",
                        borderRadius:
                          "10px",
                        outline:
                          "none",
                        fontSize:
                          "14px",
                        color:
                          "#172033",
                        background:
                          "#ffffff",
                      }}
                    />
                  </div>

                  {/* Description */}

                  <div
                    style={{
                      marginBottom:
                        "16px",
                    }}
                  >
                    <label
                      htmlFor="edit-description"
                      style={{
                        display:
                          "block",
                        marginBottom:
                          "7px",
                        fontSize:
                          "12px",
                        fontWeight:
                          700,
                        color:
                          "#475569",
                      }}
                    >
                      Description
                    </label>

                    <textarea
                      id="edit-description"
                      name="description"
                      value={
                        editForm.description
                      }
                      onChange={
                        handleEditChange
                      }
                      disabled={
                        editLoading
                      }
                      rows={5}
                      placeholder="Enter tender description"
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                        padding:
                          "12px 13px",
                        border:
                          "1px solid #dbe2ea",
                        borderRadius:
                          "10px",
                        outline:
                          "none",
                        resize:
                          "vertical",
                        fontSize:
                          "14px",
                        lineHeight:
                          "1.5",
                        color:
                          "#172033",
                        background:
                          "#ffffff",
                      }}
                    />
                  </div>

                  {/* Type + Category */}

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap:
                        "15px",
                    }}
                  >

                    <div>
                      <label
                        htmlFor="edit-type"
                        style={{
                          display:
                            "block",
                          marginBottom:
                            "7px",
                          fontSize:
                            "12px",
                          fontWeight:
                            700,
                          color:
                            "#475569",
                        }}
                      >
                        Tender Type
                      </label>

                      <input
                        id="edit-type"
                        name="type"
                        type="text"
                        value={
                          editForm.type
                        }
                        onChange={
                          handleEditChange
                        }
                        disabled={
                          editLoading
                        }
                        placeholder="e.g. OPEN"
                        style={{
                          width:
                            "100%",
                          boxSizing:
                            "border-box",
                          height:
                            "44px",
                          padding:
                            "0 13px",
                          border:
                            "1px solid #dbe2ea",
                          borderRadius:
                            "10px",
                          outline:
                            "none",
                          fontSize:
                            "14px",
                          color:
                            "#172033",
                          background:
                            "#ffffff",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="edit-category"
                        style={{
                          display:
                            "block",
                          marginBottom:
                            "7px",
                          fontSize:
                            "12px",
                          fontWeight:
                            700,
                          color:
                            "#475569",
                        }}
                      >
                        Category
                      </label>

                      <div
                        style={{
                          position:
                            "relative",
                        }}
                      >
                        <Tag
                          size={16}
                          style={{
                            position:
                              "absolute",
                            left:
                              "13px",
                            top:
                              "14px",
                            color:
                              "#94a3b8",
                          }}
                        />

                        <input
                          id="edit-category"
                          name="category"
                          type="text"
                          value={
                            editForm.category
                          }
                          onChange={
                            handleEditChange
                          }
                          disabled={
                            editLoading
                          }
                          placeholder="Enter category"
                          style={{
                            width:
                              "100%",
                            boxSizing:
                              "border-box",
                            height:
                              "44px",
                            padding:
                              "0 13px 0 38px",
                            border:
                              "1px solid #dbe2ea",
                            borderRadius:
                              "10px",
                            outline:
                              "none",
                            fontSize:
                              "14px",
                            color:
                              "#172033",
                            background:
                              "#ffffff",
                          }}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* =================================================
                    Schedule
                ================================================= */}

                <div
                  className="drawer-info-card"
                  style={{
                    marginBottom:
                      "18px",
                  }}
                >

                  <div className="info-card-title">
                    <div className="info-title-icon">
                      <CalendarDays
                        size={17}
                      />
                    </div>

                    <div>
                      <span>
                        SCHEDULE
                      </span>

                      <h4>
                        Submission Period
                      </h4>
                    </div>
                  </div>

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap:
                        "15px",
                    }}
                  >

                    <div>
                      <label
                        htmlFor="edit-submission-start"
                        style={{
                          display:
                            "block",
                          marginBottom:
                            "7px",
                          fontSize:
                            "12px",
                          fontWeight:
                            700,
                          color:
                            "#475569",
                        }}
                      >
                        Submission Start
                      </label>

                      <input
                        id="edit-submission-start"
                        name="submission_start"
                        type="datetime-local"
                        value={
                          editForm.submission_start
                        }
                        onChange={
                          handleEditChange
                        }
                        disabled={
                          editLoading
                        }
                        style={{
                          width:
                            "100%",
                          boxSizing:
                            "border-box",
                          height:
                            "44px",
                          padding:
                            "0 12px",
                          border:
                            "1px solid #dbe2ea",
                          borderRadius:
                            "10px",
                          outline:
                            "none",
                          fontSize:
                            "13px",
                          color:
                            "#172033",
                          background:
                            "#ffffff",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="edit-submission-deadline"
                        style={{
                          display:
                            "block",
                          marginBottom:
                            "7px",
                          fontSize:
                            "12px",
                          fontWeight:
                            700,
                          color:
                            "#475569",
                        }}
                      >
                        Submission Deadline
                      </label>

                      <input
                        id="edit-submission-deadline"
                        name="submission_deadline"
                        type="datetime-local"
                        value={
                          editForm.submission_deadline
                        }
                        onChange={
                          handleEditChange
                        }
                        disabled={
                          editLoading
                        }
                        style={{
                          width:
                            "100%",
                          boxSizing:
                            "border-box",
                          height:
                            "44px",
                          padding:
                            "0 12px",
                          border:
                            "1px solid #dbe2ea",
                          borderRadius:
                            "10px",
                          outline:
                            "none",
                          fontSize:
                            "13px",
                          color:
                            "#172033",
                          background:
                            "#ffffff",
                        }}
                      />
                    </div>

                  </div>
                </div>

                {/* =================================================
                    Financial + Location
                ================================================= */}

                <div
                  className="drawer-info-card"
                  style={{
                    marginBottom:
                      "20px",
                  }}
                >

                  <div className="info-card-title">
                    <div className="info-title-icon">
                      <Wallet
                        size={17}
                      />
                    </div>

                    <div>
                      <span>
                        VALUE & LOCATION
                      </span>

                      <h4>
                        Tender Commercial Information
                      </h4>
                    </div>
                  </div>

                  {/* Value + Currency */}

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap:
                        "15px",
                      marginBottom:
                        "16px",
                    }}
                  >

                    <div>
                      <label
                        htmlFor="edit-estimated-value"
                        style={{
                          display:
                            "block",
                          marginBottom:
                            "7px",
                          fontSize:
                            "12px",
                          fontWeight:
                            700,
                          color:
                            "#475569",
                        }}
                      >
                        Estimated Value
                      </label>

                      <input
                        id="edit-estimated-value"
                        name="estimated_value"
                        type="number"
                        min="0"
                        step="any"
                        value={
                          editForm.estimated_value
                        }
                        onChange={
                          handleEditChange
                        }
                        disabled={
                          editLoading
                        }
                        placeholder="Enter estimated value"
                        style={{
                          width:
                            "100%",
                          boxSizing:
                            "border-box",
                          height:
                            "44px",
                          padding:
                            "0 13px",
                          border:
                            "1px solid #dbe2ea",
                          borderRadius:
                            "10px",
                          outline:
                            "none",
                          fontSize:
                            "14px",
                          color:
                            "#172033",
                          background:
                            "#ffffff",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="edit-currency"
                        style={{
                          display:
                            "block",
                          marginBottom:
                            "7px",
                          fontSize:
                            "12px",
                          fontWeight:
                            700,
                          color:
                            "#475569",
                        }}
                      >
                        Currency
                      </label>

                      <input
                        id="edit-currency"
                        name="currency"
                        type="text"
                        value={
                          editForm.currency
                        }
                        onChange={
                          handleEditChange
                        }
                        disabled={
                          editLoading
                        }
                        placeholder="e.g. USD"
                        style={{
                          width:
                            "100%",
                          boxSizing:
                            "border-box",
                          height:
                            "44px",
                          padding:
                            "0 13px",
                          border:
                            "1px solid #dbe2ea",
                          borderRadius:
                            "10px",
                          outline:
                            "none",
                          fontSize:
                            "14px",
                          color:
                            "#172033",
                          background:
                            "#ffffff",
                        }}
                      />
                    </div>

                  </div>

                  {/* Location */}

                  <div>
                    <label
                      htmlFor="edit-execution-location"
                      style={{
                        display:
                          "block",
                        marginBottom:
                          "7px",
                        fontSize:
                          "12px",
                        fontWeight:
                          700,
                        color:
                          "#475569",
                      }}
                    >
                      Execution Location
                    </label>

                    <div
                      style={{
                        position:
                          "relative",
                      }}
                    >
                      <MapPin
                        size={17}
                        style={{
                          position:
                            "absolute",
                          left:
                            "13px",
                          top:
                            "13px",
                          color:
                            "#94a3b8",
                        }}
                      />

                      <input
                        id="edit-execution-location"
                        name="execution_location"
                        type="text"
                        value={
                          editForm.execution_location
                        }
                        onChange={
                          handleEditChange
                        }
                        disabled={
                          editLoading
                        }
                        placeholder="Enter execution location"
                        style={{
                          width:
                            "100%",
                          boxSizing:
                            "border-box",
                          height:
                            "44px",
                          padding:
                            "0 13px 0 40px",
                          border:
                            "1px solid #dbe2ea",
                          borderRadius:
                            "10px",
                          outline:
                            "none",
                          fontSize:
                            "14px",
                          color:
                            "#172033",
                          background:
                            "#ffffff",
                        }}
                      />
                    </div>
                  </div>

                </div>

                {/* =================================================
                    Actions
                ================================================= */}

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "flex-end",
                    gap:
                      "10px",
                    paddingTop:
                      "5px",
                  }}
                >

                  <button
                    type="button"
                    onClick={
                      handleCancelEdit
                    }
                    disabled={
                      editLoading
                    }
                    style={{
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap:
                        "7px",
                      height:
                        "44px",
                      padding:
                        "0 17px",
                      border:
                        "1px solid #e2e8f0",
                      borderRadius:
                        "10px",
                      background:
                        "#ffffff",
                      color:
                        "#475569",
                      fontSize:
                        "13px",
                      fontWeight:
                        700,
                      cursor:
                        editLoading
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        editLoading
                          ? 0.6
                          : 1,
                    }}
                  >
                    <RotateCcw
                      size={15}
                    />

                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      editLoading
                    }
                    style={{
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap:
                        "8px",
                      height:
                        "44px",
                      padding:
                        "0 20px",
                      border:
                        "1px solid #2563eb",
                      borderRadius:
                        "10px",
                      background:
                        "#2563eb",
                      color:
                        "#ffffff",
                      fontSize:
                        "13px",
                      fontWeight:
                        700,
                      cursor:
                        editLoading
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        editLoading
                          ? 0.75
                          : 1,
                      boxShadow:
                        "0 5px 14px rgba(37, 99, 235, 0.18)",
                    }}
                  >

                    {editLoading ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />

                        Saving...
                      </>
                    ) : (
                      <>
                        <Save
                          size={16}
                        />

                        Save Changes
                      </>
                    )}

                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

        {/* =================================================
            OVERVIEW
        ================================================= */}

        {!isEditMode &&
          activeTab ===
            "overview" && (
            <div className="drawer-scroll">
              <div className="drawer-section">

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
                      tender?._id,
                    )}
                  </span>
                </div>

                {/* Stats */}

                <div className="overview-grid">

                  <div className="overview-card">
                    <div className="overview-card-icon blue">
                      <Wallet
                        size={19}
                      />
                    </div>

                    <div>
                      <span>
                        Estimated Value
                      </span>

                      <strong>
                        {formatBudget(
                          tender?.estimated_value,
                          tender?.currency,
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="overview-card">
                    <div className="overview-card-icon purple">
                      <CalendarDays
                        size={19}
                      />
                    </div>

                    <div>
                      <span>
                        Submission Deadline
                      </span>

                      <strong>
                        {formatDate(
                          tender?.submission_deadline,
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="overview-card">
                    <div className="overview-card-icon green">
                      <MapPin
                        size={19}
                      />
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

                {/* Description */}

                <div className="drawer-info-card description-card">

                  <div className="info-card-title">
                    <div className="info-title-icon">
                      <FileText
                        size={17}
                      />
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

                {/* Tender Details */}

                <div className="drawer-info-card">

                  <div className="info-card-title">
                    <div className="info-title-icon">
                      <ShieldCheck
                        size={17}
                      />
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
                        Category
                      </span>

                      <strong>
                        {tender?.category ||
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
                          tender?.currency,
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
                          tender?.submission_start,
                        )}
                      </strong>
                    </div>

                    <div className="information-item">
                      <span>
                        Submission Deadline
                      </span>

                      <strong>
                        {formatDateTime(
                          tender?.submission_deadline,
                        )}
                      </strong>
                    </div>

                  </div>
                </div>

                {/* Publisher */}

                <div className="drawer-info-card">

                  <div className="info-card-title">
                    <div className="info-title-icon">
                      <Building2
                        size={17}
                      />
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

                  <div className="publisher-details-header">

                    <div className="publisher-avatar">
                      <Building2
                        size={23}
                      />
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
                      <BadgeCheck
                        size={16}
                      />

                      Verified Organization
                    </div>

                  </div>

                  <div className="information-grid publisher-grid">

                    <div className="information-item">
                      <div className="info-label-with-icon">
                        <Mail
                          size={14}
                        />

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
                        <Phone
                          size={14}
                        />

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
                        <MapPin
                          size={14}
                        />

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
                        <Globe2
                          size={14}
                        />

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
                        <Landmark
                          size={14}
                        />

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
                        <FileCheck2
                          size={14}
                        />

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
                          publisher?.commercial_register_date,
                        )}
                      </strong>
                    </div>

                    <div className="information-item">
                      <span>
                        License Date
                      </span>

                      <strong>
                        {formatDate(
                          publisher?.license_date,
                        )}
                      </strong>
                    </div>

                  </div>
                </div>

                {/* System Information */}

                <div className="drawer-info-card">

                  <div className="info-card-title">
                    <div className="info-title-icon">
                      <CalendarDays
                        size={17}
                      />
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
                          createdAt,
                        )}
                      </strong>
                    </div>

                    <div className="information-item">
                      <span>
                        Last Updated
                      </span>

                      <strong>
                        {formatDateTime(
                          updatedAt,
                        )}
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

        {!isEditMode &&
          activeTab ===
            "documents" && (
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

                  {documents.length >
                    0 && (
                    <span className="section-record">
                      {documents.length}{" "}
                      {documents.length ===
                      1
                        ? "File"
                        : "Files"}
                    </span>
                  )}
                </div>

                {documentsLoading && (
                  <div className="empty-documents">
                    <div className="empty-documents-icon">
                      <Loader2
                        size={30}
                        className="animate-spin"
                      />
                    </div>

                    <h4>
                      Loading Attachments
                    </h4>

                    <p>
                      Please wait while tender
                      attachments are being
                      loaded.
                    </p>
                  </div>
                )}

                {!documentsLoading &&
                  documentsError && (
                    <div className="empty-documents">
                      <div className="empty-documents-icon">
                        <AlertCircle
                          size={30}
                        />
                      </div>

                      <h4>
                        Unable to Load
                        Attachments
                      </h4>

                      <p>
                        {documentsError}
                      </p>

                      <button
                        type="button"
                        className="tender-refresh-btn"
                        onClick={() =>
                          fetchAttachments(
                            tender?._id,
                          )
                        }
                      >
                        <RefreshCw
                          size={15}
                        />

                        Try Again
                      </button>
                    </div>
                  )}

                {!documentsLoading &&
                  !documentsError &&
                  documents.length ===
                    0 && (
                    <div className="empty-documents">
                      <div className="empty-documents-icon">
                        <FileText
                          size={30}
                        />
                      </div>

                      <h4>
                        No Attachments
                        Available
                      </h4>

                      <p>
                        This tender does
                        not have any
                        attachments.
                      </p>
                    </div>
                  )}

                {!documentsLoading &&
                  !documentsError &&
                  documents.length >
                    0 && (
                    <div className="documents-grid">

                      {documents.map(
                        (
                          doc,
                          index,
                        ) => {
                          const documentName =
                            doc?.name ||
                            `Attachment ${
                              index + 1
                            }`;

                          const documentType =
                            doc?.type;

                          const description =
                            doc?.description;

                          const filePath =
                            doc?.file_path;

                          const fileName =
                            getAttachmentFileName(
                              filePath,
                            );

                          const extension =
                            getAttachmentExtension(
                              filePath,
                            );

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
                                    size={
                                      21
                                    }
                                  />
                                </div>

                                <div className="doc-content">

                                  <span className="doc-name">
                                    {
                                      documentName
                                    }
                                  </span>

                                  {documentType && (
                                    <span
                                      className={getAttachmentTypeClass(
                                        documentType,
                                      )}
                                    >
                                      {getAttachmentTypeLabel(
                                        documentType,
                                      )}
                                    </span>
                                  )}

                                  {description && (
                                    <small>
                                      {
                                        description
                                      }
                                    </small>
                                  )}

                                  <small>
                                    {
                                      fileName
                                    }
                                  </small>

                                  <small>
                                    {
                                      extension
                                    }
                                  </small>

                                </div>
                              </div>

                              <div className="doc-actions">

                                {filePath && (
                                  <>
                                    <button
                                      type="button"
                                      title="Preview File"
                                      onClick={() =>
                                        handleOpenFile(
                                          filePath,
                                          fileName,
                                        )
                                      }
                                      disabled={
                                        previewLoading
                                      }
                                    >
                                      <Eye
                                        size={
                                          15
                                        }
                                      />
                                    </button>

                                    <button
                                      type="button"
                                      title="Download File"
                                      onClick={() =>
                                        handleDownloadFile(
                                          filePath,
                                          fileName,
                                        )
                                      }
                                    >
                                      <Download
                                        size={
                                          15
                                        }
                                      />
                                    </button>
                                  </>
                                )}

                              </div>
                            </div>
                          );
                        },
                      )}

                    </div>
                  )}

              </div>
            </div>
          )}

        {/* =================================================
            TIMELINE
        ================================================= */}

        {!isEditMode &&
          activeTab ===
            "timeline" && (
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

                  <div className="real-timeline-item completed">
                    <div className="timeline-dot">
                      <CircleCheck
                        size={14}
                      />
                    </div>

                    <div className="timeline-content">
                      <div className="timeline-title-row">
                        <h4>
                          Tender Created
                        </h4>

                        <span>
                          {formatDateTime(
                            tender?.createdAt,
                          )}
                        </span>
                      </div>

                      <p>
                        The tender was
                        created and
                        registered in the
                        system.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`real-timeline-item ${
                      new Date() >=
                      new Date(
                        tender?.submission_start,
                      )
                        ? "completed"
                        : ""
                    }`}
                  >
                    <div className="timeline-dot">
                      <CalendarDays
                        size={14}
                      />
                    </div>

                    <div className="timeline-content">
                      <div className="timeline-title-row">
                        <h4>
                          Submission
                          Starts
                        </h4>

                        <span>
                          {formatDateTime(
                            tender?.submission_start,
                          )}
                        </span>
                      </div>

                      <p>
                        Bid submissions
                        become
                        available from
                        this date.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`real-timeline-item ${
                      daysLeft ===
                      0
                        ? "completed"
                        : ""
                    }`}
                  >
                    <div className="timeline-dot">
                      <Clock3
                        size={14}
                      />
                    </div>

                    <div className="timeline-content">
                      <div className="timeline-title-row">
                        <h4>
                          Submission
                          Deadline
                        </h4>

                        <span>
                          {formatDateTime(
                            tender?.submission_deadline,
                          )}
                        </span>
                      </div>

                      <p>
                        Final deadline
                        for submitting
                        bids.
                      </p>
                    </div>
                  </div>

                  <div className="real-timeline-item">
                    <div className="timeline-dot">
                      <CalendarDays
                        size={14}
                      />
                    </div>

                    <div className="timeline-content">
                      <div className="timeline-title-row">
                        <h4>
                          Last Updated
                        </h4>

                        <span>
                          {formatDateTime(
                            tender?.updatedAt,
                          )}
                        </span>
                      </div>

                      <p>
                        Latest update
                        recorded by
                        the system.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

      </div>

      {/* =====================================================
          FILE PREVIEW MODAL
      ===================================================== */}

      {(previewFile ||
        previewLoading ||
        previewError) && (
        <div
          onClick={
            closeFilePreview
          }
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
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
              width:
                "min(1100px, 95vw)",
              height:
                "min(850px, 92vh)",
              display:
                "flex",
              flexDirection:
                "column",
              background:
                "#ffffff",
              borderRadius:
                "18px",
              overflow:
                "hidden",
              boxShadow:
                "0 25px 60px rgba(0, 0, 0, 0.25)",
            }}
          >

            <div
              style={{
                minHeight:
                  "64px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: "15px",
                padding:
                  "0 20px",
                borderBottom:
                  "1px solid #e5e7eb",
                background:
                  "#ffffff",
              }}
            >

              <div
                style={{
                  minWidth: 0,
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                  color:
                    "#172033",
                  fontSize:
                    "15px",
                  fontWeight:
                    700,
                }}
              >
                <FileText
                  size={18}
                  color="#2563eb"
                />

                <span
                  style={{
                    overflow:
                      "hidden",
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
                  width:
                    "38px",
                  height:
                    "38px",
                  flexShrink:
                    0,
                  display:
                    "flex",
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
                  color:
                    "#64748b",
                  cursor:
                    "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 0,
                display:
                  "flex",
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
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    alignItems:
                      "center",
                    gap:
                      "12px",
                    color:
                      "#64748b",
                    fontSize:
                      "14px",
                  }}
                >
                  <Loader2
                    size={32}
                    className="animate-spin"
                  />

                  <span>
                    Loading file...
                  </span>
                </div>
              )}

              {!previewLoading &&
                previewError && (
                  <div
                    style={{
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap:
                        "10px",
                      padding:
                        "30px",
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
                      Unable to
                      Preview File
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
                      {
                        previewError
                      }
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
                previewFile?.type?.includes(
                  "pdf",
                ) && (
                  <iframe
                    src={
                      previewFile.url
                    }
                    title={
                      previewFile.name
                    }
                    style={{
                      width:
                        "100%",
                      height:
                        "100%",
                      border: 0,
                      background:
                        "#ffffff",
                    }}
                  />
                )}

              {!previewLoading &&
                !previewError &&
                previewFile?.type?.startsWith(
                  "image/",
                ) && (
                  <div
                    style={{
                      width:
                        "100%",
                      height:
                        "100%",
                      padding:
                        "25px",
                      display:
                        "flex",
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
                  "pdf",
                ) &&
                !previewFile.type?.startsWith(
                  "image/",
                ) && (
                  <div
                    style={{
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap:
                        "10px",
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
                      Preview Not
                      Available
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
                      This file type
                      cannot be
                      previewed directly
                      inside the
                      application.
                    </p>

                    <a
                      href={
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
                        gap:
                          "8px",
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