import "./Navbar.css";
import { Bell, Languages, Moon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar({
  title,
  showBackButton = false,
  showSearch = false,
  showProfile = true,
  showLanguage = true,      // زر تغيير اللغة (ظاهر افتراضياً)
  showTheme = true,         // زر الثيم (ظاهر افتراضياً)
  showNotifications = true, // زر الإشعارات (ظاهر افتراضياً)
  notificationCount = 3,    // عدد الإشعارات ديناميكي
  children,
}) {
  const navigate = useNavigate();

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

      {/* القسم الأيمن: التحكم الكامل بالأزرار والبروفايل */}
      <div className="navbar-right">
        {showLanguage && (
          <button className="navbar-lan" title="Change Language">
            <Languages size={20} />
          </button>
        )}

        {showTheme && (
          <button className="navbar-them" title="Toggle Theme">
            <Moon size={20} />
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

        {showProfile && (
          <div className="profile">
            <img
              src="https://i.pravatar.cc/40"
              alt="Admin"
              className="profile-img"
            />
            <div className="profile-info">
              <h4>Admin</h4>
              <p>Administrator</p>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;