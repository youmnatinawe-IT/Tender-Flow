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
    `/api/tenders/${tenderId}/attachments`
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
   Get Bids Submitted for Tender
=========================================================

   API:
   GET /api/bids/tender/{tender_id}

   Required:
   - Token
   - Publisher / Admin

========================================================= */
/* =========================================================
   Get Bids Submitted for Tender
========================================================= */

export const getTenderBids = async (tenderId) => {
  if (!tenderId) {
    throw new Error("Tender ID is required");
  }

  const url = `/api/bids/tender/${tenderId}`;

  console.log("==========================================");
  console.log("GET TENDER BIDS");
  console.log("Tender ID:", tenderId);
  console.log("URL:", url);
  console.log("==========================================");

  try {
    const response = await API.get(url);

    console.log("==========================================");
    console.log("RAW BIDS RESPONSE:");
    console.log(response?.data);
    console.log("==========================================");

    const body = response?.data;

    /*
     * Case 1:
     * [
     *   {...},
     *   {...}
     * ]
     */
    if (Array.isArray(body)) {
      console.log("BIDS ARRAY:", body);
      return body;
    }

    /*
     * Case 2:
     * {
     *   message: "...",
     *   data: [...]
     * }
     */
    if (Array.isArray(body?.data)) {
      console.log("BIDS ARRAY FROM data:", body.data);
      return body.data;
    }

    /*
     * Case 3:
     * {
     *   message: "...",
     *   data: {
     *     bids: [...]
     *   }
     * }
     */
    if (Array.isArray(body?.data?.bids)) {
      console.log(
        "BIDS ARRAY FROM data.bids:",
        body.data.bids
      );

      return body.data.bids;
    }

    /*
     * Case 4:
     * {
     *   bids: [...]
     * }
     */
    if (Array.isArray(body?.bids)) {
      console.log(
        "BIDS ARRAY FROM bids:",
        body.bids
      );

      return body.bids;
    }

    /*
     * Case 5:
     * {
     *   data: {
     *     items: [...]
     *   }
     * }
     */
    if (Array.isArray(body?.data?.items)) {
      console.log(
        "BIDS ARRAY FROM data.items:",
        body.data.items
      );

      return body.data.items;
    }

    console.warn(
      "No bids array found in backend response:",
      body
    );

    return [];

  } catch (error) {
    console.error("GET TENDER BIDS ERROR:", error);
    console.error("STATUS:", error?.response?.status);
    console.error(
      "ERROR RESPONSE:",
      error?.response?.data
    );

    throw error;
  }
};

/* =========================================================
   Update Tender
=========================================================

   API:
   PUT /api/tenders/{tender_id}

   Required:
   - Token
   - type: PUBLISHER

========================================================= */

export const updateTender = async (tenderId, tenderData) => {
  if (!tenderId) {
    throw new Error("Tender ID is required");
  }

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
    payload
  );

  if (response?.data?.data) {
    return response.data.data;
  }

  if (response?.data) {
    return response.data;
  }

  return payload;
};