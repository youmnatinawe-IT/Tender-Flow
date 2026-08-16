import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Building2,
  FileCheck,
  Users,

  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import styles from "./SideBar.module.css";
import { useNavigate, useLocation } from "react-router-dom";
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // حالة التحكم بالسايد بار (مفتوح أم مغلق)
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      text: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "/dashboard",
    },
    {
      id: "tenders",
      text: "Tenders",
      icon: <FileText size={18} />,
      path: "/tenders",
    },
    {
      id: "organizations",
      text: "Organizations",
      icon: <Building2 size={18} />,
      path: "/organizations",
    },
    {
      id: "vendors",
      text: "vendors",
      icon: <FileCheck size={18} />,
      path: "/vendors",
    },
    { id: "users", text: "Users", icon: <Users size={18} />, path: "/users" },
  
    //   { id: 'analytics', text: 'Analytics', icon: <BarChart3 size={18} />, path: '/analytics' },
    //   { id: 'settings', text: 'Settings', icon: <Settings size={18} />, path: '/settings' },
  ];

  return (
    // نمرر كلاس collapsed ديناميكياً إذا كانت القيمة true لتصغير العرض
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
    >
      <div className={styles.brandSection}>
        {!isCollapsed && (
          <div className={styles.brandTitleContainer}>
            <div className={styles.logoWrapper}>
              <div className={styles.blueLogoIcon}>⚡</div>
            </div>
            <span className={styles.brandName}>Tender Flow</span>
          </div>
        )}

        {/* زر الإخفاء والإظهار */}
        <button
          className={styles.toggleBtn}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Show Sidebar" : "Hide Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className={styles.navMenu}>
        <ul className={styles.list}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <li
                key={item.id}
                className={`${styles.item} ${isActive ? styles.active : ""} ${isCollapsed ? styles.collapsedItem : ""}`}
                onClick={() => navigate(item.path)}
                style={{ cursor: "pointer" }}
              >
                <span className={styles.icon}>{item.icon}</span>
                {/* إخفاء النص عند تصغير السايد بار ليظهر الأيقونات فقط */}
                {!isCollapsed && (
                  <span className={styles.text}>{item.text}</span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
