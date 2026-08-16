import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  AlertCircle,
  Phone,
  Mail,
  FileCheck,
  UserPlus,
  ShieldAlert,
  Loader2,
  Users,
  FileText,
  Image as ImageIcon,
  X,
  FileCode,
  Calendar,
  Building,
  ExternalLink,
  AtSign,
  FileSignature,
  MapPin,
  Eye,
  Download,
  BriefcaseBusiness,
  Clock3,
  FileImage,
  Check,
  Ban,
  UserCheck,
  UserX,
} from "lucide-react";

import CreateAdminModal from "./CreateAdminModal";
import UserDetails from "../Users/UserDatails";

import {
  getOrgById,
  getOrgUsers,
} from "../../services/organizationService";

import API from "../../services/api";
import "./style/organization-details-premium.css";

/* =========================================================
   DATA NORMALIZATION
========================================================= */

const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "bmp",
  "avif",
  "ico",
];

/* =========================================================
   HELPERS
========================================================= */

function pickString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "N/A";
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString();
}

/* =========================================================
   FILE URL
========================================================= */

function resolveFileUrl(item) {
  if (!item) return "";

  let rawUrl = "";

  if (typeof item === "string") {
    rawUrl = item;
  } else if (typeof item === "object") {
    rawUrl =
      item.url ||
      item.path ||
      item.secure_url ||
      item.file_url ||
      item.cloudinary_url ||
      item.src ||
      item.file ||
      item.preview ||
      item.filePath ||
      item.file_path ||
      "";
  }

  if (!rawUrl) return "";

  rawUrl = String(rawUrl).replace(/\\/g, "/");

  if (!/^https?:\/\//i.test(rawUrl)) {
    const cleanPath = rawUrl.startsWith("/")
      ? rawUrl
      : `/${rawUrl}`;

    const baseUrl = String(
      API.defaults.baseURL || "",
    ).replace(/\/$/, "");

    rawUrl = `${baseUrl}${cleanPath}`;
  }

  if (
    rawUrl.includes("ngrok-free.dev") &&
    !rawUrl.includes("ngrok-skip-browser-warning")
  ) {
    const separator = rawUrl.includes("?")
      ? "&"
      : "?";

    rawUrl = `${rawUrl}${separator}ngrok-skip-browser-warning=1`;
  }

  return rawUrl;
}

/* =========================================================
   FILE NAME
========================================================= */

function resolveFileName(item, fallback) {
  if (typeof item === "string") {
    return fallback;
  }

  if (item && typeof item === "object") {
    return (
      item.name ||
      item.originalName ||
      item.original_name ||
      item.filename ||
      item.file_name ||
      item.title ||
      fallback
    );
  }

  return fallback;
}

/* =========================================================
   FILE EXTENSION
========================================================= */

function getExtension(url = "", item = null) {
  const itemType =
    item?.ext ||
    item?.extension ||
    item?.file_type ||
    item?.mime_type ||
    item?.mimetype ||
    "";

  if (itemType) {
    const normalized = String(itemType).toLowerCase();

    if (normalized.includes("/")) {
      return normalized.split("/").pop();
    }

    return normalized.replace(".", "");
  }

  if (!url || typeof url !== "string") {
    return "";
  }

  if (url.startsWith("data:image/")) {
    const mime = url.split(";")[0].split(":")[1];

    return mime
      ? mime.split("/")[1]
      : "png";
  }

  try {
    const cleanUrl = url
      .split("?")[0]
      .split("#")[0];

    const parts = cleanUrl.split("/");
    const filename = parts.pop() || "";

    if (filename.includes(".")) {
      const ext = filename
        .split(".")
        .pop()
        .toLowerCase();

      if (
        ext.length <= 5 &&
        /^[a-z0-9]+$/i.test(ext)
      ) {
        return ext;
      }
    }
  } catch (error) {
    console.error(
      "Error parsing extension:",
      error,
    );
  }

  return "";
}

function isImageExtension(ext) {
  return IMAGE_EXTENSIONS.includes(
    String(ext || "").toLowerCase(),
  );
}

/* =========================================================
   STATUS
========================================================= */

