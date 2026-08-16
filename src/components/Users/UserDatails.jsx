import { useState, useEffect } from "react";
import { X, Mail, Phone, Loader2, ShieldCheck, Activity, FileText, Image as ImageIcon } from "lucide-react";
import { getUserById } from "../../services/userService";
import { BASE_URL } from "../../services/api";
import useApiRequest from "../../hooks/useApiRequest";
import ErrorAlert from "../ErrorAlert";

export default function UserDetails({ user, onClose }) {
  const [fullUserDetails, setFullUserDetails] = useState(user);
  const [previewImage, setPreviewImage] = useState(null); // معاينة الصورة بحجم مكبّر
  const { loading, error, run } = useApiRequest();

  useEffect(() => {
    let cancelled = false;

    const fetchDetailedUser = async () => {
      const userId = user?.id || user?._id;

      if (!userId) {
        setFullUserDetails(user);
        return;
      }

      setFullUserDetails(user);

      const result = await run(
        getUserById(userId).then((res) => {
          if (res && res.success) return res;
          throw res?.error;
        })
      );

      if (cancelled) return;

      if (result && result.success && result.data) {
        const fetchedData = result.data.user || result.data.data || result.data;
        
        setFullUserDetails((prev) => ({
          ...prev,
          ...fetchedData,
        }));
      }
    };

    fetchDetailedUser();

    return () => {
      cancelled = true;
    };
  }, [user, run]);

  if (!user) return null;

  // استخراج البيانات الأساسية
  const firstName = fullUserDetails?.f_name || fullUserDetails?.firstName || fullUserDetails?.name?.split(" ")[0] || "";
  const lastName = fullUserDetails?.l_name || fullUserDetails?.lastName || fullUserDetails?.name?.split(" ")[1] || "";
  const fullName = `${firstName} ${lastName}`.trim() || fullUserDetails?.name || fullUserDetails?.username || "User Details";

  const email = fullUserDetails?.email || user?.email || "N/A";
  const phone = fullUserDetails?.phone || user?.phone || "N/A";
  const role = fullUserDetails?.type || fullUserDetails?.role || user?.role || "N/A";
  const status = fullUserDetails?.status || user?.status || "N/A";

  // دالة تحويل مسار الصورة إلى رابط كامل وتصحيح الشرطات المائلة العكسية \\
  const getImageUrl = (path) => {
    if (!path || path === "null" || path === "undefined") return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;

    const cleanPath = path.replace(/\\/g, "/");
    return `${BASE_URL}/${cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath}`;
  };

  const idCardFrontUrl = getImageUrl(fullUserDetails?.id_card_front);
  const idCardBackUrl = getImageUrl(fullUserDetails?.id_card_back);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="user-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header Section */}
        <div className="modal-top-bar">
          <div className="title-area">
            <h2>User Details: {fullName}</h2>
            <p className="sub-id">User ID: {user?.id || user?._id || "N/A"}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        {loading && !fullUserDetails ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" size={30} />
            <p>Loading user details...</p>
          </div>
        ) : error ? (
          <ErrorAlert error={error} />
        ) : (
          <div className="modal-inner-body">
            <h3 className="section-title">Basic Details</h3>

            <div className="details-cards-grid">
              <div className="detail-card">
                <div className="card-icon blue"><Mail size={18} /></div>
                <div className="card-info">
                  <span className="card-label">Email</span>
                  <strong className="card-value">{email}</strong>
                </div>
              </div>

              <div className="detail-card">
                <div className="card-icon blue"><Phone size={18} /></div>
                <div className="card-info">
                  <span className="card-label">Phone</span>
                  <strong className="card-value">{phone}</strong>
                </div>
              </div>

              <div className="detail-card">
                <div className="card-icon blue"><ShieldCheck size={18} /></div>
                <div className="card-info">
                  <span className="card-label">Role</span>
                  <strong className="card-value">{role}</strong>
                </div>
              </div>

              <div className="detail-card">
                <div className="card-icon blue"><Activity size={18} /></div>
                <div className="card-info">
                  <span className="card-label">Status</span>
                  <strong className="card-value" style={{ textTransform: "capitalize" }}>{status}</strong>
                </div>
              </div>
            </div>

            {/* قسم وثائق الهوية الوطنية */}
            <h3 className="section-title" style={{ marginTop: "24px" }}>ID Documents</h3>
            <div className="details-cards-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              
              {/* الوجه الأمامي للهوية */}
              <div className="detail-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div className="card-icon blue"><FileText size={18} /></div>
                  <span className="card-label" style={{ fontWeight: "600", color: "#1e293b" }}>ID Card Front</span>
                </div>
                {idCardFrontUrl ? (
                  <img
                    src={idCardFrontUrl}
                    alt="ID Card Front"
                    onClick={() => setPreviewImage(idCardFrontUrl)}
                    style={{
                      width: "100%",
                      height: "140px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: "1px solid #e2e8f0"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "140px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    color: "#94a3b8"
                  }}>
                    <ImageIcon size={28} />
                    <span style={{ fontSize: "12px", marginTop: "4px" }}>No Image Uploaded</span>
                  </div>
                )}
              </div>

              {/* الوجه الخلفي للهوية */}
              <div className="detail-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div className="card-icon blue"><FileText size={18} /></div>
                  <span className="card-label" style={{ fontWeight: "600", color: "#1e293b" }}>ID Card Back</span>
                </div>
                {idCardBackUrl ? (
                  <img
                    src={idCardBackUrl}
                    alt="ID Card Back"
                    onClick={() => setPreviewImage(idCardBackUrl)}
                    style={{
                      width: "100%",
                      height: "140px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: "1px solid #e2e8f0"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "140px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    color: "#94a3b8"
                  }}>
                    <ImageIcon size={28} />
                    <span style={{ fontSize: "12px", marginTop: "4px" }}>No Image Uploaded</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* نافذة معاينة الصورة بحجم أكبر */}
        {previewImage && (
          <div 
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000
            }}
            onClick={() => setPreviewImage(null)}
          >
            <div style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}>
              <button 
                onClick={() => setPreviewImage(null)}
                style={{
                  position: "absolute",
                  top: "-40px",
                  right: "0",
                  background: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  padding: "6px",
                  cursor: "pointer"
                }}
              >
                <X size={20} />
              </button>
              <img 
                src={previewImage} 
                alt="Enlarged ID Document" 
                style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }} 
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}