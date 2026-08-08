import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { updateUser } from "../../services/userService";
import ErrorAlert, { FieldError } from "../ErrorAlert";
import "./style/users.css";

export default function UserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    f_name: user?.f_name || user?.name?.split(" ")[0] || "",
    l_name: user?.l_name || user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = user?.id || user?._id;

    if (!userId) {
      setError({
        isApiError: true,
        message: "Unable to update user: user ID is missing.",
      });
      return;
    }

    const sanitizedPayload = {
      f_name: String(formData.f_name || "").trim(),
      l_name: String(formData.l_name || "").trim(),
      email: String(formData.email || "").trim(),
      phone: String(formData.phone || "").trim(),
    };

    setSaving(true);
    setError(null);

    const result = await updateUser(userId, sanitizedPayload);

    setSaving(false);

    if (result && result.success) {
      // 🎯 دمج البيانات بأمان تام بدون السماح للـ status القادم كـ HTTP Code (200) بتخريب حالة المستخدم
      onSave({
        ...user,                     // البيانات القديمة (التي تحتوي status الصحيحة مثل ACTIVE)
        ...sanitizedPayload,        // البيانات الشخصية الجديدة المعدلة
        name: `${sanitizedPayload.f_name} ${sanitizedPayload.l_name}`.trim(),
        status: user?.status || "active", // 🛡️ حماية حتمية لحالة المستخدم القديمة
        role: user?.role,            // 🛡️ حماية حتمية للدور القديم
      });

      onClose();
    } else {
      setError(
        result?.error || {
          isApiError: true,
          message: "Failed to update user. Please check input values.",
        },
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="user-modal">
        <div className="modal-header">
          <div>
            <h2>Edit User</h2>
            <p>Manage user profile and access control</p>
          </div>
          <button className="close-btn" onClick={onClose} disabled={saving}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>

            <input
              required
              name="f_name"
              value={formData.f_name}
              onChange={handleChange}
            />
            <FieldError error={error} name="f_name" />
          </div>

          <div className="form-group">
            <label>Last Name</label>

            <input
              required
              name="l_name"
              value={formData.l_name}
              onChange={handleChange}
            />
            <FieldError error={error} name="l_name" />
          </div>

          <div className="form-group">
            <label>Email Address</label>

            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <FieldError error={error} name="email" />
          </div>

          <div className="form-group">
            <label>Phone</label>

            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <FieldError error={error} name="phone" />
          </div>

          <ErrorAlert error={error} />

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Save size={18} /> Update User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}