import { useState } from "react";

import {
  LayoutDashboard,
  FileText,
  Building2,
  FileCheck,
  Users,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
} from "lucide-react";

import styles from "./SideBar.module.css";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useTranslation } from "react-i18next";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { t } = useTranslation();

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  /* =========================================================
     Get Current User
  ========================================================= */

  const getCurrentUser = () => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "Failed to read user:",
        error
      );

      return null;
    }
  };

  const currentUser = getCurrentUser();

  /* =========================================================
     Get User Type
  ========================================================= */

  let userType =
    currentUser?.type ||
    currentUser?.data?.type ||
    currentUser?.user_type ||
    currentUser?.data?.user_type ||
    currentUser?.role?.type ||
    currentUser?.role?.name ||
    currentUser?.data?.role?.type ||
    currentUser?.data?.role?.name ||
    "";

  /* =========================================================
     Fallback To JWT
  ========================================================= */

  if (!userType) {
    try {
      const token =
        localStorage.getItem("token");

      if (token) {
        const payload =
          token.split(".")[1];

        if (payload) {
          const decodedPayload =
            JSON.parse(
              atob(
                payload
                  .replace(/-/g, "+")
                  .replace(/_/g, "/")
              )
            );

          userType =
            decodedPayload?.type ||
            "";
        }
      }
    } catch (error) {
      console.error(
        "Failed to decode token:",
        error
      );
    }
  }

  /* =========================================================
     Normalize User Type
  ========================================================= */

  userType = String(userType)
    .trim()
    .toUpperCase();

  /* =========================================================
     Admin Check
  ========================================================= */

  const isAdmin =
    userType === "ADMIN" ||
    userType === "SYSTEM_ADMIN" ||
    userType === "SUPER_ADMIN";

  /* =========================================================
     Menu Items
  ========================================================= */

  const menuItems = [
    {
      id: "dashboard",
      text: t("sidebar.dashboard"),
      icon: <LayoutDashboard size={18} />,
      path: "/dashboard",
    },

    {
      id: "tenders",
      text: t("sidebar.tenders"),
      icon: <FileText size={18} />,
      path: "/tenders",
    },

    {
      id: "organizations",
      text: t("sidebar.organizations"),
      icon: <Building2 size={18} />,
      path: "/organizations",
    },

    {
      id: "vendors",
      text: t("sidebar.vendors"),
      icon: <FileCheck size={18} />,
      path: "/vendors",
    },

    {
      id: "users",
      text: t("sidebar.users"),
      icon: <Users size={18} />,
      path: "/users",
    },

    {
      id: "registrationRequests",
      text: "Registration Requests",
      icon: <ClipboardCheck size={18} />,
      path: "/registration-requests",
    },

    {
      id: "RolesPermissions",
      text: t(
        "sidebar.rolesPermissions"
      ),
      icon: <Shield size={18} />,
      path: "/RolesPermissions",
      adminOnly: true,
    },

    {
      id: "settings",
      text: t("sidebar.settings"),
      icon: <Settings size={18} />,
      path: "/settings",
    },
  ];

  /* =========================================================
     Show Admin Items Only For Admin
  ========================================================= */

  const visibleMenuItems =
    menuItems.filter((item) => {
      if (item.adminOnly) {
        return isAdmin;
      }

      return true;
    });

  /* =========================================================
     Render
  ========================================================= */

  return (
    <aside
      className={`${styles.sidebar} ${
        isCollapsed
          ? styles.collapsed
          : ""
      }`}
    >
      {/* Brand */}
      <div
        className={
          styles.brandSection
        }
      >
        {!isCollapsed && (
          <div
            className={
              styles.brandTitleContainer
            }
          >
            <div
              className={
                styles.logoWrapper
              }
            >
              <div
                className={
                  styles.blueLogoIcon
                }
              >
                ⚡
              </div>
            </div>

            <span
              className={
                styles.brandName
              }
            >
              {t("sidebar.brand")}
            </span>
          </div>
        )}

        <button
          type="button"
          className={
            styles.toggleBtn
          }
          onClick={() =>
            setIsCollapsed(
              (prev) => !prev
            )
          }
          title={
            isCollapsed
              ? t(
                  "sidebar.showSidebar"
                )
              : t(
                  "sidebar.hideSidebar"
                )
          }
          aria-label={
            isCollapsed
              ? t(
                  "sidebar.showSidebar"
                )
              : t(
                  "sidebar.hideSidebar"
                )
          }
        >
          {isCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav
        className={
          styles.navMenu
        }
      >
        <ul
          className={styles.list}
        >
          {visibleMenuItems.map(
            (item) => {
              const isActive =
                location.pathname ===
                  item.path ||
                (item.path ===
                  "/registration-requests" &&
                  location.pathname.startsWith(
                    "/registration-requests"
                  ));

              return (
                <li
                  key={item.id}
                  className={`
                    ${styles.item}
                    ${
                      isActive
                        ? styles.active
                        : ""
                    }
                    ${
                      isCollapsed
                        ? styles.collapsedItem
                        : ""
                    }
                  `}
                  onClick={() =>
                    navigate(
                      item.path
                    )
                  }
                >
                  <span
                    className={
                      styles.icon
                    }
                  >
                    {item.icon}
                  </span>

                  {!isCollapsed && (
                    <span
                      className={
                        styles.text
                      }
                    >
                      {item.text}
                    </span>
                  )}
                </li>
              );
            }
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;