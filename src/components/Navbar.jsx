import "./Navbar.css";

import {
  Bell,
  ArrowLeft,
  Settings,
  Moon,
  Sun,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { useTheme } from "../context/ThemeContext";

import { getInitials } from "../utils/format";


function Navbar({
  title,
  showBackButton = false,
  showSearch = false,
  showProfile = true,
  showNotifications = true,
  notificationCount = 3,
  children,
}) {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const {
    theme,
    toggleTheme,
  } = useTheme();


  /* =========================================================
     Current User
  ========================================================= */

  let storedUser = null;

  try {
    storedUser =
      JSON.parse(
        localStorage.getItem("user")
      ) || null;
  } catch {
    storedUser = null;
  }


  const user = storedUser || {
    name: "System Administrator",
    email: "admin@admin.com",
    role: "ADMIN",
    avatar: null,
  };


  /* =========================================================
     Render
  ========================================================= */

  return (
    <nav className="navbar">

      {/* =====================================================
          Left
      ====================================================== */}

      <div className="navbar-left">

        <div className="title-container">

          {showBackButton && (
            <button
              type="button"
              className="nav-back-icon-btn"
              onClick={() => navigate(-1)}
              title={t("navbar.back")}
              aria-label={t("navbar.back")}
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
              placeholder={t(
                "navbar.searchPlaceholder"
              )}
              aria-label={t(
                "navbar.searchPlaceholder"
              )}
            />
          </div>
        )}


        {children}

      </div>


      {/* =====================================================
          Right
      ====================================================== */}

      <div className="navbar-right">

        {/* Theme */}
        <button
          type="button"
          className="navbar-icon-btn theme-toggle-btn"
          onClick={toggleTheme}
          title={
            theme === "light"
              ? t("navbar.switchToDark")
              : t("navbar.switchToLight")
          }
          aria-label={
            theme === "light"
              ? t("navbar.switchToDark")
              : t("navbar.switchToLight")
          }
        >
          {theme === "light" ? (
            <Moon size={20} />
          ) : (
            <Sun size={20} />
          )}
        </button>


        {/* Notifications */}
        {showNotifications && (
          <button
            type="button"
            className="notification-btn"
            title={t("navbar.notifications")}
            aria-label={t("navbar.notifications")}
          >
            <Bell size={20} />

            {notificationCount > 0 && (
              <span className="notification-badge">
                {notificationCount}
              </span>
            )}
          </button>
        )}


        {/* Profile */}
        {showProfile && (
          <button
            type="button"
            className="profile-btn"
            onClick={() =>
              navigate("/settings")
            }
            title={t(
              "navbar.profileSettings"
            )}
          >

            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="profile-img"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                {getInitials(
                  user.name ||
                    "System Administrator"
                )}
              </div>
            )}


            <div className="profile-info">

              <h4>
                {user.name ||
                  "System Administrator"}
              </h4>

              <p>
                {user.role ||
                  t("navbar.administrator")}
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