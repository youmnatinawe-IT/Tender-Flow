import { useState } from "react";
import VendorStats from "../../components/Vendors/VendorStats";
import VendorFilter from "../../components/Vendors/VendorFilter";
import VendorTable from "../../components/Vendors/VendorTable";
import VendorDetails from "../../components/Vendors/VendorDetails";
import { mockVendors } from "../../data/mockVendors";
import "../../components/vendors/style/vendor.css";
import Sidebar from "../../components/SideBar";
export default function VendorsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [vendors, setVendors] = useState(mockVendors);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState(null);

  // تحديث حالة المنفذ (قبول / رفض / حظر)
  const handleUpdateStatus = (vendorId, newStatus) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status: newStatus } : v)),
    );
    setSelectedVendor(null); // إغلاق النافذة بعد التحديث
  };

  // فلترة القائمة
  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.companyName.includes(searchTerm) || v.crNumber.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div
      className={`users_page ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      {/* 2️⃣ السايدبار وتمرير الحالة ليتطابق مع باقي الصفحات */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div className="main-content-wrapper">
        <div className="Page-hero">
          <div className="hero-content">
            <h1>Vendors Management</h1>
            <p>
              Monitor, manage and review all registered vendors profiles and
              statuses.
            </p>
          </div>
        </div>

        {/* 1. الكروت الإحصائية */}
        <VendorStats vendors={vendors} />

        {/* 2. شريط التصفية والبحث */}
        <VendorFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* 3. الجدول الرئيسي */}
        <VendorTable
          vendors={filteredVendors}
          onSelectVendor={(vendor) => setSelectedVendor(vendor)}
        />

        {/* 4. نافذة المعاينة والتدقيق */}
        {selectedVendor && (
          <VendorDetails
            vendor={selectedVendor}
            onClose={() => setSelectedVendor(null)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </div>
  );
}
