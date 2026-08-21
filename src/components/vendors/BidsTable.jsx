import { useEffect, useMemo, useState } from "react";

import {
  Search,
  RefreshCw,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import "./style/Bids.css";

import { getAllBids } from "../../services/tenderService";

export default function VendorTable({
  tenderId = null,
  onSelectVendor,
}) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  /* =========================================================
     Normalize ID
  ========================================================= */

  const normalizeId = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "object" && value !== null) {
      return String(
        value?._id ||
          value?.id ||
          value?.tender_id ||
          value?.code ||
          ""
      );
    }

    return String(value);
  };

  /* =========================================================
     Get ALL Bids
  ========================================================= */

  const fetchBids = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getAllBids();

      console.log("==========================================");
      console.log("ALL BIDS RECEIVED IN VENDOR TABLE:");
      console.log(res);
      console.log(
        "TOTAL BIDS:",
        Array.isArray(res) ? res.length : 0
      );
      console.log("==========================================");

      setBids(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to fetch all bids:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load bids."
      );

      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     Initial Load
  ========================================================= */

  useEffect(() => {
    fetchBids();
  }, []);

  /* =========================================================
     Tender ID Helper
  ========================================================= */

  const getTenderId = (bid) => {
    if (!bid) {
      return "";
    }

    const tender =
      bid.tender_id ||
      bid.tenderId ||
      bid.tender;

    return normalizeId(tender);
  };

  /* =========================================================
     Organization Name Helper
  ========================================================= */

  const getOrgName = (bid) => {
    if (!bid) {
      return "N/A";
    }

    const org =
      bid.executor_org_id ||
      bid.executor_org ||
      bid.organization ||
      bid.organization_id;

    if (
      typeof org === "object" &&
      org !== null
    ) {
      return (
        org.org_name ||
        org.name ||
        org.organization_name ||
        org.title ||
        "N/A"
      );
    }

    if (typeof org === "string") {
      return org;
    }

    return (
      bid.executor_org_name ||
      bid.organization_name ||
      bid.org_name ||
      "N/A"
    );
  };

  /* =========================================================
     Offered Value Helper
  ========================================================= */

  const getOfferedValue = (bid) => {
    if (!bid) {
      return null;
    }

    return (
      bid.offered_value ??
      bid.offeredValue ??
      bid.bid_value ??
      bid.amount ??
      bid.value ??
      null
    );
  };

  /* =========================================================
     Currency Helper
  ========================================================= */

  const getCurrency = (bid) => {
    if (!bid) {
      return "USD";
    }

    return (
      bid.currency ||
      bid.offered_currency ||
      bid.bid_currency ||
      "USD"
    );
  };

  /* =========================================================
     Status Helper
  ========================================================= */

  const getStatus = (bid) => {
    if (!bid) {
      return "SUBMITTED";
    }

    return (
      bid.status ||
      bid.bid_status ||
      "SUBMITTED"
    );
  };

  /* =========================================================
     Submitted Date Helper
  ========================================================= */

  const getSubmittedDate = (bid) => {
    if (!bid) {
      return null;
    }

    return (
      bid.submitted_at ||
      bid.submittedAt ||
      bid.createdAt ||
      bid.created_at ||
      null
    );
  };

  /* =========================================================
     FILTER BY SELECTED TENDER
  ========================================================= */

  const tenderFilteredBids = useMemo(() => {
    if (!tenderId) {
      return bids;
    }

    const selectedId = normalizeId(tenderId);

    return bids.filter((bid) => {
      const bidTenderId = getTenderId(bid);

      return bidTenderId === selectedId;
    });
  }, [bids, tenderId]);

  /* =========================================================
     Search / Filter
  ========================================================= */

  const filteredBids = useMemo(() => {
    if (!search.trim()) {
      return tenderFilteredBids;
    }

    const query = search
      .toLowerCase()
      .trim();

    return tenderFilteredBids.filter((bid) => {
      const orgName = String(
        getOrgName(bid)
      );

      const tenderIdValue = String(
        getTenderId(bid)
      );

      const value = String(
        getOfferedValue(bid) ?? ""
      );

      const currency = String(
        getCurrency(bid)
      );

      const status = String(
        getStatus(bid)
      );

      return (
        orgName
          .toLowerCase()
          .includes(query) ||
        tenderIdValue
          .toLowerCase()
          .includes(query) ||
        value
          .toLowerCase()
          .includes(query) ||
        currency
          .toLowerCase()
          .includes(query) ||
        status
          .toLowerCase()
          .includes(query)
      );
    });
  }, [
    tenderFilteredBids,
    search,
  ]);

  /* =========================================================
     Status Class
  ========================================================= */

  const getStatusClass = (value) => {
    if (!value) {
      return "bid-status-neutral";
    }

    const status = String(value).toUpperCase();

    if (
      status === "ACCEPTED" ||
      status === "APPROVED"
    ) {
      return "bid-status-success";
    }

    if (
      status === "SUBMITTED" ||
      status === "UNDER_REVIEW" ||
      status === "PENDING"
    ) {
      return "bid-status-warning";
    }

    if (
      status === "REJECTED" ||
      status === "CANCELLED" ||
      status === "WITHDRAWN"
    ) {
      return "bid-status-danger";
    }

    return "bid-status-neutral";
  };

  /* =========================================================
     Status Icon
  ========================================================= */

  const getStatusIcon = (value) => {
    if (!value) {
      return null;
    }

    const status = String(value).toUpperCase();

    if (
      status === "ACCEPTED" ||
      status === "APPROVED"
    ) {
      return <CheckCircle2 size={14} />;
    }

    if (
      status === "SUBMITTED" ||
      status === "UNDER_REVIEW" ||
      status === "PENDING"
    ) {
      return <Clock3 size={14} />;
    }

    if (
      status === "REJECTED" ||
      status === "CANCELLED" ||
      status === "WITHDRAWN"
    ) {
      return <XCircle size={14} />;
    }

    return null;
  };

  /* =========================================================
     Date Formatter
  ========================================================= */

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toISOString().split("T")[0];
  };

  /* =========================================================
     Number Formatter
  ========================================================= */

  const formatNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    return new Intl.NumberFormat(
      "en-US"
    ).format(number);
  };

  /* =========================================================
     Loading State
  ========================================================= */

  if (
    loading &&
    bids.length === 0
  ) {
    return (
      <div className="vendor-section">
        <div className="vendor-section-header">
          <div>
            <div className="section-title-row">
              <div className="section-icon">
                <FileText size={20} />
              </div>

              <div>
                <h2>All Bids</h2>

                <p>
                  All bids submitted across
                  the platform
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="vendor-loading-state">
          <div className="loading-spinner" />

          <h3>
            Loading bids...
          </h3>

          <p>
            Fetching all submitted bids
            from the server.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     Main UI
  ========================================================= */

  return (
    <div className="vendor-section">
      <div className="vendor-section-header">
        <div>
          <div className="section-title-row">
            <div className="section-icon">
              <FileText size={20} />
            </div>

            <div>
              <h2>
                {tenderId
                  ? "Tender Bids"
                  : "All Bids"}
              </h2>

              <p>
                {tenderId
                  ? "Bids submitted for the selected tender."
                  : "All bids submitted across the platform."}
              </p>
            </div>
          </div>
        </div>

        <div className="bid-count-card">
          <span className="bid-count-label">
            {tenderId
              ? "Tender Bids"
              : "Total Bids"}
          </span>

          <strong>
            {filteredBids.length}
          </strong>
        </div>
      </div>

      <div className="vendor-toolbar">
        <div className="search-wrapper">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by tender, organization, value or status..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <button
          type="button"
          className="refresh-bids-btn"
          onClick={fetchBids}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "spin"
                : ""
            }
          />

          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="vendor-error-state">
          <AlertCircle size={20} />

          <div>
            <strong>
              Unable to load bids
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchBids}
          >
            Try Again
          </button>
        </div>
      )}

      {!error && (
        <div className="vendor-table-container">
          {filteredBids.length > 0 ? (
            <table className="vendor-table">
              <thead>
                <tr>
                  <th className="row-number-header">
                    #
                  </th>

                  <th>
                    Tender ID
                  </th>

                  <th>
                    Executor Organization
                  </th>

                  <th>
                    Offered Value
                  </th>

                  <th>
                    Currency
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Submitted At
                  </th>

                  <th className="text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredBids.map(
                  (bid, index) => {
                    const bidId =
                      bid?._id ||
                      bid?.id ||
                      `bid-${index}`;

                    const tenderIdValue =
                      getTenderId(bid);

                    const organizationName =
                      getOrgName(bid);

                    const offeredValue =
                      getOfferedValue(bid);

                    const currency =
                      getCurrency(bid);

                    const status =
                      getStatus(bid);

                    const submittedDate =
                      getSubmittedDate(bid);

                    return (
                      <tr key={bidId}>
                        <td className="row-number">
                          {index + 1}
                        </td>

                        <td>
                          <span className="bid-mono">
                            {tenderIdValue ||
                              "—"}
                          </span>
                        </td>

                        <td>
                          <strong className="vendor-org-name">
                            {organizationName}
                          </strong>
                        </td>

                        <td>
                          {formatNumber(
                            offeredValue
                          )}
                        </td>

                        <td>
                          {currency}
                        </td>

                        <td>
                          <span
                            className={`bid-status ${getStatusClass(
                              status
                            )}`}
                          >
                            {getStatusIcon(
                              status
                            )}

                            {status}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            submittedDate
                          )}
                        </td>

                        <td className="text-center">
                          <button
                            type="button"
                            className="btn-inspect"
                            onClick={() => {
                              console.log(
                                "=========================================="
                              );

                              console.log(
                                "INSPECT BID:"
                              );

                              console.log(
                                bid
                              );

                              console.log(
                                "BID ID:",
                                bid?._id ||
                                  bid?.id
                              );

                              console.log(
                                "TENDER ID:",
                                getTenderId(bid)
                              );

                              console.log(
                                "ORGANIZATION:",
                                getOrgName(bid)
                              );

                              console.log(
                                "=========================================="
                              );

                              /*
                               * مهم جداً:
                               * نرسل كامل الـ bid
                               * وليس فقط الـ ID
                               */
                              onSelectVendor?.(
                                bid
                              );
                            }}
                          >
                            <Eye size={15} />
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          ) : (
            <div className="vendor-empty-state table-empty">
              <div className="empty-icon">
                <FileText size={28} />
              </div>

              <h3>
                {search
                  ? "No matching bids"
                  : tenderId
                  ? "No bids for this tender"
                  : "No bids submitted"}
              </h3>

              <p>
                {search
                  ? "Try another search term."
                  : tenderId
                  ? "There are currently no bids submitted for this tender."
                  : "There are currently no bids submitted across the platform."}
              </p>

              {search && (
                <button
                  type="button"
                  className="refresh-bids-btn"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}