import  { useState } from "react";
import { Eye, Pencil, Trash2, UserX, UserCheck } from "lucide-react";

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

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Ahmed Hassan",
      email: "ahmed@ict.gov.sy",
      phone: "0999999999",
      organization: "Ministry of ICT",
      role: "Publisher Admin",
      status: "Active",
      lastLogin: "2 hours ago",
    },
    {
      id: 2,
      name: "Sara Ali",
      email: "sara@abc.com",
      phone: "0988888888",
      organization: "ABC Company",
      role: "Bidder Manager",
      status: "Suspended",
      lastLogin: "Yesterday",
    },
    {
      id: 3,
      name: "Mohammad Khaled",
      email: "mk@xyz.com",
      phone: "0966666666",
      organization: "XYZ Ltd",
      role: "Support",
      status: "Pending",
      lastLogin: "Never",
    },
    {
      id: 4,
      name: "Lina Ahmad",
      email: "lina@ict.gov.sy",
      phone: "0955555555",
      organization: "Ministry of ICT",
      role: "Auditor",
      status: "Active",
      lastLogin: "10 minutes ago",
    },
  ]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());
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
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="avatar">{user.name.charAt(0)}</div>
                      <div>
                        <strong>{user.name}</strong>
                        <p>{user.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.organization}</td>
                  <td><span className="role-badge">{user.role}</span></td>
                  <td>
                    <span className={`status-badge ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.lastLogin}</td>
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