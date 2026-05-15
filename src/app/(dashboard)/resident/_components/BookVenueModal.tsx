"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Venue {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
}

interface BookVenueModalProps {
  onClose: () => void;
}

export function BookVenueModal({ onClose }: BookVenueModalProps) {
  const [fullName, setFullName] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredVenues = venues.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    async function loadVenues() {
      setIsLoadingVenues(true);
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data } = await supabase
        .from("venues")
        .select("id, name, description, category")
        .order("category")
        .order("name");

      setVenues((data as Venue[]) ?? []);
      setIsLoadingVenues(false);
    }

    loadVenues();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim() || !selectedVenue) {
      setErrorMessage("Please fill in your full name and select a venue.");
      return;
    }

    setIsSubmitting(true);

    await new Promise((r) => setTimeout(r, 600));

    window.alert("Venue booking submitted successfully.");
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
            <h2 className="text-xl font-bold text-[#111827]">Book a Venue</h2>
            <p className="text-sm text-[#6B7280] mt-1">Reserve a subdivision venue for your event.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#E5E7EB] p-2 text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Close venue booking modal"
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
              Venue
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery || selectedVenue}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  if (e.target.value !== selectedVenue) setSelectedVenue("");
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search venues..."
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
                  {isLoadingVenues ? (
                    <p className="px-4 py-3 text-sm text-[#6B7280]">Loading venues...</p>
                  ) : filteredVenues.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-[#6B7280]">No venues found.</p>
                  ) : (
                    filteredVenues.map((venue) => (
                      <button
                        key={venue.id}
                        type="button"
                        onClick={() => {
                          setSelectedVenue(venue.name);
                          setSearchQuery("");
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-[#111827] hover:bg-secondary/5 transition-colors"
                      >
                        <span className="font-medium">{venue.name}</span>
                        {venue.category && (
                          <span className="ml-2 text-xs text-[#6B7280]">· {venue.category}</span>
                        )}
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
              disabled={isSubmitting || isLoadingVenues}
              className="inline-flex items-center justify-center rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting…" : "Book Venue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
