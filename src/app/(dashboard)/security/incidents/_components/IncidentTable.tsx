"use client";

import { useState, useMemo, useEffect } from "react";
import type { EmergencyAlertWithDetails, IncidentStatus } from "@/lib/incidents/types";
import {
  STATUS_CONFIG,
  dbValueToUiLabel,
  type FilterStatus,
  formatDuration,
} from "@/lib/incidents/constants";

export type { EmergencyAlertWithDetails };

const PAGE_SIZE = 5;

interface Props {
  search: string;
  incidents: EmergencyAlertWithDetails[];
  loading?: boolean;
  error?: string | null;
  /** If true, hides action buttons (for admin read-only view). */
  readOnly?: boolean;
  /** Called when a guard clicks "Acknowledge" or "Resolve" on an incident. */
  onAction?: (incident: EmergencyAlertWithDetails) => void;
  /** If true, shows extended detail view with timestamps (for admin). */
  extendedDetail?: boolean;
}

/** Live counting-up timer component. */
function LiveTimer({ from }: { from: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = now - new Date(from).getTime();
  return <span className="font-mono text-xs">{formatDuration(Math.max(0, elapsed))}</span>;
}

/** Renders the response timer column content for an incident. */
function ResponseTimerCell({ incident }: { incident: EmergencyAlertWithDetails }) {
  if (incident.status === "open") {
    return <span className="text-xs text-[#9CA3AF] italic">Not yet acknowledged</span>;
  }
  if (incident.status === "responding" && incident.acknowledged_at) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <LiveTimer from={incident.acknowledged_at} />
      </div>
    );
  }
  // Terminal statuses: show static duration between acknowledged_at and resolved_at
  if (incident.acknowledged_at && incident.resolved_at) {
    const duration = new Date(incident.resolved_at).getTime() - new Date(incident.acknowledged_at).getTime();
    const cfg = STATUS_CONFIG[incident.status];
    return (
      <span className={`text-xs font-medium ${cfg.text}`}>
        {cfg.uiLabel} in {formatDuration(Math.max(0, duration))}
      </span>
    );
  }
  return <span className="text-xs text-[#9CA3AF]">—</span>;
}

