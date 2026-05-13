"use client";

import { useState } from "react";

export interface Venue {
  id: string;
  name: string;
  description?: string;
  category?: string;
  is_enabled: boolean;
}

interface VenuesTableProps {
  venues: Venue[];
  onToggle: (id: string, is_enabled: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function VenuesTable({ venues, onToggle, isLoading }: VenuesTableProps) {
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setToggling(id);
    try {
      await onToggle(id, !currentStatus);
    } catch (error) {
      console.error("Toggle failed:", error);
    } finally {
      setToggling(null);
    }
  };

  if (!venues.length) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-8 text-center">
        <p className="text-[#6B7280]">No venues found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
              <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Venue Name
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {venues.map((venue) => (
              <tr
                key={venue.id}
                className="hover:bg-[#F8F9FA] transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-[#111827]">
                    {venue.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]">
                    {venue.category || "Uncategorized"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${
                      venue.is_enabled
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {venue.is_enabled ? "Enabled" : "Disabled"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleToggle(venue.id, venue.is_enabled)}
                      disabled={toggling === venue.id || isLoading}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        toggling === venue.id
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : venue.is_enabled
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {toggling === venue.id ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
                          Updating...
                        </span>
                      ) : venue.is_enabled ? (
                        "Disable"
                      ) : (
                        "Enable"
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
