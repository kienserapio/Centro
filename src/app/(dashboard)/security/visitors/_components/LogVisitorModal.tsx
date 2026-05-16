"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Props {
  onClose: () => void;
}

interface HostUnitData {
  unit_id: string;
  units: {
    address_label: string | null;
  } | null;
}

export function LogVisitorModal({ onClose }: Props) {
  const [form, setForm] = useState({
    name: "",
    plate: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hostUnitData, setHostUnitData] = useState<HostUnitData | null>(null);
  const [isUnitLoading, setIsUnitLoading] = useState(true);
  const [unitErrorMessage, setUnitErrorMessage] = useState("");

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
        setUnitErrorMessage("Unable to load your session.");
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
        setHostUnitData(data as unknown as HostUnitData);
      }

      setIsUnitLoading(false);
    }

    loadHostUnit();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Visitor name is required.");
      return;
    }

    if (isUnitLoading) {
      setError("Loading your unit data. Please wait.");
      return;
    }

    if (!hostUnitData) {
      setError("No unit assigned to this account.");
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
        throw new Error("Unable to load your session.");
      }

      const payload = {
        visitor_name: form.name.trim(),
        purpose: "personal" as const,
        vehicle_plate: form.plate.trim() || null,
        host_unit_id: hostUnitData.unit_id,
        host_label: hostUnitData.units?.address_label ?? "Unknown",
        pre_registered_by: null,
        logged_by: user.id,
        deleted_at: null,
      };

      const { error } = await supabase.from("visitors").insert(payload);

      if (error) {
        throw new Error(error.message ?? "Failed to log visitor.");
      }

      window.alert("Visitor logged successfully.");
      onClose();
    } catch (err) {
      console.error("[LogVisitorModal] error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-md pointer-events-auto">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                <span className="material-icons-round text-secondary text-xl">person_add</span>
              </div>
              <h2 className="text-base font-bold text-[#111827]">Quick Log Walk-in</h2>
            </div>
            <button onClick={onClose} className="text-[#6B7280] hover:text-[#111827] transition-colors">
              <span className="material-icons-round">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {(error || unitErrorMessage) && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {error || unitErrorMessage}
              </p>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#374151]">
                Visitor Name <span className="text-rose-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Juan dela Cruz"
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#374151]">Vehicle Plate</label>
              <input
                name="plate"
                value={form.plate}
                onChange={handleChange}
                placeholder="e.g. ABC-1234"
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all font-mono"
              />
            </div>

            {isUnitLoading ? (
              <p className="text-sm text-[#6B7280]">Loading your unit data...</p>
            ) : hostUnitData ? (
              <p className="text-sm text-[#6B7280]">Logging for: {hostUnitData.units?.address_label ?? "Unknown"}</p>
            ) : (
              <p className="text-sm text-rose-700">No unit assigned.</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-[#F8F9FA] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUnitLoading || !hostUnitData}
                className="flex-1 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold hover:brightness-105 transition-all disabled:opacity-60"
              >
                {isSubmitting ? "Logging…" : "Log Visitor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
