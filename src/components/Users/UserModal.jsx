 
  import React from "react";
  import { useState, useEffect } from "react";
import { X, UserPlus, Save } from "lucide-react";
import "./style/users.css";

export default function UserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Publisher Admin",
    organization: "Ministry of ICT",
    status: "Active",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "Publisher Admin",
        organization: user.organization || "Ministry of ICT",
        status: user.status || "Active",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user ? { ...user, ...formData, name: formData.fullName } : formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="user-modal">
        <div className="modal-header">
          <div>
            <h2>{user ? "Edit User" : "Add New User"}</h2>
            <p>Manage user profile and access control</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              required
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john@domain.com"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+963..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="Super Admin">Super Admin</option>
                <option value="Publisher Admin">Publisher Admin</option>
                <option value="Publisher Manager">Publisher Manager</option>
                <option value="Bidder Admin">Bidder Admin</option>
                <option value="Bidder Manager">Bidder Manager</option>
                <option value="Support">Support</option>
                <option value="Auditor">Auditor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {user ? (
                <>
                  <Save size={18} /> Update
                </>
              ) : (
                <>
                  <UserPlus size={18} /> Add User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}