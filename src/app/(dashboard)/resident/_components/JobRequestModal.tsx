"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface JobRequestModalProps {
  onClose: () => void;
}

interface HostUnitData {
  unit_id: string;
  address_label: string | null;
  block_number: string | null;
  lot_number: string | null;
}

export function JobRequestModal({ onClose }: JobRequestModalProps) {
  const [description, setDescription] = useState("");
  const [isLoadingUnit, setIsLoadingUnit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hostUnitData, setHostUnitData] = useState<HostUnitData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [unitErrorMessage, setUnitErrorMessage] = useState("");

  useEffect(() => {
    async function loadUnitData() {
      setIsLoadingUnit(true);
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
        setUnitErrorMessage("Unable to identify your account. Please sign in again.");
        setIsLoadingUnit(false);
        return;
      }

      const { data, error } = await supabase
        .from("unit_residents")
        .select("unit_id, units(address_label, block_number, lot_number)")
        .eq("profile_id", user.id)
        .limit(1)
        .single();

      if (error || !data) {
        setUnitErrorMessage("No unit assigned to this account.");
        setHostUnitData(null);
      } else {
        setHostUnitData({
          unit_id: data.unit_id,
          address_label: data.units?.[0]?.address_label ?? null,
          block_number: data.units?.[0]?.block_number ?? null,
          lot_number: data.units?.[0]?.lot_number ?? null,
        });
      }

      setIsLoadingUnit(false);
    }

    loadUnitData();
  }, []);

  const fullAddress = hostUnitData
    ? `Block ${hostUnitData.block_number ?? "?"} Lot ${hostUnitData.lot_number ?? "?"} (${hostUnitData.address_label ?? "Unknown"})`
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!description.trim()) {
      setErrorMessage("Please describe the situation or job you need help with.");
      return;
    }

    if (isLoadingUnit) {
      setErrorMessage("Loading your unit data. Please wait.");
      return;
    }

    if (!hostUnitData) {
      setErrorMessage("Unable to determine your unit. Please contact an administrator.");
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
        reporter_id: user.id,
        unit_id: hostUnitData.unit_id,
        incident_type: "Maintenance",
        description: description.trim(),
        location_note: fullAddress,
        status: "open",
      };

      const { error } = await supabase.from("emergency_alerts").insert(payload);

      if (error) {
        throw new Error(error.message ?? "Failed to submit the maintenance request.");
      }

      window.alert("Maintenance request submitted successfully.");
      onClose();
    } catch (error) {
      console.error("[JobRequestModal] submit error:", error);
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
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-start justify-between gap-4 p-6 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Service & Maintenance Request</h2>
            <p className="text-sm text-[#6B7280] mt-1">Submit a maintenance or service request for your unit.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#E5E7EB] p-2 text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Close job request modal"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {(errorMessage || unitErrorMessage) && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage || unitErrorMessage}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-[#374151]">Request location</p>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8F9FA] px-4 py-3 text-sm text-[#111827]">
              {isLoadingUnit ? "Loading unit address..." : fullAddress}
            </div>
          </div>

          <label className="block text-sm font-medium text-[#374151]">
            Situation Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the situation or the job you need help with (e.g., kitchen pipe leak, roof check, etc.)"
              rows={6}
              className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              required
            />
          </label>

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
              disabled={isSubmitting || isLoadingUnit || !hostUnitData}
              className="inline-flex items-center justify-center rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
