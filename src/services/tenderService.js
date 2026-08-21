import API from "./api";

/* =========================================================
   Get All Tenders - Admin
   GET /api/tenders/all
========================================================= */

export const getAllTenders = async () => {
  try {
    const response = await API.get(
      "/api/tenders/all"
    );

    const body = response?.data;

    if (Array.isArray(body)) {
      return body;
    }

    if (Array.isArray(body?.data)) {
      return body.data;
    }

    if (Array.isArray(body?.data?.items)) {
      return body.data.items;
    }

    if (Array.isArray(body?.items)) {
      return body.items;
    }

    return [];
  } catch (error) {
    console.error(
      "GET ALL TENDERS ERROR:",
      error
    );

    console.error(
      "STATUS:",
      error?.response?.status
    );

    console.error(
      "ERROR RESPONSE:",
      error?.response?.data
    );

    throw error;
  }
};

/* =========================================================
   Get Tender Attachments
   GET /api/tenders/{tenderId}/attachments
========================================================= */

export const getTenderAttachments = async (
  tenderId
) => {
  if (!tenderId) {
    throw new Error(
      "Tender ID is required"
    );
  }

  try {
    const response = await API.get(
      `/api/tenders/${tenderId}/attachments`
    );

    const body = response?.data;

    if (Array.isArray(body)) {
      return body;
    }

    if (Array.isArray(body?.data)) {
      return body.data;
    }

    if (
      Array.isArray(
        body?.data?.items
      )
    ) {
      return body.data.items;
    }

    if (Array.isArray(body?.items)) {
      return body.items;
    }

    return [];
  } catch (error) {
    console.error(
      "GET TENDER ATTACHMENTS ERROR:",
      error
    );

    throw error;
  }
};

/* =========================================================
   Get ALL Bids - Admin
   GET /api/bids
========================================================= */

export const getAllBids = async () => {
  console.log(
    "=========================================="
  );

  console.log(
    "GET ALL BIDS - ADMIN"
  );

  console.log(
    "URL:",
    "/api/bids"
  );

  console.log(
    "=========================================="
  );

  try {
    const response =
      await API.get("/api/bids");

    const body = response?.data;

    console.log(
      "=========================================="
    );

    console.log(
      "RAW ALL BIDS RESPONSE:"
    );

    console.log(body);

    console.log(
      "=========================================="
    );

    if (Array.isArray(body)) {
      return body;
    }

    if (Array.isArray(body?.data)) {
      return body.data;
    }

    if (
      Array.isArray(
        body?.data?.bids
      )
    ) {
      return body.data.bids;
    }

    if (Array.isArray(body?.bids)) {
      return body.bids;
    }

    if (
      Array.isArray(
        body?.data?.items
      )
    ) {
      return body.data.items;
    }

    if (Array.isArray(body?.items)) {
      return body.items;
    }

    console.warn(
      "No bids array found in /api/bids response:",
      body
    );

    return [];
  } catch (error) {
    console.error(
      "GET ALL BIDS ERROR:",
      error
    );

    console.error(
      "STATUS:",
      error?.response?.status
    );

    console.error(
      "ERROR RESPONSE:",
      error?.response?.data
    );

    throw error;
  }
};

/* =========================================================
   Get Bids Submitted for Tender
   GET /api/bids/tender/{tenderId}
========================================================= */

export const getTenderBids = async (
  tenderId
) => {
  if (!tenderId) {
    throw new Error(
      "Tender ID is required"
    );
  }

  try {
    const response =
      await API.get(
        `/api/bids/tender/${tenderId}`
      );

    const body = response?.data;

    console.log(
      "=========================================="
    );

    console.log(
      "GET TENDER BIDS"
    );

    console.log(
      "TENDER ID:",
      tenderId
    );

    console.log(
      "RAW RESPONSE:",
      body
    );

    console.log(
      "=========================================="
    );

    if (Array.isArray(body)) {
      return body;
    }

    if (Array.isArray(body?.data)) {
      return body.data;
    }

    if (
      Array.isArray(
        body?.data?.bids
      )
    ) {
      return body.data.bids;
    }

    if (Array.isArray(body?.bids)) {
      return body.bids;
    }

    if (
      Array.isArray(
        body?.data?.items
      )
    ) {
      return body.data.items;
    }

    if (Array.isArray(body?.items)) {
      return body.items;
    }

    return [];
  } catch (error) {
    console.error(
      "GET TENDER BIDS ERROR:",
      error
    );

    console.error(
      "STATUS:",
      error?.response?.status
    );

    console.error(
      "ERROR RESPONSE:",
      error?.response?.data
    );

    throw error;
  }
};
