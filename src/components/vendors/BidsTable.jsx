import { useEffect, useState, useMemo } from "react";
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
import { getTenderBids } from "../../services/tenderService";

export default function VendorTable({ tenderId, onSelectVendor }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchBids = async () => {
    if (!tenderId) {
      setBids([]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await getTenderBids(tenderId);
      // التعامل مع الرد سواء كان array مباشرة أو بداخل res.data
      const rawData = Array.isArray(res) ? res : res?.data || [];
      setBids(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      console.error("Failed to fetch tender bids:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load tender bids.",
      );
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, [tenderId]);

  // استخراج اسم الشركة بشكل أمني بناءً على الرد الحقيقي للـ API
  const getOrgName = (bid) => {
    if (!bid) return "N/A";
    const org = bid.executor_org_id || bid.executor_org || bid.organization;
    if (typeof org === "object" && org !== null) {
      return org.org_name || org.name || org.organization_name || "N/A";
    }
    if (typeof org === "string") return org;
    return bid.executor_org_name || bid.organization_name || "N/A";
  };

  const filteredBids = useMemo(() => {
    if (!search.trim()) return bids;
    const query = search.toLowerCase().trim();

    return bids.filter((bid) => {
      const orgName = getOrgName(bid);
      const value = String(bid?.offered_value || "");
      const status = String(bid?.status || "");

      return (
        orgName.toLowerCase().includes(query) ||
        value.toLowerCase().includes(query) ||
        status.toLowerCase().includes(query)
      );
    });
  }, [bids, search]);

  const getStatusClass = (value) => {
    if (!value) return "bid-status-neutral";
    const status = String(value).toUpperCase();

    if (status === "ACCEPTED" || status === "APPROVED") {
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

  const getStatusIcon = (value) => {
    if (!value) return null;
    const status = String(value).toUpperCase();

    if (status === "ACCEPTED" || status === "APPROVED") {
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

  // تصحيح دالة تنسيق التاريخ لطباعته بالشكل العالمي المستقر YYYY-MM-DD
  const formatDate = (val) => {
    if (!val) return "—";
    const date = new Date(val);
    if (Number.isNaN(date.getTime())) return val;
    return date.toISOString().split("T")[0]; // يرجع التاريخ بتنسيق 2026-08-15
  };

  if (!tenderId) {
    return (
      <div className="vendor-empty-state">
        <div className="empty-icon">
          <FileText size={28} />
        </div>
        <h3>Select a Tender</h3>
        <p>
          Select a tender to view the bids submitted by participating
          organizations.
        </p>
      </div>
    );
  }

  return (
    <div className="vendor-section">
      <div className="vendor-section-header">
        <div>
          <div className="section-title-row">
            <div className="section-icon">
              <FileText size={20} />
            </div>
            <div>
              <h2>Tender Bids</h2>
              <p>Real bids submitted for this tender</p>
            </div>
          </div>
        </div>

        <div className="bid-count-card">
          <span className="bid-count-label">Total Bids</span>
          <strong>{bids.length}</strong>
        </div>
      </div>

      <div className="vendor-toolbar">
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search bids..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button
          type="button"
          className="refresh-bids-btn"
          onClick={fetchBids}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="vendor-error-state">
          <AlertCircle size={20} />
          <div>
            <strong>Unable to load bids</strong>
            <p>{error}</p>
          </div>
          <button type="button" onClick={fetchBids}>
            Try Again
          </button>
        </div>
      )}

      {loading && (
        <div className="vendor-loading-state">
          <div className="loading-spinner" />
          <h3>Loading tender bids...</h3>
          <p>Fetching the latest bids from the server.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="vendor-table-container">
          {filteredBids.length > 0 ? (
            <table className="vendor-table">
              <thead>
                <tr>
                  <th className="row-number-header">#</th>
                  <th>Executor Organization</th>
                  <th>Offered Value</th>
                  <th>Currency</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBids.map((bid, index) => {
                  const bidId = bid?._id || bid?.id || index;
                  return (
                    <tr key={bidId}>
                      <td className="row-number">{index + 1}</td>
                      <td>
                        <strong className="vendor-org-name">
                          {getOrgName(bid)}
                        </strong>
                      </td>
                      <td>
                        {bid?.offered_value !== undefined &&
                        bid?.offered_value !== null
                          ? new Intl.NumberFormat().format(bid.offered_value)
                          : "—"}
                      </td>
                      <td>{bid?.currency || "USD"}</td>
                      <td>
                        <span
                          className={`bid-status ${getStatusClass(bid?.status)}`}
                        >
                          {getStatusIcon(bid?.status)}
                          {bid?.status || "SUBMITTED"}
                        </span>
                      </td>
                      <td>{formatDate(bid?.submitted_at || bid?.createdAt)}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn-inspect"
                          onClick={() => onSelectVendor?.(bid)}
                        >
                          <Eye size={15} />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="vendor-empty-state table-empty">
              <div className="empty-icon">
                <FileText size={28} />
              </div>
              <h3>{search ? "No matching bids" : "No bids submitted"}</h3>
              <p>
                {search
                  ? "Try another search term."
                  : "There are currently no bids submitted for this tender."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
