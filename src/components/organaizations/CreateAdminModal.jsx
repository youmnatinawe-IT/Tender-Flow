import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { createAdminUser } from "../../services/organizationService";

export default function CreateAdminModal({ isOpen, onClose, org, onRefresh }) {
  const [formData, setFormData] = useState({
    type: "PUBLISHER",
    f_name: "",
    l_name: "",
    father_name: "",
    national_num: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !org) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      org_id: org.id || org._id,
      ...formData,
    };

    try {
      const res = await createAdminUser(payload);

      if (res.success) {
        if (onRefresh) onRefresh();
        onClose();
      } else {
        // يعرض رسالة الخطأ القادمة من الباك إند عند تكرار (الرقم الوطني / الإيميل / اسم المستخدم)
        setError(res.error?.message || "فشل في إنشاء حساب الأدمن");
      }
    } catch (err) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal-card large-modal">
        <div className="modal-card-header">
          <UserPlus size={22} className="icon-blue" />
          <h3>Create Admin Account - {org.name || org.org_name}</h3>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="modal-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form-grid">
          <div className="form-group">
            <label>First Name *</label>
            <input type="text" name="f_name" required value={formData.f_name} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Last Name *</label>
            <input type="text" name="l_name" required value={formData.l_name} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Father Name *</label>
            <input type="text" name="father_name" required value={formData.father_name} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>National Number * (Unique)</label>
            <input type="text" name="national_num" required value={formData.national_num} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Email * (Unique)</label>
            <input type="email" name="email" required value={formData.email} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Username * (Unique)</label>
            <input type="text" name="username" required value={formData.username} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input type="password" name="password" required value={formData.password} onChange={handleInputChange} />
          </div>

          <div className="modal-actions-footer full-width">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Admin User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}