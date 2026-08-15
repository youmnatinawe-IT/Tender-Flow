// OrganizationDetails.jsx
import { useState, useEffect, useCallback } from "react";
import Navbar from "../Navbar";
import { useParams, useNavigate } from "react-router-dom";

import {
  AlertCircle,
  Phone,
  Mail,
  FileCheck,
  HelpCircle,
  UserPlus,
  UserCheck,
  ShieldAlert,
  Loader2,
  Users,
  CheckCircle2,
} from "lucide-react";

import CreateAdminModal from "../../components/organaizations/CreateAdminModal";
import { getOrgById, getOrgUsers } from "../../services/organizationService";

export default function OrganizationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrganizationDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const [res, usersRes] = await Promise.all([
        getOrgById(id),
        getOrgUsers(id),
      ]);

      if (!res.success) {
        setError(res.error?.message || "Failed to fetch organization details.");
        setOrgData(null);
        return;
      }

      const data = res.data?.organization || res.data?.data || res.data;

      let fetchedUsers = [];
      if (usersRes.success) {
        fetchedUsers = Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data?.users || usersRes.data?.data || [];
      }

      if (
        data.adminUser &&
        !fetchedUsers.some(
          (u) => (u._id || u.id) === (data.adminUser._id || data.adminUser.id)
        )
      ) {
        fetchedUsers.unshift(data.adminUser);
      }

      const mappedOrg = {
        id: data._id || data.id,
        name: data.org_name || data.name || "N/A",
        type: data.role || data.type || "N/A",
        taxNumber: data.commercial_register_num || data.taxNumber || "N/A",
        email: data.email || "N/A",
        phone: data.phone_number || data.phone || "N/A",
        status: data.status || "Pending",
        accounts: fetchedUsers,
        hasAccounts:
          fetchedUsers.length > 0 ||
          Boolean(data.has_admin || data.hasAdmin || data.adminUser),
      };

      setOrgData(mappedOrg);
    } catch (err) {
      setError(err?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrganizationDetails();
  }, [fetchOrganizationDetails]);

  const handleRefresh = async () => {
    await fetchOrganizationDetails();
  };

  if (loading) {
    return (
      <div
        className="organizations-container"
        dir="ltr"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Loader2 className="animate-spin" size={40} color="#0284c7" />
      </div>
    );
  }

  if (error || !orgData) {
    return (
      <div
        className="organizations-container"
        dir="ltr"
        style={{ padding: "40px" }}
      >
        <div
          className="error-box"
          style={{
            padding: "40px",
            textAlign: "center",
            background: "#fef2f2",
            borderRadius: "12px",
            border: "1px solid #fca5a5",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <AlertCircle
            size={40}
            color="#dc2626"
            style={{ marginBottom: "12px" }}
          />
          <h3 style={{ color: "#991b1b" }}>Data Fetch Error</h3>
          <p style={{ color: "#7f1d1d" }}>
            {error || "No organization found matching the selected identifier."}
          </p>
          <button
            className="back-btn-modern"
            onClick={() => navigate("/organizations")}
            style={{
              marginTop: "16px",
              marginInline: "auto",
              cursor: "pointer",
            }}
          >
            Back to Organizations
          </button>
        </div>
      </div>
    );
  }

  // التحرر من الشرط لمعرفة هل يتوفر حساب واحد على الأقل
  const hasAtLeastOneAccount = orgData.accounts && orgData.accounts.length > 0;

  return (
    <div className="organizations-container" dir="ltr">
      <div className="details-header-nav">
        <Navbar
          title="Organization Details"
          showBackButton={true}
          showSearch={false}
          showProfile={false}
          showNotifications={true}
          showLanguage={false}
          showTheme={false}
        />
      </div>

      <div className="details-dashboard-layout">
        <div className="details-main-section">
          {/* General Information */}
          <div className="section-card-title">
            <HelpCircle size={18} className="icon-blue" />
            <h3>General Organization Information</h3>
          </div>

          <div className="org-profile-top">
            <div className="profile-avatar">
              {orgData.name ? orgData.name.charAt(0).toUpperCase() : "O"}
            </div>
            <div className="profile-info-wrapper">
              <div className="name-status-container">
                <h2>{orgData.name}</h2>
                <span
                  className={`status-badge-modern ${String(orgData.status || "Pending").toLowerCase()}`}
                >
                  {orgData.status}
                </span>
              </div>
              <span className="tax-label">Tax Number: {orgData.taxNumber}</span>
            </div>
          </div>

          <div className="info-cards-grid">
            <div className="mini-info-card">
              <Mail size={16} />
              <div>
                <label>Email Address</label>
                <p>
                  <a href={`mailto:${orgData.email}`} className="email-link">
                    {orgData.email}
                  </a>
                </p>
              </div>
            </div>

            <div className="mini-info-card">
              <Phone size={16} />
              <div>
                <label>Phone Number</label>
                <p>{orgData.phone}</p>
              </div>
            </div>

            <div className="mini-info-card">
              <FileCheck size={16} />
              <div>
                <label>Organization Type</label>
                <p>
                  <span
                    className={`type-tag ${String(orgData.type || "N/A").toLowerCase()}`}
                  >
                    {orgData.type}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              قسم حسابات المنظمة وأفراد التقديم على المناقصات
          ================================================= */}
          <div
            className="admin-account-card-section"
            style={{
              marginTop: "24px",
              paddingTop: "18px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <div
              className="section-card-title"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Users size={18} className="icon-blue" />
                <h3>Organization Accounts & Bidding Representatives</h3>
              </div>

              {/* زر إضافة حساب جديد للمنظمة - يتعطل إذا وُجد حساب واحد على الأقل */}
              <button
                className="create-admin-btn"
                disabled={hasAtLeastOneAccount}
                onClick={() => setIsCreateAdminOpen(true)}
                title={
                  hasAtLeastOneAccount
                    ? "Organization already has an account"
                    : "Add New Representative"
                }
                style={{
                  background: hasAtLeastOneAccount ? "#94a3b8" : "#0284c7",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: "600",
                  cursor: hasAtLeastOneAccount ? "not-allowed" : "pointer",
                  opacity: hasAtLeastOneAccount ? 0.65 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                <UserPlus size={16} />
                Add New Representative
              </button>
            </div>

            {/* =================================================
                حالة وجود حساب واحد على الأقل
            ================================================= */}
            {orgData.hasAccounts ? (
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    padding: "14px",
                    borderRadius: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <CheckCircle2 size={22} color="#16a34a" />
                  <div>
                    <h4
                      style={{ margin: 0, color: "#15803d", fontSize: "14px" }}
                    >
                      Ready for Tendering Bids ({orgData.accounts.length} Active
                      Account/s)
                    </h4>
                    <p
                      style={{
                        margin: "2px 0 0 0",
                        color: "#166534",
                        fontSize: "12px",
                      }}
                    >
                      This organization has registered members eligible to
                      submit and manage tender proposals.
                    </p>
                  </div>
                </div>

                {/* قائمة الحسابات التابعة للمنظمة */}
                <div
                  className="accounts-list-grid"
                  style={{
                    display: "grid",
                    gap: "12px",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                  }}
                >
                  {orgData.accounts.map((acc, index) => (
                    <div
                      key={acc.id || acc._id || index}
                      className="mini-info-card"
                      style={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <UserCheck size={20} color="#0284c7" />
                      <div>
                        <label style={{ fontWeight: "700", color: "#0f172a" }}>
                          {acc.f_name
                            ? `${acc.f_name} ${acc.l_name}`
                            : acc.username || "Account Member"}
                        </label>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          {acc.email || "No Email Provided"}
                        </p>
                        {acc.username && (
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#0284c7",
                              fontWeight: "600",
                            }}
                          >
                            @{acc.username}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* =================================================
                  حالة عدم وجود أي حساب (التحذير الأحمر)
              ================================================= */
              <div
                className="no-admin-alert-box"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  padding: "16px",
                  borderRadius: "12px",
                  marginTop: "16px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <ShieldAlert size={22} color="#e11d48" />
                  <div>
                    <h4
                      style={{ margin: 0, color: "#9f1239", fontSize: "14px" }}
                    >
                      No Accounts Assigned
                    </h4>
                    <p
                      style={{
                        margin: "2px 0 0 0",
                        color: "#881337",
                        fontSize: "12px",
                      }}
                    >
                      This organization does not have any active accounts or
                      individuals to submit tender proposals yet.
                    </p>
                  </div>
                </div>

                <button
                  className="create-admin-btn"
                  onClick={() => setIsCreateAdminOpen(true)}
                  style={{
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  <UserPlus size={16} />
                  Create First Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* مودال إنشاء حساب مسؤول/ممثل جديد للمنظمة */}
      <CreateAdminModal
        isOpen={isCreateAdminOpen}
        onClose={() => setIsCreateAdminOpen(false)}
        org={orgData}
        onRefresh={handleRefresh}
      />
    </div>
  );
}