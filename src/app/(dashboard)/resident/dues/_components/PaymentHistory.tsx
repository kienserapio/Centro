"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type HistoryItem = {
  id: string;
  label: string;
  subtext: string;
  amount: string;
  date: string;
};

export function PaymentHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: links } = await supabase
          .from("unit_residents")
          .select("unit_id, is_primary")
          .eq("profile_id", user.id)
          .order("is_primary", { ascending: false });

        const unitId = links?.[0]?.unit_id;
        if (!unitId) return;

        const { data: payments } = await supabase
          .from("payments")
          .select("id, amount, status, description, reference_no, created_at")
          .eq("unit_id", unitId)
          .order("created_at", { ascending: false })
          .range(0, 9);

        const rows = (payments ?? []).map((payment) => {
          const amount = Number(payment.amount ?? 0);
          return {
            id: payment.id,
            label: payment.description ?? "Payment",
            subtext: payment.reference_no
              ? `Ref: ${payment.reference_no}`
              : (payment.status ? payment.status.toUpperCase() : "Payment"),
            amount: `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            date: payment.created_at
              ? new Date(payment.created_at).toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric" })
              : "—",
          };
        });

        setHistory(rows);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  return (
    <section className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E5E7EB]">
        <h4 className="text-[18px] font-semibold text-secondary flex items-center gap-2">
          <span className="material-icons-round text-secondary">history</span>
          Payment History
        </h4>
      </div>

      {/* Items */}
      <div className="p-6 space-y-3">
        {isLoading && (
          <div className="text-sm text-[#6B7280] text-center py-6">Loading payments...</div>
        )}
        {!isLoading && history.length === 0 && (
          <div className="text-sm text-[#6B7280] text-center py-6">No payments yet.</div>
        )}
        {!isLoading && history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] hover:border-secondary/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-secondary/10 p-2 rounded-full shrink-0">
                <span className="material-icons-round text-secondary">
                  check_circle
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">
                  {item.label}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">{item.subtext}</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="text-sm font-bold text-secondary">{item.amount}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{item.date}</p>
            </div>
          </div>
        ))}

        <button
          className="w-full mt-3 py-3 text-sm font-semibold text-secondary border-2 border-secondary/20 rounded-xl hover:bg-secondary/5 transition-colors"
          disabled={history.length === 0}
        >
          View Full Statement History
        </button>
      </div>
    </section>
  );
}
