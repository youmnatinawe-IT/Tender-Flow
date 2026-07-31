import { useState } from "react";
import Sidebar from "../../components/SideBar";
import { Plus, Download } from "lucide-react";
import OrganizationStats from "../../components/organaizations/organaizationstats";
import OrganizationFilters from "../../components/organaizations/organaizationfilters";
import OrganizationsTable from "../../components/organaizations/organaizationtable";
import "../../components/organaizations/style/organaization.css";
import { useNavigate } from "react-router-dom";

export default function Organizations() {
  const [organizations, setOrganizations] = useState([
    {
      id: 1,
      name: "Modern Technology Company",
      type: "Publisher",
      taxNumber: "123456789",
      email: "info@modern.com",
      phone: "+963 933 111 222",
      status: "Active",
      createdAt: "2026-07-02",
      documents: [
        {
          id: 101,
          type: "Commercial Register",
          name: "commercial_register_modern.pdf",
        },
        { id: 102, type: "Tax Card", name: "tax_card_modern.pdf" },
      ],
    },
    {
      id: 2,
      name: "Al-Emar Foundation",
      type: "Bidder",
      taxNumber: "987654321",
      email: "contact@alemar.com",
      phone: "+963 944 555 666",
      status: "Pending",
      createdAt: "2026-07-01",
      documents: [
        { id: 201, type: "Commercial Register", name: "alemar_register.pdf" },
      ],
    },
    {
      id: 3,
      name: "Future Systems",
      type: "Publisher",
      taxNumber: "111222333",
      email: "future@test.com",
      phone: "+963 955 777 888",
      status: "Suspended",
      createdAt: "2026-06-20",
      documents: [
        {
          id: 301,
          type: "Commercial Register",
          name: "future_systems_reg.pdf",
        },
        { id: 302, type: "License", name: "future_license.pdf" },
      ],
    },
    {
      id: 4,
      name: "Global Security Ltd",
      type: "System",
      taxNumber: "555666777",
      email: "security@global.com",
      phone: "+963 911 222 333",
      status: "Banned",
      createdAt: "2026-05-15",
      documents: [
        {
          id: 401,
          type: "Commercial Register",
          name: "global_security_docs.pdf",
        },
      ],
    },
  ]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleUpdateStatus = (id, newStatus) => {
    setOrganizations((prev) =>
      prev.map((org) => (org.id === id ? { ...org, status: newStatus } : org)),
    );
  };

  const handleViewDetails = (id) => {
    navigate(`/organizations/${id}`);
  };

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.taxNumber.includes(search);

    const matchesType = typeFilter === "All" || org.type === typeFilter;
    const matchesStatus = statusFilter === "All" || org.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div
      className={`page-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      {/* السايد بار الجانبي */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
     <div className="main-content-wrapper">
      
      {/* هيدر الصفحة بتصميم الـ Hero */}
      <div className="Page-hero">
        <div className="hero-content">
          <h1>Organizations Management</h1>
          <p>Monitor, manage and review all registered organization profiles and statuses.</p>
        </div>

        <div className="hero-actions">
          {/* أزرار اختيارية بنفس نمط زري Drafts و Reports في تصميم المناقصات */}
          <button className="hero-btn secondary">
            <Download size={15} /> Export
          </button>
          
          <button className="hero-btn primary">
            <Plus size={15} /> Add Organization
          </button>
        </div>
      </div>

        <div className="organizations-container">
          <OrganizationStats organizations={organizations} />

          <OrganizationFilters
            search={search}
            setSearch={setSearch}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          <OrganizationsTable
            organizations={filteredOrganizations}
            onUpdateStatus={handleUpdateStatus}
            onViewDetails={handleViewDetails}
          />
        </div>
      </div>
    </div>
  );
}
