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

export interface Due {
  id: string;
  residentId: string;
  amount: number;
  dueDate: string;
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
