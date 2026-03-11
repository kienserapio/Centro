"use client";

import { useState } from "react";
import { SecuritySidebar } from "../_components/SecuritySidebar";
import { SecurityMobileNav } from "../_components/SecurityMobileNav";
import { VisitorStatsCards } from "./_components/VisitorStatsCards";
import { VisitorLogTable, type Visitor } from "./_components/VisitorLogTable";
import { LogVisitorModal } from "./_components/LogVisitorModal";

export default function VisitorLogPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingVisitor, setPendingVisitor] = useState<Visitor | null>(null);

  function handleAdd(visitor: Visitor) {
    setPendingVisitor(visitor);
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <SecuritySidebar />

      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="material-icons-round text-primary text-2xl">menu_book</span>
            <h2 className="text-lg font-bold text-[#111827]">Visitor Logbook</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-56">
              <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search visitors…"
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
        <main className="flex-1 p-6 space-y-6 pb-24 lg:pb-8 relative">
          <VisitorStatsCards />
          <VisitorLogTable newVisitor={pendingVisitor} />

          {/* Floating Action Button */}
          <button
            onClick={() => setModalOpen(true)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-30 group"
          >
            <span className="material-icons-round text-3xl">add</span>
            {/* Tooltip */}
            <span className="absolute right-full mr-3 bg-[#111827] text-white px-3 py-1.5 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Quick Log Walk-in
            </span>
          </button>
        </main>
      </div>

      <SecurityMobileNav />

      {/* Modal */}
      {modalOpen && (
        <LogVisitorModal
          onClose={() => setModalOpen(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
