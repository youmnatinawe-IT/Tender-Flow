import { useState, useEffect } from "react";

import {
  Eye,
  Pencil,
  UserX,
  UserCheck,
  Loader2,
  ShieldPlus,
} from "lucide-react";

import { getUsers } from "../../services/userService";

import {
  getPublisherOrgs,
  getExecutorOrgs,
} from "../../services/organizationService";

import { getAllRoles } from "../../services/rolesService";

import UserDetails from "./UserDatails";
import UserModal from "./UserModal";
import AssignRoleModal from "./AssignRoleModal";
import SuspendUserModal from "./SuspendUserModal";

/* =========================================================
   Helpers
========================================================= */

const normalizeStatus = (status) =>
  String(status || "active").trim().toLowerCase();

const capitalizeStatus = (status) => {
  const normalized = normalizeStatus(status);

  return (
    normalized.charAt(0).toUpperCase() +
    normalized.slice(1)
  );
};

/* =========================================================
   Get User Role
   يعتمد بشكل أساسي على:
   user.role_id === role._id
========================================================= */

const getUserRole = (user, roles = []) => {
  if (!user) return "N/A";

  /* -------------------------------------------------------
     1. إذا كان الـ API يرجع role كـ object
  ------------------------------------------------------- */

  if (
    user.role &&
    typeof user.role === "object"
  ) {
    return (
      user.role.name ||
      user.role.name_ar ||
      user.role.code ||
      user.role.role_name ||
      "N/A"
    );
  }

  /* -------------------------------------------------------
     2. البحث عن الـ Role بواسطة role_id
  ------------------------------------------------------- */

  if (
    user.role_id &&
    Array.isArray(roles)
  ) {
    const matchedRole = roles.find(
      (role) =>
        String(role?._id || role?.id) ===
        String(user.role_id)
    );

    if (matchedRole) {
      return (
        matchedRole.name ||
        matchedRole.name_ar ||
        matchedRole.code ||
        matchedRole.role_name ||
        "N/A"
      );
    }
  }

  /* -------------------------------------------------------
     3. fallback إذا كان عندنا roles array
  ------------------------------------------------------- */

  if (
    Array.isArray(user.roles) &&
    user.roles.length > 0
  ) {
    const role = user.roles[0];

    if (typeof role === "object") {
      return (
        role.name ||
        role.name_ar ||
        role.code ||
        role.role_name ||
        "N/A"
      );
    }

    return role;
  }

  /* -------------------------------------------------------
     4. آخر fallback
  ------------------------------------------------------- */

  return user.type || "N/A";
};

/* =========================================================
   Get Organization Name
========================================================= */

const getOrganizationName = (user) => {
  if (!user) return "N/A";

  if (
    typeof user.organization === "string" &&
    user.organization.trim()
  ) {
    return user.organization;
  }

  if (
    user.organization &&
    typeof user.organization === "object"
  ) {
    return (
      user.organization.org_name ||
      user.organization.name ||
      user.organization.title ||
      "N/A"
    );
  }

  return (
    user.org_name ||
    user.organization_name ||
    user.org?.org_name ||
    user.org?.name ||
    user.PublisherOrg?.org_name ||
    user.ExecutorOrg?.org_name ||
    "N/A"
  );
};

/* =========================================================
   Format Last Login
========================================================= */

