import API from "./api";

/* =========================================================
   Get All Permissions

   GET /api/permissions

   Required:
   SUPER_ADMIN token
========================================================= */

export const getAllPermissions = async () => {
  try {
    const response = await API.get("/api/permissions");

    const permissions = Array.isArray(
      response.data?.permissions
    )
      ? response.data.permissions
      : Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];

    return permissions;
  } catch (error) {
    console.error(
      "Failed to fetch permissions:",
      error
    );

    throw error;
  }
};

/* =========================================================
   Add Permission To Role

   POST /api/roles/{role_id}/permissions

   Required:
   SUPER_ADMIN token

   Body:
   {
     "permission_id": "PERMISSION_ID"
   }
========================================================= */

export const addPermissionToRole = async (
  roleId,
  permissionId
) => {
  try {
    if (!roleId) {
      throw new Error(
        "Role ID is required."
      );
    }

    if (!permissionId) {
      throw new Error(
        "Permission ID is required."
      );
    }

    const payload = {
      permission_id: permissionId,
    };

    const response = await API.post(
      `/api/roles/${roleId}/permissions`,
      payload
    );

    const result =
      response.data?.data ||
      response.data?.permission ||
      response.data ||
      null;

    return result;
  } catch (error) {
    console.error(
      "Failed to add permission to role:",
      error
    );

    throw error;
  }
};

/* =========================================================
   Remove Permission From Role

   DELETE /api/roles/{role_id}/permissions/{permission_id}

   Required:
   SUPER_ADMIN token

   Body:
   NONE
========================================================= */

export const removePermissionFromRole = async (
  roleId,
  permissionId
) => {
  try {
    if (!roleId) {
      throw new Error(
        "Role ID is required."
      );
    }

    if (!permissionId) {
      throw new Error(
        "Permission ID is required."
      );
    }

    const response = await API.delete(
      `/api/roles/${roleId}/permissions/${permissionId}`
    );

    const result =
      response.data?.data ||
      response.data?.permission ||
      response.data ||
      null;

    return result;
  } catch (error) {
    console.error(
      "Failed to remove permission from role:",
      error
    );

    throw error;
  }
};