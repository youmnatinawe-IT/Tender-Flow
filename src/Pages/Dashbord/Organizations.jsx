import { useState, useCallback, useEffect } from "react";
import Sidebar from "../../components/SideBar";
import { Plus, Download } from "lucide-react";
import OrganizationsTable from "../../components/organaizations/organaizationtable";
import OrganizationTabs from "../../components/organaizations/OrganizationTabs";
import AddPublisherModal from "../../components/organaizations/AddPublisherModal";
import CreateAdminModal from "../../components/organaizations/CreateAdminModal";
import "../../components/organaizations/style/organaization.css";
import { useNavigate } from "react-router-dom";
import {
  getPublisherOrgs,
  getExecutorOrgs,
  getOrgUsers, // 👈 استيراد دالة جلب المستخدمين لكل منظمة
} from "../../services/organizationService";

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("PUBLISHER");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modals state
  const [isAddPublisherOpen, setIsAddPublisherOpen] = useState(false);
  const [selectedOrgForAdmin, setSelectedOrgForAdmin] = useState(null);

  const navigate = useNavigate();

  // دالة تحويل نسق بيانات الباك إند ليتطابق مع الجدول
  const mapOrgData = (org, type, users = []) => ({
    id: org._id || org.id,
    name: org.org_name || org.name || "N/A",
    type: type, // 'Publisher' or 'Executor'
    taxNumber: org.commercial_register_num || org.taxNumber || "N/A",
    email: org.email || "N/A",
    phone: org.phone_number || org.phone || "N/A",
    status: org.status || "Pending",
    createdAt: org.createdAt
      ? new Date(org.createdAt).toISOString().split("T")[0]
      : "N/A",
    accounts: users,
    hasAdmin:
      users.length > 0 ||
      Boolean(org.has_admin || org.hasAdmin || org.adminUser),
  });

  // دالة جلب البيانات مع استعلام المستخدمين لكل منظمة
  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res =
        activeTab === "PUBLISHER"
          ? await getPublisherOrgs()
          : await getExecutorOrgs();

      if (res.success) {
        const rawData = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data?.publishers)
              ? res.data.publishers
              : Array.isArray(res.data?.executors)
                ? res.data.executors
                : Array.isArray(res.data?.organizations)
                  ? res.data.organizations
                  : [];

        const currentType = activeTab === "PUBLISHER" ? "Publisher" : "Executor";

        // جلب مستخدمين كل منظمة بالتوازي لتحديث حالة الـ Admin تلقائياً
        const updatedOrgs = await Promise.all(
          rawData.map(async (org) => {
            const orgId = org._id || org.id;
            let users = [];

            if (orgId && activeTab === "PUBLISHER") {
              const usersRes = await getOrgUsers(orgId);
              if (usersRes?.success) {
                const uData = usersRes.data;
                users = Array.isArray(uData)
                  ? uData
                  : Array.isArray(uData?.users)
                    ? uData.users
                    : Array.isArray(uData?.data)
                      ? uData.data
                      : [];
              }
            }

            return mapOrgData(org, currentType, users);
          })
        );

        setOrganizations(updatedOrgs);
      } else {
        setError(res.error?.message || "فشل في جلب البيانات من السيرفر");
      }
    } catch (err) {
      console.error("Error loading organizations:", err);
      setError("حدث خطأ غير متوقع أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const handleUpdateStatus = (id, newStatus) => {
    setOrganizations((prev) =>
      prev.map((org) => (org.id === id ? { ...org, status: newStatus } : org))
    );
  };

  const handleViewDetails = (id) => {
    navigate(`/organizations/${id}`);
  };

  const handleRefreshData = () => {
    fetchOrgs();
  };

  return (
    <div
      className={`page-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div className="main-content-wrapper">
        <div className="Page-hero">
          <div className="hero-content">
            <h1>Organizations Management</h1>
            <p>
              Monitor, manage and review all registered organization profiles
              and statuses.
            </p>
          </div>

          <div className="hero-actions">
            <button className="hero-btn secondary">
              <Download size={15} /> Export
            </button>

            {activeTab === "PUBLISHER" && (
              <button
                className="hero-btn primary"
                onClick={() => setIsAddPublisherOpen(true)}
              >
                <Plus size={15} /> Add Publisher Org
              </button>
            )}
          </div>
        </div>

        <div className="organizations-container">
          <OrganizationTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {error && (
            <div
              className="modal-error-alert"
              style={{ marginBottom: "16px" }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Loading organizations...
            </div>
          ) : (
            <OrganizationsTable
              organizations={organizations}
              onUpdateStatus={handleUpdateStatus}
              onViewDetails={handleViewDetails}
              activeTab={activeTab}
              onCreateAdmin={(org) => setSelectedOrgForAdmin(org)}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <AddPublisherModal
        isOpen={isAddPublisherOpen}
        onClose={() => setIsAddPublisherOpen(false)}
        onRefresh={handleRefreshData}
      />

      <CreateAdminModal
        isOpen={Boolean(selectedOrgForAdmin)}
        org={selectedOrgForAdmin}
        onClose={() => setSelectedOrgForAdmin(null)}
        onRefresh={() => {
          if (selectedOrgForAdmin) {
            setOrganizations((prevOrgs) =>
              prevOrgs.map((org) =>
                org.id === selectedOrgForAdmin.id
                  ? { ...org, hasAdmin: true, status: "Active" }
                  : org
              )
            );
          }
          fetchOrgs();
        }}
      />
    </div>
  );
}