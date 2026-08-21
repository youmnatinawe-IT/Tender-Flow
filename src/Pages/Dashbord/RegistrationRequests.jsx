import { useEffect, useMemo, useState } from "react";

import {
  ClipboardCheck,
  Users,
  Building2,
  Eye,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  Search,
  Loader2,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

import Sidebar from "../../components/SideBar";
import UserDetails from "../../components/Users/UserDatails";

import {
  getUsers,
  acceptUser,
  rejectUser,
  banUser,
  resendPendingUser,
} from "../../services/userService";

import { getExecutorOrgs } from "../../services/organizationService";

import "../../components/Users/style/registrationRequests.css";

/* =========================================================
   Helpers
========================================================= */

const normalizeStatus = (status) =>
  String(status || "")
    .trim()
    .toLowerCase();

const getUserId = (user) => user?.id || user?._id;

const getDisplayName = (user) => {
  const fullName =
    user?.name ||
    user?.fullName ||
    `${user?.f_name || ""} ${user?.l_name || ""}`.trim();

  return fullName || "Unknown User";
};

/* =========================================================
   Organization Name
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
    user.ExecutorOrg?.org_name ||
    user.ExecutorOrg?.name ||
    "N/A"
  );
};

/* =========================================================
   User Role
========================================================= */

const getUserRole = (user) => {
  if (!user) return "N/A";

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

  if (
    Array.isArray(user.roles) &&
    user.roles.length
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

  return user.role || user.type || "N/A";
};

/* =========================================================
   User Type
========================================================= */

const getUserType = (user) => {
  const values = [
    user?.organization_type,
    user?.organizationType,
    user?.org_type,
    user?.orgType,
    user?.type,
    user?.user_type,
    user?.userType,
    user?.role?.code,
    user?.role?.name,
  ];

  return values
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

/* =========================================================
   Executor
========================================================= */

const isExecutor = (user) => {
  const value = getUserType(user);

  return (
    value.includes("executor") ||
    value.includes("execute") ||
    value.includes("منفذ") ||
    value.includes("contractor")
  );
};

/* =========================================================
   Date
========================================================= */

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
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

export default function RegistrationRequests() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);

  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState(null);

  const [error, setError] = useState(null);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: null,
    user: null,
  });

  const [reason, setReason] = useState("");

  /* =========================================================
     Fetch Users + Executor Organizations
  ========================================================= */

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        usersRes,
        executorsRes,
      ] = await Promise.all([
        getUsers(),
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
         Executors
      ===================================================== */

      const executors = executorsRes?.success
        ? executorsRes.data?.data ||
          executorsRes.data?.executors ||
          executorsRes.data ||
          []
        : [];

      /* =====================================================
         Executor Organization Map

         org._id / org.id
         =>
         org.org_name / org.name
      ===================================================== */

      const organizationMap = new Map();

      if (Array.isArray(executors)) {
        executors.forEach((org) => {
          const organizationId =
            org?._id || org?.id;

          if (!organizationId) return;

          const organizationName =
            org?.org_name ||
            org?.name ||
            org?.title ||
            "N/A";

          organizationMap.set(
            String(organizationId),
            organizationName
          );
        });
      }

      /* =====================================================
         Enrich Users

         فقط Users تبع Executors
      ===================================================== */

      const enrichedUsers = userList
        .filter(isExecutor)
        .map((user) => {
          const organizationId =
            user?.org_id ||
            user?.organization_id ||
            user?.orgId;

          const mappedOrganizationName =
            organizationId
              ? organizationMap.get(
                  String(organizationId)
                )
              : null;

          return {
            ...user,

            organization:
              mappedOrganizationName ||
              getOrganizationName(user) ||
              "N/A",
          };
        });

      setUsers(enrichedUsers);
    } catch (err) {
      console.error(
        "Failed to fetch executor registration requests:",
        err
      );

      setError(
        "Failed to load executor registration requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     Initial Load
  ========================================================= */

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =========================================================
     Pending Executor Users
  ========================================================= */

  const pendingUsers = useMemo(() => {
    return users.filter(
      (user) =>
        normalizeStatus(user?.status) ===
        "pending"
    );
  }, [users]);

  /* =========================================================
     Search
  ========================================================= */

  const filteredRequests = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return pendingUsers;
    }

    return pendingUsers.filter((user) => {
      const name =
        getDisplayName(user).toLowerCase();

      const email = String(
        user?.email || ""
      ).toLowerCase();

      const organization =
        getOrganizationName(user).toLowerCase();

      const phone = String(
        user?.phone || ""
      ).toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        organization.includes(query) ||
        phone.includes(query)
      );
    });
  }, [pendingUsers, search]);

  /* =========================================================
     Modal
  ========================================================= */

  const closeModal = () => {
    if (actionLoading) return;

    setModal({
      open: false,
      type: null,
      user: null,
    });

    setReason("");
  };

  const openActionModal = (type, user) => {
    setModal({
      open: true,
      type,
      user,
    });

    setReason("");
  };

  /* =========================================================
     Handle Action
  ========================================================= */

  const handleAction = async () => {
    const user = modal.user;

    if (!user) return;

    const userId = getUserId(user);

    if (!userId) return;

    if (
      (modal.type === "reject" ||
        modal.type === "ban") &&
      !reason.trim()
    ) {
      return;
    }

    try {
      setActionLoading(userId);

      let response;

      if (modal.type === "accept") {
        response = await acceptUser(userId);
      }

      if (modal.type === "reject") {
        response = await rejectUser(
          userId,
          reason.trim()
        );
      }

      if (modal.type === "ban") {
        response = await banUser(
          userId,
          reason.trim()
        );
      }

      if (modal.type === "resend") {
        response =
          await resendPendingUser(userId);
      }

      if (response?.success === false) {
        throw new Error(
          response?.error?.message ||
            "Action failed"
        );
      }

      /* =====================================================
         Update Local State
      ===================================================== */

      if (modal.type === "accept") {
        setUsers((prev) =>
          prev.map((item) =>
            String(getUserId(item)) ===
            String(userId)
              ? {
                  ...item,
                  status: "ACTIVE",
                }
              : item
          )
        );
      }

      if (modal.type === "reject") {
        setUsers((prev) =>
          prev.map((item) =>
            String(getUserId(item)) ===
            String(userId)
              ? {
                  ...item,
                  status: "REJECTED",
                  reject_message:
                    reason.trim(),
                }
              : item
          )
        );
      }

      if (modal.type === "ban") {
        setUsers((prev) =>
          prev.map((item) =>
            String(getUserId(item)) ===
            String(userId)
              ? {
                  ...item,
                  status: "BANNED",
                  bann_message:
                    reason.trim(),
                }
              : item
          )
        );
      }

      if (modal.type === "resend") {
        setUsers((prev) =>
          prev.map((item) =>
            String(getUserId(item)) ===
            String(userId)
              ? {
                  ...item,
                  status: "PENDING",
                }
              : item
          )
        );
      }

      closeModal();
    } catch (err) {
      console.error(
        "Executor registration request action failed:",
        err
      );

      alert(
        err?.message ||
          "Something went wrong while processing the request."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================================================
     Empty State
  ========================================================= */

  const renderEmptyState = () => {
    return (
      <div className="registration-empty">
        <div className="registration-empty-icon">
          <ClipboardCheck size={28} />
        </div>

        <h3>
          No executor registration requests
        </h3>

        <p>
          There are currently no pending
          executor registration requests.
        </p>
      </div>
    );
  };

  /* =========================================================
     Render
  ========================================================= */

  return (
    <div
      className={`registration-page ${
        isSidebarCollapsed
          ? "sidebar-collapsed"
          : ""
      }`}
    >
      <Sidebar />

      <main className="registration-content">
        {/* =====================================================
            Hero
        ===================================================== */}

        <section className="registration-hero">
          <div className="registration-hero-left">
            <div className="registration-hero-icon">
              <ClipboardCheck size={24} />
            </div>

            <div>
              <h1>
                Executor Registration Requests
              </h1>

              <p>
                Review and manage pending
                executor account registrations.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="refresh-requests-btn"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RotateCcw
              size={16}
              className={
                loading
                  ? "registration-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </section>

        {/* =====================================================
            Stats
        ===================================================== */}

        <section className="registration-stats">
          <div className="registration-stat-card">
            <div className="registration-stat-icon total">
              <ClipboardCheck size={21} />
            </div>

            <div>
              <strong>
                {pendingUsers.length}
              </strong>

              <span>
                Total Pending Executors
              </span>
            </div>
          </div>

          <div className="registration-stat-card">
            <div className="registration-stat-icon executor">
              <Users size={21} />
            </div>

            <div>
              <strong>
                {pendingUsers.length}
              </strong>

              <span>
                Executors
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            Main Panel
        ===================================================== */}

        <section className="registration-panel">
          {/* ===================================================
              Search
          =================================================== */}

          <div className="registration-toolbar">
            <div className="registration-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search by name, email, organization or phone..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          </div>

          {/* ===================================================
              Error
          =================================================== */}

          {error && (
            <div className="registration-error">
              <XCircle size={18} />

              <span>{error}</span>

              <button
                type="button"
                onClick={fetchUsers}
              >
                Try Again
              </button>
            </div>
          )}

          {/* ===================================================
              Loading
          =================================================== */}

          {loading ? (
            <div className="registration-loading">
              <Loader2
                size={32}
                className="registration-spin"
              />

              <p>
                Loading executor registration
                requests...
              </p>
            </div>
          ) : filteredRequests.length ===
            0 ? (
            renderEmptyState()
          ) : (
            <div className="registration-table-wrapper">
              <table className="registration-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Organization</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th className="registration-actions-header">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map(
                    (user) => {
                      const userId =
                        getUserId(user);

                      const displayName =
                        getDisplayName(user);

                      const status =
                        normalizeStatus(
                          user?.status
                        );

                      const organizationName =
                        getOrganizationName(
                          user
                        );

                      return (
                        <tr
                          key={userId}
                        >
                          {/* =================================================
                              User
                          ================================================= */}

                          <td>
                            <div className="registration-user">
                              <div className="registration-avatar">
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

                                <span>
                                  ID:{" "}
                                  {String(
                                    userId
                                  ).slice(
                                    0,
                                    12
                                  )}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* =================================================
                              Organization
                          ================================================= */}

                          <td>
                            <div className="registration-org">
                              <Building2
                                size={16}
                              />

                              <span>
                                {
                                  organizationName
                                }
                              </span>
                            </div>
                          </td>

                          {/* =================================================
                              Contact
                          ================================================= */}

                          <td>
                            <div className="registration-contact">
                              <span>
                                <Mail
                                  size={13}
                                />

                                {user?.email ||
                                  "N/A"}
                              </span>

                              <span>
                                <Phone
                                  size={13}
                                />

                                {user?.phone ||
                                  "N/A"}
                              </span>
                            </div>
                          </td>

                          {/* =================================================
                              Role
                          ================================================= */}

                          <td>
                            <span className="registration-role">
                              {getUserRole(
                                user
                              )}
                            </span>
                          </td>

                          {/* =================================================
                              Date
                          ================================================= */}

                          <td>
                            <div className="registration-date">
                              <CalendarDays
                                size={14}
                              />

                              {formatDate(
                                user?.createdAt ||
                                  user?.created_at ||
                                  user?.createdOn
                              )}
                            </div>
                          </td>

                          {/* =================================================
                              Status
                          ================================================= */}

                          <td>
                            <span
                              className={`registration-status ${status}`}
                            >
                              <span className="status-dot" />

                              Pending
                            </span>
                          </td>

                          {/* =================================================
                              Actions
                          ================================================= */}

                          <td>
                            <div className="registration-actions">
                              {/* View */}

                              <button
                                type="button"
                                className="request-action view"
                                title="View Details"
                                onClick={() => {
                                  setSelectedUser(
                                    user
                                  );

                                  setShowDetails(
                                    true
                                  );
                                }}
                              >
                                <Eye
                                  size={16}
                                />
                              </button>

                              {/* Accept */}

                              <button
                                type="button"
                                className="request-action accept"
                                title="Accept User"
                                disabled={
                                  actionLoading ===
                                  userId
                                }
                                onClick={() =>
                                  openActionModal(
                                    "accept",
                                    user
                                  )
                                }
                              >
                                <CheckCircle2
                                  size={16}
                                />
                              </button>

                              {/* Reject */}

                              <button
                                type="button"
                                className="request-action reject"
                                title="Reject User"
                                disabled={
                                  actionLoading ===
                                  userId
                                }
                                onClick={() =>
                                  openActionModal(
                                    "reject",
                                    user
                                  )
                                }
                              >
                                <XCircle
                                  size={16}
                                />
                              </button>

                              {/* Ban */}

                              <button
                                type="button"
                                className="request-action ban"
                                title="Ban User"
                                disabled={
                                  actionLoading ===
                                  userId
                                }
                                onClick={() =>
                                  openActionModal(
                                    "ban",
                                    user
                                  )
                                }
                              >
                                <Ban
                                  size={16}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* =========================================================
          User Details
      ========================================================= */}

      {showDetails &&
        selectedUser && (
          <UserDetails
            user={selectedUser}
            onClose={() =>
              setShowDetails(false)
            }
          />
        )}

      {/* =========================================================
          Action Modal
      ========================================================= */}

      {modal.open &&
        modal.user && (
          <div className="registration-modal-overlay">
            <div className="registration-action-modal">
              <div
                className={`registration-modal-icon ${modal.type}`}
              >
                {modal.type ===
                  "accept" && (
                  <CheckCircle2
                    size={28}
                  />
                )}

                {modal.type ===
                  "reject" && (
                  <XCircle size={28} />
                )}

                {modal.type === "ban" && (
                  <Ban size={28} />
                )}

                {modal.type ===
                  "resend" && (
                  <RotateCcw
                    size={28}
                  />
                )}
              </div>

              <h2>
                {modal.type ===
                  "accept" &&
                  "Accept Registration"}

                {modal.type ===
                  "reject" &&
                  "Reject Registration"}

                {modal.type === "ban" &&
                  "Ban User"}

                {modal.type ===
                  "resend" &&
                  "Send Back for Review"}
              </h2>

              <p>
                {modal.type ===
                "accept"
                  ? `Are you sure you want to accept ${getDisplayName(
                      modal.user
                    )}?`
                  : modal.type ===
                    "reject"
                  ? `Reject the registration request for ${getDisplayName(
                      modal.user
                    )}.`
                  : modal.type ===
                    "ban"
                  ? `Ban ${getDisplayName(
                      modal.user
                    )}'s account?`
                  : `Send ${getDisplayName(
                      modal.user
                    )} back to pending review?`}
              </p>

              {(modal.type ===
                "reject" ||
                modal.type ===
                  "ban") && (
                <div className="registration-reason">
                  <label>
                    {modal.type ===
                    "reject"
                      ? "Rejection Reason"
                      : "Ban Reason"}
                  </label>

                  <textarea
                    value={reason}
                    onChange={(e) =>
                      setReason(
                        e.target.value
                      )
                    }
                    placeholder={
                      modal.type ===
                      "reject"
                        ? "Enter the reason for rejecting this registration..."
                        : "Enter the reason for banning this user..."
                    }
                    rows={4}
                  />
                </div>
              )}

              <div className="registration-modal-actions">
                <button
                  type="button"
                  className="registration-cancel-btn"
                  onClick={closeModal}
                  disabled={
                    !!actionLoading
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={`registration-confirm-btn ${modal.type}`}
                  onClick={
                    handleAction
                  }
                  disabled={
                    !!actionLoading ||
                    ((modal.type ===
                      "reject" ||
                      modal.type ===
                        "ban") &&
                      !reason.trim())
                  }
                >
                  {actionLoading ===
                  getUserId(
                    modal.user
                  ) ? (
                    <>
                      <Loader2
                        size={16}
                        className="registration-spin"
                      />

                      Processing...
                    </>
                  ) : (
                    <>
                      {modal.type ===
                        "accept" && (
                        <ShieldCheck
                          size={16}
                        />
                      )}

                      {modal.type ===
                        "reject" && (
                        <XCircle
                          size={16}
                        />
                      )}

                      {modal.type ===
                        "ban" && (
                        <Ban
                          size={16}
                        />
                      )}

                      {modal.type ===
                        "resend" && (
                        <RotateCcw
                          size={16}
                        />
                      )}

                      Confirm
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}