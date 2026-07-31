import { useState } from "react";
import {
  X,
  User,
  Building2,
  ShieldCheck,
  Activity,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function UserDetails({ user, onClose }) {
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) return null;

  const permissions = [
    "Create Tender",
    "Edit Tender",
    "Publish Tender",
    "View Reports",
    "Manage Organizations",
  ];

  const activities = [
    { id: 1, action: "Logged in", date: "Today - 10:25 AM" },
    { id: 2, action: "Created Tender #304", date: "Yesterday" },
    { id: 3, action: "Updated Profile Info", date: "3 Days Ago" },
  ];

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="user-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <h2>User Details</h2>
          <button className="close-drawer-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="drawer-profile">
          <div className="drawer-avatar">{user.name?.charAt(0) || "U"}</div>
          <div>
            <h3>{user.name}</h3>
            <span className="user-role-badge">{user.role}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="drawer-tabs">
          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            <User size={16} /> Profile
          </button>
          <button
            className={activeTab === "role" ? "active" : ""}
            onClick={() => setActiveTab("role")}
          >
            <ShieldCheck size={16} /> Role
          </button>
          <button
            className={activeTab === "permissions" ? "active" : ""}
            onClick={() => setActiveTab("permissions")}
          >
            <Building2 size={16} /> Permissions
          </button>
          <button
            className={activeTab === "activity" ? "active" : ""}
            onClick={() => setActiveTab("activity")}
          >
            <Activity size={16} /> Activity
          </button>
        </div>

        {/* Tab Content */}
        <div className="drawer-content">
          {activeTab === "profile" && (
            <div className="details-grid">
              <div className="detail-item">
                <Mail size={18} />
                <div>
                  <span>Email</span>
                  <strong>{user.email}</strong>
                </div>
              </div>
              <div className="detail-item">
                <Phone size={18} />
                <div>
                  <span>Phone</span>
                  <strong>{user.phone || "N/A"}</strong>
                </div>
              </div>
              <div className="detail-item">
                <Building2 size={18} />
                <div>
                  <span>Organization</span>
                  <strong>{user.organization || "N/A"}</strong>
                </div>
              </div>
              <div className="detail-item">
                <Calendar size={18} />
                <div>
                  <span>Status</span>
                  <strong>{user.status}</strong>
                </div>
              </div>
              <div className="detail-item">
                <Clock size={18} />
                <div>
                  <span>Last Login</span>
                  <strong>{user.lastLogin || "Never"}</strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === "role" && (
            <div className="role-card">
              <h3>{user.role}</h3>
              <p>
                This role determines the user's access privileges, administrative scope,
                and execution permissions across the E-Tendering platform.
              </p>
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="permissions-list">
              {permissions.map((perm) => (
                <div className="permission-item" key={perm}>
                  <CheckCircle2 size={16} className="text-success" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="activity-list">
              {activities.map((act) => (
                <div className="activity-item" key={act.id}>
                  <h4>{act.action}</h4>
                  <p>{act.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}