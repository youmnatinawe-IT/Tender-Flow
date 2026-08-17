
import "./Navbar.css";
import { Bell, Languages, ArrowLeft, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  // جلب بيانات الأدمن المخزنة (مع قيم افتراضية)
  const storedUser = JSON.parse(localStorage.getItem("user")) || {
    name: "System Administrator",
    email: "admin@admin.com",
    role: "ADMIN",
    avatar: null, // يمكن وضع رابط الصورة هنا عند توفرها
  };

  // استخراج الأحرف الأولى للأدمن في حال عدم وجود صورة (مثل SA)
  const getInitials = (name) => {
    if (!name) return "SA";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar">
      {/* القسم الأيسر: زر الرجوع، العنوان، حقل البحث */}
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
          {title && <h1 className="navbar-page-title">{title}</h1>}
        </div>

        {showSearch && (
          <div className="search-box">
            <input type="text" placeholder="Search..." />
          </div>
        )}

        {children}
      </div>

      {/* القسم الأيمن: أزرار التحكم وأيقونة البروفايل */}
      <div className="navbar-right">
        {showLanguage && (
          <button className="navbar-lan" title="Change Language">
            <Languages size={20} />
          </button>
        )}

        {showNotifications && (
          <button className="notification-btn" title="Notifications">
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="badge">{notificationCount}</span>
            )}
          </button>
        )}

        {/* أيقونة/زر البروفايل: نقرة واحدة تنقل لصفحة الإعدادات والبروفايل */}
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
              <p>{storedUser.role || "Administrator"}</p>
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