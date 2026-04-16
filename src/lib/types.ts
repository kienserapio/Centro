// ---------------------------------------------------------------------------
// User & Auth
// ---------------------------------------------------------------------------

export type UserRole = "resident" | "admin" | "guard";

export interface UserProfile {
  id: string;
  fullName: string;
  role: UserRole;
  unitNumber: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Dues
// ---------------------------------------------------------------------------

export const DUE_BILLING_FEATURE_OPTIONS = [
  { value: "facilities", label: "Facilities" },
  { value: "rentable_items", label: "Rentable Items" },
  { value: "parks", label: "Parks" },
  { value: "clubhouse", label: "Clubhouse" },
  { value: "guest_parking", label: "Guest Parking" },
] as const;

export type DueBillingFeature = (typeof DUE_BILLING_FEATURE_OPTIONS)[number]["value"];

export interface Due {
  id: string;
  residentId: string;
  amount: number;
  dueDate: string;
  billingFeatures: DueBillingFeature[];
  subdivisionRevenueShare: number;
  paidAt: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

export interface Announcement {
  id: string;
  adminId: string;
  title: string;
  body: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Emergency Alerts
// ---------------------------------------------------------------------------

export type AlertCategory = "fire" | "intrusion" | "medical" | "other";

export interface EmergencyAlert {
  id: string;
  guardId: string;
  category: AlertCategory;
  message: string | null;
  resolvedAt: string | null;
  createdAt: string;
}
