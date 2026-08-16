import { useState, useEffect } from "react";
import SplashScreen from "./Pages/Splach/SplashScreen";
import AuthPage from "./Pages/Auth/AuthPage";
import Dashboard from "./Pages/Dashbord/Dashbord";
import Organizations from "./Pages/Dashbord/Organizations";
import Tenders from "./Pages/Dashbord/Tenders";
import Users from "./Pages/Dashbord/Users"
import Vendors from "./Pages/Dashbord/vendors"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import OrganizationDetails from "./components/organaizations/organizationdetails";
import SessionExpiryWatcher from "./components/SessionExpiryWatcher";
// import Accounts from "./components/Dashbord/Accounts"
function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <SessionExpiryWatcher />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/organizations/:id" element={<OrganizationDetails />} />
        <Route path="/tenders" element={<Tenders />} />
        <Route path="/users" element={<Users />} />
           <Route path="/vendors" element={<  Vendors />} />
           {/* <Route path="/accounts" element={<Accounts />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
