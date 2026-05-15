"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "../_components/AdminSidebar";
import { AdminMobileNav } from "../_components/AdminMobileNav";
import { VenuesTable, Venue } from "./_components/VenuesTable";

export default function LocationsPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/locations");
      if (!response.ok) throw new Error("Failed to fetch venues");
      const data = await response.json();
      console.log("Fetched venues data:", data);
      console.log("Venues array:", data.venues);
      console.log("Debug info:", data.debug);
      setVenues(data.venues || []);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An error occurred while fetching venues";
      console.error("Fetch error:", errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleToggleVenue = async (id: string, is_enabled: boolean) => {
    try {
      console.log(`Toggling venue ${id} to ${is_enabled}`);
      const response = await fetch(`/api/admin/locations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_enabled }),
      });

      const responseData = await response.json();
      console.log("API Response:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.details ||
            responseData.error ||
            "Failed to update venue"
        );
      }

      // Update local state
      setVenues((prev) =>
        prev.map((venue) =>
          venue.id === id ? { ...venue, is_enabled } : venue
        )
      );
      
      // Clear any previous errors on successful update
      setError(null);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Failed to update venue. Please try again.";
      console.error("Toggle error:", errorMsg);
      setError(errorMsg);
      // Refetch to ensure data is in sync
      await fetchVenues();
    }
  };

  return (
    <div className="flex min-h-screen relative bg-white">
      <AdminSidebar />

      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8 pb-24 lg:pb-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#111827]">Locations</h1>
            <p className="text-[#6B7280] mt-2">
              Manage subdivision venues and enable/disable locations for residents
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#E5E7EB] border-t-secondary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#6B7280]">Loading venues...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
                  <p className="text-[#6B7280] text-sm font-medium mb-1">
                    Total Venues
                  </p>
                  <p className="text-3xl font-bold text-[#111827]">
                    {venues.length}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
                  <p className="text-[#6B7280] text-sm font-medium mb-1">
                    Enabled
                  </p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {venues.filter((v) => v.is_enabled).length}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
                  <p className="text-[#6B7280] text-sm font-medium mb-1">
                    Disabled
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {venues.filter((v) => !v.is_enabled).length}
                  </p>
                </div>
              </div>

              {/* Enabled & Disabled Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Enabled Locations */}
                <div>
                  <h2 className="text-xl font-semibold text-[#111827] mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-emerald-600">
                      check_circle
                    </span>
                    Enabled Locations
                  </h2>
                  <div className="space-y-3">
                    {venues.filter((v) => v.is_enabled).length > 0 ? (
                      venues
                        .filter((v) => v.is_enabled)
                        .map((venue) => (
                          <div
                            key={venue.id}
                            className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <p className="font-semibold text-emerald-900">
                              {venue.name}
                            </p>
                            <p className="text-xs text-emerald-700 mt-1">
                              {venue.category || "Venue"}
                            </p>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-[#6B7280]">
                        <p>No enabled locations</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Disabled Locations */}
                <div>
                  <h2 className="text-xl font-semibold text-[#111827] mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-red-600">
                      cancel
                    </span>
                    Disabled Locations
                  </h2>
                  <div className="space-y-3">
                    {venues.filter((v) => !v.is_enabled).length > 0 ? (
                      venues
                        .filter((v) => !v.is_enabled)
                        .map((venue) => (
                          <div
                            key={venue.id}
                            className="bg-red-50 border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <p className="font-semibold text-red-900">
                              {venue.name}
                            </p>
                            <p className="text-xs text-red-700 mt-1">
                              {venue.category || "Venue"}
                            </p>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-[#6B7280]">
                        <p>All locations are enabled</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Venues Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#111827]">
                    All Venues (Table View)
                  </h2>
                  <button
                    onClick={fetchVenues}
                    className="p-2 text-[#6B7280] hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                    aria-label="Refresh venues"
                  >
                    <span className="material-icons-round text-[20px]">
                      refresh
                    </span>
                  </button>
                </div>
                <VenuesTable
                  venues={venues}
                  onToggle={handleToggleVenue}
                  isLoading={isLoading}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <AdminMobileNav />
    </div>
  );
}