function normalizeStatus(status) {
  return String(status || "Pending")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function prettyStatus(status) {
  const value = String(
    status || "Pending",
  ).trim();

  if (!value) {
    return "Pending";
  }

  return value
    .toLowerCase()
    .split(/[\s_-]+/)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

/* =========================================================
   DOCUMENT TITLE
========================================================= */

function normalizeDocumentTitle(
  name = "",
  sourceKey = "",
) {
  const source =
    `${sourceKey} ${name}`.toLowerCase();

  if (
    source.includes("commercial") ||
    source.includes("register") ||
    source.includes("trade")
  ) {
    return "Commercial Register";
  }

  if (
    source.includes("tax") ||
    source.includes("fiscal") ||
    source.includes("certificate")
  ) {
    return "Tax Certificate";
  }

  if (
    source.includes("license") ||
    source.includes("licence")
  ) {
    return "License Document";
  }

  if (
    source.includes("identity") ||
    source.includes("id_card") ||
    source.includes("id-card") ||
    source.includes("national")
  ) {
    return "Identity Document";
  }

  return name || "Organization Attachment";
}

/* =========================================================
   COLLECT DOCUMENTS
========================================================= */

function collectDocuments(data) {
  const sources = [];

  const pushItem = (
    value,
    sourceKey,
  ) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        sources.push({
          item,
          sourceKey,
        });
      });
    } else if (value) {
      sources.push({
        item: value,
        sourceKey,
      });
    }
  };

  [
    "documents",
    "attachments",
    "files",
    "docs",
  ].forEach((key) => {
    pushItem(data?.[key], key);
  });

  [
    "commercial_register_doc",
    "tax_certificate",
    "license_file",
    "attachment",
    "document",
    "commercial_register",
    "license",
  ].forEach((key) => {
    pushItem(data?.[key], key);
  });

  const seen = new Set();
  const documents = [];

  sources.forEach(
    ({ item, sourceKey }) => {
      const url = resolveFileUrl(item);

      if (!url || seen.has(url)) {
        return;
      }

      seen.add(url);

      const name = resolveFileName(
        item,
        normalizeDocumentTitle(
          "",
          sourceKey,
        ) ||
          `Attachment #${
            documents.length + 1
          }`,
      );

      const ext = getExtension(
        url,
        item,
      );

      documents.push({
        id: `${sourceKey}-${documents.length}`,
        url,
        name,
        title:
          normalizeDocumentTitle(
            name,
            sourceKey,
          ),
        ext,
        sourceKey,
        isImage:
          isImageExtension(ext),
      });
    },
  );

  const priority = {
    "commercial-register": 1,
    "tax-certificate": 2,
    "license-document": 3,
    "identity-document": 4,
    "organization-attachment": 5,
  };

  documents.sort((a, b) => {
    const aKey =
      normalizeDocumentTitle(
        a.name,
        a.sourceKey,
      )
        .toLowerCase()
        .replace(/\s+/g, "-");

    const bKey =
      normalizeDocumentTitle(
        b.name,
        b.sourceKey,
      )
        .toLowerCase()
        .replace(/\s+/g, "-");

    return (
      (priority[aKey] || 99) -
      (priority[bKey] || 99)
    );
  });

  return documents;
}

/* =========================================================
   ACCOUNT NORMALIZATION
========================================================= */

function normalizeAccount(account) {
  if (!account) {
    return null;
  }

  const firstName = pickString(
    account?.f_name,
    account?.first_name,
    account?.firstName,
    "",
  );

  const lastName = pickString(
    account?.l_name,
    account?.last_name,
    account?.lastName,
    "",
  );

  const fullName =
    [firstName, lastName]
      .filter(
        (value) =>
          value && value !== "N/A",
      )
      .join(" ")
      .trim() ||
    account?.full_name ||
    account?.fullName ||
    account?.username ||
    "Account Member";

  let status = "PENDING";

  if (
    typeof account?.status ===
      "string" &&
    account.status.trim()
  ) {
    status =
      account.status
        .trim()
        .toUpperCase();
  } else if (
    account?.is_active === true
  ) {
    status = "ACTIVE";
  } else if (
    account?.is_active === false
  ) {
    status = "BANNED";
  }

  const id =
    account?._id ||
    account?.id ||
    account?.user_id ||
    account?.userId;

  return {
    ...account,

    id,

    name: fullName,

    username:
      account?.username || "",

    email: pickString(
      account?.email,
      "No Email",
    ),

    phone: pickString(
      account?.phone,
      account?.phone_number,
      "N/A",
    ),

    role: pickString(
      account?.role,
      account?.type,
      "N/A",
    ),

    status,
  };
}

/* =========================================================
   NORMALIZE ACCOUNTS
========================================================= */

