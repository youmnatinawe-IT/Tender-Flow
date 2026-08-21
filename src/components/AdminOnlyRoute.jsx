import { useLocation } from "react-router-dom";

const AdminOnlyRoute = ({ children }) => {
  const location = useLocation();

  let currentUser = null;
  let userType = "";

  /* =========================================================
     Read User
  ========================================================= */

  try {
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      currentUser =
        JSON.parse(storedUser);
    }
  } catch (error) {
    console.error(
      "Failed to read user:",
      error
    );
  }

  /* =========================================================
     Read Type From User
  ========================================================= */

  userType =
    currentUser?.type ||
    currentUser?.data?.type ||
    currentUser?.user_type ||
    currentUser?.data?.user_type ||
    currentUser?.role?.type ||
    currentUser?.role?.name ||
    currentUser?.data?.role?.type ||
    currentUser?.data?.role?.name ||
    "";

  /* =========================================================
     Fallback To JWT
  ========================================================= */

  if (!userType) {
    try {
      const token =
        localStorage.getItem("token");

      if (token) {
        const payload =
          token.split(".")[1];

        if (payload) {
          const decodedPayload =
            JSON.parse(
              atob(
                payload
                  .replace(/-/g, "+")
                  .replace(/_/g, "/")
              )
            );

          userType =
            decodedPayload?.type || "";
        }
      }
    } catch (error) {
      console.error(
        "Failed to decode JWT:",
        error
      );
    }
  }

  /* =========================================================
     Normalize
  ========================================================= */

  userType = String(userType)
    .trim()
    .toUpperCase();

  const isAdmin =
    userType === "ADMIN" ||
    userType === "SYSTEM_ADMIN" ||
    userType === "SUPER_ADMIN";

  console.log(
    "AdminOnlyRoute User:",
    currentUser
  );

  console.log(
    "AdminOnlyRoute Type:",
    userType
  );

  console.log(
    "AdminOnlyRoute Is Admin:",
    isAdmin
  );

  /* =========================================================
     Access Denied
  ========================================================= */

  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          background:
            "var(--bg-main, #f8fafc)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            padding: "40px",
            textAlign: "center",
            borderRadius: "16px",
            background:
              "var(--card-bg, #ffffff)",
            border:
              "1px solid var(--border-color, #e5e7eb)",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              margin:
                "0 auto 20px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "var(--danger-bg, #fee2e2)",
              color:
                "var(--danger, #dc2626)",
              fontSize: "32px",
              fontWeight: "700",
            }}
          >
            !
          </div>

          <h2
            style={{
              marginBottom: "12px",
              color:
                "var(--text-primary, #111827)",
            }}
          >
            Access Denied
          </h2>

          <p
            style={{
              marginBottom: "24px",
              lineHeight: "1.7",
              color:
                "var(--text-secondary, #6b7280)",
            }}
          >
            You do not have permission
            to view the Roles &
            Permissions page.
          </p>

          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            style={{
              border: "none",
              borderRadius: "10px",
              padding:
                "11px 20px",
              cursor: "pointer",
              fontWeight: "600",
              background:
                "var(--primary, #2563eb)",
              color: "#fff",
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminOnlyRoute;