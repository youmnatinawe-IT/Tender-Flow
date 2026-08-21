import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Building2,
  FileText,
  ArrowRight,
  Eye,
} from "lucide-react";

import {
  getPublisherOrgs,
  getExecutorOrgs,
} from "../../services/organizationService";

import "./Pending Approvals.css";


export default function PendingApprovalsTable({
  initialTenders = [],
  initialOrganizations = [],
}) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("tenders");

  const [tenders] = useState(initialTenders);

  const [organizations, setOrganizations] = useState(
    initialOrganizations
  );

  const [loading, setLoading] = useState(true);


  /* =========================================================
     Fetch Organizations
  ========================================================= */

  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true);

      try {
        const [
          publishersRes,
          executorsRes,
        ] = await Promise.all([
          getPublisherOrgs(),
          getExecutorOrgs(),
        ]);

        let combinedOrgs = [];


        /* ---------------- Publishers ---------------- */

        if (
          publishersRes?.success &&
          publishersRes?.data
        ) {
          const pubList = Array.isArray(
            publishersRes.data
          )
            ? publishersRes.data
            : publishersRes.data.publishers ||
              publishersRes.data.data ||
              [];

          const publishers = pubList.map((org) => ({
            ...org,
            type: "Publisher",
          }));

          combinedOrgs = [
            ...combinedOrgs,
            ...publishers,
          ];
        }


        /* ---------------- Executors ---------------- */

        if (
          executorsRes?.success &&
          executorsRes?.data
        ) {
          const execList = Array.isArray(
            executorsRes.data
          )
            ? executorsRes.data
            : executorsRes.data.executors ||
              executorsRes.data.data ||
              [];

          const executors = execList.map((org) => ({
            ...org,
            type: org.type || "Bidder",
          }));

          combinedOrgs = [
            ...combinedOrgs,
            ...executors,
          ];
        }


        if (combinedOrgs.length > 0) {
          setOrganizations(combinedOrgs);
        }
      } catch (error) {
        console.error(
          "Error fetching organizations:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);


  /* =========================================================
     Navigation
  ========================================================= */

  const handleNavigateToReview = (id) => {
    if (activeTab === "tenders") {
      navigate(
        id
          ? `/tenders/${id}`
          : "/tenders?status=Pending"
      );
    } else {
      navigate(
        id
          ? `/organizations/${id}`
          : "/organizations"
      );
    }
  };


  /* =========================================================
     Display Data
  ========================================================= */

  const pendingTenders = tenders
    .filter(
      (tender) =>
        String(tender.status).toLowerCase() ===
        "pending"
    )
    .slice(0, 2);

  const displayOrganizations =
    organizations.slice(0, 2);


  /* =========================================================
     Render
  ========================================================= */

  return (
    <div className="table-container">

      {/* =====================================================
          Header
      ====================================================== */}

      <div className="table-header-flex">

        <h2 className="table-title">
          Pending Approvals
        </h2>

        <div className="approval-tabs">

          {/* Tenders */}
          <button
            type="button"
            className={`tab-btn ${
              activeTab === "tenders"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("tenders")
            }
          >
            <FileText size={15} />

            <span>
              Tenders
            </span>

            <span className="tab-badge">
              {pendingTenders.length}
            </span>
          </button>


          {/* Organizations */}
          <button
            type="button"
            className={`tab-btn ${
              activeTab === "orgs"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("orgs")
            }
          >
            <Building2 size={15} />

            <span>
              Organizations
            </span>

            <span className="tab-badge">
              {organizations.length}
            </span>
          </button>

        </div>
      </div>


      {/* =====================================================
          Table Wrapper
      ====================================================== */}

      <div className="table-scroll">

        <table className="approval-table">

          <thead>

            {activeTab === "tenders" ? (
              <tr>
                <th>Tender Title</th>
                <th>Publisher</th>
                <th>Budget</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th className="center-column">
                  Review
                </th>
              </tr>
            ) : (
              <tr>
                <th>Organization</th>
                <th>Type</th>
                <th>Tax Number</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th className="center-column">
                  Review
                </th>
              </tr>
            )}

          </thead>


          <tbody>

            {/* =================================================
                Tenders
            ================================================== */}

            {activeTab === "tenders" &&
              pendingTenders.map((item) => (
                <tr key={item.id}>

                  <td className="bold-text">
                    {item.title}
                  </td>

                  <td>
                    {item.publisher}
                  </td>

                  <td className="bold-text">
                    {item.budget}
                  </td>

                  <td>
                    {item.submissionDate}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        String(
                          item.status
                        ).toLowerCase()
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="center-column">
                    <button
                      type="button"
                      className="review-btn"
                      onClick={() =>
                        handleNavigateToReview(
                          item.id
                        )
                      }
                      title="Review Tender"
                    >
                      <Eye size={14} />

                      <span>
                        Review
                      </span>
                    </button>
                  </td>

                </tr>
              ))}


            {/* =================================================
                Empty Tenders
            ================================================== */}

            {activeTab === "tenders" &&
              pendingTenders.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="empty-row"
                  >
                    No pending tenders found.
                  </td>
                </tr>
              )}


            {/* =================================================
                Organizations Loading
            ================================================== */}

            {activeTab === "orgs" &&
              loading && (
                <tr>
                  <td
                    colSpan="6"
                    className="empty-row"
                  >
                    Loading organizations...
                  </td>
                </tr>
              )}


            {/* =================================================
                Empty Organizations
            ================================================== */}

            {activeTab === "orgs" &&
              !loading &&
              displayOrganizations.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="empty-row"
                  >
                    No organizations found.
                  </td>
                </tr>
              )}


            {/* =================================================
                Organizations
            ================================================== */}

            {activeTab === "orgs" &&
              !loading &&
              displayOrganizations.map((item) => {

                const organizationId =
                  item._id || item.id;

                const organizationName =
                  item.org_name ||
                  item.name ||
                  "Modern Technology Company";

                const organizationType =
                  item._type ||
                  item.type ||
                  "Publisher";

                const taxNumber =
                  item.taxNumber ||
                  item.tax_number ||
                  item.phone_number ||
                  "123456789";

                const submissionDate =
                  item.createdAt
                    ? item.createdAt.split("T")[0]
                    : item.submissionDate ||
                      "2026-07-02";

                const status =
                  item.status ||
                  "Pending";


                return (
                  <tr
                    key={organizationId}
                  >

                    <td className="bold-text">
                      {organizationName}
                    </td>

                    <td>
                      <span className="type-badge">
                        {organizationType}
                      </span>
                    </td>

                    <td>
                      {taxNumber}
                    </td>

                    <td>
                      {submissionDate}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          String(
                            status
                          ).toLowerCase()
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="center-column">

                      <button
                        type="button"
                        className="review-btn"
                        onClick={() =>
                          handleNavigateToReview(
                            organizationId
                          )
                        }
                        title="Review Organization"
                      >
                        <Eye size={14} />

                        <span>
                          Review
                        </span>
                      </button>

                    </td>

                  </tr>
                );
              })}

          </tbody>
        </table>

      </div>


      {/* =====================================================
          Footer
      ====================================================== */}

      <div className="table-footer">

        <button
          type="button"
          className="view-all-btn"
          onClick={() =>
            handleNavigateToReview()
          }
        >
          <span>
            {activeTab === "tenders"
              ? "View All Tenders"
              : "View All Organizations"}
          </span>

          <ArrowRight size={16} />

        </button>

      </div>

    </div>
  );
}