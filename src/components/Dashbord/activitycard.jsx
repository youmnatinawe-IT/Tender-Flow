const activities = [
  {
    id: 1,
    color: "#10b981",
    title: 'Tender awarded for "Equipment Supply"',
    subtitle: "By: Fahad Al-Kazem · 10 minutes ago",
  },
  {
    id: 2,
    color: "#64748b",
    title: "Received 5 new bids for the construction tender",
    subtitle: "Auto update · 1 hour ago",
  },
  {
    id: 3,
    color: "#dc2626",
    title: "Application request #4422 has been canceled",
    subtitle: "By: Sarah Al-Ghamdi · 3 hours ago",
  },
  {
    id: 4,
    color: "#0f172a",
    title: "Applications opened for the maintenance project",
    subtitle: "System · 5 hours ago",
  },
];

export default function ActivityCard() {
  return (
    <div className="activity-card">
      <h2 className="activity-title"> Latest Activities</h2>

      {activities.map((item) => (
        <div key={item.id} className="activity-item">
          <span
            className="activity-dot"
            style={{ backgroundColor: item.color }}
          />

          <div className="activity-content">
            <h4>{item.title}</h4>
            <p>{item.subtitle}</p>
          </div>
        </div>
      ))}

      
    </div>
  );
}