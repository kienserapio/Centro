"use client";

import { useState, useMemo } from "react";
import type { Incident, IncidentStatus } from "./types";

export type { Incident, IncidentStatus };

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "1", date: "Oct 24, 2023", time: "08:30 AM",
    category: "Noise Complaint", reporter: "Unit 402 — J. Doe",
    guardInitials: "GR", guardName: "Guard Ramos", guardColor: "bg-primary/20 text-primary",
    summary: "Warning issued to guests in unit 402 for loud music after hours. Quiet resumed.",
    status: "resolved",
  },
  {
    id: "2", date: "Oct 23, 2023", time: "11:45 PM",
    category: "Unauthorized Entry", reporter: "System Alert",
    guardInitials: "LC", guardName: "Guard Chen", guardColor: "bg-blue-100 text-blue-600",
    summary: "Suspect fled via North Gate after tailgating resident vehicle. Police notified.",
    status: "escalated",
  },
  {
    id: "3", date: "Oct 23, 2023", time: "02:15 PM",
    category: "Maintenance", reporter: "Unit 105 — A. Smith",
    guardInitials: "GR", guardName: "Guard Ramos", guardColor: "bg-primary/20 text-primary",
    summary: "Leaking pipe reported in parking level 1. Facilities team arrived on site.",
    status: "resolved",
  },
  {
    id: "4", date: "Oct 22, 2023", time: "09:00 PM",
    category: "Suspicious Activity", reporter: "Unit 312 — K. Lee",
    guardInitials: "LC", guardName: "Guard Chen", guardColor: "bg-blue-100 text-blue-600",
    summary: "Individual loitering near south fence. Asked to leave property. Area secured.",
    status: "resolved",
  },
  {
    id: "5", date: "Oct 22, 2023", time: "04:30 PM",
    category: "Medical Emergency", reporter: "Lobby — Front Desk",
    guardInitials: "GR", guardName: "Guard Ramos", guardColor: "bg-primary/20 text-primary",
    summary: "Resident fainted in lobby. EMS called and arrived in 8 mins. Transported to hospital.",
    status: "resolved",
  },
  {
    id: "6", date: "Oct 21, 2023", time: "07:10 AM",
    category: "Unauthorized Entry", reporter: "Gate B Camera",
    guardInitials: "LC", guardName: "Guard Chen", guardColor: "bg-blue-100 text-blue-600",
    summary: "Unknown vehicle attempted forced entry at Gate B. Barrier held. Report filed.",
    status: "pending",
  },
  {
    id: "7", date: "Oct 20, 2023", time: "10:55 PM",
    category: "Noise Complaint", reporter: "Unit 218 — R. Santos",
    guardInitials: "GR", guardName: "Guard Ramos", guardColor: "bg-primary/20 text-primary",
    summary: "Party at unit 218 dispersed after verbal warning. No further disturbance.",
    status: "resolved",
  },
];

const STATUS_CONFIG: Record<IncidentStatus, { dot: string; text: string; label: string }> = {
  resolved: { dot: "bg-green-500", text: "text-green-600", label: "Resolved" },
  escalated: { dot: "bg-rose-500", text: "text-rose-600", label: "Escalated" },
  pending: { dot: "bg-amber-500", text: "text-amber-600", label: "Pending" },
};

const PAGE_SIZE = 5;

type FilterStatus = "all" | IncidentStatus;

interface Props {
  search: string;
  newIncident?: Incident | null;
}

export function IncidentTable({ search, newIncident }: Props) {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [page, setPage] = useState(1);

  const allIncidents = useMemo(
    () => (newIncident ? [newIncident, ...INITIAL_INCIDENTS] : INITIAL_INCIDENTS),
    [newIncident]
  );

  const filtered = useMemo(() => {
    let result = allIncidents;
    if (statusFilter !== "all") result = result.filter((i) => i.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.category.toLowerCase().includes(q) ||
          i.reporter.toLowerCase().includes(q) ||
          i.guardName.toLowerCase().includes(q) ||
          i.summary.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allIncidents, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const FILTERS: { label: string; value: FilterStatus }[] = [
    { label: "All Logs", value: "all" },
    { label: "Resolved", value: "resolved" },
    { label: "Escalated", value: "escalated" },
    { label: "Pending", value: "pending" },
  ];

  function handleFilter(f: FilterStatus) {
    setStatusFilter(f);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              statusFilter === f.value
                ? "bg-primary text-white"
                : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-primary/40 hover:text-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
                {["Date / Time", "Category", "Reporting Resident", "Responding Guard", "Resolution Summary", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#6B7280]">
                    No incidents match your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((incident) => {
                  const cfg = STATUS_CONFIG[incident.status];
                  return (
                    <tr
                      key={incident.id}
                      className="hover:bg-[#F8F9FA] transition-colors"
                    >
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-[#111827]">{incident.date}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{incident.time}</p>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-xs font-bold text-[#374151]">
                          {incident.category}
                        </span>
                      </td>

                      {/* Reporter */}
                      <td className="px-6 py-4 text-sm text-[#374151] whitespace-nowrap">
                        {incident.reporter}
                      </td>

                      {/* Guard */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${incident.guardColor}`}
                          >
                            {incident.guardInitials}
                          </div>
                          <span className="text-sm text-[#374151]">{incident.guardName}</span>
                        </div>
                      </td>

                      {/* Summary */}
                      <td className="px-6 py-4 text-sm text-[#6B7280] max-w-xs">
                        <p className="truncate">{incident.summary}</p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className={`text-xs font-bold uppercase ${cfg.text}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-[#E5E7EB] bg-[#F8F9FA]">
          <p className="text-xs text-[#6B7280] font-medium">
            Showing{" "}
            <span className="text-[#111827] font-bold">
              {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(safePage * PAGE_SIZE, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="text-[#111827] font-bold">{filtered.length}</span> incidents
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={safePage === 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#E5E7EB] text-[#6B7280] disabled:opacity-40 hover:border-primary/40 transition-colors"
            >
              <span className="material-icons-round text-base">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-colors ${
                  n === safePage
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-[#E5E7EB] text-[#374151] hover:border-primary/40"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#E5E7EB] text-[#6B7280] disabled:opacity-40 hover:border-primary/40 transition-colors"
            >
              <span className="material-icons-round text-base">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
