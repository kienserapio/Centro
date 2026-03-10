"use client";

import { useMemo, useState } from "react";
import { AdminSidebar } from "../_components/AdminSidebar";
import { AdminMobileNav } from "../_components/AdminMobileNav";
import { ResidentListing, Resident, INITIAL_RESIDENTS } from "./_components/ResidentListing";
import { AddResidentModal } from "./_components/AddResidentModal";

export default function ResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>(INITIAL_RESIDENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derive unique phases, blocks, lots from current residents
  const existingAddresses = useMemo(() => {
    const phases = new Set<string>();
    const blocks = new Set<string>();
    const lots = new Set<string>();
    residents.forEach(({ address }) => {
      const parts = address.split(",").map((s) => s.trim());
      if (parts[0]) phases.add(parts[0]);
      if (parts[1]) blocks.add(parts[1]);
      if (parts[2]) lots.add(parts[2]);
    });
    return {
      phases: Array.from(phases).sort(),
      blocks: Array.from(blocks).sort(),
      lots: Array.from(lots).sort(),
    };
  }, [residents]);

  function handleAddResident(newResident: Omit<Resident, "id" | "duesStatus" | "role">) {
    setResidents((prev) => [
      ...prev,
      { ...newResident, id: Date.now(), role: "Resident", duesStatus: "pending" },
    ]);
  }

  const paidCount = residents.filter((r) => r.duesStatus === "paid").length;
  const unpaidCount = residents.filter((r) => r.duesStatus === "unpaid").length;

  return (
    <div className="flex min-h-screen relative bg-white">
      <AdminSidebar />

      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8 pb-24 lg:pb-8">
          {/* Page Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
                Resident Directory
              </h1>
              <p className="text-[#6B7280] mt-1">
                Manage and view all registered residents within the community.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shrink-0"
            >
              <span className="material-icons-round text-[18px]">person_add</span>
              Add New Resident
            </button>
          </header>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                  <span className="material-icons-round">group</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  +4%
                </span>
              </div>
              <h3 className="text-[#6B7280] text-sm font-medium">Total Residents</h3>
              <p className="text-2xl font-bold mt-1 text-[#111827]">{residents.length.toLocaleString()}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <span className="material-icons-round">verified</span>
                </div>
                <span className="text-xs font-bold text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-lg">
                  {residents.length > 0 ? Math.round((paidCount / residents.length) * 100) : 0}%
                </span>
              </div>
              <h3 className="text-[#6B7280] text-sm font-medium">Dues Collection Rate</h3>
              <p className="text-2xl font-bold mt-1 text-[#111827]">{paidCount} Paid</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                  <span className="material-icons-round">warning</span>
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                  High Priority
                </span>
              </div>
              <h3 className="text-[#6B7280] text-sm font-medium">Outstanding Dues</h3>
              <p className="text-2xl font-bold mt-1 text-[#111827]">{unpaidCount} Unpaid</p>
            </div>
          </div>

          {/* Resident Table */}
          <ResidentListing residents={residents} />
        </div>
      </div>

      <AdminMobileNav />

      {isModalOpen && (
        <AddResidentModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddResident}
          existingAddresses={existingAddresses}
        />
      )}
    </div>
  );
}
