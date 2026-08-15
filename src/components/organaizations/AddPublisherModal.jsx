import { useState } from "react";
import { X, Upload, Building2 } from "lucide-react";
import { createPublisherOrg } from "../../services/organizationService";

export default function AddPublisherModal({ isOpen, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    org_name: "",
    _address: "",
    phone_number: "",
    email: "",
    commercial_register_num: "",
    commercial_register_date: "",
    license_num: "",
    license_date: "",
  });

  const [files, setFiles] = useState({
    commercial_register: null,
    license: null,
    logo: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  // 1. التحقق من نوع الملفات أولاً قبل الرفع
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (
    files.commercial_register &&
    !allowedTypes.includes(files.commercial_register.type)
  ) {
    setError("السجل التجاري يجب أن يكون صورة بصيغة JPG أو PNG فقط");
    return;
  }

  if (files.license && !allowedTypes.includes(files.license.type)) {
    setError("الترخيص يجب أن يكون صورة بصيغة JPG أو PNG فقط");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const payload = new FormData();

    // إضافة البيانات النصية
    payload.append("org_name", formData.org_name);
    payload.append("_address", formData._address);
    payload.append("phone_number", formData.phone_number);
    payload.append("email", formData.email);
    payload.append("commercial_register_num", formData.commercial_register_num);
    payload.append("commercial_register_date", formData.commercial_register_date);
    payload.append("license_num", formData.license_num);
    payload.append("license_date", formData.license_date);

    // إضافة الملفات
    if (files.commercial_register instanceof Blob)
      payload.append("commercial_register", files.commercial_register);
    if (files.license instanceof Blob)
      payload.append("license", files.license);
    if (files.logo instanceof Blob)
      payload.append("logo", files.logo);

    const res = await createPublisherOrg(payload);

    if (res.success) {
      if (onRefresh) onRefresh();
      onClose();
    } else {
      setError(res.error?.message || "فشل في إنشاء المؤسسة الناشرة");
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal-card large-modal">
        <div className="modal-card-header">
          <Building2 size={22} className="icon-blue" />
          <h3>Add New Publisher Organization</h3>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="modal-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form-grid">
          <div className="form-group">
            <label>Organization Name *</label>
            <input
              type="text"
              name="org_name"
              required
              value={formData.org_name}
              onChange={handleInputChange}
              placeholder="e.g. System"
            />
          </div>

          <div className="form-group">
            <label>Address *</label>
            <input
              type="text"
              name="_address"
              required
              value={formData._address}
              onChange={handleInputChange}
              placeholder="e.g. local"
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="text"
              name="phone_number"
              required
              value={formData.phone_number}
              onChange={handleInputChange}
              placeholder="099999999"
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="admittn@mdojmo.com"
            />
          </div>

          <div className="form-group">
            <label>Commercial Register Number *</label>
            <input
              type="text"
              name="commercial_register_num"
              required
              value={formData.commercial_register_num}
              onChange={handleInputChange}
              placeholder="1111f"
            />
          </div>

          <div className="form-group">
            <label>Commercial Register Date *</label>
            <input
              type="date"
              name="commercial_register_date"
              required
              value={formData.commercial_register_date}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>License Number *</label>
            <input
              type="text"
              name="license_num"
              required
              value={formData.license_num}
              onChange={handleInputChange}
              placeholder="1111f"
            />
          </div>

          <div className="form-group">
            <label>License Date *</label>
            <input
              type="date"
              name="license_date"
              required
              value={formData.license_date}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group full-width">
            <label className="section-label">Organization Documents</label>
          </div>
          {/* Commercial Register (File) */}
          {/* Commercial Register (File) */}
          <div className="form-group">
            <label>Commercial Register (File)</label>
            <div className="file-input-wrapper">
              <Upload size={16} />
              <input
                type="file"
                name="commercial_register"
                accept="image/png, image/jpeg, image/jpg" // 👈 اقتصر فقط على الصور
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* License (File) */}
          <div className="form-group">
            <label>License (File)</label>
            <div className="file-input-wrapper">
              <Upload size={16} />
              <input
                type="file"
                name="license"
                accept="image/png, image/jpeg, image/jpg" // 👈 اقتصر فقط على الصور
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Logo (File) - صور فقط */}
          <div className="form-group">
            <label>Logo (File)</label>
            <div className="file-input-wrapper">
              <Upload size={16} />
              <input
                type="file"
                name="logo"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="modal-actions-footer full-width">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Publisher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
