"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PendingItem = {
  id: string;
  description: string;
  subtext: string;
  amount: string;
  dueDate: string;
};

export function PendingPayments() {
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

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
          .select("id, description, amount, amount_paid, due_date, status")
          .eq("unit_id", unitId)
          .is("deleted_at", null)
          .order("due_date", { ascending: true });

        const rows = (dues ?? [])
          .filter((due) => due.status !== "paid")
          .map((due) => {
            const amount = Number(due.amount ?? 0);
            const paid = Number(due.amount_paid ?? 0);
            const remaining = Math.max(amount - paid, 0);
            return {
              id: due.id,
              description: due.description,
              subtext: paid > 0 ? `Paid ₱${paid.toFixed(2)} so far` : "Outstanding balance",
              amount: `₱${remaining.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              dueDate: due.due_date
                ? new Date(due.due_date).toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric" })
                : "—",
            };
          });

        setPending(rows);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  async function handlePayNow(dueId: string) {
    setPayingId(dueId);
    try {
      const res = await fetch("/api/resident/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ due_id: dueId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Failed to submit payment request.");
        return;
      }

      alert("Payment request submitted. Please wait for admin confirmation.");
    } catch {
      alert("Network error while submitting payment.");
    } finally {
      setPayingId(null);
    }
  }

  return (
    <section className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden mb-8">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
        <h4 className="text-[18px] font-semibold text-[#111827] flex items-center gap-2">
          <span className="material-icons-round text-primary">pending_actions</span>
          Pending Payments
        </h4>
        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
          {isLoading ? "—" : `${pending.length} Items Outstanding`}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F8F9FA]">
              <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-sm text-[#6B7280]">
                  Loading dues...
                </td>
              </tr>
            )}
            {!isLoading && pending.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-sm text-[#6B7280]">
                  No pending dues.
                </td>
              </tr>
            )}
            {!isLoading && pending.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-[#F8F9FA] transition-colors"
              >
                <td className="px-6 py-5">
                  <p className="text-sm font-semibold text-[#111827]">
                    {item.description}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{item.subtext}</p>
                </td>
                <td className="px-6 py-5 text-sm font-bold text-[#111827]">
                  {item.amount}
                </td>
                <td className="px-6 py-5 text-sm text-[#6B7280]">
                  {item.dueDate}
                </td>
                <td className="px-6 py-5 text-right">
                  <button
                    onClick={() => handlePayNow(item.id)}
                    disabled={payingId === item.id}
                    className="bg-primary text-white text-xs font-bold px-5 py-2 rounded-lg hover:bg-primary/90 transition-all shadow-sm disabled:opacity-60"
                  >
                    {payingId === item.id ? "Submitting..." : "Pay Now"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
