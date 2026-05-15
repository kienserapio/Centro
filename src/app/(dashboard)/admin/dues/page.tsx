"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "../_components/AdminSidebar";
import { AdminMobileNav } from "../_components/AdminMobileNav";
import { TransactionsListing, Transaction } from "./_components/TransactionsListing";
import { AddBillModal, NewBillPayload } from "./_components/AddBillModal";
import { DUE_BILLING_FEATURE_OPTIONS, DueBillingFeature } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const FEATURE_NAMES = Object.fromEntries(
  DUE_BILLING_FEATURE_OPTIONS.map((feature) => [feature.value, feature.label]),
) as Record<DueBillingFeature, string>;

type PaymentRow = {
  id: string;
  unit_id: string;
  transaction_type?: string | null;
  status?: string | null;
  amount: number;
  description: string;
  billing_period: string | null;
  due_date: string | null;
  created_at: string;
};

function toPhp(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function parsePhp(value: string) {
  return Number(value.replace(/[^\d.]/g, "")) || 0;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function shortUnitLabel(unitId: string) {
  return unitId.slice(0, 8).toUpperCase();
}

function groupPaymentsIntoTransactions(rows: PaymentRow[]): Transaction[] {
  const groups = new Map<string, PaymentRow[]>();

  rows.forEach((row) => {
    const groupKey = [
      row.description,
      row.billing_period ?? "",
      row.due_date ?? "",
      row.amount,
      row.created_at,
    ].join("|");
    const existing = groups.get(groupKey) ?? [];
    existing.push(row);
    groups.set(groupKey, existing);
  });

  return Array.from(groups.entries())
    .map(([groupKey, groupRows]) => {
      const [description, billingPeriodRaw, dueDateRaw] = groupKey.split("|");
      const representative = groupRows[0];
      const billingPeriod = billingPeriodRaw ? formatDate(billingPeriodRaw) : "One-time";
      const date = formatDate(dueDateRaw || representative.created_at);
      const totalAmount = groupRows.reduce((sum, row) => sum + row.amount, 0);
      const residentCount = groupRows.length;

      return {
        id: representative.id,
        initials: residentCount > 1 ? "SB" : shortUnitLabel(representative.unit_id).slice(0, 2),
        resident: residentCount > 1 ? `${residentCount} Residents` : `Unit ${shortUnitLabel(representative.unit_id)}`,
        description,
        billingPeriod,
        amount: toPhp(totalAmount / 100),
        status: (representative.transaction_type === "payment" || representative.status === "paid"
          ? "paid"
          : representative.transaction_type === "charge" || representative.status === "pending"
            ? "pending"
            : "overdue") as Transaction["status"],
        date,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function DuesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [isRevenueFilterOpen, setIsRevenueFilterOpen] = useState(false);
  const [selectedRevenueFeatures, setSelectedRevenueFeatures] = useState<DueBillingFeature[]>(
    DUE_BILLING_FEATURE_OPTIONS.map((feature) => feature.value),
  );
  const [subdivisionRevenueByFeature, setSubdivisionRevenueByFeature] = useState<
    Record<DueBillingFeature, number>
  >({
    facilities: 0,
    rentable_items: 0,
    parks: 0,
    clubhouse: 0,
    guest_parking: 0,
  });

  const baseCollection = useMemo(
    () => transactions.reduce((sum, tx) => sum + parsePhp(tx.amount), 0),
    [transactions],
  );

  const filteredFeatureRevenue = useMemo(
    () =>
      selectedRevenueFeatures.reduce(
        (sum, feature) => sum + subdivisionRevenueByFeature[feature],
        0,
      ),
    [selectedRevenueFeatures, subdivisionRevenueByFeature],
  );

  const subdivisionRevenueTotal = baseCollection + filteredFeatureRevenue;

  const pendingTotal = useMemo(() =>
    transactions
      .filter((tx) => tx.status === "pending")
      .reduce((sum, tx) => sum + parsePhp(tx.amount), 0),
    [transactions],
  );

  const pendingCount = useMemo(() =>
    transactions.filter((tx) => tx.status === "pending").length,
    [transactions],
  );

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoadingPayments(true);
      const supabase = createClient();
      const { data: payments, error } = await supabase
        .from("payments")
        .select(
          "id, amount, status, description, created_at, billing_period, unit:units(block_number, lot_number), resident:profiles!payments_recorded_by_fkey(full_name)",
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[DuesPage] Payments fetch error:", error.message);
        setTransactions([]);
        return;
      }

      const mapped = (payments ?? []).map((payment) => {
        const residentRow = Array.isArray(payment.resident)
          ? payment.resident[0]
          : payment.resident;
        const unitRow = Array.isArray(payment.unit)
          ? payment.unit[0]
          : payment.unit;
        const amount = Number(payment.amount ?? 0);
        const fullName = residentRow?.full_name ?? "Resident";
        const block = unitRow?.block_number;
        const lot = unitRow?.lot_number;
        const unitLabel = block && lot ? ` (Block ${block}, Lot ${lot})` : "";
        const initials = fullName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() ?? "")
          .join("") || "—";

        const status = payment.status === "completed"
          ? "paid"
          : payment.status === "pending"
            ? "pending"
            : "overdue";

        return {
          id: payment.id,
          initials,
          resident: `${fullName}${unitLabel}`,
          description: payment.description ?? "Payment",
          billingPeriod: payment.billing_period
            ? new Date(payment.billing_period).toLocaleDateString("en-US", { month: "short", year: "numeric" })
            : "—",
          amount: toPhp(amount),
          status,
          date: payment.created_at
            ? new Date(payment.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
            : "—",
        } as Transaction;
      });

      setTransactions(mapped);
    } finally {
      setIsLoadingPayments(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  function toggleRevenueFeature(feature: DueBillingFeature) {
    setSelectedRevenueFeatures((current) =>
      current.includes(feature)
        ? current.filter((selected) => selected !== feature)
        : [...current, feature],
    );
  }

  async function handleCreateBill(newBill: NewBillPayload) {
    const billTotal = newBill.amount * newBill.residents.length;
    const perFeatureShare = billTotal / newBill.billingFeatures.length;

    const billingPeriod = newBill.billingPeriod
      ? `${newBill.billingPeriod}-01`
      : null;

    const supabase = createSupabaseClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch("/api/admin/payments", {
      method: "POST",
      headers,
      body: JSON.stringify({
        residents: newBill.residents,
        amount: newBill.amount,
        description: newBill.description,
        billingPeriod,
        dueDate: newBill.dueDate || null,
      }),
    });

    const respData = await response.json();

    if (!response.ok) {
      console.error("[Admin Dues] Failed to insert payments:", respData?.error);
      return;
    }

    console.debug("[Admin Dues] Inserted payments:", respData);

    setSubdivisionRevenueByFeature((current) => {
      const next = { ...current };

      newBill.billingFeatures.forEach((feature) => {
        next[feature] += perFeatureShare;
      });

      return next;
    });

    const featureLabel = newBill.billingFeatures
      .map((feature) => FEATURE_NAMES[feature])
      .join(", ");

    void featureLabel;
  }

  async function handleApprove(paymentId: string) {
    setApprovingId(paymentId);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/approve`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("[DuesPage] Approve failed:", data.error);
        alert(data.error || "Failed to approve payment.");
        return;
      }

      await fetchPayments();
    } catch (error) {
      console.error("[DuesPage] Approve error:", error);
      alert("Network error while approving payment.");
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="flex min-h-screen relative bg-white">
      <AdminSidebar />

      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8 pb-24 lg:pb-8">
          {/* Page Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
                Dues &amp; Billing
              </h1>
              <p className="text-[#6B7280] mt-1">
                Track payments, manage billing periods, and monitor collection rates.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shrink-0"
            >
              <span className="material-icons-round text-[18px]">add</span>
              Add New Bill
            </button>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {/* Subdivision Revenue */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[#6B7280] text-sm font-medium">Subdivision Revenue (This Month)</p>
                <h3 className="text-3xl font-bold mt-1 text-[#111827]">{toPhp(subdivisionRevenueTotal)}</h3>
                <p className="text-emerald-600 text-xs font-semibold mt-2 flex items-center gap-1">
                  <span className="material-icons-round text-sm">trending_up</span>
                  +{toPhp(filteredFeatureRevenue)} from feature billings
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-icons-round">account_balance_wallet</span>
              </div>
            </div>

            {/* Feature Billing Filter */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[#6B7280] text-sm font-medium">Feature Billings Included</p>
                  <h3 className="text-2xl font-bold mt-1 text-[#111827]">{selectedRevenueFeatures.length}</h3>
                  <p className="text-[#6B7280] text-xs mt-2">Facilities, rentable items, parks, and more</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRevenueFilterOpen((open) => !open)}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#111827] hover:bg-[#F8F9FA]"
                >
                  Select
                  <span className="material-icons-round text-base text-[#6B7280]">
                    {isRevenueFilterOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>
              </div>

              {isRevenueFilterOpen && (
                <div className="absolute z-20 top-21 right-6 w-65 bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden divide-y divide-[#F3F4F6]">
                  {DUE_BILLING_FEATURE_OPTIONS.map((feature) => {
                    const checked = selectedRevenueFeatures.includes(feature.value);

                    return (
                      <label
                        key={feature.value}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          checked ? "bg-secondary/5" : "hover:bg-[#F8F9FA]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRevenueFeature(feature.value)}
                          className="w-4 h-4 rounded accent-secondary"
                        />
                        <span className="text-sm font-medium text-[#111827]">{feature.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Dues */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[#6B7280] text-sm font-medium">Pending Dues</p>
                <h3 className="text-3xl font-bold mt-1 text-[#111827]">{toPhp(pendingTotal)}</h3>
                <p className="text-red-500 text-xs font-semibold mt-2 flex items-center gap-1">
                  <span className="material-icons-round text-sm">priority_high</span>
                  {pendingCount} payment{pendingCount === 1 ? "" : "s"} pending
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-icons-round">error</span>
              </div>
            </div>

            {/* Collection Rate */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className="text-[#6B7280] text-sm font-medium">Collection Rate</p>
                <h3 className="text-3xl font-bold mt-1 text-[#111827]">78.4%</h3>
                <div className="w-full bg-[#F3F4F6] h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: "78.4%" }} />
                </div>
              </div>
              <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                <svg className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="#F3F4F6" strokeWidth="4" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="transparent"
                    stroke="#FF8C42"
                    strokeWidth="4"
                    strokeDasharray="175.9"
                    strokeDashoffset="38"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-[#111827]">78%</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="text-sm font-bold text-[#111827]">Subdivision Revenue Breakdown by Feature</h2>
              <p className="text-xs text-[#6B7280]">
                Included: {selectedRevenueFeatures.length} feature
                {selectedRevenueFeatures.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {DUE_BILLING_FEATURE_OPTIONS.map((feature) => {
                const amount = subdivisionRevenueByFeature[feature.value];
                const enabled = selectedRevenueFeatures.includes(feature.value);

                return (
                  <div
                    key={feature.value}
                    className={`rounded-lg border px-4 py-3 ${
                      enabled
                        ? "border-[#E5E7EB] bg-white"
                        : "border-[#E5E7EB] bg-[#F3F4F6] opacity-60"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                      {feature.label}
                    </p>
                    <p className="text-lg font-bold text-[#111827] mt-1">{toPhp(amount)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transactions Table — full width */}
          {isLoadingPayments ? (
            <div className="flex items-center justify-center py-20 text-[#6B7280]">
              <span className="material-icons-round animate-spin mr-2">refresh</span>
              Loading payments...
            </div>
          ) : (
            <TransactionsListing
              transactions={transactions}
              onApprove={handleApprove}
              approvingId={approvingId}
            />
          )}
        </div>
      </div>

      <AdminMobileNav />

      {isModalOpen && (
        <AddBillModal
          onClose={() => setIsModalOpen(false)}
          onCreateBill={handleCreateBill}
        />
      )}
    </div>
  );
}
