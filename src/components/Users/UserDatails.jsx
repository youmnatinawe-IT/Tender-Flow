import { useState, useEffect } from "react";
import { X, Mail, Phone, Loader2, ShieldCheck, Activity } from "lucide-react";
import { getUserById } from "../../services/userService";
import useApiRequest from "../../hooks/useApiRequest";
import ErrorAlert from "../ErrorAlert";

export default function UserDetails({ user, onClose }) {
  const [fullUserDetails, setFullUserDetails] = useState(user);
  const { loading, error, run } = useApiRequest();

  useEffect(() => {
    let cancelled = false;

    const fetchDetailedUser = async () => {
      const userId = user?.id || user?._id;

      if (!userId) {
        setFullUserDetails(user);
        return;
      }

      // 🎯 الاعتماد الأولي على بيانات الجدول لمنع التصفير
      setFullUserDetails(user);

      const result = await run(
        getUserById(userId).then((res) => {
          if (res && res.success) return res;
          throw res?.error;
        })
      );

      if (cancelled) return;

      if (result && result.success && result.data) {
        // استخراج البيانات مهما كان شكلها القادم من الباك إند (data أو data.user)
        const fetchedData = result.data.user || result.data.data || result.data;
        
        // 🛡️ دمج البيانات القديمة الحقيقية مع الجديدة لمنع خروج N/A
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

  // استخراج الاسم بذكاء
  const firstName = fullUserDetails?.f_name || fullUserDetails?.firstName || fullUserDetails?.name?.split(" ")[0] || "";
  const lastName = fullUserDetails?.l_name || fullUserDetails?.lastName || fullUserDetails?.name?.split(" ")[1] || "";
  const fullName = `${firstName} ${lastName}`.trim() || fullUserDetails?.name || fullUserDetails?.username || "User Details";

  // استخراج الإيميل ورقم الهاتف والشكل بمرونة
  const email = fullUserDetails?.email || user?.email || "N/A";
  const phone = fullUserDetails?.phone || user?.phone || "N/A";
  const role = fullUserDetails?.role || user?.role || "N/A";
  const status = fullUserDetails?.status || user?.status || "N/A";

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
          </div>
        )}
      </div>
    </div>
  );
}