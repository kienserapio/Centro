"use client";

import { useState } from "react";

interface AddBillModalProps {
  onClose: () => void;
}

const RESIDENTS = [
  "John Doe (A-102)",
  "Sarah Smith (B-405)",
  "Michael Wong (C-001)",
  "Elena Lopez (A-302)",
  "James Carter (B-210)",
  "Nina Patel (C-115)",
];

export function AddBillModal({ onClose }: AddBillModalProps) {
  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(false);

  function toggleAll() {
    if (allSelected) {
      setSelectedResidents([]);
      setAllSelected(false);
    } else {
      setSelectedResidents([...RESIDENTS]);
      setAllSelected(true);
    }
  }

  function toggleResident(name: string) {
    const next = selectedResidents.includes(name)
      ? selectedResidents.filter((r) => r !== name)
      : [...selectedResidents, name];
    setSelectedResidents(next);
    setAllSelected(next.length === RESIDENTS.length);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
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
              {RESIDENTS.map((resident) => {
                const checked = selectedResidents.includes(resident);
                return (
                  <label
                    key={resident}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      checked ? "bg-secondary/5" : "hover:bg-[#F8F9FA]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleResident(resident)}
                      className="w-4 h-4 rounded accent-secondary"
                    />
                    <span className="text-sm font-medium text-[#111827]">{resident}</span>
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
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
            />
          </div>

          {/* Billing Period + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
                Billing Period
              </label>
              <input
                type="month"
                className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
                Due Date
              </label>
              <input
                type="date"
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
