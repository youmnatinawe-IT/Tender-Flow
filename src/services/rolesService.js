import API from "./api";
import { normalizeError } from "./errorHandler";

/* =========================================================
   GET ALL ROLES

   GET /api/roles

   Required:
   SUPER_ADMIN
========================================================= */

export const getAllRoles = async () => {
  try {
    const response = await API.get("/api/roles");

    const responseData = response.data;

    /*
      Support:

      [
        {...}
      ]

      OR

      {
        data: [...]
      }

      OR

      {
        roles: [...]
      }
    */

    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (Array.isArray(responseData?.data)) {
      return responseData.data;
    }

    if (Array.isArray(responseData?.roles)) {
      return responseData.roles;
    }

    return [];
  } catch (error) {
    console.error(
      "Failed to fetch roles:",
      error
    );

    throw error;
  }
};


/* =========================================================
   CREATE ROLE

   POST /api/roles

   Required:
   SUPER_ADMIN

   Body:

   {
     code: "TENDER_MANAGER",
     name: "Tender Manager",
     name_ar: "مدير المناقصات",
     description: "...",
     is_active: true
   }

   Permissions are NOT added here.
========================================================= */

export const createRole = async ({
  code,
  name,
  name_ar,
  description,
}) => {
  try {
    const payload = {
      code,
      name,
      name_ar,
      description,
      is_active: true,
    };

    const response = await API.post(
      "/api/roles",
      payload
    );

    return (
      response.data?.data ||
      response.data?.role ||
      response.data
    );
  } catch (error) {
    console.error(
      "Failed to create role:",
      error
    );

    throw error;
  }
};


/* =========================================================
   UPDATE ROLE

   PATCH /api/roles/{role_id}

   Required:
   SUPER_ADMIN
========================================================= */

export const updateRole = async (
  roleId,
  roleData
) => {
  try {
    if (!roleId) {
      throw new Error(
        "Role ID is required."
      );
    }

    const payload =
      Object.fromEntries(
        Object.entries(roleData || {}).filter(
          ([, value]) =>
            value !== undefined
        )
      );

    const response =
      await API.patch(
        `/api/roles/${roleId}`,
        payload
      );

    return (
      response.data?.data ||
      response.data?.role ||
      response.data
    );
  } catch (error) {
    console.error(
      "Failed to update role:",
      error
    );

    throw error;
  }
};


/* =========================================================
   ASSIGN ROLE TO USER

   PATCH /api/users_role/{user_id}/role

   Required:
   SUPER_ADMIN

   Body:

   {
     role_id: "ROLE_ID"
   }
========================================================= */

export const assignRoleToUser = async (
  userId,
  roleId
) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: {
          isApiError: true,
          message:
            "User ID is required.",
        },
      };
    }

    if (!roleId) {
      return {
        success: false,
        error: {
          isApiError: true,
          message:
            "Role ID is required.",
        },
      };
    }

    const response =
      await API.patch(
        `/api/users_role/${userId}/role`,
        {
          role_id: roleId,
        }
      );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      "Failed to assign role:",
      error
    );

    return {
      success: false,
      error: normalizeError(error),
    };
  }
};