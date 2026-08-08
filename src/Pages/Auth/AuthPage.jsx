import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { setToken } from "../../services/session";
import ErrorAlert from "../../components/ErrorAlert";
import useApiRequest from "../../hooks/useApiRequest";
import "./AuthPage.css";
import Logo from "../../assets/Images/Logo blue.png";

const AuthPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { loading, error, run } = useApiRequest();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await run(
      API.post("/api/auth/web/login", {
        username: username,
        password: password,
      })
    );

    if (!result.success) {
      return;
    }

    if (result.data?.token) {
      setToken(result.data.token);
    }

    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={Logo} className="logo-icon" alt="Logo" />
        <h2>Login</h2>

        <ErrorAlert error={error} />

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