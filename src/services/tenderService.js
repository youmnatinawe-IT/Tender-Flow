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

/* =========================================================
   Update Tender
=========================================================

   API:
   PUT /api/tenders/{tender_id}

   Required:
   - Token
   - type: PUBLISHER

   Editable fields:
   - title
   - description
   - type
   - category
   - submission_start
   - submission_deadline
   - estimated_value
   - currency
   - execution_location

========================================================= */

export const updateTender = async (tenderId, tenderData) => {
  if (!tenderId) {
    throw new Error("Tender ID is required");
  }

  /* =======================================================
     Only send fields allowed by backend
  ======================================================= */

  const allowedFields = [
    "title",
    "description",
    "type",
    "category",
    "submission_start",
    "submission_deadline",
    "estimated_value",
    "currency",
    "execution_location",
  ];

  const payload = {};

  allowedFields.forEach((field) => {
    if (
      tenderData &&
      Object.prototype.hasOwnProperty.call(tenderData, field)
    ) {
      payload[field] = tenderData[field];
    }
  });

  console.log("==========================================");
  console.log("Updating Tender");
  console.log("API:", `/api/tenders/${tenderId}`);
  console.log("Method: PUT");
  console.log("Payload:", payload);
  console.log("==========================================");

  const response = await API.put(
    `/api/tenders/${tenderId}`,
    payload,
  );

  /* =======================================================
     Normalize response
  ======================================================= */

  if (response?.data?.data) {
    return response.data.data;
  }

  if (response?.data) {
    return response.data;
  }

  return payload;
};