"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const VISITOR_PURPOSES = [
  { label: "Personal Visit", value: "personal" },
  { label: "Delivery", value: "delivery" },
  { label: "Service / Maintenance", value: "service" },
  { label: "Event / Party", value: "event" },
  { label: "Pick-up / Drop-off", value: "drop_off" },
  { label: "Property Viewing", value: "viewing" },
  { label: "Other", value: "other" },
];

interface GuestPassModalProps {
  onClose: () => void;
}

interface HostUnitData {
  unit_id: string;
  units: {
    address_label: string | null;
  } | null;
}

export function GuestPassModal({ onClose }: GuestPassModalProps) {
  const [visitorName, setVisitorName] = useState("");
  const [purpose, setPurpose] = useState("personal");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnitLoading, setIsUnitLoading] = useState(true);
  const [hostUnitData, setHostUnitData] = useState<HostUnitData | null>(null);
  const [unitErrorMessage, setUnitErrorMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadHostUnit() {
      setIsUnitLoading(true);
      setUnitErrorMessage("");

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setUnitErrorMessage("Unable to load your session. Please sign in again.");
        setIsUnitLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("unit_residents")
        .select("unit_id, units(address_label)")
        .eq("profile_id", user.id)
        .limit(1)
        .single();

      if (error || !data) {
        setUnitErrorMessage("No unit assigned to this account.");
        setHostUnitData(null);
      } else {
        setHostUnitData(data as HostUnitData);
      }

      setIsUnitLoading(false);
    }

    loadHostUnit();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!visitorName.trim() || !purpose.trim()) {
      setErrorMessage("Please fill in the visitor name and purpose of visit.");
      return;
    }

    if (isUnitLoading) {
      setErrorMessage("Loading your unit data. Please wait.");
      return;
    }

    if (!hostUnitData) {
      setErrorMessage("No unit assigned to this account.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Unable to load your session. Please sign in again.");
      }

      const payload = {
        visitor_name: visitorName.trim(),
        purpose: purpose.trim(),
        vehicle_plate: vehiclePlate.trim() || null,
        host_unit_id: hostUnitData.unit_id,
        host_label: hostUnitData.units?.address_label ?? "Unknown",
        pre_registered_by: user.id,
        logged_by: user.id,
        time_out: null,
        deleted_at: null,
      };

      console.log("Sending Payload:", payload);

      const { error } = await supabase.from("visitors").insert(payload);

      if (error) {
        throw new Error(error.message ?? "Failed to generate guest pass.");
      }

      window.alert("Guest pass generated successfully.");
      onClose();
    } catch (error) {
      console.error("[GuestPassModal] submission error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 p-6 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Guest Pass Registration</h2>
            <p className="text-sm text-[#6B7280] mt-1">Create a pre-registered guest pass for security to process.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#E5E7EB] p-2 text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Close guest pass modal"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
{(errorMessage || unitErrorMessage) ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage || unitErrorMessage}
            </div>
          ) : null}

          <label className="block text-sm font-medium text-[#374151]">
            Visitor Name
            <input
              type="text"
              value={visitorName}
              onChange={(event) => setVisitorName(event.target.value)}
              placeholder="Enter visitor name"
              className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              required
            />
          </label>

          <label className="block text-sm font-medium text-[#374151]">
            Purpose of Visit
            <select
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              required
            >
              {VISITOR_PURPOSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-[#374151]">
            Vehicle Plate
            <input
              type="text"
              value={vehiclePlate}
              onChange={(event) => setVehiclePlate(event.target.value)}
              placeholder="ABC-1234"
              className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
            <p className="mt-2 text-xs text-[#6B7280]">Leave blank if no vehicle.</p>
          </label>

          {isUnitLoading ? (
            <p className="text-sm text-[#6B7280]">Loading your unit data...</p>
          ) : hostUnitData ? (
            <p className="text-sm text-[#6B7280]">Registering guest for: {hostUnitData.units?.address_label ?? "Unknown address"}</p>
          ) : (
            <p className="text-sm text-rose-700">No unit assigned to this account.</p>
          )}

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
              disabled={isSubmitting || isUnitLoading || !hostUnitData}
              className="inline-flex items-center justify-center rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Generating…" : isUnitLoading ? "Loading unit…" : "Generate Pass"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
