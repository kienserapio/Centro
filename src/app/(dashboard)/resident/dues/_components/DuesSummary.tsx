"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SummaryCard = {
  label: string;
  value: string;
  icon: string;
  accentClass: string;
  iconBgClass: string;
  iconColorClass: string;
  borderClass: string;
};

export function DuesSummary() {
  const [totalDue, setTotalDue] = useState(0);
  const [nextDueDate, setNextDueDate] = useState<string | null>(null);
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
          .select("amount, amount_paid, due_date, status")
          .eq("unit_id", unitId)
          .is("deleted_at", null)
          .order("due_date", { ascending: true });

        if (!dues) return;

        const total = dues.reduce((sum, due) => {
          const amount = Number(due.amount ?? 0);
          const paid = Number(due.amount_paid ?? 0);
          return sum + Math.max(amount - paid, 0);
        }, 0);

        const next = dues.find((due) => due.status !== "paid" && due.due_date)?.due_date ?? null;

        setTotalDue(total);
        setNextDueDate(next);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  function formatCurrency(value: number) {
    return `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const CARDS: SummaryCard[] = [
    {
      label: "Total Balance Due",
      value: isLoading ? "—" : formatCurrency(totalDue),
      icon: "account_balance_wallet",
      accentClass: "text-secondary",
      iconBgClass: "bg-secondary/10",
      iconColorClass: "text-secondary",
      borderClass: "border-l-4 border-secondary",
    },
    {
      label: "Next Payment Date",
      value: isLoading
        ? "—"
        : (nextDueDate
          ? new Date(nextDueDate).toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric" })
          : "No upcoming dues"),
      icon: "event",
      accentClass: "text-[#111827]",
      iconBgClass: "bg-primary/10",
      iconColorClass: "text-primary",
      borderClass: "border-l-4 border-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] ${card.borderClass}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#6B7280] text-xs font-semibold uppercase tracking-wider mb-1">
                {card.label}
              </p>
              <h3 className={`text-4xl font-bold ${card.accentClass}`}>
                {card.value}
              </h3>
            </div>
            <div className={`${card.iconBgClass} p-2.5 rounded-lg`}>
              <span className={`material-icons-round ${card.iconColorClass}`}>
                {card.icon}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
