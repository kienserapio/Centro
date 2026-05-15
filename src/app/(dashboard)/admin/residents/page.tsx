"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "../_components/AdminSidebar";
import { AdminMobileNav } from "../_components/AdminMobileNav";
import { ResidentListing, Resident } from "./_components/ResidentListing";
import { AddResidentModal } from "./_components/AddResidentModal";

/** Build a readable address from the joined units data */
function buildAddress(units: { block_number?: string; lot_number?: string; phase?: string | null; address_label?: string } | null): string {
  if (!units) return "—";
  const parts: string[] = [];
  if (units.phase) parts.push(units.phase);
  if (units.block_number) parts.push(`Block ${units.block_number}`);
  if (units.lot_number) parts.push(`Lot ${units.lot_number}`);
  if (units.address_label) parts.push(units.address_label);
  return parts.length > 0 ? parts.join(", ") : "—";
}

interface ProfileFromApi {
  id: string;
  full_name: string;
  email: string | null;
  username: string | null;
  role: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  units: {
    id: string;
    block_number: string;
    lot_number: string;
    phase: string | null;
    address_label: string;
    unit_type: "owned" | "rented" | "vacant";
  } | null;
}

function mapUnitTypeToHouseStatus(
  unitType: "owned" | "rented" | "vacant" | null | undefined,
): Resident["houseStatus"] {
  if (unitType === "owned") return "owner";
  if (unitType === "rented") return "tenant";
  if (unitType === "vacant") return "vacant";
  return "unassigned";
}

export default function ResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  /** Fetch residents from the database */
  const fetchResidents = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/residents");
      const data = await res.json();

      if (!res.ok) {
        console.error("[ResidentsPage] Failed to fetch:", data.error);
        return;
      }

      const mapped: Resident[] = data.map((p: ProfileFromApi) => ({
        id: p.id,
        name: p.full_name || "—",
        email: p.email ?? "",
        username: p.username ?? "",
        role: "Resident",
        address: buildAddress(p.units),
        unit: p.units
          ? {
              phase: p.units.phase ?? null,
              block_number: p.units.block_number,
              lot_number: p.units.lot_number,
              address_label: p.units.address_label,
            }
          : null,
        duesStatus: "pending" as const,
        phone: p.phone ?? "",
        avatar: p.avatar_url ?? "",
        houseStatus: mapUnitTypeToHouseStatus(p.units?.unit_type),
      }));

      setResidents(mapped);
    } catch (err) {
      console.error("[ResidentsPage] Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  /** After adding a resident, re-fetch from the database */
  function handleResidentCreated() {
    fetchResidents();
  }

  /** After saving edits, call PATCH API and re-fetch */
  async function handleSaveResident(updated: Resident) {
    try {
      const payload: Record<string, unknown> = {
        full_name: updated.name,
        phone: updated.phone,
        resident_type: updated.houseStatus === "tenant" ? "tenant" : "owner",
        unit: updated.unit ?? null,
      };

      if (updated.email) payload.email = updated.email;
      if (updated.username) payload.username = updated.username;
      if (updated.password) payload.password = updated.password;

      const res = await fetch(`/api/admin/users/${updated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("[ResidentsPage] Save failed:", data.error);
        alert(data.error || "Failed to save changes.");
        return;
      }

      console.log("[ResidentsPage] ✅ Resident updated");
      fetchResidents();
    } catch (err) {
      console.error("[ResidentsPage] Save error:", err);
      alert("Network error while saving.");
    }
  }

  /** Delete resident via API and re-fetch */
  async function handleRemoveResident(id: string) {
    if (!confirm("Are you sure you want to delete this resident? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("[ResidentsPage] Delete failed:", data.error);
        alert(data.error || "Failed to delete resident.");
        return;
      }

      console.log("[ResidentsPage] ✅ Resident deleted");
      fetchResidents();
    } catch (err) {
      console.error("[ResidentsPage] Delete error:", err);
      alert("Network error while deleting.");
    }
  }

  // Derive unique phases, blocks, lots, streets from current residents
  const existingAddresses = useMemo(() => {
    const phases = new Set<string>();
    const blocks = new Set<string>();
    const lots = new Set<string>();
    const streets = new Set<string>();
    residents.forEach(({ address }) => {
      const parts = address.split(",").map((s) => s.trim());
      if (parts[0]) phases.add(parts[0]);
      if (parts[1]) blocks.add(parts[1]);
      if (parts[2]) lots.add(parts[2]);
      if (parts[3]) streets.add(parts[3]);
    });
    return {
      phases: Array.from(phases).sort(),
      blocks: Array.from(blocks).sort(),
      lots: Array.from(lots).sort(),
      streets: Array.from(streets).sort(),
    };
  }, [residents]);

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
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-[#6B7280]">
              <span className="material-icons-round animate-spin mr-2">refresh</span>
              Loading residents...
            </div>
          ) : residents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
              <span className="material-icons-round text-5xl mb-3">group_off</span>
              <p className="font-medium">No residents found</p>
              <p className="text-sm mt-1">Click &quot;Add New Resident&quot; to register one.</p>
            </div>
          ) : (
            <ResidentListing
              residents={residents}
              onEdit={(resident) => setEditingResident(resident)}
              onRemove={handleRemoveResident}
            />
          )}
        </div>
      </div>

      <AdminMobileNav />

      {isModalOpen && (
        <AddResidentModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleResidentCreated}
          existingAddresses={existingAddresses}
        />
      )}

      {editingResident && (
        <AddResidentModal
          onClose={() => setEditingResident(null)}
          onSave={handleSaveResident}
          editResident={editingResident}
          existingAddresses={existingAddresses}
        />
      )}
    </div>
  );
}
