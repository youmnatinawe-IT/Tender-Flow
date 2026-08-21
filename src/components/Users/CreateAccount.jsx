import { useState, useEffect } from "react";

import {
  UserPlus,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import API from "../../services/api";

import ErrorAlert, { FieldError } from "../ErrorAlert";

import useApiRequest from "../../hooks/useApiRequest";

import {
  getPublisherOrgs,
  getExecutorOrgs,
} from "../../services/organizationService";

import "./style/create-account.css";

const INITIAL_FORM_DATA = {
  type: "PUBLISHER",
  org_id: "",
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

  const [organizations, setOrganizations] = useState([]);

  const [organizationsLoading, setOrganizationsLoading] =
    useState(false);

  const [organizationsError, setOrganizationsError] =
    useState("");

  const [success, setSuccess] = useState("");

  const { loading, error, run, setError } = useApiRequest();

  /**
   * Extract organizations array from different possible API responses.
   */
  const extractOrganizations = (response) => {
    if (!response) {
      return [];
    }

    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.publishers)) {
      return data.publishers;
    }

    if (Array.isArray(data?.executors)) {
      return data.executors;
    }

    if (Array.isArray(data?.organizations)) {
      return data.organizations;
    }

    return [];
  };

  /**
   * Load organizations according to account type.
   */
  const loadOrganizations = async (type) => {
    setOrganizationsLoading(true);
    setOrganizationsError("");

    try {
      const response =
        type === "PUBLISHER"
          ? await getPublisherOrgs()
          : await getExecutorOrgs();

      if (!response?.success) {
        throw new Error(
          response?.error?.message ||
            "Failed to load organizations."
        );
      }

      const orgs = extractOrganizations(response);

      setOrganizations(orgs);

      /**
       * Reset selected organization when changing account type.
       */
      setFormData((prev) => ({
        ...prev,
        org_id: "",
      }));
    } catch (err) {
      console.error("Error loading organizations:", err);

      setOrganizations([]);
      setOrganizationsError(
        err?.message || "Failed to load organizations."
      );
    } finally {
      setOrganizationsLoading(false);
    }
  };

  /**
   * Load organizations on component mount.
   */
  useEffect(() => {
    loadOrganizations(formData.type);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    /**
     * If account type changes:
     * load the correct organization list.
     */
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        org_id: "",
      }));

      loadOrganizations(value);

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.type) {
      return "Account type is required";
    }

    if (!formData.org_id) {
      return "Organization is required";
    }

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

    /**
     * JSON payload sent to backend.
     *
     * No images.
     * No FormData.
     */
    const payload = {
      org_id: formData.org_id,
      type: formData.type,
      f_name: formData.f_name.trim(),
      l_name: formData.l_name.trim(),
      father_name: formData.father_name.trim(),
      national_num: formData.national_num.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      username: formData.username.trim(),
      password: formData.password,
    };

    console.log("Create Account Request Body:", payload);

    const result = await run(
      API.post("/api/users", payload)
    );

    if (!result.success) {
      return;
    }

    setSuccess("Account created successfully.");

    if (onCreated) {
      onCreated(result.data);
    }

    setFormData({
      ...INITIAL_FORM_DATA,
    });

    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 1200);
  };

  return (
    <div className="create-account-overlay">
      <div className="create-account-modal">
        {/* Header */}
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
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Account Information */}
          <div className="form-section">
            <h3>Account Information</h3>

            {/* Account Type */}
            <div className="form-group">
              <label>Account Type</label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={
                  loading || organizationsLoading
                }
              >
                <option value="PUBLISHER">
                  Publisher
                </option>

                <option value="SYSTEM_EMPLOYEE">
                  System Employee
                </option>
              </select>

              <FieldError
                error={error}
                name="type"
              />
            </div>

            {/* Organization */}
            <div className="form-group">
              <label>
                Organization
                <span
                  style={{
                    color: "#ef4444",
                    marginLeft: "4px",
                  }}
                >
                  *
                </span>
              </label>

              <select
                name="org_id"
                value={formData.org_id}
                onChange={handleChange}
                disabled={
                  loading ||
                  organizationsLoading ||
                  organizations.length === 0
                }
              >
                <option value="">
                  {organizationsLoading
                    ? "Loading organizations..."
                    : "Select organization"}
                </option>

                {organizations.map((org) => {
                  const id = org?._id || org?.id;

                  const name =
                    org?.org_name ||
                    org?.name ||
                    org?.organization_name ||
                    "Unnamed Organization";

                  return (
                    <option
                      key={id}
                      value={id}
                    >
                      {name}
                    </option>
                  );
                })}
              </select>

              {organizationsError && (
                <div
                  className="field-error"
                  style={{
                    marginTop: "6px",
                    color: "#ef4444",
                  }}
                >
                  {organizationsError}
                </div>
              )}

              <FieldError
                error={error}
                name="org_id"
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className="form-section">
            <h3>Personal Information</h3>

            <div className="form-grid">
              {/* First Name */}
              <div className="form-group">
                <label>First Name</label>

                <input
                  type="text"
                  name="f_name"
                  value={formData.f_name}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  disabled={loading}
                />

                <FieldError
                  error={error}
                  name="f_name"
                />
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label>Last Name</label>

                <input
                  type="text"
                  name="l_name"
                  value={formData.l_name}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  disabled={loading}
                />

                <FieldError
                  error={error}
                  name="l_name"
                />
              </div>

              {/* Father Name */}
              <div className="form-group">
                <label>Father Name</label>

                <input
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  placeholder="Enter father name"
                  disabled={loading}
                />

                <FieldError
                  error={error}
                  name="father_name"
                />
              </div>

              {/* National Number */}
              <div className="form-group">
                <label>National Number</label>

                <input
                  type="text"
                  name="national_num"
                  value={formData.national_num}
                  onChange={handleChange}
                  placeholder="Enter national number"
                  disabled={loading}
                />

                <FieldError
                  error={error}
                  name="national_num"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h3>Contact Information</h3>

            <div className="form-grid">
              {/* Email */}
              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  disabled={loading}
                />

                <FieldError
                  error={error}
                  name="email"
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label>Phone</label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  disabled={loading}
                />

                <FieldError
                  error={error}
                  name="phone"
                />
              </div>
            </div>
          </div>

          {/* Login Credentials */}
          <div className="form-section">
            <h3>Login Credentials</h3>

            <div className="form-grid">
              {/* Username */}
              <div className="form-group">
                <label>Username</label>

                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  disabled={loading}
                />

                <FieldError
                  error={error}
                  name="username"
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  disabled={loading}
                />

                <FieldError
                  error={error}
                  name="password"
                />
              </div>
            </div>
          </div>

          {/* API Error */}
          <ErrorAlert error={error} />

          {/* Success */}
          {success && (
            <div className="form-message success-message">
              <CheckCircle2 size={18} />

              <span>{success}</span>
            </div>
          )}

          {/* Actions */}
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
              disabled={
                loading ||
                organizationsLoading ||
                !formData.org_id
              }
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