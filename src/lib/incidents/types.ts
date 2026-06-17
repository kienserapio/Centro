/**
 * ┌──────────────────────────────────────────────────────────┐
 * │  INCIDENT TYPES                                          │
 * │  TypeScript types mirroring the emergency_alerts table.  │
 * └──────────────────────────────────────────────────────────┘
 */

// DB enum: incident_type IN ('medical', 'fire', 'intrusion', 'suspicious', 'other')
export type IncidentType = "medical" | "fire" | "intrusion" | "suspicious" | "other";

// DB enum: incident_status_enum
export type IncidentStatus = "open" | "responding" | "resolved" | "false_alarm" | "escalated" | "unresolved";

/**
 * Matches the `emergency_alerts` table schema exactly.
 * See /src/docs/BACKEND.md § emergency_alerts.
 */
export interface EmergencyAlert {
  id: string;
  reporter_id: string;
  unit_id: string;
  incident_type: IncidentType;
  description: string | null;
  location_note: string | null;
  latitude: number | null;
  longitude: number | null;
  status: IncidentStatus;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  resolution_note: string | null;
  created_at: string;
}

/**
 * Extended shape returned by the GET API with JOINed profile/unit data.
 * Used for display in IncidentTable.
 */
export interface EmergencyAlertWithDetails extends EmergencyAlert {
  reporter_name: string;
  reporter_unit_label: string; // e.g. "Block 3, Lot 12"
  acknowledged_by_name: string | null;
}
