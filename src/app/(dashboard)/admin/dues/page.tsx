"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "../_components/AdminSidebar";
import { AdminMobileNav } from "../_components/AdminMobileNav";
import { TransactionsListing, Transaction } from "./_components/TransactionsListing";
import { AddBillModal, NewBillPayload } from "./_components/AddBillModal";
import { createClient } from "@/lib/supabase/client";

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

type ExtendedTransaction = Transaction & { rawAmount: number; rawCreatedAt: string };

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
  const [transactions, setTransactions] = useState<ExtendedTransaction[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [subdivisionRevenueThisMonth, setSubdivisionRevenueThisMonth] = useState(0);

  const baseCollection = useMemo(
    () => transactions.reduce((sum, tx) => sum + parsePhp(tx.amount), 0),
    [transactions],
  );

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
          rawAmount: amount,
          rawCreatedAt: payment.created_at,
        } as Transaction & { rawAmount: number; rawCreatedAt: string };
      });

      setTransactions(mapped);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthRevenue = (payments ?? [])
        .filter((p) => {
          const status = p.status === "completed" ? "paid" : p.status === "pending" ? "pending" : "overdue";
          if (status !== "paid") return false;
          const createdAt = new Date(p.created_at);
          return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

      setSubdivisionRevenueThisMonth(monthRevenue);
    } finally {
      setIsLoadingPayments(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  async function handleCreateBill(newBill: NewBillPayload) {
    void newBill;
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
                <h3 className="text-3xl font-bold mt-1 text-[#111827]">{toPhp(subdivisionRevenueThisMonth)}</h3>
                <p className="text-emerald-600 text-xs font-semibold mt-2 flex items-center gap-1">
                  <span className="material-icons-round text-sm">trending_up</span>
                  From approved payments this month
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-icons-round">account_balance_wallet</span>
              </div>
            </div>

            {/* Total Bills */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[#6B7280] text-sm font-medium">Total Bills</p>
                <h3 className="text-3xl font-bold mt-1 text-[#111827]">{transactions.length}</h3>
                <p className="text-[#6B7280] text-xs mt-2">All time billing records</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-icons-round">receipt_long</span>
              </div>
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
              <h2 className="text-sm font-bold text-[#111827]">This Month&apos;s Revenue Summary</h2>
              <p className="text-xs text-[#6B7280]">
                {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Total Approved</p>
                <p className="text-lg font-bold text-[#111827] mt-1">{toPhp(subdivisionRevenueThisMonth)}</p>
              </div>
              <div className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Pending</p>
                <p className="text-lg font-bold text-[#111827] mt-1">{toPhp(pendingTotal)}</p>
              </div>
              <div className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Pending Count</p>
                <p className="text-lg font-bold text-[#111827] mt-1">{pendingCount}</p>
              </div>
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
