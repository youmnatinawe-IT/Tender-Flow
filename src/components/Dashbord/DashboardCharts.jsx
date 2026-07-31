import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import "./DashboardCharts.css";

const tenderData = [
  { month: "Jan", tenders: 12 },
  { month: "Feb", tenders: 18 },
  { month: "Mar", tenders: 25 },
  { month: "Apr", tenders: 15 },
  { month: "May", tenders: 30 },
  { month: "Jun", tenders: 22 },
];

const bidData = [
  { month: "Jan", bids: 35 },
  { month: "Feb", bids: 50 },
  { month: "Mar", bids: 65 },
  { month: "Apr", bids: 42 },
  { month: "May", bids: 80 },
  { month: "Jun", bids: 70 },
];
const userTypeData = [
  { name: "Publisher Users", value: 47 },
  { name: "Bidder Users", value: 55 },
  { name: "Auditors", value: 8 },
  { name: "Support", value: 5 },

];

const COLORS = [
  "#0f172a",
  "#64748b",
  "#4ade80",
  "#d1d5db",
];

export default function DashboardCharts() {
  return (
    <>
      <div className="charts-grid">

        {/* Tenders */}
        <div className="chart-card">
          <h3>Tenders by Month</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tenderData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tenders" fill="#2563eb" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Offers */}
        <div className="chart-card">
          <h3>Offers by Month</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bidData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="bids"
                stroke="#10b981"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Types */}
      <div className="chart-card user-chart">

        <div className="user-chart-wrapper">

          <div className="pie-container">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={userTypeData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={80}
                  outerRadius={120}
                >
                  {userTypeData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="user-legend">
            <h2>User Types Distribution</h2>
            <p>User roles across the system</p>

            {userTypeData.map((item, index) => (
              <div className="legend-row" key={index}>
                <div className="legend-info">
                  <span
                    className="legend-color"
                    style={{ background: COLORS[index] }}
                  />
                  <span>{item.name}</span>
                </div>

                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}