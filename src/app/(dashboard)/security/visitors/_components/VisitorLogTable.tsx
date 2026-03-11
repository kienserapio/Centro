"use client";

import { useState } from "react";

type VisitorStatus = "inside" | "pending" | "exited";

export interface Visitor {
  id: string;
  status: VisitorStatus;
  host: string;
  name: string;
  initials: string;
  plate: string;
  expectedTime: string;
}

const INITIAL_VISITORS: Visitor[] = [
  {
    id: "1",
    status: "inside",
    host: "B-204",
    name: "John Doe",
    initials: "JD",
    plate: "ABC-1234",
    expectedTime: "09:00 AM",
  },
  {
    id: "2",
    status: "pending",
    host: "L-105",
    name: "Jane Smith",
    initials: "JS",
    plate: "XYZ-9876",
    expectedTime: "10:30 AM",
  },
  {
    id: "3",
    status: "exited",
    host: "B-412",
    name: "Robert Brown",
    initials: "RB",
    plate: "GHI-4567",
    expectedTime: "08:15 AM",
  },
  {
    id: "4",
    status: "inside",
    host: "L-301",
    name: "Alice Wang",
    initials: "AW",
    plate: "JKL-2345",
    expectedTime: "11:00 AM",
  },
  {
    id: "5",
    status: "pending",
    host: "B-110",
    name: "Carlos Reyes",
    initials: "CR",
    plate: "MNO-6789",
    expectedTime: "01:00 PM",
  },
  {
    id: "6",
    status: "exited",
    host: "L-209",
    name: "Maria Santos",
    initials: "MS",
    plate: "PQR-3456",
    expectedTime: "07:30 AM",
  },
];

const PAGE_SIZE = 4;

const STATUS_CONFIG: Record<
  VisitorStatus,
  { label: string; class: string }
> = {
  inside: {
    label: "INSIDE",
    class: "bg-green-100 text-green-700",
  },
  pending: {
    label: "PENDING",
    class: "bg-amber-100 text-amber-700",
  },
  exited: {
    label: "EXITED",
    class: "bg-[#F8F9FA] text-[#6B7280]",
  },
};

interface Props {
  newVisitor?: Visitor | null;
}

export function VisitorLogTable({ newVisitor }: Props) {
  const [visitors, setVisitors] = useState<Visitor[]>(
    newVisitor ? [newVisitor, ...INITIAL_VISITORS] : INITIAL_VISITORS
  );
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(visitors.length / PAGE_SIZE);
  const paginated = visitors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function updateStatus(id: string, next: VisitorStatus) {
    setVisitors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: next } : v))
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
      {/* Table header */}
      <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <h4 className="font-bold text-base text-[#111827]">Daily Log</h4>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-semibold bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg hover:bg-[#E5E7EB] transition-colors text-[#374151]">
            Export CSV
          </button>
          <button className="px-3 py-1.5 text-xs font-semibold bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg hover:bg-[#E5E7EB] transition-colors text-[#374151]">
            Print List
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F8F9FA] text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Host Address</th>
              <th className="px-6 py-3">Visitor Name</th>
              <th className="px-6 py-3">Vehicle Plate</th>
              <th className="px-6 py-3">Expected Time</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {paginated.map((visitor) => {
              const cfg = STATUS_CONFIG[visitor.status];
              return (
                <tr
                  key={visitor.id}
                  className="hover:bg-[#F8F9FA] transition-colors"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cfg.class}`}
                    >
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                    {visitor.host}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {visitor.initials}
                      </div>
                      <span className="text-sm text-[#111827]">{visitor.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                    {visitor.plate}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#111827]">
                    {visitor.expectedTime}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {visitor.status === "inside" && (
                      <button
                        onClick={() => updateStatus(visitor.id, "exited")}
                        className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:brightness-105 hover:shadow-md hover:shadow-primary/20 transition-all"
                      >
                        Check-Out
                      </button>
                    )}
                    {visitor.status === "pending" && (
                      <button
                        onClick={() => updateStatus(visitor.id, "inside")}
                        className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:brightness-105 hover:shadow-md hover:shadow-primary/20 transition-all"
                      >
                        Check-In
                      </button>
                    )}
                    {visitor.status === "exited" && (
                      <button className="text-secondary font-bold text-xs px-4 py-1.5 hover:underline transition-all">
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

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
        <p className="text-xs text-[#6B7280] font-medium">
          Showing {Math.min((page - 1) * PAGE_SIZE + 1, visitors.length)}–
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
    </div>
  );
}