function normalizeAccounts(
  data,
  usersRes,
) {
  let list = [];

  if (usersRes?.success) {
    const raw = usersRes.data;

    if (Array.isArray(raw)) {
      list = raw;
    } else if (
      Array.isArray(raw?.users)
    ) {
      list = raw.users;
    } else if (
      Array.isArray(raw?.data)
    ) {
      list = raw.data;
    } else if (
      Array.isArray(raw?.accounts)
    ) {
      list = raw.accounts;
    } else if (
      Array.isArray(raw?.result)
    ) {
      list = raw.result;
    }
  }

  const admin =
    data?.adminUser ||
    data?.admin ||
    null;

  if (admin) {
    const adminId =
      admin?._id ||
      admin?.id ||
      admin?.user_id ||
      admin?.userId;

    const exists = list.some(
      (user) => {
        const userId =
          user?._id ||
          user?.id ||
          user?.user_id ||
          user?.userId;

        return (
          adminId &&
          userId &&
          String(userId) ===
            String(adminId)
        );
      },
    );

    if (!exists) {
      list = [
        admin,
        ...list,
      ];
    }
  }

  return list
    .map(normalizeAccount)
    .filter(Boolean);
}

/* =========================================================
   LOGO
========================================================= */

function resolveLogo(data) {
  return (
    resolveFileUrl(data?.logo) ||
    resolveFileUrl(data?.avatar) ||
    resolveFileUrl(
      data?.image_url,
    ) ||
    resolveFileUrl(data?.image) ||
    ""
  );
}

/* =========================================================
   ORGANIZATION VIEW
========================================================= */

function buildOrgView(
  data,
  usersRes,
  id,
) {
  const accounts =
    normalizeAccounts(
      data,
      usersRes,
    );

  return {
    id:
      data?._id ||
      data?.id ||
      id,

    name: pickString(
      data?.org_name,
      data?.name,
      "N/A",
    ),

    taxNumber: pickString(
      data?.commercial_register_num,
      data?.taxNumber,
      data?.tax_number,
      "N/A",
    ),

    commercialRegisterDate:
      formatDate(
        data?.commercial_register_date ||
          data?.commercialRegisterDate ||
          data?.registration_date,
      ),

    licenseNum: pickString(
      data?.license_num,
      data?.license_number,
      "N/A",
    ),

    licenseDate: formatDate(
      data?.license_date ||
        data?.licenseDate,
    ),

    email: pickString(
      data?.email,
      "N/A",
    ),

    phone: pickString(
      data?.phone_number,
      data?.phone,
      "N/A",
    ),

    address: pickString(
      data?.address,
      data?.location,
      "N/A",
    ),

    website: pickString(
      data?.website,
      "N/A",
    ),

    status: pickString(
      data?.status,
      "Pending",
    ),

    createdAt: formatDate(
      data?.createdAt ||
        data?.created_at,
    ),

    documents:
      collectDocuments(data),

    logo: resolveLogo(data),

    accounts,

    hasAccounts:
      accounts.length > 0 ||
      Boolean(
        data?.has_admin ||
          data?.hasAdmin ||
          data?.adminUser,
      ),
  };
}

/* =========================================================
   FETCH ORGANIZATION
========================================================= */

