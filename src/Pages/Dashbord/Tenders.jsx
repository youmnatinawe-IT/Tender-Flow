import { useState } from "react";
import TenderHero from "../../components/Tenders/TenderHero";
// import TenderStats from "../../components/Tenders/TenderStat";
import TenderFilter from "../../components/Tenders/TenderFilter";
// import TenderAlerts from "../../components/Tenders/TenderAlerts";

import TenderTable from "../../components/Tenders/TenderTable";
import Sidebar from "../../components/SideBar";
import "../../components/Tenders/style/tender.css";
export default function Tenders() {
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // حالة الفلاتر
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    type: "",
    publisher: "",
    date: "",

  });

  return (
    <div className={`tender_page ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* 2️⃣ تمرير الحالة والدالة الخاصة بتغييرها إلى مكون السايدبار */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />

      {/* 3️⃣ تغليف المحتوى الرئيسي للحفاظ على محاذاة الهيكل Layout */}
      <div className="main-content-wrapper">
        <TenderHero />
        {/* <TenderStats /> */}
        <TenderFilter filters={filters} setFilters={setFilters} />
        <TenderTable filters={filters} />

        <div className="tenders-middle-section">
          {/* <TenderAlerts /> */}
   
        </div>
      </div> 
    </div>
  );
}