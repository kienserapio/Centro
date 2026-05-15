"use client";

import { useState, useEffect } from "react";
import { SecuritySidebar } from "../_components/SecuritySidebar";
import { SecurityMobileNav } from "../_components/SecurityMobileNav";
import { UnitGrid } from "./_components/UnitGrid";

export default function UnitDirectoryPage() {
  const [search, setSearch] = useState("");
  const [totalUnits, setTotalUnits] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch total units count
  useEffect(() => {
    async function fetchTotalUnits() {
      try {
        const response = await fetch("/api/security/units");
        if (response.ok) {
          const data = await response.json();
          setTotalUnits(data.total || 0);
        }
      } catch (err) {
        console.error("Error fetching units count:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTotalUnits();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <SecuritySidebar />

      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#111827]">Unit Directory</h2>
            <span className="px-2 py-0.5 bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] text-[10px] font-bold rounded-full uppercase tracking-tight">
              {loading ? "..." : `${totalUnits} Units`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-60">
              <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search B/L or name…"
                className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2 text-sm text-[#111827] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
              />
            </div>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-primary transition-colors">
              <span className="material-icons-round text-[20px]">notifications</span>
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-primary transition-colors">
              <span className="material-icons-round text-[20px]">account_circle</span>
            </button>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 p-6 pb-24 lg:pb-8">
          <UnitGrid search={search} />
        </main>
      </div>

      <SecurityMobileNav />
    </div>
  );
}
