import  { useEffect, useMemo, useState } from "react";
import "../Tenders/style/tender.css";
import TenderDetailsDrawer from "./TenderDatails";

import {
  Eye,
  Loader2,
  MapPin,
  CalendarDays,
  Building2,
  Wallet,
  Clock3,
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

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
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
    number
  )} ${currency || ""}`.trim();
};

const getDaysLeft = (deadline) => {
  if (!deadline) return null;

  const now = new Date();
  const endDate = new Date(deadline);

  if (Number.isNaN(endDate.getTime())) {
    return null;
  }

  const diff =
    endDate.getTime() - now.getTime();

  if (diff <= 0) return 0;

  return Math.ceil(
    diff / (1000 * 60 * 60 * 24)
  );
};

const getStatusClass = (status) => {
  const normalized =
    status?.toLowerCase().replace(/\s+/g, "-") ||
    "unknown";

  return `status-badge status-${normalized}`;
};

const getTypeClass = (type) => {
  const normalized =
    type?.toLowerCase().replace(/\s+/g, "-") ||
    "unknown";

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
     Fetch
  ========================================================= */

  const fetchTenders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response = await getAllTenders();

      /*
        يدعم أكثر من شكل محتمل للـservice:

        1. Array
        2. { data: [] }
        3. { data: { data: [] } }
      */

      let tenderData = [];

      if (Array.isArray(response)) {
        tenderData = response;
      } else if (Array.isArray(response?.data)) {
        tenderData = response.data;
      } else if (
        Array.isArray(response?.data?.data)
      ) {
        tenderData = response.data.data;
      }

      setTenders(tenderData);
    } catch (err) {
      console.error(
        "Failed to fetch tenders:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "An error occurred while fetching tender data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, []);

  /* =========================================================
     Filtering
  ========================================================= */

  const filteredTenders = useMemo(() => {
    return tenders.filter((tender) => {
      const title =
        tender?.title?.toLowerCase() || "";

      const description =
        tender?.description?.toLowerCase() || "";

      const id =
        tender?._id?.toLowerCase() || "";

      const publisherName =
        tender?.publisher_org_id?.org_name?.toLowerCase() ||
        "";

      const location =
        tender?.execution_location?.toLowerCase() ||
        "";

      const status =
        tender?.status?.toLowerCase() || "";

      const type =
        tender?.type?.toLowerCase() || "";

      const searchValue =
        filters?.search?.toLowerCase()?.trim() ||
        "";

      /* Search */

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue) ||
        description.includes(searchValue) ||
        id.includes(searchValue) ||
        publisherName.includes(searchValue) ||
        location.includes(searchValue);

      /* Status */

      const matchesStatus =
        !filters?.status ||
        status === filters.status.toLowerCase();

      /* Publisher */

      const matchesPublisher =
        !filters?.publisher ||
        publisherName.includes(
          filters.publisher.toLowerCase()
        );

      /* Type */

      const matchesType =
        !filters?.type ||
        type === filters.type.toLowerCase();

      /* Created Date */

      const createdDate =
        tender?.createdAt
          ? tender.createdAt.split("T")[0]
          : "";

      const matchesDate =
        !filters?.date ||
        createdDate === filters.date;

      /* Minimum Value */

      const estimatedValue = Number(
        tender?.estimated_value || 0
      );

      const matchesMinBudget =
        !filters?.minBudget ||
        estimatedValue >=
          Number(filters.minBudget);

      /* Maximum Value */

      const matchesMaxBudget =
        !filters?.maxBudget ||
        estimatedValue <=
          Number(filters.maxBudget);

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
     Loading
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
          Please wait while tender data is
          being loaded.
        </p>
      </div>
    );
  }

  /* =========================================================
     Error
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

          <button
            className="tender-refresh-icon-btn"
            onClick={() => fetchTenders(true)}
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
            Empty
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
                  <th>SUBMISSION PERIOD</th>
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

                    const daysLeft =
                      getDaysLeft(
                        tender?.submission_deadline
                      );

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
                                  tender?._id
                                )}
                              </div>

                              <div className="tender-name">
                                {tender?.title ||
                                  "Untitled Tender"}
                              </div>

                              <div className="tender-type-row">
                                <span
                                  className={getTypeClass(
                                    tender?.type
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
                              <Building2
                                size={17}
                              />
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
                              <Wallet
                                size={16}
                              />
                            </div>

                            <div>
                              <strong>
                                {formatBudget(
                                  tender?.estimated_value,
                                  tender?.currency
                                )}
                              </strong>

                              <span>
                                Estimated Value
                              </span>
                            </div>

                          </div>
                        </td>

                        {/* =====================================
                            Submission Period
                        ===================================== */}

                        <td>
                          <div className="submission-cell">

                            <div className="submission-date">
                              <CalendarDays
                                size={14}
                              />

                              <div>
                                <span>
                                  Starts
                                </span>

                                <strong>
                                  {formatDate(
                                    tender?.submission_start
                                  )}
                                </strong>
                              </div>
                            </div>

                            <div className="submission-divider" />

                            <div className="submission-date deadline">
                              <Clock3
                                size={14}
                              />

                              <div>
                                <span>
                                  Deadline
                                </span>

                                <strong>
                                  {formatDate(
                                    tender?.submission_deadline
                                  )}
                                </strong>
                              </div>
                            </div>

                            {daysLeft !== null && (
                              <span
                                className={`deadline-mini ${
                                  daysLeft === 0
                                    ? "expired"
                                    : daysLeft <= 7
                                    ? "urgent"
                                    : ""
                                }`}
                              >
                                {daysLeft > 0
                                  ? `${daysLeft} days left`
                                  : "Expired"}
                              </span>
                            )}

                          </div>
                        </td>

                        {/* =====================================
                            Location
                        ===================================== */}

                        <td>
                          <div className="location-table-cell">

                            <MapPin
                              size={16}
                            />

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
                              tender?.status
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
                                tender
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
                  }
                )}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* =====================================================
          Details Drawer
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