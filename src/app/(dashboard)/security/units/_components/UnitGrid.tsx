"use client";

import { useState, useMemo, useEffect } from "react";
import { UnitCard, type Unit } from "./UnitCard";

const PAGE_SIZE = 8;

interface Props {
  search: string;
}

export function UnitGrid({ search }: Props) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phases, setPhases] = useState<string[]>([]);
  const [phase, setPhase] = useState("All Phases");
  const [statusFilter, setStatusFilter] = useState<"all" | "occupied" | "vacant">("all");
  const [sortBy, setSortBy] = useState("House Number");
  const [page, setPage] = useState(1);

  // Fetch units from API
  useEffect(() => {
    async function fetchUnits() {
      try {
        setLoading(true);
        const response = await fetch("/api/security/units");
        if (!response.ok) throw new Error("Failed to fetch units");
        const data = await response.json();
        const unitsArr = Array.isArray(data?.units) ? data.units : [];
        setUnits(unitsArr);

        // Extract unique phases safely
        const uniquePhases = ["All Phases", ...new Set(unitsArr.map((u: Unit) => u.phase))];
        setPhases(uniquePhases);
      } catch (err) {
        console.error("Error fetching units:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchUnits();
  }, []);

  const filtered = useMemo(() => {
    let result = units;

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
  }, [phase, statusFilter, search, sortBy, units]);

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
      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm text-red-600">Error: {error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-[#E5E7EB] border-t-secondary rounded-full animate-spin" />
          </div>
          <p className="text-sm text-[#6B7280] mt-3">Loading units...</p>
        </div>
      )}

      {/* Filter bar */}
      {!loading && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {phases.map((p) => (
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
              {["House Number", "Owner Name", "Recently Updated"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      ) : !loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center">
          <span className="material-icons-round text-[#9CA3AF] text-4xl">search_off</span>
          <p className="text-sm text-[#6B7280] mt-2">No units match your filters.</p>
        </div>
      ) : null}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
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
      )}
    </div>
  );
}
