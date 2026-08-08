import { useState } from "react";
import { UserPlus, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import API from "../../services/api";
import "./style/create-account.css";

export default function CreateAccount({ onClose, onCreated }) {
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
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.f_name.trim()) {
      return "First name is required";
    }

    if (!formData.l_name.trim()) {
      return "Last name is required";
    }

    if (!formData.father_name.trim()) {
      return "Father name is required";
    }

    if (!formData.national_num.trim()) {
      return "National number is required";
    }

    if (!formData.email.trim()) {
      return "Email is required";
    }

    if (!formData.phone.trim()) {
      return "Phone is required";
    }

    if (!formData.username.trim()) {
      return "Username is required";
    }

    if (!formData.password) {
      return "Password is required";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await API.post(
        "/api/auth/web/register",
        formData
      );

      console.log("Account created:", response.data);

      setSuccess("Account created successfully.");

      if (onCreated) {
        onCreated(response.data);
      }

      setFormData({
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

      // إذا أردتِ إغلاق النافذة تلقائياً
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 1200);

    } catch (err) {
      console.error("Create account error:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.detail;

      if (err?.response?.status === 401) {
        setError("Unauthorized. Your session may have expired.");
      } else if (err?.response?.status === 403) {
        setError("You do not have permission to create accounts.");
      } else if (err?.response?.status === 409) {
        setError(
          "The national number, email, or username already exists."
        );
      } else {
        setError(
          backendMessage ||
          "Failed to create account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-account-overlay">
      <div className="create-account-modal">

        <div className="create-account-header">
          <div className="create-account-title">
            <div className="create-account-icon">
              <UserPlus size={22} />
            </div>

            <div>
              <h2>Create Account</h2>
              <p>Create a new system account</p>
            </div>
          </div>

          <button
            className="close-button"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-section">
            <h3>Account Information</h3>

            <div className="form-group">
              <label>Account Type</label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="PUBLISHER">
                  Publisher
                </option>

                <option value="SYSTEM_EMPLOYEE">
                  System Employee
                </option>

                <option value="ADMIN">
                  Admin
                </option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Personal Information</h3>

            <div className="form-grid">

              <div className="form-group">
                <label>First Name</label>

                <input
                  type="text"
                  name="f_name"
                  value={formData.f_name}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>

                <input
                  type="text"
                  name="l_name"
                  value={formData.l_name}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </div>

              <div className="form-group">
                <label>Father Name</label>

                <input
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  placeholder="Enter father name"
                />
              </div>

              <div className="form-group">
                <label>National Number</label>

                <input
                  type="text"
                  name="national_num"
                  value={formData.national_num}
                  onChange={handleChange}
                  placeholder="Enter national number"
                />
              </div>

            </div>
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>

            <div className="form-grid">

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

            </div>
          </div>

          <div className="form-section">
            <h3>Login Credentials</h3>

            <div className="form-grid">

              <div className="form-group">
                <label>Username</label>

                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                />
              </div>

              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                />
              </div>

            </div>
          </div>

          {error && (
            <div className="form-message error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="form-message success-message">
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          <div className="create-account-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="loading-icon"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}