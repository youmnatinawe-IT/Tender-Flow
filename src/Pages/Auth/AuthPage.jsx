import { useState } from "react";
import "./AuthPage.css";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Images/Logo blue.png";
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  return (
    <div className="auth-container">
      <div className="auth-card">
         <img src={Logo} className="logo-icon" alt="Logo" />
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
              navigate("/dashboard");
          }}
        >
          {!isLogin && (
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                required
                dir="ltr"
              />
            </div>
          )}
         
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="example@mail.com"
              required
              dir="ltr"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required dir="ltr" />
          </div>

          <button type="submit" className="btn-primary">
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="toggle-text">
          
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "forget password?" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
