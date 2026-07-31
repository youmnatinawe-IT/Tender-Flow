import ProfileCard from "../../components/Setting/ProfileCard";
import GeneralCard from "../../components/Setting/GeneralCard";
import NotificationCard from "../../components/Setting/NotificationCard";
import SecurityCard from "../../components/Setting/SecurityCard";

import "../../components/Settings/style/settings.css";

export default function Settings() {
  return (
    <div className="settings-page">

      <div className="page-header">
        <h2>Settings</h2>
        <p>Manage your account and system preferences.</p>
      </div>

      <ProfileCard />

      <GeneralCard />

      <NotificationCard />

      <SecurityCard />

    </div>
  );
}