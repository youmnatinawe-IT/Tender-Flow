import API from "./api";

import { normalizeError } from "./errorHandler";

/* =========================================================
   GET ALL USERS

   GET /api/users
========================================================= */

export const getUsers = async () => {
  const response =
    await API.get(
      "/api/users"
    );

  return response.data;
};

/* =========================================================
   GET USER BY ID

   GET /api/users/{id}
========================================================= */

export const getUserById = async (
  id
) => {
  try {
    const response =
      await API.get(
        `/api/users/${id}`
      );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const parsedError =
      normalizeError(error);

    return {
      success: false,
      error: parsedError,
    };
  }
};

/* =========================================================
   UPDATE USER

   PUT /api/users/{id}
========================================================= */

export const updateUser = async (
  id,
  userData
) => {
  try {
    const response =
      await API.put(
        `/api/users/${id}`,
        userData
      );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const parsedError =
      normalizeError(error);

    return {
      success: false,
      error: parsedError,
    };
  }
};

/* =========================================================
   ACCEPT USER

   PUT /api/users/accept/{id}
========================================================= */

export const acceptUser = async (
  id
) => {
  try {
    const response =
      await API.put(
        `/api/users/accept/${id}`
      );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const parsedError =
      normalizeError(error);

    return {
      success: false,
      error: parsedError,
    };
  }
};

/* =========================================================
   BAN USER

   PUT /api/users/ban/{id}
========================================================= */

export const banUser = async (
  id,
  message
) => {
  try {
    const response =
      await API.put(
        `/api/users/ban/${id}`,
        {
          bann_message:
            message,
        }
      );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const parsedError =
      normalizeError(error);

    return {
      success: false,
      error: parsedError,
    };
  }
};

/* =========================================================
   RESEND PENDING USER

   PUT /api/users/resend/{id}
========================================================= */

export const resendPendingUser =
  async (id) => {
    try {
      const response =
        await API.put(
          `/api/users/resend/${id}`
        );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const parsedError =
        normalizeError(error);

      return {
        success: false,
        error: parsedError,
      };
    }
  };

/* =========================================================
   REJECT USER

   PUT /api/users/reject/{id}
========================================================= */

export const rejectUser = async (
  id,
  reason
) => {
  try {
    const response =
      await API.put(
        `/api/users/reject/${id}`,
        {
          reject_message:
            reason,
        }
      );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const parsedError =
      normalizeError(error);

    return {
      success: false,
      error: parsedError,
    };
  }
};