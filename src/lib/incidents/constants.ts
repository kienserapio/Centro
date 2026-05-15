/**
 * ┌──────────────────────────────────────────────────────────┐
 * │  INCIDENT CONSTANTS                                      │
 * │  Central mapping between UI labels and DB enum values.   │
 * │  Used by: ReportIncidentModal, IncidentTable, API routes │
 * └──────────────────────────────────────────────────────────┘
 */

import type { IncidentType, IncidentStatus } from "./types";

// ---------------------------------------------------------------------------
// Incident Type: UI label ↔ DB enum mapping
// ---------------------------------------------------------------------------

export interface IncidentTypeOption {
  uiLabel: string;
  dbValue: IncidentType;
}

export const INCIDENT_TYPE_OPTIONS: IncidentTypeOption[] = [
  { uiLabel: "Noise Complaint", dbValue: "suspicious" },
  { uiLabel: "Unauthorized Entry", dbValue: "intrusion" },
  { uiLabel: "Suspicious Activity", dbValue: "suspicious" },
  { uiLabel: "Medical Emergency", dbValue: "medical" },
  { uiLabel: "Fire", dbValue: "fire" },
  { uiLabel: "Theft / Vandalism", dbValue: "intrusion" },
  { uiLabel: "Other", dbValue: "other" },
] as const;

/** Map a UI label → DB enum value. Falls back to 'other'. */
export function uiLabelToDbValue(label: string): IncidentType {
  const match = INCIDENT_TYPE_OPTIONS.find((o) => o.uiLabel === label);
  return match?.dbValue ?? "other";
}

/** Map a DB enum value → first matching UI label. Falls back to "Other". */
export function dbValueToUiLabel(dbValue: IncidentType): string {
  const match = INCIDENT_TYPE_OPTIONS.find((o) => o.dbValue === dbValue);
  return match?.uiLabel ?? "Other";
}

// ---------------------------------------------------------------------------
// Status: display configuration
// ---------------------------------------------------------------------------

export interface StatusConfig {
  uiLabel: string;
  dot: string;
  text: string;
}

/**
 * Maps every DB status to its UI display config.
 *   open → "Pending" (amber)
 *   responding → "Acknowledged" (blue)
 *   resolved → "Resolved" (green)
 *   escalated → "Escalated" (rose/red)
 *   unresolved → "Not Resolved" (orange)
 *   false_alarm → "False Incident" (slate)
 */
export const STATUS_CONFIG: Record<IncidentStatus, StatusConfig> = {
  open:        { uiLabel: "Pending",        dot: "bg-amber-500",  text: "text-amber-600" },
  responding:  { uiLabel: "Acknowledged",   dot: "bg-blue-500",   text: "text-blue-600" },
  resolved:    { uiLabel: "Resolved",       dot: "bg-green-500",  text: "text-green-600" },
  escalated:   { uiLabel: "Escalated",      dot: "bg-rose-500",   text: "text-rose-600" },
  unresolved:  { uiLabel: "Not Resolved",   dot: "bg-orange-500", text: "text-orange-600" },
  false_alarm: { uiLabel: "False Incident", dot: "bg-slate-400",  text: "text-slate-500" },
};

/** UI-friendly filter status — each maps to one or more DB statuses. */
export type FilterStatus =
  | "all"
  | "open"
  | "responding"
  | "resolved"
  | "escalated"
  | "unresolved"
  | "false_alarm";

/** Returns the FilterStatus bucket for a given DB status (identity mapping). */
export function dbStatusToFilterStatus(status: IncidentStatus): FilterStatus {
  return status as FilterStatus;
}

// Category labels used in the report form dropdown
export const CATEGORY_LABELS = INCIDENT_TYPE_OPTIONS.map((o) => o.uiLabel);

// Valid DB incident types for validation
export const VALID_INCIDENT_TYPES: IncidentType[] = [
  "medical",
  "fire",
  "intrusion",
  "suspicious",
  "other",
];

// Valid DB statuses for validation
export const VALID_STATUSES: IncidentStatus[] = [
  "open",
  "responding",
  "resolved",
  "false_alarm",
  "escalated",
  "unresolved",
];

// ---------------------------------------------------------------------------
// Duration formatting helper
// ---------------------------------------------------------------------------

/** Formats a duration in ms to "Xm Ys" or "Xh Ym Zs". */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