async function fetchOrgView(id) {
  const [
    res,
    usersRes,
  ] = await Promise.all([
    getOrgById(id),
    getOrgUsers(id),
  ]);

  if (!res?.success) {
    throw new Error(
      res?.error?.message ||
        "Failed to fetch organization details.",
    );
  }

  const data =
    res?.data?.organization ||
    res?.data?.data ||
    res?.data ||
    {};

  return {
    data,
    view: buildOrgView(
      data,
      usersRes,
      id,
    ),
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function OrganizationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* =====================================================
     ORGANIZATION STATES
  ===================================================== */

  const [
    isCreateAdminOpen,
    setIsCreateAdminOpen,
  ] = useState(false);

  const [
    orgData,
    setOrgData,
  ] = useState(null);

  const [
    ,
    setRawOrg,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =====================================================
     DOCUMENT STATES
  ===================================================== */

  const [
    selectedDocument,
    setSelectedDocument,
  ] = useState(null);

  /* =====================================================
     ACCOUNT DETAILS STATES
  ===================================================== */

  const [
    selectedAccount,
    setSelectedAccount,
  ] = useState(null);

  const [
    showAccountDetails,
    setShowAccountDetails,
  ] = useState(false);

  /* =====================================================
     ACCOUNT STATUS STATES
  ===================================================== */

  const [
    accountUpdatingId,
    setAccountUpdatingId,
  ] = useState(null);

  const [
    accountActionError,
    setAccountActionError,
  ] = useState("");

  const [
    accountActionSuccess,
    setAccountActionSuccess,
  ] = useState("");

  /* =====================================================
     REFRESH
  ===================================================== */

  const refreshDetails =
    async () => {
      try {
        const {
          data,
          view,
        } = await fetchOrgView(id);

        setRawOrg(data);
        setOrgData(view);
        setError("");
      } catch (err) {
        console.error(
          "Error loading org:",
          err,
        );

        setError(
          err?.message ||
            "An error occurred while loading organization data.",
        );
      }
    };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const {
          data,
          view,
        } = await fetchOrgView(id);

        if (cancelled) return;

        setRawOrg(data);
        setOrgData(view);
        setError("");
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Error loading org:",
          err,
        );

        setError(
          err?.message ||
            "An error occurred while loading organization data.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* =====================================================
     ESCAPE
  ===================================================== */

  useEffect(() => {
    const handleEscape =
      (event) => {
        if (
          event.key !==
          "Escape"
        ) {
          return;
        }

        if (selectedDocument) {
          setSelectedDocument(
            null,
          );
          return;
        }

        if (showAccountDetails) {
          setShowAccountDetails(
            false,
          );
          setSelectedAccount(
            null,
          );
        }
      };

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [
    selectedDocument,
    showAccountDetails,
  ]);

  /* =====================================================
     VIEW ACCOUNT DETAILS
  ===================================================== */

  const handleViewAccount = (
    account,
  ) => {
    const accountId =
      account?.id ||
      account?._id ||
      account?.user_id ||
      account?.userId;

    console.log(
      "Opening account details:",
      {
        account,
        accountId,
      },
    );

    if (!accountId) {
      console.error(
        "Cannot open user details: account ID is missing.",
        account,
      );

      setAccountActionError(
        "Cannot open account details because the account ID is missing.",
      );

      return;
    }

    setSelectedAccount({
      ...account,
      id: accountId,
    });

    setShowAccountDetails(
      true,
    );
  };

  /* =====================================================
     CLOSE ACCOUNT DETAILS
  ===================================================== */

  const closeAccountDetails =
    () => {
      setShowAccountDetails(
        false,
      );
      setSelectedAccount(null);
    };

  /* =====================================================
     ACCOUNT STATUS CONTROL
  ===================================================== */

  const handleAccountStatusChange =
    async (
      account,
      newStatus,
    ) => {
      const accountId =
        account?.id ||
        account?._id ||
        account?.user_id ||
        account?.userId;

      if (!accountId) {
        setAccountActionError(
          "Cannot update this account because the account ID is missing.",
        );
        return;
      }

      if (accountUpdatingId) {
        return;
      }

      const statusLabels = {
        ACTIVE: "activate",
        BANNED: "block",
        REJECTED: "reject",
        PENDING: "set to pending",
      };

      const actionText =
        statusLabels[newStatus] ||
        "update";

      const confirmed =
        window.confirm(
          `Are you sure you want to ${actionText} this account?`,
        );

      if (!confirmed) {
        return;
      }

      try {
        setAccountUpdatingId(
          accountId,
        );

        setAccountActionError(
          "",
        );

        setAccountActionSuccess(
          "",
        );

        /*
         * PUT /api/users/{id}
         */
        const response =
          await API.put(
            `/api/users/${accountId}`,
            {
              status: newStatus,
            },
          );

        console.log(
          "Account status updated:",
          response?.data,
        );

        setAccountActionSuccess(
          `Account status changed to ${prettyStatus(
            newStatus,
          )}.`,
        );

        /*
         * Refresh organization
         * and accounts
         */
        await refreshDetails();

        /*
         * Update selected account
         * inside details modal too
         */
        setSelectedAccount(
          (previous) =>
            previous
              ? {
                  ...previous,
                  status:
                    newStatus,
                }
              : previous,
        );

        setTimeout(() => {
          setAccountActionSuccess(
            "",
          );
        }, 3000);
      } catch (error) {
        console.error(
          "Failed to update account status:",
          error,
        );

        const message =
          error?.response?.data
            ?.message ||
          error?.response?.data
            ?.error?.message ||
          error?.response?.data
            ?.error ||
          error?.message ||
          "Failed to update account status.";

        setAccountActionError(
          message,
        );
      } finally {
        setAccountUpdatingId(
          null,
        );
      }
    };

  /* =====================================================
     STATES
  ===================================================== */

  const hasAtLeastOneAccount =
    Boolean(
      orgData?.accounts
        ?.length > 0,
    );

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div
        className="organization-details-page"
        dir="ltr"
      >
        <div className="details-loading">
          <Loader2
            className="org-spin"
            size={40}
          />

          <p>
            Loading organization
            details...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error || !orgData) {
    return (
      <div
        className="organizations-container"
        dir="ltr"
        style={{
          padding: "40px",
        }}
      >
        <div className="details-error-card">
          <AlertCircle size={40} />

          <h3>
            Failed to Load Details
          </h3>

          <p>
            {error ||
              "The organization could not be found."}
          </p>

          <button
            className="btn-secondary"
            onClick={() =>
              navigate(
                "/organizations",
              )
            }
          >
            Back to Organizations
          </button>
        </div>
      </div>
    );
  }

  const statusClass =
    normalizeStatus(
      orgData.status,
    );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className="organizations-container organization-details-page"
      dir="ltr"
    >
      <main className="organization-details-content">

        {/* =====================================================
            ORGANIZATION HERO
        ===================================================== */}

        <section className="organization-hero-card">
          <div className="organization-hero-main">

            <div className="organization-logo-large">
              {orgData.logo ? (
                <img
                  src={orgData.logo}
                  alt={orgData.name}
                />
              ) : (
                (
                  orgData.name ||
                  "O"
                )
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div className="organization-hero-info">

              <div className="organization-name-row">
                <h1>
                  {orgData.name}
                </h1>

                <span
                  className={`status-badge-modern ${statusClass}`}
                >
                  <span className="status-dot" />

                  {prettyStatus(
                    orgData.status,
                  )}
                </span>
              </div>

              <div className="organization-meta-row">

                <span>
                  <FileCheck
                    size={15}
                  />

                  Registration /
                  Tax No:

                  <strong>
                    {orgData.taxNumber}
                  </strong>
                </span>

                <span>
                  <Clock3
                    size={15}
                  />

                  Registered:

                  <strong>
                    {orgData.createdAt}
                  </strong>
                </span>

              </div>
            </div>
          </div>

          <div className="organization-hero-actions">

            <div className="organization-action-buttons">

              {!hasAtLeastOneAccount && (
                <button
                  type="button"
                  className="organization-action create"
                  onClick={() =>
                    setIsCreateAdminOpen(
                      true,
                    )
                  }
                >
                  <UserPlus
                    size={17}
                  />

                  Create First
                  Account
                </button>
              )}

            </div>

          </div>
        </section>

        {/* =====================================================
            GENERAL INFORMATION
        ===================================================== */}

        <section className="details-section-card">

          <div className="details-section-header">

            <div className="details-section-title">

              <span className="section-icon blue">
                <Building
                  size={18}
                />
              </span>

              <div>
                <h2>
                  General Information
                </h2>

                <p>
                  Core information
                  registered for this
                  organization
                </p>
              </div>

            </div>

          </div>

          <div className="info-cards-grid">

            <div className="mini-info-card">
              <div className="info-card-icon">
                <Mail size={17} />
              </div>

              <div>
                <label>
                  Email Address
                </label>

                <p>
                  {orgData.email !==
                  "N/A" ? (
                    <a
                      href={`mailto:${orgData.email}`}
                    >
                      {
                        orgData.email
                      }
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>
            </div>

            <div className="mini-info-card">
              <div className="info-card-icon">
                <Phone
                  size={17}
                />
              </div>

              <div>
                <label>
                  Phone Number
                </label>

                <p>
                  {orgData.phone}
                </p>
              </div>
            </div>

            <div className="mini-info-card">
              <div className="info-card-icon">
                <MapPin
                  size={17}
                />
              </div>

              <div>
                <label>
                  Address /
                  Location
                </label>

                <p>
                  {orgData.address}
                </p>
              </div>
            </div>

            <div className="mini-info-card">
              <div className="info-card-icon">
                <Calendar
                  size={17}
                />
              </div>

              <div>
                <label>
                  Registered Date
                </label>

                <p>
                  {orgData.createdAt}
                </p>
              </div>
            </div>

            <div className="mini-info-card">
              <div className="info-card-icon">
                <FileSignature
                  size={17}
                />
              </div>

              <div>
                <label>
                  Commercial
                  Register Date
                </label>

                <p>
                  {
                    orgData.commercialRegisterDate
                  }
                </p>
              </div>
            </div>

            <div className="mini-info-card">
              <div className="info-card-icon">
                <FileText
                  size={17}
                />
              </div>

              <div>
                <label>
                  License Number
                </label>

                <p>
                  {orgData.licenseNum}

                  {orgData.licenseDate !==
                    "N/A" &&
                    ` (${orgData.licenseDate})`}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            ATTACHMENTS
        ===================================================== */}

        <section className="details-section-card attachments-section">

          <div className="details-section-header">

            <div className="details-section-title">

              <span className="section-icon purple">
                <ImageIcon
                  size={18}
                />
              </span>

              <div>
                <h2>
                  Documents &
                  Attachments
                </h2>

                <p>
                  Official documents
                  and files uploaded by
                  the organization
                </p>
              </div>

            </div>

            <span className="section-count">
              {
                orgData.documents
                  .length
              }{" "}
              {
                orgData.documents
                  .length === 1
                  ? "File"
                  : "Files"
              }
            </span>

          </div>

          {orgData.documents
            .length > 0 ? (

            <div className="attachments-grid">

              {orgData.documents.map(
                (doc) => (

                  <article
                    className="attachment-card"
                    key={
                      doc.id ||
                      doc.url
                    }
                  >

                    <div className="attachment-preview">

                      {doc.isImage ? (
                        <button
                          type="button"
                          className="attachment-image-button"
                          onClick={() =>
                            setSelectedDocument(
                              doc,
                            )
                          }
                          aria-label={`Preview ${doc.name}`}
                        >
                          <img
                            src={doc.url}
                            alt={
                              doc.name
                            }
                            loading="lazy"
                          />

                          <span className="attachment-preview-overlay">
                            <Eye
                              size={18}
                            />

                            Preview
                          </span>
                        </button>
                      ) : (
                        <div className="attachment-file-preview">

                          <div className="file-preview-icon">
                            {doc.ext ===
                            "pdf" ? (
                              <FileText
                                size={
                                  34
                                }
                              />
                            ) : (
                              <FileCode
                                size={
                                  34
                                }
                              />
                            )}
                          </div>

                          <span>
                            {String(
                              doc.ext ||
                                "FILE",
                            ).toUpperCase()}
                          </span>

                        </div>
                      )}

                    </div>

                    <div className="attachment-meta">

                      <div className="attachment-title-row">

                        <div>
                          <span className="attachment-category">
                            {
                              doc.title
                            }
                          </span>

                          <h3
                            title={
                              doc.name
                            }
                          >
                            {doc.name}
                          </h3>
                        </div>

                        {doc.isImage ? (
                          <FileImage
                            size={16}
                            className="attachment-type-icon"
                          />
                        ) : (
                          <FileText
                            size={16}
                            className="attachment-type-icon"
                          />
                        )}

                      </div>

                      <div className="attachment-bottom-row">

                        <span className="attachment-extension">
                          {String(
                            doc.ext ||
                              "FILE",
                          ).toUpperCase()}
                        </span>

                        <div className="attachment-actions">

                          {doc.isImage && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedDocument(
                                  doc,
                                )
                              }
                              title="Preview"
                            >
                              <Eye
                                size={15}
                              />

                              View
                            </button>
                          )}

                          <a
                            href={
                              doc.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open document"
                          >
                            <ExternalLink
                              size={14}
                            />

                            Open
                          </a>

                          <a
                            href={
                              doc.url
                            }
                            download
                            title="Download document"
                          >
                            <Download
                              size={14}
                            />
                          </a>

                        </div>
                      </div>

                    </div>

                  </article>
                ),
              )}

            </div>

          ) : (

            <div className="empty-state-box">

              <div className="empty-state-icon">
                <FileText
                  size={24}
                />
              </div>

              <div>
                <strong>
                  No documents
                  uploaded
                </strong>

                <p>
                  No attachments or
                  document files were
                  uploaded for this
                  organization.
                </p>
              </div>

            </div>

          )}

        </section>

        {/* =====================================================
            ORGANIZATION ACCOUNTS
        ===================================================== */}

        <section className="details-section-card accounts-section">

          <div className="details-section-header">

            <div className="details-section-title">

              <span className="section-icon green">
                <Users
                  size={18}
                />
              </span>

              <div>
                <h2>
                  Organization
                  Accounts
                </h2>

                <p>
                  Accounts and
                  representatives
                  associated with this
                  organization
                </p>
              </div>

            </div>

            <span className="section-count">
              {
                orgData.accounts
                  .length
              }{" "}
              {
                orgData.accounts
                  .length === 1
                  ? "Account"
                  : "Accounts"
              }
            </span>

          </div>

          {/* SUCCESS */}

          {accountActionSuccess && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding:
                  "12px 16px",
                marginBottom:
                  "18px",
                borderRadius:
                  "10px",
                background:
                  "#ecfdf5",
                border:
                  "1px solid #a7f3d0",
                color:
                  "#047857",
                fontSize:
                  "14px",
                fontWeight: 600,
              }}
            >
              <Check
                size={17}
              />

              {accountActionSuccess}
            </div>
          )}

          {/* ERROR */}

          {accountActionError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding:
                  "12px 16px",
                marginBottom:
                  "18px",
                borderRadius:
                  "10px",
                background:
                  "#fef2f2",
                border:
                  "1px solid #fecaca",
                color:
                  "#b91c1c",
                fontSize:
                  "14px",
                fontWeight: 600,
              }}
            >
              <AlertCircle
                size={17}
              />

              <span>
                {
                  accountActionError
                }
              </span>

              <button
                type="button"
                onClick={() =>
                  setAccountActionError(
                    "",
                  )
                }
                style={{
                  marginLeft:
                    "auto",
                  border:
                    "none",
                  background:
                    "transparent",
                  cursor:
                    "pointer",
                  color:
                    "inherit",
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* =================================================
              ACCOUNTS EXIST
          ================================================= */}

          {hasAtLeastOneAccount ? (

            <div className="accounts-grid">

              {orgData.accounts.map(
                (
                  account,
                  index,
                ) => {

                  const accountId =
                    account?.id ||
                    account?._id ||
                    account?.user_id ||
                    account?.userId;

                  const accountStatus =
                    String(
                      account?.status ||
                        "PENDING",
                    )
                      .trim()
                      .toUpperCase();

                  const isUpdating =
                    String(
                      accountUpdatingId,
                    ) ===
                    String(
                      accountId,
                    );

                  return (
                    <div
                      className="account-card"
                      key={
                        accountId ||
                        index
                      }
                    >

                      {/* =================================
                          ACCOUNT TOP
                      ================================= */}

                      <div className="account-card-top">

                        <div className="account-avatar">
                          {(
                            account.name ||
                            "A"
                          )
                            .charAt(
                              0,
                            )
                            .toUpperCase()}
                        </div>

                        <div className="account-meta">

                          <div className="account-name-row">

                            <strong
                              title={
                                account.name
                              }
                            >
                              {
                                account.name
                              }
                            </strong>

                            <span
                              className={`account-status-badge ${normalizeStatus(
                                account.status,
                              )}`}
                            >
                              {prettyStatus(
                                account.status,
                              )}
                            </span>

                          </div>

                          {account.username && (
                            <span>
                              <AtSign
                                size={
                                  13
                                }
                              />

                              @
                              {
                                account.username
                              }
                            </span>
                          )}

                          <span>
                            <Mail
                              size={
                                13
                              }
                            />

                            {
                              account.email
                            }
                          </span>

                          {account.phone !==
                            "N/A" && (
                            <span>
                              <Phone
                                size={
                                  13
                                }
                              />

                              {
                                account.phone
                              }
                            </span>
                          )}

                          {account.role !==
                            "N/A" && (
                            <span>
                              <BriefcaseBusiness
                                size={
                                  13
                                }
                              />

                              {
                                account.role
                              }
                            </span>
                          )}

                        </div>
                      </div>

                      {/* =================================
                          ACCOUNT ACTIONS
                      ================================= */}

                      <div
                        className="account-card-actions"
                        style={{
                          display:
                            "flex",
                          flexWrap:
                            "wrap",
                          gap: "8px",
                          marginTop:
                            "18px",
                          paddingTop:
                            "16px",
                          borderTop:
                            "1px solid #eef2f7",
                        }}
                      >

                        {/* VIEW DETAILS */}

                        <button
                          type="button"
                          className="account-view-btn"
                          disabled={
                            !accountId ||
                            isUpdating
                          }
                          onClick={() =>
                            handleViewAccount(
                              account,
                            )
                          }
                          title={
                            accountId
                              ? "View account details"
                              : "Account ID is missing"
                          }
                        >
                          <Eye
                            size={
                              15
                            }
                          />

                          View Details
                        </button>

                        {/* =================================
                            PENDING
                        ================================= */}

                        {accountStatus ===
                          "PENDING" && (
                          <>
                            <button
                              type="button"
                              className="account-control-btn approve"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                handleAccountStatusChange(
                                  account,
                                  "ACTIVE",
                                )
                              }
                              title="Approve account"
                            >
                              {isUpdating ? (
                                <Loader2
                                  size={
                                    15
                                  }
                                  className="org-spin"
                                />
                              ) : (
                                <UserCheck
                                  size={
                                    15
                                  }
                                />
                              )}

                              Approve
                            </button>

                            <button
                              type="button"
                              className="account-control-btn reject"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                handleAccountStatusChange(
                                  account,
                                  "REJECTED",
                                )
                              }
                              title="Reject account"
                            >
                              {isUpdating ? (
                                <Loader2
                                  size={
                                    15
                                  }
                                  className="org-spin"
                                />
                              ) : (
                                <UserX
                                  size={
                                    15
                                  }
                                />
                              )}

                              Reject
                            </button>
                          </>
                        )}

                        {/* =================================
                            ACTIVE
                        ================================= */}

                        {accountStatus ===
                          "ACTIVE" && (
                          <button
                            type="button"
                            className="account-control-btn block"
                            disabled={
                              isUpdating
                            }
                            onClick={() =>
                              handleAccountStatusChange(
                                account,
                                "BANNED",
                              )
                            }
                            title="Block account"
                          >
                            {isUpdating ? (
                              <Loader2
                                size={
                                  15
                                }
                                className="org-spin"
                              />
                            ) : (
                              <Ban
                                size={
                                  15
                                }
                              />
                            )}

                            Block
                          </button>
                        )}

                        {/* =================================
                            BANNED / REJECTED
                        ================================= */}

                        {(accountStatus ===
                          "BANNED" ||
                          accountStatus ===
                            "REJECTED") && (
                          <button
                            type="button"
                            className="account-control-btn activate"
                            disabled={
                              isUpdating
                            }
                            onClick={() =>
                              handleAccountStatusChange(
                                account,
                                "ACTIVE",
                              )
                            }
                            title="Activate account"
                          >
                            {isUpdating ? (
                              <Loader2
                                size={
                                  15
                                }
                                className="org-spin"
                              />
                            ) : (
                              <UserCheck
                                size={
                                  15
                                }
                              />
                            )}

                            Activate
                          </button>
                        )}

                      </div>
                    </div>
                  );
                },
              )}

            </div>

          ) : (

            /* =================================================
               NO ACCOUNTS
            ================================================= */

            <div className="details-no-accounts">

              <div className="no-account-icon">
                <ShieldAlert
                  size={24}
                />
              </div>

              <div className="no-account-content">

                <h4>
                  No Accounts
                  Assigned
                </h4>

                <p>
                  This organization
                  does not have any
                  accounts yet.
                </p>

                <button
                  type="button"
                  className="organization-action create"
                  onClick={() =>
                    setIsCreateAdminOpen(
                      true,
                    )
                  }
                  style={{
                    marginTop:
                      "12px",
                  }}
                >
                  <UserPlus
                    size={16}
                  />

                  Create First
                  Account
                </button>

              </div>

            </div>
          )}

        </section>
      </main>

      {/* =========================================================
          IMAGE LIGHTBOX
      ========================================================= */}

      {selectedDocument && (
        <div
          className="document-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Document preview"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedDocument(
                null,
              );
            }
          }}
        >
          <div className="document-lightbox-card">

            <div className="document-lightbox-header">

              <div>
                <span>
                  {
                    selectedDocument.title
                  }
                </span>

                <h3>
                  {
                    selectedDocument.name
                  }
                </h3>
              </div>

              <button
                type="button"
                className="lightbox-close"
                onClick={() =>
                  setSelectedDocument(
                    null,
                  )
                }
                aria-label="Close preview"
              >
                <X size={20} />
              </button>

            </div>

            <div className="document-lightbox-body">

              <img
                src={
                  selectedDocument.url
                }
                alt={
                  selectedDocument.name
                }
              />

            </div>

            <div className="document-lightbox-footer">

              <span>
                {String(
                  selectedDocument.ext ||
                    "IMAGE",
                ).toUpperCase()}
              </span>

              <div>

                <a
                  href={
                    selectedDocument.url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink
                    size={15}
                  />

                  Open Original
                </a>

                <a
                  href={
                    selectedDocument.url
                  }
                  download
                >
                  <Download
                    size={15}
                  />

                  Download
                </a>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          USER DETAILS MODAL
      ========================================================= */}

      {showAccountDetails &&
        selectedAccount && (
          <div
            className="account-details-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Account details"
            onMouseDown={(
              event,
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeAccountDetails();
              }
            }}
          >
            <div className="account-details-modal">

              <div className="account-details-modal-header">

                <div>
                  <span className="account-details-modal-label">
                    Organization
                    Account
                  </span>

                  <h2>
                    {selectedAccount.name ||
                      "Account Details"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="account-details-close-btn"
                  onClick={
                    closeAccountDetails
                  }
                  aria-label="Close account details"
                  title="Close"
                >
                  <X size={20} />
                </button>

              </div>

              <div className="account-details-modal-body">

                <UserDetails
                  user={
                    selectedAccount
                  }
                  onClose={
                    closeAccountDetails
                  }
                />

              </div>

            </div>
          </div>
        )}

      {/* =========================================================
          CREATE ADMIN MODAL
      ========================================================= */}

      <CreateAdminModal
        isOpen={
          isCreateAdminOpen
        }
        onClose={() =>
          setIsCreateAdminOpen(
            false,
          )
        }
        org={orgData}
        onRefresh={
          refreshDetails
        }
      />
    </div>
  );
}