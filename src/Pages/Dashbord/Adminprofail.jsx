import { useState } from 'react';
import './Adminprofail.css';

const AdminProfile = () => {
  const [adminData, setAdminData] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("Error parsing user", e);
      }
    }
    return {
      name: 'System Administrator',
      email: 'admin@admin.com',
      phone: '0999999999',
      role: 'ADMIN',
    };
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  const getInitials = (name) => {
    if (!name) return 'SA';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const existingUser = JSON.parse(localStorage.getItem('user')) || {};
    const updatedUser = { ...existingUser, ...adminData };
    localStorage.setItem('user', JSON.stringify(updatedUser));

    setMessage({ type: 'success', text: 'Profile updated successfully!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }
    setMessage({ type: 'success', text: 'Password updated successfully!' });
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <div className="admin-profile-container">
      {/* Header */}
      <div className="admin-profile-header">
        <h1>Admin Profile</h1>
        <p>Manage your personal account details and security settings.</p>
      </div>

      {/* Alert Message */}
      {message.text && (
        <div className={`alert-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-profile-grid">
        {/* Left Column: Card */}
        <div className="profile-card">
          <div className="avatar-circle">
            {getInitials(adminData.name)}
          </div>
          <h2>{adminData.name || 'Admin'}</h2>
          <span className="role-badge">{adminData.role || 'ADMIN'}</span>
          <p className="admin-email">{adminData.email}</p>
        </div>

        {/* Right Column: Forms */}
        <div className="forms-container">
          {/* Personal Information */}
          <div className="form-card">
            <h3>Personal Information</h3>
            <form onSubmit={handleProfileSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={adminData.name}
                    onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={adminData.phone}
                    onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={adminData.email}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="form-card">
            <h3>Security & Password</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-dark">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;