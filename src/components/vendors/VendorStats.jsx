import "./style/vendor.css";

export default function VendorStats({ vendors = [] }) {
  const total = vendors.length;
  const pending = vendors.filter((v) => v.status === "pending").length;
  const approved = vendors.filter((v) => v.status === "approved").length;
  const highRisk = vendors.filter((v) => v.riskScore === "High").length;

  const cards = [
    {
      title: "Total Vendors",
      value: total,
      badgeClass: "bg-blue-100 text-blue-700",
    },
    {
      title: "Pending Verification",
      value: pending,
      badgeClass: "bg-amber-100 text-amber-700",
    },
    {
      title: "Approved Accounts",
      value: approved,
      badgeClass: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Risk / Alerts",
      value: highRisk,
      badgeClass: "bg-rose-100 text-rose-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center"
        >
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">
              {card.title}
            </p>
            <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
          </div>
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${card.badgeClass}`}
          >
            Updated
          </span>
        </div>
      ))}
    </div>
  );
}