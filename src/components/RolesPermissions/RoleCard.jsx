import {
  Shield,
  Building2,
  Users,
  CheckCircle2,
  FileText,
  ChevronRight,
} from "lucide-react";

const iconMap = {
  shield: Shield,
  building: Building2,
  users: Users,
  check: CheckCircle2,
  file: FileText,
};

export default function RoleCard({
  role,
  selected,
  onClick,
}) {
  const Icon = iconMap[role.icon] || Shield;

  return (
    <button
      type="button"
      className={`rp-role-card ${
        selected ? "selected" : ""
      }`}
      onClick={onClick}
    >

      <div
        className={`rp-role-icon ${role.color}`}
      >
        <Icon size={19} />
      </div>

      <div className="rp-role-card-content">

        <div className="rp-role-card-title">
          <strong>{role.name}</strong>

          {selected && (
            <span className="rp-selected-dot" />
          )}
        </div>

        <p>{role.description}</p>

        <div className="rp-role-card-bottom">

          <span>
            {role.permissions.length} Permissions
          </span>

          <ChevronRight size={15} />

        </div>

      </div>

    </button>
  );
}