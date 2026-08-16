import { useState, useEffect } from "react";
import Sidebar from "../../components/SideBar";
import { Plus } from "lucide-react";
import OrganizationsTable from "../../components/organaizations/organaizationtable";
import OrganizationTabs from "../../components/organaizations/OrganizationTabs";
import AddPublisherModal from "../../components/organaizations/AddPublisherModal";
import CreateAdminModal from "../../components/organaizations/CreateAdminModal";
import "../../components/organaizations/style/organaization.css";
import { useNavigate } from "react-router-dom";
import {
  getPublisherOrgs,
  getExecutorOrgs,
  getOrgUsers,
} from "../../services/organizationService";

const mapOrgData = (org, type, users = []) => ({
  id: org._id || org.id,
  name: org.org_name || org.name || "N/A",
  type,
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

async function fetchOrgList(activeTab) {
  const res =
    activeTab === "PUBLISHER"
      ? await getPublisherOrgs()
      : await getExecutorOrgs();

  if (!res.success) {
    throw new Error(res.error?.message || "فشل في جلب البيانات من السيرفر");
  }

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

  return updatedOrgs;
}

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("PUBLISHER");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modals state
  const [isAddPublisherOpen, setIsAddPublisherOpen] = useState(false);
  const [selectedOrgForAdmin, setSelectedOrgForAdmin] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const list = await fetchOrgList(activeTab);
        if (cancelled) return;
        setOrganizations(list);
        setError("");
      } catch (err) {
        if (cancelled) return;
        console.error("Error loading organizations:", err);
        setError(err?.message || "حدث خطأ غير متوقع أثناء تحميل البيانات");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleViewDetails = (id) => {
    navigate(`/organizations/${id}`);
  };

  const handleRefreshData = () => {
    fetchOrgList(activeTab)
      .then((list) => {
        setOrganizations(list);
        setError("");
      })
      .catch((err) => {
        console.error("Error loading organizations:", err);
        setError(err?.message || "حدث خطأ غير متوقع أثناء تحميل البيانات");
      });
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
              onViewDetails={handleViewDetails}
              activeTab={activeTab}
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
          fetchOrgList(activeTab)
            .then((list) => {
              setOrganizations(list);
              setError("");
            })
            .catch((err) => {
              console.error("Error loading organizations:", err);
              setError(err?.message || "حدث خطأ غير متوقع أثناء تحميل البيانات");
            });
        }}
      />
    </div>
  );
}