import { Building2, Clock3, BadgeCheck, ShieldAlert, AlertTriangle } from "lucide-react";

export default function OrganizationStats({ organizations }) {
  const total = organizations.length;
  const active = organizations.filter((o) => o.status === "Active").length;
  const pending = organizations.filter((o) => o.status === "Pending").length;
  const suspended = organizations.filter((o) => o.status === "Suspended").length;
  const banned = organizations.filter((o) => o.status === "Banned").length;

  return (
    <div className="organization-stats">
      <div className="org-stat-card">
        <div className="org-stat-icon total">
          <Building2 size={22} />
        </div>
        <div>
          <p>Total Organizations</p>
          <h2>{total}</h2>
        </div>
      </div>

      <div className="org-stat-card">
        <div className="org-stat-icon pending">
          <Clock3 size={22} />
        </div>
        <div>
          <p>Pending Review</p>
          <h2>{pending}</h2>
        </div>
      </div>

      <div className="org-stat-card">
        <div className="org-stat-icon active">
          <BadgeCheck size={22} />
        </div>
        <div>
          <p>Active Organizations</p>
          <h2>{active}</h2>
        </div>
      </div>

      <div className="org-stat-card">
        <div className="org-stat-icon suspended">
          <AlertTriangle size={22} />
        </div>
        <div>
          <p>Suspended</p>
          <h2>{suspended}</h2>
        </div>
      </div>

      <div className="org-stat-card">
        <div className="org-stat-icon banned-card">
          <ShieldAlert size={22} />
        </div>
        <div>
          <p>Banned</p>
          <h2>{banned}</h2>
        </div>
      </div>
    </div>
  );
}