"use client";

import { useState } from "react";
import { SecuritySidebar } from "./_components/SecuritySidebar";
import { SecurityMobileNav } from "./_components/SecurityMobileNav";
import { SecurityRightPanel } from "./_components/SecurityRightPanel";
import { ActiveEmergencies } from "./_components/ActiveEmergencies";
import { ActivityStream } from "./_components/ActivityStream";

export default function SecurityPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <SecuritySidebar />

      {/* Page content — offset for fixed sidebar */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold text-[#111827] whitespace-nowrap">
              Command Center
            </h2>
            <div className="max-w-sm w-full relative hidden sm:block">
              <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search unit, plate, or resident…"
                className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2 text-sm text-[#111827] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* System online badge */}
            <div className="hidden sm:flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-green-700 uppercase tracking-tight">
                System Online
              </span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-[#6B7280] hover:text-primary transition-colors">
              <span className="material-icons-round">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-[#E5E7EB] flex items-center justify-center ring-2 ring-secondary/20">
              <span className="material-icons-round text-[#6B7280]">account_circle</span>
            </div>
          </div>
        </header>

        {/* Body: center feed + right panel */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Center feed */}
          <main className="flex-1 overflow-y-auto p-6 space-y-8 pb-20 lg:pb-8 min-w-0">
            <ActiveEmergencies />
            <ActivityStream />
          </main>

          {/* Right panel */}
          <SecurityRightPanel />
        </div>
      </div>

      <SecurityMobileNav />
    </div>
  );
}

