import {
  useEffect,
  useState,
} from "react";

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
} from "../../services/tenderService";

import "../../components/vendors/style/Bids.css";

export default function VendorsPage() {
  const [
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  ] = useState(false);

  const [
    tenders,
    setTenders,
  ] = useState([]);

  /*
   * null = All Tenders
   */

  const [
    selectedTender,
    setSelectedTender,
  ] = useState(null);

  const [
    loadingTenders,
    setLoadingTenders,
  ] = useState(false);

  const [
    tenderError,
    setTenderError,
  ] = useState("");

  /*
   * هذا هو العرض الذي سيتم فتح تفاصيله
   */
  const [
    selectedVendor,
    setSelectedVendor,
  ] = useState(null);

  /* =========================================================
     Load Tenders
  ========================================================= */

  const loadTenders = async () => {
    try {
      setLoadingTenders(true);
      setTenderError("");

      const res =
        await getAllTenders();

      const normalizedTenders =
        Array.isArray(res)
          ? res
          : res?.data || [];

      setTenders(
        normalizedTenders
      );

      /*
       * null = All Tenders
       */

      setSelectedTender(null);

      setSelectedVendor(null);
    } catch (error) {
      console.error(
        "Failed to load tenders:",
        error
      );

      setTenderError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load tenders."
      );

      setTenders([]);
      setSelectedTender(null);
      setSelectedVendor(null);
    } finally {
      setLoadingTenders(false);
    }
  };

  /* =========================================================
     Initial Load
  ========================================================= */

  useEffect(() => {
    loadTenders();
  }, []);

  /* =========================================================
     Selected Tender ID
  ========================================================= */

  const selectedTenderId =
    selectedTender?._id ||
    selectedTender?.id ||
    selectedTender?.tender_id ||
    null;

  /* =========================================================
     Tender Title
  ========================================================= */

  const selectedTenderTitle =
    selectedTender?.title ||
    selectedTender?.name ||
    selectedTender?.tender_title ||
    "Selected Tender";

  /* =========================================================
     Tender Change
  ========================================================= */

  const handleTenderChange = (
    event
  ) => {
    const tenderId =
      event.target.value;

    /*
     * All Tenders
     */

    if (
      !tenderId ||
      tenderId === "all"
    ) {
      setSelectedTender(null);
      setSelectedVendor(null);

      return;
    }

    const tender =
      tenders.find(
        (item) =>
          String(
            item?._id ||
              item?.id ||
              item?.tender_id
          ) ===
          String(tenderId)
      );

    setSelectedTender(
      tender || null
    );

    /*
     * Close details when
     * changing tender.
     */

    setSelectedVendor(null);
  };

  /* =========================================================
     Tender Label
  ========================================================= */

  const getTenderLabel = (
    tender
  ) => {
    if (!tender) {
      return "Unnamed Tender";
    }

    return (
      tender.title ||
      tender.name ||
      tender.tender_title ||
      tender.reference_number ||
      tender.tender_number ||
      tender.code ||
      tender._id ||
      "Unnamed Tender"
    );
  };

  /* =========================================================
     Tender Reference
  ========================================================= */

  const tenderReference =
    selectedTender?.reference_number ||
    selectedTender?.tender_number ||
    selectedTender?.code ||
    selectedTender?._id ||
    "";

  /* =========================================================
     Tender Status
  ========================================================= */

  const tenderStatus =
    selectedTender?.status ||
    selectedTender?.state ||
    "";

  /* =========================================================
     Render
  ========================================================= */

  return (
    <div
      className={`users_page ${
        isSidebarCollapsed
          ? "sidebar-collapsed"
          : ""
      }`}
    >
      {/* =====================================================
          Sidebar
      ===================================================== */}

      <Sidebar
        isCollapsed={
          isSidebarCollapsed
        }
        setIsCollapsed={
          setIsSidebarCollapsed
        }
      />

      <div className="main-content-wrapper">

        {/* ===================================================
            Page Hero
        =================================================== */}

        <div className="Page-hero">
          <div className="hero-content">
            <h1>
              Vendors Management
            </h1>

            <p>
              Monitor and review bids
              submitted by vendors for
              your tenders.
            </p>
          </div>
        </div>

        {/* ===================================================
            Tender Selector
        =================================================== */}

        <div className="tender-selector-card">
          <div className="tender-selector-left">

            <div className="tender-selector-icon">
              <FileText size={21} />
            </div>

            <div>
              <div className="tender-selector-label">
                Select Tender
              </div>

              <div className="tender-selector-description">
                Choose a tender to filter
                the submitted bids.
              </div>
            </div>

          </div>

          <div className="tender-selector-control">

            <div className="tender-select-wrapper">
              <select
                value={
                  selectedTenderId ||
                  "all"
                }
                onChange={
                  handleTenderChange
                }
                disabled={
                  loadingTenders ||
                  tenders.length === 0
                }
              >
                <option value="all">
                  All Tenders
                </option>

                {tenders.map(
                  (tender) => {
                    const id =
                      tender?._id ||
                      tender?.id ||
                      tender?.tender_id;

                    if (!id) {
                      return null;
                    }

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {getTenderLabel(
                          tender
                        )}
                      </option>
                    );
                  }
                )}
              </select>

              <ChevronDown
                size={17}
              />
            </div>

            <button
              type="button"
              className="refresh-tenders-btn"
              onClick={
                loadTenders
              }
              disabled={
                loadingTenders
              }
            >
              <RefreshCw
                size={16}
                className={
                  loadingTenders
                    ? "spin"
                    : ""
                }
              />

              {loadingTenders
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>
        </div>

        {/* ===================================================
            Tender Error
        =================================================== */}

        {tenderError && (
          <div className="tender-error">
            <AlertCircle
              size={19}
            />

            <div>
              <strong>
                Unable to load tenders
              </strong>

              <p>
                {tenderError}
              </p>
            </div>

            <button
              type="button"
              onClick={
                loadTenders
              }
            >
              Try Again
            </button>
          </div>
        )}

        {/* ===================================================
            Selected Tender Card
        =================================================== */}

        {selectedTender && (
          <div className="selected-tender-card">

            <div className="selected-tender-main">

              <div className="selected-tender-icon">
                <FileText
                  size={20}
                />
              </div>

              <div>
                <span>
                  Selected Tender
                </span>

                <h2>
                  {selectedTenderTitle}
                </h2>

                {tenderReference && (
                  <p>
                    Reference:{" "}
                    <strong>
                      {tenderReference}
                    </strong>
                  </p>
                )}
              </div>

            </div>

            {tenderStatus && (
              <div className="selected-tender-status">
                {tenderStatus}
              </div>
            )}

          </div>
        )}

        {/* ===================================================
            BIDS TABLE
        =================================================== */}

        {!loadingTenders && (
          <VendorTable
            tenderId={
              selectedTenderId
            }

            onSelectVendor={(
              bid
            ) => {
              /*
               * مهم جداً:
               * نخزن الـ bid كامل.
               *
               * لذلك VendorDetails
               * سيحصل على كل البيانات
               * الموجودة بالـ API.
               */

              console.log(
                "=========================================="
              );

              console.log(
                "SELECTED BID FROM TABLE:"
              );

              console.log(
                bid
              );

              console.log(
                "=========================================="
              );

              setSelectedVendor(
                bid
              );
            }}
          />
        )}

        {/* ===================================================
            Vendor Details
        =================================================== */}

        {selectedVendor && (
          <VendorDetails
            vendor={
              selectedVendor
            }
            onClose={() =>
              setSelectedVendor(
                null
              )
            }
          />
        )}

      </div>
    </div>
  );
}