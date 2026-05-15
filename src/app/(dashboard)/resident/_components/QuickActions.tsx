"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type ActionId = "guest-pass" | "book-venue" | "job-request" | "permits";

const ACTIONS: { id: ActionId; icon: string; label: string }[] = [
  { id: "guest-pass", icon: "directions_car", label: "Guest Pass" },
  { id: "book-venue", icon: "event_available", label: "Book Venue" },
  { id: "job-request", icon: "construction", label: "Job Request" },
  { id: "permits", icon: "description", label: "Permits" },
];

export function QuickActions() {
  const [venueOpen, setVenueOpen] = useState(false);
  const [venueForm, setVenueForm] = useState({
    date: "",
    amenity: "",
    unit: "",
    name: "",
  });
  const [venueError, setVenueError] = useState("");
  const [venues, setVenues] = useState<{ id: string; name: string }[]>([]);
  const [venueLoading, setVenueLoading] = useState(false);
  const [venueLoadError, setVenueLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadVenues() {
      setVenueLoading(true);
      setVenueLoadError("");

      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("enabled_locations")
        .select("id, venues, is_enabled")
        .eq("is_enabled", true)
        .order("venues", { ascending: true });

      if (!isMounted) {
        return;
      }

      if (fetchError) {
        setVenueLoadError("Unable to load venues. Please try again.");
        setVenues([]);
      } else {
        const next = (data ?? []).map((item) => ({
          id: String(item.id),
          name: String(item.venues),
        }));
        setVenues(next);
      }

      setVenueLoading(false);
    }

    loadVenues();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleVenueChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setVenueForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setVenueError("");
  }

  function handleOpen(actionId: ActionId) {
    if (actionId === "book-venue") {
      setVenueOpen(true);
    }
  }

  function handleVenueClose() {
    setVenueOpen(false);
    setVenueForm({ date: "", amenity: "", unit: "", name: "" });
    setVenueError("");
  }

  function handleVenueSubmit(e: FormEvent) {
    e.preventDefault();

    if (
      !venueForm.date.trim() ||
      !venueForm.amenity.trim() ||
      !venueForm.unit.trim() ||
      !venueForm.name.trim()
    ) {
      setVenueError("Date, amenity, unit, and name are required.");
      return;
    }

    handleVenueClose();
  }

  return (
    <section className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
      <h2 className="font-semibold text-[18px] text-[#111827] mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => handleOpen(action.id)}
            className="p-4 rounded-xl border border-[#E5E7EB] hover:border-secondary/40 hover:bg-secondary/5 transition-all text-center"
          >
            <span className="material-icons-round text-secondary mb-2 block">
              {action.icon}
            </span>
            <p className="text-xs font-medium text-[#111827]">{action.label}</p>
          </button>
        ))}
      </div>

      {venueOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={handleVenueClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-md pointer-events-auto">
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <span className="material-icons-round text-secondary text-xl">
                      event_available
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[#111827]">
                    Book Venue
                  </h2>
                </div>
                <button
                  onClick={handleVenueClose}
                  className="text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                  <span className="material-icons-round">close</span>
                </button>
              </div>

              <form onSubmit={handleVenueSubmit} className="px-6 py-5 space-y-4">
                {venueError && (
                  <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                    {venueError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#374151]">
                      Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={venueForm.name}
                      onChange={handleVenueChange}
                      placeholder="e.g. Maria Santos"
                      className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#374151]">
                      Unit <span className="text-rose-500">*</span>
                    </label>
                    <input
                      name="unit"
                      value={venueForm.unit}
                      onChange={handleVenueChange}
                      placeholder="e.g. B-204"
                      className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#374151]">
                    Reservation Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={venueForm.date}
                    onChange={handleVenueChange}
                    className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#374151]">
                    Amenity <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="amenity"
                    value={venueForm.amenity}
                    onChange={handleVenueChange}
                    className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
                  >
                    <option value="">Select an amenity</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.name}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                  {venueLoading && (
                    <p className="text-xs text-[#6B7280]">Loading venues...</p>
                  )}
                  {venueLoadError && (
                    <p className="text-xs text-rose-600">{venueLoadError}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleVenueClose}
                    className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-[#F8F9FA] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold hover:brightness-105 transition-all"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
