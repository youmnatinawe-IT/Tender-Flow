/* =========================================================
   Shared formatting helpers
   Extracted from identical duplicated implementations:
   - formatBudget:    TenderTable.jsx + TenderDatails.jsx
   - formatTenderId:  TenderTable.jsx + TenderDatails.jsx
   - normalizeRoleCode: CreateRoleModal.jsx + RoleDetails.jsx
   - getInitials:     Navbar.jsx + Adminprofail.jsx
   Logic preserved exactly as in the original components.
========================================================= */

export const formatBudget = (value, currency) => {
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

export const formatTenderId = (id) => {
  if (!id) return "N/A";

  return `#${id.slice(-6).toUpperCase()}`;
};

export const normalizeRoleCode = (
  value
) => {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9_ ]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
};

export const getInitials = (name) => {
  if (!name) return "SA";

  const parts = name.split(" ");

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
};
