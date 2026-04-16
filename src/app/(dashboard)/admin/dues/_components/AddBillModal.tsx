"use client";

import { useEffect, useState } from "react";
import { DUE_BILLING_FEATURE_OPTIONS, DueBillingFeature } from "@/lib/types";

interface AddBillModalProps {
  onClose: () => void;
  onCreateBill: (bill: NewBillPayload) => void;
}

export interface NewBillPayload {
  residentCount: number;
  amount: number;
  description: string;
  billingPeriod: string;
  dueDate: string;
  billingFeatures: DueBillingFeature[];
}

type HouseStatus = "owner" | "tenant" | "vacant" | "unassigned";

interface ResidentApiItem {
  id: string;
  full_name: string;
  units: {
    block_number: string | null;
    lot_number: string | null;
    unit_type: "owned" | "rented" | "vacant" | null;
  } | null;
}

interface ResidentOption {
  id: string;
  label: string;
  houseStatus: HouseStatus;
}

const HOUSE_STATUS_LABELS: Record<HouseStatus, string> = {
  owner: "Owner",
  tenant: "Tenant",
  vacant: "Vacant",
  unassigned: "Unassigned",
};

const HOUSE_STATUS_STYLES: Record<HouseStatus, string> = {
  owner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  tenant: "bg-blue-50 text-blue-700 border-blue-200",
  vacant: "bg-amber-50 text-amber-700 border-amber-200",
  unassigned: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
};

function mapUnitTypeToHouseStatus(unitType: "owned" | "rented" | "vacant" | null | undefined): HouseStatus {
  if (unitType === "owned") return "owner";
  if (unitType === "rented") return "tenant";
  if (unitType === "vacant") return "vacant";
  return "unassigned";
}

export function AddBillModal({ onClose, onCreateBill }: AddBillModalProps) {
  const [residents, setResidents] = useState<ResidentOption[]>([]);
  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);
  const [isLoadingResidents, setIsLoadingResidents] = useState(true);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<DueBillingFeature[]>([]);
  const [isFeatureMenuOpen, setIsFeatureMenuOpen] = useState(false);

  const allSelected = residents.length > 0 && selectedResidents.length === residents.length;

  useEffect(() => {
    async function loadResidents() {
      try {
        setIsLoadingResidents(true);
        const response = await fetch("/api/admin/residents");
        const data = await response.json();

        if (!response.ok) {
          console.error("[AddBillModal] Failed to fetch residents:", data?.error);
          setResidents([]);
          return;
        }

        const mapped = (data as ResidentApiItem[]).map((resident) => {
          const block = resident.units?.block_number;
          const lot = resident.units?.lot_number;
          const unitLabel = block && lot ? ` (Block ${block}, Lot ${lot})` : "";

          return {
            id: resident.id,
            label: `${resident.full_name}${unitLabel}`,
            houseStatus: mapUnitTypeToHouseStatus(resident.units?.unit_type),
          };
        });

        setResidents(mapped);
      } catch (error) {
        console.error("[AddBillModal] Resident fetch error:", error);
        setResidents([]);
      } finally {
        setIsLoadingResidents(false);
      }
    }

    loadResidents();
  }, []);

  function toggleAll() {
    if (allSelected) {
      setSelectedResidents([]);
    } else {
      setSelectedResidents(residents.map((resident) => resident.id));
    }
  }

  function toggleResident(residentId: string) {
    const next = selectedResidents.includes(residentId)
      ? selectedResidents.filter((id) => id !== residentId)
      : [...selectedResidents, residentId];
    setSelectedResidents(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      selectedResidents.length === 0 ||
      amount <= 0 ||
      !description.trim() ||
      !billingPeriod ||
      !dueDate ||
      selectedFeatures.length === 0
    ) {
      return;
    }

    onCreateBill({
      residentCount: selectedResidents.length,
      amount,
      description: description.trim(),
      billingPeriod,
      dueDate,
      billingFeatures: selectedFeatures,
    });

    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function toggleFeature(feature: DueBillingFeature) {
    setSelectedFeatures((current) =>
      current.includes(feature)
        ? current.filter((selected) => selected !== feature)
        : [...current, feature],
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
              <span className="material-icons-round">receipt_long</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#111827]">Add New Bill</h3>
              <p className="text-xs text-[#6B7280]">Generate a payment request for residents.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5 overflow-y-auto">
          {/* Select Residents */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
                Select Residents
              </label>
              <button
                type="button"
                onClick={toggleAll}
                className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                  allSelected
                    ? "bg-secondary text-white"
                    : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                }`}
              >
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="border border-[#E5E7EB] rounded-xl overflow-hidden divide-y divide-[#F3F4F6]">
              {isLoadingResidents && (
                <div className="px-4 py-6 text-sm text-[#6B7280] flex items-center justify-center gap-2">
                  <span className="material-icons-round animate-spin text-base">refresh</span>
                  Loading residents...
                </div>
              )}

              {!isLoadingResidents && residents.length === 0 && (
                <div className="px-4 py-6 text-sm text-[#6B7280] text-center">
                  No residents available for billing.
                </div>
              )}

              {!isLoadingResidents && residents.map((resident) => {
                const checked = selectedResidents.includes(resident.id);
                return (
                  <label
                    key={resident.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      checked ? "bg-secondary/5" : "hover:bg-[#F8F9FA]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleResident(resident.id)}
                      className="w-4 h-4 rounded accent-secondary"
                    />
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[#111827] truncate">{resident.label}</span>
                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${HOUSE_STATUS_STYLES[resident.houseStatus]}`}
                      >
                        {HOUSE_STATUS_LABELS[resident.houseStatus]}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
            {selectedResidents.length > 0 && (
              <p className="text-xs text-[#6B7280]">
                {selectedResidents.length} resident{selectedResidents.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
              Amount (₱)
            </label>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={amount === 0 ? "" : amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g. October Maintenance Fee"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
            />
          </div>

          {/* Billing Features (Dropdown + Checkbox) */}
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
              Billing Features
            </label>
            <button
              type="button"
              onClick={() => setIsFeatureMenuOpen((open) => !open)}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm text-left text-[#111827] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
            >
              <span>
                {selectedFeatures.length > 0
                  ? `${selectedFeatures.length} feature${selectedFeatures.length > 1 ? "s" : ""} selected`
                  : "Select feature billings"}
              </span>
              <span className="material-icons-round text-base text-[#6B7280]">
                {isFeatureMenuOpen ? "expand_less" : "expand_more"}
              </span>
            </button>

            {isFeatureMenuOpen && (
              <div className="absolute z-20 mt-2 w-full bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden divide-y divide-[#F3F4F6]">
                {DUE_BILLING_FEATURE_OPTIONS.map((feature) => {
                  const checked = selectedFeatures.includes(feature.value);

                  return (
                    <label
                      key={feature.value}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        checked ? "bg-secondary/5" : "hover:bg-[#F8F9FA]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFeature(feature.value)}
                        className="w-4 h-4 rounded accent-secondary"
                      />
                      <span className="text-sm font-medium text-[#111827]">{feature.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Billing Period + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
                Billing Period
              </label>
              <input
                type="month"
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-[18px]">send</span>
              Generate &amp; Send Bill
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-[#6B7280] text-sm font-medium hover:text-[#111827] transition-colors"
            >
              Save as Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
