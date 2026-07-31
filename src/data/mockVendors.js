// src/data/mockVendors.js

export const mockVendors = [
  {
    id: "v-101",
    companyName: "Tech Solutions Software Co.",
    crNumber: "1010982341", // Commercial Registration Number
    taxNumber: "300981273900003",
    email: "info@techsolutions.com",
    phone: "+966501234567",
    status: "pending", // pending, approved, rejected, suspended
    registrationDate: "2026-07-20",
    ipAddress: "192.168.1.45",
    riskScore: "Low", // Low, High
    documents: [
      { id: "doc-1", name: "Commercial_Registration.pdf", type: "CR", status: "valid" },
      { id: "doc-2", name: "VAT_Certificate.pdf", type: "TAX", status: "valid" },
      { id: "doc-3", name: "Authorized_ID.pdf", type: "ID", status: "valid" }
    ],
    activityLogs: [
      { id: "log-1", action: "Vendor Account Created", timestamp: "2026-07-20 10:15", ip: "192.168.1.45" },
      { id: "log-2", action: "Official Documents Uploaded", timestamp: "2026-07-20 10:30", ip: "192.168.1.45" },
      { id: "log-3", action: "Downloaded RFP for Tender #402", timestamp: "2026-07-22 14:00", ip: "192.168.1.45" }
    ]
  },
  {
    id: "v-102",
    companyName: "Al-Ofoq Contracting Establishment",
    crNumber: "1010456789",
    taxNumber: "310123456700003",
    email: "contact@alofoq.com",
    phone: "+966509876543",
    status: "approved",
    registrationDate: "2026-06-15",
    ipAddress: "185.12.33.10",
    riskScore: "High", // Security Alert
    documents: [
      { id: "doc-4", name: "Commercial_Registration.pdf", type: "CR", status: "valid" },
      { id: "doc-5", name: "Tax_Certificate.pdf", type: "TAX", status: "expired" }
    ],
    activityLogs: [
      { id: "log-4", action: "Submitted Bid for Tender #402", timestamp: "2026-07-25 09:20", ip: "185.12.33.10" }
    ]
  }
];