"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ViewVisitorModal } from "./ViewVisitorModal";

type VisitorStatus = "pending" | "inside" | "exited";

interface DbVisitor {
  id: string;
  visitor_name: string;
  purpose: string;
  vehicle_plate: string | null;
  host_label: string | null;
  pre_registered_by: string | null;
  logged_by: string | null;
  time_in: string;
  time_out: string | null;
  created_at: string;
  updated_at: string;
}

interface VisitorRow extends DbVisitor {
  status: VisitorStatus;
  initials: string;
}

const PAGE_SIZE = 6;

const STATUS_CONFIG: Record<VisitorStatus, { label: string; class: string }> = {
  pending: { label: "PRE-REG", class: "bg-amber-100 text-amber-700" },
  inside: { label: "INSIDE", class: "bg-green-100 text-green-700" },
  exited: { label: "EXITED", class: "bg-[#F3F4F6] text-[#6B7280]" },
};

function determineStatus(v: DbVisitor): VisitorStatus {
  if (v.time_out) return "exited";
  const timeIn = new Date(v.time_in).getTime();
  const created = new Date(v.created_at).getTime();
  if (Math.abs(timeIn - created) < 30_000) return "pending";
  return "inside";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric" });
}

export function VisitorLogTable() {
  const [visitors, setVisitors] = useState<VisitorRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [viewingVisitor, setViewingVisitor] = useState<VisitorRow | null>(null);

  const fetchVisitors = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("visitors")
        .select("id, visitor_name, purpose, vehicle_plate, host_label, pre_registered_by, logged_by, time_in, time_out, created_at, updated_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[VisitorLogTable] fetch error:", error.message);
        setVisitors([]);
        return;
      }

      const rows = (data as DbVisitor[] ?? []).map((v) => ({
        ...v,
        status: determineStatus(v),
        initials: getInitials(v.visitor_name),
      }));

      setVisitors(rows);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVisitors();
  }, [fetchVisitors]);

  async function handleCheckIn(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("visitors")
      .update({ time_in: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[VisitorLogTable] check-in error:", error.message);
      return;
    }

    await fetchVisitors();
  }

  async function handleCheckOut(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("visitors")
      .update({ time_out: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[VisitorLogTable] check-out error:", error.message);
      return;
    }

    await fetchVisitors();
  }

  const totalPages = Math.max(1, Math.ceil(visitors.length / PAGE_SIZE));
  const paginated = visitors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <h4 className="font-bold text-base text-[#111827]">Daily Log</h4>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-semibold bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg hover:bg-[#E5E7EB] transition-colors text-[#374151]">
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F8F9FA] text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Host Address</th>
              <th className="px-6 py-3">Visitor Name</th>
              <th className="px-6 py-3">Vehicle Plate</th>
              <th className="px-6 py-3">Time In</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#6B7280]">
                  <span className="material-icons-round animate-spin inline-block mr-2 align-middle">refresh</span>
                  Loading visitor log...
                </td>
              </tr>
            )}
            {!isLoading && visitors.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#6B7280]">
                  No visitors recorded yet.
                </td>
              </tr>
            )}
            {!isLoading && paginated.map((visitor) => {
              const cfg = STATUS_CONFIG[visitor.status];
              return (
                <tr key={visitor.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cfg.class}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                    {visitor.host_label || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {visitor.initials}
                      </div>
                      <span className="text-sm text-[#111827]">{visitor.visitor_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                    {visitor.vehicle_plate || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#111827]">
                    {formatTime(visitor.time_in)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {visitor.status === "pending" && (
                      <button
                        onClick={() => handleCheckIn(visitor.id)}
                        className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:brightness-105 hover:shadow-md hover:shadow-primary/20 transition-all"
                      >
                        Check-In
                      </button>
                    )}
                    {visitor.status === "inside" && (
                      <button
                        onClick={() => handleCheckOut(visitor.id)}
                        className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-600 hover:shadow-md hover:shadow-orange-500/20 transition-all"
                      >
                        Check-Out
                      </button>
                    )}
                    {visitor.status === "exited" && (
                      <button
                        onClick={() => setViewingVisitor(visitor)}
                        className="text-secondary font-bold text-xs px-4 py-1.5 hover:underline transition-all"
                      >
                        View Log
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
        <p className="text-xs text-[#6B7280] font-medium">
          Showing {visitors.length === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, visitors.length)}–
          {Math.min(page * PAGE_SIZE, visitors.length)} of {visitors.length} visitors
        </p>
        <div className="flex gap-1 items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F8F9FA] transition-colors"
          >
            <span className="material-icons-round text-base">chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
                n === page
                  ? "bg-primary text-white border-primary"
                  : "border-[#E5E7EB] text-[#374151] hover:bg-[#F8F9FA]"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F8F9FA] transition-colors"
          >
            <span className="material-icons-round text-base">chevron_right</span>
          </button>
        </div>
      </div>

      {viewingVisitor && (
        <ViewVisitorModal visitor={viewingVisitor} onClose={() => setViewingVisitor(null)} />
      )}
    </div>
  );
}
