"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface VisitorData {
  id: string;
  visitor_name: string;
  purpose: string;
  vehicle_plate: string | null;
  host_label: string | null;
  pre_registered_by: string | null;
  logged_by: string | null;
  time_in: string;
  time_out: string | null;
  created_at: string;
}

interface ViewVisitorModalProps {
  visitor: VisitorData;
  onClose: () => void;
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const PURPOSE_LABELS: Record<string, string> = {
  personal: "Personal Visit",
  delivery: "Delivery",
  service: "Service / Maintenance",
  event: "Event / Party",
  drop_off: "Pick-up / Drop-off",
  viewing: "Property Viewing",
  other: "Other",
};

async function fetchProfileName(userId: string): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();
    return data?.full_name ?? null;
  } catch {
    return null;
  }
}

export function ViewVisitorModal({ visitor, onClose }: ViewVisitorModalProps) {
  const [preRegByName, setPreRegByName] = useState<string | null>(null);
  const [loggedByName, setLoggedByName] = useState<string | null>(null);

  useEffect(() => {
    if (visitor.pre_registered_by) {
      fetchProfileName(visitor.pre_registered_by).then(setPreRegByName);
    }
    if (visitor.logged_by) {
      fetchProfileName(visitor.logged_by).then(setLoggedByName);
    }
  }, [visitor.pre_registered_by, visitor.logged_by]);

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const purposeLabel = PURPOSE_LABELS[visitor.purpose] ?? visitor.purpose;

  const details = [
    { label: "Visitor Name", value: visitor.visitor_name },
    { label: "Purpose", value: purposeLabel },
    { label: "Vehicle Plate", value: visitor.vehicle_plate ?? "None" },
    { label: "Host Address", value: visitor.host_label ?? "—" },
    { label: "Pre-registered By", value: preRegByName ?? (visitor.pre_registered_by ? "Loading..." : "Walk-in") },
    { label: "Logged By", value: loggedByName ?? (visitor.logged_by ? "Loading..." : "—") },
    { label: "Time In", value: formatDateTime(visitor.time_in) },
    { label: "Time Out", value: formatDateTime(visitor.time_out) },
    { label: "Created At", value: formatDateTime(visitor.created_at) },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
              <span className="material-icons-round text-secondary text-xl">receipt_long</span>
            </div>
            <h2 className="text-base font-bold text-[#111827]">Visitor Log Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <div className="px-6 py-5 space-y-0">
          {details.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-start justify-between py-3 ${
                idx < details.length - 1 ? "border-b border-[#F3F4F6]" : ""
              }`}
            >
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{item.label}</span>
              <span className="text-sm font-medium text-[#111827] text-right ml-4">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-[#F8F9FA] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
