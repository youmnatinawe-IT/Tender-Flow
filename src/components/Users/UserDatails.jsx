import { useState, useEffect } from "react";
import { X, Mail, Phone, Building2, Loader2 } from "lucide-react";
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

      setFullUserDetails(user);

      const result = await run(
        getUserById(userId).then((res) => {
          if (res && res.success) return res;
          throw res?.error;
        }),
      );

      if (cancelled) return;

      if (result && result.success && result.data) {
        setFullUserDetails(result.data);
      }
    };

    fetchDetailedUser();

    return () => {
      cancelled = true;
    };
  }, [user, run]);

  if (!user) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="user-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>User Details</h2>
          <button className="close-drawer-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Loader2 className="animate-spin" size={32} />
            <p>Loading user details...</p>
          </div>
        ) : error ? (
          <ErrorAlert error={error} />
        ) : (
          <>
            <div className="drawer-profile">
              <div className="drawer-avatar">
                {(fullUserDetails?.name ||
                  fullUserDetails?.f_name ||
                  "U").charAt(0)}
              </div>
              <div>
                <h3>
                  {fullUserDetails?.name ||
                    `${fullUserDetails?.f_name} ${fullUserDetails?.l_name}`}
                </h3>
                <span className="user-role-badge">
                  {fullUserDetails?.role}
                </span>
              </div>
            </div>

            <div className="drawer-content">
              <div className="details-grid">
                <div className="detail-item">
                  <Mail size={18} />
                  <div>
                    <span>Email</span>
                    <strong>{fullUserDetails?.email}</strong>
                  </div>
                </div>
                <div className="detail-item">
                  <Phone size={18} />
                  <div>
                    <span>Phone</span>
                    <strong>{fullUserDetails?.phone || "N/A"}</strong>
                  </div>
                </div>
                <div className="detail-item">
                  <Building2 size={18} />
                  <div>
                    <span>National Num</span>
                    <strong>{fullUserDetails?.national_num || "N/A"}</strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
