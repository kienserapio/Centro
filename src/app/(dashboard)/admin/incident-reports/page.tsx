"use client";

import { useState } from "react";
import { AdminSidebar } from "../_components/AdminSidebar";
import { AdminMobileNav } from "../_components/AdminMobileNav";
import { IncidentTable, type Incident } from "../../security/incidents/_components/IncidentTable";
import { ReportIncidentModal } from "../../security/incidents/_components/ReportIncidentModal";

export default function AdminIncidentReportsPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [newIncident, setNewIncident] = useState<Incident | null>(null);

  function handlePrintReport() {
    window.print();
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] flex items-center justify-between px-6 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-[#111827]">Digital Blotter</h2>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-60">
              <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs…"
                className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2 text-sm text-[#111827] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
              />
            </div>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-primary transition-colors">
              <span className="material-icons-round text-[20px]">notifications</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E5E7EB]">
              <div className="text-right">
                <p className="text-xs font-bold text-[#111827] leading-none">Admin</p>
                <p className="text-[10px] text-[#6B7280] uppercase mt-0.5">On Duty</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">
                AD
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 pb-24 lg:pb-8 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-[#111827] tracking-tight">
                Incident Logs
              </h3>
              <p className="text-sm text-[#6B7280] mt-1">
                Chronological history of security incidents and resolutions.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrintReport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] text-sm font-bold text-[#374151] hover:bg-[#F8F9FA] transition-colors"
              >
                <span className="material-icons-round text-[18px]">print</span>
                Print Report
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white text-sm font-bold hover:brightness-105 transition-all shadow-sm shadow-secondary/20"
              >
                <span className="material-icons-round text-[18px]">add_circle</span>
                Report Incident
              </button>
            </div>
          </div>

          <IncidentTable search={search} newIncident={newIncident} />
        </main>
      </div>

      <AdminMobileNav />

      {modalOpen && (
        <ReportIncidentModal
          onClose={() => setModalOpen(false)}
          onAdd={(incident) => {
            setNewIncident(incident);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
