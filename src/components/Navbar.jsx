import "./Navbar.css";

import {
  Bell,
  Languages,
  ArrowLeft,
  Settings,
  Moon,
  Sun,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Navbar({
  title,
  showBackButton = false,
  showSearch = false,
  showProfile = true,
  showLanguage = true,
  showNotifications = true,
  notificationCount = 3,
  children,
}) {
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();

  // جلب بيانات الأدمن المخزنة
  const storedUser = JSON.parse(localStorage.getItem("user")) || {
    name: "System Administrator",
    email: "admin@admin.com",
    role: "ADMIN",
    avatar: null,
  };

  // استخراج الأحرف الأولى
  const getInitials = (name) => {
    if (!name) return "SA";

    const parts = name.split(" ");

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar">
      {/* القسم الأيسر */}
      <div className="navbar-left">
        <div className="title-container">
          {showBackButton && (
            <button
              className="nav-back-icon-btn"
              onClick={() => navigate(-1)}
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          {title && (
            <h1 className="navbar-page-title">
              {title}
            </h1>
          )}
        </div>

        {showSearch && (
          <div className="search-box">
            <input
              type="text"
              placeholder="Search..."
            />
          </div>
        )}

        {children}
      </div>

      {/* القسم الأيمن */}
      <div className="navbar-right">

        {/* Theme Toggle */}
        <button
          className="navbar-icon-btn theme-toggle-btn"
          onClick={toggleTheme}
          title={
            theme === "light"
              ? "Switch to dark mode"
              : "Switch to light mode"
          }
          aria-label={
            theme === "light"
              ? "Switch to dark mode"
              : "Switch to light mode"
          }
        >
          {theme === "light" ? (
            <Moon size={20} />
          ) : (
            <Sun size={20} />
          )}
        </button>

        {/* Language */}
        {showLanguage && (
          <button
            className="navbar-lan"
            title="Change Language"
          >
            <Languages size={20} />
          </button>
        )}

        {/* Notifications */}
        {showNotifications && (
          <button
            className="notification-btn"
            title="Notifications"
          >
            <Bell size={20} />

            {notificationCount > 0 && (
              <span className="badge">
                {notificationCount}
              </span>
            )}
          </button>
        )}

        {/* Profile */}
        {showProfile && (
          <button
            className="profile-btn"
            onClick={() => navigate("/settings")}
            title="Admin Profile & Settings"
          >
            {storedUser.avatar ? (
              <img
                src={storedUser.avatar}
                alt={storedUser.name}
                className="profile-img"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                {getInitials(storedUser.name)}
              </div>
            )}

            <div className="profile-info">
              <h4>{storedUser.name}</h4>
              <p>
                {storedUser.role || "Administrator"}
              </p>
            </div>

            <div className="settings-badge-icon">
              <Settings size={14} />
            </div>
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;