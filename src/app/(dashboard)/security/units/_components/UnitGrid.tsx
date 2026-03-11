"use client";

import { useState, useMemo } from "react";
import { UnitCard, type Unit } from "./UnitCard";

const ALL_UNITS: Unit[] = [
  {
    id: "1", block: "12", lot: "04", phase: "Phase 1", status: "occupied",
    residentName: "Jonathan H. Wick", contact: "+63 ••• ••• 4291",
    notes: [
      { icon: "elderly", label: "Elderly Resident", bg: "bg-[#F8F9FA]", color: "text-[#6B7280]" },
      { icon: "pets", label: "Guard Dog", bg: "bg-[#F8F9FA]", color: "text-[#6B7280]" },
    ],
  },
  {
    id: "2", block: "12", lot: "05", phase: "Phase 1", status: "vacant", notes: [],
  },
  {
    id: "3", block: "12", lot: "06", phase: "Phase 1", status: "occupied",
    residentName: "Sarah M. Parker", contact: "+63 ••• ••• 1102",
    notes: [
      { icon: "medical_services", label: "Medical Priority", bg: "bg-orange-100", color: "text-orange-600" },
    ],
  },
  {
    id: "4", block: "13", lot: "01", phase: "Phase 1", status: "occupied",
    residentName: "David K. Miller", contact: "+63 ••• ••• 8873",
    notes: [
      { icon: "pets", label: "Guard Dog", bg: "bg-[#F8F9FA]", color: "text-[#6B7280]" },
    ],
  },
  {
    id: "5", block: "13", lot: "02", phase: "Phase 1", status: "vacant", notes: [],
  },
  {
    id: "6", block: "13", lot: "03", phase: "Phase 1", status: "occupied",
    residentName: "Elena Rodriguez", contact: "+63 ••• ••• 9920",
    notes: [
      { icon: "videocam", label: "Security Camera Hub", bg: "bg-blue-100", color: "text-blue-600" },
    ],
  },
  {
    id: "7", block: "13", lot: "04", phase: "Phase 1", status: "occupied",
    residentName: "Robert Chen", contact: "+63 ••• ••• 5561",
    notes: [
      { icon: "child_care", label: "Infant in Home", bg: "bg-[#F8F9FA]", color: "text-[#6B7280]" },
    ],
  },
  {
    id: "8", block: "13", lot: "05", phase: "Phase 1", status: "occupied",
    residentName: "Linda Wu", contact: "+63 ••• ••• 2234",
    notes: [],
  },
  {
    id: "9", block: "14", lot: "01", phase: "Phase 2", status: "occupied",
    residentName: "Maria Gonzalez", contact: "+63 ••• ••• 3310",
    notes: [
      { icon: "elderly", label: "Elderly Resident", bg: "bg-[#F8F9FA]", color: "text-[#6B7280]" },
    ],
  },
  {
    id: "10", block: "14", lot: "02", phase: "Phase 2", status: "vacant", notes: [],
  },
  {
    id: "11", block: "14", lot: "03", phase: "Phase 2", status: "occupied",
    residentName: "James Thompson", contact: "+63 ••• ••• 7741",
    notes: [
      { icon: "medical_services", label: "Medical Priority", bg: "bg-orange-100", color: "text-orange-600" },
      { icon: "pets", label: "Guard Dog", bg: "bg-[#F8F9FA]", color: "text-[#6B7280]" },
    ],
  },
  {
    id: "12", block: "15", lot: "01", phase: "Phase 3", status: "occupied",
    residentName: "Anna Kim", contact: "+63 ••• ••• 6652",
    notes: [],
  },
  {
    id: "13", block: "15", lot: "02", phase: "Phase 3", status: "vacant", notes: [],
  },
  {
    id: "14", block: "15", lot: "03", phase: "Phase 3", status: "occupied",
    residentName: "Marcus Reyes", contact: "+63 ••• ••• 9001",
    notes: [
      { icon: "videocam", label: "Security Camera Hub", bg: "bg-blue-100", color: "text-blue-600" },
    ],
  },
];

const PAGE_SIZE = 8;
const PHASES = ["All Phases", "Phase 1", "Phase 2", "Phase 3"];
const SORT_OPTIONS = ["House Number", "Owner Name", "Recently Updated"];

interface Props {
  search: string;
}

export function UnitGrid({ search }: Props) {
  const [phase, setPhase] = useState("All Phases");
  const [statusFilter, setStatusFilter] = useState<"all" | "occupied" | "vacant">("all");
  const [sortBy, setSortBy] = useState("House Number");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = ALL_UNITS;

    if (phase !== "All Phases") {
      result = result.filter((u) => u.phase === phase);
    }
    if (statusFilter !== "all") {
      result = result.filter((u) => u.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          `b${u.block}/l${u.lot}`.includes(q) ||
          `b${u.block} l${u.lot}`.includes(q) ||
          u.residentName?.toLowerCase().includes(q)
      );
    }
    if (sortBy === "Owner Name") {
      result = [...result].sort((a, b) =>
        (a.residentName ?? "zzz").localeCompare(b.residentName ?? "zzz")
      );
    } else {
      result = [...result].sort((a, b) =>
        `${a.block}${a.lot}`.localeCompare(`${b.block}${b.lot}`)
      );
    }
    return result;
  }, [phase, statusFilter, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handlePhase(p: string) {
    setPhase(p);
    setPage(1);
  }
  function handleStatus(s: "all" | "occupied" | "vacant") {
    setStatusFilter(s);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PHASES.map((p) => (
            <button
              key={p}
              onClick={() => handlePhase(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
                phase === p
                  ? "bg-secondary text-white"
                  : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-secondary/40 hover:text-secondary"
              }`}
            >
              {p}
            </button>
          ))}

          <div className="h-5 w-px bg-[#E5E7EB] mx-1 shrink-0" />

          {(["all", "occupied", "vacant"] as const).map((s) => {
            const label = s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1);
            return (
              <button
                key={s}
                onClick={() => handleStatus(s)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
                  statusFilter === s
                    ? "bg-secondary text-white"
                    : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-secondary/40 hover:text-secondary"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[#6B7280] font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="bg-white border border-[#E5E7EB] text-xs font-semibold text-[#374151] rounded-xl py-1.5 pl-3 pr-7 focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {paginated.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center">
          <span className="material-icons-round text-[#9CA3AF] text-4xl">search_off</span>
          <p className="text-sm text-[#6B7280] mt-2">No units match your filters.</p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between py-2">
        <p className="text-xs text-[#6B7280] font-medium">
          Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
          {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} units
        </p>
        <div className="flex gap-1.5 items-center">
          <button
            disabled={safePage === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-[#E5E7EB] rounded-lg disabled:opacity-40 hover:bg-[#F8F9FA] transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-colors ${
                n === safePage
                  ? "bg-secondary/10 text-secondary border-secondary/30"
                  : "bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F8F9FA]"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-[#E5E7EB] rounded-lg disabled:opacity-40 hover:bg-[#F8F9FA] transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
