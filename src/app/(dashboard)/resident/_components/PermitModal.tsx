"use client";

import { useState } from "react";

const PERMITS = [
  "Major Construction / Building Permit",
  "Minor Renovation & Repair Permit",
  "Excavation & Drilling Permit",
  "Demolition Permit",
  "Construction Material Delivery Permit",
  "Move-In Clearance",
  "Move-Out Clearance",
  "Gate Pass for Hauling / Moving Vans",
  "Annual Homeowner Vehicle Sticker Application",
  "Contractor / Laborer ID Pass",
  "Commercial Vendor / Delivery Permit",
  "Utility Installation Gate Pass",
  "Clubhouse / Pavilion Rental Permit",
  "Sports Facility Reservation",
  "Commercial Shoot Permit",
  "Extension of Party/Sound Hours Permit",
  "HOA Certificate of Good Standing",
  "Tenant Authorization Certificate",
  "Tree Trimming / Cutting Permit",
];

interface PermitModalProps {
  onClose: () => void;
}

export function PermitModal({ onClose }: PermitModalProps) {
  const [fullName, setFullName] = useState("");
  const [permitType, setPermitType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredPermits = PERMITS.filter((p) =>
    p.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim() || !permitType) {
      setErrorMessage("Please fill in your full name and select a permit type.");
      return;
    }

    setIsSubmitting(true);

    await new Promise((r) => setTimeout(r, 600));

    window.alert("Permit request submitted successfully.");
    setIsSubmitting(false);
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
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-start justify-between gap-4 p-6 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Permit Application</h2>
            <p className="text-sm text-[#6B7280] mt-1">Submit a permit request for HOA approval.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#E5E7EB] p-2 text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Close permit modal"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {errorMessage && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          )}

          <label className="block text-sm font-medium text-[#374151]">
            Full Name
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              required
            />
          </label>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#374151]">
              Permit Type
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery || permitType}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  if (e.target.value !== permitType) setPermitType("");
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search permit type..."
                className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                required
              />
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 material-icons-round text-[#6B7280] cursor-pointer"
                onClick={() => setIsDropdownOpen((o) => !o)}
              >
                {isDropdownOpen ? "expand_less" : "expand_more"}
              </span>
              {isDropdownOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-[#E5E7EB] rounded-2xl shadow-lg max-h-52 overflow-y-auto">
                  {filteredPermits.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-[#6B7280]">No permits found.</p>
                  ) : (
                    filteredPermits.map((permit) => (
                      <button
                        key={permit}
                        type="button"
                        onClick={() => {
                          setPermitType(permit);
                          setSearchQuery("");
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-[#111827] hover:bg-secondary/5 transition-colors"
                      >
                        {permit}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-medium text-[#6B7280] hover:bg-[#F8F9FA] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting…" : "Submit Permit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