export function IncidentTable({ search, incidents, loading, error, readOnly, onAction, extendedDetail }: Props) {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [page, setPage] = useState(1);
  const [selectedIncident, setSelectedIncident] = useState<EmergencyAlertWithDetails | null>(null);

  const filtered = useMemo(() => {
    let result = incidents;

    // Status filter — now 1:1 with DB status
    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          dbValueToUiLabel(i.incident_type).toLowerCase().includes(q) ||
          i.reporter_name.toLowerCase().includes(q) ||
          i.reporter_unit_label.toLowerCase().includes(q) ||
          (i.description ?? "").toLowerCase().includes(q) ||
          (i.acknowledged_by_name ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [incidents, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const FILTERS: { label: string; value: FilterStatus }[] = extendedDetail
    ? [
        { label: "All Logs", value: "all" },
        { label: "Pending", value: "open" },
        { label: "Acknowledged", value: "responding" },
        { label: "Resolved", value: "resolved" },
        { label: "Escalated", value: "escalated" },
        { label: "Not Resolved", value: "unresolved" },
        { label: "False Incident", value: "false_alarm" },
      ]
    : [
        { label: "All Logs", value: "all" },
        { label: "Pending", value: "open" },
        { label: "Acknowledged", value: "responding" },
        { label: "Resolved", value: "resolved" },
        { label: "Escalated", value: "escalated" },
      ];

  function handleFilter(f: FilterStatus) {
    setStatusFilter(f);
    setPage(1);
  }

  function handleSelectIncident(incident: EmergencyAlertWithDetails) {
    setSelectedIncident(incident);
  }

  function clearSelectedIncident() {
    setSelectedIncident(null);
  }

  /** Format a created_at timestamp to date + time strings. */
  function formatDateTime(iso: string) {
    const d = new Date(iso);
    const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return { date, time };
  }

  const printedAt = new Date().toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  /** Can this incident be acted upon (acknowledge / resolve)? */
  function isActionable(status: IncidentStatus): boolean {
    return status === "open" || status === "responding";
  }

  /** Label for the action button. */
  function getActionLabel(status: IncidentStatus): string {
    if (status === "open") return "Acknowledge";
    if (status === "responding") return "Update";
    return "View";
  }

  // Loading / error states
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-[#6B7280]">
          <span className="material-icons-round animate-spin text-xl">refresh</span>
          <span className="text-sm font-medium">Loading incidents…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <span className="material-icons-round text-rose-500 text-3xl">error_outline</span>
        <p className="text-sm text-rose-700 font-medium mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Selected incident detail panel */}
      {selectedIncident && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#E5E7EB] bg-[#F8F9FA]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">
                Report Details
              </p>
              <h3 className="text-base font-bold text-[#111827] mt-1">
                {dbValueToUiLabel(selectedIncident.incident_type)}
              </h3>
            </div>
            <button
              type="button"
              onClick={clearSelectedIncident}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:bg-[#F8F9FA] transition-colors"
              aria-label="Close incident details"
            >
              <span className="material-icons-round text-[18px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Reporting Resident</p>
              <p className="text-sm font-semibold text-[#111827] mt-1">{selectedIncident.reporter_name}</p>
              <p className="text-xs text-[#6B7280]">{selectedIncident.reporter_unit_label}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Category</p>
              <p className="text-sm font-semibold text-[#111827] mt-1">
                {dbValueToUiLabel(selectedIncident.incident_type)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Status</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[selectedIncident.status].dot}`} />
                <span className={`text-sm font-bold ${STATUS_CONFIG[selectedIncident.status].text}`}>
                  {STATUS_CONFIG[selectedIncident.status].uiLabel}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Responding Guard</p>
              <p className="text-sm font-semibold text-[#111827] mt-1">
                {selectedIncident.acknowledged_by_name ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Time Reported</p>
              <p className="text-sm font-semibold text-[#111827] mt-1">
                {formatDateTime(selectedIncident.created_at).date}
              </p>
              <p className="text-xs text-[#6B7280]">
                {formatDateTime(selectedIncident.created_at).time}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Time Acknowledged</p>
              {selectedIncident.acknowledged_at ? (
                <>
                  <p className="text-sm font-semibold text-[#111827] mt-1">
                    {formatDateTime(selectedIncident.acknowledged_at).date}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {formatDateTime(selectedIncident.acknowledged_at).time}
                  </p>
                </>
              ) : (
                <p className="text-sm text-[#9CA3AF] mt-1 italic">—</p>
              )}
            </div>
            {(extendedDetail || selectedIncident.resolved_at) && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Time Resolved</p>
                {selectedIncident.resolved_at ? (
                  <>
                    <p className="text-sm font-semibold text-[#111827] mt-1">
                      {formatDateTime(selectedIncident.resolved_at).date}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {formatDateTime(selectedIncident.resolved_at).time}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-[#9CA3AF] mt-1 italic">—</p>
                )}
              </div>
            )}
            {extendedDetail && selectedIncident.acknowledged_at && selectedIncident.resolved_at && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Response Duration</p>
                <p className="text-sm font-semibold text-[#111827] mt-1">
                  {formatDuration(
                    new Date(selectedIncident.resolved_at).getTime() -
                      new Date(selectedIncident.acknowledged_at).getTime()
                  )}
                </p>
              </div>
            )}
            <div className="md:col-span-2 xl:col-span-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Description</p>
              <p className="text-sm text-[#374151] mt-1 leading-6">
                {selectedIncident.description ?? "No description provided."}
              </p>
            </div>
            {/* Escalation details — red highlighted box */}
            {selectedIncident.status === "escalated" && selectedIncident.resolution_note && (
              <div className="md:col-span-2 xl:col-span-3">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-600 mb-1">
                    Escalation Details
                  </p>
                  <p className="text-sm text-rose-800 leading-6">{selectedIncident.resolution_note}</p>
                </div>
              </div>
            )}
            {/* Resolution note for non-escalated */}
            {selectedIncident.status !== "escalated" && selectedIncident.resolution_note && (
              <div className="md:col-span-2 xl:col-span-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Resolution Note</p>
                <p className="text-sm text-[#374151] mt-1 leading-6">{selectedIncident.resolution_note}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2 print:hidden">
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
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
                {[
                  "Date / Time",
                  "Category",
                  "Reporting Resident",
                  "Responding Guard",
                  "Status",
                  "Response Timer",
                  "Action",
                ].map(
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
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#6B7280]">
                    No incidents match your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((incident) => {
                  const cfg = STATUS_CONFIG[incident.status];
                  const isSelected = selectedIncident?.id === incident.id;
                  const dt = formatDateTime(incident.created_at);

                  return (
                    <tr
                      key={incident.id}
                      onClick={() => handleSelectIncident(incident)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleSelectIncident(incident);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSelected}
                      className={`cursor-pointer outline-none transition-colors ${
                        isSelected ? "bg-secondary/5" : "hover:bg-[#F8F9FA]"
                      }`}
                    >
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-[#111827]">{dt.date}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{dt.time}</p>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-xs font-bold text-[#374151]">
                          {dbValueToUiLabel(incident.incident_type)}
                        </span>
                      </td>

                      {/* Reporter */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-[#374151]">{incident.reporter_name}</p>
                        <p className="text-xs text-[#6B7280]">{incident.reporter_unit_label}</p>
                      </td>

                      {/* Guard */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {incident.acknowledged_by_name ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-primary/20 text-primary">
                              {incident.acknowledged_by_name
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <span className="text-sm text-[#374151]">
                              {incident.acknowledged_by_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-[#9CA3AF] italic">Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className={`text-xs font-bold uppercase ${cfg.text}`}>
                            {cfg.uiLabel}
                          </span>
                        </div>
                      </td>

                      {/* Response Timer */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ResponseTimerCell incident={incident} />
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {!readOnly && isActionable(incident.status) ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onAction?.(incident);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            aria-label={`${getActionLabel(incident.status)} ${dbValueToUiLabel(incident.incident_type)}`}
                          >
                            <span className="material-icons-round text-[14px]">
                              {incident.status === "open" ? "check_circle" : "task_alt"}
                            </span>
                            {getActionLabel(incident.status)}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSelectIncident(incident);
                            }}
                            className="text-[#6B7280] hover:text-secondary transition-colors"
                            aria-label={`View details for ${dbValueToUiLabel(incident.incident_type)}`}
                          >
                            <span className="material-icons-round text-xl">more_vert</span>
                          </button>
                        )}
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

      {/* Print-only report */}
      <div className="hidden print:block">
        <div className="mb-4 border-b border-black pb-3">
          <h2 className="text-xl font-bold">Centro Security Incident Logs</h2>
          <p className="text-sm">Printable Incident Report</p>
          <p className="text-xs mt-1">Generated: {printedAt}</p>
          <p className="text-xs">
            Filters: {statusFilter === "all" ? "All statuses" : STATUS_CONFIG[statusFilter as IncidentStatus]?.uiLabel ?? statusFilter}
            {search.trim() ? ` | Search: ${search.trim()}` : ""}
          </p>
        </div>

        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="border border-black px-2 py-1 text-left">Date</th>
              <th className="border border-black px-2 py-1 text-left">Time</th>
              <th className="border border-black px-2 py-1 text-left">Category</th>
              <th className="border border-black px-2 py-1 text-left">Reporter</th>
              <th className="border border-black px-2 py-1 text-left">Guard</th>
              <th className="border border-black px-2 py-1 text-left">Description</th>
              <th className="border border-black px-2 py-1 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="border border-black px-2 py-3 text-center">
                  No incidents match the selected filters.
                </td>
              </tr>
            ) : (
              filtered.map((incident) => {
                const dt = formatDateTime(incident.created_at);
                return (
                  <tr key={`print-${incident.id}`}>
                    <td className="border border-black px-2 py-1 align-top">{dt.date}</td>
                    <td className="border border-black px-2 py-1 align-top">{dt.time}</td>
                    <td className="border border-black px-2 py-1 align-top">
                      {dbValueToUiLabel(incident.incident_type)}
                    </td>
                    <td className="border border-black px-2 py-1 align-top">
                      {incident.reporter_name} — {incident.reporter_unit_label}
                    </td>
                    <td className="border border-black px-2 py-1 align-top">
                      {incident.acknowledged_by_name ?? "—"}
                    </td>
                    <td className="border border-black px-2 py-1 align-top">
                      {incident.description ?? "—"}
                    </td>
                    <td className="border border-black px-2 py-1 align-top">
                      {STATUS_CONFIG[incident.status].uiLabel}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
