import { useState } from "react";
import { UserPlus } from "lucide-react";
import UserStats from "../../components/Users/UserStats";
import UserFilters from "../../components/Users/UserFilters";
import UserTable from "../../components/Users/UserTable";
import Sidebar from "../../components/SideBar";
import "../../components/Users/style/users.css";
import CreateAccount from "../../components/Users/CreateAccount";

export default function Users() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    role: "All",
    organization: "All",
    status: "All",
  });

  return (
    <div className={`users_page ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />

      <div className="main-content-wrapper">
        {/* Page Hero قسم الهيدر الرئيسي */}
        <div className="Page-hero">
          <div className="hero-content">
            <h1>Users Management</h1>
            <p>Monitor, manage and review all registered users profiles and statuses.</p>
          </div>

          {/* زر إنشاء الحساب المنظّم */}
          <button 
            className="create-account-btn" 
            onClick={() => setShowCreateAccount(true)}
          >
            <UserPlus size={18} />
            <span>Create Account</span>
          </button>
        </div>

        {showCreateAccount && (
          <CreateAccount
            onClose={() => setShowCreateAccount(false)}
            onCreated={(data) => {
              console.log("New account:", data);
              // إمكانية تحديث قائمة المستخدمين هنا
            }}
          />
        )}

        <UserStats />

        {/* تم الاستغناء عن زر add-user-btn داخل الفلاتر */}
        <UserFilters
          filters={filters}
          setFilters={setFilters}
        />

        <UserTable filters={filters} />
      </div>
    </div>
  );
}