import Sidebar from "../../components/SideBar";
import Navbar from "../../components/Navbar";
import "./Dashbord.css";

import ActivityCard from "../../components/Dashbord/activitycard";
import PendingApprovalsTable from "../../components/Dashbord/Pending Approvals";
import DashboardCharts from "../../components/Dashbord/DashboardCharts";

import {
  Building2,
  ClipboardList,
  FileText,
  Files,
  Users,
} from "lucide-react";

function Dashboard() {
  // =========================================================
  // Dashboard demo data
  // =========================================================

  const pendingTenders = [
    {
      id: 101,
      title: "Smart Traffic Lights Installation",
      publisher: "Ministry of Transport",
      budget: "$1,200,000",
      submissionDate: "2026-07-04",
      status: "Pending",
    },
    {
      id: 102,
      title: "Hospital IT Infrastructure Expansion",
      publisher: "Ministry of Health",
      budget: "$850,000",
      submissionDate: "2026-07-03",
      status: "Pending",
    },
  ];

  const pendingOrganizations = [
    {
      id: 1,
      name: "Modern Technology Company",
      type: "Publisher",
      taxNumber: "123456789",
      status: "Active",
      submissionDate: "2026-07-02",
    },
    {
      id: 2,
      name: "Al-Emar Foundation",
      type: "Bidder",
      taxNumber: "987654321",
      status: "Pending",
      submissionDate: "2026-07-01",
    },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main application area */}
      <main className="main">
        {/* Navbar */}
        <Navbar
          showSearch={true}
          showProfile={true}
          showLanguage={false}
        />

        {/* Dashboard content */}
        <div className="dashboard-wrapper">

          {/* =====================================================
              Statistics Cards
          ====================================================== */}
          <section className="cards-grid">

            <div className="stat-card">
              <div className="card-header">
                <div className="icon-wrapper icon-blue">
                  <Building2 size={20} />
                </div>
              </div>

              <div className="card-body">
                <p className="card-title">
                  Organizations
                </p>

                <p className="card-value">
                  84
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="card-header">
                <span className="badge growth">
                  +12% ↗
                </span>

                <div className="icon-wrapper icon-green">
                  <ClipboardList size={20} />
                </div>
              </div>

              <div className="card-body">
                <p className="card-title">
                  Active Tenders
                </p>

                <p className="card-value">
                  42
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="card-header">
                <span className="badge growth">
                  +8% ↗
                </span>

                <div className="icon-wrapper icon-indigo">
                  <FileText size={20} />
                </div>
              </div>

              <div className="card-body">
                <p className="card-title">
                  Offers Received
                </p>

                <p className="card-value">
                  156
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="card-header">
                <span className="badge growth">
                  +3% ↗
                </span>

                <div className="icon-wrapper icon-yallow">
                  <Files size={20} />
                </div>
              </div>

              <div className="card-body">
                <p className="card-title">
                  Pending Requests
                </p>

                <p className="card-value">
                  15
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="card-header">
                <span className="badge growth">
                  +5% ↗
                </span>

                <div className="icon-wrapper icon-gray">
                  <Users size={20} />
                </div>
              </div>

              <div className="card-body">
                <p className="card-title">
                  Users
                </p>

                <p className="card-value">
                  200
                </p>
              </div>
            </div>

          </section>

          {/* =====================================================
              Dashboard Bottom
          ====================================================== */}
          <section className="dashboard-bottom">

            <div className="activity-section">
              <ActivityCard />
            </div>

            <div className="table-section">
              <PendingApprovalsTable
                initialTenders={pendingTenders}
                initialOrganizations={pendingOrganizations}
              />
            </div>

          </section>

          {/* =====================================================
              Charts
          ====================================================== */}
          <section className="charts-section">
            <DashboardCharts />
          </section>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;