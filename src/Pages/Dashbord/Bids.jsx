import { useEffect, useState } from "react";
import {
  ChevronDown,
  FileText,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../../components/SideBar";
import VendorTable from "../../components/vendors/BidsTable";
import VendorDetails from "../../components/vendors/VendorDetails";

import {
  getAllTenders,
  getTenderBids,
} from "../../services/tenderService";

import "../../components/vendors/style/Bids.css";

export default function VendorsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [tenders, setTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [loadingTenders, setLoadingTenders] = useState(false);
  const [tenderError, setTenderError] = useState("");

  const [selectedVendor, setSelectedVendor] = useState(null);

  const loadTenders = async () => {
    try {
      setLoadingTenders(true);
      setTenderError("");

      const res = await getAllTenders();
      const normalizedTenders = Array.isArray(res) ? res : res?.data || [];
      setTenders(normalizedTenders);

      // البحث عن أول مناقصة تحتوي على عروض حقيقية
      let tenderWithBids = null;
      for (const tender of normalizedTenders) {
        const tId = tender?._id || tender?.id || tender?.tender_id;
        if (tId) {
          try {
            const bidsRes = await getTenderBids(tId);
            const bids = Array.isArray(bidsRes) ? bidsRes : bidsRes?.data || [];
            if (Array.isArray(bids) && bids.length > 0) {
              tenderWithBids = tender;
              break;
            }
          } catch (e) {
            console.error(`Error checking bids for tender ${tId}:`, e);
          }
        }
      }

      if (tenderWithBids) {
        setSelectedTender(tenderWithBids);
      } else if (normalizedTenders.length > 0) {
        setSelectedTender(normalizedTenders[0]);
      } else {
        setSelectedTender(null);
      }
    } catch (error) {
      console.error("Failed to load tenders:", error);
      setTenderError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load tenders."
      );
      setTenders([]);
      setSelectedTender(null);
    } finally {
      setLoadingTenders(false);
    }
  };

  useEffect(() => {
    loadTenders();
  }, []);

  const selectedTenderId =
    selectedTender?._id ||
    selectedTender?.id ||
    selectedTender?.tender_id ||
    null;

  const selectedTenderTitle =
    selectedTender?.title ||
    selectedTender?.name ||
    selectedTender?.tender_title ||
    "Selected Tender";

  const handleTenderChange = (event) => {
    const tenderId = event.target.value;
    const tender = tenders.find(
      (item) =>
        String(item?._id || item?.id || item?.tender_id) === String(tenderId)
    );
    setSelectedTender(tender || null);
    setSelectedVendor(null);
  };

  const getTenderLabel = (tender) => {
    if (!tender) return "Unnamed Tender";
    return (
      tender.title ||
      tender.name ||
      tender.tender_title ||
      tender.reference_number ||
      tender.tender_number ||
      tender._id ||
      "Unnamed Tender"
    );
  };

  const tenderReference =
    selectedTender?.reference_number ||
    selectedTender?.tender_number ||
    selectedTender?.code ||
    selectedTender?._id ||
    "";

  const tenderStatus = selectedTender?.status || selectedTender?.state || "";

  return (
    <div className={`users_page ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div className="main-content-wrapper">
        <div className="Page-hero">
          <div className="hero-content">
            <h1>Vendors Management</h1>
            <p>Monitor and review bids submitted by vendors for your tenders.</p>
          </div>
        </div>

        <div className="tender-selector-card">
          <div className="tender-selector-left">
            <div className="tender-selector-icon">
              <FileText size={21} />
            </div>
            <div>
              <div className="tender-selector-label">Select Tender</div>
              <div className="tender-selector-description">
                Choose a tender to view its submitted bids.
              </div>
            </div>
          </div>

          <div className="tender-selector-control">
            <div className="tender-select-wrapper">
              <select
                value={selectedTenderId || ""}
                onChange={handleTenderChange}
                disabled={loadingTenders || tenders.length === 0}
              >
                <option value="">
                  {loadingTenders
                    ? "Loading tenders..."
                    : tenders.length === 0
                    ? "No tenders available"
                    : "Select a tender"}
                </option>
                {tenders.map((tender) => {
                  const id = tender?._id || tender?.id || tender?.tender_id;
                  if (!id) return null;
                  return (
                    <option key={id} value={id}>
                      {getTenderLabel(tender)}
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={17} />
            </div>

            <button
              type="button"
              className="refresh-tenders-btn"
              onClick={loadTenders}
              disabled={loadingTenders}
            >
              <RefreshCw
                size={16}
                className={loadingTenders ? "spin" : ""}
              />
              {loadingTenders ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {tenderError && (
          <div className="tender-error">
            <AlertCircle size={19} />
            <div>
              <strong>Unable to load tenders</strong>
              <p>{tenderError}</p>
            </div>
            <button type="button" onClick={loadTenders}>
              Try Again
            </button>
          </div>
        )}

        {selectedTender && (
          <div className="selected-tender-card">
            <div className="selected-tender-main">
              <div className="selected-tender-icon">
                <FileText size={20} />
              </div>
              <div>
                <span>Selected Tender</span>
                <h2>{selectedTenderTitle}</h2>
                {tenderReference && (
                  <p>
                    Reference: <strong>{tenderReference}</strong>
                  </p>
                )}
              </div>
            </div>

            {tenderStatus && (
              <div className="selected-tender-status">{tenderStatus}</div>
            )}
          </div>
        )}

        {selectedTenderId ? (
          <VendorTable
            tenderId={selectedTenderId}
            onSelectVendor={(bid) => setSelectedVendor(bid)}
          />
        ) : !loadingTenders ? (
          <div className="vendor-page-empty">
            <div className="vendor-page-empty-icon">
              <FileText size={28} />
            </div>
            <h3>Select a Tender</h3>
            <p>Select a tender above to load the bids submitted by vendors.</p>
          </div>
        ) : null}

        {selectedVendor && (
          <VendorDetails
            vendor={selectedVendor}
            onClose={() => setSelectedVendor(null)}
          />
        )}
      </div>
    </div>
  );
}