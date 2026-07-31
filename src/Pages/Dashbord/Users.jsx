import { useState } from "react";
import UserStats from "../../components/Users/UserStats";
import UserFilters from "../../components/Users/UserFilters";
import UserTable from "../../components/Users/UserTable";
import Sidebar from "../../components/SideBar";
import "../../components/Users/style/users.css";

export default function Users() {
  // 1️⃣ حالة التحكم بتوسيع وإغلاق السايدبار بنفس تسمية صفحة المناقصات
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // حالة الفلاتر الخاصة بالصفحة
  const [filters, setFilters] = useState({
    search: "",
    role: "All",
    organization: "All",
    status: "All",
  });

  return (
    <div className={`users_page ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* 2️⃣ السايدبار وتمرير الحالة ليتطابق مع باقي الصفحات */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />

      {/* 3️⃣ تغليف المحتوى للحفاظ على محاذاة وسلاسة التوسع والانكماش */}
      <div className="main-content-wrapper">
        <div className="Page-hero">
          <div className="hero-content">
            <h1>Users Management</h1>
            <p>Monitor, manage and review all registered users profiles and statuses.</p>
          </div>
        </div>

        <UserStats />

        <UserFilters
          filters={filters}
          setFilters={setFilters}
        />

        <UserTable filters={filters} />
      </div>
    </div>
  );
}