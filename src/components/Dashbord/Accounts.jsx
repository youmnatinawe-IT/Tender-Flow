import { useState, useEffect, useCallback } from "react";
import Sidebar from "../SideBar"; // عدل المسار حسب مجلد مشروعك
import {
  Building2,
  Search,
  UserCheck,
  UserPlus,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  getPublisherOrgs,
  getExecutorOrgs,
  getOrgUsers
} from "../../services/organizationService";
import CreateAdminModal from "../organaizations/CreateAdminModal";

export default function OrganizationAccounts() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [organizations, setOrganizations] = useState([]);

  // الفلاتر
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  // مودال إنشاء حساب جديد
  const [selectedOrgForAccount, setSelectedOrgForAccount] = useState(null);

  // =========================================================
  // جلب كافة المنظمات وحساباتها بشكل دقيق عبر الـ API الخاص بـ users
  // =========================================================
  const fetchAllOrgAccounts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [pubRes, execRes] = await Promise.all([
        getPublisherOrgs(),
        getExecutorOrgs(),
      ]);

      let pubList = [];
      if (pubRes.success) {
        pubList = Array.isArray(pubRes.data)
          ? pubRes.data
          : pubRes.data?.data || pubRes.data?.publishers || [];
      }

      let execList = [];
      if (execRes.success) {
        execList = Array.isArray(execRes.data)
          ? execRes.data
          : execRes.data?.data || execRes.data?.executors || [];
      }

      const allOrgsRaw = [
        ...pubList.map((o) => ({ ...o, defaultType: "Publisher" })),
        ...execList.map((o) => ({ ...o, defaultType: "Executor" })),
      ];

      // جلب مستخدمين كل منظمة مع معالجة حذرة للـ ID وتفكيك الـ Response
      const orgsWithUsers = await Promise.all(
        allOrgsRaw.map(async (org) => {
          // 1. استخراج المعرف الصحيح للمنظمة
          const targetId = org._id || org.id || org.org_id;

          let fetchedUsers = [];

          if (targetId) {
            const usersRes = await getOrgUsers(targetId);

            if (usersRes.success) {
              // 2. تفكيك كافة الأشكال المحتملة للـ Response
              const rawData = usersRes.data;
              if (Array.isArray(rawData)) {
                fetchedUsers = rawData;
              } else if (Array.isArray(rawData?.users)) {
                fetchedUsers = rawData.users;
              } else if (Array.isArray(rawData?.data)) {
                fetchedUsers = rawData.data;
              }
            }
          }

          // 3. دمج الأدمن الرئيسي إن كان مفصولاً في كائن المنظمة
          if (
            org.adminUser &&
            !fetchedUsers.some(
              (u) => (u._id || u.id) === (org.adminUser._id || org.adminUser.id)
            )
          ) {
            fetchedUsers.unshift(org.adminUser);
          }

          return {
            id: targetId,
            name: org.org_name || org.name || "Unnamed Organization",
            type: org.role || org.type || org.defaultType,
            email: org.email || "N/A",
            phone: org.phone_number || org.phone || "N/A",
            status: org.status || "Active",
            accounts: fetchedUsers,
          };
        })
      );

      setOrganizations(orgsWithUsers);
    } catch (err) {
      console.error("Error fetching organization accounts:", err);
      setError("An error occurred while fetching organizations and their accounts data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllOrgAccounts();
    
  }, [fetchAllOrgAccounts]);

  // =========================================================
  // الفلترة والبحث
  // =========================================================
  const filteredOrganizations = organizations.filter((org) => {
    const matchesType =
      filterType === "ALL" ||
      org.type.toUpperCase() === filterType.toUpperCase();

    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.accounts.some(
        (acc) =>
          (acc.username && acc.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (acc.email && acc.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (acc.f_name && acc.f_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );

    return matchesType && matchesSearch;
  });

  return (
    <div className={`page-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`} dir="ltr">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="main-content-wrapper">
        <div className="Page-hero">
          <div className="hero-content">
            <h1>Organization Accounts Center</h1>
            <p>
              Overview of all registered organizations and their designated bidding accounts and team representatives.
            </p>
          </div>
        </div>

        <div className="organizations-container">
          {/* أدوات البحث والتصفية */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "24px",
              background: "#ffffff",
              padding: "16px 20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "8px 14px",
                borderRadius: "8px",
                flex: "1",
                maxWidth: "400px",
              }}
            >
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by organization or account name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  width: "100%",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {["ALL", "PUBLISHER", "EXECUTOR"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "13px",
                    border: "none",
                    cursor: "pointer",
                    background: filterType === type ? "#0284c7" : "#f1f5f9",
                    color: filterType === type ? "#ffffff" : "#475569",
                  }}
                >
                  {type === "ALL" ? "All Organizations" : type}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="modal-error-alert" style={{ marginBottom: "16px" }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
              <Loader2 className="animate-spin" size={36} color="#0284c7" style={{ margin: "0 auto 12px" }} />
              <p>Fetching organization accounts network...</p>
            </div>
          ) : filteredOrganizations.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "#fff",
                borderRadius: "12px",
                border: "1px dashed #cbd5e1",
              }}
            >
              <Building2 size={40} color="#94a3b8" style={{ marginBottom: "12px" }} />
              <h3 style={{ color: "#334155", margin: "0 0 6px 0" }}>No Organizations Found</h3>
              <p style={{ color: "#64748b", margin: 0 }}>Try adjusting your search query or filters.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {filteredOrganizations.map((org) => {
                const hasAccounts = org.accounts && org.accounts.length > 0;

                return (
                  <div
                    key={org.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                      overflow: "hidden",
                    }}
                  >
                    {/* هيدر المنظمة */}
                    <div
                      style={{
                        padding: "18px 24px",
                        background: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "10px",
                            background: "#e0f2fe",
                            color: "#0284c7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "18px",
                          }}
                        >
                          {org.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a", fontWeight: "700" }}>
                              {org.name}
                            </h3>
                            <span
                              className={`type-tag ${org.type.toLowerCase()}`}
                              style={{ fontSize: "11px", padding: "2px 8px" }}
                            >
                              {org.type}
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: "16px", marginTop: "4px", fontSize: "12px", color: "#64748b" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <Mail size={13} /> {org.email}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <Phone size={13} /> {org.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* زر إضافة حساب جديد - تم تعطيله وتعديل مظهره عندما يكون لدى المنظمة حسابات */}
                      <button
                        disabled={hasAccounts}
                        onClick={() => setSelectedOrgForAccount(org)}
                        title={hasAccounts ? "Organization already has an account" : "Add Account"}
                        style={{
                          background: hasAccounts ? "#94a3b8" : "#0284c7",
                          color: "white",
                          border: "none",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: hasAccounts ? "not-allowed" : "pointer",
                          opacity: hasAccounts ? 0.65 : 1,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <UserPlus size={15} /> Add Account
                      </button>
                    </div>

                    {/* قائمة حسابات المنظمة */}
                    <div style={{ padding: "20px 24px" }}>
                      {hasAccounts ? (
                        <div>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "700",
                              textTransform: "uppercase",
                              color: "#64748b",
                              letterSpacing: "0.5px",
                              display: "block",
                              marginBottom: "14px",
                            }}
                          >
                            Registered Accounts ({org.accounts.length})
                          </span>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                              gap: "14px",
                            }}
                          >
                            {org.accounts.map((acc, index) => (
                              <div
                                key={acc.id || acc._id || index}
                                style={{
                                  background: "#f8fafc",
                                  border: "1px solid #cbd5e1",
                                  padding: "14px 16px",
                                  borderRadius: "10px",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "12px",
                                }}
                              >
                                <div
                                  style={{
                                    background: "#dbeafe",
                                    padding: "8px",
                                    borderRadius: "8px",
                                    color: "#1d4ed8",
                                  }}
                                >
                                  <UserCheck size={18} />
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <h4
                                    style={{
                                      margin: 0,
                                      fontSize: "14px",
                                      color: "#1e293b",
                                      fontWeight: "600",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {acc.f_name ? `${acc.f_name} ${acc.l_name}` : acc.username || "Authorized User"}
                                  </h4>

                                  <p
                                    style={{
                                      margin: "2px 0 6px 0",
                                      fontSize: "12px",
                                      color: "#64748b",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {acc.email || "No Email Defined"}
                                  </p>

                                  <span
                                    style={{
                                      fontSize: "11px",
                                      background: "#e0e7ff",
                                      color: "#3730a3",
                                      padding: "1px 6px",
                                      borderRadius: "4px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    @{acc.username || "user"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            background: "#fff1f2",
                            border: "1px solid #fecdd3",
                            borderRadius: "10px",
                            padding: "14px 18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <AlertCircle size={20} color="#e11d48" />
                            <span style={{ fontSize: "13px", color: "#9f1239", fontWeight: "500" }}>
                              No accounts have been generated for this organization yet.
                            </span>
                          </div>

                          <button
                            onClick={() => setSelectedOrgForAccount(org)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#be123c",
                              fontWeight: "700",
                              fontSize: "13px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            Create First Account <ChevronRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* مودال إنشاء حساب مسؤول أو موظف جديد للمنظمة */}
      <CreateAdminModal
        isOpen={Boolean(selectedOrgForAccount)}
        org={selectedOrgForAccount}
        onClose={() => setSelectedOrgForAccount(null)}
        onRefresh={fetchAllOrgAccounts}
      />
    </div>
  );
}