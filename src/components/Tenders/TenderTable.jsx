import { useEffect, useMemo, useState } from "react";
import "../Tenders/style/tender.css";
import TenderDetailsDrawer from "./TenderDatails";

import {
  Eye,
  Loader2,
  MapPin,
  Building2,
  Wallet,
  ChevronRight,
  Search,
  RefreshCw,
} from "lucide-react";

import { getAllTenders } from "../../services/tenderService";

/* =========================================================
   Helpers
========================================================= */

const formatTenderId = (id) => {
  if (!id) return "N/A";

  return `#${id.slice(-6).toUpperCase()}`;
};

const formatBudget = (value, currency) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "N/A";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "N/A";
  }

  return `${new Intl.NumberFormat("en-US").format(
    number,
  )} ${currency || ""}`.trim();
};

const getStatusClass = (status) => {
  const normalized =
    status
      ?.toLowerCase()
      .replace(/\s+/g, "-") || "unknown";

  return `status-badge status-${normalized}`;
};

const getTypeClass = (type) => {
  const normalized =
    type
      ?.toLowerCase()
      .replace(/\s+/g, "-") || "unknown";

  return `type-badge type-${normalized}`;
};

/* =========================================================
   Component
========================================================= */

export default function TenderTable({ filters = {} }) {
  const [tenders, setTenders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [selectedTender, setSelectedTender] =
    useState(null);

  const [refreshing, setRefreshing] =
    useState(false);

  /* =========================================================
     Fetch All Tenders - ADMIN
     
     API:
     GET /api/tenders/all
     
     Required:
     - Token
     - type: admin
  ========================================================= */

  const fetchTenders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      console.log(
        "==========================================",
      );

      console.log(
        "Fetching ALL tenders for ADMIN...",
      );

      console.log(
        "API: GET /api/tenders/all",
      );

      console.log(
        "==========================================",
      );

      /* =====================================================
         Call Admin API
      ===================================================== */

      const response = await getAllTenders();

      /* =====================================================
         Normalize Response
      ===================================================== */

      let tenderData = [];

      if (Array.isArray(response)) {
        tenderData = response;
      } else if (
        Array.isArray(response?.data)
      ) {
        tenderData = response.data;
      } else if (
        Array.isArray(response?.data?.data)
      ) {
        tenderData = response.data.data;
      }

      console.log(
        "Admin tenders received:",
        tenderData,
      );

      console.log(
        "Number of tenders:",
        tenderData.length,
      );

      setTenders(tenderData);
    } catch (err) {
      console.error(
        "Failed to fetch admin tenders:",
        err,
      );

      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "An error occurred while fetching tender data";

      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     Initial Fetch
  ========================================================= */

  useEffect(() => {
    fetchTenders();
  }, []);

  /* =========================================================
     Filtering
  ========================================================= */

  const filteredTenders = useMemo(() => {
    return tenders.filter((tender) => {
      /* =====================================================
         Tender Basic Data
      ===================================================== */

      const title =
        tender?.title?.toLowerCase() || "";

      const description =
        tender?.description?.toLowerCase() || "";

      const id =
        tender?._id?.toLowerCase() || "";

      /* =====================================================
         Publisher
      ===================================================== */

      const publisherName =
        tender?.publisher_org_id?.org_name?.toLowerCase() ||
        "";

      /* =====================================================
         Location
      ===================================================== */

      const location =
        tender?.execution_location?.toLowerCase() ||
        "";

      /* =====================================================
         Status
      ===================================================== */

      const status =
        tender?.status?.toLowerCase() || "";

      /* =====================================================
         Type
      ===================================================== */

      const type =
        tender?.type?.toLowerCase() || "";

      /* =====================================================
         Search
      ===================================================== */

      const searchValue =
        filters?.search
          ?.toLowerCase()
          ?.trim() || "";

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue) ||
        description.includes(searchValue) ||
        id.includes(searchValue) ||
        publisherName.includes(searchValue) ||
        location.includes(searchValue);

      /* =====================================================
         Status Filter
      ===================================================== */

      const matchesStatus =
        !filters?.status ||
        status ===
          filters.status.toLowerCase();

      /* =====================================================
         Publisher Filter
      ===================================================== */

      const matchesPublisher =
        !filters?.publisher ||
        publisherName.includes(
          filters.publisher.toLowerCase(),
        );

      /* =====================================================
         Type Filter
      ===================================================== */

      const matchesType =
        !filters?.type ||
        type ===
          filters.type.toLowerCase();

      /* =====================================================
         Created Date Filter
      ===================================================== */

      const createdDate = tender?.createdAt
        ? tender.createdAt.split("T")[0]
        : "";

      const matchesDate =
        !filters?.date ||
        createdDate === filters.date;

      /* =====================================================
         Minimum Budget
      ===================================================== */

      const estimatedValue = Number(
        tender?.estimated_value || 0,
      );

      const matchesMinBudget =
        !filters?.minBudget ||
        estimatedValue >=
          Number(filters.minBudget);

      /* =====================================================
         Maximum Budget
      ===================================================== */

      const matchesMaxBudget =
        !filters?.maxBudget ||
        estimatedValue <=
          Number(filters.maxBudget);

      /* =====================================================
         Final Filter Result
      ===================================================== */

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPublisher &&
        matchesType &&
        matchesDate &&
        matchesMinBudget &&
        matchesMaxBudget
      );
    });
  }, [tenders, filters]);

  /* =========================================================
     Loading State
  ========================================================= */

  if (loading) {
    return (
      <div className="tender-table-container tender-table-state">
        <div className="tender-loading-icon">
          <Loader2
            size={34}
            className="animate-spin"
          />
        </div>

        <h3>Loading Tenders</h3>

        <p>
          Please wait while tender data is being
          loaded.
        </p>
      </div>
    );
  }

  /* =========================================================
     Error State
  ========================================================= */

  if (error) {
    return (
      <div className="tender-table-container tender-table-state error-state">
        <div className="tender-error-icon">
          !
        </div>

        <h3>Unable to Load Tenders</h3>

        <p>{error}</p>

        <button
          className="tender-refresh-btn"
          onClick={() => fetchTenders()}
        >
          <RefreshCw size={16} />

          Try Again
        </button>
      </div>
    );
  }

  /* =========================================================
     Render
  ========================================================= */

  return (
    <>
      <div className="tender-table-wrapper">

        {/* =================================================
            Table Header
        ================================================= */}

        <div className="tender-table-topbar">
          <div>
            <h3 className="tender-table-heading">
              Tender Management
            </h3>

            <p className="tender-table-subheading">
              {filteredTenders.length} tender
              {filteredTenders.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

          {/* =================================================
              Refresh
          ================================================= */}

          <button
            className="tender-refresh-icon-btn"
            onClick={() =>
              fetchTenders(true)
            }
            disabled={refreshing}
            title="Refresh"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </div>

        {/* =================================================
            Empty State
        ================================================= */}

        {filteredTenders.length === 0 ? (
          <div className="tender-empty-state">

            <div className="tender-empty-icon">
              <Search size={30} />
            </div>

            <h3>No Tenders Found</h3>

            <p>
              No tenders match your current
              search or filter criteria.
            </p>

          </div>
        ) : (
          <div className="tender-table-scroll">

            <table className="tender-table">

              {/* =================================================
                  THEAD
              ================================================= */}

              <thead>
                <tr>
                  <th>TENDER</th>

                  <th>PUBLISHER</th>

                  <th>ESTIMATED VALUE</th>

                  <th>LOCATION</th>

                  <th>STATUS</th>

                  <th>ACTIONS</th>
                </tr>
              </thead>

              {/* =================================================
                  TBODY
              ================================================= */}

              <tbody>
                {filteredTenders.map(
                  (tender) => {
                    const publisher =
                      tender?.publisher_org_id ||
                      {};

                    return (
                      <tr
                        key={tender?._id}
                        className="tender-table-row"
                      >

                        {/* =====================================
                            Tender
                        ===================================== */}

                        <td>
                          <div className="tender-main-cell">

                            <div className="tender-title-area">

                              <div className="tender-id">
                                {formatTenderId(
                                  tender?._id,
                                )}
                              </div>

                              <div className="tender-name">
                                {tender?.title ||
                                  "Untitled Tender"}
                              </div>

                              <div className="tender-type-row">

                                <span
                                  className={getTypeClass(
                                    tender?.type,
                                  )}
                                >
                                  {tender?.type ||
                                    "N/A"}
                                </span>

                              </div>

                            </div>

                          </div>
                        </td>

                        {/* =====================================
                            Publisher
                        ===================================== */}

                        <td>
                          <div className="publisher-table-cell">

                            <div className="publisher-icon">
                              <Building2 size={17} />
                            </div>

                            <div className="publisher-text">

                              <strong>
                                {publisher?.org_name ||
                                  "N/A"}
                              </strong>

                              <span>
                                {publisher?._type ||
                                  "PUBLISHER"}
                              </span>

                            </div>

                          </div>
                        </td>

                        {/* =====================================
                            Estimated Value
                        ===================================== */}

                        <td>
                          <div className="value-table-cell">

                            <div className="value-icon">
                              <Wallet size={16} />
                            </div>

                            <div>

                              <strong>
                                {formatBudget(
                                  tender?.estimated_value,
                                  tender?.currency,
                                )}
                              </strong>

                              <span>
                                Estimated Value
                              </span>

                            </div>

                          </div>
                        </td>

                        {/* =====================================
                            Location
                        ===================================== */}

                        <td>
                          <div className="location-table-cell">

                            <MapPin size={16} />

                            <span>
                              {tender?.execution_location ||
                                "N/A"}
                            </span>

                          </div>
                        </td>

                        {/* =====================================
                            Status
                        ===================================== */}

                        <td>
                          <span
                            className={getStatusClass(
                              tender?.status,
                            )}
                          >

                            <span className="status-dot" />

                            {tender?.status ||
                              "N/A"}

                          </span>
                        </td>

                        {/* =====================================
                            Actions
                        ===================================== */}

                        <td>
                          <button
                            className="tender-view-btn"
                            onClick={() =>
                              setSelectedTender(
                                tender,
                              )
                            }
                          >
                            <Eye size={16} />

                            <span>
                              Details
                            </span>

                            <ChevronRight
                              size={15}
                            />
                          </button>
                        </td>

                      </tr>
                    );
                  },
                )}
              </tbody>

            </table>

          </div>
        )}
      </div>

      {/* =====================================================
          Tender Details
      ===================================================== */}

      <TenderDetailsDrawer
        tender={selectedTender}
        onClose={() =>
          setSelectedTender(null)
        }
      />
    </>
  );
}