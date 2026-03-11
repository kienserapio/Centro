export type IncidentStatus = "resolved" | "escalated" | "pending";

export interface Incident {
  id: string;
  date: string;
  time: string;
  category: string;
  reporter: string;
  guardInitials: string;
  guardName: string;
  guardColor: string;
  summary: string;
  status: IncidentStatus;
}
