import "./SplashScreen.css";
import Logo from "../../assets/Images/Logo.png";
const SplashScreen = () => {
  return (
    <div className="splash-bg">
      <div className="splash-content">
        <div className="logo-area">
          <img src={Logo} className="logo-icon" alt="Logo" />

          <h1 className="logo-text">Tender Flow</h1>
          <p className="logo-sub">TF</p>
        </div>

        <div className="loading-bars">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
