"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AccountPanel() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [lastPayment, setLastPayment] = useState<{ amount: number; date: string } | null>(null);
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

        const { data: dues } = await supabase
          .from("dues")
          .select("amount, amount_paid")
          .eq("unit_id", unitId)
          .is("deleted_at", null);

        const total = (dues ?? []).reduce((sum, due) => {
          const amount = Number(due.amount ?? 0);
          const paid = Number(due.amount_paid ?? 0);
          return sum + Math.max(amount - paid, 0);
        }, 0);

        setBalance(total);

        const { data: payments } = await supabase
          .from("payments")
          .select("amount, created_at")
          .eq("unit_id", unitId)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(1);

        if (payments && payments.length > 0) {
          setLastPayment({
            amount: Number(payments[0].amount ?? 0),
            date: new Date(payments[0].created_at).toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric" }),
          });
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  function formatCurrency(value: number) {
    return `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <section className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-[18px] text-[#111827]">Account Balance</h2>
        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${balance > 0 ? "bg-amber-100 text-amber-700" : "bg-secondary/10 text-secondary"}`}>
          {isLoading ? "—" : balance > 0 ? "PENDING" : "PAID"}
        </span>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-[#111827] mb-1">{isLoading ? "—" : formatCurrency(balance)}</div>
        <p className="text-[#6B7280] text-sm">{isLoading ? "Loading..." : balance > 0 ? "Outstanding balance" : "No outstanding dues"}</p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#6B7280]">Last Payment: {lastPayment ? formatCurrency(lastPayment.amount) : "—"}</span>
            <span className="font-medium text-[#111827]">{lastPayment ? lastPayment.date : "None"}</span>
          </div>
          <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${balance > 0 ? "bg-amber-500" : "bg-secondary"}`} style={{ width: balance > 0 ? "50%" : "100%" }} />
          </div>
        </div>

        <button
          onClick={() => router.push("/resident/dues")}
          className="w-full py-3 bg-[#F8F9FA] hover:bg-[#E5E7EB] text-[#111827] rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
        >
          <span className="material-icons-round text-lg text-[#6B7280]">history</span>
          View History
        </button>
      </div>
    </section>
  );
}
