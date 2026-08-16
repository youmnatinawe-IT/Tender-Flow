import { useState, useEffect } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  UserX,
  UserCheck,
  Loader2,
} from "lucide-react";

import { getUsers } from "../../services/userService";

import UserDetails from "./UserDatails";
import UserModal from "./UserModal";
import DeleteUserModal from "./DeleteUserModal";
import SuspendUserModal from "./SuspendUserModal";

const normalizeStatus = (status) =>
  String(status || "active").toLowerCase();

const capitalizeStatus = (status) => {
  const normalized = normalizeStatus(status);

  return (
    normalized.charAt(0).toUpperCase() +
    normalized.slice(1)
  );
};

export default function UserTable({ filters }) {
  const [selectedUser, setSelectedUser] = useState(null);

  const [showDrawer, setShowDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================================
  // Fetch Users
  // ============================================================

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getUsers();

        // getUsers in your service returns:
        // { success: true, data: ... }
        const data = result?.success
          ? result.data
          : result;

        const userList = Array.isArray(data)
          ? data
          : data?.users ||
            data?.data ||
            [];

        setUsers(userList);
      } catch (err) {
        console.error("Failed to fetch users:", err);

        setError(
          "Failed to fetch user list. Please ensure you are logged in again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ============================================================
  // Filters
  // ============================================================

  const safeFilters = filters || {
    search: "",
    role: "All",
    organization: "All",
    status: "All",
  };

  const filteredUsers = users.filter((user) => {
    const search = String(
      safeFilters.search || "",
    ).toLowerCase();

    const userName = [
      user.f_name,
      user.l_name,
      user.name,
      user.fullName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      userName.includes(search) ||
      String(user.email || "")
        .toLowerCase()
        .includes(search);

    const matchesRole =
      safeFilters.role === "All" ||
      user.role === safeFilters.role;

    const matchesOrg =
      safeFilters.organization === "All" ||
      user.organization === safeFilters.organization;

    const matchesStatus =
      safeFilters.status === "All" ||
      normalizeStatus(user.status) ===
        String(safeFilters.status).toLowerCase();

    return (
      matchesSearch &&
      matchesRole &&
      matchesOrg &&
      matchesStatus
    );
  });

  // ============================================================
  // Delete User
  // ============================================================

  const handleDeleteUser = (userToDelete) => {
    const id =
      userToDelete?.id ||
      userToDelete?._id;

    setUsers((prevUsers) =>
      prevUsers.filter(
        (u) => (u.id || u._id) !== id,
      ),
    );

    setShowDelete(false);
  };

  // ============================================================
  // Update User Status after API success
  // ============================================================

  const handleStatusChanged = (
    userId,
    newStatus,
  ) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        const id = u.id || u._id;

        if (id === userId) {
          return {
            ...u,
            status: newStatus,
          };
        }

        return u;
      }),
    );

    setShowSuspend(false);
  };

  // ============================================================
  // Loading
  // ============================================================

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
          style={{ margin: "0 auto" }}
        />

        <p style={{ marginTop: "10px" }}>
          Loading users...
        </p>
      </div>
    );
  }

  // ============================================================
  // Error
  // ============================================================

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

  // ============================================================
  // Table
  // ============================================================

  return (
    <>
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
              filteredUsers.map((user) => {
                // ==================================================
                // IMPORTANT:
                // Normalize status only once
                // ==================================================

                const status = normalizeStatus(
                  user.status,
                );

                const isPending =
                  status === "pending";

                const isActive =
                  status === "active";

                const isRejected =
                  status === "rejected";

                const isBanned =
                  status === "banned";

                return (
                  <tr
                    key={
                      user.id ||
                      user._id
                    }
                  >
                    {/* ================= USER ================= */}

                    <td>
                      <div className="user-info">
                        <div className="avatar">
                          {(
                            user.name ||
                            user.fullName ||
                            user.f_name ||
                            "U"
                          ).charAt(0)}
                        </div>

                        <div>
                          <strong>
                            {user.name ||
                              user.fullName ||
                              `${user.f_name || ""} ${
                                user.l_name || ""
                              }`.trim()}
                          </strong>

                          <p>
                            {user.phone ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ================= EMAIL ================= */}

                    <td>
                      {user.email ||
                        "N/A"}
                    </td>

                    {/* ================= ORGANIZATION ================= */}

                    <td>
                      {user.organization ||
                        "N/A"}
                    </td>

                    {/* ================= ROLE ================= */}

                    <td>
                      <span className="role-badge">
                        {user.role ||
                          "N/A"}
                      </span>
                    </td>

                    {/* ================= STATUS ================= */}

                    <td>
                      <span
                        className={`status-badge ${status}`}
                      >
                        {capitalizeStatus(
                          user.status,
                        )}
                      </span>
                    </td>

                    {/* ================= LAST LOGIN ================= */}

                    <td>
                      {user.lastLogin ||
                        "N/A"}
                    </td>

                    {/* ================= ACTIONS ================= */}

                    <td>
                      <div className="actions">

                        {/* --------------------------------------
                            1. VIEW
                        --------------------------------------- */}

                        <button
                          className="action-btn view"
                          title="View Details"
                          onClick={() => {
                            setSelectedUser(
                              user,
                            );
                            setShowDrawer(
                              true,
                            );
                          }}
                        >
                          <Eye size={16} />
                        </button>

                        {/* --------------------------------------
                            2. EDIT
                        --------------------------------------- */}

                        <button
                          className="action-btn edit"
                          title="Edit User"
                          onClick={() => {
                            setSelectedUser(
                              user,
                            );
                            setShowModal(
                              true,
                            );
                          }}
                        >
                          <Pencil size={16} />
                        </button>

                        {/* --------------------------------------
                            3. STATUS ACTION
                        --------------------------------------- */}

                        {/* PENDING → Accept / Reject */}

                        {isPending && (
                          <button
                            className="action-btn activate"
                            title="Review User"
                            onClick={() => {
                              setSelectedUser(
                                user,
                              );
                              setShowSuspend(
                                true,
                              );
                            }}
                          >
                            <UserCheck
                              size={16}
                            />
                          </button>
                        )}

                        {/* ACTIVE → Ban */}

                        {isActive && (
                          <button
                            className="action-btn suspend"
                            title="Ban User"
                            onClick={() => {
                              setSelectedUser(
                                user,
                              );
                              setShowSuspend(
                                true,
                              );
                            }}
                          >
                            <UserX
                              size={16}
                            />
                          </button>
                        )}

                        {/* REJECTED → Resend */}

                        {isRejected && (
                          <button
                            className="action-btn activate"
                            title="Send for Review Again"
                            onClick={() => {
                              setSelectedUser(
                                user,
                              );
                              setShowSuspend(
                                true,
                              );
                            }}
                          >
                            <UserCheck
                              size={16}
                            />
                          </button>
                        )}

                        {/* BANNED
                            No action because
                            backend has no unban API
                        */}

                        {isBanned && (
                          <button
                            className="action-btn"
                            title="Banned Account"
                            disabled
                            style={{
                              opacity: 0.45,
                              cursor:
                                "not-allowed",
                            }}
                          >
                            <UserX
                              size={16}
                            />
                          </button>
                        )}

                        {/* --------------------------------------
                            4. DELETE
                        --------------------------------------- */}

                        <button
                          className="action-btn delete"
                          title="Delete User"
                          onClick={() => {
                            setSelectedUser(
                              user,
                            );
                            setShowDelete(
                              true,
                            );
                          }}
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="no-data"
                >
                  No users found matching
                  your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================
          USER DETAILS
      ======================================================== */}

      {showDrawer && (
        <UserDetails
          user={selectedUser}
          onClose={() =>
            setShowDrawer(false)
          }
        />
      )}

      {/* ========================================================
          EDIT USER
      ======================================================== */}

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
            setUsers((prevUsers) =>
              prevUsers.map((u) => {
                const updatedId =
                  updatedUser?.id ||
                  updatedUser?._id;

                const currentId =
                  u.id || u._id;

                if (
                  updatedId &&
                  currentId ===
                    updatedId
                ) {
                  return {
                    ...u,
                    ...updatedUser,
                  };
                }

                return u;
              }),
            );
          }}
        />
      )}

      {/* ========================================================
          DELETE USER
      ======================================================== */}

      {showDelete && (
        <DeleteUserModal
          user={selectedUser}
          onClose={() =>
            setShowDelete(false)
          }
          onDelete={
            handleDeleteUser
          }
        />
      )}

      {/* ========================================================
          USER STATUS MODAL
      ======================================================== */}

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