const formatLastLogin = (user) => {
  const loginDate =
    user?.lastLogin ||
    user?.last_login ||
    user?.lastLoginAt ||
    user?.updatedAt;

  if (!loginDate) return "N/A";

  const date = new Date(loginDate);

  if (isNaN(date.getTime())) {
    return String(loginDate);
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   Component
========================================================= */

export default function UserTable({ filters }) {
  const [selectedUser, setSelectedUser] = useState(null);

  const [showDrawer, setShowDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAssignRole, setShowAssignRole] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =========================================================
     Fetch Users + Organizations + Roles
  ========================================================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          usersRes,
          pubRes,
          execRes,
          rolesRes,
        ] = await Promise.all([
          getUsers(),
          getPublisherOrgs(),
          getExecutorOrgs(),
          getAllRoles(),
        ]);

        /* =====================================================
           USERS
        ===================================================== */

        const rawUsers = usersRes?.success
          ? usersRes.data
          : usersRes;

        const userList = Array.isArray(rawUsers)
          ? rawUsers
          : rawUsers?.users ||
            rawUsers?.data ||
            [];

        /* =====================================================
           ROLES
        ===================================================== */

        const roleList = Array.isArray(rolesRes)
          ? rolesRes
          : [];

        setRoles(roleList);

        /* =====================================================
           PUBLISHERS
        ===================================================== */

        const publishers = pubRes?.success
          ? pubRes.data?.data ||
            pubRes.data?.publishers ||
            pubRes.data ||
            []
          : [];

        /* =====================================================
           EXECUTORS
        ===================================================== */

        const executors = execRes?.success
          ? execRes.data?.data ||
            execRes.data?.executors ||
            execRes.data ||
            []
          : [];

        /* =====================================================
           ALL ORGANIZATIONS
        ===================================================== */

        const allOrgs =
          Array.isArray(publishers) &&
          Array.isArray(executors)
            ? [
                ...publishers,
                ...executors,
              ]
            : [];

        /* =====================================================
           ORGANIZATION MAP
        ===================================================== */

        const orgMap = new Map(
          allOrgs.map((org) => [
            String(
              org?._id || org?.id
            ),
            org?.org_name ||
              org?.name ||
              "N/A",
          ])
        );

        /* =====================================================
           ENRICH USERS
        ===================================================== */

        const enrichedUsers = userList.map((user) => ({
          ...user,

          organization:
            orgMap.get(
              String(user?.org_id)
            ) ||
            user?.organization ||
            "N/A",
        }));

        setUsers(enrichedUsers);

        /* =====================================================
           TEMP DEBUG
           User -> Role
        ===================================================== */

        console.log(
          "========== USERS =========="
        );

        console.table(userList);

        console.log(
          "========== ROLES =========="
        );

        console.table(roleList);

        console.log(
          "========== USER → ROLE DEBUG =========="
        );

        enrichedUsers.forEach((user) => {
          const matchedRole = roleList.find(
            (role) =>
              String(
                role?._id || role?.id
              ) ===
              String(user?.role_id)
          );

          console.log({
            userId:
              user?._id ||
              user?.id,

            name:
              `${user?.f_name || ""} ${
                user?.l_name || ""
              }`.trim(),

            type: user?.type,

            role_id:
              user?.role_id,

            role_name:
              matchedRole?.name,

            role_name_ar:
              matchedRole?.name_ar,

            role_code:
              matchedRole?.code,

            fullRole:
              matchedRole || null,
          });
        });

        /* =====================================================
           USERS WITHOUT ROLE
        ===================================================== */

        const usersWithoutRole =
          enrichedUsers.filter(
            (user) => {
              if (!user?.role_id) {
                return true;
              }

              const exists = roleList.some(
                (role) =>
                  String(
                    role?._id ||
                      role?.id
                  ) ===
                  String(
                    user.role_id
                  )
              );

              return !exists;
            }
          );

        console.log(
          "========== USERS WITHOUT VALID ROLE =========="
        );

        console.table(
          usersWithoutRole.map(
            (user) => ({
              id:
                user?._id ||
                user?.id,

              name:
                `${user?.f_name || ""} ${
                  user?.l_name || ""
                }`.trim(),

              type:
                user?.type,

              role_id:
                user?.role_id,
            })
          )
        );
      } catch (err) {
        console.error(
          "Failed to fetch data:",
          err
        );

        setError(
          "Failed to fetch user list. Please ensure you are logged in again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================================================
     Filters
  ========================================================= */

  const safeFilters =
    filters || {
      search: "",
      role: "All",
      organization: "All",
      status: "All",
    };

  const filteredUsers = users.filter(
    (user) => {
      const search = String(
        safeFilters.search || ""
      ).toLowerCase();

      const userName = [
        user?.f_name,
        user?.l_name,
        user?.name,
        user?.fullName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        userName.includes(search) ||
        String(user?.email || "")
          .toLowerCase()
          .includes(search);

      const userRole =
        getUserRole(user, roles);

      const matchesRole =
        safeFilters.role === "All" ||
        userRole === safeFilters.role;

      const userOrg =
        getOrganizationName(user);

      const matchesOrg =
        safeFilters.organization ===
          "All" ||
        userOrg ===
          safeFilters.organization;

      const matchesStatus =
        safeFilters.status === "All" ||
        normalizeStatus(
          user?.status
        ) ===
          String(
            safeFilters.status
          ).toLowerCase();

      return (
        matchesSearch &&
        matchesRole &&
        matchesOrg &&
        matchesStatus
      );
    }
  );

  /* =========================================================
     Update User Status
  ========================================================= */

  const handleStatusChanged = (
    userId,
    newStatus
  ) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        const id =
          user?.id ||
          user?._id;

        if (
          String(id) ===
          String(userId)
        ) {
          return {
            ...user,
            status: newStatus,
          };
        }

        return user;
      })
    );

    setShowSuspend(false);
  };

  /* =========================================================
     Update User Role
  ========================================================= */

  const handleRoleAssigned = (
    updatedRole
  ) => {
    const userId =
      selectedUser?.id ||
      selectedUser?._id;

    if (!userId) return;

    const role =
      updatedRole?.role ||
      updatedRole;

    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        const currentId =
          user?.id ||
          user?._id;

        if (
          String(currentId) ===
          String(userId)
        ) {
          return {
            ...user,

            role,

            roles: [role],

            role_id:
              role?._id ||
              role?.id ||
              user?.role_id,
          };
        }

        return user;
      })
    );

    setSelectedUser((prev) => {
      if (!prev) return prev;

      return {
        ...prev,

        role,

        roles: [role],

        role_id:
          role?._id ||
          role?.id ||
          prev?.role_id,
      };
    });

    setShowAssignRole(false);
  };

  /* =========================================================
     Loading
  ========================================================= */

  if (loading) {
    return (
      <div
        className="table-container"
        style={{
          textAlign: "center",
          padding: "40px",
        }}
      >
        <Loader2
          className="animate-spin"
          size={32}
          style={{
            margin: "0 auto",
          }}
        />

        <p
          style={{
            marginTop: "10px",
          }}
        >
          Loading users...
        </p>
      </div>
    );
  }

  /* =========================================================
     Error
  ========================================================= */

  if (error) {
    return (
      <div
        className="table-container"
        style={{
          textAlign: "center",
          padding: "30px",
          color: "red",
        }}
      >
        <p>{error}</p>
      </div>
    );
  }

  /* =========================================================
     Render
  ========================================================= */

  return (
    <>
      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>

              <th>Email</th>

              <th>Organization</th>

              <th>Role</th>

             

              <th>Status</th>

              <th>Last Login</th>

              <th className="text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(
                (user) => {
                  /* =================================================
                     STATUS
                  ================================================= */

                  const status =
                    normalizeStatus(
                      user?.status
                    );

                  const isPending =
                    status ===
                    "pending";

                  const isActive =
                    status ===
                    "active";

                  const isRejected =
                    status ===
                    "rejected";

                  const isBanned =
                    status ===
                    "banned";

                  /* =================================================
                     USER ID
                  ================================================= */

                  const userId =
                    user?.id ||
                    user?._id;

                  /* =================================================
                     DISPLAY NAME
                  ================================================= */

                  const displayName =
                    user?.name ||
                    user?.fullName ||
                    `${user?.f_name || ""} ${
                      user?.l_name || ""
                    }`.trim() ||
                    "Unknown User";

                  /* =================================================
                     REAL ROLE
                  ================================================= */

                  const userRole =
                    getUserRole(
                      user,
                      roles
                    );

                  return (
                    <tr
                      key={userId}
                    >
                      {/* =================================================
                          USER
                      ================================================= */}

                      <td>
                        <div className="user-info">
                          <div className="avatar">
                            {displayName
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {
                                displayName
                              }
                            </strong>

                            <p>
                              {user?.phone ||
                                "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* =================================================
                          EMAIL
                      ================================================= */}

                      <td>
                        {user?.email ||
                          "N/A"}
                      </td>

                      {/* =================================================
                          ORGANIZATION
                      ================================================= */}

                      <td>
                        {getOrganizationName(
                          user
                        )}
                      </td>

                      {/* =================================================
                          ROLE
                      ================================================= */}

                      <td>
                        <span className="role-badge">
                          {userRole}
                        </span>
                      </td>

                   
                      {/* =================================================
                          STATUS
                      ================================================= */}

                      <td>
                        <span
                          className={`status-badge ${status}`}
                        >
                          {capitalizeStatus(
                            user?.status
                          )}
                        </span>
                      </td>

                      {/* =================================================
                          LAST LOGIN
                      ================================================= */}

                      <td>
                        {formatLastLogin(
                          user
                        )}
                      </td>

                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <td>
                        <div className="actions">
                          {/* =================================================
                              VIEW
                          ================================================= */}

                          <button
                            className="action-btn view"
                            title="View Details"
                            onClick={() => {
                              setSelectedUser(
                                user
                              );

                              setShowDrawer(
                                true
                              );
                            }}
                          >
                            <Eye
                              size={16}
                            />
                          </button>

                          {/* =================================================
                              EDIT
                          ================================================= */}

                          <button
                            className="action-btn edit"
                            title="Edit User"
                            onClick={() => {
                              setSelectedUser(
                                user
                              );

                              setShowModal(
                                true
                              );
                            }}
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          {/* =================================================
                              ASSIGN ROLE
                              ACTIVE ONLY
                          ================================================= */}

                          {isActive && (
                            <button
                              className="action-btn assign-role"
                              title="Assign Role"
                              onClick={() => {
                                setSelectedUser(
                                  user
                                );

                                setShowAssignRole(
                                  true
                                );
                              }}
                            >
                              <ShieldPlus
                                size={16}
                              />
                            </button>
                          )}

                          {/* =================================================
                              PENDING
                              ACCEPT / REJECT
                          ================================================= */}

                          {isPending && (
                            <button
                              className="action-btn activate"
                              title="Review User"
                              onClick={() => {
                                setSelectedUser(
                                  user
                                );

                                setShowSuspend(
                                  true
                                );
                              }}
                            >
                              <UserCheck
                                size={16}
                              />
                            </button>
                          )}

                          {/* =================================================
                              ACTIVE
                              BAN
                          ================================================= */}

                          {isActive && (
                            <button
                              className="action-btn suspend"
                              title="Ban User"
                              onClick={() => {
                                setSelectedUser(
                                  user
                                );

                                setShowSuspend(
                                  true
                                );
                              }}
                            >
                              <UserX
                                size={16}
                              />
                            </button>
                          )}

                          {/* =================================================
                              REJECTED
                              RESEND
                          ================================================= */}

                          {isRejected && (
                            <button
                              className="action-btn activate"
                              title="Send for Review Again"
                              onClick={() => {
                                setSelectedUser(
                                  user
                                );

                                setShowSuspend(
                                  true
                                );
                              }}
                            >
                              <UserCheck
                                size={16}
                              />
                            </button>
                          )}

                          {/* =================================================
                              BANNED
                          ================================================= */}

                          {isBanned && (
                            <button
                              className="action-btn"
                              title="Banned Account"
                              disabled
                              style={{
                                opacity:
                                  0.45,
                                cursor:
                                  "not-allowed",
                              }}
                            >
                              <UserX
                                size={16}
                              />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="no-data"
                >
                  No users found
                  matching your
                  filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =========================================================
          USER DETAILS
      ========================================================= */}

      {showDrawer && (
        <UserDetails
          user={selectedUser}
          onClose={() =>
            setShowDrawer(false)
          }
        />
      )}

      {/* =========================================================
          EDIT USER
      ========================================================= */}

      {showModal && (
        <UserModal
          key={
            selectedUser?.id ||
            selectedUser?._id
          }
          user={selectedUser}
          onClose={() =>
            setShowModal(false)
          }
          onSave={(updatedUser) => {
            setUsers(
              (prevUsers) =>
                prevUsers.map(
                  (user) => {
                    const updatedId =
                      updatedUser?.id ||
                      updatedUser?._id;

                    const currentId =
                      user?.id ||
                      user?._id;

                    if (
                      updatedId &&
                      String(
                        currentId
                      ) ===
                        String(
                          updatedId
                        )
                    ) {
                      return {
                        ...user,
                        ...updatedUser,
                      };
                    }

                    return user;
                  }
                )
            );
          }}
        />
      )}

      {/* =========================================================
          ASSIGN ROLE
      ========================================================= */}

      {showAssignRole && (
        <AssignRoleModal
          user={selectedUser}
          onClose={() =>
            setShowAssignRole(false)
          }
          onRoleAssigned={
            handleRoleAssigned
          }
        />
      )}

      {/* =========================================================
          USER STATUS MODAL
      ========================================================= */}

      {showSuspend && (
        <SuspendUserModal
          user={selectedUser}
          onClose={() =>
            setShowSuspend(false)
          }
          onStatusChanged={
            handleStatusChanged
          }
        />
      )}
    </>
  );
}