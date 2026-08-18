import API from "./api";

/* =========================================================
   Get All Tenders - Admin
========================================================= */

export const getAllTenders = async () => {
  const response = await API.get("/api/tenders/all");

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
};

/* =========================================================
   Get Tenders - Current User
========================================================= */

export const getUserTenders = async () => {
  const response = await API.get("/api/tenders");

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
};

/* =========================================================
   Get Tender Attachments
========================================================= */

export const getTenderAttachments = async (tenderId) => {
  if (!tenderId) {
    throw new Error("Tender ID is required");
  }

  const response = await API.get(
    `/api/tenders/${tenderId}/attachments`,
  );

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
};