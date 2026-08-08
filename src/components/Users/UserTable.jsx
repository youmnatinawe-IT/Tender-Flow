import { useState, useEffect } from "react";
import { Eye, Pencil, Trash2, UserX, UserCheck, Loader2 } from "lucide-react";
import { getUsers } from "../../services/userService"; // عدلي المسار بحسب موقع الملف

import UserDetails from "./UserDatails";
import UserModal from "./UserModal";
import DeleteUserModal from "./DeleteUserModal";
import SuspendUserModal from "./SuspendUserModal";

export default function UserTable({ filters }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);

  // حالات البيانات والتحميل والخطأ
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // جلب البيانات من الـ API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUsers();
        
        // قد تكون البيانات القادمة مصفوفة مباشرة (data) أو داخل كائن مثل (data.users)
        // قم بتكييف السطر القادم حسب استجابة الباك إند
        const userList = Array.isArray(data) ? data : (data.users || data.data || []);
        setUsers(userList);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("فشل في جلب قائمة المستخدمين. يرجى التأكد من التسجيل مجدداً.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const search = filters.search.toLowerCase();
    const matchesSearch =
      (user.name || user.fullName || "").toLowerCase().includes(search) ||
      (user.email || "").toLowerCase().includes(search);
    
    const matchesRole = filters.role === "All" || user.role === filters.role;
    const matchesOrg = filters.organization === "All" || user.organization === filters.organization;
    const matchesStatus = filters.status === "All" || user.status === filters.status;

    return matchesSearch && matchesRole && matchesOrg && matchesStatus;
  });

  const handleDeleteUser = (userToDelete) => {
    setUsers(users.filter((u) => u.id !== userToDelete.id));
    setShowDelete(false);
  };

  const handleToggleSuspend = (userToSuspend) => {
    setUsers(
      users.map((u) => {
        if (u.id === userToSuspend.id) {
          return {
            ...u,
            status: u.status === "Suspended" ? "Active" : "Suspended",
          };
        }
        return u;
      })
    );
    setShowSuspend(false);
  };

  if (loading) {
    return (
      <div className="table-container" style={{ textAlign: "center", padding: "40px" }}>
        <Loader2 className="animate-spin" size={32} style={{ margin: "0 auto" }} />
        <p style={{ marginTop: "10px" }}>جاري تحميل المستخدمين...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-container" style={{ textAlign: "center", padding: "30px", color: "red" }}>
        <p>{error}</p>
      </div>
    );
  }

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
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id || user._id}>
                  <td>
                    <div className="user-info">
                      <div className="avatar">{(user.name || user.fullName || "U").charAt(0)}</div>
                      <div>
                        <strong>{user.name || user.fullName}</strong>
                        <p>{user.phone || "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.organization || "N/A"}</td>
                  <td><span className="role-badge">{user.role || "N/A"}</span></td>
                  <td>
                    <span className={`status-badge ${(user.status || "active").toLowerCase()}`}>
                      {user.status || "Active"}
                    </span>
                  </td>
                  <td>{user.lastLogin || "N/A"}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="action-btn view"
                        title="View Details"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDrawer(true);
                        }}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="action-btn edit"
                        title="Edit User"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className={`action-btn ${user.status === "Suspended" ? "activate" : "suspend"}`}
                        title={user.status === "Suspended" ? "Activate User" : "Suspend User"}
                        onClick={() => {
                          setSelectedUser(user);
                          setShowSuspend(true);
                        }}
                      >
                        {user.status === "Suspended" ? <UserCheck size={16} /> : <UserX size={16} />}
                      </button>

                      <button
                        className="action-btn delete"
                        title="Delete User"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDelete(true);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No users found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDrawer && (
        <UserDetails user={selectedUser} onClose={() => setShowDrawer(false)} />
      )}

      {showModal && (
        <UserModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSave={(updatedUser) => {
            if (selectedUser) {
              setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
            } else {
              setUsers([...users, { ...updatedUser, id: Date.now() }]);
            }
          }}
        />
      )}

      {showDelete && (
        <DeleteUserModal
          user={selectedUser}
          onClose={() => setShowDelete(false)}
          onDelete={handleDeleteUser}
        />
      )}

      {showSuspend && (
        <SuspendUserModal
          user={selectedUser}
          onClose={() => setShowSuspend(false)}
          onSuspend={handleToggleSuspend}
        />
      )}
    </>
  );
}