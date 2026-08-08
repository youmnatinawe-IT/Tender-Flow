import { useState } from "react";
import { UserPlus, X, Loader2, CheckCircle2 } from "lucide-react";
import API from "../../services/api";
import ErrorAlert, { FieldError } from "../ErrorAlert";
import useApiRequest from "../../hooks/useApiRequest";
import "./style/create-account.css";

const INITIAL_FORM_DATA = {
  type: "PUBLISHER",
  f_name: "",
  l_name: "",
  father_name: "",
  national_num: "",
  email: "",
  phone: "",
  username: "",
  password: "",
};

export default function CreateAccount({ onClose, onCreated }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const [success, setSuccess] = useState("");

  const { loading, error, run, setError } = useApiRequest();

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

    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError({
        isApiError: true,
        code: "VALIDATION",
        message: validationError,
      });
      return;
    }

    const result = await run(API.post("/api/users", formData));
    if (!result.success) {
      return;
    }

    setSuccess("Account created successfully.");

    if (onCreated) {
      onCreated(result.data);
    }

    setFormData({ ...INITIAL_FORM_DATA });

    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 1200);
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

          <button className="close-button" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Account Information</h3>

            <div className="form-group">
              <label>Account Type</label>

              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="PUBLISHER">Publisher</option>
                <option value="SYSTEM_EMPLOYEE">System Employee</option>
              </select>
              <FieldError error={error} name="type" />
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
                <FieldError error={error} name="f_name" />
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
                <FieldError error={error} name="l_name" />
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
                <FieldError error={error} name="father_name" />
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
                <FieldError error={error} name="national_num" />
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
                <FieldError error={error} name="email" />
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
                <FieldError error={error} name="phone" />
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
                <FieldError error={error} name="username" />
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
                <FieldError error={error} name="password" />
              </div>
            </div>
          </div>

          <ErrorAlert error={error} />

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

            <button type="submit" className="create-button" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="loading-icon" />
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
