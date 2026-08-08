import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api"; // عدّل المسار حسب مكان ملف api.js لديك
import "./AuthPage.css";
import Logo from "../../assets/Images/Logo blue.png";

const AuthPage = () => {
  const navigate = useNavigate();

  // حالات حفظ اسم المستخدم وكلمة المرور
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // حالات التحميل والأخطاء
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // إرسال طلب الـ POST للـ Endpoint المطلوبة
      const response = await API.post("/api/auth/web/login", {
        username: username,
        password: password,
      });

      console.log("تم تسجيل الدخول بنجاح:", response.data);

      // في حال كان الـ API يرجع token، نقوم بحفظه للاستخدام اللاحق
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }

      // الانتقال للوحة التحكم
      navigate("/dashboard");
    } catch (error) {
      console.error("خطأ في تسجيل الدخول:", error);

      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(" تعذر الاتصال بالخادم.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={Logo} className="logo-icon" alt="Logo" />
        <h2>Login</h2>

        {errorMessage && (
          <div className="error-message" style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              dir="ltr"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              dir="ltr" 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="toggle-text">
          <span onClick={() => navigate("/forgot-password")}>
            Forgot password?
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;