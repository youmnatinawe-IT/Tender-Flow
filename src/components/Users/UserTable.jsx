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

import UserDetails from "./UserDatails";
import UserModal from "./UserModal";
import AssignRoleModal from "./AssignRoleModal";
import SuspendUserModal from "./SuspendUserModal";

/* =========================================================
   Helpers
========================================================= */

const normalizeStatus = (status) =>
  String(status || "active").toLowerCase();

const capitalizeStatus = (status) => {
  const normalized = normalizeStatus(status);

  return (
    normalized.charAt(0).toUpperCase() +
    normalized.slice(1)
  );
};

/* =========================================================
   Get User Role
========================================================= */

const getUserRole = (user) => {
  if (!user) return "N/A";

  /*
    If role is object:
    {
      id,
      name,
      code
    }
  */

  if (
    user.role &&
    typeof user.role === "object"
  ) {
    return (
      user.role.name ||
      user.role.code ||
      user.role.role_name ||
      "N/A"
    );
  }

  /*
    If roles array exists
  */

  if (
    Array.isArray(user.roles) &&
    user.roles.length > 0
  ) {
    const role = user.roles[0];

    if (typeof role === "object") {
      return (
        role.name ||
        role.code ||
        role.role_name ||
        "N/A"
      );
    }

    return role;
  }

  return (
    user.role ||
    user.type ||
    "N/A"
  );
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
  const [selectedUser, setSelectedUser] =
    useState(null);

  const [showDrawer, setShowDrawer] =
    useState(false);

  const [showModal, setShowModal] =
    useState(false);

  const [showAssignRole, setShowAssignRole] =
    useState(false);

  const [showSuspend, setShowSuspend] =
    useState(false);

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  /* =========================================================
     Fetch Users + Organizations
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
        ] = await Promise.all([
          getUsers(),
          getPublisherOrgs(),
          getExecutorOrgs(),
        ]);

        /* =====================================================
           Users
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
           Publishers
        ===================================================== */

        const publishers = pubRes?.success
          ? pubRes.data?.data ||
            pubRes.data?.publishers ||
            pubRes.data ||
            []
          : [];

        /* =====================================================
           Executors
        ===================================================== */

        const executors = execRes?.success
          ? execRes.data?.data ||
            execRes.data?.executors ||
            execRes.data ||
            []
          : [];

        /* =====================================================
           All Organizations
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
           Organization Map
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
           Enrich Users
        ===================================================== */

        const enrichedUsers =
          userList.map((u) => ({
            ...u,

            organization:
              orgMap.get(
                String(u?.org_id)
              ) ||
              u?.organization ||
              "N/A",
          }));

        setUsers(enrichedUsers);
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
        getUserRole(user);

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
      prevUsers.map((u) => {
        const id =
          u?.id || u?._id;

        if (String(id) === String(userId)) {
          return {
            ...u,
            status: newStatus,
          };
        }

        return u;
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

    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        const currentId =
          u?.id || u?._id;

        if (
          String(currentId) ===
          String(userId)
        ) {
          return {
            ...u,

            /*
              Store role object
              because backend may
              return role object.
            */

            role:
              updatedRole?.role ||
              updatedRole,

            /*
              Also keep roles array
              if needed elsewhere.
            */

            roles: [
              updatedRole?.role ||
                updatedRole,
            ],
          };
        }

        return u;
      })
    );

    /*
      Update selected user as well
    */

    setSelectedUser((prev) => {
      if (!prev) return prev;

      return {
        ...prev,

        role:
          updatedRole?.role ||
          updatedRole,

        roles: [
          updatedRole?.role ||
            updatedRole,
        ],
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

                  const userId =
                    user?.id ||
                    user?._id;

                  const displayName =
                    user?.name ||
                    user?.fullName ||
                    `${user?.f_name || ""} ${
                      user?.l_name || ""
                    }`.trim() ||
                    "Unknown User";

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
                              .charAt(0)
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
                          {getUserRole(
                            user
                          )}
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

                          {/* ============================================
                              1. VIEW
                          ============================================ */}

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

                          {/* ============================================
                              2. EDIT
                          ============================================ */}

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

                          {/* ============================================
                              3. ASSIGN ROLE
                          ============================================ */}

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

                          {/* ============================================
                              4. PENDING
                              Accept / Reject
                          ============================================ */}

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

                          {/* ============================================
                              5. ACTIVE
                              Ban
                          ============================================ */}

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

                          {/* ============================================
                              6. REJECTED
                              Resend
                          ============================================ */}

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

                          {/* ============================================
                              7. BANNED
                          ============================================ */}

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
                  colSpan="7"
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
                  (u) => {
                    const updatedId =
                      updatedUser?.id ||
                      updatedUser?._id;

                    const currentId =
                      u?.id ||
                      u?._id;

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
                        ...u,
                        ...updatedUser,
                      };
                    }

                    return u;
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